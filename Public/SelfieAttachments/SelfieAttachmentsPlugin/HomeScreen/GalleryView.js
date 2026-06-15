import * as Ui from 'LensStudio:Ui';

import { getAsset, listAssets, deleteAsset } from '../api.js';
import {downloadFileFromBucket, guidelinesLink, importToProject, convertAPIStyleToUI} from '../utils.js';
import { RequestTokenManager } from './RequestTokenManager.js';
import { Filter } from './Filter.js';

import app from '../../application/app.js';

import {logEventAssetImport, logEventLinkOpen} from '../../application/analytics.js';
import * as Shell from 'LensStudio:Shell';

const COLUMN_SIZE = 3;

export class GalleryView {
    constructor(onStateChanged) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.movieViews = [];
        this.failedViews = [];
        this.queuedViews = [];
        this.cornerImages = [];
        this.deleteButtons = [];
        this.frames = [];
        this.statusIndicators = [];
        this.statusLabels = [];
        this.statusCircles = [];
        this.importButtons = [];
        this.animatedIcons = [];
        this.nextPageToken = null;
        this.renderedViews = 0;
        this.tilesConnections = {};
        this.downloaded = [];
        this.failedConnections = {};
        this.queuedConnections = {};
        this.hoverConnections = {};
        this.deleteButtonConnections = {};
        this.items = [];
        this.requestTokenManager = new RequestTokenManager();
        this.failedImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/failed.svg')));
        this.deleteImageIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('../Resources/delete.svg')));
        this.cornerSvg = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/corners.png')));
        this.importImageIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('../Resources/import.svg')));
        this.videoCameraIcon = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/videoCamera.svg')));
        this.searchQuery = '';
        this.filterQuery = '';
        this.stopped = false;
        this.getRequestGuard = false;

        this.filterSchema = {
            'attachment_type': {
                'values': [
                    {
                        'value': 'static',
                        'ui': 'Static'
                    },
                    {
                        'value': 'animated',
                        'ui': 'Animated'
                    }
                ],
                'include_to_default_filter': true,
                'ui': 'Type'
            },
        };

        this.statusUpdater = setInterval(() => {
            if (this.stopped) {
                return;
            }
            this.updateAllStatuses();
        }, 15000);
    }

    updateAllStatuses() {
        for (let i = 0; i < this.renderedViews; i++) {
            this.updateStatus(i);
        }
    }

    updateStatus(i) {
        if (i < 0 || i >= this.items.length) {
            return;
        }

        if (this.items[i].state === 'SUCCESS') {
            if (!this.downloaded[i]) {
                this.downloaded[i] = true;
                this.statusLabels[i].text = '';
                const requestToken = this.requestTokenManager.generateToken();

                this.statusLabels[i].text = '';
                this.failedViews[i].visible = false;
                this.deleteButtons[i].visible = false;
                this.queuedViews[i].visible = false;
                this.downloadAssetPreview(i, requestToken);
            }
        } else {
            const requestToken = this.requestTokenManager.generateToken();
            getAsset(this.items[i].id, (item) => {
                if (!app.authStatus) return;
                if (this.requestTokenManager.isValid(requestToken)) {
                    if (item) {
                        this.items[i] = item;

                        if (this.items[i].previewUrl && item.state !== 'FAILED' && item.state !== 'UNSAFE') {
                            const requestToken = this.requestTokenManager.generateToken();
                            this.downloadAssetPreview(i, requestToken);
                        }

                        if (item.state === 'SUCCESS') {
                            this.statusLabels[i].text = '';
                            this.statusIndicators[i].visible = true;
                            this.importButtons[i].visible = false;
                            this.animatedIcons[i].visible = item.promptAnimation;
                            this.failedViews[i].visible = false;
                            this.deleteButtons[i].visible = false;
                            this.updateStatus(i);
                        } else if (item.state === 'QUEUED') {
                            this.queuedViews[i].visible = true;
                            this.failedViews[i].visible = false;
                            this.deleteButtons[i].visible = false;
                            this.statusIndicators[i].visible = true;
                            this.importButtons[i].visible = false;
                            this.animatedIcons[i].visible = item.promptAnimation;
                            this.statusLabels[i].text = 'Queued';
                        } else if (item.state === 'FAILED' || item.state === 'UNSAFE') {
                            this.showFailed(i);
                        } else {
                            this.statusIndicators[i].visible = true;
                            this.failedViews[i].visible = false;
                            this.importButtons[i].visible = false;
                            this.animatedIcons[i].visible = item.promptAnimation;
                            this.deleteButtons[i].visible = false;
                            this.statusLabels[i].text = Math.round(item.progressPercent) + '%';
                            this.queuedViews[i].visible = true;
                        }
                    } else {
                        console.log('Attempt to download asset failed.');
                    }
                }
            });
        }
    }

    showFailed(i) {
        this.statusLabels[i].text = '';
        this.statusIndicators[i].visible = false;
        this.queuedViews[i].visible = false;
        this.importButtons[i].visible = false;
        this.animatedIcons[i].visible = false;
        this.movieViews[i].visible = false;
        this.failedViews[i].visible = true;
        this.deleteButtons[i].visible = true;
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

    removeObjectsWithExcludedIds(arrayOfObjects, excludeIds) {
        return arrayOfObjects.filter(obj => !excludeIds.includes(obj.id));
    }

    restoreMovies() {
        this.movieViews.forEach(function(movieView) {
            if (movieView.movie) {
                movieView.movie.speed = 100;
            }

            movieView.animated = false;
        });
    }

    clearView() {
        this.getRequestGuard = false;

        // remove all frames from view port
        this.frames.forEach(function(frame) {
            frame.visible = false;
        });

        this.movieViews.forEach(function(movieView) {
            movieView.visible = false;
        });

        this.failedViews.forEach(function(view) {
            view.visible = false;
        });

        this.queuedViews.forEach(function(view) {
            view.visible = false;
        })

        this.deleteButtons.forEach(function(button) {
            button.visible = false;
        })

        this.cornerImages.forEach(function(image) {
            image.visible = false;
        })

        this.importButtons.forEach(function(button) {
            button.visible = false;
        })

        this.animatedIcons.forEach(function(icon) {
            icon.visible = false;
        })

        for (let i = 0; i < 12; i++) {
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 130);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 130);
        }

        for (let i = 12; i < this.frames.length; i++) {
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 0);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 0);
        }

        this.requestTokenManager.invalidateTokenAll();
        this.items.length = 0;
        this.renderedViews = 0;
        this.downloaded.length = 0;
        this.verticalScrollArea.enabled = false;
    }

    downloadAssetPreview(i, requestToken) {
        if (!this.requestTokenManager.isValid(requestToken)) {
            return;
        }

        const item = this.items[i];

        try {
            downloadFileFromBucket(item.previewUrl, item.id + '_preview.webp', (preview_path) => {
                if (!app.authStatus) return;
                if (this.requestTokenManager.isValid(requestToken)) {
                    const movie = new Ui.Movie(preview_path);

                    movie.resize(122, 122);

                    this.movieViews[i].movie = movie;
                    this.movieViews[i].visible = true;

                    this.cornerImages[i].visible = true;

                    this.failedViews[i].visible = false;
                    this.queuedViews[i].visible = false;
                    this.deleteButtons[i].visible = false;

                    if (this.tilesConnections[i]) {
                        this.tilesConnections[i].disconnect();
                    }

                    this.tilesConnections[i] = this.cornerImages[i].onClick.connect(() => {
                        if (this.getRequestGuard == false) {
                            this.getRequestGuard = true;

                                app.log('', { 'enabled': false });
                                this.onStateChanged({
                                    'screen': 'preview',
                                    'asset_id': this.items[i].id,
                                    'status': this.items[i].state,
                                    'staticPreviewUrl': this.items[i].staticPreviewUrl,
                                    'animatedPreviewUrl': this.items[i].animatedPreviewUrl,
                                    'created_on': this.items[i].createdAt,
                                    'settings': { prompt: this.items[i].prompt, seed: this.items[i].seed, promptAnimation: this.items[i].promptAnimation, style: convertAPIStyleToUI(this.items[i].style) },
                                    'object_url': this.items[i].lspkgLsUrl,
                                    'animation_url': this.items[i].lspkgAnimationLsUrl,
                                });
                                this.getRequestGuard = false;

                                this.animatedIcons[i].visible = this.items[i].promptAnimation;

                                if (this.items[i].state === "SUCCESS") {
                                    this.statusIndicators[i].visible = false;
                                    this.importButtons[i].visible = true;
                                    this.queuedViews[i].visible = false;
                                }

                            this.importButtons[i].text = '';
                            this.importButtons[i].setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                        }
                    });

                    this.connections.push(this.cornerImages[i].onHover.connect((hovered) => {
                        if (this.widget.visible) {
                            this.movieViews[i].animated = hovered;

                            if (hovered) {
                                this.importButtons[i].text = 'Import';
                                this.importButtons[i].setFixedWidth(Ui.Sizes.ButtonHeight * 3.6);
                            } else {
                                this.importButtons[i].text = '';
                                this.importButtons[i].setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                            }
                        }
                    }));

                    this.animatedIcons[i].visible = this.items[i].promptAnimation;

                    if (item.state === 'SUCCESS') {
                        this.statusIndicators[i].visible = false;
                        this.importButtons[i].visible = true;
                        this.queuedViews[i].visible = false;
                    }
                }
            });
        } catch (error) {
            app.log('Something went wrong during downloading morhps. Please, try again.');
        }
    }

    updateView(items, exclude_ids) {
        if (exclude_ids) {
            items = this.removeObjectsWithExcludedIds(items, exclude_ids);
        }

        if ((this.renderedViews + items.length) === 0) {
            if (this.searchLine.text.length > 0 || !this.filter.isDefault()) {
                this.demoPreviewContainer.visible = false;
                this.guidelinesButton.visible = false;
                this.disclaimer.text = "<center>No matching results found.<br>Try adjust your search query.<center>";
            } else {
                this.guidelinesButton.visible = true;
                this.demoPreviewContainer.visible = true;
                this.disclaimer.text = "<center>You don’t have any Selfie Attachments yet,<br>try to create a new one.<center>";
            }

            this.emptyPlaceholder.visible = true;
        } else {
            this.emptyPlaceholder.visible = false;
        }

        const startSize = this.renderedViews;

        this.verticalScrollArea.enabled = true;
        for (let i = startSize; i < startSize + items.length; i++) {
            const item = items[i - startSize];
            this.items.push(item);

            let frame;
            let frameLayout;
            let movieView;
            let cornerImage;
            let statusIndicator;
            let statusIndicatorCircle;
            let statusLabel;
            let statusLayout;
            let failedView;
            let queuedView;
            let deleteButton;
            let importButton;
            let animatedIcon;

            if (i < this.frames.length) {
                // that means we already can re-use frame i if we created one before
                this.frames[i].visible = true;
                frame = this.frames[i];

                // if we created frame before, it should contain existing layout
                frameLayout = frame.layout;

                // that means we already can re-use movieView i if we created one before
                movieView = this.movieViews[i];

                // hide it, since it holds invalid movie
                movieView.visible = false;

                cornerImage = this.cornerImages[i];
                this.cornerImages.visible = false;

                // setup failed
                failedView = this.failedViews[i];
                failedView.visible = false;

                // delete button
                deleteButton = this.deleteButtons[i];
                deleteButton.visible = false;

                // setup queued
                queuedView = this.queuedViews[i];
                queuedView.visible = false;

                statusIndicator = this.statusIndicators[i];

                // enable it until valid Movie is downloaded
                statusIndicator.visible = true;

                statusIndicatorCircle = this.statusCircles[i];
                statusIndicatorCircle.visible = true;

                statusLabel = this.statusLabels[i];

                statusLayout = statusIndicator.layout;

                statusIndicator.visible = true;
                statusIndicatorCircle.visible = true;

                importButton = this.importButtons[i];
                importButton.visible = false;

                animatedIcon = this.animatedIcons[i];
                animatedIcon.visible = false;

                statusIndicatorCircle.start();
            } else {
                // if not - create new one and add to buffer
                frame = new Ui.CalloutFrame(this.galleryGridWidget);
                this.frames.push(frame);

                // setup frame
                frame.setFixedWidth(122);
                frame.setFixedHeight(122);
                frame.setContentsMargins(0, 0, 0, 0);

                // create new layout
                frameLayout = new Ui.BoxLayout();
                frameLayout.setDirection(Ui.Direction.TopToBottom);
                frameLayout.spacing = 0;
                frameLayout.setContentsMargins(0, 0, 0, 0);

                // setup queued view
                queuedView = new Ui.ImageView(frame);
                this.queuedViews.push(queuedView);

                queuedView.setFixedWidth(122);
                queuedView.setFixedHeight(122);
                queuedView.setContentsMargins(0, 0, 0, 0);
                queuedView.scaledContents = true;
                queuedView.visible = false;

                if (this.queuedConnections[i]) {
                    this.queuedConnections[i].disconnect();
                }

                this.queuedConnections[i] = this.queuedViews[i].onClick.connect(function() {
                    this.onStateChanged({
                        'screen': 'preview',
                        'asset_id': this.items[i].id,
                        'status': this.items[i].state,
                        'created_on': this.items[i].createdAt,
                        'settings': { prompt: this.items[i].prompt, seed: this.items[i].seed, promptAnimation: this.items[i].promptAnimation, style: convertAPIStyleToUI(this.items[i].style) },
                        'object_url': null,
                        'animation_url': null
                    });
                    app.log('', { 'enabled': false });
                }.bind(this));

                // create new one otherwise
                movieView = new Ui.MovieView(frame);
                this.movieViews.push(movieView);

                // setup Moview View
                movieView.setFixedWidth(122);
                movieView.setFixedHeight(122);
                movieView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                movieView.setContentsMargins(0, 0, 0, 0);
                //movieView.scaledContents = true;
                movieView.responseHover = true;

                cornerImage = new Ui.ImageView(frame);
                cornerImage.setFixedWidth(122);
                cornerImage.setFixedHeight(122);
                cornerImage.setContentsMargins(0, 0, 0, 0);
                cornerImage.scaledContents = true;
                cornerImage.responseHover = true;
                cornerImage.pixmap = this.cornerSvg;
                this.cornerImages.push(cornerImage);

                // setup failed view
                failedView = new Ui.ImageView(frame);
                this.failedViews.push(failedView);

                failedView.pixmap = this.failedImage;
                failedView.setFixedWidth(122);
                failedView.setFixedHeight(122);
                failedView.setContentsMargins(0, 0, 0, 0);
                failedView.scaledContents = true;
                failedView.visible = false;

                if (this.failedConnections[i]) {
                    this.failedConnections[i].disconnect();
                }

                this.failedConnections[i] = this.failedViews[i].onClick.connect(function() {
                    app.log('', { 'enabled': false });
                    this.onStateChanged({
                        'screen': 'preview',
                        'asset_id': this.items[i].id,
                        'status': this.items[i].state,
                        'created_on': this.items[i].createdAt,
                        'settings': { prompt: this.items[i].prompt, seed: this.items[i].seed, promptAnimation: this.items[i].promptAnimation, style: convertAPIStyleToUI(this.items[i].style) },
                        'object_url': null,
                        'animation_url': null
                    });
                }.bind(this));

                deleteButton = new Ui.PushButton(frame);
                deleteButton.setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                deleteButton.setFixedHeight(Ui.Sizes.ButtonHeight);
                deleteButton.text = '';

                deleteButton.setIconWithMode(this.deleteImageIcon, Ui.IconMode.MonoChrome);
                deleteButton.move(122 - Ui.Sizes.Padding - Ui.Sizes.ButtonHeight * 1.6, Ui.Sizes.Padding);
                deleteButton.visible = false;
                this.deleteButtons.push(deleteButton);

                if (this.deleteButtonConnections[i]) {
                    this.deleteButtonConnections[i].disconnect();
                }

                this.deleteButtonConnections = this.deleteButtons[i].onClick.connect(() => {
                    this.id_to_delete = this.items[i].id;
                    this.dialog.show();
                    app.log('', { 'enabled' : false });
                });

                statusIndicator = new Ui.Widget(frame);
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

                animatedIcon = new Ui.ImageView(frame);
                animatedIcon.pixmap = this.videoCameraIcon;
                animatedIcon.scaledContents = true;
                animatedIcon.setFixedWidth(20);
                animatedIcon.setFixedHeight(20);
                animatedIcon.move(6, 4);
                animatedIcon.visible = false;
                this.animatedIcons.push(animatedIcon);

                importButton = new Ui.PushButton(cornerImage);
                importButton.setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                importButton.setFixedHeight(Ui.Sizes.ButtonHeight);
                importButton.text = '';

                importButton.setIconWithMode(this.importImageIcon, Ui.IconMode.MonoChrome);
                importButton.move(Ui.Sizes.Padding, 122 - Ui.Sizes.Padding - Ui.Sizes.ButtonHeight + 2);
                importButton.primary = true;
                importButton.visible = false;
                this.importButtons.push(importButton);

                importButton.onClick.connect(() => {
                    this.onImportToProject(this.items[i].id);
                });

                frame.layout = frameLayout;
            }

            this.gridLayout.addWidgetWithSpan(frame, i / COLUMN_SIZE, i % COLUMN_SIZE, 1, 1, Ui.Alignment.AlignTop);
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 130);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 130);

            if (item.state == 'SUCCESS') {
                statusLabel.text = '';
            } else if (item.state == 'QUEUED' || item.state == 'INITIALIZING') {
                statusLabel.text = 'Queued';
                this.queuedViews[i].visible = true;
            } else if (item.state !== 'FAILED' && item.state !== 'UNSAFE') {
                statusLabel.text = Math.round(item.progressPercent) + '%';
                this.queuedViews[i].visible = true;
            }

            if (item.state == 'FAILED' || item.state == 'UNSAFE') {
                this.showFailed(i);
            } else if (this.items[i].previewUrl) {
                const requestToken = this.requestTokenManager.generateToken();
                this.downloadAssetPreview(i, requestToken);
            }
        }

        this.renderedViews = startSize + items.length;

        // this needed if row isn't full, then items showed properly aligned to the left side
        if (this.renderedViews % COLUMN_SIZE != 0) {
            for (let i = this.renderedViews; i < this.renderedViews + (COLUMN_SIZE - this.renderedViews % COLUMN_SIZE); i++) {
                this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 130);
                this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 130);
            }
        }

        this.updateAllStatuses();
    }

    onImportToProject(asset_id) {
        if (asset_id) {
            app.log('Importing Selfie Attachments asset to the project...', { 'progressBar': true });

            getAsset(asset_id, (data) => {
                if (!app.authStatus) return;
                if (data) {
                    let lspkgUrl = null;

                    if (data.lspkgAnimationLsUrl) {
                        lspkgUrl = data.lspkgAnimationLsUrl;
                    } else {
                        lspkgUrl = data.lspkgLsUrl;
                    }

                    if (lspkgUrl) {
                        importToProject(lspkgUrl, (success) => {
                            logEventAssetImport(success ? "SUCCESS" : "FAILED");
                            app.log(success ? 'Selfie Attachments asset is succesfully imported to the project' : 'Import failed, please try again');
                            // this.updatePreview(this.state);
                        });
                    } else {
                        logEventAssetImport("PREPARING");
                        app.log('Files for import are still preparing. Please, try again in few seconds.');
                    }
                } else {
                    logEventAssetImport("FAILED");
                    app.log('Something went wrong during importing Selfie Attachments asset to the project, please try again.');
                }
            });
        } else {
            logEventAssetImport("FAILED");
            app.log('Something went wrong during importing Selfie Attachments asset to the project, please try again.');
        }
    }

    createDeletionDialog() {
        // Deletion dialog
        const gui = app.gui;

        this.deletionDialog = gui.createDialog();
        this.deletionDialog.windowTitle = 'Delete Selfie Attachments asset?';
        this.deletionDialog.setModal(true);

        this.deletionDialog.resize(460, 140);

        const boxLayout1 = new Ui.BoxLayout();
        boxLayout1.setDirection(Ui.Direction.TopToBottom);

        const captionWidget = new Ui.Widget(this.deletionDialog);
        const captionLayout = new Ui.BoxLayout();
        captionLayout.setDirection(Ui.Direction.LeftToRight);

        const alertWidget = new Ui.ImageView(captionWidget);

        const alertImagePath = new Editor.Path(import.meta.resolve('../Resources/alert.png'));
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

        headerLabel.text = 'Delete the Selfie Attachments asset?';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        paragraphLabel.text = 'This will delete this Selfie Attachments asset permanently. You cannot undo this action.';

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
            this.onDelete(this.id_to_delete);
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

    onDelete(id) {
        app.log('Deleting the Selfie Attachments asset...', { 'progressBar': true });

        deleteAsset(id, function(response) {
            if (!app.authStatus) return;
            this.deletionDialog.close();

            if (response.statusCode == 204) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'exclude_id': id,
                });
                app.log('Selfie Attachments asset has been deleted.');
            } else {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                });
                app.log('Selfie Attachments asset could not be deleted. Please, try again.');
            }
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
        this.filter.blockSignals = true;
        this.filter.reset();
        this.filterQuery = this.filter.toString();
        this.filter.blockSignals = false;
    }

    resetGallery(exclude_ids) {
        this.clearView();
        this.resetScrollView();
        this.resetSearchBar();
        this.resetFilter();
    }

    expandGallery() {
        app.log('', { 'enabled': false });

        if (this.nextPageToken) {
            const requestToken = this.requestTokenManager.generateToken();

            listAssets(15, (response) => {
                if (!app.authStatus) return;
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
                            app.log('Something went wrong during downloading Selfie Attachments assets. Please, try again.');
                        }

                        try {
                            this.updateView(body.items, []);
                        } catch (error) {
                            app.log('Something went wrong during downloading Selfie Attachments assets. Please, try again.');
                        }

                        this.nextPageToken = body.nextPageToken;
                    } else {
                        app.log('Something went wrong during downloading Selfie Attachments assets. Please, try again.');
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

        listAssets(15, (response) => {
            if (!app.authStatus) return;
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
                        app.log('Something went wrong during downloading Selfie Attachments assets. Please, try again.');
                    }

                    try {
                        this.updateView(body.items, []);
                    } catch (error) {
                        app.log('Something went wrong during downloading Selfie Attachments assets. Please, try again.');
                    }

                    this.nextPageToken = body.nextPageToken;
                } else {
                    app.log('Something went wrong during downloading Selfie Attachments assets. Please, try again.');
                }
            }
        }, this.constructQuery());
    }

    reset(state) {
        if (state.needsUpdate) {
            this.resetGallery([state.exclude_id]);
        }
        this.restoreMovies();
    }

    createEmptyPlaceholder(parent) {
        this.emptyPlaceholder = new Ui.Widget(parent);
        this.emptyPlaceholder.setFixedWidth(420);
        this.emptyPlaceholder.setFixedHeight(600);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);

        this.logo = new Ui.ImageView(this.emptyPlaceholder);
        this.logo.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/fte_logo.svg')));
        this.logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.logo.setFixedWidth(35);
        this.logo.setFixedHeight(35);
        this.logo.scaledContents = true;

        this.title = new Ui.Label(this.emptyPlaceholder);
        this.title.fontRole = Ui.FontRole.LargeTitleBold;
        this.title.text = '<center>Welcome to<br>Selfie Attachments<center>';
        this.title.wordWrap = true;
        this.title.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.title.setFixedWidth(180);

        this.demoPreviewContainer = new Ui.Widget(this.emptyPlaceholder);

        const demoPreviewLayout = new Ui.BoxLayout();
        demoPreviewLayout.setDirection(Ui.Direction.LeftToRight);
        demoPreviewLayout.setContentsMargins(0, 0, 0, Ui.Sizes.Padding);
        demoPreviewLayout.spacing = Ui.Sizes.Padding;

        this.movies = [];
        for (let i = 0; i < 3; i++) {
            const movie = new Ui.Movie(import.meta.resolve('../Resources/fte_demo_' + (i + 1) + '.webp'));
            this.movies.push(movie);
            movie.resize(120, 213);

            const demoPreview = new Ui.MovieView(this.demoPreviewContainer);
            demoPreview.setFixedWidth(120);
            demoPreview.setFixedHeight(213);
            demoPreview.movie = movie;
            demoPreview.animated = true;

            demoPreviewLayout.addWidget(demoPreview);
        }

        this.demoPreviewContainer.layout = demoPreviewLayout;

        this.guidelinesButton = new Ui.PushButton(this.emptyPlaceholder);
        this.guidelinesButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.guidelinesButton.text = 'Guidelines';
        this.guidelinesButton.setIcon(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('../Resources/guides.svg'))));

        this.guidelinesButton.onClick.connect(() => {
            Shell.openUrl(guidelinesLink, {});
            logEventLinkOpen(guidelinesLink);
        });

        this.disclaimer = new Ui.Label(this.emptyPlaceholder);
        this.disclaimer.wordWrap = true;
        this.disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.disclaimer.setFixedWidth(300);

        this.disclaimer.text = "<center>You don’t have any Selfie Attachments Assets yet.<br>Try to creating a new one!<center>";

        layout.addStretch(1);
        layout.addWidgetWithStretch(this.logo, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.title, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.demoPreviewContainer, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.guidelinesButton, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(2);

        layout.spacing = Ui.Sizes.Padding;

        this.emptyPlaceholder.layout = layout;
    }

    createGalleryGrid(parent) {
        this.galleryGridWidget = new Ui.Widget(parent);
        this.galleryGridWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, 0);

        this.gridLayout = new Ui.GridLayout();

        this.gridLayout.spacing = 0;
        this.gridLayout.setContentsMargins(0, 0, Ui.Sizes.Padding, 0);

        this.scrollWidget = new Ui.Widget(this.galleryGridWidget);
        this.scrollWidget.layout = this.gridLayout;
        this.verticalScrollArea = new Ui.VerticalScrollArea(this.galleryGridWidget);
        this.verticalScrollArea.setWidget(this.scrollWidget);

        this.connections.push(this.verticalScrollArea.onValueChange.connect(function(value) {
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

    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }

    constructQuery() {
        return this.searchQuery + this.filterQuery;
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

        layout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.DoublePadding, 0);
        layout.addWidget(this.reloadButton);
        layout.addWidget(this.searchLine);
        layout.addWidget(this.filter.widget);

        widget.layout = layout;
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
        this.generateButton.primary = false;

        footerLayout.addWidgetWithStretch(this.generateButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(422);
        this.widget.setFixedHeight(620);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);

        this.layout.addWidget(this.createHeader(this.widget));
        this.layout.addWidget(this.createGalleryGrid(this.widget));

        const separator2 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator2.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator2);

        this.layout.addWidget(this.createFooter(this.widget));

        this.layout.spacing = 0;
        this.layout.setContentsMargins(0, 0, 0, 0);
        this.widget.layout = this.layout;

        this.dialog = this.createDeletionDialog();

        return this.widget;
    }
};
