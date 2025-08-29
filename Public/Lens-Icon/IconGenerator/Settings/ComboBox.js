import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from './utils.js';
import { Control } from './Control.js';

export class ComboBox extends Control {
    constructor(parent, label, valueImporter, valueExporter, options, hint, defaultValue) {
        super(parent, label, valueImporter, valueExporter, hint, defaultValue);

        this.mControl = new Ui.ComboBox(this.widget);

        options.forEach((option) => {
            this.mControl.addItem(option);
        });

        this.mControl.onCurrentTextChange.connect((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        tieWidgets(this.mLabelBox, this.mControl, this.mWidget);
    }

    reset() {
        super.reset();
    }

    set value(value) {
        this.mControl.currentText = value;
    }

    get value() {
        return this.mControl.currentText;
    }
}

export function createComboBox(scheme) {
    return new ComboBox(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.options, scheme.hint, scheme.default_value);
}
