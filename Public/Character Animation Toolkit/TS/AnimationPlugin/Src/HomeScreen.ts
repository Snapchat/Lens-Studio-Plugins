// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {Widget} from "./components/common/widgets/widget.js";
import {HBoxLayout} from "./components/common/layouts/hBoxLayout.js";
import {Menu} from "./Menu/Menu.js";
import {Preview} from "./Preview/Preview.js";
import {dependencyContainer, DependencyKeys} from "./DependencyContainer.js";
import {eventBus, EventTypes} from "./EventBus.js";
import {StateKeys, stateManager} from "./StateManager.js";
import PluginSystem = Editor.PluginSystem;

export class HomeScreen {

    private menu: Menu;
    private preview: Preview;
    private loginScreen: Ui.ImageView | undefined;
    private transparentScreen: Ui.ImageView | undefined;
    private authComponent: Editor.IAuthorization | undefined;

    constructor() {
        this.menu = new Menu();
        this.preview = new Preview();

        dependencyContainer.register(DependencyKeys.Preview, this.preview);
    }

    create(parent: Ui.Widget): Widget {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const layout = new HBoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        this.createLoginScreen(parent);
        this.createTransparentScreen(parent);

        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as PluginSystem;
        this.authComponent = pluginSystem.findInterface(Editor.IAuthorization) as Editor.IAuthorization;
        this.authComponent.onAuthorizationChange.connect((authStatus) => {
            if (!authStatus) {
                if (this.loginScreen) {
                    this.loginScreen.visible = true;
                    this.loginScreen.raise();
                }
            }
            else {
                if (this.loginScreen) {
                    this.loginScreen.visible = false;
                }
            }

            stateManager.updateState(StateKeys.IsUserAuthenticated, authStatus);
            eventBus.emit(EventTypes.OnAuthorizationChange, authStatus);
        });

        const menuWidget = this.menu.create(widget);
        const previewWidget = this.preview.create(widget);

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, widget.toNativeWidget());
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        layout.addWidget(menuWidget);
        layout.addNativeWidget(separator);
        layout.addWidget(previewWidget);

        if (!this.authComponent.isAuthorized) {
            if (this.loginScreen) {
                this.loginScreen.visible = true;
                this.loginScreen.raise();
            }
        }

        stateManager.updateState(StateKeys.IsUserAuthenticated, this.authComponent.isAuthorized)

        widget.layout = layout;

        return widget;
    }

    private createLoginScreen(parent: Ui.Widget): void {
        this.loginScreen = new Ui.ImageView(parent);
        this.loginScreen.setFixedWidth(800);
        this.loginScreen.setFixedHeight(620)
        this.loginScreen.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/blur.svg'));
        this.loginScreen.scaledContents = true;

        const warningIconView = new Ui.ImageView(this.loginScreen);
        warningIconView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        warningIconView.move(382, 239);
        warningIconView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/warning.svg'));
        warningIconView.setFixedHeight(36);
        warningIconView.setFixedWidth(36);

        const warningLabel = new Ui.Label(this.loginScreen);
        warningLabel.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        warningLabel.setFixedWidth(174);
        warningLabel.wordWrap = true;
        warningLabel.text = '<center>' + 'Log-in to MyLenses account <br>to get access for Gen AI tools' + '</center>';
        warningLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
        warningLabel.move(313, 286);

        const loginButton = new Ui.PushButton(this.loginScreen);
        loginButton.text = "Login";
        loginButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/profile_icon.svg')), Ui.IconMode.MonoChrome);
        loginButton.setFixedWidth(66);
        loginButton.setFixedHeight(24);
        loginButton.primary = true;
        loginButton.enabled = true;
        loginButton.move(367, 332);

        loginButton.onClick.connect(() => {
            this.authComponent?.authorize();
        })

        this.loginScreen.visible = false;
    }

    private createTransparentScreen(parent: Ui.Widget): void {
        this.transparentScreen = new Ui.ImageView(parent);
        this.transparentScreen.setFixedWidth(800);
        this.transparentScreen.setFixedHeight(620)
        this.transparentScreen.pixmap = new Ui.Pixmap(import.meta.resolve('./Menu/Resources/transparent.png'));
        this.transparentScreen.scaledContents = true;
        this.transparentScreen.visible = false;

        dependencyContainer.register(DependencyKeys.TransparentScreen, this.transparentScreen);
    }

    deinit(): void {
        this.menu.deinit();
        this.preview.deinit();
    }
}
