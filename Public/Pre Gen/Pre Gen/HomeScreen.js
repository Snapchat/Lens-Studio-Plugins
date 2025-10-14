// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { ColorRole } from "LensStudio:Ui";
import { EffectGallery } from "./EffectGallery.js";
import { EffectSettings } from "./EffectSettings.js";
import app from "./app";
export class HomeScreen {
    constructor() {
        this.connections = [];
        this.effectSettings = new EffectSettings(this.openGallery.bind(this), this.onNewDreamCreated.bind(this), this.onPreviewLoaded.bind(this), this.updateSettings.bind(this), this.resetGallery.bind(this));
    }
    create(parent) {
        var _a;
        this.authComponent = (_a = app.pluginSystem) === null || _a === void 0 ? void 0 : _a.findInterface(Editor.IAuthorization);
        const stackedWidget = new Ui.StackedWidget(parent);
        stackedWidget.setContentsMargins(0, 0, 0, 0);
        stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        stackedWidget.autoFillBackground = true;
        stackedWidget.backgroundRole = ColorRole.Base;
        stackedWidget.setFixedWidth(800);
        stackedWidget.setFixedHeight(620);
        this.effectGallery = new EffectGallery(stackedWidget, this.openEffectSettingsPage.bind(this), this.checkDreamStateById.bind(this), this.onImportClick.bind(this), this.showLoginPage.bind(this), this.showPluginPage.bind(this));
        // stackedWidget.addWidget(this.effectGallery.widget);
        const effectSettingsWidget = this.effectSettings.create(stackedWidget, this.effectGallery.widget);
        stackedWidget.addWidget(effectSettingsWidget);
        const loginWidget = this.createLoginWidget(stackedWidget);
        stackedWidget.addWidget(loginWidget);
        stackedWidget.currentIndex = 0;
        this.stackedWidget = stackedWidget;
        if (!this.authComponent.isAuthorized) {
            this.showLoginPage();
        }
        return stackedWidget;
    }
    createLoginWidget(parent) {
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.scaledContents = true;
        imageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/init.svg'));
        imageView.move(310, 144);
        const label = new Ui.Label(widget);
        label.text = '<center>' + 'Log-in to MyLenses account <br>to get access for Gen AI tools' + '</center>';
        label.setFixedWidth(280);
        label.move(260, 304);
        const createNewButton = new Ui.PushButton(widget);
        createNewButton.text = 'Login';
        createNewButton.primary = true;
        createNewButton.setFixedWidth(78);
        createNewButton.setFixedHeight(24);
        createNewButton.move(361, 350);
        this.connections.push(createNewButton.onClick.connect(() => {
            var _a;
            (_a = this.authComponent) === null || _a === void 0 ? void 0 : _a.authorize();
        }));
        widget.layout = layout;
        return widget;
    }
    openGallery() {
        if (!this.stackedWidget) {
            return;
        }
        // this.stackedWidget.currentIndex = 0;
        this.effectSettings.setSettings({ "state": "DEFAULT", "prompt": "" });
        this.effectSettings.openGallery();
    }
    openEffectSettingsPage(settings) {
        if (!this.stackedWidget) {
            return;
        }
        this.effectSettings.setSettings(settings);
        this.effectSettings.openSettingsPage();
        // this.stackedWidget.currentIndex = 1;
    }
    showLoginPage() {
        if (!this.stackedWidget) {
            return;
        }
        this.stackedWidget.currentIndex = 1;
    }
    showPluginPage() {
        if (!this.stackedWidget) {
            return;
        }
        this.stackedWidget.currentIndex = 0;
    }
    onNewDreamCreated() {
        var _a;
        (_a = this.effectGallery) === null || _a === void 0 ? void 0 : _a.updateGallery();
    }
    resetGallery() {
        var _a;
        (_a = this.effectGallery) === null || _a === void 0 ? void 0 : _a.resetGallery();
    }
    onPreviewLoaded(id, previewUrl, isFailed = false) {
        var _a;
        (_a = this.effectGallery) === null || _a === void 0 ? void 0 : _a.addPreview(id, previewUrl, isFailed);
    }
    checkDreamStateById(id, state) {
        this.effectSettings.checkDreamStateById(id, state);
    }
    updateSettings(settings) {
        var _a;
        (_a = this.effectGallery) === null || _a === void 0 ? void 0 : _a.updateSettings(settings);
    }
    updateGallery() {
        var _a;
        (_a = this.effectGallery) === null || _a === void 0 ? void 0 : _a.updateGallery();
    }
    onImportClick(id) {
        this.effectSettings.importById(id);
    }
    deinit() {
    }
}
