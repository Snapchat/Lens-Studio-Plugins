// @ts-nocheck
import * as Ui from 'LensStudio:Ui';
export function isJsWidget(widget: Ui.Widget) {
    return widget.isOfType("JsWidget");
}
export class Widget {
    protected __widget__: any;
    private __layout__: any;

    constructor(parent: any, widget = Ui.Widget) {
        if (isJsWidget(parent)) {
            this.__widget__ = new widget(parent.toNativeWidget());
        }
        else {
            this.__widget__ = new widget(parent);
        }
    }
    isOfType(typename: any) {
        return typename === this.getTypeName();
    }
    isSame(other: any) {
        return this.__widget__.isSame(other);
    }
    getTypeName() {
        return "JsWidget";
    }
    blockSignals(block: any) {
        this.__widget__.blockSignals(block);
    }
    toNativeWidget() {
        return this.__widget__;
    }
    activateWindow() {
        this.__widget__.activateWindow();
    }
    adjustSize() {
        this.__widget__.adjustSize();
    }
    get autoFillBackground() {
        return this.__widget__.autoFillBackground;
    }
    set autoFillBackground(flag) {
        this.__widget__.autoFillBackground = flag;
    }
    set backgroundRole(role) {
        this.__widget__.backgroundRole = role;
    }
    get backgroundRole() {
        return this.__widget__.backgroundRole;
    }
    blockSignal(blocked: any) {
        this.__widget__.blockSignals(blocked);
    }
    deleteLater() {
        this.__widget__.deleteLater();
    }
    get devicePixelRatio() {
        return this.__widget__.devicePixelRatio;
    }
    set enabled(enabled) {
        this.__widget__.enabled = enabled;
    }
    get enabled() {
        return this.__widget__.enabled;
    }
    set fontRole(fontRole) {
        this.__widget__.fontRole = fontRole;
    }
    get fontRole() {
        return this.__widget__.fontRole;
    }
    set foregroundRole(foregroundRole) {
        this.__widget__.foregroundRole = foregroundRole;
    }
    get foregroundRole() {
        return this.__widget__.foregroundRole;
    }
    get height() {
        return this.__widget__.height;
    }
    set hidden(hidden) {
        this.__widget__.hidden = hidden;
    }
    get hidden() {
        return this.__widget__.hidden;
    }
    get isNull() {
        return this.__widget__.isNull;
    }
    set layout(layout) {
        this.__layout__ = layout;
        this.__widget__.layout = this.__layout__?.toLayout();
    }
    get layout() {
        return this.__layout__;
    }
    move(ax: any, ay: any) {
        this.__widget__.move(ax, ay);
    }
    get onResize() {
        return this.__widget__.onResize;
    }
    raise() {
        this.__widget__.raise();
    }
    resize(width: any, height: any) {
        this.__widget__.resize(width, height);
    }
    setContentsMargins(left: any, top: any, right: any, bottom: any) {
        this.__widget__.setContentsMargins(left, top, right, bottom);
    }
    setFixedHeight(height: any) {
        this.__widget__.setFixedHeight(height);
    }
    setFixedWidth(width: any) {
        this.__widget__.setFixedWidth(width);
    }
    setFixedSize(size: any) {
        this.setFixedWidth(size);
        this.setFixedHeight(size);
    }
    setMaximumHeight(height: any) {
        this.__widget__.setMaximumHeight(height);
    }
    setMaximumWidth(width: any) {
        this.__widget__.setMaximumWidth(width);
    }
    setMaximumSize(size: any) {
        this.setMaximumWidth(size);
        this.setMaximumHeight(size);
    }
    setMinimumHeight(height: any) {
        this.__widget__.setMinimumHeight(height);
    }
    setMinimumWidth(width: any) {
        this.__widget__.setMinimumWidth(width);
    }
    setMinimumSize(size: any) {
        this.setMinimumWidth(size);
        this.setMinimumHeight(size);
    }
    setSizePolicy(horizontal?: any, vertical?: any) {
        if (vertical) {
            this.__widget__.setSizePolicy(horizontal, vertical);
        }
        else {
            this.__widget__.setSizePolicy(horizontal, horizontal);
        }
    }
    set toolTip(toolTip) {
        this.__widget__.toolTip = toolTip;
    }
    get toolTip() {
        return this.__widget__.toolTip;
    }
    set visible(visible) {
        this.__widget__.visible = visible;
    }
    get visible() {
        return this.__widget__.visible;
    }
    get width() {
        return this.__widget__.width;
    }
    set windowTitle(windowTitle) {
        this.__widget__.windowTitle = windowTitle;
    }
    get windowTitle() {
        return this.__widget__.windowTitle;
    }
    get onShow() {
        return this.__widget__.onShow;
    }
}
