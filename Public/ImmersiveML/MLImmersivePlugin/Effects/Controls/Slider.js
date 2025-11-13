import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from '../../utils.js';
import { Control } from './Control.js';

export class Slider extends Control {
    constructor(parent, label, valueImporter, valueExporter, min, max, step, hint) {
        super(parent, label, valueImporter, valueExporter, hint);
        this.connections = [];
        this.min = min;
        this.max = max;
        this.step = step;

        const sliderWidget = this['createSilderWidget'](this.widget, min, max, step);

        sliderWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        this.reset();

        this.mConnections.push(this.mControl.onValueChange.connect((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        }));

        tieWidgets(this.mLabelBox, sliderWidget, this.mWidget);
    }

    reset() {
        super.reset();

        this.mControl.value = this.min;
    }

    set value(value) {
        this.mControl.value = value;
    }

    get value() {
        return this.mControl.value;
    }

    ['createSilderWidget'](parent, min, max, step) {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);

        this.mControl = new Ui.Slider(widget);
        this.mControl.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        this.mControl.setRange(min, max);
        this.mControl.singleStep = step;

        const spinbox = new Ui.SpinBox(widget);
        spinbox.setRange(min, max);
        spinbox.signleStep = step;

        this.connections.push(this.mControl.onValueChange.connect((value) => {
            spinbox.blockSignals(true);
            spinbox.value = value;
            spinbox.blockSignals(false);
        }));
        layout.addWidget(this.mControl);

        this.connections.push(spinbox.onValueChange.connect((value) => {
            this.mControl.blockSignals(true);
            this.mControl.value = value;
            this.mControl.blockSignals(false);
        }));

        layout.addWidget(spinbox);
        widget.layout = layout;

        return widget;
    }
}

export function createSlider(scheme) {
    return new Slider(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.min, scheme.max, scheme.step, scheme.hint);
}
