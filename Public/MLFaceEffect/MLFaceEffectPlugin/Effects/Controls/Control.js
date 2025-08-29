import * as Ui from 'LensStudio:Ui';

import { addHint } from '../../utils.js';

export class Control {
    constructor(parent, label, valueImporter, valueExporter, hint) {
        this.mConnections = [];
        this.parent = parent;
        this.mWidget = new Ui.Widget(parent);

        if (label) {
            this.mLabelBox = new Ui.Widget(this.mWidget);
            this.mLabel = new Ui.Label(this.mLabelBox);

            this.mLabel.text = label;

            if (hint != null) {
                const connection = addHint(this.mLabel, this.mLabelBox, hint.id);
                this.mConnections.push(connection);
            } else {
                const layout = new Ui.BoxLayout();
                layout.setDirection(Ui.Direction.TopToBottom);
                layout.setContentsMargins(0, 0, 0, 0);

                layout.addStretch(0);
                layout.addWidget(this.mLabel);
                layout.addStretch(0);

                this.mLabelBox.layout = layout;
            }
        }

        this.mValueImporter = valueImporter;
        this.mValueExporter = valueExporter;

        this.mOnValueChanged = [];

        this.mValue = null;
        this.mBackendValue = null;
    }

    addOnValueChanged(callback) {
        this.mOnValueChanged.push(callback);
    }

    get backendValue() {
        return this.mValueExporter ? this.mValueExporter(this.value) : this.value;
    }

    set backendValue(value) {
        this.value = this.mValueImporter ? this.mValueImporter(value) : value;
    }

    get widget() {
        return this.mWidget;
    }

    reset() {

    }

    set enabled(value) {
        this.mControl.enabled = value;
    }

    get enabled() {
        return this.mControl.enabled;
    }

    blockSignals(value) {
        this.mControl.blockSignals(value);
    }
}
