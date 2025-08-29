import * as Ui from 'LensStudio:Ui';
import app from "../application/app.js";

export class AnimationSelection {
    constructor(parent) {
        this.parent = parent;
        this.mWidget = new Ui.Widget(parent);
        this.mWidget.setSizePolicy(Ui.SizePolicy.Policy.Maximum, Ui.SizePolicy.Policy.Minimum);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.mControl = new Selector(this.mWidget);

        layout.setContentsMargins(16, 10, 0, 0);
        layout.addWidget(this.mControl.widget);

        this.mWidget.layout = layout;
    }

    newSearchRequest(text) {
        this.mControl.resetGallery();
        this.mControl.resetScrollView();
        this.mControl.searchRequest(text);
    }

    addAnimationToLibrary(name, animDescription, id, callback) {
        this.mControl.addItem(name, animDescription, id, callback);
    }

    setSelectedLibraryItem(id, isBlended) {
        this.mControl.onClicked(id, isBlended);
    }

    addMovie(id, path) {
        this.mControl.addMovie(id, path);
    }

    get widget() {
        return this.mWidget;
    }

    getEntryId(libraryId) {
        return this.mControl.getEntryId(libraryId);
    }
}

const TILE_WIDTH = 90;
const TILE_HEIGHT = 112;

class Selector {
    constructor(parent, maxRowItems = 3) {
        this.maxRowItems = maxRowItems;
        this.prevSelectedId = -1;

        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.grid = new Ui.GridLayout();
        this.grid.spacing = 0;
        this.grid.setContentsMargins(0, 0, 8, 0);

        for (let i = 0; i < 9; i++) {
            this.grid.setColumnMinimumWidth(i % this.maxRowItems, TILE_WIDTH + 8);
            this.grid.setRowMinimumHeight(i / this.maxRowItems, TILE_HEIGHT + 8);
        }

        this.scrollWidget = new Ui.Widget(this.widget);
        this.scrollWidget.layout = this.grid;
        this.verticalScrollArea = new Ui.VerticalScrollArea(this.widget);
        this.verticalScrollArea.setWidget(this.scrollWidget);

        this.scrollLayout = new Ui.BoxLayout();
        this.scrollLayout.setDirection(Ui.Direction.TopToBottom);
        this.scrollLayout.addWidget(this.verticalScrollArea);
        this.scrollLayout.spacing = 0;
        this.scrollLayout.setContentsMargins(0, 0, 0, 0);

        this.widget.layout = this.scrollLayout;

        this.assetIdToTile = {};
        this.tiles = [];

        this.defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/tile_default.svg'));
        this.selectedImage = new Ui.Pixmap(import.meta.resolve('./Resources/tile_selected.svg'));
        this.hoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/tile_hovered.svg'));

        this.connections = [];
    }

    addItem(name, description, assetId, callback) {
        const id = this.tiles.length;
        const tile = new Ui.ImageView(this.widget);
        tile.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        tile.setFixedHeight(TILE_HEIGHT);
        tile.setFixedWidth(TILE_WIDTH);

        const tile_bg = new Ui.ImageView(tile);
        tile_bg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        tile_bg.setFixedHeight(TILE_WIDTH);
        tile_bg.setFixedWidth(TILE_WIDTH);
        tile_bg.scaledContents = true;
        tile_bg.responseHover = true;
        tile_bg.setContentsMargins(0, 0, 0, 0);

        tile_bg.pixmap = this.defaultImage;

        const movieView = new Ui.MovieView(tile_bg);

        movieView.setFixedWidth(90);
        movieView.setFixedHeight(90);
        movieView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        movieView.setContentsMargins(2, 2, 2, 2);
        movieView.scaledContents = true;
        movieView.responseHover = true;

        const garment_label = new Ui.ClickableLabel(tile);
        garment_label.setFixedWidth(90);
        garment_label.text = name;

        garment_label.move(0, 98);

        this.tiles.push({
            "assetId" : assetId,
            "tile" : tile,
            "tile_bg": tile_bg,
            "movieView" : movieView,
            "moviePath" : null,
            "selected": false,
            "label": garment_label,
            "onSelectedCallback" : callback,
            "name": garment_label.text,
            "description" : description
        });

        this.assetIdToTile[assetId] = id;
        this.addToGallery(id, tile);

        this.connections.push(movieView.onClick.connect(() => {
            if (!app.getPluginStatus()) {
                app.log('Something went wrong, please try again.');
                return;
            }

            if (app.animationDialog.lbeIsBusy) {
                return;
            }
            if (id === this.prevSelectedId) {
                return;
            }
            app.animationDialog.setSelectedTransitionItem(id);
            this.onClicked(id);
        }));

        this.connections.push(movieView.onHover.connect((hovered) => {
            movieView.animated = hovered;
            if (!this.tiles[id].selected) {
                if (hovered && !app.animationDialog.lbeIsBusy) {
                    this.tiles[id].tile_bg.pixmap = this.hoveredImage;
                }
                else {
                    this.tiles[id].tile_bg.pixmap = this.defaultImage;
                }
            }
        }));
    }

    onClicked(id, isBlended) {
        if (this.prevSelectedId !== -1) {
            this.tiles[this.prevSelectedId].selected = false;
            this.tiles[this.prevSelectedId].tile_bg.pixmap = this.defaultImage;
        }
        if ((typeof id) === "string") {
            this.prevSelectedId = -1;
            app.animationDialog.setPreviewAssetId(null);
            if (isBlended) {
                return;
            }
            app.animationDialog.sendMessage(JSON.stringify({status : "start_loading"}));
            app.animationDialog.animationImport.showLocalFile(id);
            app.animationDialog.setSelectedStatus(true, id);
            return;
        }
        if (id === -1) {
            this.prevSelectedId = -1;
            app.animationDialog.setPreviewAssetId(null);
            app.animationDialog.sendMessage(JSON.stringify({status: "hide"}));
            return;
        }
        if (id !== this.prevSelectedId) {
            app.animationDialog.setPreviewAssetId(null);
            app.animationDialog.sendMessage(JSON.stringify({status : "start_loading"}));
            this.tiles[id].selected = true;
            this.tiles[id].tile_bg.pixmap = this.selectedImage;
            this.prevSelectedId = id;
            this.tiles[id].onSelectedCallback();
            app.animationDialog.setSelectedStatus(true, id);
        }
        else {
            if (!isBlended) {
                app.animationDialog.setPreviewAssetId(null);
                app.animationDialog.sendMessage(JSON.stringify({status: "hide"}));
            }
            this.tiles[id].selected = false;
            this.prevSelectedId = -1;
            app.animationDialog.setSelectedStatus(false, id);
        }
    }

    addToGallery(id, tile) {
        this.grid.addWidgetWithSpan(tile, id / this.maxRowItems, id % this.maxRowItems, 1, 1, Ui.Alignment.AlignTop);
        this.grid.setColumnMinimumWidth(id % this.maxRowItems, TILE_WIDTH + 8);
        this.grid.setRowMinimumHeight(id / this.maxRowItems, TILE_HEIGHT + 8);

        for (let i = 0; i < 3; i++) {
            this.grid.setColumnMinimumWidth(i, TILE_WIDTH + 8);
        }
        for (let i = 0; i < 3; i++) {
            this.grid.setRowMinimumHeight(i, TILE_HEIGHT + 8);
        }

        if (id < 9) {
            this.grid.setRowMinimumHeight(3, 16);
        }
    }

    addMovie(assetId, path) {
        const movie = new Ui.Movie(path);
        movie.resize(86, 86);
        this.tiles[this.assetIdToTile[assetId]].movieView.movie = movie;
        this.tiles[this.assetIdToTile[assetId]].movieView.visible = true;
        this.tiles[this.assetIdToTile[assetId]].moviePath = path;
    }

    searchRequest(text) {
        let id = -1;
        let _this = this;
        text = text.toLowerCase()
        let isExtraChar = this.checkForExtraChars(text);

        this.clearView();

        if (isExtraChar) {
            return;
        }

        this.tiles.forEach(function(tile) {
            if (text.length === 0 || tile.name.toLowerCase().search(text) !== -1 || tile.description.search(text) !== -1) {
                id++;
                tile.tile.visible = true;
                _this.addToGallery(id, tile.tile);
            }
        })
    }

    checkForExtraChars(text) {
        let isExtraChar = false;
        for (let i = 0; i < text.length; i++) {
            if ((text[i] < 'a' || text[i] > 'z') && text[i] !== ' ') {
                isExtraChar = true;
                break;
            }
        }

        return isExtraChar;
    }

    resetGallery() {
        this.tiles.forEach(function(tile) {
            tile.tile.visible = false;
        });
    }

    resetScrollView() {
        this.verticalScrollArea.blockSignals(true);
        this.verticalScrollArea.value = 0;
        this.verticalScrollArea.blockSignals(false);
    }

    clearView() {
        for (let i = 0; i < 9; i++) {
            this.grid.setColumnMinimumWidth(i % this.maxRowItems, TILE_WIDTH + 8);
            this.grid.setRowMinimumHeight(i / this.maxRowItems, TILE_HEIGHT + 8);
        }

        for (let i = 9; i < this.tiles.length; i++) {
            this.grid.setColumnMinimumWidth(i % this.maxRowItems, 0);
            this.grid.setRowMinimumHeight(i / this.maxRowItems, 0);
        }
    }

    getEntryId(libraryId) {
        return this.tiles[libraryId].assetId;
    }
}

export function createAnimationSelection(parent) {
    return new AnimationSelection(parent);
}
