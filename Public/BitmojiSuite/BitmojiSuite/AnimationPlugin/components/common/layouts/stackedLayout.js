import * as Ui from "LensStudio:Ui";
import { Layout } from "./layout.js";
export class StackedLayout extends Layout {
    constructor() {
        super();
        this.__layout__ = new Ui.StackedLayout();
    }
    addWidgetAt(widget, index) {
        return this.__layout__.addWidgetAt(widget.toNativeWidget(), index);
    }
    get currentIndex() {
        return this.__layout__.currentIndex;
    }
    set currentIndex(index) {
        this.__layout__.currentIndex = index;
    }
    get onCurrentChanged() {
        return this.__layout__.onCurrentChanged;
    }
    get stackingMode() {
        return this.__layout__.stackingMode;
    }
    set stackingMode(mode) {
        this.__layout__.stackingMode = mode;
    }
}
