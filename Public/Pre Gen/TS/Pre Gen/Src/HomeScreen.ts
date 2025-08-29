import * as Ui from "LensStudio:Ui";
import {ColorRole} from "LensStudio:Ui";
import {EffectGallery} from "./EffectGallery.js";
import {EffectSettings} from "./EffectSettings.js";


export class HomeScreen {

    private effectGallery: EffectGallery | undefined;
    private effectSettings: EffectSettings;
    private stackedWidget: Ui.StackedWidget | undefined;

    constructor() {
        this.effectSettings = new EffectSettings(this.openGallery.bind(this), this.onNewDreamCreated.bind(this), this.onPreviewLoaded.bind(this), this.updateSettings.bind(this), this.resetGallery.bind(this));
    }

    create(parent: Ui.Widget): Ui.Widget {
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

    openGallery(): void {
        if (!this.stackedWidget) {
            return;
        }
        this.stackedWidget.currentIndex = 0;
    }

    openEffectSettingsPage(settings: any): void {
        if (!this.stackedWidget) {
            return;
        }

        this.effectSettings.setSettings(settings)
        this.stackedWidget.currentIndex = 1;
    }

    onNewDreamCreated() {
        this.effectGallery?.updateGallery();
    }

    resetGallery() {
        this.effectGallery?.resetGallery();
    }

    onPreviewLoaded(id: string, previewUrl: string, isFailed: boolean = false) {
        this.effectGallery?.addPreview(id, previewUrl, isFailed);
    }

    checkDreamStateById(id: string, state: string): void {
        this.effectSettings.checkDreamStateById(id, state);
    }

    updateSettings(settings: any): void {
        this.effectGallery?.updateSettings(settings);
    }

    updateGallery() {
        this.effectGallery?.updateGallery();
    }

    deinit(): void {

    }
}
