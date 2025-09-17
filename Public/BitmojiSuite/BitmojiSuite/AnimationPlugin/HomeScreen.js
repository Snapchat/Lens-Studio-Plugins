// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Widget } from "./components/common/widgets/widget.js";
import { HBoxLayout } from "./components/common/layouts/hBoxLayout.js";
import { Menu } from "./Menu/Menu.js";
import { Preview } from "./Preview/Preview.js";
import { dependencyContainer, DependencyKeys } from "./DependencyContainer.js";
export class HomeScreen {
    constructor() {
        this.menu = new Menu();
        this.preview = new Preview();
        dependencyContainer.register(DependencyKeys.Preview, this.preview);
    }
    create(parent) {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new HBoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        const menuWidget = this.menu.create(widget);
        const previewWidget = this.preview.create(widget);
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, widget.toNativeWidget());
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        layout.addWidget(menuWidget);
        layout.addNativeWidget(separator);
        layout.addWidget(previewWidget);
        widget.layout = layout;
        this.createTransparentScreen(widget.toNativeWidget());
        return widget;
    }
    createTransparentScreen(parent) {
        this.transparentScreen = new Ui.ImageView(parent);
        this.transparentScreen.setFixedWidth(3000);
        this.transparentScreen.setFixedHeight(2000);
        this.transparentScreen.pixmap = new Ui.Pixmap(import.meta.resolve('./Menu/Resources/transparent.png'));
        this.transparentScreen.scaledContents = true;
        this.transparentScreen.visible = false;
        dependencyContainer.register(DependencyKeys.TransparentScreen, this.transparentScreen);
    }
    deinit() {
        this.menu.deinit();
    }
}
