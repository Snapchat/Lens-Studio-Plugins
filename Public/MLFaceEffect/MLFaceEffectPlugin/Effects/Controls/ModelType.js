import * as Ui from 'LensStudio:Ui';
import {Control} from "./Control";
import {getHintFactory} from "../../Hints/HintFactory";

export class ModelType extends Control{
    constructor(parent, label, valueImporter, valueExporter, textHint, imageHint) {
        super(parent, null, valueImporter, valueExporter, null);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.HalfPadding;
        layout.setContentsMargins(0, 0, 0, 0);

        const modelTypeLabel = new Ui.Label(this.widget);
        modelTypeLabel.text = "Model Type";
        layout.addWidget(modelTypeLabel);

        const gridLayout = new Ui.GridLayout();
        gridLayout.spacing = 0;
        gridLayout.setContentsMargins(0, 0, 0, 0);

        const modelTypeButtonGroup = new Ui.RadioButtonGroup(this.widget);
        this.modelTypeButtonGroup = modelTypeButtonGroup;

        const enhancedButton = new Ui.RadioButton(modelTypeButtonGroup);
        enhancedButton.text = "Enhanced";
        const standardButton = new Ui.RadioButton(modelTypeButtonGroup);
        standardButton.text = "Standard";

        this.enhancedButton = enhancedButton;
        this.standardButton = standardButton;

        modelTypeButtonGroup.addButton(enhancedButton, 0);
        modelTypeButtonGroup.addButton(standardButton, 1);

        this.textPromptHint = this['createHintWidget'](this.widget, imageHint, this.enhancedButton);
        this.imagePromptHint = this['createHintWidget'](this.widget, textHint, this.standardButton);

        // gridLayout.addWidgetAt(enhancedButton, 0, 0, Ui.Alignment.Default);
        gridLayout.addWidgetAt(this.textPromptHint, 0, 0, Ui.Alignment.AlignLeft)
        // gridLayout.addWidgetAt(standardButton, 1, 0, Ui.Alignment.Default);
        gridLayout.addWidgetAt(this.imagePromptHint, 1, 0, Ui.Alignment.AlignLeft)

        modelTypeButtonGroup.currentIndex = 0;

        enhancedButton.onClick.connect(() => {
            this.mOnValueChanged.forEach((callback) => callback(this.modelTypeButtonGroup.currentIndex));
        })

        standardButton.onClick.connect(() => {
            this.mOnValueChanged.forEach((callback) => callback(this.modelTypeButtonGroup.currentIndex));
        })

        layout.addLayout(gridLayout);

        this.widget.layout = layout;
    }

    ['createHintWidget'](parent, image_hint, button) {
        const promptHeaderWidget = new Ui.Widget(parent);
        const promptHeaderLayout = new Ui.BoxLayout();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        promptHeaderLayout.addWidget(button);

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

            popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, image_hint));

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

        promptHeaderLayout.setContentsMargins(0, 0, 0, 0);
        promptHeaderWidget.layout = promptHeaderLayout;

        return promptHeaderWidget;
    }

    showEnhancedButton() {
        this.modelTypeButtonGroup.currentIndex = 0;
        this.standardButton.visible = false;
        this.imagePromptHint.visible = false;
        this.enhancedButton.visible = true;
        this.textPromptHint.visible = true;

    }

    showStandardButton() {
        this.modelTypeButtonGroup.currentIndex = 1;
        this.enhancedButton.visible = false;
        this.textPromptHint.visible = false;
        this.standardButton.visible = true;
        this.imagePromptHint.visible = true;
    }
}

export function createModelType(parent, label, textHint, imageHint) {
    return new ModelType(parent, label, null, null, textHint, imageHint);
}
