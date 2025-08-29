import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from '../../utils.js';
import { Control } from './Control.js';

export class CheckBox extends Control {
    constructor(parent, label, valueImporter, valueExporter, hint) {
        super(parent, label, valueImporter, valueExporter, hint);

        this.mControl = new Ui.CheckBox(this.widget);

        this.reset();

        this.mConnections.push(this.mControl.onToggle.connect((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        }));

        tieWidgets(this.mLabelBox, this.mControl, this.mWidget);
    }

    reset() {
        super.reset();

        this.value = false;
    }

    set value(value) {
        this.mControl.onCheck = value;
    }

    get value() {
        return this.mControl.onCheck;
    }
}

export function createCheckBox(scheme) {
    return new CheckBox(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.hint);
}
