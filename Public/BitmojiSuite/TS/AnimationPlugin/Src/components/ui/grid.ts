import * as Ui from "LensStudio:Ui";
import {Widget} from "../common/widgets/widget.js";
import {VerticalScrollArea} from "../common/widgets/verticalScrollArea.js";
import {GridLayout} from "../common/layouts/gridLayout.js";
import {BoxLayout} from "../common/layouts/boxLayout.js";
import {VBoxLayout} from "../common/layouts/vBoxLayout.js";
import {GridTile} from "./gridTile.js";

export class Grid extends Widget {
    private gridWidget: Widget;
    private gridLayout: GridLayout;
    private scrollArea: VerticalScrollArea;
    private minTileWidth: number;
    private maxTileWidth: number;
    private minTileHeight: number;
    private tileAspect: number;
    private allTiles: GridTile[];
    private visibleTiles: GridTile[];
    private spacer: Widget;
    private selectedId: number = -1;
    private searchText: string;
    private onScrollValueChangedCallback: Function =  () => {};

    constructor(parent: any, minTileWidth = 110, maxTileWidth = 220, minTileHeight = 160) {
        super(parent);
        this.minTileWidth = minTileWidth;
        this.maxTileWidth = maxTileWidth;
        this.minTileHeight = minTileHeight;
        this.tileAspect = this.minTileHeight / this.minTileWidth;
        this.allTiles = []
        this.visibleTiles = [];
        this.searchText = "";

        this.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.setContentsMargins(0, 0, 0, 0);
        this.setMinimumWidth(this.minTileWidth);
        this.setMinimumHeight(this.minTileHeight);
        const contentWidget = new Widget(this.__widget__);
        const contentLayout = new VBoxLayout();
        contentLayout.setContentsMargins(0, 0, 16, 16);
        contentWidget.layout = contentLayout;
        this.gridWidget = new Widget(contentWidget);
        contentLayout.addWidget(this.gridWidget);
        this.gridWidget.setSizePolicy(Ui.SizePolicy.Policy.Minimum, Ui.SizePolicy.Policy.Minimum);
        this.gridWidget.setContentsMargins(0, 0, 0, 0);
        this.gridLayout = new GridLayout();
        this.gridLayout.spacing = 8;
        this.gridLayout.setContentsMargins(0, 0, 0, 0);
        this.gridLayout.setLayoutAlignment(this.gridLayout, Ui.Alignment.AlignTop | Ui.Alignment.AlignLeft);
        this.gridWidget.layout = this.gridLayout;
        this.scrollArea = new VerticalScrollArea(this.toNativeWidget());
        this.scrollArea.setWidget(contentWidget);
        this.scrollArea.onValueChange.connect((value: any) => {
            (this.scrollArea.maximum === 0) ? this.onScrollValueChanged(0) : this.onScrollValueChanged(this.scrollArea.value / this.scrollArea.maximum);
        })
        const layout = new BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.setDirection(Ui.Direction.TopToBottom);
        this.onResize.connect((width: any, height: any) => {
            (this.scrollArea.maximum === 0) ? this.onScrollValueChanged(0) : this.onScrollValueChanged(this.scrollArea.value / this.scrollArea.maximum);
            this.arrangeLayout();
        });
        layout.addWidget(this.scrollArea);
        this.spacer = new Widget(this.gridWidget);
        this.spacer.setSizePolicy(Ui.SizePolicy.Policy.Expanding);
        this.layout = layout;
    }

    arrangeLayout() {
        const galleryWidth = this.width - 16;
        const tileMinWidth = this.minTileWidth;
        let tilesPerRow = 1;
        if (galleryWidth > tileMinWidth) {
            tilesPerRow = Math.floor(galleryWidth / (tileMinWidth + 8));
            if ((tilesPerRow + 1) * tileMinWidth + tilesPerRow * 8 <= galleryWidth) {
                tilesPerRow++;
            }
        }

        let tileWidth = this.clamp((galleryWidth - 8 * (tilesPerRow - 1)) / tilesPerRow, this.minTileWidth, this.maxTileWidth)
        const tileHeight = tileWidth * this.tileAspect;
        this.gridLayout.clear(Ui.ClearLayoutBehavior.KeepClearedWidgets);
        let row = 0, col = 0;
        for (let i = this.visibleTiles.length - 1; i >= 0; i--) {
            if (col === 0) {
                this.gridLayout.setRowStretch(row, 0);
            }
            const tile = this.visibleTiles[i];
            tile.setFixedWidth(tileWidth);
            tile.setFixedHeight(tileHeight);
            this.gridLayout.addWidgetAt(tile, row, col, Ui.Alignment.AlignCenter);
            col++;
            if (col >= tilesPerRow) {
                col = 0;
                row++;
            }
        }
        this.gridLayout.addWidgetAt(this.spacer, row, col, Ui.Alignment.Default);
        this.gridLayout.setRowStretch(row + 1, 1);
    }

    clearSelection() {
        if (this.selectedId > -1) {
            this.allTiles[this.selectedId].deselect();
            this.selectedId = -1;
        }
    }

    addTile(tile: GridTile) {
        this.allTiles.push(tile);
        if (this.shouldTileBeVisible(tile)) {
            this.visibleTiles.push(tile);
            this.arrangeLayout();
        }
    }

    private shouldTileBeVisible(tile: GridTile) {
        if (!tile.removed &&  (this.searchText === "" || tile.getDescription().toLowerCase().search(this.searchText) !== -1)) {
            return true;
        }

        return false;
    }

    private selectVisibleTiles() {
        this.visibleTiles = [];
        this.allTiles.forEach((tile: GridTile) => {
            if (this.shouldTileBeVisible(tile)) {
                tile.visible = true;
                this.visibleTiles.push(tile);
            }
            else {
                tile.visible = false;
            }
        })

        this.arrangeLayout();
        this.onScrollValueChanged(this.scrollArea.value / this.scrollArea.maximum);
    }

    setVisibleCnt(cnt: number) {
        this.visibleTiles = [];
        const to = Math.min(cnt, this.allTiles.length);
        this.allTiles.forEach((tile: GridTile, i) => {
            if (i < to) {
                tile.visible = true;
                this.visibleTiles.push(tile);
            }
            else {
                tile.visible = false;
            }
        })

        this.arrangeLayout();
        this.onScrollValueChanged(this.scrollArea.value / this.scrollArea.maximum);
    }

    selectTile(id: number) {
        this.selectedId = id;
        this.allTiles[this.selectedId].select();
    }

    addOnScrollValueChangedCallback(callback: Function) {
        this.onScrollValueChangedCallback = callback;
    }

    getAllTiles(): GridTile[] {
        return this.allTiles;
    }

    getVisibleTiles(): GridTile[] {
        return this.visibleTiles;
    }

    onSearchTextChanged(newSearchText: string) {
        this.searchText = newSearchText;
        this.selectVisibleTiles();
    }

    onTileRemoved() {
        this.selectVisibleTiles();
    }

    resetScroll() {
        this.scrollArea.value = 0;
        this.onScrollValueChanged(0);
    }

    private onScrollValueChanged(value: number) {
        this.onScrollValueChangedCallback(value);
    }

    private clamp(val: number, min: number, max: number) {
        return Math.max(Math.min(val, max), min);
    }
}
