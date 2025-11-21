import * as Ui from 'LensStudio:Ui';
import { Control } from './Control';
export class GenStepsControl extends Control {
    constructor(parent, label, defaultValue, valueImporter, valueExporter) {
        super(parent, null, defaultValue, valueImporter, valueExporter);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 16, 0, 0);
        layout.spacing = Ui.Sizes.Padding;
        const labelWidget = new Ui.Label(this.widget);
        labelWidget.text = label;
        layout.addWidget(labelWidget);
        this.mControl = new Ui.SpinBox(this.widget);
        this.mControl.setRange(1, 100);
        this.mControl.step = 1;
        this.mControl.setFixedWidth(240);
        this.mControl.setFixedHeight(24);
        this.mControl.value = defaultValue;
        layout.addWidgetWithStretch(this.mControl, 1, Ui.Alignment.AlignRight);
        layout.addStretch(0);
        this.widget.layout = layout;
    }
    reset() {
        super.reset();
    }
    set value(value) {
        this.mControl.value = value;
        this.mValue = value;
    }
    get value() {
        return this.mControl.value;
    }
}
