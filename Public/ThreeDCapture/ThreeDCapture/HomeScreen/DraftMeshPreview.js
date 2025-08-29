import * as Ui from 'LensStudio:Ui';

import { downloadFileFromBucket, createSegmentationFrame } from '../utils.js';
import { submitSplat } from '../api.js';

import app from '../../application/app.js';

import { logEventAssetCreation } from '../../application/analytics.js';

export class DraftMeshPreview {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.resetParent = resetParent;

        this.hoverImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_bg_hovered_state.svg')));
        this.defaultImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_bg_default_state.svg')));
        this.checkedImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_bg_checked_state.svg')));
        this.tiles = [[{}, {}], [{}, {}]];
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        this.preview.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.preview.setContentsMargins(0, 0, 0, 0);
        this.preview.setFixedWidth(480);
        this.preview.setFixedHeight(555);
        this.maxSize = 480;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const header = new Ui.CalloutFrame(this.preview);
        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);

        const headerText = new Ui.Label(header);
        headerText.text = 'Generate the selected object or re-select it by using text prompt';

        headerLayout.addStretch(0);
        headerLayout.addWidget(headerText);
        headerLayout.addStretch(0);

        header.layout = headerLayout;

        const container = new Ui.Widget(this.preview);

        const containerLayout = new Ui.BoxLayout();

        this.frameImage = this.createFrameImage(container);

        this.segmentationImageView = new Ui.ImageView(this.frameImage);

        this.frameImage.visible = false;
        this.segmentationImageView.visible = true;

        containerLayout.addStretch(0);
        containerLayout.addWidget(this.frameImage);
        containerLayout.addStretch(0);

        container.layout = containerLayout;

        layout.addWidget(header);
        layout.addStretch(0);
        layout.addWidget(container);
        layout.addStretch(0);

        this.preview.layout = layout;

        return this.preview;
    }

    createFrameImage(parent) {
        const frameImage = new Ui.ImageView(parent);
        frameImage.scaledContents = true;

        return frameImage;
    }

    generateAsset() {
        this.ctaButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });
        submitSplat(this.state.id, (response) => {
            if (response.statusCode == 201) {
                logEventAssetCreation("SUCCESS");
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'creation': true,
                });
                app.log('Gaussian Splatting Asset is queued. Asset creation is estimated to take 10-15 min, please check back later.', { 'progressBar': true });
            } else if (response.statusCode == 422) {
                logEventAssetCreation("GUIDELINES_VIOLATION");
                app.log('The result violates our community guidelines');
                this.ctaButton.enabled = true;
            } else {
                logEventAssetCreation("FAILED");
                app.log('Something went wrong, please try again.');
                this.ctaButton.enabled = true;
            }
        });
    }

    ctaButtonClicked() {
        this.generateAsset();
    }

    setImage(file_path, boundingBox) {
        const image = new Ui.Pixmap(file_path);

        const width = image.width;
        const height = image.height;

        const aspect = width / height;

        let newWidth, newHeight;

        if (aspect > 1) {
            newWidth = this.maxSize;
            newHeight = newWidth / aspect;
        } else {
            newHeight = this.maxSize;
            newWidth = newHeight * aspect;
        }

        this.frameImage.setFixedWidth(newWidth);
        this.frameImage.setFixedHeight(newHeight);

        this.frameImage.pixmap = image;

        const widthScale = newWidth / width;
        const heightScale = newHeight / height;

        this.resizedBoundingBox = {
            topLeftX: boundingBox.topLeftX * widthScale,
            topLeftY: boundingBox.topLeftY * heightScale,
            bottomRightX: boundingBox.bottomRightX * widthScale,
            bottomRightY: boundingBox.bottomRightY * heightScale
        }

        this.boundingBoxSize = {
            width: this.resizedBoundingBox.bottomRightX - this.resizedBoundingBox.topLeftX,
            height: this.resizedBoundingBox.bottomRightY - this.resizedBoundingBox.topLeftY
        }

        this.segmentationImageView.setFixedWidth(this.boundingBoxSize.width);
        this.segmentationImageView.setFixedHeight(this.boundingBoxSize.height);

        const segmentationFrame = createSegmentationFrame(this.boundingBoxSize.width, this.boundingBoxSize.height);

        this.segmentationImageView.move(this.resizedBoundingBox.topLeftX, this.resizedBoundingBox.topLeftY);
        this.segmentationImageView.scaledContents = true;
        this.segmentationImageView.pixmap = segmentationFrame;

        this.frameImage.visible = true;
        this.segmentationImageView.visible = true;
    }

    reset(state) {
        this.ctaButton.enabled = true;
        this.frameImage.visible = false;
        this.segmentationImageView.visible = false;

        if (state) {
            this.state = state.assetData;
            this.frameImage.visible = false;
            this.segmentationImageView.visible = false;
            downloadFileFromBucket(this.state.frameUrl, "best_frame.png", (file_path) => {
                this.setImage(file_path, this.state.boundingBox);
            });
        }
    }

    init() {
        this.reset();
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(65);
        this.footer.setContentsMargins(0, 0, 0, 0);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);

        // Import To Project button
        this.ctaButton = new Ui.PushButton(this.footer);
        this.ctaButton.text = 'Submit Selection';
        this.ctaButton.primary = true;

        this.connections.push(this.ctaButton.onClick.connect(() => {
            this.ctaButtonClicked();
        }));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(480);
        this.widget.setFixedHeight(620);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.layout.addWidget(this.createPreview(this.widget));
        this.layout.addStretch(0);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);

        this.layout.addWidget(this.createFooter(this.widget));

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
