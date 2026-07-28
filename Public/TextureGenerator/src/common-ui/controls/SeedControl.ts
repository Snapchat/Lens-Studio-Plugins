import * as Ui from 'LensStudio:Ui';
import { Control } from './Control';
import * as Hint from '../Hint';
import { createIcon } from '../Utils';

function getRandomSeed(): number {
    return Math.floor(Math.random() * 2147483647);
}

export class SeedControl extends Control {
    private randomButton: Ui.PushButton;
    private hintWidget?: Ui.Widget;

    constructor(
        parent: Ui.Widget,
        label: string,
        defaultValue: number,
        hintWidget?: Ui.Widget,
        valueImporter?: (value: any) => any,
        valueExporter?: (value: any) => any
    ) {
        super(parent, null, defaultValue, valueImporter, valueExporter);
        this.hintWidget = hintWidget;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = Ui.Sizes.Padding;

        const labelWidget = new Ui.Label(this.widget);
        labelWidget.text = label;
        layout.addWidget(labelWidget);

        if (this.hintWidget) {
            const tooltip = Hint.createHintIcon(this.widget, this.hintWidget, undefined, 10);
            this.mConnections.push(tooltip.connection);
            layout.addWidget(tooltip.icon);
        }

        // Dice button with icon instead of text
        this.mControl = new Ui.SpinBox(this.widget);
        this.mControl.setRange(0, 2147483647);
        this.mControl.step = 1;
        this.mControl.setFixedWidth(120);
        this.mControl.setFixedHeight(24);
        this.mControl.value = defaultValue;

        this.randomButton = new Ui.PushButton(this.widget);
        this.randomButton.setContentsMargins(0,0,0,0);
        this.randomButton.setFixedWidth(24);
        this.randomButton.setFixedHeight(24);
        const diceIcon = createIcon(this.randomButton, new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/dice.svg'))), 16);

        const randomButtonLayout = new Ui.BoxLayout();
        randomButtonLayout.setContentsMargins(0, 0, 0, 0);
        this.randomButton.layout = randomButtonLayout;
        randomButtonLayout.addWidget(diceIcon);

        [this.randomButton, diceIcon].forEach((item) => {
            this.mConnections.push(item.onClick.connect(() => {
                this.value = getRandomSeed();
            }));
        })

        layout.addWidget(this.mControl);
        layout.addWidget(this.randomButton);
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
