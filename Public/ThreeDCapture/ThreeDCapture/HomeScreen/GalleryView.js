import * as Ui from 'LensStudio:Ui';

import { getAsset, listAssets } from '../api.js';
import { downloadFileFromBucket } from '../utils.js';
import { RequestTokenManager } from './RequestTokenManager.js';

import app from '../../application/app.js';

const COLUMN_SIZE = 3;

export class GalleryView {
    constructor(onStateChanged) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.movieViews = [];
        this.cornerImages = [];
        this.failedViews = [];
        this.frames = [];
        this.statusIndicators = [];
        this.statusLabels = [];
        this.statusCircles = [];
        this.nextPageToken = null;
        this.renderedViews = 0;
        this.tilesConnections = {};
        this.downloaded = [];
        this.failedConnections = {};
        this.items = [];
        this.requestTokenManager = new RequestTokenManager();
        this.failedImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/failed.svg')));
        this.cornerSvg = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/corners.png')));
        this.searchQuery = '';
        this.stopped = false;
        this.getRequestGuard = false;
        this.maxSize = 144;

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

                this.downloadAssetPreview(i, requestToken);
            }
        } else {
            const requestToken = this.requestTokenManager.generateToken();
            getAsset(this.items[i].id, (item) => {
                if (this.requestTokenManager.isValid(requestToken)) {
                    if (item) {
                        this.items[i] = item;

                        if (item.state === 'SUCCESS') {
                            this.statusLabels[i].text = '';
                            this.statusIndicators[i].visible = true;
                            this.failedViews[i].visible = false;
                            this.updateStatus(i);
                        } else if (item.state === 'QUEUED') {
                            this.failedViews[i].visible = false;
                            this.statusIndicators[i].visible = true;
                            this.statusLabels[i].text = 'Queued';
                        } else if (item.state === 'FAILED' || item.state === 'UNSAFE' || item.state === "CANCELED") {
                            this.showFailed(i);
                        } else {
                            this.statusIndicators[i].visible = true;
                            this.failedViews[i].visible = false;
                            this.statusLabels[i].text = Math.round(item.progressPercent) + '%';
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
        this.failedViews[i].visible = true;
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

    removeDrafts(arrayOfObjects) {
        return arrayOfObjects.filter(obj => obj.state !== "DRAFT");
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

        this.cornerImages.forEach(function(image) {
            image.visible = false;
        })

        for (let i = 0; i < 12; i++) {
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 152);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 152);
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
            downloadFileFromBucket(item.renderUrl, item.id + '_render.webp', (preview_path) => {
                if (this.requestTokenManager.isValid(requestToken)) {
                    const movie = new Ui.Movie(preview_path);
                    this.movieViews[i].movie = movie;

                    const width = this.movieViews[i].movie.width;
                    const height = this.movieViews[i].movie.height;

                    const aspect = width / height;

                    let newWidth, newHeight;
                    let topOffset = 0, leftOffset = 0;

                    if (aspect < 1) {
                        newWidth = this.maxSize;
                        newHeight = newWidth / aspect;

                        topOffset = (this.maxSize - newHeight) / 2;
                    } else {
                        newHeight = this.maxSize;
                        newWidth = newHeight * aspect;

                        leftOffset = (this.maxSize - newWidth) / 2;
                    }

                    this.movieViews[i].setFixedWidth(newWidth);
                    this.movieViews[i].setFixedHeight(newHeight);

                    this.movieViews[i].move(leftOffset, topOffset);

                    this.movieViews[i].visible = true;
                    this.cornerImages[i].visible = true;

                    this.failedViews[i].visible = false;

                    if (this.tilesConnections[i]) {
                        this.tilesConnections[i].disconnect();
                    }

                    this.tilesConnections[i] = this.cornerImages[i].onClick.connect(function() {
                        if (this.getRequestGuard == false) {
                            this.getRequestGuard = true;

                            if (this.items[i].renderUrl) {
                                this.statusIndicators[i].visible = true;
                                try {
                                    const texturedMovie = new Ui.Movie(preview_path);
                                    app.log('', { 'enabled': false });
                                    this.onStateChanged({
                                        'screen': 'preview',
                                        'asset_id': this.items[i].id,
                                        'status': this.items[i].state,
                                        'preview_image': texturedMovie,
                                        'created_on': this.items[i].createdAt,
                                        'prompt': this.items[i].prompt,
                                        'plyUrl': this.items[i].plyUrl,
                                        'errorMessage': this.items[i].errorMessage
                                    });
                                } catch (error) {
                                    app.log('', { 'enabled': false });
                                    this.onStateChanged({
                                        'screen': 'preview',
                                        'asset_id': this.items[i].id,
                                        'status': this.items[i].state,
                                        'preview_image': movie,
                                        'created_on': this.items[i].createdAt,
                                        'prompt': this.items[i].prompt,
                                        'plyUrl': this.items[i].plyUrl,
                                        'errorMessage': this.items[i].errorMessage
                                    });

                                    this.statusIndicators[i].visible = false;
                                    this.getRequestGuard = false;
                                }
                            } else {
                                app.log('', { 'enabled': false });
                                this.onStateChanged({
                                    'screen': 'preview',
                                    'asset_id': this.items[i].id,
                                    'status': this.items[i].state,
                                    'preview_image': movie,
                                    'created_on': this.items[i].createdAt,
                                    'prompt': this.items[i].prompt,
                                    'plyUrl': this.items[i].plyUrl,
                                    'errorMessage': this.items[i].errorMessage
                                });
                                this.getRequestGuard = false;
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

        items = this.removeDrafts(items);

        if ((this.renderedViews + items.length) === 0) {
            if (this.searchLine.text.length > 0) {
                this.disclaimer.text = "<center>No matching results found.<br>Try adjust your search query.<center>";
            } else {
                this.disclaimer.text = "<center>You don’t have any Gaussian Splattings yet,<br>try to create a new one.<center>";
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

                // setup frame
                frame.setFixedWidth(144);
                frame.setFixedHeight(144);
                frame.setContentsMargins(0, 0, 0, 0);

                // create new layout
                frameLayout = new Ui.BoxLayout();
                frameLayout.setDirection(Ui.Direction.TopToBottom);
                frameLayout.spacing = 0;
                frameLayout.setContentsMargins(0, 0, 0, 0);

                // create new one otherwise
                movieView = new Ui.MovieView(frame);
                this.movieViews.push(movieView);

                // setup Moview View
                movieView.setFixedWidth(130);
                movieView.setFixedHeight(130);
                movieView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                movieView.setContentsMargins(0, 0, 0, 0);
                movieView.scaledContents = true;
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
                        'prompt': this.items[i].prompt,
                        'object_url': null,
                        'errorMessage': this.items[i].errorMessage
                    });
                }.bind(this));

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

            this.gridLayout.addWidgetWithSpan(frame, i / COLUMN_SIZE, i % COLUMN_SIZE, 1, 1, Ui.Alignment.AlignTop);
            this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 152);
            this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 152);

            if (item.state == 'SUCCESS') {
                statusLabel.text = '';
            } else if (item.state == 'QUEUED') {
                statusLabel.text = 'Queued';
            } else if (item.state !== 'FAILED' && item.state !== 'UNSAFE' && item.state !== "CANCELED") {
                statusLabel.text = Math.round(item.progressPercent) + '%';
            }

            if (item.state == 'FAILED' || item.state == 'UNSAFE' || item.state == "CANCELED") {
                this.showFailed(i);
            } else if (this.items[i].state == 'SUCCESS') {
                const requestToken = this.requestTokenManager.generateToken();
                this.downloadAssetPreview(i, requestToken);
            }

        }

        this.renderedViews = startSize + items.length;

        // this needed if row isn't full, then items showed properly aligned to the left side
        if (this.renderedViews % COLUMN_SIZE != 0) {
            for (let i = this.renderedViews; i < this.renderedViews + (COLUMN_SIZE - this.renderedViews % COLUMN_SIZE); i++) {
                this.gridLayout.setColumnMinimumWidth(i % COLUMN_SIZE, 152);
                this.gridLayout.setRowMinimumHeight(i / COLUMN_SIZE, 152);
            }
        }

        this.updateAllStatuses();
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
                        app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
                    }

                    try {
                        this.updateView(body.items, exclude_ids);
                    } catch (error) {
                        app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
                    }

                    this.nextPageToken = body.nextPageToken;
                } else {
                    app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
                }
            }
        });
    }

    expandGallery() {
        app.log('', { 'enabled': false });

        if (this.nextPageToken) {
            const requestToken = this.requestTokenManager.generateToken();

            listAssets(15, (response) => {
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
                            app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
                        }

                        try {
                            this.updateView(body.items, []);
                        } catch (error) {
                            app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
                        }

                        this.nextPageToken = body.nextPageToken;
                    } else {
                        app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
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
                        app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
                    }

                    try {
                        this.updateView(body.items, []);
                    } catch (error) {
                        app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
                    }

                    this.nextPageToken = body.nextPageToken;
                } else {
                    app.log('Something went wrong during downloading Gaussian Splatting assets. Please, try again.');
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
        this.emptyPlaceholder.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.emptyPlaceholder.setFixedWidth(480);
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

        this.disclaimer.text = "<center>You don’t have any Gaussian Splatting Assets yet,<br>try to create a new one.<center>";

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

        layout.setContentsMargins(Ui.Sizes.HalfPadding, 0, Ui.Sizes.DoublePadding, 0);
        layout.addWidget(this.reloadButton);
        layout.addWidget(this.searchLine);

        widget.layout = layout;
        return widget;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(480);
        this.widget.setFixedHeight(620);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);

        this.layout.addWidget(this.createHeader(this.widget));
        this.layout.addWidget(this.createGalleryGrid(this.widget));

        this.layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, 0);
        this.widget.layout = this.layout;

        return this.widget;
    }
};
