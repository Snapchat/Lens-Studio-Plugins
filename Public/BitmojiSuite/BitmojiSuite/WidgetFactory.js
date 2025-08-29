import * as Ui from 'LensStudio:Ui';

// to-do: make it some builder util for all widgets?
export class WidgetFactory {
    static beginWidget(parent) {
        return new WidgetProxy(new Ui.Widget(parent));
    }

    static beginLabel(parent) {
        return new LabelProxy(new Ui.Label(parent));
    }

    static beginPushButton(parent) {
        return new PushButtonProxy(new Ui.PushButton(parent));
    }

    static beginSeparator(parent, orientation = Ui.Orientation.Horizontal, shadow = Ui.Shadow.Plain) {
        return new SeparatorProxy(new Ui.Separator(orientation, shadow, parent));
    }

    static beginSpacer(parent) {
        return new SpacerProxy(new Ui.Widget(parent));
    }

    static beginTabBar(parent) {
        return new TabBarProxy(new Ui.TabBar(parent));
    }

    static beginCalloutFrame(parent) {
        return new CalloutFrameProxy(new Ui.CalloutFrame(parent));
    }

    static beginImageView(parent) {
        return new ImageViewProxy(new Ui.ImageView(parent));
    }

    static beginResizableImageView(parent) {
        return WidgetFactory.beginImageView(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding).scaledContents(true).responseHover(true);
    }

    static beginVerticalLayout() {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        return new BoxLayoutProxy(layout);
    }

    static beginHorizontalLayout() {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        return new BoxLayoutProxy(layout);
    }

    static beginGridLayout() {
        return new GridLayoutProxy(new Ui.GridLayout());
    }

    static beginStackedLayout() {
        return new StackedLayoutProxy(new Ui.StackedLayout());
    }
}

class LayoutProxy {
    constructor(layout) {
        this.layout = layout;
    }

    contentsMargings(left, top = left, right = left, bottom = left) {
        this.layout.setContentsMargins(left, top, right, bottom);
        return this;
    }

    spacing(value) {
        this.layout.spacing = value;
        return this;
    }

    addWidget(widget, alignment = null) {
        this.layout.addWidget(widget);
        if (alignment) {
            this.layout.setWidgetAlignment(widget, alignment);
        }
        return this;
    }

    end() {
        return this.layout;
    }
}

class StackedLayoutProxy extends LayoutProxy {
    stackingMode(mode) {
        this.layout.stackingMode = mode;
        return this;
    }
}

class BoxLayoutProxy extends LayoutProxy {
    addStretch(value = 0) {
        this.layout.addStretch(value);
        return this;
    }

    addWidgetWithStretch(widget, stretch = 0, alignment = Ui.Alignment.Default) {
        this.layout.addWidgetWithStretch(widget, stretch, alignment);
        return this;
    }
}

class GridLayoutProxy extends LayoutProxy {

}

class WidgetProxy {
    constructor(widget) {
        this.widget = widget;
    }

    layout(value) {
        this.widget.layout = value;
        return this;
    }

    visible(value) {
        this.widget.visible = value;
        return this;
    }

    backgroundRole(role) {
        this.widget.autoFillBackground = true;
        this.widget.backgroundRole = role;
        return this;
    }

    fontRole(fontRole) {
        this.widget.fontRole = fontRole;
        return this;
    }

    foregroundRole(role) {
        this.widget.foregroundRole = role;
        return this;
    }

    minimumWidth(value) {
        this.widget.setMinimumWidth(value);
        return this;
    }

    minimumHeight(value) {
        this.widget.setMinimumHeight(value);
        return this;
    }

    height(value) {
        this.widget.setFixedHeight(value);
        return this;
    }

    width(value) {
        this.widget.setFixedWidth(value);
        return this;
    }

    contentsMargings(left, top = left, right = left, bottom = left) {
        this.widget.setContentsMargins(left, top, right, bottom);
        return this;
    }

    sizePolicy(policyWidth, policyHeight = policyWidth) {
        this.widget.setSizePolicy(policyWidth, policyHeight);
        return this;
    }

    end() {
        return this.widget;
    }
}

class ImageViewProxy extends WidgetProxy {
    pixmap(value) {
        this.widget.pixmap = value;
        return this;
    }

    scaledContents(value) {
        this.widget.scaledContents = value;
        return this;
    }

    responseHover(value) {
        this.widget.responseHover = value;
        return this;
    }
}

class TabBarProxy extends WidgetProxy {
    addTab(name) {
        this.widget.addTab(name);
        return this;
    }
}

class LabelProxy extends WidgetProxy {
    text(text) {
        this.widget.text = text;
        return this;
    }

    wordWrap(wordWrap) {
        this.widget.wordWrap = wordWrap;
        return this;
    }
}

class SeparatorProxy extends WidgetProxy {
    constructor(widget) {
        super(widget);
        this.widget.setMaximumHeight(Ui.Sizes.SeparatorLineWidth);
    }
}

class CalloutFrameProxy extends WidgetProxy {
    lineWidth(value) {
        this.widget.lineWidth = value;
        return this;
    }

    backgroundColor(value) {
        this.widget.setBackgroundColor(value);
        return this;
    }

    foregroundColor(value) {
        this.widget.setForegroundColor(value);
        return this;
    }
}

class SpacerProxy extends WidgetProxy {
    width(width) {
        this.widget.setFixedWidth(width);
        return this;
    }

    height(height) {
        this.widget.setFixedHeight(height);
        return this;
    }
}

class PushButtonProxy extends WidgetProxy {
    text(text) {
        this.widget.text = text;
        return this;
    }

    primary(value) {
        this.widget.primary = value;
        return this;
    }

    icon(icon) {
        this.widget.setIcon(icon);
        return this;
    }

    iconMode(mode) {
        this.widget.setIconMode(mode);
        return this;
    }
}
