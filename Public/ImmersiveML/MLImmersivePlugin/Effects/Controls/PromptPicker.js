import * as Ui from 'LensStudio:Ui';

import {tieWidgets, getRandomPrompt, addHint, getRealisticRandomPrompt} from '../../utils.js';
import { Control } from './Control.js';

import { TabSelection } from './TabSelection.js';
import { TextEdit } from './TextEdit.js';
import { ImagePicker } from './ImagePicker.js';

import {getHintFactory, HintID} from '../../Hints/HintFactory.js';
import {createEnhancedMenu} from "./EnhancedMenu";

export const PromptPickerMode = {
    Text: 0,
    Image: 1
};

export const RadioButtonMode = {
    Enhanced: 0,
    Cartoonish: 1,
    Realistic: 2
}

const MAX_SYMBOLS = 200;

export class PromptPicker extends Control {
    constructor(parent, label, valueImporter, valueExporter, prompt_hint, image_hint) {
        super(parent, null, valueImporter, valueExporter);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const effectTypeWidget = this['createEffectTypeWidget'](this.widget);

        // this.stackedWidget = new Ui.StackedWidget(this.widget);

        const contentWidget = new Ui.Widget(this.widget);
        contentWidget.setContentsMargins(0, 0, 0, 0);

        const contentLayout = new Ui.BoxLayout();
        contentLayout.setContentsMargins(0, 0, 0, 0);
        contentLayout.setDirection(Ui.Direction.TopToBottom);
        contentWidget.layout = contentLayout;

        const promptHeaderWidget = this['createPromptHeaderWidget'](contentWidget, label, prompt_hint, image_hint);

        // Tap Bar - Image / Text
        this.promptModeBar = new TabSelection(contentWidget, null, null, null, ['Text', 'Image']);

        const promptPickerWidget = this['createMediaPickerWidget'](contentWidget);

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

        contentLayout.addWidget(promptHeaderWidget);
        contentLayout.addWidgetWithStretch(this.promptModeBar.widget, 0, Ui.Alignment.Default);
        contentLayout.addWidget(promptPickerWidget);
        contentLayout.addStretch(0);

        // this.stackedWidget.addWidget(contentWidget);

        this.enhancedMenu = createEnhancedMenu(this.widget, 5, 6);
        // this.stackedWidget.addWidget(this.enhancedMenu.widget);

        this.enhancedMenu.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        })

        // this.stackedWidget.currentIndex = 1;

        contentWidget.setMinimumHeight(0);
        contentWidget.setSizePolicy(Ui.SizePolicy.Policy.Minimum, Ui.SizePolicy.Policy.Minimum);

        layout.addWidget(effectTypeWidget);
        layout.addWidget(contentWidget);
        layout.addWidget(this.enhancedMenu.widget);
        // layout.addWidget(this.stackedWidget);

        this.contentWidget = contentWidget;

        contentWidget.visible = false;

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

        // this.buttonGroup.currentIndex = 0;
        // this.promptModeBar.widget.visible = true;
        // this.stackedWidget.currentIndex = 1;
        // this.contentWidget.visible = false;
        // this.enhancedMenu.widget.visible = true;
    }

    get valueExists() {
        // console.log(this.textEdit.value.length + " <><> " + this.imagePicker.value.length)
        return this.textEdit.value.length > 0 || this.imagePicker.value.length > 0;
    }

    get enhanceTextPromptValue() {
        return this.enhancedMenu.textValue;
    }

    set enhanceTextPromptValue(value) {
        this.enhancedMenu.textValue = value;
    }

    get enhanceImagePromptValue() {
        return this.enhancedMenu.imageValue;
    }

    set enhanceImagePromptValue(value) {
        this.enhancedMenu.imageValue = value;
    }

    get referenceStrengthValue() {
        return this.enhancedMenu.referenceStrengthValue;
    }

    set referenceStrengthValue(value) {
        this.enhancedMenu.referenceStrengthValue = value;
    }

    resetMode() {
        this.buttonGroup.currentIndex = 0;
        this.contentWidget.visible = false;
        this.enhancedMenu.widget.visible = true;
    }

    disableReferenceStrengthSlider() {
        this.enhancedMenu.disableReferenceStrengthSlider();
    }

    enableReferenceStrengthSlider() {
        this.enhancedMenu.enableReferenceStrengthSlider();
    }

    get seedValue() {
        return this.enhancedMenu.seedValue;
    }

    set seedValue(value) {
        this.enhancedMenu.seedValue = value;
    }

    lockReferenceStrengthSlider() {
        this.enhancedMenu.lockReferenceStrengthSlider()
    }

    unlockReferenceStrengthSlider() {
        this.enhancedMenu.unlockReferenceStrengthSlider()
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
            this.buttonGroup.currentIndex = 2;
            this.cartoonishButton.visible = false;
            this.enhancedButton.visible = false;
            this.realisticButton.enabled = false;
            this.realisticButton.visible = true;
            this.promptModeBar.reset();
            this.promptModeBar.widget.visible = false;
            // this.stackedWidget.currentIndex = 0;
            this.enhancedMenu.widget.visible = false;
            this.contentWidget.visible = true;
        }
        else if (value == 'full-frame-text') {
            this.buttonGroup.currentIndex = 1;
            this.realisticButton.visible = false;
            this.enhancedButton.visible = false;
            this.cartoonishButton.enabled = false;
            this.cartoonishButton.visible = true;
            this.promptModeBar.widget.visible = true;
            // this.stackedWidget.currentIndex = 0;
            this.enhancedMenu.widget.visible = false;
            this.contentWidget.visible = true;
        }
        else if (value == 'full-frame-image') {
                this.buttonGroup.currentIndex = 1;
                this.realisticButton.visible = false;
                this.enhancedButton.visible = false;
                this.cartoonishButton.enabled = false;
                this.cartoonishButton.visible = true;
                this.promptModeBar.widget.visible = true;
                this.promptModeBar.value = "Image";
                // this.stackedWidget.currentIndex = 0;
                this.enhancedMenu.widget.visible = false;
                this.contentWidget.visible = true;
        }
        else if (value == 'full-frame-enhanced') {
            this.buttonGroup.currentIndex = 0;
            this.realisticButton.visible = false;
            this.cartoonishButton.visible = false;
            this.enhancedButton.enabled = false;
            this.enhancedButton.visible = true;
            this.contentWidget.visible = false;
            this.enhancedMenu.widget.visible = true;
        }
    }

    isEnhanced() {
        return this.buttonGroup.currentIndex === 0;
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
        gridLayout.spacing = 0;

        this.buttonGroup = new Ui.RadioButtonGroup(effectTypeWidget);

        this.enhancedButton = this['createRadioButton'](this.buttonGroup, 'Enhanced', 0, 4);
        this.cartoonishButton = this['createRadioButton'](this.buttonGroup, 'Cartoonish', 1, HintID.cartoonish);
        this.realisticButton = this['createRadioButton'](this.buttonGroup, 'Realistic', 2, HintID.realistic);

        gridLayout.addWidgetAt(this.enhancedButton, 0, 0, Ui.Alignment.Default);
        gridLayout.addWidgetAt(this.cartoonishButton, 1, 0, Ui.Alignment.Default);
        gridLayout.addWidgetAt(this.realisticButton, 2, 0, Ui.Alignment.Default);

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
                // this.stackedWidget.currentIndex = 0;
                this.enhancedMenu.widget.visible = false;
                this.contentWidget.visible = true;
                this.promptModeBar.reset();
                this.promptModeBar.widget.visible = false;
            }
            else if (idx == RadioButtonMode.Cartoonish) {
                // this.stackedWidget.currentIndex = 0;
                this.enhancedMenu.widget.visible = false;
                this.contentWidget.visible = true;

                this.promptModeBar.widget.visible = true;
            }
            else if (idx == RadioButtonMode.Enhanced) {
                // this.stackedWidget.currentIndex = 1;
                this.contentWidget.visible = false;
                this.enhancedMenu.widget.visible = true;
            }
        })

        return widget;
    }

    ['addHint'](parent, hint_id) {
        const infoImage = new Ui.Pixmap(import.meta.resolve('../../Resources/info_icon.svg'));

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

        if (image_hint) {
            const infoIconImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../../Resources/info_icon.svg')));
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
