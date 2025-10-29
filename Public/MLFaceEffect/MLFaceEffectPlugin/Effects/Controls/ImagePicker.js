import * as Ui from 'LensStudio:Ui';

import { tieWidgets, concatArrays, downloadFileFromBucket, getContentType } from '../../utils.js';
import { Control } from './Control.js';
import { createAttachment } from '../../api.js';
import * as fs from 'LensStudio:FileSystem';
import app from '../../../application/app.js';

export class ImagePicker extends Control {
    constructor(parent, label, valueImporter, valueExporter, maxPickedImages = 5) {
        super(parent, label, valueImporter, valueExporter);
        this.connections = [];
        this.gui = app.gui;
        this.imagesData = [];
        this.pickedImages = [];
        this.pickedCrosses = [];
        this.maxPickedImages = maxPickedImages;

        this.imageGridLayout = new Ui.GridLayout();

        this.imageGridLayout.spacing = Ui.Sizes.Padding;
        this.imageGridLayout.setContentsMargins(0, 0, 0, 0);

        this.importIconPath = new Editor.Path(import.meta.resolve('../../Resources/plus.svg'));
        this.importHoveredIconPath = new Editor.Path(import.meta.resolve('../../Resources/plus_hovered.svg'));
        this.deleteIconPath = new Editor.Path(import.meta.resolve('../../Resources/delete.png'));
        this.transparentPath = new Editor.Path(import.meta.resolve('../../Resources/transparent.png'));

        this.TILE_MAX_SIZE = 180;

        this.MAX_TILES_IN_ROW = 3;

        this.plusImage = new Ui.Pixmap(this.importIconPath);
        this.plusImageHovered = new Ui.Pixmap(this.importHoveredIconPath);
        this.deleteImage = new Ui.Pixmap(this.deleteIconPath);
        this.transparentImage = new Ui.Pixmap(this.transparentPath);
        this.importButton = null;

        this.addImportButton();
        this.widget.layout = this.imageGridLayout;
    }

    resizeImage(image) {
        let width =  image.width;
        let height = image.height;
        const aspect = width / height;
        if (width > height) {
            height = this.widget.devicePixelRatio * this.TILE_MAX_SIZE / 2;
            width = height * aspect;
        } else {
            width = this.widget.devicePixelRatio * this.TILE_MAX_SIZE / 2;
            height = width / aspect;
        }
        image.resize(width, height);
        image.crop(new Ui.Rect(0, 0, this.widget.devicePixelRatio * this.TILE_MAX_SIZE / 2, this.widget.devicePixelRatio * this.TILE_MAX_SIZE / 2));
        return image;
    }

    addTransparentImageAt(index) {
        const imageView = new Ui.ImageView(this.parent);
        imageView.pixmap = this.resizeImage(this.transparentImage);
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(this.TILE_MAX_SIZE / 2);
        imageView.setFixedHeight(this.TILE_MAX_SIZE / 2);
        imageView.setContentsMargins(0, 0, 0, 0);

        const transparentWidget = new Ui.Widget(this.parent);
        transparentWidget.setContentsMargins(0, 0, 0, 0);
        const frameLayout = new Ui.BoxLayout();
        frameLayout.addWidgetWithStretch(imageView, 1, Ui.Alignment.AlignCenter);
        frameLayout.setContentsMargins(0, 0, 0, 0);
        frameLayout.spacing = 0;
        transparentWidget.layout = frameLayout;
        transparentWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        transparentWidget.setFixedWidth(this.TILE_MAX_SIZE / 2);
        transparentWidget.setFixedHeight(this.TILE_MAX_SIZE / 2);

        this.imageGridLayout.addWidgetAt(transparentWidget, 0, index, Ui.Alignment.AlignLeft);
    }

    addImportButton() {
        const imageView = new Ui.ImageView(this.parent);
        imageView.pixmap = this.plusImage;
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(this.TILE_MAX_SIZE / 2);
        imageView.setFixedHeight(this.TILE_MAX_SIZE / 2);
        imageView.setContentsMargins(0, 0, 0, 0);
        imageView.responseHover = true;
        imageView.scaledContents = true;

        this.connections.push(imageView.onClick.connect(this.importNewImage.bind(this)));
        this.connections.push(imageView.onHover.connect((hovered) => {
            if (hovered) {
                imageView.pixmap = this.plusImageHovered;
            } else {
                imageView.pixmap = this.plusImage;
            }
        }));

        const calloutFrame = new Ui.CalloutFrame(this.parent);
        calloutFrame.setContentsMargins(0, 0, 0, 0);
        const frameLayout = new Ui.BoxLayout();
        frameLayout.addWidgetWithStretch(imageView, 1, Ui.Alignment.AlignCenter);
        frameLayout.setContentsMargins(0, 0, 0, 0);
        frameLayout.spacing = 0;
        calloutFrame.layout = frameLayout;
        calloutFrame.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        calloutFrame.setFixedWidth(this.TILE_MAX_SIZE / 2);
        calloutFrame.setFixedHeight(this.TILE_MAX_SIZE / 2);

        if (this.importButton) {
            this.importButton.visible = false;
        }
        this.importButton = calloutFrame;

        this.imageGridLayout.addWidgetAt(calloutFrame, Math.floor(this.pickedImages.length / this.MAX_TILES_IN_ROW), this.pickedImages.length % this.MAX_TILES_IN_ROW, Ui.Alignment.AlignLeft);

        for (let i = 0; i < 3; i++) {
            this.imageGridLayout.setColumnMinimumWidth(i % this.MAX_TILES_IN_ROW, this.TILE_MAX_SIZE / 2);
        }

        for (let i = this.pickedImages.length + 1; i < 3; i++) {
            this.addTransparentImageAt(i);
        }
    }

    addImage(filePath) {
        const image = new Ui.Pixmap(filePath);

        const imageView = new Ui.ImageView(this.parent);
        imageView.radius = 4;
        imageView.pixmap = this.resizeImage(image);
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(this.TILE_MAX_SIZE / 2);
        imageView.setFixedHeight(this.TILE_MAX_SIZE / 2);
        imageView.responseHover = true;

        const crossImageView = this.addDeleteCross(imageView);
        crossImageView.visible = false;

        this.pickedCrosses.push(crossImageView);

        const frame = new Ui.CalloutFrame(this.parent);
        const frameLayout = new Ui.BoxLayout();
        frameLayout.addWidget(imageView);
        frameLayout.setContentsMargins(0, 0, 0, 0);
        frameLayout.spacing = 0;
        frame.layout = frameLayout;
        frame.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        frame.setFixedWidth(this.TILE_MAX_SIZE / 2);
        frame.setFixedHeight(this.TILE_MAX_SIZE / 2);

        this.connections.push(imageView.onHover.connect((value) => {
            crossImageView.visible = value;
        }));

        this.connections.push(crossImageView.onClick.connect(() => {
            this.deleteImageAt(this.pickedImages.findIndex((obj) => {
                return obj.isSame(frame);
            }));
        }));

        this.connections.push(crossImageView.onHover.connect((value) => {
            crossImageView.visible = value;
        }));

        this.imageGridLayout.addWidgetWithSpan(frame, Math.floor(this.pickedImages.length / this.MAX_TILES_IN_ROW), this.pickedImages.length % this.MAX_TILES_IN_ROW, 1, 1, Ui.Alignment.AlignCenter);

        this.pickedImages.push(frame);

        if (this.pickedImages.length < this.maxPickedImages) {
            this.addImportButton();
        }
        else {
            this.importButton.visible = false;
        }

        this.valueChanged();
    }

    importNewImage() {
        const filePaths = this.gui.dialogs.selectFilesToOpen({ 'caption': 'Select file to open', 'filter': '*.webp *.jpeg *.jpg *.gif *.avif *.avifs *.png' }, '');

        filePaths.forEach((filePath) => {
            if (filePath.isEmpty) {
                return;
            }

            const imageData = fs.readBytes(filePath);

            createAttachment(imageData, getContentType(filePath), filePath.fileName.toString(), (response) => {
                if (this.imagesData.length == this.maxPickedImages) {
                    console.log('Coudn\'t upload image from ' + filePath + `, because maximum limit (${this.maxPickedImages}) has been reached.`);
                } else if (response.statusCode == 201) {
                    const body = JSON.parse(response.body.toString());
                    this.imagesData.push(body);
                    this.addImage(filePath);
                } else {
                    console.log('Coudn\'t upload image from ' + filePath + ', please try again');
                }
            });
        });
    }

    addDeleteCross(widget) {
        widget.setContentsMargins(0, 0, 0, 0);
        const crossWidget = new Ui.Widget(widget);
        crossWidget.setContentsMargins(0, 5, 5, 0);
        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.TopToBottom);
        frameLayout.spacing = 0;
        frameLayout.setContentsMargins(0, 0, 0, 0);

        const deleteLayout = new Ui.BoxLayout();
        deleteLayout.setDirection(Ui.Direction.LeftToRight);
        deleteLayout.setContentsMargins(0, 0, 0, 0);
        deleteLayout.spacing = 0;

        const imageView = new Ui.ImageView(crossWidget);
        imageView.pixmap = this.deleteImage;
        imageView.scaledContents = true;
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(this.TILE_MAX_SIZE / 8);
        imageView.setFixedHeight(this.TILE_MAX_SIZE / 8);
        imageView.setContentsMargins(0, 0, 0, 0);

        deleteLayout.addStretch(0);
        deleteLayout.addWidget(imageView);

        crossWidget.layout = deleteLayout;

        frameLayout.addWidget(crossWidget);
        frameLayout.addStretch(0);

        widget.layout = frameLayout;
        return imageView;
    }

    valueChanged() {
        this.mOnValueChanged.forEach((callback) => callback(this.value));
    }

    deleteImageAt(index) {
        this.pickedImages[index].visible = false;
        if (index + 1 < this.pickedCrosses.length) {
            this.pickedCrosses[index + 1].visible = true;
        }
        for (let i = index; i < this.pickedImages.length - 1; i++) {
            this.pickedImages[i] = this.pickedImages[i + 1];
            this.pickedCrosses[i] = this.pickedCrosses[i + 1];
            this.imagesData[i] = this.imagesData[i + 1];
            this.imageGridLayout.addWidgetWithSpan(this.pickedImages[i], Math.floor(i / this.MAX_TILES_IN_ROW), i % this.MAX_TILES_IN_ROW, 1, 1, Ui.Alignment.AlignCenter);
        }

        if (this.pickedImages.length % this.MAX_TILES_IN_ROW == 0) {
            this.imageGridLayout.setRowMinimumHeight(this.pickedImages.length / this.MAX_TILES_IN_ROW, 0);
        }

        this.importButton.visible = false;
        this.pickedImages.pop();
        this.pickedCrosses.pop();
        this.imagesData.pop();

        this.addImportButton();

        this.valueChanged();
    }

    reset() {
        super.reset();
        const imagesLength = this.imagesData.length;
        for (let i = imagesLength - 1; i >= 0; i--) {
            this.deleteImageAt(i);
        }
    }

    updateUi() {
        this.imagesData.forEach((imageData) => {
            downloadFileFromBucket(imageData.url, imageData.name, (filePath) => {
                this.addImage(filePath);
            });
        });
    }

    set value(value) {
        this.reset();
        this.imagesData = value;
        this.updateUi();
    }

    get value() {
        return this.imagesData;
    }
}
