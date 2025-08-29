import * as Ui from "LensStudio:Ui";
import { ColorRole } from "LensStudio:Ui";
import { EffectGallery } from "./EffectGallery.js";
import { EffectSettings } from "./EffectSettings.js";
export class HomeScreen {
    constructor() {
        this.effectSettings = new EffectSettings(this.openGallery.bind(this), this.onNewDreamCreated.bind(this), this.onPreviewLoaded.bind(this), this.updateSettings.bind(this), this.resetGallery.bind(this));
    }
    create(parent) {
        const stackedWidget = new Ui.StackedWidget(parent);
        stackedWidget.setContentsMargins(0, 0, 0, 0);
        stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        stackedWidget.autoFillBackground = true;
        stackedWidget.backgroundRole = ColorRole.Base;
        stackedWidget.setFixedWidth(800);
        stackedWidget.setFixedHeight(620);
        this.effectGallery = new EffectGallery(stackedWidget, this.openEffectSettingsPage.bind(this), this.checkDreamStateById.bind(this));
        stackedWidget.addWidget(this.effectGallery.widget);
        const effectSettingsWidget = this.effectSettings.create(stackedWidget);
        stackedWidget.addWidget(effectSettingsWidget);
        stackedWidget.currentIndex = 0;
        this.stackedWidget = stackedWidget;
        return stackedWidget;
    }
    openGallery() {
        if (!this.stackedWidget) {
            return;
        }
        this.stackedWidget.currentIndex = 0;
    }
    openEffectSettingsPage(settings) {
        if (!this.stackedWidget) {
            return;
        }
        this.effectSettings.setSettings(settings);
        this.stackedWidget.currentIndex = 1;
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
    deinit() {
    }
}
