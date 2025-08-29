import { Grid } from '../../components/grid.js';
import { GridTile } from '../../components/gridTile.js';
import * as Ui from 'LensStudio:Ui';
import { EventDispatcher } from '../../../EventDispatcher.js';
import { WidgetFactory } from '../../../WidgetFactory.js';

export class Gallery extends EventDispatcher {
    constructor(parent, provider, bitmojiPreviewProvider, aspectRatio) {
        super();

        this.contentType = provider.contentType;
        this.provider = provider;
        this.bitmojiPreviewProvider = bitmojiPreviewProvider;
        this.aspectRatio = aspectRatio;

        this.widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding).end();

        this.grid = new Grid(this.widget, 120, 140, aspectRatio);

        this.grid.addEventListener(Grid.ScrollValueChanged, ({value}) => {
            if (value == 1) {
                this.appendItems();
            }
        });

        this.widget.layout = WidgetFactory.beginVerticalLayout().contentsMargings(0).addWidget(this.grid.widget).end();

        this.inited = false;
        this.selectedData = null;
        this.selectedTile = null;

        this.pageSize = 35;

        // to-do: add cancelation mechanism to lbe requests
        this.isBusy = false;
    }

    setBusy(isBusy) {
        this.isBusy = isBusy;
    }

    updateBitmojiProvider(bitmojiPreviewProvider) {
        this.bitmojiPreviewProvider = bitmojiPreviewProvider;
        this.grid.tiles.forEach((tile) => {
            tile.updateProvider(bitmojiPreviewProvider);
        });
    }

    createTile(item) {
        const tile = new GridTile(this.grid.widget, this.bitmojiPreviewProvider, this.aspectRatio);
        tile.data = item;
        tile.addEventListener(GridTile.Clicked, ({data}) => {
            if (this.isBusy) {
                return;
            }

            const wasSelected = tile.selected;
            this.unselectAll();
            if (!wasSelected) {
                tile.selected = true;
                this.selectedData = data;
                this.selectedTile = tile;
            } else {
                this.selectedData = null;
                this.selectedTile = null;
            }

            this.onItemSelected();
        });

        return tile;
    }

    init() {
        if (this.inited) {
            return;
        }

        this.provider.pullPages(this.pageSize).then((data) => {
            const tiles = [];
            data.items.forEach((item) => {
                tiles.push(this.createTile(item));
            });

            this.grid.tiles = tiles;
            this.inited = true;
        });
    }

    appendItems() {
        this.provider.pullPages(this.pageSize).then((data) => {
            const tiles = this.grid.tiles;
            data.items.forEach((item) => {
                tiles.push(this.createTile(item));
            });

            this.grid.tiles = tiles;
        });
    }

    getCurrentModel() {
        return this.selectedData;
    }

    refresh() {
        if (this.selectedTile) {
            this.selectedTile.refresh();
        }
    }

    onItemSelected() {
        this.dispatchEvent({ type: Gallery.ItemSelected, data: this.selectedData });
    }

    deinit() {
        this.unselectAll();
        this.dispatchEvent({ type: Gallery.ItemSelected, data: null });
    }

    unselectAll() {
        this.selectedData = null;
        this.grid.tiles.forEach((tile) => {
            tile.selected = false;
        });
    }
}

Gallery.ItemSelected = "ItemSelected";
Gallery.ScrollValueChanged = "ScrollValueChanged";
