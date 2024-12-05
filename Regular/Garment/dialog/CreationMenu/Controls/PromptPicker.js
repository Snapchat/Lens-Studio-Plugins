import * as Ui from 'LensStudio:Ui';

import { getRandomPrompt } from '../../utils.js';
import { Control } from './Control.js';

import { TextEdit } from './TextEdit.js';

import { getHintFactory } from '../../Hints/HintFactory.js';

export const PromptPickerMode = {
    Text: 0,
    Image: 1
};

export class PromptPicker extends Control {
    constructor(parent, label, valueImporter, valueExporter, defaultValue, hint) {
        super(parent, null, valueImporter, valueExporter, null, defaultValue);
        this.connections = [];

        const layout = Ui.BoxLayout.create();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const promptHeaderWidget = this['createPromptHeaderWidget'](this.widget, label, hint);

        this.textEdit = new TextEdit(parent, null, null, null, defaultValue, 'Enter prompt here...');
        this.textEdit.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        this.textEdit.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        layout.addWidget(promptHeaderWidget);
        layout.addWidget(this.textEdit.widget);

        this.widget.layout = layout;
    }

    reset() {
        super.reset();
    }

    set mode(value) {
        this.promptModeBar.value = value;
    }

    get mode() {
        return this.promptModeBar.value;
    }

    set value(value) {
        this.textEdit.value = value;
    }

    get value() {
        return this.textEdit.value;
    }

    ['createPromptHeaderWidget'](parent, label, hint) {
        const promptHeaderWidget = Ui.Widget.create(parent);
        const promptHeaderLayout = Ui.BoxLayout.create();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        const promptLabel = Ui.Label.create(promptHeaderWidget);
        promptLabel.text = label;
        promptHeaderLayout.addWidget(promptLabel);

        if (hint) {
            const infoIconImage = Ui.Pixmap.create(import.meta.resolve('../../Resources/info.svg'));
            const promptToolTip = Ui.ImageView.create(promptHeaderWidget);

            promptToolTip.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
            promptToolTip.setFixedHeight(Ui.Sizes.IconSide);
            promptToolTip.setFixedWidth(Ui.Sizes.IconSide);
            promptToolTip.scaledContents = true;
            promptToolTip.responseHover = true;
            promptToolTip.pixmap = infoIconImage;

            const popupWidget = Ui.PopupWithArrow.create(promptToolTip, Ui.ArrowPosition.Top);

            popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

            popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, hint.id));

            this.connections.push(promptToolTip.onHover.connect((hovered) => {
                if (hovered) {
                    popupWidget.popup(promptToolTip);
                } else {
                    popupWidget.close();
                    parent.activateWindow();
                }
            }));

            promptHeaderLayout.addWidget(promptToolTip);
        }

        this.surpriseMeLabel = Ui.ClickableLabel.create(promptHeaderWidget);
        this.surpriseMeLabel.text = Ui.getUrlString('Surprise me', '');

        this.connections.push(this.surpriseMeLabel.onClick.connect(function() {
            this.textEdit.value = getRandomPrompt();
        }.bind(this)));

        promptHeaderLayout.addStretch(0);
        promptHeaderLayout.addWidget(this.surpriseMeLabel);

        promptHeaderLayout.setContentsMargins(0, 0, 0, 0);
        promptHeaderWidget.layout = promptHeaderLayout;

        return promptHeaderWidget;
    }
};

export function createPromptPicker(scheme) {
    return new PromptPicker(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.default_value, scheme.hint);
}
