import * as Ui from 'LensStudio:Ui';

import {tieWidgets, getRandomPrompt, addHint, getRealisticRandomPrompt} from '../../utils.js';
import { Control } from './Control.js';

import { TabSelection } from './TabSelection.js';
import { TextEdit } from './TextEdit.js';
import { ImagePicker } from './ImagePicker.js';

import {getHintFactory, HintID} from '../../Hints/HintFactory.js';

export const PromptPickerMode = {
    Text: 0,
    Image: 1
};

export const RadioButtonMode = {
    Cartoonish: 0,
    Realistic: 1
}

export class PromptPicker extends Control {
    constructor(parent, label, valueImporter, valueExporter, prompt_hint, image_hint) {
        super(parent, null, valueImporter, valueExporter);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const effectTypeWidget = this['createEffectTypeWidget'](this.widget);

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
            // effectTypeWidget.visible = (index === 0);

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

        layout.addWidget(effectTypeWidget);
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

    get effectType() {
        let curEffectType = "Cartoonish";
        if (this.buttonGroup.currentIndex == RadioButtonMode.Realistic) {
            curEffectType = "Realistic";
        }

        return curEffectType;
    }

    set value(value) {
        if (this.mode == 'Text') {
            this.textEdit.value = value;
        } else if (this.mode == 'Image') {
            this.imagePicker.value = value;
        }

        this.buttonGroup.currentIndex = 0;
        this.promptModeBar.widget.visible = true;
    }

    get value() {
        if (this.mode == 'Text') {
            return this.textEdit.value;
        } else if (this.mode == 'Image') {
            return this.imagePicker.value;
        }
    }

    set effectType(value) {
        if (value == 'full-frame-realistic-text') {
            this.buttonGroup.currentIndex = 1;
            this.cartoonishButton.visible = false;
            this.realisticButton.enabled = false;
            this.realisticButton.visible = true;
            this.promptModeBar.reset();
            this.promptModeBar.widget.visible = false;
        }
        else if (value == 'full-frame-text') {
            this.buttonGroup.currentIndex = 0;
            this.realisticButton.visible = false;
            this.cartoonishButton.enabled = false;
            this.cartoonishButton.visible = true;
            this.promptModeBar.widget.visible = true;
        }
    }

    ['createEffectTypeWidget'](parent) {
        const effectTypeWidget = new Ui.Widget(parent);
        const effectTypeLayout = new Ui.BoxLayout();
        effectTypeLayout.setDirection(Ui.Direction.TopToBottom);
        effectTypeLayout.setContentsMargins(0, 0, 0, 0);

        const effectTypeLabel = new Ui.Label(effectTypeWidget);
        effectTypeLabel.text = 'Effect type';

        effectTypeLayout.addWidget(effectTypeLabel);

        const gridLayout = new Ui.GridLayout();

        this.buttonGroup = new Ui.RadioButtonGroup(effectTypeWidget);

        this.cartoonishButton = this['createRadioButton'](this.buttonGroup, 'Cartoonish', 0, HintID.cartoonish);
        this.realisticButton = this['createRadioButton'](this.buttonGroup, 'Realistic', 1, HintID.realistic);

        gridLayout.addWidgetAt(this.cartoonishButton, 0, 0, Ui.Alignment.Default);
        gridLayout.addWidgetAt(this.realisticButton, 1, 0, Ui.Alignment.Default);

        this.buttonGroup.currentIndex = 0;

        effectTypeLayout.addLayout(gridLayout);

        effectTypeWidget.layout = effectTypeLayout;

        return effectTypeWidget;
    }

    ['createRadioButton'](parent, text, idx, hint_id) {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Minimum, Ui.SizePolicy.Policy.Minimum);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const button = new Ui.RadioButton(widget);
        button.text = text;

        parent.addButton(button, idx);
        layout.addWidget(button);

        const info = this['addHint'](widget, hint_id);

        layout.addWidget(info);
        layout.addStretch(0);

        widget.layout = layout;

        button.onClick.connect(() => {
            if (idx == RadioButtonMode.Realistic) {
                this.promptModeBar.reset();
                this.promptModeBar.widget.visible = false;
            }
            else if (idx == RadioButtonMode.Cartoonish) {
                this.promptModeBar.widget.visible = true;
            }
        })

        return widget;
    }

    ['addHint'](parent, hint_id) {
        const infoImage = new Ui.Pixmap(import.meta.resolve('../../Resources/info.svg'));

        const info = new Ui.ImageView(parent);
        info.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        info.setFixedHeight(Ui.Sizes.IconSide);
        info.setFixedWidth(Ui.Sizes.IconSide);
        info.scaledContents = true;

        info.pixmap = infoImage;
        info.responseHover = true;

        const popupWidget = new Ui.PopupWithArrow(info, Ui.ArrowPosition.Top);

        popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

        popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, hint_id));

        const connection = info.onHover.connect((hovered) => {
            if (hovered) {
                popupWidget.popup(info);
            } else {
                popupWidget.close();
                parent.activateWindow();
            }
        });

        return info;
    }

    ['createMediaPickerWidget'](parent) {
        const stackedWidget = new Ui.StackedWidget(parent);
        stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        this.textEdit = new TextEdit(parent, null, null, null, 'Enter prompt here...');

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
            if (this.effectType === "Realistic") {
                this.textEdit.value = getRealisticRandomPrompt();
            }
            else {
                this.textEdit.value = getRandomPrompt();
            }
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
