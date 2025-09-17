// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { BoxLayout } from "./boxLayout.js";
export class HBoxLayout extends BoxLayout {
    constructor() {
        super();
        this.__layout__ = new Ui.BoxLayout();
        this.setDirection(Ui.Direction.LeftToRight);
    }
}
