// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Widget } from "./widget.js";
export class ImageView extends Widget {
    constructor(parent) {
        super(parent, Ui.ImageView);
    }
    get onClick() {
        return this.__widget__.onClick;
    }
    get onHover() {
        return this.__widget__.onHover;
    }
    get responseHover() {
        return this.__widget__.responseHover;
    }
    set responseHover(responseHover) {
        this.__widget__.responseHover = responseHover;
    }
    get scaledContents() {
        return this.__widget__.scaledContents;
    }
    set scaledContents(scaledContents) {
        this.__widget__.scaledContents = scaledContents;
    }
    get pixmap() {
        return this.__widget__.pixmap;
    }
    set pixmap(movie) {
        this.__widget__.pixmap = movie;
    }
    get radius() {
        return this.__widget__.radius;
    }
    set radius(radius) {
        this.__widget__.radius = radius;
    }
}
