import {Control} from "./Control.js";
import * as Ui from 'LensStudio:Ui';

export class RadioButton extends Control {

    constructor(parent, label, valueImporter, valueExporter, hint, text) {
        super(parent, label, valueImporter, valueExporter, hint);

        this.mControl = new Ui.RadioButton(this.widget);
        this.mControl.text = text;
    }

    get radioButton() {
        return this.mControl;
    }
}
