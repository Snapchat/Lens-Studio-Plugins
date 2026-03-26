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

        tabs.forEach((tab) => {
            this.mControl.addTab(tab);
            this.tabsToIndex[tab] = this.indexToTab.length;
            this.indexToTab.push(tab);
        });

        this.reset();

        this.mConnections.push(this.mControl.onCurrentChange.connect((value) => {
            this.mOnValueChanged.forEach((callback) => callback(this.indexToTab[value]));
        }));

        tieWidgets(this.mLabelBox, this.mControl, this.mWidget);
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

export function createTabSelection(scheme) {
    return new TabSelection(scheme.parent, scheme.label, scheme.importer, scheme.exporter, scheme.tabs, scheme.hint);
}
