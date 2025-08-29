import * as Ui from "LensStudio:Ui";
import { Layout } from "./layout.js";
import {Widget} from "../widgets/widget.js";
export class BoxLayout extends Layout {
    constructor() {
        super();
        this.__layout__ = new Ui.BoxLayout();
    }
    addLayout(layout: any) {
        this.__layout__.addLayout(layout.toLayout());
    }
    addStretch(stretch: any) {
        this.__layout__.addStretch(stretch);
    }
    addNativeWidgetWithStretch(widget: Ui.Widget, stretch: any, alignment: any) {
        this.__layout__.addWidgetWithStretch(widget, stretch, alignment);
    }
    addWidgetWithStretch(widget: Widget, stretch: any, alignment: any) {
        this.__layout__.addWidgetWithStretch(widget.toNativeWidget(), stretch, alignment);
    }
    setDirection(direction: any) {
        this.__layout__.setDirection(direction);
    }
}
