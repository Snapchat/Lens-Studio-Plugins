import * as Ui from 'LensStudio:Ui';

import { downloadFileFromBucket, importToProject } from '../utils.js';
import { deleteEffect, createModel, getModels } from '../api.js';

import app from '../../application/app.js';

import { createGenerationErrorWidget, createGennerationInProgressWidget } from '../utils.js';
import { logEventAssetImport, logEventEffectTraining } from '../../application/analytics.js';

const ModelState = {
    'Ready': 0,
    'NotReady': 1,
    'Processing': 2,
    'Queued': 3,
    'EffectFailed': 4,
    'EffectRunning': 5
};

const ASSET_PREVIEW_WIDTH = 400;
const ASSET_PREVIEW_HEIGHT = 400;

export class AssetPreview {
    constructor(onStateChanged) {
        this.connections = [];
        this.compareActiveImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/compare_active.svg')));
        this.compareDefaultImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/compare_default.svg')));
        this.imageLinks = [];
        this.loadedImages = [];
        this.previewImageIndex = 0;
        this.effectId = '';
        this.onStateChanged = onStateChanged;
        this.showOriginal = false;
    }

    deleteItem(id) {
        app.log('Deleting effect...', { 'progressBar': true });

        deleteEffect(id, function(response) {
            this.deletionDialog.close();

            if (response.statusCode == 204) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'exclude_id': id
                });
                app.log('Effect has been deleted.');
            } else {
                app.log('Effect could not be deleted. Please, try again.');
            }
        }.bind(this));
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();

        layout.setDirection(Ui.Direction.LeftToRight);

        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

        const leftArrowImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/left_arrow.svg')));
        const rightArrowImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/right_arrow.svg')));

        const leftArrowHoveredImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/left_arrow_hovered.svg')));
        const rightArrowHoveredImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/right_arrow_hovered.svg')));

        this.leftArrow = new Ui.ImageView(this.preview);
        this.leftArrow.pixmap = leftArrowImage;
        this.leftArrow.scaledContents = true;
        this.leftArrow.responseHover = true;
        this.leftArrow.setFixedWidth(24);
        this.leftArrow.setFixedHeight(24);
        this.leftArrow.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.connections.push(this.leftArrow.onHover.connect((hovered) => {
            if (hovered) {
                this.leftArrow.pixmap = leftArrowHoveredImage;
            } else {
                this.leftArrow.pixmap = leftArrowImage;
            }
        }));

        this.connections.push(this.leftArrow.onClick.connect(() => {
            if (!this.loadedImages.length) {
                return;
            }
            this.previewImageIndex = (this.previewImageIndex === 0 ? this.loadedImages.length - 1 : this.previewImageIndex - 1);
            this.updatePreviewImage();
        }));

        this.rightArrow = new Ui.ImageView(this.preview);
        this.rightArrow.pixmap = rightArrowImage;
        this.rightArrow.scaledContents = true;
        this.rightArrow.responseHover = true;
        this.rightArrow.setFixedWidth(24);
        this.rightArrow.setFixedHeight(24);
        this.rightArrow.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.connections.push(this.rightArrow.onHover.connect((hovered) => {
            if (hovered) {
                this.rightArrow.pixmap = rightArrowHoveredImage;
            } else {
                this.rightArrow.pixmap = rightArrowImage;
            }
        }));

        this.connections.push(this.rightArrow.onClick.connect(() => {
            if (!this.loadedImages.length) {
                return;
            }
            this.previewImageIndex = (this.previewImageIndex + 1) % this.loadedImages.length;
            this.updatePreviewImage();
        }));

        this.splitViewer = new Ui.ImageView(this.preview);
        this.splitViewer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.splitViewer.setFixedWidth(ASSET_PREVIEW_WIDTH);
        this.splitViewer.setFixedHeight(ASSET_PREVIEW_HEIGHT);
        this.splitViewer.setContentsMargins(0, 0, 0, 0);
        this.splitViewer.scaledContents = true;

        this.compareButton = new Ui.ImageView(this.splitViewer);
        this.compareButton.setContentsMargins(0, 0, 0, 0);
        this.compareButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        const COMPARE_BUTTON_WIDTH = 32;
        const COMPARE_BUTTON_HEIGHT = 20;

        this.compareButton.setFixedWidth(COMPARE_BUTTON_WIDTH);
        this.compareButton.setFixedHeight(COMPARE_BUTTON_HEIGHT);
        this.compareButton.scaledContents = true;
        this.compareButton.pixmap = this.compareDefaultImage;

        this.compareButton.move(ASSET_PREVIEW_WIDTH - Ui.Sizes.Padding - COMPARE_BUTTON_WIDTH, ASSET_PREVIEW_HEIGHT - Ui.Sizes.Padding - COMPARE_BUTTON_HEIGHT);

        this.connections.push(this.compareButton.onClick.connect(() => {
            this.showOriginal = !this.showOriginal;
            this.updatePreviewImage();
        }));

        this.statusIndicator = new Ui.StatusIndicator('', this.preview);
        this.statusIndicator.setFixedHeight(ASSET_PREVIEW_HEIGHT);
        this.statusIndicator.setFixedWidth(ASSET_PREVIEW_WIDTH);
        this.statusIndicator.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.statusIndicator.start();

        this.stackedWidget = new Ui.StackedWidget(this.preview);
        this.stackedWidget.addWidget(this.statusIndicator);
        this.stackedWidget.addWidget(this.splitViewer);

        layout.addStretch(0);
        layout.addWidget(this.leftArrow);
        layout.addStretch(0);
        layout.addWidget(this.stackedWidget);
        layout.addStretch(0);
        layout.addWidget(this.rightArrow);
        layout.addStretch(0);

        this.preview.layout = layout;

        return this.preview;
    }

    setLoadedImages(index) {
        if (this.showOriginal) {
            this.compareButton.pixmap = this.compareDefaultImage;
            this.splitViewer.pixmap = this.loadedImages[index][0];
        } else {
            this.compareButton.pixmap = this.compareActiveImage;
            this.splitViewer.pixmap = this.loadedImages[index][1];
        }
        this.stackedWidget.currentIndex = 1;
    }

    updatePreviewImage() {
        this.stackedWidget.currentIndex = 0;
        let loaded = 0;
        const imageIndex = this.previewImageIndex;

        if (!this.loadedImages[imageIndex][0]) {
            downloadFileFromBucket(this.imageLinks[imageIndex]['sourceImageUrl'],
                this.effectId + imageIndex + 'source.webp',
                (filepath) => {
                    const image = new Ui.Pixmap(filepath);
                    image.transformationMode = Ui.TransformationMode.SmoothTransformation;
                    image.resize(ASSET_PREVIEW_WIDTH * this.splitViewer.devicePixelRatio, ASSET_PREVIEW_HEIGHT * this.splitViewer.devicePixelRatio);
                    this.loadedImages[imageIndex][0] = image;
                    loaded += 1;
                    if (loaded === 2 && this.previewImageIndex === imageIndex) {
                        this.setLoadedImages(imageIndex);
                    }
                });
        } else {
            loaded += 1;
        }

        if (!this.loadedImages[imageIndex][1]) {
            downloadFileFromBucket(this.imageLinks[imageIndex]['targetImageUrl'],
                this.effectId + imageIndex + 'target.webp',
                (filepath) => {
                    const image = new Ui.Pixmap(filepath);
                    image.transformationMode = Ui.TransformationMode.SmoothTransformation;
                    image.resize(ASSET_PREVIEW_WIDTH * this.splitViewer.devicePixelRatio, ASSET_PREVIEW_HEIGHT * this.splitViewer.devicePixelRatio);
                    this.loadedImages[imageIndex][1] = image;
                    loaded += 1;
                    if (loaded === 2 && this.previewImageIndex === imageIndex) {
                        this.setLoadedImages(imageIndex);
                    }
                });
        } else {
            loaded += 1;
        }
        if (loaded == 2) {
            this.setLoadedImages(imageIndex);
        }
    }

    createEmptyArray(size) {
        const arr = new Array(size);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = [null, null];
        }
        return arr;
    }

    onImportToProject() {
        app.log(`Importing ${app.name} to the project...`, { 'progressBar': true });

        importToProject(this.objectUrl, function(success) {
            logEventAssetImport(success ? "SUCCESS" : "FAILED");
            app.log(success ? 'Effect is succesfully imported to the project' : 'Import failed, please try again');
        }.bind(this));
    }

    onCreateModel(id, postProcessingSettings) {
        this.ctaButton.enabled = false;
        app.log('Creating model...', { 'progressBar': true });

        createModel(id, postProcessingSettings, (response) => {
            if (response.statusCode == 201) {
                logEventEffectTraining("SUCCESS");
                app.log('Model has been queued. Model creation takes approximately 3-4 hours.');
                this.modelState = ModelState.Processing;
                this.loggerTimeout = setTimeout(() => {
                    this.updateModelStatus();
                }, 5000);
                this.startCheckingModelStatus();
            } else if (response.statusCode == 400) {
                logEventEffectTraining("RATE_LIMITED");
                app.log('Model creation limit has been reached. Please, try later.');
                this.ctaButton.enabled = true;
            } else {
                logEventEffectTraining("FAILED");
                app.log('Model could not be created. Please, try again.');
                this.ctaButton.enabled = true;
            }
        });
    }

    updateModelStatus() {
        switch (this.modelState) {
            case ModelState.NotReady:
                this.ctaButton.text = 'Create model';
                this.ctaButton.enabled = true;
                break;
            case ModelState.Processing:
                getModels(this.effectId, (response) => {
                    if (response[0]) {
                        app.log('Model is training', { 'type': 'percentageBar', 'value': Math.round(response[0].progressPercent) });

                        if (response[0].trainingState == 'SUCCESS') {
                            this.objectUrl = response[0].objectUrl;
                            this.modelState = ModelState.Ready;
                            this.updateModelStatus();
                        }
                    }
                });
                this.ctaButton.text = 'Import to Project';
                this.ctaButton.enabled = false;
                break;
            case ModelState.Ready:
                if (this.modelStatusChecker) {
                    clearInterval(this.modelStatusChecker);
                }

                app.log('Model is ready');
                this.ctaButton.text = 'Import to Project';
                this.ctaButton.enabled = true;
                break;
            case ModelState.EffectFailed:
            case ModelState.EffectRunning:
                if (this.modelStatusChecker) {
                    clearInterval(this.modelStatusChecker);
                }

                this.ctaButton.text = 'Create model';
                this.ctaButton.enabled = false;
        }
    }

    ctaButtonClicked() {
        switch (this.modelState) {
            case ModelState.Ready:
                this.onImportToProject();
                break;
            case ModelState.NotReady:
                this.onCreateModel(this.effectId, this.postProcessingSettings);
                break;
            case ModelState.Processing:
                console.log('Model creation is in processing');
                break;
        }
    }

    reset() {
        app.log('', { 'enabled': false });
        app.log('', { 'type': 'percentageBar', 'enabled': false });

        if (this.modelStatusChecker) {
            clearInterval(this.modelStatusChecker);
        }

        this.imageLinks = [];
        this.loadedImages = [];
        this.previewImageIndex = 0;

        this.showOriginal = false;
    }

    startCheckingModelStatus() {
        if (this.modelStatusChecker) {
            clearInterval(this.modelStatusChecker);
        }

        this.modelStatusChecker = setInterval(() => {
            this.updateModelStatus();
        }, 10000);
    }

    updatePreview(state) {
        this.showOriginal = false;

        if (state.post_processing_get_response) {
            this.postProcessingSettings = state.post_processing_get_response.postprocessingSettings;
            if (state.post_processing_get_response.state == "SUCCESS") {
                state.status = 'SUCCESS';
                this.imageLinks = state.post_processing_get_response.samples;
            } else {
                state.status = "RUNNING";
            }
        } else {
            state.status = 'FAILED';
            this.postProcessingSettings = {};
            this.imageLinks = [];
        }

        this.effectId = state.effect_id;

        if (this.imageLinks) {
            this.loadedImages = this.createEmptyArray(this.imageLinks.length);
        }

        this.previewImageIndex = 0;

        if (state.status == 'FAILED') {
            this.stackedWithError.currentIndex = 1;
        } else if (state.status == "SUCCESS") {
            this.updatePreviewImage();
            this.stackedWithError.currentIndex = 0;
        } else {
            this.stackedWithError.currentIndex = 2;
        }

        if (state.models_response) {
            if (state.models_response.trainingState != 'SUCCESS') {
                this.modelState = ModelState.Processing;
                this.startCheckingModelStatus();
            } else {
                this.modelState = ModelState.Ready;
                this.objectUrl = state.models_response.objectLsUrl;
            }
        } else if (state.status == 'FAILED') {
            this.modelState = ModelState.EffectFailed;
        } else if (state.status == "RUNNING") {
            this.modelState = ModelState.EffectRunning;
        } else {
            this.modelState = ModelState.NotReady;
        }

        this.updateModelStatus();

        this.showFooter();
    }

    createDeletionDialog() {
        // Deletion dialog
        const gui = app.gui;

        this.deletionDialog = gui.createDialog();
        this.deletionDialog.windowTitle = 'Delete Effect';

        this.deletionDialog.resize(460, 140);

        const boxLayout1 = new Ui.BoxLayout();
        boxLayout1.setDirection(Ui.Direction.TopToBottom);

        const captionWidget = new Ui.Widget(this.deletionDialog);
        const captionLayout = new Ui.BoxLayout();
        captionLayout.setDirection(Ui.Direction.LeftToRight);

        const alertWidget = new Ui.ImageView(captionWidget);

        const alertImagePath = new Editor.Path(import.meta.resolve('../Resources/alert_icon.png'));
        const alertImage = new Ui.Pixmap(alertImagePath);

        alertWidget.setFixedWidth(56);
        alertWidget.setFixedHeight(56);
        alertWidget.scaledContents = true;
        alertWidget.pixmap = alertImage;

        const textWidget = new Ui.Widget(captionWidget);
        const textLayout = new Ui.BoxLayout();
        textLayout.setDirection(Ui.Direction.TopToBottom);

        const headerLabel = new Ui.Label(textWidget);
        const paragraphLabel = new Ui.Label(textWidget);

        headerLabel.text = 'Delete the effect?';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        paragraphLabel.text = 'This will delete effect permanently. You cannot undo this action.';

        textLayout.setContentsMargins(0, 0, 0, 0);
        textLayout.addWidget(headerLabel);
        textLayout.addWidget(paragraphLabel);

        textWidget.layout = textLayout;

        alertWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        textWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        captionLayout.addWidget(alertWidget);
        captionLayout.addWidget(textWidget);
        captionWidget.layout = captionLayout;

        const buttonsWidget = new Ui.Widget(this.deletionDialog);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.LeftToRight);

        const cancelButton = new Ui.PushButton(buttonsWidget);
        const deleteButton = new Ui.PushButton(buttonsWidget);

        cancelButton.text = 'Cancel';
        deleteButton.text = 'Delete';
        deleteButton.primary = true;

        this.connections.push(cancelButton.onClick.connect(function() {
            this.deletionDialog.close();
        }.bind(this)));

        this.connections.push(deleteButton.onClick.connect(function() {
            this.deleteItem(this.effectId);
        }.bind(this)));

        buttonsLayout.addStretch(0);
        buttonsLayout.addWidget(cancelButton);
        buttonsLayout.addWidget(deleteButton);

        buttonsWidget.layout = buttonsLayout;

        boxLayout1.addWidget(captionWidget);
        boxLayout1.addStretch(0);
        boxLayout1.addWidget(buttonsWidget);

        this.deletionDialog.layout = boxLayout1;

        return this.deletionDialog;
    }

    hideFooter() {
        this.deleteButton.visible = false;
        this.ctaButton.visible = false;
    }

    showFooter() {
        this.deleteButton.visible = true;
        this.ctaButton.visible = true;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(65);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);

        this.deleteButton = new Ui.PushButton(this.footer);
        this.deleteButton.text = '';
        const deleteImagePath = new Editor.Path(import.meta.resolve('../Resources/delete.svg'));
        this.deleteButton.setIconWithMode(Editor.Icon.fromFile(deleteImagePath), Ui.IconMode.MonoChrome);

        this.dialog = this.createDeletionDialog();

        this.connections.push(this.deleteButton.onClick.connect(function() {
            this.dialog.show();
        }.bind(this)));

        // Import To Project button
        this.ctaButton = new Ui.PushButton(this.footer);
        this.ctaButton.text = 'Import to Project';
        const importImagePath = new Editor.Path(import.meta.resolve('../Resources/import.svg'));
        this.ctaButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.ctaButton.primary = true;
        this.ctaButton.enabled = false;

        this.connections.push(this.ctaButton.onClick.connect(() => {
            this.ctaButtonClicked();
        }));

        footerLayout.addWidgetWithStretch(this.deleteButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignTop);

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

        this.stackedWithError = new Ui.StackedWidget(this.widget);
        this.stackedWithError.setContentsMargins(0, 0, 0, 0);

        this.stackedWithError.addWidget(this.createPreview(this.widget));
        this.stackedWithError.addWidget(createGenerationErrorWidget(this.widget));
        this.stackedWithError.addWidget(createGennerationInProgressWidget(this.widget));

        this.stackedWithError.currentIndex = 0;

        this.layout.addStretch(0);
        this.layout.addWidget(this.stackedWithError);
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
