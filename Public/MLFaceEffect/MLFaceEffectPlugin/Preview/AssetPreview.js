import * as Ui from 'LensStudio:Ui';

import { downloadFileFromBucket, importToProject } from '../utils.js';
import { deleteEffect, createModel, getModels } from '../api.js';

import app from '../../application/app.js';

import { createGenerationErrorWidget, createGenerationInProgressWidget } from '../utils.js';
import { logEventAssetImport, logEventEffectTraining } from '../../application/analytics.js';

const ModelState = {
    'Ready': 0,
    'NotReady': 1,
    'Processing': 2,
    'Queued': 3,
    'EffectFailed': 4,
    'EffectRunning': 5
};

const ASSET_PREVIEW_WIDTH = 374;
const ASSET_PREVIEW_HEIGHT = 374;

export class AssetPreview {
    constructor(onStateChanged, onTrainingStarted) {
        this.connections = [];
        this.compareActiveImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/compare_active.svg')));
        this.compareDefaultImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/compare_default.svg')));
        this.defaultPreview = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/no_img.png')));
        this.imageLinks = [];
        this.loadedImages = [];
        this.previewImageIndex = 0;
        this.effectId = '';
        this.effectTypeId = ''
        this.onStateChanged = onStateChanged;
        this.onTrainingStarted = onTrainingStarted;
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

        const leftArrowImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/leftArrow.svg')));
        const rightArrowImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/rightArrow.svg')));

        const leftArrowHoveredImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/leftArrow_h.svg')));
        const rightArrowHoveredImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/rightArrow_h.svg')));

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

        const previewWidget = new Ui.Widget (this.preview)
        previewWidget.setFixedWidth(374);

        const previewWidgetLayout = new Ui.BoxLayout();
        previewWidgetLayout.setContentsMargins(0, 0, 0, 0);

        this.splitViewer = new Ui.ImageView(previewWidget);
        this.splitViewer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.splitViewer.setFixedWidth(ASSET_PREVIEW_WIDTH);
        this.splitViewer.setFixedHeight(ASSET_PREVIEW_HEIGHT);
        this.splitViewer.setContentsMargins(0, 0, 0, 0);
        this.splitViewer.scaledContents = true;

        previewWidgetLayout.addWidgetWithStretch(this.splitViewer, 0, Ui.Alignment.AlignCenter);
        previewWidget.layout = previewWidgetLayout;

        this.compareButton = new Ui.ImageView(this.splitViewer);
        this.compareButton.setContentsMargins(0, 0, 0, 0);
        this.compareButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        const COMPARE_BUTTON_WIDTH = 36;
        const COMPARE_BUTTON_HEIGHT = 28;

        this.compareButton.setFixedWidth(COMPARE_BUTTON_WIDTH);
        this.compareButton.setFixedHeight(COMPARE_BUTTON_HEIGHT);
        this.compareButton.scaledContents = true;
        this.compareButton.pixmap = this.compareDefaultImage;

        this.compareButton.move(ASSET_PREVIEW_WIDTH - Ui.Sizes.Padding - COMPARE_BUTTON_WIDTH - 28, ASSET_PREVIEW_HEIGHT - Ui.Sizes.Padding - COMPARE_BUTTON_HEIGHT);

        this.connections.push(this.compareButton.onClick.connect(() => {
            this.showOriginal = !this.showOriginal;
            this.updatePreviewImage();
        }));

        this.statusIndicator = new Ui.StatusIndicator('', this.preview);
        this.statusIndicator.setFixedHeight(374);
        this.statusIndicator.setFixedWidth(374);
        this.statusIndicator.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.statusIndicator.start();

        this.stackedWidget = new Ui.StackedWidget(this.preview);
        this.stackedWidget.addWidget(this.statusIndicator);
        this.stackedWidget.addWidget(previewWidget);

        this.leftArrow.visible = false;
        this.rightArrow.visible = false;

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

    checkPreviewUpdate(item) {
        return this.widget.visible && item.id === this.effectId;

    }

    setDefaultState() {
        this.leftArrow.visible = false;
        this.rightArrow.visible = false;
        this.compareButton.visible = false;
        this.ctaButton.visible = false;
        this.statusWidget.visible = false;
        this.splitViewer.pixmap = this.defaultPreview;
        this.stackedWidget.currentIndex = 1;
        this.stackedWithError.currentIndex = 0;
    }

    setPreviewState() {
        this.leftArrow.visible = true;
        this.rightArrow.visible = true;
        this.compareButton.visible = true;
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
                this.onTrainingStarted(id);
                // app.log('Model has been queued. Model creation takes approximately 2 hours.');
                app.log('', { 'enabled': false });
                this.progressLabel.text = "0" + "%";
                if (this.effectTypeId === 'face-enhanced') {
                    this.statusLabel.text = '<div style="text-align: right;">' + 'Model training in progress. This may take up to 2 hours.<br>You can close the window and return later.' + '</div>';
                }
                else {
                    this.statusLabel.text = '<div style="text-align: right;">' + 'Model training in progress. This may take 3-4 hours.<br>You can close the window and return later.' + '</div>';
                }
                this.statusWidget.visible = this.footer.visible;
                this.statusWidget.raise();
                this.modelState = ModelState.Processing;

                this.ctaButton.text = 'Import to Project';
                this.ctaButton.enabled = false;

                this.loggerTimeout = setTimeout(() => {
                    this.updateModelStatus();
                }, 5000);
                this.startCheckingModelStatus();
            } else if (response.statusCode == 400) {
                logEventEffectTraining("RATE_LIMITED");
                // app.log('Model creation limit has been reached. Please, try later.');
                this.popup.visible = this.footer.visible;
                this.popup.raise();
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
                this.ctaButton.text = 'Train model';
                // this.ctaButton.setIcon(null);
                this.ctaButton.enabled = true;
                break;
            case ModelState.Processing:
                getModels(this.effectId, (response) => {
                    if (response[0]) {
                        // app.log('Model is training', { 'type': 'percentageBar', 'value': Math.round(response[0].progressPercent) });
                        app.log('', { 'enabled': false });
                        this.progressLabel.text = Math.round(response[0].progressPercent) + "%";
                        if (this.effectTypeId === 'face-enhanced') {
                            this.statusLabel.text = '<div style="text-align: right;">' + 'Model training in progress. This may take up to 2 hours.<br>You can close the window and return later.' + '</div>';
                        }
                        else {
                            this.statusLabel.text = '<div style="text-align: right;">' + 'Model training in progress. This may take 3-4 hours.<br>You can close the window and return later.' + '</div>';
                        }
                        this.statusWidget.visible = this.footer.visible;
                        this.statusWidget.raise();

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

                // app.log('Model is ready');
                this.ctaButton.text = 'Import to Project';
                this.ctaButton.enabled = true;
                break;
            case ModelState.EffectFailed:
            case ModelState.EffectRunning:
                if (this.modelStatusChecker) {
                    clearInterval(this.modelStatusChecker);
                }

                this.ctaButton.text = 'Train model';
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
        this.statusWidget.visible = false;
        this.popup.visible = false;

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
        this.effectTypeId = state.effect_get_response?.effectTypeId;

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
            if (state.effect_get_response.effectTypeId === 'face-enhanced') {
                this.stackedWithError.currentIndex = 2;
            }
            else {
                this.stackedWithError.currentIndex = 3;
            }
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
        const gui = app.gui;

        this.deletionDialog = gui.createDialog();

        this.deletionDialog.resize(310, 94);

        const boxLayout1 = new Ui.BoxLayout();
        boxLayout1.setDirection(Ui.Direction.TopToBottom);

        const captionWidget = new Ui.Widget(this.deletionDialog);
        const captionLayout = new Ui.BoxLayout();
        captionLayout.setDirection(Ui.Direction.LeftToRight);
        captionLayout.spacing = 16;

        const alertWidget = new Ui.ImageView(captionWidget);

        const alertImagePath = new Editor.Path(import.meta.resolve('../Resources/alertIcon.png'));
        const alertImage = new Ui.Pixmap(alertImagePath);

        alertWidget.setFixedWidth(56);
        alertWidget.setFixedHeight(56);
        alertWidget.scaledContents = true;
        alertWidget.pixmap = alertImage;

        const textWidget = new Ui.Widget(captionWidget);
        const textLayout = new Ui.BoxLayout();
        textLayout.setDirection(Ui.Direction.TopToBottom);

        const paragraphLabel = new Ui.Label(textWidget);
        paragraphLabel.fontRole = Ui.FontRole.Title;
        paragraphLabel.text = `Permanently delete this effect?<br>This action cannot be undone.`;

        textLayout.setContentsMargins(0, 0, 0, 0);
        textLayout.addWidget(paragraphLabel);

        textWidget.layout = textLayout;

        alertWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        textWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        captionLayout.addWidgetWithStretch(alertWidget, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        captionLayout.addWidgetWithStretch(textWidget, 0, Ui.Alignment.AlignTop);
        captionWidget.layout = captionLayout;

        const buttonsWidget = new Ui.Widget(this.deletionDialog);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.LeftToRight);
        buttonsLayout.setContentsMargins(0, 8, 0, 0);

        const cancelButton = new Ui.PushButton(buttonsWidget);
        const deleteButton = new Ui.PushButton(buttonsWidget);

        cancelButton.setFixedHeight(20);
        deleteButton.setFixedHeight(20);

        cancelButton.text = 'Cancel';
        deleteButton.text = 'Delete';
        deleteButton.primary = true;

        this.connections.push(cancelButton.onClick.connect(function() {
            this.deletionDialog.close();
        }.bind(this)));

        this.connections.push(deleteButton.onClick.connect(function() {
            this.deleteItem(this.effectId);
        }.bind(this)));

        buttonsLayout.addWidget(cancelButton);
        buttonsLayout.addWidget(deleteButton);
        buttonsLayout.addStretch(0);

        buttonsWidget.layout = buttonsLayout;

        boxLayout1.addWidget(captionWidget);
        boxLayout1.addStretch(0);
        textLayout.addWidget(buttonsWidget);

        this.deletionDialog.layout = boxLayout1;

        return this.deletionDialog;
    }

    createPopup(widget) {
        this.popup = new Ui.CalloutFrame(widget);
        this.popup.setForegroundColor(this.createColor(234, 85, 99, 255));
        this.popup.setBackgroundColor(this.createColor(234, 85, 99, 255));

        const popupLayout = new Ui.BoxLayout();
        this.popup.layout = popupLayout;
        popupLayout.setContentsMargins(8, 0, 8, 0);

        const infoImage = new Ui.ImageView(this.popup);
        infoImage.scaledContents = true;
        infoImage.pixmap = new Ui.Pixmap(import.meta.resolve('../Resources/warning.svg'));
        infoImage.setFixedWidth(16);
        infoImage.setFixedHeight(16);

        popupLayout.addWidgetWithStretch(infoImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter)

        this.popupLabel = new Ui.Label(this.popup);
        this.popupLabel.foregroundRole = Ui.ColorRole.BrightText;

        this.popup.visible = false;

        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(368);
        this.popup.move(216, 4);

        this.popupLabel.text = "Limit reached - A maximum of 5 models can be trained at once";

        popupLayout.addWidgetWithStretch(this.popupLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter)
    }

    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
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
        this.footer.setFixedHeight(56);

        this.footer.autoFillBackground = true;
        this.footer.backgroundRole = Ui.ColorRole.Base;

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 8, 16, 8);

        this.dialog = this.createDeletionDialog();

        const statusWidget = new Ui.Widget(app.mainWidget);
        statusWidget.setFixedWidth(600);
        statusWidget.setFixedHeight(24);
        const statusLayout = new Ui.BoxLayout();
        statusLayout.setDirection(Ui.Direction.LeftToRight);
        statusLayout.setContentsMargins(0, 0, 0, 0);
        statusLayout.spacing = 8;
        statusWidget.layout = statusLayout;
        statusLayout.addStretch(0);

        const statusLabel = new Ui.Label(statusWidget);
        statusLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
        statusLabel.text = '<div style="text-align: right;">' + 'Model training in progress. This may take up to 2 hours.<br>You can close the window and return later.' + '</div>';
        statusLabel.setFixedHeight(24);

        this.statusLabel = statusLabel;

        this.progressLabel = new Ui.Label(statusWidget);
        this.progressLabel.text = "0%";
        this.progressLabel.foregroundRole = Ui.ColorRole.BrightText;

        const loading = new Ui.ProgressIndicator(statusWidget);
        loading.start();
        loading.visible = true;

        statusLayout.addStretch(0);
        statusLayout.addWidgetWithStretch(statusLabel, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        statusLayout.addWidgetWithStretch(this.progressLabel, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        statusLayout.addWidgetWithStretch(loading, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        statusLayout.addStretch(0);

        statusWidget.visible = false;

        statusWidget.move(136, 580)
        this.statusWidget = statusWidget;

        this.footer.onHide.connect((isVisible) => {
            if (!isVisible) {
                this.statusWidget.visible = false;
                if (this.popup) {
                    this.popup.visible = false;
                }
            }
        })

        // footerLayout.addWidgetWithStretch(statusWidget, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

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

        // footerLayout.addWidgetWithStretch(this.deleteButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate previews';
        this.generateButton.visible = false;

        footerLayout.addWidgetWithStretch(this.generateButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        this.footer.layout = footerLayout;

        return this.footer;
    }

    getGenerateButton() {
        return this.generateButton;
    }

    setDeleteButton(button) {
        this.deleteButton = button;

        this.connections.push(this.deleteButton.onClick.connect(function() {
            this.dialog.show();
        }.bind(this)));
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(422);
        this.widget.setFixedHeight(620);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.widget.autoFillBackground = true;
        this.widget.backgroundRole = Ui.ColorRole.Mid;

        this.stackedWithError = new Ui.StackedWidget(this.widget);
        this.stackedWithError.setContentsMargins(0, 0, 0, 0);

        this.stackedWithError.addWidget(this.createPreview(this.widget));
        this.stackedWithError.addWidget(createGenerationErrorWidget(this.widget));
        this.stackedWithError.addWidget(createGenerationInProgressWidget(this.widget, false));
        this.stackedWithError.addWidget(createGenerationInProgressWidget(this.widget, true));

        this.stackedWithError.currentIndex = 0;

        this.layout.addStretch(0);
        this.layout.addWidget(this.stackedWithError);
        this.layout.addStretch(0);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);

        this.layout.addWidget(this.createFooter(this.widget));

        this.createPopup(app.mainWidget);

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
