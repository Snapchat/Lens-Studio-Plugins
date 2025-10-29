import * as Ui from 'LensStudio:Ui';

import { listEffects, getEffect, getPostProcessing, getModels, deleteEffect, updateFavorites, deleteFavorites } from '../api.js';
import {downloadFileFromBucket, importToProject} from '../utils.js';
import { Filter } from './Filter.js';
import { RequestTokenManager } from './RequestTokenManager.js';

import app from '../../application/app.js';
import {logEventAssetImport} from "../../application/analytics";

const COLUMN_SIZE = 3;

export class GalleryView {
    constructor(onStateChanged, onPreviewGenerated) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.onPreviewGenerated = onPreviewGenerated;
        this.imageViews = [];
        this.failedViews = [];
        this.queuedViews = [];
        this.borders = [];
        this.frames = [];
        this.statusIndicators = [];
        this.statusLabels = [];
        this.statusCircles = [];
        this.deleteButtons = [];
        this.favoritesButtons = [];
        this.isFavoriteButtonChecked = [];
        this.importButtons = [];
        this.loadingOverlays = [];
        this.idToOverlay = {};
        this.nextPageToken = null;
        this.renderedViews = 0;
        this.lastListRequestId = 0;
        this.getRequestGuard = false;
        this.effectIds = [];
        this.effectStatus = [];
        this.postProcessingStatus = [];
        this.downloaded = [];
        this.effectResponse = {};
        this.postProcessingResponse = {};
        this.modelData = {};

        // special connections that need to be disconnected on
        // each gallery update (to unlink from unrelevant tiles)
        this.tilesConnections = {};
        this.failedConnections = {};
        this.hoverConnections = {};
        this.queuedConnections = {};
        this.deleteButtonConnections = {};
        this.favoriteConnections = {};

        this.TILE_WIDTH = 122;
        this.TILE_HEIGHT = 122;
        this.TILE_MARGIN = 8;
        this.TILE_CNT = 15;

        this.requestTokenManager = new RequestTokenManager();

        this.borderImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/ml_face_hover.svg')));
        this.failedImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/failed.svg')));
        this.deleteImagePath = new Editor.Path(import.meta.resolve('../Resources/delete.svg'));
        this.importImageIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('../Resources/import.svg')));
        this.deleteImageIcon = Editor.Icon.fromFile(this.deleteImagePath);

        this.favoriteTrueIcon = new Ui.Pixmap(new Editor.Path(import.meta.resolve("../Resources/favorite_true.svg")));
        this.favoriteFalseIcon = new Ui.Pixmap(new Editor.Path(import.meta.resolve("../Resources/favorite_false.svg")));

        this.searchQuery = '';
        this.filterQuery = '';

        this.filterSchema = {
            'effectTypeId': {
                'values': [
                    {
                        'value': 'face-image',
                        'ui': 'Image'
                    },
                    {
                        'value': 'face-text',
                        'ui': 'Text'
                    }
                ],
                'include_to_default_filter': true,
                'ui': 'Prompt Type'
            },
            'anyModelState': {
                'values': [
                    {
                        'value': 'SUCCESS',
                        'ui': 'Success'
                    },
                    {
                        'value': 'QUEUED',
                        'ui': 'Queued'
                    },
                    {
                        'value': 'RUNNING',
                        'ui': 'Running'
                    },
                    {
                        'value': 'FAILED',
                        'ui': 'Failed'
                    }
                ],
                'ui': 'Model Status',
                'include_to_default_filter': false,
            }
        };

        this.statusUpdater = setInterval(() => {
            if (this.stopped) {
                return;
            }
            this.updateAllStatuses();
        }, 15000);
    }

    init() {
        this.stopped = false;
        this.resetGallery();
    }

    stop() {
        this.clearView();
        this.resetScrollView();
        this.resetSearchBar();
        this.stopped = true;
    }

    updateAllStatuses() {
        for (let i = 0; i < this.effectIds.length; i++) {
            this.updateStatus(i, true);
        }
    }

    updateStatus(i, checkEffect) {
        if (i < 0 || i >= this.effectStatus.length) {
            return;
        }

        if (!checkEffect || this.effectStatus[i] == 'SUCCESS') {
            if (this.postProcessingStatus[i] == 'SUCCESS') {
                if (!this.downloaded[i]) {
                    this.downloaded[i] = true;
                    this.statusLabels[i].text = '';
                    this.failedViews[i].visible = false;
                    this.deleteButtons[i].visible = false;
                    this.queuedViews[i].visible = false;
                    const requestToken = this.requestTokenManager.generateToken();
                    this.downloadEffect(this.effectResponse[this.effectIds[i]], i, requestToken, this.postProcessingResponse[this.effectIds[i]].samples[0].targetImageUrl);
                }
            } else {
                const requestToken = this.requestTokenManager.generateToken();

                getPostProcessing(this.effectIds[i], (postProcessingResponse) => {
                    if (this.requestTokenManager.isValid(requestToken)) {
                        postProcessingResponse = postProcessingResponse[0];
                        this.postProcessingResponse[this.effectIds[i]] = postProcessingResponse;

                        if (!postProcessingResponse) {
                            this.showFailed(i);
                        } else if (postProcessingResponse.state == 'SUCCESS') {
                            this.statusLabels[i].text = '';
                            this.postProcessingStatus[i] = 'SUCCESS';
                            this.failedViews[i].visible = false;
                            this.deleteButtons[i].visible = false;
                            this.queuedViews[i].visible = false;
                            this.updateStatus(i, false);
                        } else if (postProcessingResponse.state == 'FAILED') {
                            this.showFailed(i);
                        } else if (this.effectStatus[i] == 'SUCCESS'){
                            this.failedViews[i].visible = false;
                            this.deleteButtons[i].visible = false;
                            this.queuedViews[i].visible = true;
                            this.statusIndicators[i].visible = true;
                            this.statusLabels[i].text = 'Processing';
                        }
                    }
                });
            }
        } else {
            // check for effect id status, update if status changed
            const requestToken = this.requestTokenManager.generateToken();

            this.effectStatus[i] = null;
            this.postProcessingStatus[i] = null;

            getEffect(this.effectIds[i], (effectResponse) => {
                if (this.requestTokenManager.isValid(requestToken)) {
                    this.effectResponse[this.effectIds[i]] = effectResponse;

                    if (effectResponse.state == 'SUCCESS') {
                        this.statusLabels[i].text = '';
                        this.failedViews[i].visible = false;
                        this.deleteButtons[i].visible = false;
                        this.effectStatus[i] = 'SUCCESS';
                        this.updateStatus(i, false);
                    } else if (effectResponse.state == 'RUNNING') {
                        this.effectStatus[i] = 'RUNNING';
                        this.statusIndicators[i].visible = true;
                        this.failedViews[i].visible = false;
                        this.deleteButtons[i].visible = false;
                        this.queuedViews[i].visible = true;
                        this.statusLabels[i].text = Math.round(effectResponse.percentComplete) + '%';
                        this.updateStatus(i, false);
                    } else if (effectResponse.state == 'QUEUED') {
                        this.effectStatus[i] = 'QUEUED';
                        this.statusIndicators[i].visible = true;
                        this.failedViews[i].visible = false;
                        this.deleteButtons[i].visible = false;
                        this.queuedViews[i].visible = true;
                        this.statusLabels[i].text = "Queued";
                        this.updateStatus(i, false);
                    } else if (effectResponse.state == 'FAILED') {
                        this.effectStatus[i] = 'FAILED';
                        this.showFailed(i);
                    }
                }
            });
        }
    }

    removeObjectsWithExcludedIds(arrayOfObjects, excludeIds) {
        return arrayOfObjects.filter(obj => !excludeIds.includes(obj.id));
    }

    showFailed(i) {
        this.statusLabels[i].text = '';
        this.statusIndicators[i].visible = false;
        this.queuedViews[i].visible = false;
        this.failedViews[i].visible = true;
        this.deleteButtons[i].visible = true;
    }

    clearView() {
        this.getRequestGuard = false;

        // remove all frames from view port
        this.frames.forEach(function(frame) {
            frame.visible = false;
        });

        this.imageViews.forEach(function(imageView) {
            imageView.blockSignals(true);
            imageView.visible = false;
            imageView.radius = Math.round(16 / app.dialog.devicePixelRatio);
        });

        this.failedViews.forEach(function(view) {
            view.visible = false;
        });

        this.borders.forEach((border) => {
            border.visible = false;
        });

        this.statusLabels.forEach(function(label) {
            label.text = '';
        });

        this.deleteButtons.forEach(function(button) {
            button.visible = false;
        })

        this.favoritesButtons.forEach(function(button) {
            button.visible = false;
        });

        this.importButtons.forEach(function(button) {
            button.visible = false;
        })

        this.loadingOverlays.forEach((loadingOverlay) => {
            loadingOverlay.visible = false;
        })

        this.requestTokenManager.invalidateTokenAll();
        this.effectIds = [];
        this.effectStatus = [];
        this.postProcessingStatus = [];
        this.downloaded = [];

        for (let i = 0; i < this.TILE_CNT; i++) {
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, this.TILE_WIDTH + this.TILE_MARGIN);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, this.TILE_HEIGHT + this.TILE_MARGIN);
        }

        for (let i = this.TILE_CNT; i < this.frames.length; i++) {
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 0);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 0);
        }

        this.renderedViews = 0;
        this.verticalScrollArea.enabled = false;

        this.clearConnections(this.tilesConnections);
        this.clearConnections(this.failedConnections);
        this.clearConnections(this.hoverConnections);
    }

    clearConnections(connections) {
        for (let key in connections) {
            connections[key].forEach((connection) => {
                if (connection) {
                    connection.disconnect();
                }
            });
        }

        connections = {};
    }

    checkModelStatus(id, callback) {
        getModels(id, (modelsResponse) => {
            if (modelsResponse.length > 0) {
                this.modelData[id] = modelsResponse[0];
            }
            else {
                this.modelData[id] = null;
            }
            callback();
        })
    }

    onTrainingStarted(id) {
        if (this.idToOverlay[id]) {
            this.checkModelStatus(id, () => {});
            this.idToOverlay[id].visible = true;
        }
    }

    downloadEffect(item, i, requestToken, previewUrl) {
        if (!this.requestTokenManager.isValid(requestToken)) {
            return;
        }

        try {
            downloadFileFromBucket(previewUrl, item.id + '_preview.webp', (preview_path) => {
                if (this.requestTokenManager.isValid(requestToken)) {
                    const image = new Ui.Pixmap(preview_path);
                    this.imageViews[i].pixmap = image;
                    this.imageViews[i].visible = true;
                    this.imageViews[i].blockSignals(false);

                    const onOpen = () => {
                        if (this.getRequestGuard == false) {
                            this.getRequestGuard = true;
                            if (!this.importButtons[i].visible && !this.loadingOverlays[i].visible) {
                                this.statusIndicators[i].visible = true;
                            }

                            app.log('', { 'enabled': false });
                            try {
                                getModels(item.id, (modelsResponse) => {
                                        this.statusIndicators[i].visible = false;
                                        this.getRequestGuard = false;

                                        const modelData = modelsResponse.find(
                                            item => item.trainingState !== 'FAILED' &&
                                                item.settings.modelSize === 'base' &&
                                                (item.trainingState !== "SUCCESS" || item.objectLsUrl !== null)
                                        ) || null;

                                        this.onStateChanged({
                                            'screen': 'preview',
                                            'effect_id': item.id,
                                            'created_on': item.createdAt,
                                            'effect_get_response': this.effectResponse[item.id],
                                            'post_processing_get_response': this.postProcessingResponse[item.id],
                                            'models_response': modelData,
                                            'userNotes': item.userNotes,
                                        });
                                });
                            } catch (error) {
                                this.statusIndicators[i].visible = false;
                                this.getRequestGuard = false;

                                app.log(`Something went wrong during opening ${app.name}. Please, try again.`);
                            }
                        }
                    };

                    const con1 = this.borders[i].onClick.connect(onOpen);
                    // in case if hover hasn't been registered
                    const con2 = this.imageViews[i].onClick.connect(onOpen);
                    const con3 = this.loadingOverlays[i].onClick.connect(onOpen);

                    this.tilesConnections[i] = [ con1, con2, con3 ];

                    if (item.state == 'SUCCESS') {
                        this.statusIndicators[i].visible = false;
                    }

                    this.onPreviewGenerated(item, (needsOpening) => {
                        if (needsOpening) {
                            onOpen();
                        }
                    });
                }
            });
        } catch (error) {
            app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
        }
    }

    updateView(items, exclude_ids) {
        if (exclude_ids) {
            items = this.removeObjectsWithExcludedIds(items, exclude_ids);
        }

        if ((this.renderedViews + items.length) === 0) {
            if (this.searchQuery.length > 0 || !this.filter.isDefault()) {
                this.disclaimer.text = "<center>No matching results found.<br>Try adjust your search query.<center>";
            } else {
                this.disclaimer.text = `<center>You don't have any ${app.name} created yet,<br>try to create a new one.<center>`;
            }

            this.emptyPlaceholder.visible = true;
        } else {
            this.emptyPlaceholder.visible = false;
        }

        const startSize = this.renderedViews;

        this.verticalScrollArea.enabled = true;

        for (let i = startSize; i < startSize + items.length; i++) {
            const item = items[i - startSize];

            if (i < this.effectIds.length) {
                this.effectIds[i] = item.id;
                this.effectStatus[i] = null;
                this.postProcessingStatus[i] = false;
                this.downloaded[i] = false;
            } else {
                this.effectIds.push(item.id);
                this.effectStatus.push(null);
                this.postProcessingStatus.push(false);
                this.downloaded.push(false);
            }

            let frame;
            let frameLayout;
            let imageView;
            let statusIndicator;
            let statusIndicatorCircle;
            let statusLabel;
            let statusLayout;
            let border;
            let failedView;
            let queuedView;
            let deleteButton;
            let favoriteButton;
            let importButton;
            let loadingOverlay;

            const updateButton = (button, id, buttonId) => {
                if (this.isFavoriteButtonChecked[buttonId]) {
                    button.pixmap = this.favoriteTrueIcon;
                    if (id) {
                        updateFavorites(id, (response) => {
                            if (response.statusCode != 204) {
                                this.isFavoriteButtonChecked[buttonId] = !this.isFavoriteButtonChecked[buttonId];
                                button.pixmap = this.favoriteFalseIcon;
                            }
                        });
                    }
                } else {
                    button.pixmap = this.favoriteFalseIcon;
                    if (id) {
                        deleteFavorites(id, (response) => {
                            if (response.statusCode != 204) {
                                this.isFavoriteButtonChecked[buttonId] = !this.isFavoriteButtonChecked[buttonId];
                                button.pixmap = this.favoriteTrueIcon;
                            }
                        });
                    }
                }
            }

            if (i < this.frames.length) {
                // that means we already can re-use frame i if we created one before
                this.frames[i].visible = true;
                frame = this.frames[i];

                // if we created frame before, it should contain existing layout
                frameLayout = frame.layout;

                // that means we already can re-use imageView i if we created one before
                imageView = this.imageViews[i];

                // hide it, since it holds invalid image
                imageView.visible = false;
                imageView.blockSignals(true);

                failedView = this.failedViews[i];
                failedView.visible = false;

                // delete button
                deleteButton = this.deleteButtons[i];
                deleteButton.visible = false;

                favoriteButton = this.favoritesButtons[i];
                this.isFavoriteButtonChecked[i] = item.isFavorite;
                updateButton(favoriteButton, null, i);
                favoriteButton.visible = this.isFavoriteButtonChecked[i];

                this.idToOverlay[item.id] = this.loadingOverlays[i];
                if (this.modelData[item.id] && (this.modelData[item.id].trainingState !== "SUCCESS" && this.modelData[item.id].trainingState !== "FAILED")) {
                    this.loadingOverlays[i].visible = true;
                }

                importButton = this.importButtons[i];
                if (this.modelData[item.id] && this.modelData[item.id].trainingState === "SUCCESS") {
                    importButton.visible = true;
                }
                else {
                    importButton.visible = false;
                }

                // setup queued
                queuedView = this.queuedViews[i];
                queuedView.visible = false;

                border = this.borders[i];
                border.visible = false;

                statusIndicator = this.statusIndicators[i];

                // enable it until valid image is downloaded
                statusIndicator.visible = true;

                statusIndicatorCircle = this.statusCircles[i];
                statusIndicatorCircle.visible = true;

                statusLabel = this.statusLabels[i];

                statusLayout = statusIndicator.layout;

                statusIndicator.visible = true;
                statusIndicatorCircle.visible = true;

                statusIndicatorCircle.start();

                this.downloaded[i] = false;
            } else {
                // if not - create new one and add to buffer
                frame = new Ui.CalloutFrame(this.galleryGridWidget);
                frame.setContentsMargins(0, 0, 0, 0);
                this.frames.push(frame);

                // setup frame
                frame.setFixedWidth(this.TILE_WIDTH);
                frame.setFixedHeight(this.TILE_HEIGHT);
                frame.setContentsMargins(0, 0, 0, 0);

                // create new layout
                frameLayout = new Ui.BoxLayout();
                frameLayout.setDirection(Ui.Direction.TopToBottom);
                frameLayout.spacing = 0;
                frameLayout.setContentsMargins(0, 0, 0, 0);

                // create new one otherwise
                imageView = new Ui.ImageView(frame);
                this.imageViews.push(imageView);

                // setup imagew View
                imageView.radius = Math.round(16 / app.dialog.devicePixelRatio);
                imageView.setFixedWidth(this.TILE_WIDTH);
                imageView.setFixedHeight(this.TILE_HEIGHT);
                imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                imageView.setContentsMargins(0, 0, 0, 0);
                imageView.scaledContents = true;
                imageView.responseHover = true;
                imageView.blockSignals(true);

                // setup queued view
                queuedView = new Ui.ImageView(frame);
                this.queuedViews.push(queuedView);

                queuedView.setFixedWidth(this.TILE_WIDTH);
                queuedView.setFixedHeight(this.TILE_HEIGHT);
                queuedView.setContentsMargins(0, 0, 0, 0);
                queuedView.scaledContents = true;
                queuedView.visible = false;

                if (this.queuedConnections[i]) {
                    this.queuedConnections[i].disconnect();
                }

                this.queuedConnections[i] = this.queuedViews[i].onClick.connect(function() {
                    this.onStateChanged({
                        'screen': 'preview',
                        'effect_id': this.effectIds[i],
                        'created_on': this.effectResponse[this.effectIds[i]].createdAt,
                        'effect_get_response': this.effectResponse[this.effectIds[i]],
                        'post_processing_get_response': this.postProcessingResponse[this.effectIds[i]],
                        'models_response': null,
                        'userNotes': this.effectResponse[this.effectIds[i]].userNotes,
                    });
                    app.log('', { 'enabled': false });
                }.bind(this));

                // setup failed view

                failedView = new Ui.ImageView(frame);
                this.failedViews.push(failedView);

                failedView.pixmap = this.failedImage;
                failedView.setFixedWidth(this.TILE_WIDTH);
                failedView.setFixedHeight(this.TILE_HEIGHT);
                failedView.setContentsMargins(0, 0, 0, 0);
                failedView.scaledContents = true;
                failedView.visible = false;

                loadingOverlay = new Ui.ImageView(imageView);
                loadingOverlay.setFixedWidth(this.TILE_WIDTH);
                loadingOverlay.setFixedHeight(this.TILE_HEIGHT);
                loadingOverlay.scaledContents = true;
                loadingOverlay.pixmap = new Ui.Pixmap(import.meta.resolve('../Resources/grey_rectangle.svg'));

                const spinner = new Ui.ProgressIndicator(loadingOverlay);
                spinner.setFixedWidth(32);
                spinner.setFixedHeight(32);
                spinner.start();
                spinner.visible = true;
                spinner.move(47, 47);

                const trainingLabel = new Ui.Label(loadingOverlay);
                trainingLabel.text = '<center>' + 'Training<br>in progress' + '</center>';
                trainingLabel.foregroundRole = Ui.ColorRole.BrightText;
                trainingLabel.setFixedWidth(100);
                trainingLabel.move(11, 81);

                loadingOverlay.visible = false;

                border = new Ui.ImageView(imageView);
                this.borders.push(border);
                border.scaledContents = true;
                border.pixmap = this.borderImage;
                border.setFixedWidth(this.TILE_WIDTH);
                border.setFixedHeight(this.TILE_HEIGHT);
                border.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                border.setContentsMargins(0, 0, 0, 0);

                border.visible = false;

                favoriteButton = new Ui.ImageView(imageView);
                favoriteButton.setFixedWidth(24);
                favoriteButton.setFixedHeight(20);
                favoriteButton.move(this.TILE_WIDTH - Ui.Sizes.Padding - 24, Ui.Sizes.Padding);
                this.isFavoriteButtonChecked.push(item.isFavorite);

                updateButton(favoriteButton, null, this.isFavoriteButtonChecked.length - 1);

                favoriteButton.visible = this.isFavoriteButtonChecked[this.isFavoriteButtonChecked.length - 1];

                if (this.favoriteConnections[i]) {
                    this.failedConnections[i].disconnect();
                }

                this.favoriteConnections[i] = favoriteButton.onClick.connect(() => {
                    this.isFavoriteButtonChecked[i] = !this.isFavoriteButtonChecked[i];
                    updateButton(favoriteButton, item.id, i);
                });

                this.favoritesButtons.push(favoriteButton);

                deleteButton = new Ui.PushButton(frame);
                deleteButton.setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                deleteButton.setFixedHeight(Ui.Sizes.ButtonHeight);
                deleteButton.text = '';

                deleteButton.setIconWithMode(this.deleteImageIcon, Ui.IconMode.MonoChrome);
                deleteButton.move(this.TILE_WIDTH - Ui.Sizes.Padding - Ui.Sizes.ButtonHeight * 1.6, Ui.Sizes.Padding);
                deleteButton.visible = false;
                this.deleteButtons.push(deleteButton);

                if (this.deleteButtonConnections[i]) {
                    this.deleteButtonConnections[i].disconnect();
                }

                this.deleteButtonConnections = this.deleteButtons[i].onClick.connect(() => {
                    this.id_to_delete = this.effectIds[i];
                    this.dialog.show();
                    app.log('', { 'enabled' : false });
                });

                statusIndicator = new Ui.Widget(imageView);
                this.statusIndicators.push(statusIndicator);

                statusIndicatorCircle = new Ui.ProgressIndicator(statusIndicator);
                this.statusCircles.push(statusIndicatorCircle);

                statusLabel = new Ui.Label(statusIndicator);
                this.statusLabels.push(statusLabel);
                statusLabel.fontRole = Ui.FontRole.DefaultBold;

                statusLayout = new Ui.BoxLayout();

                statusLayout.setDirection(Ui.Direction.LeftToRight);
                statusLayout.addWidget(statusIndicatorCircle);
                statusLayout.addWidget(statusLabel);

                statusIndicator.visible = true;
                statusIndicatorCircle.visible = true;

                statusIndicatorCircle.start();

                statusIndicator.layout = statusLayout;

                frameLayout.addStretch(0);
                frameLayout.addWidget(statusIndicator);

                importButton = new Ui.PushButton(imageView);
                importButton.setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                importButton.setFixedHeight(Ui.Sizes.ButtonHeight);
                importButton.text = '';

                importButton.setIconWithMode(this.importImageIcon, Ui.IconMode.MonoChrome);
                importButton.move(Ui.Sizes.Padding, this.TILE_HEIGHT - Ui.Sizes.Padding - Ui.Sizes.ButtonHeight);
                importButton.primary = true;
                importButton.visible = false;
                this.importButtons.push(importButton);

                this.idToOverlay[item.id] = loadingOverlay;
                this.loadingOverlays.push(loadingOverlay);

                importButton.onClick.connect(() => {
                    this.onImportToProject(this.modelData[this.effectIds[i]].objectLsUrl)
                });

                this.checkModelStatus(item.id, () => {
                    if (this.modelData[item.id] && this.modelData[item.id].trainingState === "SUCCESS") {
                        importButton.visible = true;
                        statusIndicator.visible = false;
                        importButton.raise();
                    }
                    if (this.modelData[item.id] && (this.modelData[item.id].trainingState !== "SUCCESS" && this.modelData[item.id].trainingState !== "FAILED")) {
                        loadingOverlay.visible = true;
                    }
                })

                frame.layout = frameLayout;

                this.downloaded.push(false);
            }

            this.failedConnections[i] = [this.failedViews[i].onClick.connect(() => {
                this.onStateChanged({
                    'screen': 'preview',
                    'effect_id': this.effectIds[i] ,
                    'created_on': this.effectResponse[this.effectIds[i]].createdAt,
                    'effect_get_response': this.effectResponse[this.effectIds[i]],
                    'post_processing_get_response': this.postProcessingResponse[this.effectIds[i]],
                    'models_response': null,
                    'userNotes': this.effectResponse[this.effectIds[i]].userNotes,
                });
                app.log('', { 'enabled': false });
            })];

            this.hoverConnections[i] = [(imageView.onHover.connect((hovered) => {
                if (hovered) {
                    favoriteButton.visible = true;
                    importButton.text = 'Import';
                    importButton.setFixedWidth(Ui.Sizes.ButtonHeight * 3.6);
                } else {
                    favoriteButton.visible = this.isFavoriteButtonChecked[i];
                    importButton.text = '';
                    importButton.setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                }

                border.visible = hovered;
                this.currentHoveredTile = border;
            }))];

            this.gridLayout.addWidgetWithSpan(frame, i / COLUMN_SIZE, i % COLUMN_SIZE, 1, 1, Ui.Alignment.AlignTop);
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, this.TILE_WIDTH + this.TILE_MARGIN);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, this.TILE_HEIGHT + this.TILE_MARGIN);

            this.updateStatus(i, true);
        }

        this.renderedViews = startSize + items.length;

        // this needed if row isn't full, then items showed properly aligned to the left side
        if (this.renderedViews % COLUMN_SIZE != 0) {
            for (let i = this.renderedViews; i < this.renderedViews + (COLUMN_SIZE - this.renderedViews % COLUMN_SIZE); i++) {
                this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, this.TILE_WIDTH + this.TILE_MARGIN);
                this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, this.TILE_HEIGHT + this.TILE_MARGIN);
            }
        }
    }

    onImportToProject(url) {
        app.log(`Importing ${app.name} to the project...`, { 'progressBar': true });

        importToProject(url, function(success) {
            logEventAssetImport(success ? "SUCCESS" : "FAILED");
            app.log(success ? 'Effect is succesfully imported to the project' : 'Import failed, please try again');
        }.bind(this));
    }

    resetSearchBar() {
        this.searchLine.blockSignals(true);
        this.searchLine.text = '';
        this.searchQuery = '';
        this.searchLine.blockSignals(false);
    }

    resetScrollView() {
        this.verticalScrollArea.blockSignals(true);
        this.verticalScrollArea.value = 0;
        this.verticalScrollArea.blockSignals(false);
    }

    resetFilter() {
        this.filter.blockSignals(true);
        this.filter.reset();
        this.filterQuery = this.filter.toString();
        this.filter.blockSignals(false);
    }

    resetGallery(exclude_ids) {
        this.clearView();
        this.resetScrollView();
        this.resetSearchBar();
        this.resetFilter();

        const requestToken = this.requestTokenManager.generateToken();

        listEffects(this.TILE_CNT, (response) => {
            // guarantee that our response is still relevant
            // if other request was sent after this one, there
            // is no need to render current response
            if (this.requestTokenManager.isValid(requestToken)) {

                if (response.statusCode == 200) {
                    let body;
                    try {
                        body = JSON.parse(response.body.toString());
                    } catch (error) {
                        body = {};
                        app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                    }

                    try {
                        this.updateView(body.items, exclude_ids);
                    } catch (error) {
                        app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                    }

                    this.nextPageToken = body.nextPageToken;
                } else {
                    app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                }
            }
        }, this.constructQuery());
    }

    expandGallery() {
        app.log('', { 'enabled': false });

        if (this.nextPageToken) {

            const requestToken = this.requestTokenManager.generateToken();

            listEffects(3, (response) => {
                if (this.requestTokenManager.isValid(requestToken)) {
                    // guarantee that our response is still relevant
                    // if other request was sent after this one, there
                    // is no need to render current response

                    if (response.statusCode == 200) {
                        // guarantee that our response is still relevant
                        // if other request was sent after this one, there
                        // is no need to render current response
                        let body;
                        try {
                            body = JSON.parse(response.body.toString());
                        } catch (error) {
                            body = {};
                            app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                        }

                        try {
                            this.updateView(body.items, []);
                        } catch (error) {
                            app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                        }

                        this.nextPageToken = body.nextPageToken;
                    } else {
                        app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                    }
                }
            }, this.constructQuery(), this.nextPageToken);
        }
    }

    searchRequest() {
        app.log('', { 'enabled': false });

        this.clearView();
        this.resetScrollView();

        const requestToken = this.requestTokenManager.generateToken();

        listEffects(this.TILE_CNT, (response) => {

            // guarantee that our response is still relevant
            // if other request was sent after this one, there
            // is no need to render current response
            if (this.requestTokenManager.isValid(requestToken)) {

                // guarantee that our response is still relevant
                // if other request was sent after this one, there
                // is no need to render current response
                if (response.statusCode == 200) {

                    let body;
                    try {
                        body = JSON.parse(response.body.toString());
                    } catch (error) {
                        body = {};
                        app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                    }

                    try {
                        this.updateView(body.items, []);
                    } catch (error) {
                        app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                    }

                    this.nextPageToken = body.nextPageToken;
                } else {
                    app.log(`Something went wrong during downloading ${app.name}. Please, try again.`);
                }
            }
        }, this.constructQuery());
    }

    constructQuery() {
        return this.searchQuery + this.filterQuery;
    }

    reset(state) {
        if (state.needsUpdate) {
            this.resetGallery([state.exclude_id]);
        }
    }

    createEmptyPlaceholder(parent) {
        this.emptyPlaceholder = new Ui.Widget(parent);
        this.emptyPlaceholder.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.emptyPlaceholder.setFixedWidth(422);
        this.emptyPlaceholder.setFixedHeight(480);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.logo = new Ui.ImageView(this.emptyPlaceholder);
        this.logo.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/gen_ai_wizzard.svg')));
        this.logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.logo.setFixedWidth(180);
        this.logo.setFixedHeight(180);
        this.logo.scaledContents = true;

        this.title = new Ui.Label(this.emptyPlaceholder);
        this.title.fontRole = Ui.FontRole.LargeTitleBold;
        this.title.text = '<center>Welcome to<br>Lens Studio Gen AI<center>';
        this.title.wordWrap = true;
        this.title.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.title.setFixedWidth(180);

        this.disclaimer = new Ui.Label(this.emptyPlaceholder);
        this.disclaimer.wordWrap = true;
        this.disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.disclaimer.setFixedWidth(300);

        this.disclaimer.text = `<center>You don't have any ${app.name} created yet,<br>try to create a new one.<center>`;

        layout.addStretch(1);
        layout.addWidgetWithStretch(this.logo, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.title, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(1);

        layout.spacing = Ui.Sizes.Padding;

        this.emptyPlaceholder.layout = layout;
    }

    createGalleryGrid(parent) {
        this.galleryGridWidget = new Ui.Widget(parent);

        this.gridLayout = new Ui.GridLayout();

        this.gridLayout.spacing = 0;
        this.gridLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

        this.scrollWidget = new Ui.Widget(this.galleryGridWidget);
        this.scrollWidget.layout = this.gridLayout;
        this.verticalScrollArea = new Ui.VerticalScrollArea(this.galleryGridWidget);
        this.verticalScrollArea.setWidget(this.scrollWidget);

        this.connections.push(this.verticalScrollArea.onValueChange.connect(function(value) {
            if (this.currentHoveredTile) {
                this.currentHoveredTile.visible = false;
                this.currentHoveredTile = null;
            }

            if (this.verticalScrollArea.maximum == value) {
                this.expandGallery();
            }
        }.bind(this)));

        const scrollLayout = new Ui.BoxLayout();
        scrollLayout.setDirection(Ui.Direction.TopToBottom);
        scrollLayout.addWidget(this.verticalScrollArea);
        scrollLayout.spacing = 0;
        scrollLayout.setContentsMargins(0, 0, 0, 0);

        this.galleryGridWidget.layout = scrollLayout;

        this.emptyPlaceHolder = this.createEmptyPlaceholder(this.galleryGridWidget);
        this.emptyPlaceholder.visible = false;

        return this.galleryGridWidget;
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
            this.onDelete(this.id_to_delete);
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

    onDelete(id) {
        app.log('Deleting effect...', { 'progressBar': true });

        deleteEffect(id, function(response) {
            this.deletionDialog.close();

            if (response.statusCode == 204) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'exclude_id': id,
                });
                app.log('Effect has been deleted.');
            } else {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                });
                app.log(`${app.name} could not be deleted. Please, try again.`);
            }
        }.bind(this));
    }

    createHeader(parent) {
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.reloadButton = new Ui.ToolButton(widget);

        const reloadIconPath = new Editor.Path(import.meta.resolve('../Resources/reload.svg'));
        this.reloadButton.setIcon(Editor.Icon.fromFile(reloadIconPath));
        this.connections.push(this.reloadButton.onClick.connect(function() {
            this.resetGallery();
            app.log('', { 'enabled': false });
        }.bind(this)));

        this.searchLine = new Ui.SearchLineEdit(widget);

        this.connections.push(this.searchLine.onTextChange.connect(function(text) {
            if (text.length > 0) {
                this.searchQuery = '&filter[]=search%3D' + text;
            } else {
                this.searchQuery = '';
            }

            this.searchRequest();
        }.bind(this)));

        this.filter = new Filter(widget, this.filterSchema, (selectedFilter) => {
            this.filterQuery = selectedFilter;
            this.searchRequest();
        });

        this.filterQuery = this.filter.toString();

        layout.setContentsMargins(Ui.Sizes.HalfPadding, 0, Ui.Sizes.DoublePadding, 0);
        layout.addWidget(this.reloadButton);
        layout.addWidget(this.searchLine);
        layout.addWidget(this.filter.widget);

        widget.layout = layout;
        widget.visible = false;
        return widget;
    }

    getGenerateButton() {
        return this.generateButton;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 0, 16, 0);
        footerLayout.spacing = 0;

        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate previews';
        this.generateButton.enabled = false;
        // const editImagePath = new Editor.Path(import.meta.resolve('../Resources/lens_studio_ai.svg'));
        // this.generateButton.setIconWithMode(Editor.Icon.fromFile(editImagePath), Ui.IconMode.MonoChrome);
        // this.connections.push(this.generateButton.onClick.connect(function() {
        //     this.generateEffect(this.controls);
        // }.bind(this)));

        // footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.generateButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        // footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.spacing = 0;

        this.layout.addWidget(this.createHeader(this.widget));
        this.layout.addWidget(this.createGalleryGrid(this.widget));

        const separator2 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator2.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator2);

        this.layout.addWidget(this.createFooter(this.widget));

        this.layout.setContentsMargins(0, 0, 12, 0);
        this.widget.layout = this.layout;

        this.dialog = this.createDeletionDialog();

        return this.widget;
    }
};
