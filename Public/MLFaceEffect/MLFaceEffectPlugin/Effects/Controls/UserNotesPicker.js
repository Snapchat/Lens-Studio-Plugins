import * as Ui from 'LensStudio:Ui';

import { Control } from './Control.js';

import { TextEdit } from './TextEdit.js';

import { getHintFactory } from '../../Hints/HintFactory.js';

export class UserNotesPicker extends Control {
    constructor(parent, label, valueImporter, valueExporter, hint, placeholder) {
        super(parent, null, valueImporter, valueExporter);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding / 2;
        layout.setContentsMargins(0, 0, 0, 0);

        const promptHeaderWidget = this['createPromptHeaderWidget'](this.widget, label, hint);

        this.textEdit = new TextEdit(parent, null, null, null, placeholder);
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

        this.mControl.currentText = this.defaultOption;
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
        const promptHeaderWidget = new Ui.Widget(parent);
        const promptHeaderLayout = new Ui.BoxLayout();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        const promptLabel = new Ui.Label(promptHeaderWidget);
        promptLabel.text = label;
        promptHeaderLayout.addWidget(promptLabel);

        if (hint) {
            const infoIconImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../../Resources/info_icon.svg')));
            const promptToolTip = new Ui.ImageView(promptHeaderWidget);

            promptToolTip.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
            promptToolTip.setFixedHeight(Ui.Sizes.IconSide);
            promptToolTip.setFixedWidth(Ui.Sizes.IconSide);
            promptToolTip.scaledContents = true;
            promptToolTip.responseHover = true;
            promptToolTip.pixmap = infoIconImage;

            const popupWidget = new Ui.PopupWithArrow(promptToolTip, Ui.ArrowPosition.Top);

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

        promptHeaderLayout.addStretch(0);

        promptHeaderLayout.setContentsMargins(0, 0, 0, 0);
        promptHeaderWidget.layout = promptHeaderLayout;

        return promptHeaderWidget;
    }
};

export function createUserNotesPicker(scheme) {
    return new UserNotesPicker(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.hint, scheme.placeholder);
}
