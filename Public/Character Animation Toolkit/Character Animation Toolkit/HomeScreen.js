// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Widget } from "./components/common/widgets/widget.js";
import { HBoxLayout } from "./components/common/layouts/hBoxLayout.js";
import { Menu } from "./Menu/Menu.js";
import { Preview } from "./Preview/Preview.js";
import { dependencyContainer, DependencyKeys } from "./DependencyContainer.js";
import { eventBus, EventTypes } from "./EventBus.js";
import { StateKeys, stateManager } from "./StateManager.js";
export class HomeScreen {
    constructor() {
        this.menu = new Menu();
        this.preview = new Preview(this.onProcessingStart.bind(this), this.onProcessingEnd.bind(this));
        dependencyContainer.register(DependencyKeys.Preview, this.preview);
    }
    create(parent) {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new HBoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.createLoginScreen(parent);
        this.createLoadingScreen(parent);
        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
        this.authComponent = pluginSystem.findInterface(Editor.IAuthorization);
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
        stateManager.updateState(StateKeys.IsUserAuthenticated, this.authComponent.isAuthorized);
        widget.layout = layout;
        return widget;
    }
    createLoginScreen(parent) {
        this.loginScreen = new Ui.ImageView(parent);
        this.loginScreen.setFixedWidth(800);
        this.loginScreen.setFixedHeight(620);
        this.loginScreen.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/blur.svg'));
        this.loginScreen.scaledContents = true;
        const warningIconView = new Ui.ImageView(this.loginScreen);
        warningIconView.scaledContents = true;
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
        });
        this.loginScreen.visible = false;
    }
    createLoadingScreen(parent) {
        this.loadingScreen = new Ui.ImageView(parent);
        this.loadingScreen.setFixedWidth(800);
        this.loadingScreen.setFixedHeight(620);
        this.loadingScreen.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/blur_1.svg'));
        this.loadingScreen.scaledContents = true;
        this.loadingScreen.visible = false;
        const loadingScreenLayout = new Ui.BoxLayout();
        loadingScreenLayout.setContentsMargins(0, 0, 0, 0);
        loadingScreenLayout.setDirection(Ui.Direction.TopToBottom);
        this.loadingScreen.layout = loadingScreenLayout;
        loadingScreenLayout.addStretch(0);
        this.progressLabel = new Ui.ClickableLabel(this.loadingScreen);
        this.progressLabel.text = "Processing <span style='color:#ffffff'>0%</span>";
        loadingScreenLayout.addWidgetWithStretch(this.progressLabel, 0, Ui.Alignment.AlignCenter);
        this.progressBar = new Ui.ProgressBar(this.loadingScreen);
        this.progressBar.setFixedHeight(Ui.Sizes.ProgressBarHeight);
        this.progressBar.setFixedWidth(610);
        this.progressBar.minimum = 0;
        this.progressBar.maximum = 100;
        this.progressBar.value = 0;
        loadingScreenLayout.addWidgetWithStretch(this.progressBar, 0, Ui.Alignment.AlignCenter);
        loadingScreenLayout.addStretch(0);
    }
    onProcessingStart() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        let prevVal = 0;
        this.progressLabel.text = "Processing <span style='color:#ffffff'>" + "0" + "%</span>";
        this.interval = setInterval(() => {
            const newVal = this.nextProgress(prevVal);
            prevVal = newVal;
            this.progressLabel.text = "Processing <span style='color:#ffffff'>" + Math.floor(newVal) + "%</span>";
            this.progressBar.value = newVal;
        }, 50);
        this.loadingScreen.visible = true;
    }
    onProcessingEnd() {
        clearInterval(this.interval);
        this.loadingScreen.visible = false;
    }
    nextProgress(p) {
        const cap = 99.9;
        const t = p / cap;
        const k = (0.006 * (1 - t) + 0.001) * 0.5;
        const step = (cap - p) * (1 - Math.exp(-k));
        return Math.min(cap, p + step);
    }
    deinit() {
        clearInterval(this.interval);
        this.menu.deinit();
        this.preview.deinit();
    }
}
