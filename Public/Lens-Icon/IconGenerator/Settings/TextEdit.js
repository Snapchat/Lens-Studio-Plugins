import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from './utils.js';
import { Control } from './Control.js';

export class TextEdit extends Control {
    constructor(parent, label, valueImporter, valueExporter, defaultValue, placeholderText) {
        super(parent, label, valueImporter, valueExporter, null, defaultValue);

        this.maxSymbols = 200;

        this.mControl = new Ui.TextEdit(this.widget);
        this.mControl.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        this.mControl.foregroundRole = Ui.ColorRole.PlaceholderText;
        this.mControl.placeholderText = placeholderText;
        this.mControl.setFixedHeight(Ui.Sizes.TextEditHeight);
        this.mControl.acceptRichText = false;

        this.mControl.onTextChange.connect(() => {
            if (this.value.length > this.maxSymbols) {
                this.value = this.value.substring(0, this.maxSymbols);
            }

            this.mOnValueChanged.forEach((callback) => callback(this.value));
        });

        tieWidgets(this.mLabel, this.mControl, this.mWidget);
    }

    reset() {
        super.reset();
    }

    set value(value) {
        this.mControl.plainText = value;
    }

    get value() {
        return this.mControl.plainText;
    }
}
