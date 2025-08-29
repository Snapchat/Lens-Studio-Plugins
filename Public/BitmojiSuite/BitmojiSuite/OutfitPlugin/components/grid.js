import * as Ui from "LensStudio:Ui";
import { WidgetFactory } from "../../WidgetFactory.js";
import { EventDispatcher } from "../../EventDispatcher.js";

export class Grid extends EventDispatcher {
    constructor(parent, minTileWidth = 70, maxTileWidth = 120, aspectRatio = 1) {
        super();

        this.minTileWidth = minTileWidth;
        this.maxTileWidth = maxTileWidth;
        this.minTileHeight = minTileWidth * aspectRatio;
        this.tileAspect = this.minTileHeight / this.minTileWidth;
        this.__tiles__ = [];

        this.aspectRatio = aspectRatio;

        this.widget = WidgetFactory.beginWidget(parent)
            .sizePolicy(Ui.SizePolicy.Policy.Expanding)
            .contentsMargings(0)
            .minimumWidth(this.minTileWidth)
            .minimumHeight(this.minTileHeight)
            .end();

        this.gridWidget = WidgetFactory.beginWidget(this.widget).sizePolicy(Ui.SizePolicy.Policy.Expanding).end();

        this.gridLayout = WidgetFactory.beginGridLayout().spacing(0).contentsMargings(0).end();
        this.gridWidget.layout = this.gridLayout;

        this.scrollArea = new Ui.VerticalScrollArea(this.widget);
        this.scrollArea.setWidget(this.gridWidget);

        this.scrollArea.onValueChange.connect((value) => {
            this.dispatchEvent({ type: Grid.ScrollValueChanged, value: value / this.scrollArea.maximum });
        });

        this.widget.onResize.connect((width, height) => {
            this.arrangeLayout();
        });

        this.spacer = WidgetFactory.beginSpacer(this.gridWidget).sizePolicy(Ui.SizePolicy.Policy.Expanding).end();
        this.widget.layout = WidgetFactory.beginVerticalLayout().contentsMargings(0).addWidget(this.scrollArea).end();
    }
    set tiles(tiles) {
        this.__tiles__ = tiles;
        this.arrangeLayout();
    }
    get tiles() {
        return this.__tiles__;
    }
    arrangeLayout() {
        const galleryWidth = this.widget.width;
        const tileMinWidth = this.minTileWidth;
        const tilesPerRow = (galleryWidth >= tileMinWidth) ?
            Math.floor(galleryWidth / tileMinWidth) :
            1;
        const tileWidth = (tilesPerRow <= this.tiles.length) ?
            (Math.floor(galleryWidth / tilesPerRow)) :
            Math.min(Math.floor(galleryWidth / this.tiles.length), this.maxTileWidth);
        const tileHeight = tileWidth * this.tileAspect;
        this.gridLayout.clear(Ui.ClearLayoutBehavior.KeepClearedWidgets);
        let row = 0, col = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            if (col === 0) {
                this.gridLayout.setRowStretch(row, 0);
            }
            const tile = this.tiles[i];
            tile.widget.setFixedWidth(tileWidth);
            tile.widget.setFixedHeight(tileHeight);

            this.gridLayout.addWidgetAt(tile.widget, row, col, Ui.Alignment.AlignCenter);

            col++;
            if (col >= tilesPerRow) {
                col = 0;
                row++;
            }
        }
        this.gridLayout.addWidgetAt(this.spacer, row, col, Ui.Alignment.Default);
        this.gridLayout.setRowStretch(row + 1, 1);
    }
}
Grid.ScrollValueChanged = Symbol("ScrollValueChanged");
