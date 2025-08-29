import * as Ui from 'LensStudio:Ui';

import { Control } from './Control.js';
import { getHintFactory } from '../../Hints/HintFactory.js';

export class SpinBox extends Control {
    constructor(parent, label, valueImporter, valueExporter, min, max, randomizer, hint) {
        super(parent, label, valueImporter, valueExporter);

        this.mControl = new Ui.SpinBox(this.widget);
        this.randomizer = randomizer;
        this.min = min;
        this.max = max;

        this.mControl.setRange(min, max);
        this.mControl.step = 1;

        this.reset();

        this.mConnections.push(this.mControl.onValueChange.connect(() => {
            this.mOnValueChanged.forEach((callback) => callback(this.value));
        }));

        const layout = new Ui.BoxLayout();

        layout.setDirection(Ui.Direction.LeftToRight);

        layout.addWidget(this.mLabel);

        if (hint) {
            const infoIconImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../../Resources/info.svg')));
            const toolTip = new Ui.ImageView(this.mWidget);

            toolTip.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
            toolTip.setFixedHeight(Ui.Sizes.IconSide);
            toolTip.setFixedWidth(Ui.Sizes.IconSide);
            toolTip.scaledContents = true;
            toolTip.responseHover = true;
            toolTip.pixmap = infoIconImage;

            const popupWidget = new Ui.PopupWithArrow(toolTip, Ui.ArrowPosition.Top);

            popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

            popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, hint.id));

            this.mConnections.push(toolTip.onHover.connect((hovered) => {
                if (hovered) {
                    popupWidget.popup(toolTip);
                } else {
                    popupWidget.close();
                    parent.activateWindow();
                }
            }));

            layout.addWidgetWithStretch(toolTip, 55, Ui.Alignment.AlignLeft);
        }

        if (this.randomizer) {
            this.mRandomizer = new Ui.PushButton(this.mWidget);
            this.mRandomizer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
            this.mRandomizer.setIcon(Editor.Icon.fromFile(import.meta.resolve("Resources/dice.svg")));
            this.mRandomizer.onClick.connect(() => {
                this.random();
            });

            layout.addWidget(this.mRandomizer);
        }

        layout.addWidgetWithStretch(this.mControl, 45, Ui.Alignment.Default);

        layout.setContentsMargins(0, 0, 0, 0);
        this.mWidget.layout = layout;
    }

    random() {
        this.value = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
    }

    reset() {
        super.reset();
        this.random();
    }

    set value(value) {
        this.mControl.value = Math.floor(value);
    }

    get value() {
        return this.mControl.value;
    }
}

export function createSpinBox(scheme) {
    return new SpinBox(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.min, scheme.max, scheme.randomizer, scheme.hint);
}
