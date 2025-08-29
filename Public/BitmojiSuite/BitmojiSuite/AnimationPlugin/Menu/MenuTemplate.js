import * as Ui from "LensStudio:Ui";
export class MenuTemplate {
    constructor() {
        this.connections = [];
    }
    createWidget(parent) {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        return widget;
    }
    createLayout() {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        return layout;
    }
    createHeader(parent, text, onReturnClicked) {
        const widget = new Ui.Widget(parent);
        widget.setFixedHeight(32);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        const imageView = new Ui.ImageView(widget);
        imageView.responseHover = true;
        const defaultImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/arrow.svg')));
        const hoveredImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/arrow_h.svg')));
        imageView.pixmap = defaultImage;
        this.connections.push(imageView.onClick.connect(() => {
            onReturnClicked();
        }));
        this.connections.push(imageView.onHover.connect((hovered) => {
            imageView.pixmap = hovered ? hoveredImage : defaultImage;
        }));
        layout.addWidget(imageView);
        layout.addStretch(0);
        const title = new Ui.Label(widget);
        title.text = text;
        title.fontRole = Ui.FontRole.LargeTitle;
        title.foregroundRole = Ui.ColorRole.BrightText;
        layout.addWidget(title);
        layout.addStretch(0);
        widget.layout = layout;
        return widget;
    }
    createContentLayout() {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        layout.spacing = 8;
        return layout;
    }
    createCalloutWidget(parent, text) {
        const frame = new Ui.CalloutFrame(parent);
        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.LeftToRight);
        frameLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        frameLayout.spacing = Ui.Sizes.Padding;
        const info = this.createInfoIcon(frame);
        frameLayout.addWidget(info);
        frameLayout.addStretch(0);
        const guidelinesLabel = new Ui.Label(frame);
        guidelinesLabel.text = text;
        guidelinesLabel.wordWrap = true;
        guidelinesLabel.openExternalLinks = true;
        frameLayout.addWidgetWithStretch(guidelinesLabel, 1, Ui.Alignment.Default);
        frame.layout = frameLayout;
        return frame;
    }
    createInfoIcon(parent) {
        return this.createIcon(parent, new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/info.svg'))));
    }
    createIcon(parent, iconImage) {
        const imageView = new Ui.ImageView(parent);
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(Ui.Sizes.IconSide);
        imageView.setFixedHeight(Ui.Sizes.IconSide);
        imageView.scaledContents = true;
        imageView.pixmap = iconImage;
        return imageView;
    }
    createLabel(parent, text) {
        const label = new Ui.Label(parent);
        label.text = text;
        label.fontRole = Ui.FontRole.Title;
        label.foregroundRole = Ui.ColorRole.BrightText;
        return label;
    }
}
