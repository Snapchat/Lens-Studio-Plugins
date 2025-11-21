import * as Ui from 'LensStudio:Ui';
import { Control } from './Control';

export class GenStepsControl extends Control {
    constructor(
        parent: Ui.Widget,
        label: string,
        defaultValue: number,
        valueImporter?: (value: any) => any,
        valueExporter?: (value: any) => any
    ) {
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

    override reset() {
        super.reset();
    }

    override set value(value: number) {
        this.mControl.value = value;
        this.mValue = value;
    }

    override get value(): number {
        return this.mControl.value;
    }
}
