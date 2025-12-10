import * as Ui from 'LensStudio:Ui';
import {Control} from "./Control";
import {PromptPicker} from "./PromptPicker";
import {getHintFactory} from "../../Hints/HintFactory";
import {getEnhancedRandomPrompt} from "../../utils";
import {TextEdit} from "./TextEdit";
import {ImagePicker} from "./ImagePicker";
import {createSeed} from "./Seed";
import {createSlider} from "./Slider";

const MAX_SYMBOLS = 500;

export class EnhancedMenu extends Control {
    constructor(parent, prompt_hint, image_hint) {
        super(parent, null, null, null);

        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const textPromptHeaderWidget = this['createPromptHeaderWidget'](this.widget, "Effect Prompt", 5, true);
        this.textEdit = new TextEdit(parent, null, null, null, 'Enter prompt here...', MAX_SYMBOLS);
        const imagePromptHeaderWidget = this['createPromptHeaderWidget'](this.widget, "Image Reference", 6);
        this.imagePicker = new ImagePicker(parent, null, null, null, 1);
        this.referenceStrengthSlider = createSlider({"parent":this.widget,"label":"Reference Strength","min":1,"max":10,"step":1,"hint":{"id":3}})
        this.seed = createSeed(this.widget, "Seed", {id:7});

        this.imagePicker.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        this.textEdit.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        layout.addWidget(textPromptHeaderWidget);
        layout.addWidget(this.textEdit.widget);
        layout.addWidget(imagePromptHeaderWidget);
        layout.addWidget(this.imagePicker.widget);
        layout.addWidget(this.referenceStrengthSlider.widget);
        layout.addWidget(this.seed.widget);
        layout.addStretch(0);

        this.widget.layout = layout;
    }

    ['createPromptHeaderWidget'](parent, label, prompt_hint, hasSurpriseMeButton) {
        const promptHeaderWidget = new Ui.Widget(parent);
        const promptHeaderLayout = new Ui.BoxLayout();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        const promptLabel = new Ui.Label(promptHeaderWidget);
        promptLabel.text = label;

        promptHeaderLayout.addWidget(promptLabel);

        if (prompt_hint) {
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

            popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, prompt_hint));

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

        if (hasSurpriseMeButton) {

            this.surpriseMeLabel = new Ui.ClickableLabel(promptHeaderWidget);
            this.surpriseMeLabel.text = Ui.getUrlString('Surprise me', '');

            this.connections.push(this.surpriseMeLabel.onClick.connect(function () {
                this.textEdit.value = getEnhancedRandomPrompt();
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

    get textValue() {
        return this.textEdit.value;
    }

    set textValue(value) {
        this.textEdit.value = value;
    }

    get imageValue() {
        return this.imagePicker.value;
    }

    set imageValue(value) {
        this.imagePicker.value = value;
    }

    get referenceStrengthValue() {
        return this.referenceStrengthSlider.value;
    }

    set referenceStrengthValue(value) {
        this.referenceStrengthSlider.value = value;
    }

    disableReferenceStrengthSlider() {
        this.referenceStrengthSlider.widget.enabled = false;
    }

    enableReferenceStrengthSlider() {
        this.referenceStrengthSlider.widget.enabled = true;
    }

    lockReferenceStrengthSlider() {
        this.referenceStrengthSlider.widget.enabled = false;
    }

    unlockReferenceStrengthSlider() {
        this.referenceStrengthSlider.widget.enabled = true;
    }

    get seedValue() {
        return this.seed.value;
    }

    set seedValue(value) {
        this.seed.value = value;
    }
}

export function createEnhancedMenu(parent, prompt_hint, image_hint) {
    return new EnhancedMenu(parent, prompt_hint, image_hint);
}
