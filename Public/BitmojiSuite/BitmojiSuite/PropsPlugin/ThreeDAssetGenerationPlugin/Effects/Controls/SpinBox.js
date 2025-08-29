import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from '../../utils.js';
import { Control } from './Control.js';

export class SpinBox extends Control {
    constructor(parent, label, valueImporter, valueExporter, min, max) {
        super(parent, label, valueImporter, valueExporter);

        this.mControl = new Ui.SpinBox(this.widget);

        this.mControl.setRange(min, max);
        this.mControl.step = 1;

        this.reset();

        this.mConnections.push(this.mControl.onValueChange.connect(() => {
            this.mOnValueChanged.forEach((callback) => callback(this.value));
        }));

        tieWidgets(this.mLabel, this.mControl, this.mWidget);
    }

    reset() {
        super.reset();

        this.mControl.plainText = '';
    }

    set value(value) {
        this.mControl.value = Math.floor(value);
    }

    get value() {
        return this.mControl.value;
    }
}
