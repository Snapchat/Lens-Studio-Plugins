import * as Ui from 'LensStudio:Ui';

import { getRandomPrompt } from '../../utils.js';
import { Control } from './Control.js';

import { TabSelection } from './TabSelection.js';
import { TextEdit } from './TextEdit.js';
import { ImagePicker } from './ImagePicker.js';

import { getHintFactory } from '../../Hints/HintFactory.js';

export const PromptPickerMode = {
    Text: 0,
    Image: 1
};

const MAX_SYMBOLS = 200;

export class PromptPicker extends Control {
    constructor(parent, label, valueImporter, valueExporter, prompt_hint, image_hint) {
        super(parent, null, valueImporter, valueExporter);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const promptHeaderWidget = this['createPromptHeaderWidget'](this.widget, label, prompt_hint, image_hint);

        // Tap Bar - Image / Text
        this.promptModeBar = new TabSelection(this.widget, null, null, null, ['Text', 'Image']);

        const promptPickerWidget = this['createMediaPickerWidget'](this.widget);

        this.textEdit.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.imagePicker.widget.setSizePolicy(Ui.SizePolicy.Policy.Ignored, Ui.SizePolicy.Policy.Ignored);

        this.promptModeBar.addOnValueChanged((value) => {
            const index = value == 'Text' ? 0 : 1;
            promptPickerWidget.currentIndex = index;
            this.surpriseMeLabel.visible = (index === 0);
            this.promptToolTip.visible = (index === 0);
            this.imageToolTip.visible = (index !== 0);

            if (index == 0) {
                this.textEdit.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
                this.imagePicker.widget.setSizePolicy(Ui.SizePolicy.Policy.Ignored, Ui.SizePolicy.Policy.Ignored);

                this.mOnValueChanged.forEach((callback) => callback(this.textEdit.value));
            } else {
                this.imagePicker.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
                this.textEdit.widget.setSizePolicy(Ui.SizePolicy.Policy.Ignored, Ui.SizePolicy.Policy.Ignored);

                this.mOnValueChanged.forEach((callback) => callback(this.imagePicker.value));
            }
        });

        this.imagePicker.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        this.textEdit.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        layout.addWidget(promptHeaderWidget);
        layout.addWidgetWithStretch(this.promptModeBar.widget, 0, Ui.Alignment.Default);
        layout.addWidget(promptPickerWidget);

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
        if (this.mode == 'Text') {
            this.textEdit.value = value;
        } else if (this.mode == 'Image') {
            this.imagePicker.value = value;
        }
    }

    get value() {
        if (this.mode == 'Text') {
            return this.textEdit.value;
        } else if (this.mode == 'Image') {
            return this.imagePicker.value;
        }
    }

    ['createMediaPickerWidget'](parent) {
        const stackedWidget = new Ui.StackedWidget(parent);
        stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        this.textEdit = new TextEdit(parent, null, null, null, 'Enter prompt here...', MAX_SYMBOLS);

        stackedWidget.addWidget(this.textEdit.widget);

        this.imagePicker = new ImagePicker(parent, null, null, null);

        stackedWidget.addWidget(this.imagePicker.widget);

        return stackedWidget;
    }

    ['createPromptHeaderWidget'](parent, label, prompt_hint, image_hint) {
        const promptHeaderWidget = new Ui.Widget(parent);
        const promptHeaderLayout = new Ui.BoxLayout();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        const promptLabel = new Ui.Label(promptHeaderWidget);
        promptLabel.text = label;
        promptHeaderLayout.addWidget(promptLabel);

        if (prompt_hint) {
            const infoIconImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../../Resources/info.svg')));
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

        if (image_hint) {
            const infoIconImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../../Resources/info.svg')));
            this.imageToolTip = new Ui.ImageView(promptHeaderWidget);

            this.imageToolTip.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
            this.imageToolTip.setFixedHeight(Ui.Sizes.IconSide);
            this.imageToolTip.setFixedWidth(Ui.Sizes.IconSide);
            this.imageToolTip.scaledContents = true;
            this.imageToolTip.responseHover = true;
            this.imageToolTip.pixmap = infoIconImage;

            const popupWidget = new Ui.PopupWithArrow(this.imageToolTip, Ui.ArrowPosition.Top);

            popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

            popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, image_hint.id));

            this.connections.push(this.imageToolTip.onHover.connect((hovered) => {
                if (hovered) {
                    popupWidget.popup(this.imageToolTip);
                } else {
                    popupWidget.close();
                    parent.activateWindow();
                }
            }));

            promptHeaderLayout.addWidget(this.imageToolTip);
        }

        this.imageToolTip.visible = false;

        this.surpriseMeLabel = new Ui.ClickableLabel(promptHeaderWidget);
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
    return new PromptPicker(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.prompt_hint, scheme.image_hint);
}
