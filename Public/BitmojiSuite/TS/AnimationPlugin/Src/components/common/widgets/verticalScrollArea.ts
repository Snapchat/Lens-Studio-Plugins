import * as Ui from "LensStudio:Ui";
import { Widget } from "./widget.js";
export class VerticalScrollArea extends Widget {
    constructor(parent: any) {
        super(parent, Ui.VerticalScrollArea.create);
    }
    get maximum() {
        return this.__widget__.maximum;
    }
    set maximum(value) {
        this.__widget__.maximum = value;
    }
    get minimum() {
        return this.__widget__.minimum;
    }
    set minimum(value) {
        this.__widget__.minimum = value;
    }
    get value() {
        return this.__widget__.value;
    }
    set value(value) {
        this.__widget__.value = value;
    }
    get onValueChange() {
        return this.__widget__.onValueChange;
    }
    setWidget(widget: any) {
        this.__widget__.setWidget(widget.toNativeWidget());
    }
}
