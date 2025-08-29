import * as Ui from 'LensStudio:Ui';

import { tieWidgets, getRandomPrompt } from '../../utils.js';
import { Control } from './Control.js';

import { TabSelection } from './TabSelection.js';
import { TextEdit } from './TextEdit.js';
import { ImagePicker } from './ImagePicker.js';

export const PromptPickerMode = {
    Text: 0,
    Image: 1
};

export class ImageReferencePicker extends Control {
    constructor(parent, label, valueImporter, valueExporter) {
        super(parent, null, valueImporter, valueExporter);
        this.connections = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Padding;
        layout.setContentsMargins(0, 0, 0, 0);

        const promptHeaderWidget = this['createPromptHeaderWidget'](this.widget, label);

        this.imagePicker = new ImagePicker(this.widget, null, null, null);
        this.imagePicker.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.imagePicker.addOnValueChanged((value) => {
            this.mOnValueChanged.forEach((callback) => callback(value));
        });

        layout.addWidget(promptHeaderWidget);
        layout.addWidget(this.imagePicker.widget);

        this.widget.layout = layout;
    }

    reset() {
        super.reset();

        this.imagePicker.reset();
    }

    set mode(value) {
        this.promptModeBar.value = value;
    }

    get mode() {
        return this.promptModeBar.value;
    }

    set value(value) {
        this.imagePicker.value = value;
    }

    get value() {
        return this.imagePicker.value;
    }

    ['createPromptHeaderWidget'](parent, label) {
        const promptHeaderWidget = new Ui.Widget(parent);
        const promptHeaderLayout = new Ui.BoxLayout();
        promptHeaderLayout.setDirection(Ui.Direction.LeftToRight);

        const promptLabel = new Ui.Label(promptHeaderWidget);
        promptLabel.text = label;

        this.optionalLabel = new Ui.Label(promptHeaderWidget);
        this.optionalLabel.text = 'Optional';
        this.optionalLabel.fontRole = Ui.FontRole.DefaultItalic;

        promptHeaderLayout.addWidget(promptLabel);
        promptHeaderLayout.addStretch(0);
        promptHeaderLayout.addWidget(this.optionalLabel);

        promptHeaderLayout.setContentsMargins(0, 0, 0, 0);
        promptHeaderWidget.layout = promptHeaderLayout;

        return promptHeaderWidget;
    }
};

export function createImageReferencePicker(scheme) {
    return new ImageReferencePicker(scheme.parent, scheme.label, scheme.importer, scheme.exporter);
}
