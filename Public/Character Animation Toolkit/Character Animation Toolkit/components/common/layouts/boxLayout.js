// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Layout } from "./layout.js";
export class BoxLayout extends Layout {
    constructor() {
        super();
        this.__layout__ = new Ui.BoxLayout();
    }
    addLayout(layout) {
        this.__layout__.addLayout(layout.toLayout());
    }
    addStretch(stretch) {
        this.__layout__.addStretch(stretch);
    }
    addNativeWidgetWithStretch(widget, stretch, alignment) {
        this.__layout__.addWidgetWithStretch(widget, stretch, alignment);
    }
    addWidgetWithStretch(widget, stretch, alignment) {
        this.__layout__.addWidgetWithStretch(widget.toNativeWidget(), stretch, alignment);
    }
    setDirection(direction) {
        this.__layout__.setDirection(direction);
    }
}
