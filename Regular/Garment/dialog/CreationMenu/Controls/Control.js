import * as Ui from 'LensStudio:Ui';

import { addHint } from '../../utils.js';

export class Control {
    constructor(parent, label, valueImporter, valueExporter, hint, defaultValue) {
        this.mConnections = [];
        this.parent = parent;
        this.mWidget = Ui.Widget.create(parent);
        this.mWidget.setContentsMargins(0, 0, 0, 0);

        this.mDefaultValue = defaultValue;

        if (label) {
            this.mLabelBox = Ui.Widget.create(this.mWidget);
            this.mLabelBox.setContentsMargins(0, 0, 0, 0);

            this.mLabel = Ui.Label.create(this.mLabelBox);
            this.mLabel.text = label;

            if (hint != null) {
                const connection = addHint(this.mLabel, this.mLabelBox, hint.id);
                this.mConnections.push(connection);
            } else {
                const layout = Ui.BoxLayout.create();
                layout.setDirection(Ui.Direction.LeftToRight);
                layout.addWidget(this.mLabel);
                layout.addStretch(0);
                layout.setContentsMargins(0, 0, 0, 0);

                this.mLabelBox.layout = layout;
            }
        }

        this.mValueImporter = valueImporter;
        this.mValueExporter = valueExporter;

        this.mOnValueChanged = [];

        this.mEditable = true;
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
        this.value = this.mDefaultValue;
    }

    set editable(value) {
        this.mEditable = value;
    }

    get editable() {
        return this.mEditable;
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
