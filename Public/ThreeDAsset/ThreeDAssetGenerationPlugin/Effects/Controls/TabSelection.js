import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from '../../utils.js';
import { Control } from './Control.js';

export class TabSelection extends Control {
    constructor(parent, label, valueImporter, valueExporter, tabs, hint) {
        super(parent, label, valueImporter, valueExporter, hint);

        this.mControl = new Ui.TabBar(this.widget);
        this.mControl.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Minimum);

        this.tabsToIndex = {};
        this.indexToTab = [];
        this.currentIndex = 0;

        tabs.forEach((tab) => {
            this.mControl.addTab(tab);
            this.tabsToIndex[tab] = this.indexToTab.length;
            this.indexToTab.push(tab);
        });

        this.reset();

        this.mConnections.push(this.mControl.onCurrentChange.connect((value) => {
            if (this.editable) {
                this.currentIndex = value;
                this.mOnValueChanged.forEach((callback) => callback(this.indexToTab[value]));
            } else {
                this.mControl.currentIndex = this.currentIndex;
            }
        }));

        tieWidgets(this.mLabelBox, this.mControl, this.mWidget);
    }

    reset() {
        super.reset();

        this.currentIndex = 0;
        this.mControl.currentIndex = 0;
    }

    set value(value) {
        this.currentIndex = this.tabsToIndex[value];
        this.mControl.currentIndex = this.currentIndex;
    }

    get value() {
        return this.indexToTab[this.currentIndex];
    }
}

export function createTabSelection(scheme) {
    return new TabSelection(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.tabs, scheme.hint);
}
