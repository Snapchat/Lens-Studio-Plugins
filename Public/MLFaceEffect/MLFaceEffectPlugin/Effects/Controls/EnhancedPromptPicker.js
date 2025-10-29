import * as Ui from 'LensStudio:Ui';
import {Control} from "./Control.js";
import {getHintFactory} from "../../Hints/HintFactory.js";
import {getRandomEnhancedPrompt, getRandomPrompt} from "../../utils.js";
import {TextEdit} from "./TextEdit";
import {ImagePicker} from "./ImagePicker";

const MAX_SYMBOLS = 500;

export class EnhancedPromptPicker extends Control {

    constructor(parent, textLabel, imageLabel, valueImporter, valueExporter, prompt_hint, image_hint) {
        super(parent, null, valueImporter, valueExporter);
        this.connections = [];
        this.isLocked = false;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const promptHeaderWidget = this['createPromptHeaderWidget'](this.widget, textLabel, prompt_hint, null);
        this.textEdit = new TextEdit(parent, null, null, null, 'Enter prompt here...', MAX_SYMBOLS);

        const imageHeaderWidget = this['createPromptHeaderWidget'](this.widget, imageLabel, null, image_hint, false);
        this.imagePicker = new ImagePicker(parent, null, null, null, 1);

        this.imagePicker.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        this.textEdit.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        layout.addWidget(promptHeaderWidget);
        layout.addWidget(this.textEdit.widget);
        layout.addWidget(imageHeaderWidget);
        layout.addWidget(this.imagePicker.widget);
        layout.addStretch(0);
        // layout.addWidgetWithStretch(this.promptModeBar.widget, 0, Ui.Alignment.Default);
        // layout.addWidget(promptPickerWidget);

        this.widget.layout = layout;
    }

    ['createPromptHeaderWidget'](parent, label, prompt_hint, image_hint, showSurpriseMeButton = true) {
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

            // this.imageToolTip.visible = false;
        }

        if (showSurpriseMeButton) {
            this.surpriseMeLabel = new Ui.ClickableLabel(promptHeaderWidget);
            this.surpriseMeLabel.text = Ui.getUrlString('Surprise me', '');

            this.connections.push(this.surpriseMeLabel.onClick.connect(function () {
                let newPrompt = getRandomEnhancedPrompt();
                let maxCnt = 5;
                while (this.textEdit.value === newPrompt && --maxCnt >= 0) {
                    newPrompt = getRandomEnhancedPrompt();
                }
                this.textEdit.value = newPrompt;
            }.bind(this)));

            promptHeaderLayout.addStretch(0);
            promptHeaderLayout.addWidget(this.surpriseMeLabel);
        }
        else {
            promptHeaderLayout.addStretch(0);
        }
        promptHeaderLayout.setContentsMargins(0, 0, 0, 0);
        promptHeaderWidget.layout = promptHeaderLayout;

        return promptHeaderWidget;
    }

    lock() {
        this.isLocked = true;
        this.textEdit.widget.enabled = false;
        this.imagePicker.widget.enabled = false;
        if (this.surpriseMeLabel) {
            this.surpriseMeLabel.enabled = false;
        }
    }

    unlock() {
        this.isLocked = false;
        this.textEdit.widget.enabled = true;
        this.imagePicker.widget.enabled = true;
        if (this.surpriseMeLabel) {
            this.surpriseMeLabel.enabled = true;
        }
    }

    set textValue(value) {
        this.textEdit.value = value;
    }

    get textValue() {
        return this.textEdit.value;
    }

    set imageValue(value) {
        this.imagePicker.value = value;
    }

    get imageValue() {
        return this.imagePicker.value;
    }

    get valueExists() {
        return this.textEdit.value.length > 0 || this.imagePicker.value.length > 0;
    }

    get imagePickerValue() {
        return this.imagePicker.value;
    }

    get locked() {
        return this.isLocked;
    }
}

export function createEnhancedPromptPicker(scheme) {
    return new EnhancedPromptPicker(scheme.parent, scheme.textLabel, scheme.imageLabel, scheme.importer, scheme.exporter, scheme.prompt_hint, scheme.image_hint);
}