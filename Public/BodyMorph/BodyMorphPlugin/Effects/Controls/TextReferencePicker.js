import * as Ui from 'LensStudio:Ui';
import { Control } from './Control.js';

import { TextEdit } from './TextEdit.js';

export class TextReferencePicker extends Control {
    constructor(parent, label, valueImporter, valueExporter) {
        super(parent, null, valueImporter, valueExporter);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const promptHeaderWidget = this['createPromptHeaderWidget'](this.widget, label);

        this.textEdit = new TextEdit(parent, null, null, null, 'Enter negative prompt here...');
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

    ['createPromptHeaderWidget'](parent, label) {
        const promptHeaderWidget = new Ui.Widget(parent);
        const promptHeaderLayout = new Ui.BoxLayout();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        const promptLabel = new Ui.Label(promptHeaderWidget);
        promptLabel.text = label;

        const infoIconImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../../Resources/info_icon.svg')));
        const promptToolTip = new Ui.ImageView(promptHeaderWidget);
        promptToolTip.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        promptToolTip.setFixedHeight(Ui.Sizes.IconSide);
        promptToolTip.setFixedWidth(Ui.Sizes.IconSide);
        promptToolTip.scaledContents = true;
        promptToolTip.pixmap = infoIconImage;
        promptToolTip.toolTip = 'Describe the object you want to generate with separated keywords,\n' +
            'including the color, size, facial expression etc. The words at the start\n' +
            'have the most influence. Add special words like “high“,\n' +
            '“quality”, “low poly” to achieve a better result.';

        this.optionalLabel = new Ui.Label(promptHeaderWidget);
        this.optionalLabel.text = 'Optional';
        this.optionalLabel.fontRole = Ui.FontRole.DefaultItalic;

        promptHeaderLayout.addWidget(promptLabel);
        promptHeaderLayout.addWidget(promptToolTip);
        promptHeaderLayout.addStretch(0);
        promptHeaderLayout.addWidget(this.optionalLabel);

        promptHeaderLayout.setContentsMargins(0, 0, 0, 0);
        promptHeaderWidget.layout = promptHeaderLayout;

        return promptHeaderWidget;
    }
};

export function createTextReferencePicker(scheme) {
    return new TextReferencePicker(scheme.parent, scheme.label, scheme.importer, scheme.exporter);
}
