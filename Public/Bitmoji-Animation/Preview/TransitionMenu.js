import * as Ui from 'LensStudio:Ui';
import * as FileSystem from 'LensStudio:FileSystem';
import app from "../application/app.js";

let _this = null;

export class TransitionMenu {
    constructor(onSelectionChangedCallback) {
        _this = this;
        this.onSelectionChangedCallback = onSelectionChangedCallback;
        this.tiles = [];
        this.TILE_WIDTH = 66;
        this.TILE_HEIGHT = 30;
        this.maxWidth = 440;
        this.connections = [];
        this.selectionId = -1;
        this.maxItemsCnt = 5;
        this.visibleItemsCnt = 0;
        this.prevSelectedId = -1;
        this.combinedTile = null;
        this.visibleIds = [];
        this.connections = [];
        this.combinedBackgrounds = [];

        this.tempDir = FileSystem.TempDir.create();

        this.defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/s_tile_default.svg'));
        this.selectedImage = new Ui.Pixmap(import.meta.resolve('./Resources/s_tile_selected.svg'));
        this.transparentImage = new Ui.Pixmap(import.meta.resolve('./Resources/transparent.png'));

        this.addButtonDefaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/add.svg'));
        this.addButtonHoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/add_hovered.svg'));

        this.combinedBackgrounds.push(new Ui.Pixmap(import.meta.resolve('./Resources/s_tile_selected.svg')));
        this.combinedBackgrounds.push(new Ui.Pixmap(import.meta.resolve('./Resources/s_tile_selected_2.svg')));
        this.combinedBackgrounds.push(new Ui.Pixmap(import.meta.resolve('./Resources/s_tile_selected_3.svg')));
        this.combinedBackgrounds.push(new Ui.Pixmap(import.meta.resolve('./Resources/s_tile_selected_4.svg')));
        this.combinedBackgrounds.push(new Ui.Pixmap(import.meta.resolve('./Resources/s_tile_selected_5.svg')));
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.addButton = new Ui.ImageView(this.widget);
        this.addButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.addButton.setFixedHeight(28);
        this.addButton.setFixedWidth(28);

        this.addButton.scaledContents = true;
        this.addButton.pixmap = this.addButtonDefaultImage;
        this.addButton.visible = false;
        this.addButton.responseHover = true;

        app.animationDialog.addOnLbeStartedCallback(() => {
            this.addButton.visible = false;
        })

        app.animationDialog.addOnLbeFinishedCallback(() => {
            if (!this.isBlended && this.tiles[this.visibleIds[this.visibleIds.length - 1]].libraryId !== -1) {
                this.addButton.visible = true;
            }
        })

        this.connections.push(this.addButton.onClick.connect(() => {
            if (app.animationDialog.lbeIsBusy) {
                return;
            }
            this.addButton.visible = false;
            const curId = this.getId();
            this.addItem(curId);
            app.animationDialog.setSelectedLibraryItem(-1);
        }));

        this.connections.push(this.addButton.onHover.connect((hovered) => {
            if (hovered) {
                this.addButton.pixmap = this.addButtonHoveredImage;
            }
            else {
                this.addButton.pixmap = this.addButtonDefaultImage;
            }
        }));


        this.grid = new Ui.GridLayout();
        this.grid.setContentsMargins(20, 0, 20, 0);

        this.grid.addWidgetAt(this.addButton, 0, 0, Ui.Alignment.AlignLeft)
        this.grid.setColumnMinimumWidth(0, 28 + this.grid.spacing);
        this.grid.setColumnMinimumWidth(1, this.maxWidth);

        this.widget.layout = this.grid;

        for (let i = 0; i < this.maxItemsCnt; i++) {
            this.createItem();
        }

        this.addItem(0);

        return this.widget;
    }

    createItem() {
        const id = this.tiles.length;
        const tile_bg = new Ui.ImageView(this.widget);
        tile_bg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        tile_bg.setFixedHeight(this.TILE_HEIGHT);
        tile_bg.setFixedWidth(this.TILE_WIDTH);

        tile_bg.pixmap = this.defaultImage;
        tile_bg.scaledContents = true;

        const tileLayout = new Ui.BoxLayout();
        tileLayout.setDirection(Ui.Direction.TopToBottom);
        tileLayout.setContentsMargins(0, 0, 0, 0);

        const imageView = new Ui.ImageView(this.widget);
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        imageView.setFixedHeight(this.TILE_HEIGHT - 2);
        imageView.setFixedWidth(this.TILE_WIDTH - 2);
        imageView.scaledContents = true;
        imageView.responseHover = true;

        tileLayout.addWidgetWithStretch(imageView, 0, Ui.Alignment.AlignCenter);

        tile_bg.layout = tileLayout;

        this.tiles.push({
            "id" : id,
            "tile_bg": tile_bg,
            "imageView" : imageView,
            "libraryId" : -1,
            "isBlended" : false,
            "assetPath" : null,
            "gridPos" : id,
            "selected": false
        });

        tile_bg.visible = false;

        this.connections.push(imageView.onClick.connect(() => {
            if (app.animationDialog.lbeIsBusy) {
                return;
            }

            if (id === this.prevSelectedId) {
                return;
            }
            this.onClicked(id);
            app.animationDialog.setSelectedLibraryItem(this.tiles[id].libraryId);
        }));
    }

    onClicked(id) {
        if (this.prevSelectedId !== -1) {
            this.tiles[this.prevSelectedId].selected = false;
            this.tiles[this.prevSelectedId].tile_bg.pixmap = this.defaultImage;
        }
        if (id !== this.prevSelectedId) {
            this.tiles[id].selected = true;
            this.tiles[id].tile_bg.pixmap = this.selectedImage;
            this.prevSelectedId = id;
            this.onSelectionChangedCallback(true);
        }
        else {
            this.tiles[id].selected = false;
            this.prevSelectedId = -1;
        }
    }

    setSelectedTransitionItem(id) {
        return;
        let foundId = false;
        for (let i = 0; i < this.maxItemsCnt; i++) {
            if (this.tiles[i].tile_bg.visible && this.tiles[i].libraryId === id) {
                foundId = true;
                this.onClicked(i);
            }
        }

        if (!foundId && this.prevSelectedId !== -1) {
            this.onClicked(this.prevSelectedId);
        }
    }

    addItem(id) {

        if (this.visibleItemsCnt >= this.maxWidth) {
            return;
        }

        this.tiles[id].tile_bg.visible = true;
        this.visibleIds.push(id);
        this.tiles[id].gridPos = this.visibleItemsCnt;

        this.grid.addWidgetAt(this.tiles[id].tile_bg, 0, this.visibleItemsCnt, Ui.Alignment.AlignLeft)
        this.grid.setColumnMinimumWidth(this.visibleItemsCnt, this.TILE_WIDTH + this.grid.spacing);

        this.visibleItemsCnt++;

        if (this.visibleItemsCnt < this.maxItemsCnt) {
            this.grid.addWidgetAt(this.addButton, 0, this.visibleItemsCnt, Ui.Alignment.AlignLeft)
            this.grid.setColumnMinimumWidth(this.visibleItemsCnt - 1, 28 + this.grid.spacing);
        }
        this.grid.setColumnMinimumWidth(this.visibleItemsCnt, this.maxWidth);
        this.onClicked(id);
    }

    addCombinedItem() {
        const curVisibleIds = this.getVisibleIds();

        if (this.prevSelectedId !== -1) {
            app.animationDialog.setSelectedLibraryItem(this.tiles[this.prevSelectedId].libraryId, true);
        }

        this.clearGrid();
        const tile_bg = new Ui.ImageView(this.widget);
        tile_bg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        tile_bg.setFixedHeight(this.TILE_HEIGHT);
        tile_bg.setFixedWidth(this.TILE_WIDTH * curVisibleIds.length + 6 * (curVisibleIds.length - 1));

        tile_bg.pixmap = this.combinedBackgrounds[curVisibleIds.length - 1];
        tile_bg.scaledContents = true;
        tile_bg.visible = true;

        const tileLayout = new Ui.BoxLayout();
        tileLayout.setDirection(Ui.Direction.LeftToRight);
        tileLayout.setContentsMargins(1, 0, 0, 0);

        curVisibleIds.forEach((id) => {
            const imageView = new Ui.ImageView(this.widget);
            imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

            imageView.setFixedHeight(this.TILE_HEIGHT - 2);
            imageView.setFixedWidth(this.TILE_WIDTH - 2);
            imageView.scaledContents = true;
            imageView.responseHover = true;

            imageView.pixmap = this.tiles[id].imageView.pixmap;

            tileLayout.addWidgetWithStretch(imageView, 0, Ui.Alignment.AlignLeft);

            _this.tiles[id].tile_bg.visible = false;
            _this.tiles[id].imageView.pixmap = this.transparentImage;
            _this.tiles[id].libraryId = -1;
            _this.tiles[id].assetId = -1;
        })

        tile_bg.layout = tileLayout;

        this.combinedTile = {
            "tile_bg": tile_bg,
            "assetPath" : null
        }

        this.grid.addWidgetAt(tile_bg, 0, this.visibleItemsCnt, Ui.Alignment.AlignLeft)
    }

    clearGrid() {
        _this.visibleIds = [];
        _this.visibleItemsCnt = 0;
        _this.prevSelectedId = -1;
        _this.selectionId = -1;

        _this.tiles.forEach(function (tile, i) {
            tile.tile_bg.visible = false;
            tile.libraryId = -1;
            tile.assetId = -1;
        })

        _this.onSelectionChangedCallback(false);
    }

    removeItem(isImported) {
        if (_this.isBlended) {
            _this.combinedTile.tile_bg.visible = false;
            _this.onSelectionChangedCallback(false);
            _this.grid.addWidgetAt(_this.addButton, 0, 0, Ui.Alignment.AlignLeft)
            _this.grid.setColumnMinimumWidth(0, _this.maxWidth);
            _this.addItem(0);
            app.animationDialog.setSelectedLibraryItem(-1);
            app.animationDialog.setPreviewAssetId(null);
            app.animationDialog.sendMessage(JSON.stringify({status: "hide"}), false, false);
            app.log('Animation is ready', { 'enabled': false, 'progressBar': false });
            app.animationDialog.setLbeStatus(false);
            return;
        }

        if (isImported) {
            if (_this.visibleItemsCnt === 2) {
                _this.prevSelectedId = _this.visibleIds[_this.visibleItemsCnt - 2];
            }
        }

        _this.tiles[_this.prevSelectedId].tile_bg.visible = false;
        _this.tiles[_this.prevSelectedId].imageView.pixmap = this.transparentImage;
        _this.tiles[_this.prevSelectedId].libraryId = -1;
        _this.tiles[_this.prevSelectedId].assetId = -1;

        let visibleCnt = 0;
        _this.visibleIds = [];

        _this.tiles.forEach(function (tile, i) {
            if (tile.tile_bg.visible) {
                _this.visibleIds.push(i);
                const curGridPos = tile.gridPos - (tile.gridPos > _this.tiles[_this.prevSelectedId].gridPos);
                _this.grid.addWidgetAt(tile.tile_bg, 0, curGridPos, Ui.Alignment.AlignLeft);
                tile.gridPos = curGridPos;
                visibleCnt++;
            }
        })

        _this.visibleIds.sort((a, b) => {
            if (_this.tiles[a].gridPos === _this.tiles[b].gridPos) {
                return 0;
            }

            if (_this.tiles[a].gridPos > _this.tiles[b].gridPos) {
                return 1;
            }

            return -1;
        });

        if (this.selectionId !== -1) {
            _this.grid.addWidgetAt(_this.addButton, 0, visibleCnt, Ui.Alignment.AlignLeft)
            _this.grid.setColumnMinimumWidth(visibleCnt, 28 + _this.grid.spacing);
        }

        _this.grid.setColumnMinimumWidth(visibleCnt, _this.maxWidth);

        _this.prevSelectedId = -1;
        _this.visibleItemsCnt = visibleCnt;

        if (isImported) {
            if (_this.visibleItemsCnt === 0) {
                _this.addItem(0);
            }
            else {
                this.onClicked(_this.visibleIds[0]);
            }
            app.animationDialog.setSelectedLibraryItem(-1);
            app.animationDialog.setPreviewAssetId(null);
            app.animationDialog.sendMessage(JSON.stringify({status: "hide"}), false, false);
            app.animationDialog.setLbeStatus(false);
            this.onSelectionChangedCallback(true);
            return;
        }

        this.onClicked(_this.visibleIds[visibleCnt - 1]);
        app.animationDialog.setSelectedLibraryItem(_this.tiles[_this.visibleIds[visibleCnt - 1]].libraryId);
    }

    getId() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i].tile_bg.visible) {
                return i;
            }
        }

        return -1;
    }

    addIcon(id, encodedTexture) {
        const filePath = this.tempDir.path + "/icon" + id + ".png";
        FileSystem.writeFile(filePath, Base64.decode(encodedTexture));
        if (this.tiles[id] && this.tiles[id].imageView) {
            this.tiles[id].imageView.pixmap = new Ui.Pixmap(filePath);
        }
    }

    setSelectedStatus(isSelected, id) {
        this.addButton.visible = isSelected && !app.animationDialog.lbeIsBusy;
        this.selectionId = isSelected ? id : -1;
        this.tiles[this.prevSelectedId].libraryId = id;
        this.onSelectionChangedCallback(true);
    }

    getTransitionTexture() {
        app.animationDialog.sendMessage(JSON.stringify({status : "get_transition_texture", id : this.prevSelectedId}), false, false);
    }

    getLibraryId() {
        return this.tiles[this.prevSelectedId].libraryId;
    }

    getVisibleItemsCount() {
        return _this.visibleItemsCnt;
    }

    getEnabledAnimationCount() {
        let cnt = 0;
        this.tiles.forEach((tile) => {
            if (tile.tile_bg.visible && tile.libraryId !== -1) {
                cnt++;
            }
        })

        return cnt;
    }

    setBlendedData(path) {
        _this.combinedTile.assetPath = path;
    }

    getVisibleIds() {
        let ids = [];
        this.visibleIds.forEach((i) => {
            if (_this.tiles[i].tile_bg.visible && _this.tiles[i].libraryId !== -1) {
                ids.push(i);
            }
        })

        return ids;
    }

    getVisibleLibraryIds() {
        let ids = [];
        this.visibleIds.forEach((i) => {
            if (_this.tiles[i].tile_bg.visible && _this.tiles[i].libraryId !== -1) {
                ids.push(_this.tiles[i].libraryId);
            }
        })

        return ids;
    }

    get assetPath() {
        if (_this.combinedTile && _this.combinedTile.tile_bg.visible) {
            return _this.combinedTile.assetPath;
        }
        return _this.tiles[_this.prevSelectedId].assetPath;
    }

    get isBlended() {
        return _this.combinedTile && _this.combinedTile.tile_bg.visible;
    }

    get isSelectedItem() {
        return this.prevSelectedId !== -1;
    }
}
