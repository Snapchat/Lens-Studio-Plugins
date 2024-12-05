import * as Ui from 'LensStudio:Ui';

import { Control } from './Control.js';

export class ClothSelection extends Control {
    constructor(parent, label, valueImporter, valueExporter, options, hint, defaultValue) {
        super(parent, label, valueImporter, valueExporter, hint, defaultValue);

        this.mControl = new Selector(this.widget);

        options.forEach((optionSettings) => {
            this.mControl.addItem(optionSettings);
        });

        const layout = Ui.BoxLayout.create();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, Ui.Sizes.Padding);

        layout.addWidget(this.mLabelBox);
        layout.addWidget(this.mControl.widget);

        this.mWidget.layout = layout;
    }

    reset() {
        super.reset();
    }

    set value(value) {
        this.mControl.selectByName(value);
    }

    get value() {
        return this.mControl.currentName();
    }

    addOnValueChanged(cb) {
        this.mControl.addOnValueChanged(cb);
    }
}

const PREIVEW_HEIGHT = 85;
const PREVIEW_WIDTH = 86;

const TILE_WIDTH = 90;
const TILE_HEIGHT = 116;

class Selector {
    constructor(parent, maxRowItems = 3) {
        this.maxRowItems = maxRowItems;

        this.widget = Ui.Widget.create(parent);

        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.grid = Ui.GridLayout.create();

        this.grid.setContentsMargins(0, 0, 0, 0);

        this.widget.layout = this.grid;

        this.tiles = [];
        this.itemSettings = [];

        this.nameToId = {};

        this.hoverImage = Ui.Pixmap.create(import.meta.resolve('../Resources/hover.svg'));
        this.defaultImage = Ui.Pixmap.create(import.meta.resolve('../Resources/default.svg'));
        this.selectedImage = Ui.Pixmap.create(import.meta.resolve('../Resources/selected.svg'));

        this.current_selected = null;

        this.onValueChangedCallbackList = [];
        this.connections = [];
    }

    addOnValueChanged(cb) {
        this.onValueChangedCallbackList.push(cb);
    }

    addItem(settings) {
        const id = this.itemSettings.length;
        this.itemSettings.push(settings);

        const tile_bg = Ui.ImageView.create(this.widget);
        tile_bg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        tile_bg.setFixedHeight(TILE_HEIGHT);
        tile_bg.setFixedWidth(TILE_WIDTH);
        tile_bg.scaledContents = true;
        tile_bg.responseHover = true;

        tile_bg.pixmap = this.defaultImage;

        const garment_image = Ui.ImageView.create(tile_bg);
        garment_image.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        garment_image.setFixedHeight(PREIVEW_HEIGHT);
        garment_image.setFixedWidth(PREVIEW_WIDTH);
        garment_image.scaledContents = true;
        garment_image.pixmap = Ui.Pixmap.create(import.meta.resolve('../Resources/' + settings.preview_image));

        garment_image.move(2, 3);

        const garment_label = Ui.ClickableLabel.create(tile_bg);
        garment_label.setFixedWidth(90);
        garment_label.text = '<center>' + settings.preview_label + '</center>';

        garment_label.move(0, PREVIEW_WIDTH + Ui.Sizes.Padding);

        this.tiles.push({
            "tile_bg": tile_bg,
            "selected": false,
            "garment_label": garment_label,
            "garment_image": garment_image,
            "name": settings.name,
        });

        this.nameToId[settings.name] = id;

        const i = Math.floor(id / this.maxRowItems);
        const j = Math.floor(id % this.maxRowItems);

        this.grid.addWidgetAt(tile_bg, i, j, Ui.Alignment.AlignCenter);

        this.connections.push(this.tiles[id].tile_bg.onHover.connect((hovered) => {
            if (!this.tiles[id].selected) {
                if (hovered) {
                    this.tiles[id].tile_bg.pixmap = this.hoverImage;
                } else {
                    this.tiles[id].tile_bg.pixmap = this.defaultImage;
                }
            }
        }));

        [tile_bg, garment_image, garment_label].forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                if (!this.tiles[id].selected) {
                    this.select(id);
                }
            }));
        });
    }

    currentName() {
        return this.tiles[this.current_selected].name;
    }

    selectByName(name) {
        this.select(this.nameToId[name]);
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

        this.onValueChangedCallbackList.forEach((cb) => cb());
    }
}



export function createClothSelection(scheme) {
    return new ClothSelection(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.options, scheme.hint, scheme.default_value);
}
