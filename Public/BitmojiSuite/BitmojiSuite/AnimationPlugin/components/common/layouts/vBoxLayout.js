import * as Ui from "LensStudio:Ui";
import { BoxLayout } from "./boxLayout.js";
export class VBoxLayout extends BoxLayout {
    constructor() {
        super();
        this.__layout__ = new Ui.BoxLayout();
        this.setDirection(Ui.Direction.TopToBottom);
    }
}
