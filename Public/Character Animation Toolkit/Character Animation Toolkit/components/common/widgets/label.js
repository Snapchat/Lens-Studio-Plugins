// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Widget } from "./widget.js";
export class Label extends Widget {
    constructor(parent) {
        super(parent, Ui.Label);
    }
    get openExternalLinks() {
        return this.__widget__.openExternalLinks;
    }
    set openExternalLinks(openExternalLinks) {
        this.__widget__.openExternalLinks = openExternalLinks;
    }
    get text() {
        return this.__widget__.text;
    }
    set text(text) {
        this.__widget__.text = text;
    }
    get wordWrap() {
        return this.__widget__.wordWrap;
    }
    set wordWrap(wordWrap) {
        this.__widget__.wordWrap = wordWrap;
    }
}
