import * as Ui from 'LensStudio:Ui';
import {Control} from "./Control.js";
import {getRandomInt} from "../../utils.js";
import {getHintFactory} from "../../Hints/HintFactory";

export class Seed extends Control {
    constructor(parent, label, hint) {
        super(parent, null, null, null, hint);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const seedLabel = new Ui.Label(parent);
        seedLabel.text = 'Seed';
        layout.addWidget(seedLabel);

        const hintWidget = this['createHintWidget'](parent, hint);
        layout.addWidget(hintWidget);

        const spinBox = new Ui.SpinBox(parent);
        spinBox.setRange(0, 2147483647);
        spinBox.singleStep = 1;
        spinBox.setFixedWidth(120);

        this.spinBox = spinBox;

        spinBox.value = getRandomInt(0, 2147483647);

        layout.addWidgetWithStretch(spinBox, 0, Ui.Alignment.AlignLeft);

        const randomButton = new Ui.PushButton(parent);

        randomButton.setFixedWidth(24);
        randomButton.setFixedHeight(24);

        const randomButtonLayout = new Ui.BoxLayout();
        randomButtonLayout.setContentsMargins(0, 0, 0, 0);

        randomButton.layout = randomButtonLayout;

        const diceImageView = new Ui.ImageView(randomButton);
        diceImageView.pixmap = new Ui.Pixmap(import.meta.resolve('../../Resources/dice.svg'));
        diceImageView.setFixedHeight(16);
        diceImageView.setFixedWidth(16);
        randomButtonLayout.addWidgetWithStretch(diceImageView, 0, Ui.Alignment.AlignCenter);

        [randomButton, diceImageView].forEach((item) => {
            item.onClick.connect(() => {
                spinBox.value = getRandomInt(0, 2147483647);
            })
        })

        layout.addWidgetWithStretch(randomButton, 0, Ui.Alignment.AlignLeft);
        layout.addStretch(1);

        this.widget.layout = layout;
    }

    ['createHintWidget'](parent, prompt_hint) {
        const promptHeaderWidget = new Ui.Widget(parent);
        const promptHeaderLayout = new Ui.BoxLayout();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        if (prompt_hint) {
            const infoIconImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../../Resources/info_icon.svg')));
            this.promptToolTip = new Ui.ImageView(promptHeaderWidget);

            this.promptToolTip.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
            this.promptToolTip.setFixedHeight(Ui.Sizes.IconSide);
            this.promptToolTip.setFixedWidth(Ui.Sizes.IconSide);
            this.promptToolTip.scaledContents = true;
            this.promptToolTip.responseHover = true;
            this.promptToolTip.pixmap = infoIconImage;

            const popupWidget = new Ui.PopupWithArrow(this.promptToolTip, Ui.ArrowPosition.Top);

            popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

            popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, prompt_hint.id));

            this.connections.push(this.promptToolTip.onHover.connect((hovered) => {
                if (hovered) {
                    popupWidget.popup(this.promptToolTip);
                } else {
                    popupWidget.close();
                    parent.activateWindow();
                }
            }));

            promptHeaderLayout.addWidget(this.promptToolTip);
        }

        promptHeaderLayout.setContentsMargins(0, 0, 0, 0);
        promptHeaderWidget.layout = promptHeaderLayout;

        return promptHeaderWidget;
    }

    set value(value) {
        this.spinBox.value = value;
    }

    get value() {
        return this.spinBox.value;
    }
}

export function createSeed(parent, label, prompt_hint) {
    return new Seed(parent, label, prompt_hint);
}
