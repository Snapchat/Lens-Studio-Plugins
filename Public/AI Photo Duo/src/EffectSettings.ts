import * as Ui from "LensStudio:Ui";
import {ColorRole, Direction} from "LensStudio:Ui";
import {Preview} from "./Preview.js";
import {EffectSettingsPage} from "./EffectSettingsPage.js";
import {createDream, createPack, getDreamByID, tryParseJson} from "./api.js";
import {Importer} from "./Importer.js";
import {logEventCreate, logEventEffectTraining, logEventImport} from "./analytics.js";
import {FeedbackManager} from "./FeedbackManager.js";
import {DreamSettings} from "./dreamTypes.js";
import {PreviewDownloader} from "./PreviewDownloader.js";
import {DreamPoller} from "./DreamPoller.js";

export class EffectSettings {

    // --- public API surface (methods declared below after private fields) ---

    private preview: Preview;
    private effectSettingsPage: EffectSettingsPage;
    private importer: Importer;
    private feedbackManager: FeedbackManager;
    private previewDownloader: PreviewDownloader;
    private dreamPoller: DreamPoller;

    private previewEffectButton: Ui.PushButton | undefined;
    private trainModelButton: Ui.PushButton | undefined;
    private trainLabel: Ui.Label | undefined;
    private importButton: Ui.PushButton | undefined;
    private importingWidget: Ui.Widget | undefined;
    private statusWidget: Ui.Widget | undefined;
    private stackedWidget: Ui.StackedWidget | undefined;
    private feedbackWidget: Ui.Widget | undefined;
    private popup: Ui.CalloutFrame | undefined;
    private popupLabel: Ui.Label | undefined;
    private successPopup: Ui.CalloutFrame | undefined;
    private warningPopup: Ui.CalloutFrame | undefined;

    private settings: Record<string, DreamSettings> = {};
    private previews: Record<string, Record<number, any>> = {};
    private removedItems: Record<string, boolean> = {};
    private connections: Array<Editor.ScopedConnection | Timeout> = [];

    private curId: string = "";
    private dreamId = 0;

    private onNewDreamCreatedCallback: Function;
    private onPreviewLoadedCallback: Function;
    private updateSettings: Function;
    private resetGallery: Function;

    // Relative ordering of dream states, used to guard against a stale/
    // out-of-order poll response clobbering UI that already reflects a more
    // advanced state (e.g. a late "SUCCESS" response arriving after the
    // dream has already reached PACK_SUCCESS).
    private static readonly STATE_RANK: Record<string, number> = {
        "DEFAULT": 0,
        "RUNNING": 1,
        "FAILED": 2,
        "SUCCESS": 2,
        "PACK_RUNNING": 3,
        "PACK_FAILED": 4,
        "PACK_SUCCESS": 4,
    };

    constructor(onReturnCallback: Function, onNewDreamCreatedCallback: Function, onPreviewLoadedCallback: Function, updateSettings: Function, resetGallery: Function) {
        this.onNewDreamCreatedCallback = onNewDreamCreatedCallback;
        this.onPreviewLoadedCallback = onPreviewLoadedCallback;
        this.updateSettings = updateSettings;
        this.resetGallery = resetGallery;
        this.importer = new Importer();
        this.feedbackManager = new FeedbackManager();
        this.previewDownloader = new PreviewDownloader();
        this.dreamPoller = new DreamPoller();
        this.preview = new Preview(this.previewIdxChanged.bind(this));
        this.effectSettingsPage = new EffectSettingsPage(onReturnCallback, this.onPromptChanged.bind(this), onNewDreamCreatedCallback, (removedId: string) => {
            this.removedItems[removedId] = true;
            resetGallery();
        });
    }

    // ======================== Public methods ========================

    create(parent: Ui.Widget, effectGalleryWidget: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const contentWidget = new Ui.Widget(widget);
        contentWidget.setContentsMargins(0, 0, 0, 0);

        const contentLayout = new Ui.BoxLayout();
        contentLayout.setDirection(Direction.LeftToRight);
        contentLayout.setContentsMargins(0, 0, 0, 0);
        contentLayout.spacing = 0;

        const effectSettingsPage = this.effectSettingsPage.create(widget);
        contentLayout.addWidgetWithStretch(effectSettingsPage, 0, Ui.Alignment.AlignTop | Ui.Alignment.AlignLeft);

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        separator.setFixedHeight(563);
        contentLayout.addWidgetWithStretch(separator, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignTop);

        this.stackedWidget = new Ui.StackedWidget(parent);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);
        this.stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.stackedWidget.autoFillBackground = true;
        this.stackedWidget.backgroundRole = ColorRole.Base;
        this.stackedWidget.setFixedHeight(563);
        this.stackedWidget.setFixedWidth(421);

        const previewWidget = this.preview.create(widget);
        this.stackedWidget.addWidget(previewWidget);

        this.stackedWidget.addWidget(effectGalleryWidget);

        this.stackedWidget.currentIndex = 1;

        contentLayout.addWidget(this.stackedWidget);

        contentWidget.layout = contentLayout;
        layout.addWidget(contentWidget);

        const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, widget);
        separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        layout.addWidget(separator1);

        const footer = this.createFooter(widget);
        layout.addWidget(footer);

        this.popup = new Ui.CalloutFrame(widget);
        this.popup.setForegroundColor(this.createColor(234, 85, 99, 255));
        this.popup.setBackgroundColor(this.createColor(234, 85, 99, 255));

        const popupLayout = new Ui.BoxLayout();
        this.popup.layout = popupLayout;
        popupLayout.setContentsMargins(8, 0, 8, 0);

        const infoImage = new Ui.ImageView(this.popup);
        infoImage.scaledContents = true;
        infoImage.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/warning.svg')));
        infoImage.setFixedWidth(16);
        infoImage.setFixedHeight(16);

        popupLayout.addWidgetWithStretch(infoImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter)

        this.popupLabel = new Ui.Label(this.popup);
        this.popupLabel.foregroundRole = Ui.ColorRole.BrightText;

        this.popup.visible = false;

        popupLayout.addWidgetWithStretch(this.popupLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter)

        this.successPopup = new Ui.CalloutFrame(widget);
        this.successPopup.setForegroundColor(this.createColor(76, 175, 80, 255));
        this.successPopup.setBackgroundColor(this.createColor(76, 175, 80, 255));

        const successPopupLayout = new Ui.BoxLayout();
        this.successPopup.layout = successPopupLayout;
        successPopupLayout.setContentsMargins(8, 0, 8, 0);

        const checkmarkImage = new Ui.ImageView(this.successPopup);
        checkmarkImage.scaledContents = true;
        checkmarkImage.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/checkmark.svg')));
        checkmarkImage.setFixedWidth(16);
        checkmarkImage.setFixedHeight(16);

        successPopupLayout.addWidgetWithStretch(checkmarkImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);

        const successLabel = new Ui.Label(this.successPopup);
        successLabel.text = "Import Completed Successfully";
        successLabel.foregroundRole = Ui.ColorRole.BrightText;

        successPopupLayout.addWidgetWithStretch(successLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);

        this.successPopup.setFixedHeight(32);
        this.successPopup.setFixedWidth(250);
        this.successPopup.visible = false;

        this.warningPopup = new Ui.CalloutFrame(widget);
        this.warningPopup.setForegroundColor(this.createColor(186, 85, 195, 255));
        this.warningPopup.setBackgroundColor(this.createColor(186, 85, 195, 255));

        const warningPopupLayout = new Ui.BoxLayout();
        this.warningPopup.layout = warningPopupLayout;
        warningPopupLayout.setContentsMargins(12, 8, 12, 8);
        warningPopupLayout.spacing = 8;

        const warningImage = new Ui.ImageView(this.warningPopup);
        warningImage.scaledContents = true;
        warningImage.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/warning.svg')));
        warningImage.setFixedWidth(16);
        warningImage.setFixedHeight(16);

        warningPopupLayout.addWidgetWithStretch(warningImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignTop);

        const warningLabel = new Ui.Label(this.warningPopup);
        warningLabel.text = "Do not add music, the Music Lyrics component, or the Face Animator component to your project. These components are not compatible with AI Photo Duo and will prevent the Lens from being published.";
        warningLabel.foregroundRole = Ui.ColorRole.BrightText;
        warningLabel.wordWrap = true;
        warningLabel.setFixedWidth(580);

        warningPopupLayout.addWidgetWithStretch(warningLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignTop);

        this.warningPopup.setFixedWidth(640);
        this.warningPopup.setFixedHeight(45);
        this.warningPopup.visible = false;

        widget.layout = layout;

        return widget;
    }

    setSettings(settings: DreamSettings): void {
        this.effectSettingsPage.setSettings(settings);
        this.curId = settings.id ?? "";

        if (this.previewEffectButton && this.trainModelButton && this.trainLabel && this.importButton && this.statusWidget && this.popup) {
            this.previewEffectButton.visible = false;
            this.previewEffectButton.enabled = false;
            this.trainModelButton.visible = false;
            this.feedbackManager.hide();
            this.feedbackManager.reset();
            this.trainLabel.visible = false;
            this.importButton.visible = false;
            this.importButton.enabled = true;
            this.statusWidget.visible = false;
            if (this.importingWidget) {
                this.importingWidget.visible = false;
            }
            this.popup.visible = false;
            if (this.successPopup) {
                this.successPopup.visible = false;
            }
            if (this.warningPopup) {
                this.warningPopup.visible = false;
            }
        }
        else {
            return;
        }


        if (settings.id && (settings.state === "FAILED" || settings.state === "PACK_FAILED")) {
            this.preview.setFailedState();
            this.effectSettingsPage.setId(settings.id);
            this.effectSettingsPage.unlock();
            this.previewEffectButton.visible = true;
            this.previewEffectButton.enabled = this.effectSettingsPage.prompt.length > 0;
            this.showFailedPopup();
            return;
        }

        if (settings.id && !(settings.state === "SUCCESS" || settings.state === "PACK_SUCCESS")) {
            this.settings[settings.id] = settings;
            if (settings.state.startsWith("PACK")){
                if (!this.previews[settings.id]) {
                    this.previews[settings.id] = {};
                }
                this.preview.setPreviewState(settings.id);
                this.effectSettingsPage.setId(settings.id);
                this.statusWidget.visible = true;
                this.importButton.visible = true;
                this.importButton.enabled = false;
            }
            else {
                this.preview.setWaitingState(settings.id);
                this.effectSettingsPage.setId(settings.id);
                this.previewEffectButton.visible = true;
            }
            this.effectSettingsPage.lock();
            return;
        }
        if (settings.id) {
            if (!this.settings[settings.id]) {
                this.settings[settings.id] = settings;
            }
            if (!this.previews[settings.id]) {
                this.previews[settings.id] = {};
            }
            this.preview.setPreviewState(settings.id);
            this.effectSettingsPage.setId(settings.id);
            this.effectSettingsPage.lock();
        }
        else {
            this.preview.setDefaultState();
            this.effectSettingsPage.setId("DEFAULT");
            this.previewEffectButton.visible = true;
            this.effectSettingsPage.unlock();
        }

        if (this.trainModelButton && this.importButton && this.trainLabel) {
            if (settings.state === "SUCCESS") {
                this.trainModelButton.visible = true;
                this.feedbackManager.show();
                this.trainLabel.visible = true;
            }
            else if (settings.state === "PACK_SUCCESS") {
                this.importButton.visible = true;
            }
        }
    }

    previewIdxChanged(id: string, previewId: number): void {
        const dreamSettings = this.settings[id];
        const dreamPreviews = dreamSettings?.previews;
        if (!dreamSettings || !dreamPreviews) {
            return;
        }
        if (!(dreamSettings.state === "SUCCESS" || dreamSettings.state === "PACK_SUCCESS" || dreamSettings.state.startsWith("PACK"))) {
            return;
        }
        const previewsCnt = dreamPreviews.length;
        previewId = this.mod(previewId, previewsCnt);
        if (this.previews[id][previewId]) {
            this.preview.setPreviewImages(this.previews[id][previewId], previewId, previewsCnt);
        }
        else {
            this.previews[id][previewId] = {"targetImagePath" : null};
            this.previewDownloader.download(dreamPreviews[previewId].targetImageUrl, id + "_" + previewId + "_targetImage", (path: Editor.Path) => {
                this.previews[id][previewId].targetImagePath = path;
                if (this.curId == id) {
                    this.preview.setPreviewImages(this.previews[id][previewId], previewId, previewsCnt);
                }
            })
        }
    }

    openGallery(): void {
        if (!this.stackedWidget) {
            return;
        }
        this.effectSettingsPage.showGalleryHeader();
        this.stackedWidget.currentIndex = 1;
    }

    openSettingsPage(): void {
        if (!this.stackedWidget) {
            return;
        }

        this.effectSettingsPage.showEffectHeader();
        this.stackedWidget.currentIndex = 0;
    }

    importWithPreview(settings: DreamSettings): Promise<void> {
        const previews = settings.previews ?? [];
        const previewCnt = Math.min(previews.length, 5);
        const packId = settings.packId;
        if (!packId) {
            return Promise.resolve();
        }

        const downloadPromises: Promise<any>[] = [];

        for (let i = 0; i < previewCnt; i++) {
            const url = previews[i].targetImageUrl;

            const promise = new Promise((resolve) => {
                this.previewDownloader.download(url, "hint_preview_" + i, (response: any) => {
                    resolve(response);
                }, "preview.webp");
            });

            downloadPromises.push(promise);
        }

        return Promise.all(downloadPromises)
            .then((responses) => {
                return this.importer.importToProject(packId, responses);
            })
            .catch((error) => {
                console.error("Error downloading previews:", error);
            });
    }

    importById(id: string): Promise<void> {
        if (this.settings[id] && this.settings[id].packId) {
            return this.importWithPreview(this.settings[id]);
        }
        return new Promise((resolve) => {
            getDreamByID(id, (response: any) => {
                if (response.statusCode == 200) {
                    const body = tryParseJson(response.body, "importById");
                    if (!body) {
                        resolve();
                        return;
                    }
                    this.settings[id] = body;
                    if (!this.previews[id]) {
                        this.previews[id] = {};
                    }
                    this.importWithPreview(this.settings[id]).then(resolve);
                } else {
                    console.error(`[AI Photo Duo] importById/getDreamByID failed, status code: ${response.statusCode}`);
                    resolve();
                }
            });
        });
    }

    onPromptChanged(): void {
        if (this.previewEffectButton) {
            this.previewEffectButton.enabled = this.effectSettingsPage.prompt.length > 0;
        }
        if (this.popup) {
            this.popup.visible = false;
        }
    }

    checkDreamStateById(id: string, _state: string): void {
        this.checkDreamState(id, 5000);
    }

    // ======================== Private methods ========================

    private createFooter(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setFixedHeight(56);
        widget.setFixedWidth(800);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;

        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding);

        this.trainLabel = new Ui.Label(widget);
        this.trainLabel.text = "";
        this.trainLabel.visible = false;

        layout.addWidgetWithStretch(this.trainLabel, 0, Ui.Alignment.AlignCenter);

        this.feedbackWidget = this.feedbackManager.create(widget);
        layout.addStretch(0);
        layout.addWidgetWithStretch(this.feedbackWidget, 0, Ui.Alignment.AlignRight);
        this.feedbackManager.hide();

        const previewEffectButton = new Ui.PushButton(widget);

        previewEffectButton.text = 'Generate previews';
        previewEffectButton.primary = false;
        previewEffectButton.enabled = false;

        this.connections.push(previewEffectButton.onClick.connect(() => {
            previewEffectButton.enabled = false;
            this.previewEffect();
        }))

        layout.addWidgetWithStretch(previewEffectButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        const trainModelButton = new Ui.PushButton(widget);
        trainModelButton.text = 'Train the model';
        trainModelButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/generate.svg'))), Ui.IconMode.MonoChrome)
        trainModelButton.primary = true;

        this.connections.push(trainModelButton.onClick.connect(() => {
            trainModelButton.visible = false;
            this.feedbackManager.hide();
            if (this.trainLabel) {
                this.trainLabel.visible = false;
            }
            this.createDreamPack();
        }))

        layout.addWidgetWithStretch(trainModelButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        trainModelButton.visible = false;

        const importButton = new Ui.PushButton(widget);
        importButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/import.svg'))), Ui.IconMode.MonoChrome);
        importButton.text = 'Import to project';
        importButton.primary = true;
        importButton.enabled = true;
        importButton.visible = false;

        this.connections.push(importButton.onClick.connect(() => {
            if (this.importButton) {
                this.importButton.enabled = false;
            }
            if (this.importingWidget) {
                this.importingWidget.visible = true;
            }
            this.showImportWarningPopup();
            this.importToProject().then(() => {
                if (this.importingWidget) {
                    this.importingWidget.visible = false;
                }
                if (this.importButton) {
                    this.importButton.enabled = true;
                }
                this.hideImportWarningPopup();
                this.showImportSuccessPopup();
                logEventImport("SUCCESS");
            }).catch(() => {
                if (this.importingWidget) {
                    this.importingWidget.visible = false;
                }
                if (this.importButton) {
                    this.importButton.enabled = true;
                }
                this.hideImportWarningPopup();
            });
        }))

        const statusWidget = new Ui.Widget(widget);
        statusWidget.setFixedWidth(350);
        statusWidget.setFixedHeight(24);
        const statusLayout = new Ui.BoxLayout();
        statusLayout.setDirection(Ui.Direction.LeftToRight);
        statusLayout.setContentsMargins(0, 0, 0, 0);
        statusLayout.spacing = 12;
        statusWidget.layout = statusLayout;
        statusLayout.addStretch(0);

        const statusLabel = new Ui.Label(statusWidget);
        statusLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
        statusLabel.text = '<div style="text-align: right;">' + 'Model training in progress. This may take up to 1 minute.<br>You can close this window and return later.' + '</div>';
        statusLabel.setFixedHeight(24);

        const loading = new Ui.ProgressIndicator(statusWidget);
        loading.start();
        loading.visible = true;

        statusLayout.addStretch(0);
        statusLayout.addWidgetWithStretch(statusLabel, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        statusLayout.addWidgetWithStretch(loading, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        statusLayout.addStretch(0);

        statusWidget.visible = false;

        layout.addWidgetWithStretch(statusWidget, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        const importingWidget = new Ui.Widget(widget);
        const importingLayout = new Ui.BoxLayout();
        importingLayout.setDirection(Ui.Direction.LeftToRight);
        importingLayout.setContentsMargins(0, 0, 0, 0);
        importingLayout.spacing = 8;

        const importingLabel = new Ui.Label(importingWidget);
        importingLabel.text = "Importing...";
        importingLabel.foregroundRole = Ui.ColorRole.PlaceholderText;

        const importingSpinner = new Ui.ProgressIndicator(importingWidget);
        importingSpinner.start();

        importingLayout.addWidgetWithStretch(importingLabel, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        importingLayout.addWidgetWithStretch(importingSpinner, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        importingWidget.layout = importingLayout;
        importingWidget.visible = false;

        layout.addWidgetWithStretch(importingWidget, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(importButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        this.statusWidget = statusWidget;
        this.importingWidget = importingWidget;
        this.previewEffectButton = previewEffectButton;
        this.trainModelButton = trainModelButton;
        this.importButton = importButton;

        widget.layout = layout;

        return widget;
    }

    private previewEffect(): void {
        if (this.previewEffectButton) {
            this.previewEffectButton.enabled = false;
        }

        let prompt = this.effectSettingsPage.prompt;
        const seed = Math.floor(Math.random() * 2147483648) + "";

        this.effectSettingsPage.lock();

        this.dreamId++;
        const previewId = String(this.dreamId);
        this.curId = previewId;

        this.preview.setWaitingState(this.curId);
        this.effectSettingsPage.setId(this.curId);

        this.openSettingsPage();

        createDream(prompt, seed, (response: any) => {
            if (response.statusCode == 200) {
                const body = tryParseJson(response.body, "previewEffect");
                if (previewId === this.curId && body) {
                    this.preview.setWaitingState(body.id);
                }
                this.onNewDreamCreatedCallback();
            }
            else {
                console.error(`[AI Photo Duo] createDream failed, status code: ${response.statusCode}`);
                const body = tryParseJson(response.body, "previewEffect (failure)");
                if (previewId === this.curId) {
                    if (body) {
                        this.preview.setId(body.id)
                    }
                    this.preview.setFailedState();
                    this.effectSettingsPage.unlock();
                    this.showPromptPopup();
                }

                if (response.statusCode === 400 || response.statusCode === 422) {
                    logEventCreate("GUIDELINES_VIOLATION", "NEW", "PROMPT_TEXT");
                }
                else if (response.statusCode == 429) {
                    if (previewId === this.curId && body) {
                        this.preview.setId(body.id)
                        this.preview.setDefaultState();
                        this.showPreviewLimitReachedPopup();
                    }
                }
            }
        })
    }

    private stateRank(state: string): number {
        return EffectSettings.STATE_RANK[state] ?? 1;
    }

    private isStaleState(id: string, incomingState: string): boolean {
        const cached = this.settings[id];
        return !!cached && this.stateRank(cached.state) > this.stateRank(incomingState);
    }

    private applyDreamToUiIfVisible(curSettings: DreamSettings): void {
        if (!curSettings.id) {
            return;
        }
        this.settings[curSettings.id] = curSettings;
        this.previews[curSettings.id] = {};
        if (this.preview.getId() + "" === curSettings.id + "" && this.preview.isVisible()) {
            this.setSettings(curSettings);
        }
        this.updateSettings(this.settings[curSettings.id]);
    }

    private checkDreamState(id: string, intervalVal: number): void {
        this.dreamPoller.start(id, intervalVal, {
            isRemoved: (dreamId) => !!this.removedItems[dreamId],
            isStaleState: (dreamId, incomingState) => this.isStaleState(dreamId, incomingState),
            onStateUpdated: (curSettings) => {
                this.settings[curSettings.id!] = curSettings;
            },
            onSuccess: (curSettings, isFirstSuccess) => {
                this.applyDreamToUiIfVisible(curSettings);
                if (isFirstSuccess) {
                    this.onPreviewLoadedCallback(curSettings.id, curSettings.previewUrl);
                    logEventCreate("SUCCESS", "NEW", "PROMPT_TEXT");
                }
            },
            onFailed: (curSettings) => {
                this.applyDreamToUiIfVisible(curSettings);
                this.onPreviewLoadedCallback(curSettings.id, "", true);
                logEventCreate("FAILED", "NEW", "PROMPT_TEXT");
            },
            onPackSuccess: (curSettings) => {
                this.applyDreamToUiIfVisible(curSettings);
                this.onPreviewLoadedCallback(curSettings.id, curSettings.previewUrl, false, true);
                logEventEffectTraining("PACK_SUCCESS");
            },
            onPackFailed: (curSettings) => {
                this.applyDreamToUiIfVisible(curSettings);
                this.onPreviewLoadedCallback(curSettings.id, "", true);
                logEventEffectTraining("PACK_FAILED");
            },
        });
    }

    private createDreamPack() {
        createPack(this.curId, (response: any) => {
            if (response.statusCode == 200) {
                const body = tryParseJson(response.body, "createDreamPack");
                if (!body) {
                    logEventEffectTraining("FAILED");
                    return;
                }
                this.settings[body.id] = body;
                this.updateSettings(this.settings[body.id]);
                this.onNewDreamCreatedCallback();
                if (this.statusWidget && this.importButton && this.curId !== undefined && this.curId !== null && this.curId === this.preview.getId()) {
                    this.statusWidget.visible = true;
                    this.importButton.visible = true;
                    this.importButton.enabled = false
                }
                logEventEffectTraining("SUCCESS");
            }
            else if (response.statusCode == 429) {
                if (this.curId !== undefined && this.curId !== null && this.curId === this.preview.getId()) {
                    this.showLimitReachedPopup();
                }
                logEventEffectTraining("RATE_LIMITED");
            }
            else if (response.statusCode === 400 && /PACK_SUCCESS/.test(response.body || "")) {
                // The dream was already auto-packed server-side (e.g. the backend
                // packs automatically right after SUCCESS) before the user clicked
                // "Train the model" - re-fetch the current state and show the
                // import UI instead of leaving the user stuck on a failed request.
                console.error(`[AI Photo Duo] createPack rejected because dream ${this.curId} is already packed - refreshing state`);
                const idToRefresh = this.curId;
                getDreamByID(idToRefresh, (refreshResponse: any) => {
                    if (refreshResponse.statusCode !== 200) {
                        return;
                    }
                    const refreshed = tryParseJson(refreshResponse.body, "createDreamPack (already packed)");
                    if (!refreshed || this.isStaleState(refreshed.id, refreshed.state)) {
                        return;
                    }
                    this.settings[refreshed.id] = refreshed;
                    this.previews[refreshed.id] = {};
                    this.updateSettings(this.settings[refreshed.id]);
                    if (this.curId === idToRefresh && this.preview.getId() + "" === refreshed.id + "" && this.preview.isVisible()) {
                        this.setSettings(refreshed);
                    }
                });
            }
            else {
                console.error(`[AI Photo Duo] createPack failed, status code: ${response.statusCode}`);
                logEventEffectTraining("FAILED");
            }
        })
    }

    private importToProject(): Promise<void> {
        if (this.settings[this.curId].packId) {
            return this.importWithPreview(this.settings[this.curId]);
        }
        return Promise.resolve();
    }

    private showImportWarningPopup() {
        if (!this.warningPopup) {
            return;
        }
        this.warningPopup.move(80, 4);
        this.warningPopup.visible = true;
    }

    private hideImportWarningPopup() {
        if (!this.warningPopup) {
            return;
        }
        this.warningPopup.visible = false;
    }

    private showImportSuccessPopup() {
        if (!this.successPopup) {
            return;
        }
        this.successPopup.move(280, 4);
        this.successPopup.visible = true;
    }

    private showFailedPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(72);
        this.popup.move(364, 4);

        this.popupLabel.text = "Failed";
        this.popup.visible = true;
    }

    private showPromptPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(320);
        this.popup.move(240, 4);

        this.popupLabel.text = "Prompt does not comply with community guidelines";
        this.popup.visible = true;
    }

    private showLimitReachedPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(388);
        this.popup.move(206, 4);

        this.popupLabel.text = "Limit reached – A maximum of 1 model can be trained per 4 hours.";
        this.popup.visible = true;
    }

    private showPreviewLimitReachedPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(420);
        this.popup.move(190, 4);

        this.popupLabel.text = "Limit reached — A maximum of 10 previews can be generated per hour.";
        this.popup.visible = true;
    }

    private createColor(r: number, g: number, b: number, a: number) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }

    private mod(a: number, b: number): number {
        return ((a % b) + b) % b;
    }
}
