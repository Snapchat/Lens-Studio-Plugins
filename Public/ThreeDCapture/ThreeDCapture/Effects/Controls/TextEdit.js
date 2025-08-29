import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from '../../utils.js';
import { Control } from './Control.js';

export class TextEdit extends Control {
    constructor(parent, label, valueImporter, valueExporter, placeholderText) {
        super(parent, label, valueImporter, valueExporter);

        this.maxSymbols = 200;

        this.mControl = new Ui.LineEdit(this.widget);

        this.mControl.foregroundRole = Ui.ColorRole.PlaceholderText;
        this.mControl.placeholderText = placeholderText;
        this.mControl.acceptRichText = false;

        this.reset();

        this.mConnections.push(this.mControl.onTextChange.connect(() => {
            if (this.value.length > this.maxSymbols) {
                this.value = this.value.substring(0, this.maxSymbols);
            }

            this.mOnValueChanged.forEach((callback) => callback(this.value));
        }));

        tieWidgets(this.mLabel, this.mControl, this.mWidget);
    }

    reset() {
        super.reset();

        this.mControl.text = '';
    }

    set value(value) {
        if (!value) {
            value = "";
        }

        this.mControl.text = value;
    }

    get value() {
        return this.mControl.text;
    }
}
