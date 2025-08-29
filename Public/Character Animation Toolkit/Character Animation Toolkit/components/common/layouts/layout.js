export class Layout {
    toLayout() {
        return this.__layout__;
    }
    isOfType(typename) {
        return typename === this.getTypeName();
    }
    isSame(other) {
        return this.__layout__.isSame(other);
    }
    getTypeName() {
        return "JsLayout";
    }
    addWidget(widget) {
        this.__layout__.addWidget(widget.toNativeWidget());
    }
    addNativeWidget(widget) {
        this.__layout__.addWidget(widget);
    }
    clear(behaviour) {
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
    setContentsMargins(left, top, right, bottom) {
        this.__layout__.setContentsMargins(left, top, right, bottom);
    }
    setLayoutAlignment(layout, alignment) {
        this.__layout__.setLayoutAlignment(layout.toLayout(), alignment);
    }
    setWidgetAlignment(widget, alignment) {
        this.__layout__.setWidgetAlignment(widget.toNativeWidget(), alignment);
    }
    get spacing() {
        return this.__layout__.spacing;
    }
    set spacing(spacing) {
        this.__layout__.spacing = spacing;
    }
}
