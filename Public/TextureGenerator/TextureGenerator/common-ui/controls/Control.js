import * as Ui from 'LensStudio:Ui';
export class Control {
    constructor(parent, label, defaultValue, valueImporter, valueExporter) {
        this.mConnections = [];
        this.mOnValueChanged = [];
        this.mEditable = true;
        this.mValue = null;
        this.parent = parent;
        this.mWidget = new Ui.Widget(parent);
        this.mWidget.setContentsMargins(0, 0, 0, 0);
        this.mDefaultValue = defaultValue;
        this.mValueImporter = valueImporter;
        this.mValueExporter = valueExporter;
        if (label) {
            this.mLabelBox = new Ui.Widget(this.mWidget);
            this.mLabelBox.setContentsMargins(0, 0, 0, 0);
            this.mLabel = new Ui.Label(this.mLabelBox);
            this.mLabel.text = label;
            const layout = new Ui.BoxLayout();
            layout.setDirection(Ui.Direction.LeftToRight);
            layout.addWidget(this.mLabel);
            layout.addStretch(0);
            layout.setContentsMargins(0, 0, 0, 0);
            this.mLabelBox.layout = layout;
        }
    }
    addOnValueChanged(callback) {
        this.mOnValueChanged.push(callback);
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
        if (this.mControl) {
            this.mControl.enabled = value;
        }
    }
    get enabled() {
        return this.mControl ? this.mControl.enabled : false;
    }
    blockSignals(value) {
        if (this.mControl) {
            this.mControl.blockSignals(value);
        }
    }
    get value() {
        return this.mValue;
    }
    set value(value) {
        this.mValue = value;
    }
    get backendValue() {
        return this.mValueExporter ? this.mValueExporter(this.value) : this.value;
    }
    set backendValue(value) {
        this.value = this.mValueImporter ? this.mValueImporter(value) : value;
    }
}
