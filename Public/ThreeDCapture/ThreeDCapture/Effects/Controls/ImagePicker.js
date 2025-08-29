import * as Ui from 'LensStudio:Ui';

import { downloadFileFromBucket, getContentType } from '../../utils.js';
import { Control } from './Control.js';
import { createAttachment, createAsset } from '../../api.js';
import * as fs from 'LensStudio:FileSystem';

import app from '../../../application/app.js';

import { RequestTokenManager } from '../../HomeScreen/RequestTokenManager.js';

export class ImagePicker extends Control {
    constructor(parent, label, valueImporter, valueExporter) {
        super(parent, label, valueImporter, valueExporter);
        this.connections = [];
        this.gui = app.gui;
        this.imagesData = [];
        this.pickedImages = [];
        this.pickedCrosses = [];
        this.uploadImages = [];
        this.requestTokenManager = new RequestTokenManager();
        this.imageGridLayout = new Ui.GridLayout();

        this.imageGridLayout.spacing = Ui.Sizes.Padding;
        this.imageGridLayout.setContentsMargins(0, 0, 0, 0);
        this.loading = false;
        this.importIconPath = new Editor.Path(import.meta.resolve('../../Resources/plus.svg'));
        this.importHoveredIconPath = new Editor.Path(import.meta.resolve('../../Resources/plus_hovered.svg'));
        this.importEmptyIcon = new Editor.Path(import.meta.resolve('../../Resources/plus_empty.svg'));
        this.deleteIconPath = new Editor.Path(import.meta.resolve('../../Resources/delete.png'));
        this.transparentPath = new Editor.Path(import.meta.resolve('../../Resources/transparent.png'));
        this.uploadImagePath = new Editor.Path(import.meta.resolve('../../Resources/transparent_upload_hover.svg'));
        this.TILE_MAX_SIZE = 180;

        this.MAX_TILES_IN_ROW = 3;

        this.plusImage = new Ui.Pixmap(this.importIconPath);
        this.plusImageHovered = new Ui.Pixmap(this.importHoveredIconPath);
        this.plusImageEmpty = new Ui.Pixmap(this.importEmptyIcon);
        this.deleteImage = new Ui.Pixmap(this.deleteIconPath);
        this.transparentImage = new Ui.Pixmap(this.transparentPath);
        this.uploadImage = new Ui.Pixmap(this.uploadImagePath);
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
        if (this.pickedImages.length > 0) {
            return;
        }

        const imageView = new Ui.ImageView(this.parent);
        imageView.pixmap = this.loading ? this.plusImageEmpty : this.plusImage;
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(this.TILE_MAX_SIZE / 2);
        imageView.setFixedHeight(this.TILE_MAX_SIZE / 2);
        imageView.setContentsMargins(0, 0, 0, 0);
        imageView.responseHover = true;
        imageView.scaledContents = true;

        this.connections.push(imageView.onClick.connect(() => {
            if (!this.loading) {
                this.importNewImage();
            }
        }));
        this.connections.push(imageView.onHover.connect((hovered) => {
            if (!this.loading) {
                if (hovered) {
                    imageView.pixmap = this.plusImageHovered;
                } else {
                    imageView.pixmap = this.plusImage;
                }
            } else {
                imageView.pixmap = this.plusImageEmpty;
            }
        }));

        const loader = new Ui.ProgressIndicator(imageView);
        loader.setFixedWidth(40);
        loader.setFixedHeight(40);

        loader.start();
        loader.move((imageView.width - loader.width) / 2, (imageView.height - loader.height) / 2);

        loader.visible = this.loading;

        this.setLoading = (value) => {
            this.loading = value;

            if (value) {
                imageView.pixmap = this.plusImageEmpty;
                loader.visible = true;
            } else {
                imageView.pixmap = this.plusImage;
                loader.visible = false;
            }
        }

        this.getLoading = () => { return this.loading; }

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
        imageView.radius = 8;
        imageView.pixmap = this.resizeImage(image);
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(this.TILE_MAX_SIZE / 2);
        imageView.setFixedHeight(this.TILE_MAX_SIZE / 2);
        imageView.responseHover = true;
        imageView.scaledContents = true;

        const uploadImageView = this.addUploadButton(imageView);
        this.connections.push(uploadImageView.onClick.connect(() => {
            if (this.mEditable) {
                this.updateImageAt(this.pickedImages.findIndex((obj) => {
                    return obj.isSame(frame);
                }));
            }
        }));

        this.connections.push(imageView.onHover.connect((value) => {
            if (this.mEditable) {
                uploadImageView.visible = value;
            }
        }));

        uploadImageView.visible = false;

        this.uploadImages.push(uploadImageView);

        const crossImageView = this.addDeleteCross(imageView);
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

        this.connections.push(crossImageView.onClick.connect(() => {
            this.deleteImageAt(this.pickedImages.findIndex((obj) => {
                return obj.isSame(frame);
            }));
        }));

        crossImageView.visible = this.mEditable;

        this.imageGridLayout.addWidgetWithSpan(frame, Math.floor(this.pickedImages.length / this.MAX_TILES_IN_ROW), this.pickedImages.length % this.MAX_TILES_IN_ROW, 1, 1, Ui.Alignment.AlignCenter);

        this.pickedImages.push(frame);

        this.addImportButton();
        this.valueChanged();
    }

    set editable(value) {
        this.mEditable = value;
        this.pickedCrosses.forEach((cross) => cross.visible = value );
    }

    get editable() {
        return this.mEditable;
    }

    updateImageAt(index) {
        const filePath = this.gui.dialogs.selectFileToOpen({ 'caption': 'Select file to open', 'filter': '*.webm *.mov *.mp4 *.3gp *.hevc *.mkv' }, '');

        if (filePath.isEmpty) {
            return;
        }
        this.value = [];
        this.setLoading(true);

        const imageData = fs.readBytes(filePath);
        const token = this.requestTokenManager.generateToken();

        app.log('Uploading the video...', { 'progressBar': true });
        createAttachment(imageData, getContentType(filePath), filePath.fileName.toString(), (response) => {
            if (this.requestTokenManager.isValid(token)) {
                if (response.statusCode == 201) {
                    const body = JSON.parse(response.body.toString());
                    createAsset({ "uploadUid": body.uid }, (createResponse) => {
                        if (this.requestTokenManager.isValid(token)) {
                            if (createResponse.statusCode == 201) {
                                this.imagesData = [JSON.parse(createResponse.body.toString())];;
                                this.updateUi();
                            } else if (createResponse.statusCode == 400) {
                                app.log('Video is inappropriate, please try a different one.');
                                this.setLoading(false);
                            } else if (createResponse.statusCode == 413) {
                                app.log('Video is too large, please try a smaller one.');
                                this.setLoading(false);
                            } else {
                                app.log('Something went wrong during uploading, please try again.');
                                this.setLoading(false);
                            }
                        } else {
                            this.setLoading(false);
                        }
                    });
                } else {
                    app.log("Coudn't upload video, please try again");
                    console.log('Coudn\'t upload video from ' + filePath + ', please try again');
                    this.setLoading(false);
                }
            }
        });
    }

    importNewImage() {
        const filePath = this.gui.dialogs.selectFileToOpen({ 'caption': 'Select file to open', 'filter': '*.webm *.mov *.mp4 *.3gp *.hevc *.mkv' }, '');

        if (filePath.isEmpty) {
            return;
        }

        this.setLoading(true);

        const imageData = fs.readBytes(filePath);
        const token = this.requestTokenManager.generateToken();

        app.log('Uploading the video...', { 'progressBar': true });

        createAttachment(imageData, getContentType(filePath), filePath.fileName.toString(), (response) => {
            if (this.requestTokenManager.isValid(token)) {
                if (response.statusCode == 201) {
                    const body = JSON.parse(response.body.toString());

                    createAsset({ "uploadUid": body.uid }, (createResponse) => {
                        if (this.requestTokenManager.isValid(token)) {
                            if (createResponse.statusCode == 201) {
                                this.imagesData = [JSON.parse(createResponse.body.toString())];;
                                this.updateUi();
                            } else if (createResponse.statusCode == 400) {
                                app.log('Video is inappropriate, please try a different one.');
                                this.setLoading(false);
                            } else if (createResponse.statusCode == 413) {
                                app.log('Video is too large, please try a smaller one.');
                                this.setLoading(false);
                            } else {
                                app.log('Something went wrong during uploading, please try again.');
                                this.setLoading(false);
                            }
                        }
                    });
                } else {
                    app.log("Coudn't upload video, please try again");
                    console.log('Coudn\'t upload video from ' + filePath + ', please try again');
                    this.setLoading(false);
                }
            }
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

    addUploadButton(widget) {
        const imageView = new Ui.ImageView(widget);
        imageView.radius = 8;
        imageView.scaledContents = true;
        imageView.pixmap = this.uploadImage;
        imageView.setFixedWidth(this.TILE_MAX_SIZE / 2);
        imageView.setFixedHeight(this.TILE_MAX_SIZE / 2);
        imageView.setContentsMargins(0, 0, 0, 0);

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
        this.requestTokenManager.invalidateTokenAll();
        this.setLoading(false);
        const imagesLength = this.imagesData.length;
        for (let i = imagesLength - 1; i >= 0; i--) {
            this.deleteImageAt(i);
        }
    }

    updateUi() {
        this.imagesData.forEach((imageData) => {
            this.setLoading(true);
            downloadFileFromBucket(imageData.frameUrl, imageData.id + "_best_frame.png", (filePath) => {
                this.addImage(filePath);
                this.setLoading(false);
                app.log('', { 'enabled': false });
            });
        });
    }

    set value(value) {
        this.reset();
        this.imagesData = JSON.parse(JSON.stringify(value));
        this.updateUi();
    }

    get value() {
        return this.imagesData;
    }
}
