import * as Ui from 'LensStudio:Ui';

import { Control } from './Control.js';
import { createErrorIcon } from './utils.js';

export class IconSelection extends Control {
    constructor(parent, label, valueImporter, valueExporter, hint, defaultValue, size) {
        super(parent, label, valueImporter, valueExporter, hint, defaultValue);

        this.mControl = new Selector(this.widget);
        this.widget.setContentsMargins(0, Ui.Sizes.Padding, 0, Ui.Sizes.Padding);
        this.widget.setMinimumHeight(TILE_HEIGHT);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        for (let i = 0; i < size; i++) {
            this.mControl.addItem();
        }

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);

        layout.addWidget(this.mControl.widget);
        layout.setWidgetAlignment(this.mControl.widget, Ui.Alignment.AlignCenter);

        this.loading = new Ui.ProgressIndicator(this.widget);
        this.loading.start();
        this.loading.visible = false;
        this.loading.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        layout.addStretch(0);
        layout.addWidget(this.loading);

        layout.setWidgetAlignment(this.loading, Ui.Alignment.AlignCenter);

        this.errorWidget = new Ui.Widget(this.widget);
        const errorLayout = new Ui.BoxLayout();
        errorLayout.setDirection(Ui.Direction.TopToBottom);

        const header = new Ui.Widget(this.errorWidget);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(0, 0, 0, 0);

        const icon = createErrorIcon(header);
        const headerLabel = new Ui.Label(header);

        headerLabel.text = 'Generation Failed';
        headerLabel.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addWidget(icon);
        headerLayout.addWidget(headerLabel);

        header.layout = headerLayout;

        errorLayout.addStretch(0);
        errorLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

        this.errorMessageLabel = new Ui.Label(this.errorWidget);
        this.errorMessageLabel.openExternalLinks = true;
        errorLayout.addWidgetWithStretch(this.errorMessageLabel, 0, Ui.Alignment.AlignCenter);
        errorLayout.addStretch(0);

        this.errorWidget.layout = errorLayout;

        layout.addWidget(this.errorWidget);
        layout.addStretch(0);

        layout.setWidgetAlignment(this.errorWidget, Ui.Alignment.AlignCenter);

        this.mWidget.layout = layout;

        this.iconPixmaps = {};
        this.iconBytes = {};
    }

    setImage(index, pixmap, bytes) {
        this.iconPixmaps[index] = pixmap;
        this.iconBytes[index] = bytes;
        this.loading.visible = false;
        this.errorWidget.visible = false;
        this.mControl.setPixmap(index, pixmap);
    }

    getPixmap(index) {
        return this.iconPixmaps[index];
    }

    getBytes(index) {
        return this.iconBytes[index];
    }

    reset() {
        this.mControl.reset();
        super.reset();
        this.errorWidget.visible = false;
        this.loading.visible = true;
    }

    throwError(error) {
        this.mControl.reset();
        super.reset();
        this.loading.visible = false;
        this.errorMessageLabel.text = error.message;
        this.errorWidget.visible = true;
    }

    set value(value) {
        this.mControl.select(value);
    }

    get value() {
        return this.mControl.currentIndex();
    }

    addOnValueChanged(cb) {
        this.mControl.addOnValueChanged(cb);
    }
}

const PREIVEW_HEIGHT = 100;
const PREVIEW_WIDTH = 100;

const TILE_WIDTH = 118;
const TILE_HEIGHT = 118;

class Selector {
    constructor(parent, maxRowItems = 4) {
        this.maxRowItems = maxRowItems;

        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        this.widget.setContentsMargins(0, 0, 0, 0);

        this.grid = new Ui.GridLayout();

        this.grid.setContentsMargins(0, 0, 0, 0);

        this.widget.layout = this.grid;

        this.tiles = [];
        this.itemSettings = [];

        this.nameToId = {};

        this.hoverImage = new Ui.Pixmap(import.meta.resolve('./Resources/tile_hovered_state.svg'));
        this.defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/tile_default_state.svg'));
        this.selectedImage = new Ui.Pixmap(import.meta.resolve('./Resources/tile_checked_state.svg'));

        this.current_selected = null;

        this.onValueChangedCallbackList = [];
    }

    addOnValueChanged(cb) {
        this.onValueChangedCallbackList.push(cb);
    }

    reset() {
        this.tiles.forEach((tile) => {
            tile.tile_bg.visible = false;
        });
    }

    setPixmap(index, pixmap) {
        this.tiles[index].icon_image.pixmap = pixmap;
        this.tiles[index].tile_bg.visible = true;
    }

    addItem() {
        const id = this.tiles.length;

        const tile_bg = new Ui.ImageView(this.widget);
        tile_bg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        tile_bg.setContentsMargins(0, 0, 0, 0);
        tile_bg.setFixedHeight(TILE_HEIGHT);
        tile_bg.setFixedWidth(TILE_WIDTH);
        tile_bg.scaledContents = true;
        tile_bg.responseHover = true;

        tile_bg.pixmap = this.defaultImage;
        tile_bg.visible = false;

        const icon_image = new Ui.ImageView(tile_bg);
        icon_image.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        icon_image.setFixedHeight(PREIVEW_HEIGHT);
        icon_image.setFixedWidth(PREVIEW_WIDTH);
        icon_image.scaledContents = true;
        icon_image.radius = PREVIEW_WIDTH * (4 / this.widget.devicePixelRatio);
        icon_image.move((TILE_WIDTH - PREVIEW_WIDTH) / 2, (TILE_HEIGHT - PREIVEW_HEIGHT) / 2);

        this.tiles.push({
            "tile_bg": tile_bg,
            "selected": false,
            "icon_image": icon_image
        });

        const i = Math.floor(id / this.maxRowItems);
        const j = Math.floor(id % this.maxRowItems);

        this.grid.addWidgetAt(tile_bg, i, j, Ui.Alignment.AlignLeft);

        this.tiles[id].tile_bg.onHover.connect((hovered) => {
            if (!this.tiles[id].selected) {
                if (hovered) {
                    this.tiles[id].tile_bg.pixmap = this.hoverImage;
                } else {
                    this.tiles[id].tile_bg.pixmap = this.defaultImage;
                }
            }
        });

        [tile_bg, icon_image].forEach((item) => {
            item.onClick.connect(() => {
                if (!this.tiles[id].selected) {
                    this.select(id);
                }
            });
        });
    }

    currentIndex() {
        return this.current_selected;
    }

    select(idx) {
        this.current_selected = idx;

        for (let i = 0; i < this.tiles.length; i++) {
            if (idx == i) {
                this.tiles[i].selected = true;
                this.tiles[i].tile_bg.pixmap = this.selectedImage;
            } else {
                this.tiles[i].selected = false;
                this.tiles[i].tile_bg.pixmap = this.defaultImage;
            }
        }

        this.onValueChangedCallbackList.forEach((cb) => cb(this.currentIndex()));
    }
}

export function createIconSelection(scheme) {
    return new IconSelection(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.hint, scheme.default_value, scheme.size);
}
