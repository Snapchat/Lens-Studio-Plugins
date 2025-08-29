import {Widget} from "../widgets/widget.js";
import * as Ui from "LensStudio:Ui";

export class Layout {
    protected __layout__: any;
    toLayout() {
        return this.__layout__;
    }
    isOfType(typename: any) {
        return typename === this.getTypeName();
    }
    isSame(other: any) {
        return this.__layout__.isSame(other);
    }
    getTypeName() {
        return "JsLayout";
    }
    addWidget(widget: Widget) {
        this.__layout__.addWidget(widget.toNativeWidget());
    }
    addNativeWidget(widget: Ui.Widget) {
        this.__layout__.addWidget(widget);
    }
    clear(behaviour: any) {
        this.__layout__.clear(behaviour);
    }
    deleteLater() {
        this.__layout__.deleteLater();
    }
    get enabled() {
        return this.__layout__.enabled;
    }
    set enabled(enabled) {
        this.__layout__.enabled = enabled;
    }
    get isNull() {
        return this.__layout__.isNull;
    }
    setContentsMargins(left: any, top: any, right: any, bottom: any) {
        this.__layout__.setContentsMargins(left, top, right, bottom);
    }
    setLayoutAlignment(layout: any, alignment: any) {
        this.__layout__.setLayoutAlignment(layout.toLayout(), alignment);
    }
    setWidgetAlignment(widget: any, alignment: any) {
        this.__layout__.setWidgetAlignment(widget.toNativeWidget(), alignment);
    }
    get spacing() {
        return this.__layout__.spacing;
    }
    set spacing(spacing) {
        this.__layout__.spacing = spacing;
    }
}
