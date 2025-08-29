import * as Ui from 'LensStudio:Ui';

import { getAsset, listAssets, deleteAsset } from '../api.js';
import { downloadFileFromBucket } from '../utils.js';
import { RequestTokenManager } from './RequestTokenManager.js';

import app from '../../application/app.js';

const COLUMN_SIZE = 3;

export class GalleryView {
    constructor(onStateChanged) {
        this.isDeinitialized = false;
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.movieViews = [];
        this.failedViews = [];
        this.queuedViews = [];
        this.cornerImages = [];
        this.deleteButtons = [];
        this.frames = [];
        this.framesVisible = []
        this.statusIndicators = [];
        this.statusLabels = [];
        this.statusCircles = [];
        this.nextPageToken = null;
        this.renderedViews = 0;
        this.tilesConnections = {};
        this.downloaded = [];
        this.failedConnections = {};
        this.queuedConnections = {};
        this.deleteButtonConnections = {};
        this.items = [];
        this.minTileWidth = 112;
        this.maxTileWidth = 160;
        this.requestTokenManager = new RequestTokenManager();
        this.failedImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/failed.svg')));
        this.deleteImageIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('../Resources/delete.svg')));
        this.cornerSvg = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/corners.png')));
        this.searchQuery = '';
        this.stopped = false;
        this.getRequestGuard = false;

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
                if (this.isDeinitialized) {
                    return;
                }
                if (this.requestTokenManager.isValid(requestToken)) {
                    if (item) {
                        this.items[i] = item;

                        if (this.items[i].previewUrl) {
                            const requestToken = this.requestTokenManager.generateToken();
                            this.downloadAssetPreview(i, requestToken);
                        }

                        if (item.state === 'SUCCESS') {
                            this.statusLabels[i].text = '';
                            this.statusIndicators[i].visible = true;
                            this.failedViews[i].visible = false;
                            this.deleteButtons[i].visible = false;
                            this.updateStatus(i);
                        } else if (item.state === 'QUEUED') {
                            this.queuedViews[i].visible = true;
                            this.failedViews[i].visible = false;
                            this.deleteButtons[i].visible = false;
                            this.statusIndicators[i].visible = true;
                            this.statusLabels[i].text = 'Queued';
                        } else if (item.state === 'FAILED' || item.state === 'UNSAFE') {
                            this.showFailed(i);
                        } else {
                            this.statusIndicators[i].visible = true;
                            this.failedViews[i].visible = false;
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

        for (let i = 0; i < this.framesVisible.length; i++) {
            this.framesVisible[i] = false;
        }

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

        // for (let i = 0; i < 12; i++) {
        //     this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 152);
        //     this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 152);
        // }
        //
        // for (let i = 12; i < this.frames.length; i++) {
        //     this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 0);
        //     this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 0);
        // }

        this.arrangeLayout();

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

        const previewUrl = item.previewDarkUrl ? item.previewDarkUrl :
            (item.previewDarkStaticUrl ? item.previewDarkStaticUrl :
            (item.previewUrl ? item.previewUrl : ""));

        try {
            downloadFileFromBucket(previewUrl, item.id + '_preview.webp', (preview_path) => {
                if (this.isDeinitialized) {
                    return;
                }
                if (this.requestTokenManager.isValid(requestToken)) {
                    const movie = new Ui.Movie(preview_path);
                    movie.resize(144, 144);

                    this.movieViews[i].movie = movie;
                    this.movieViews[i].visible = true;
                    this.movieViews[i].scaledContents = true;

                    this.cornerImages[i].visible = true;

                    this.failedViews[i].visible = false;
                    this.queuedViews[i].visible = false;
                    this.deleteButtons[i].visible = false;

                    this.arrangeLayout();

                    if (this.tilesConnections[i]) {
                        this.tilesConnections[i].disconnect();
                    }

                    this.tilesConnections[i] = this.cornerImages[i].onClick.connect(function() {
                        if (this.getRequestGuard == false) {
                            this.getRequestGuard = true;

                            if (this.items[i].texturedUrl) {
                                this.statusIndicators[i].visible = true;
                                try {
                                    const token = this.requestTokenManager.generateToken();

                                    downloadFileFromBucket(this.items[i].texturedUrl, item.id + '_textured.webp', (textured_path) => {
                                        if (this.isDeinitialized) {
                                            return;
                                        }
                                        if (this.requestTokenManager.isValid(token)) {
                                            const texturedMovie = new Ui.Movie(textured_path);
                                            app.log('', { 'enabled': false });
                                            this.onStateChanged({
                                                'screen': 'preview',
                                                'asset_id': this.items[i].id,
                                                'status': this.items[i].state,
                                                'preview_image': texturedMovie,
                                                'created_on': this.items[i].createdAt,
                                                'settings': this.items[i].settings,
                                                'object_url': this.items[i].objectUrl,
                                                'glb_preview_url': this.items[i].glbWithJpegTexturesUrl
                                            });
                                        }

                                        this.getRequestGuard = false;
                                        if (this.items[i].state === "SUCCESS") {
                                            this.statusIndicators[i].visible = false;
                                            this.queuedViews[i].visible = false;
                                        }
                                    });
                                } catch (error) {
                                    app.log('', { 'enabled': false });
                                    this.onStateChanged({
                                        'screen': 'preview',
                                        'asset_id': this.items[i].id,
                                        'status': this.items[i].state,
                                        'preview_image': movie,
                                        'created_on': this.items[i].createdAt,
                                        'settings': this.items[i].settings,
                                        'object_url': this.items[i].objectUrl,
                                        'glb_preview_url': this.items[i].glbWithJpegTexturesUrl
                                    });

                                    this.getRequestGuard = false;

                                    if (this.items[i].state === "SUCCESS") {
                                        this.statusIndicators[i].visible = false;
                                        this.queuedViews[i].visible = false;
                                    }
                                }
                            } else {
                                app.log('', { 'enabled': false });
                                this.onStateChanged({
                                    'screen': 'preview',
                                    'asset_id': this.items[i].id,
                                    'status': this.items[i].state,
                                    'preview_image': movie,
                                    'created_on': this.items[i].createdAt,
                                    'settings': this.items[i].settings,
                                    'object_url': this.items[i].objectUrl,
                                    'glb_preview_url': this.items[i].glbWithJpegTexturesUrl
                                });
                                this.getRequestGuard = false;

                                if (this.items[i].state === "SUCCESS") {
                                    this.statusIndicators[i].visible = false;
                                    this.queuedViews[i].visible = false;
                                }
                            }
                        }
                    }.bind(this));

                    this.connections.push(this.cornerImages[i].onHover.connect(function(hovered) {
                        if (this.widget.visible) {
                            this.movieViews[i].animated = hovered;
                        }
                    }.bind(this)));

                    if (item.state === 'SUCCESS') {
                        this.statusIndicators[i].visible = false;
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
            if (this.searchLine.text.length > 0) {
                this.disclaimer.text = "<center>No matching results found.<br>Try adjust your search query.<center>";
            } else {
                this.disclaimer.text = "<center>You don’t have any 3D Assets yet,<br>try to create a new one.<center>";
            }

            this.galleryGridWidget.visible = false;
            this.emptyPlaceholder.visible = true;
        } else {
            this.emptyPlaceholder.visible = false;
            this.galleryGridWidget.visible = true;
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

            if (i < this.frames.length) {
                // that means we already can re-use frame i if we created one before
                this.frames[i].visible = true;
                this.framesVisible[i] = true;
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

                statusIndicatorCircle.start();
            } else {
                // if not - create new one and add to buffer
                frame = new Ui.CalloutFrame(this.galleryGridWidget);
                this.frames.push(frame);
                this.framesVisible.push(true);

                // setup frame
                frame.setFixedWidth(144);
                frame.setFixedHeight(144);
                frame.setContentsMargins(0, 0, 0, 0);

                // create new layout
                frameLayout = new Ui.BoxLayout();
                frameLayout.setDirection(Ui.Direction.TopToBottom);
                frameLayout.spacing = 0;
                frameLayout.setContentsMargins(0, 0, 0, 0);

                // setup queued view
                queuedView = new Ui.ImageView(frame);
                this.queuedViews.push(queuedView);

                queuedView.setFixedWidth(144);
                queuedView.setFixedHeight(144);
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
                        'settings': this.items[i].settings,
                        'object_url': null
                    });
                    app.log('', { 'enabled': false });
                }.bind(this));

                // create new one otherwise
                movieView = new Ui.MovieView(frame);
                this.movieViews.push(movieView);

                // setup Moview View
                movieView.setFixedWidth(144);
                movieView.setFixedHeight(144);
                movieView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                movieView.setContentsMargins(0, 0, 0, 0);
                //movieView.scaledContents = true;
                movieView.responseHover = true;

                cornerImage = new Ui.ImageView(frame);
                cornerImage.setFixedWidth(144);
                cornerImage.setFixedHeight(144);
                cornerImage.setContentsMargins(0, 0, 0, 0);
                cornerImage.scaledContents = true;
                cornerImage.responseHover = true;
                cornerImage.pixmap = this.cornerSvg;
                this.cornerImages.push(cornerImage);

                // setup failed view
                failedView = new Ui.ImageView(frame);
                this.failedViews.push(failedView);

                failedView.pixmap = this.failedImage;
                failedView.setFixedWidth(144);
                failedView.setFixedHeight(144);
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
                        'settings': this.items[i].settings,
                        'object_url': null
                    });
                }.bind(this));

                deleteButton = new Ui.PushButton(frame);
                deleteButton.setFixedWidth(Ui.Sizes.ButtonHeight * 1.6);
                deleteButton.setFixedHeight(Ui.Sizes.ButtonHeight);
                deleteButton.text = '';

                deleteButton.setIconWithMode(this.deleteImageIcon, Ui.IconMode.MonoChrome);
                deleteButton.move(144 - Ui.Sizes.Padding - Ui.Sizes.ButtonHeight * 1.6, Ui.Sizes.Padding);
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

                frame.layout = frameLayout;
            }

            // this.gridLayout.addWidgetWithSpan(frame, i / COLUMN_SIZE, i % COLUMN_SIZE, 1, 1, Ui.Alignment.AlignTop);
            // this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 152);
            // this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 152);

            this.arrangeLayout();

            if (item.state == 'SUCCESS') {
                statusLabel.text = '';
            } else if (item.state == 'QUEUED') {
                statusLabel.text = 'Queued';
                this.queuedViews[i].visible = true;
            } else if (item.state !== 'FAILED' || item.state == 'UNSAFE') {
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
        // if (this.renderedViews % COLUMN_SIZE != 0) {
        //     for (let i = this.renderedViews; i < this.renderedViews + (COLUMN_SIZE - this.renderedViews % COLUMN_SIZE); i++) {
        //         this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 152);
        //         this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 152);
        //     }
        // }

        this.updateAllStatuses();
    }

    createDeletionDialog() {
        // Deletion dialog
        const gui = app.gui;

        this.deletionDialog = gui.createDialog();
        this.deletionDialog.windowTitle = 'Delete 3D Asset';

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

        headerLabel.text = 'Delete the 3D Asset?';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        paragraphLabel.text = 'This will delete this 3D asset permanently. You cannot undo this action.';

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
        app.log('Deleting the 3D Asset...', { 'progressBar': true });

        deleteAsset(id, function(response) {
            if (this.isDeinitialized) {
                return;
            }
            this.deletionDialog.close();

            if (response.statusCode == 204) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'exclude_id': id,
                });
                app.log('3D Asset has been deleted.');
            } else {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                });
                app.log('3D Asset could not be deleted. Please, try again.');
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

    resetGallery(exclude_ids) {
        this.clearView();
        this.resetScrollView();
        this.resetSearchBar();

        const requestToken = this.requestTokenManager.generateToken();

        listAssets(15, (response) => {
            if (this.isDeinitialized) {
                return;
            }
            if (this.requestTokenManager.isValid(requestToken)) {
                if (response.statusCode == 200) {
                    // guarantee that our response is still relevant
                    // if other request was sent after this one, there
                    // is no need to render current response
                    let body;
                    try {
                        body = JSON.parse(response.body.toString());
                    } catch (error) {
                        body = {};
                        app.log('Something went wrong during downloading 3D assets. Please, try again.');
                    }

                    try {
                        this.updateView(body.items, exclude_ids);
                    } catch (error) {
                        app.log('Something went wrong during downloading 3D assets. Please, try again.');
                    }

                    this.nextPageToken = body.nextPageToken;
                } else {
                    app.log('Something went wrong during downloading 3D assets. Please, try again.');
                }
            }
        });
    }

    expandGallery() {
        app.log('', { 'enabled': false });

        if (this.nextPageToken) {
            const requestToken = this.requestTokenManager.generateToken();

            listAssets(15, (response) => {
                if (this.isDeinitialized) {
                    return;
                }
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
                            app.log('Something went wrong during downloading 3D assets. Please, try again.');
                        }

                        try {
                            this.updateView(body.items, []);
                        } catch (error) {
                            app.log('Something went wrong during downloading 3D assets. Please, try again.');
                        }

                        this.nextPageToken = body.nextPageToken;
                    } else {
                        app.log('Something went wrong during downloading 3D assets. Please, try again.');
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
            if (this.isDeinitialized) {
                return;
            }
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
                        app.log('Something went wrong during downloading 3D assets. Please, try again.');
                    }

                    try {
                        this.updateView(body.items, []);
                    } catch (error) {
                        app.log('Something went wrong during downloading 3D assets. Please, try again.');
                    }

                    this.nextPageToken = body.nextPageToken;
                } else {
                    app.log('Something went wrong during downloading 3D assets. Please, try again.');
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

    constructQuery() {
        return this.searchQuery;
    }

    createEmptyPlaceholder(parent) {
        this.emptyPlaceholder = new Ui.Widget(parent);
        this.emptyPlaceholder.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.textWidget = new Ui.Widget(this.emptyPlaceholder);
        this.textWidget.setFixedWidth(180);

        this.textLayout = new Ui.BoxLayout();
        this.textLayout.setContentsMargins(0, 0, 0, 0);
        this.textLayout.setDirection(Ui.Direction.TopToBottom);
        this.textWidget.layout = this.textLayout

        this.logo = new Ui.ImageView(this.textWidget);
        this.logo.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/login_icon.svg')));
        this.logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.logo.setFixedWidth(108);
        this.logo.setFixedHeight(123);
        this.logo.scaledContents = true;
        this.textLayout.addWidgetWithStretch(this.logo, 0, Ui.Alignment.AlignCenter);

        this.title = new Ui.Label(this.textWidget);
        this.title.fontRole = Ui.FontRole.LargeTitleBold;
        this.title.text = '<center>Welcome to<br>the Props Generator<center>';
        this.title.wordWrap = true;
        this.title.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.title.setFixedWidth(180);
        this.textLayout.addWidgetWithStretch(this.title, 0, Ui.Alignment.AlignCenter);

        this.disclaimer = new Ui.Label(this.emptyPlaceholder);
        this.disclaimer.wordWrap = true;
        this.disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.disclaimer.setFixedWidth(180);
        this.textLayout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);

        this.disclaimer.text = "<center>You don’t have any 3D Assets yet,<br>try to create a new one.<center>";

        layout.addStretch(1);
        // layout.addWidgetWithStretch(this.logo, 0, Ui.Alignment.AlignCenter);
        // layout.addWidgetWithStretch(this.title, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.textWidget, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(1);

        layout.spacing = Ui.Sizes.Padding;

        this.emptyPlaceholder.layout = layout;

        return this.emptyPlaceholder;
    }

    createGalleryGrid(parent) {
        this.gridParent = new Ui.Widget(parent);
        this.gridParent.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.gridParentLayout = new Ui.BoxLayout();
        this.gridParentLayout.setContentsMargins(0, 0, 0, 0);
        this.gridParent.layout = this.gridParentLayout;

        this.galleryGridWidget = new Ui.Widget(this.gridParent);
        this.galleryGridWidget.setSizePolicy(Ui.SizePolicy.Policy.Minimum, Ui.SizePolicy.Policy.Minimum);

        this.gridParentLayout.addWidgetWithStretch(this.galleryGridWidget, 0, Ui.Alignment.AlignLeft);

        this.spacer = new Ui.Widget(this.galleryGridWidget);
        this.spacer.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.gridLayout = new Ui.GridLayout();

        this.gridLayout.spacing = 8;
        this.gridLayout.setContentsMargins(0, 0, 0, 0);
        this.gridLayout.setLayoutAlignment(this.gridLayout, Ui.Alignment.AlignTop | Ui.Alignment.AlignLeft);

        this.scrollWidget = new Ui.Widget(this.galleryGridWidget);
        this.scrollWidget.layout = this.gridLayout;
        this.verticalScrollArea = new Ui.VerticalScrollArea(this.galleryGridWidget);
        this.verticalScrollArea.setWidget(this.scrollWidget);

        this.gridParent.onResize.connect(() => {
            this.arrangeLayout();
        })

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
        this.emptyPlaceHolder.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.emptyPlaceholder.visible = false;

        this.gridParentLayout.addWidgetWithStretch(this.emptyPlaceholder, 0, Ui.Alignment.AlignCenter);

        return this.gridParent;
    }

    arrangeLayout() {
        const galleryWidth = this.gridParent.width;
        const tileMinWidth = this.minTileWidth;
        let visibleTilesCnt = 0;
        for (let i = 0; i < this.framesVisible.length; i++) {
            if (this.framesVisible[i]) {
                visibleTilesCnt++;
            }
        }

        let tilesPerRow = 1;
        if (galleryWidth > tileMinWidth) {
            tilesPerRow = Math.floor(galleryWidth / (tileMinWidth + this.gridLayout.spacing));
            if ((tilesPerRow + 1) * tileMinWidth + tilesPerRow * this.gridLayout.spacing <= galleryWidth) {
                tilesPerRow++;
            }

            if (tilesPerRow >= visibleTilesCnt) {
                this.galleryGridWidget.setFixedWidth(Math.min((visibleTilesCnt * this.maxTileWidth) + (visibleTilesCnt - 1) * this.gridLayout.spacing, galleryWidth));
                tilesPerRow = visibleTilesCnt;
            }
            else {
                this.galleryGridWidget.setFixedWidth(galleryWidth);
            }
        }

        let tileWidth = Math.floor(this.clamp((galleryWidth - this.gridLayout.spacing * (tilesPerRow - 1)) / tilesPerRow, this.minTileWidth, this.maxTileWidth));
        const tileHeight = tileWidth;
        this.gridLayout.clear(Ui.ClearLayoutBehavior.KeepClearedWidgets);
        let row = 0, col = 0;
        for (let i = 0; i < this.frames.length; i++) {
            if (!this.framesVisible[i]) {
                continue;
            }
            if (col === 0) {
                this.gridLayout.setRowStretch(row, 0);
            }
            [this.frames[i], this.queuedViews[i], this.movieViews[i], this.failedViews[i], this.cornerImages[i]].forEach((item) => {
                item.setFixedWidth(tileWidth);
                item.setFixedHeight(tileHeight);
            })
            this.gridLayout.addWidgetAt(this.frames[i], row, col, Ui.Alignment.AlignCenter);
            if (this.movieViews[i].movie) {
                this.movieViews[i].movie.resize(tileWidth, tileHeight);
            }
            col++;
            if (col >= tilesPerRow) {
                col = 0;
                row++;
            }
        }
        this.gridLayout.addWidgetAt(this.spacer, row, col, Ui.Alignment.AlignRight);
        this.gridLayout.setRowStretch(row + 1, 1);
    }

    clamp(val, min, max) {
        return Math.max(Math.min(val, max), min);
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

        layout.setContentsMargins(Ui.Sizes.HalfPadding, 0, 0, 0);
        layout.addWidget(this.reloadButton);
        layout.addWidget(this.searchLine);

        widget.layout = layout;
        return widget;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);

        this.layout.addWidget(this.createHeader(this.widget));
        this.layout.addWidget(this.createGalleryGrid(this.widget));

        this.layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, 0);
        this.widget.layout = this.layout;

        this.dialog = this.createDeletionDialog();

        return this.widget;
    }

    deinit() {
        this.isDeinitialized = true;
    }
};
