import * as Ui from 'LensStudio:Ui';

export class Control {
    protected mConnections: any[] = [];
    protected parent: Ui.Widget;
    protected mWidget: Ui.Widget;
    protected mLabelBox?: Ui.Widget;
    protected mLabel?: Ui.Label;
    protected mDefaultValue: any;
    protected mOnValueChanged: Function[] = [];
    protected mEditable: boolean = true;
    protected mValue: any = null;
    protected mControl?: any;
    protected mValueImporter?: (value: any) => any;
    protected mValueExporter?: (value: any) => any;

    constructor(
        parent: Ui.Widget,
        label: string | null,
        defaultValue: any,
        valueImporter?: (value: any) => any,
        valueExporter?: (value: any) => any
    ) {
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

    addOnValueChanged(callback: Function) {
        this.mOnValueChanged.push(callback);
    }

    get widget(): Ui.Widget {
        return this.mWidget;
    }

    reset() {
        this.value = this.mDefaultValue;
    }

    set editable(value: boolean) {
        this.mEditable = value;
    }

    get editable(): boolean {
        return this.mEditable;
    }

    set enabled(value: boolean) {
        if (this.mControl) {
            this.mControl.enabled = value;
        }
    }

    get enabled(): boolean {
        return this.mControl ? this.mControl.enabled : false;
    }

    blockSignals(value: boolean) {
        if (this.mControl) {
            this.mControl.blockSignals(value);
        }
    }

    get value(): any {
        return this.mValue;
    }

    set value(value: any) {
        this.mValue = value;
    }

    get backendValue(): any {
        return this.mValueExporter ? this.mValueExporter(this.value) : this.value;
    }

    set backendValue(value: any) {
        this.value = this.mValueImporter ? this.mValueImporter(value) : value;
    }
}
