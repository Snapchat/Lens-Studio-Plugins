import * as Ui from 'LensStudio:Ui';

import { Control } from './Control.js';

export class RadioButtonGroup extends Control {
    constructor(parent, label, valueImporter, valueExporter, tabs, hint) {
        super(parent, label, valueImporter, valueExporter, hint);

        this.mControl = new Ui.RadioButtonGroup(this.widget);
        this.mControl.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Minimum);

        this.tabsToIndex = {};
        this.indexToTab = [];

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.addWidget(this.mLabelBox);

        for (let i = 0; i < tabs.length; i++) {
            const button = new Ui.RadioButton(this.mControl);
            button.text = tabs[i];
            this.mControl.addButton(button, i);

            this.tabsToIndex[tabs[i]] = this.indexToTab.length;
            this.indexToTab.push(tabs[i]);

            this.mConnections.push(button.onClick.connect(() => {
                this.mOnValueChanged.forEach((callback) => callback(this.indexToTab[this.mControl.currentIndex]));
            }));

            layout.addWidget(button);
        }

        this.reset();

        this.mWidget.layout = layout;
    }

    reset() {
        super.reset();

        this.mControl.currentIndex = 0;
    }

    set value(value) {
        this.mControl.currentIndex = this.tabsToIndex[value];
    }

    get value() {
        return this.indexToTab[this.mControl.currentIndex];
    }
}

export function createRadioButtonGroup(scheme) {
    return new RadioButtonGroup(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.tabs, scheme.hint);
}
