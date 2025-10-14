// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { ColorRole, Direction } from "LensStudio:Ui";
import { Preview } from "./Preview.js";
import { EffectSettingsPage } from "./EffectSettingsPage.js";
import { createDream, createPack, downloadFile, getDreamByID } from "./api.js";
import * as FileSystem from 'LensStudio:FileSystem';
import { Importer } from "./Importer.js";
import { logEventCreate, logEventEffectTraining, logEventImport } from "./analytics.js";
export class EffectSettings {
    constructor(onReturnCallback, onNewDreamCreatedCallback, onPreviewLoadedCallback, updateSettings, resetGallery) {
        this.settings = {};
        this.previews = {};
        this.curId = "";
        this.connections = [];
        this.removedItems = {};
        this.dreamId = 0;
        this.onNewDreamCreatedCallback = onNewDreamCreatedCallback;
        this.onPreviewLoadedCallback = onPreviewLoadedCallback;
        this.updateSettings = updateSettings;
        this.resetGallery = resetGallery;
        this.importer = new Importer();
        this.tempDir = FileSystem.TempDir.create();
        this.preview = new Preview(this.previewIdxChanged.bind(this));
        this.effectSettingsPage = new EffectSettingsPage(onReturnCallback, this.onPromptChanged.bind(this), onNewDreamCreatedCallback, (removedId) => {
            this.removedItems[removedId] = true;
            resetGallery();
        });
    }
    create(parent, effectGalleryWidget) {
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
        infoImage.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/warning.svg'));
        infoImage.setFixedWidth(16);
        infoImage.setFixedHeight(16);
        popupLayout.addWidgetWithStretch(infoImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        this.popupLabel = new Ui.Label(this.popup);
        this.popupLabel.foregroundRole = Ui.ColorRole.BrightText;
        this.popup.visible = false;
        popupLayout.addWidgetWithStretch(this.popupLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        widget.layout = layout;
        return widget;
    }
    createFooter(parent) {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setFixedHeight(56);
        widget.setFixedWidth(800);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;
        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding);
        this.reusePromptButton = new Ui.PushButton(widget);
        this.reusePromptButton.text = 'Copy Settings';
        this.reusePromptButton.visible = false;
        this.connections.push(this.reusePromptButton.onClick.connect(() => {
            this.reusePrompt();
        }));
        layout.addWidgetWithStretch(this.reusePromptButton, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        this.trainLabel = new Ui.Label(widget);
        // this.trainLabel.text = '<center>' + 'At this time, generations can take a day or two due to the technical limitations and high<br>demand. We are working to improve this time.' + '</center>';
        this.trainLabel.text = "";
        this.trainLabel.visible = false;
        layout.addWidgetWithStretch(this.trainLabel, 0, Ui.Alignment.AlignCenter);
        const previewEffectButton = new Ui.PushButton(widget);
        previewEffectButton.text = 'Generate previews';
        previewEffectButton.primary = false;
        previewEffectButton.enabled = false;
        this.connections.push(previewEffectButton.onClick.connect(() => {
            previewEffectButton.enabled = false;
            this.previewEffect();
        }));
        layout.addWidgetWithStretch(previewEffectButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        const trainModelButton = new Ui.PushButton(widget);
        trainModelButton.text = 'Train the Model';
        trainModelButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/generate.svg')), Ui.IconMode.MonoChrome);
        trainModelButton.primary = true;
        this.connections.push(trainModelButton.onClick.connect(() => {
            trainModelButton.visible = false;
            if (this.trainLabel) {
                this.trainLabel.visible = false;
            }
            this.createDreamPack();
        }));
        layout.addWidgetWithStretch(trainModelButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        trainModelButton.visible = false;
        const importButton = new Ui.PushButton(widget);
        importButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/import.svg')), Ui.IconMode.MonoChrome);
        importButton.text = 'Import to project';
        importButton.primary = true;
        importButton.enabled = true;
        importButton.visible = false;
        this.connections.push(importButton.onClick.connect(() => {
            if (this.importButton) {
                this.importButton.enabled = false;
            }
            this.importToProject();
            logEventImport("SUCCESS");
        }));
        const statusWidget = new Ui.Widget(widget);
        statusWidget.setFixedWidth(564);
        statusWidget.setFixedHeight(24);
        const statusLayout = new Ui.BoxLayout();
        statusLayout.setDirection(Ui.Direction.LeftToRight);
        statusLayout.setContentsMargins(0, 0, 0, 0);
        statusLayout.spacing = 12;
        statusWidget.layout = statusLayout;
        statusLayout.addStretch(0);
        const statusLabel = new Ui.Label(statusWidget);
        statusLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
        statusLabel.text = '<div style="text-align: right;">' + 'Model training in progress. At this time, generations can take a day or two due to the<br>technical limitations and high demand. We are working to improve this time.' + '</div>';
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
        layout.addWidgetWithStretch(importButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        this.statusWidget = statusWidget;
        this.previewEffectButton = previewEffectButton;
        this.trainModelButton = trainModelButton;
        this.importButton = importButton;
        widget.layout = layout;
        return widget;
    }
    setSettings(settings) {
        this.effectSettingsPage.setSettings(settings);
        this.curId = settings.id;
        if (this.previewEffectButton && this.trainModelButton && this.trainLabel && this.importButton && this.statusWidget && this.popup && this.reusePromptButton) {
            this.previewEffectButton.visible = false;
            this.previewEffectButton.enabled = false;
            this.trainModelButton.visible = false;
            this.trainLabel.visible = false;
            this.importButton.visible = false;
            this.importButton.enabled = true;
            this.statusWidget.visible = false;
            this.popup.visible = false;
            this.reusePromptButton.visible = false;
        }
        else {
            return;
        }
        if (settings.id && (settings.state === "FAILED" || settings.state === "PACK_FAILED")) {
            this.preview.setDefaultState();
            this.effectSettingsPage.setId(settings.id);
            this.effectSettingsPage.lock();
            this.reusePromptButton.visible = true;
            this.showFailedPopup();
            return;
        }
        if (settings.id && !(settings.state === "SUCCESS" || settings.state === "PACK_SUCCESS")) {
            this.settings[settings.id] = settings;
            if (settings.state.startsWith("PACK")) {
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
            this.reusePromptButton.visible = true;
            return;
        }
        if (settings.id) {
            if (!this.settings[settings.id]) {
                this.settings[settings.id] = settings;
                this.previews[settings.id] = {};
            }
            this.preview.setPreviewState(settings.id);
            this.effectSettingsPage.setId(settings.id);
            this.effectSettingsPage.lock();
            this.reusePromptButton.visible = true;
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
                this.trainLabel.visible = true;
            }
            else if (settings.state === "PACK_SUCCESS") {
                this.importButton.visible = true;
            }
        }
    }
    previewIdxChanged(id, previewId) {
        if (!(this.settings[id].state === "SUCCESS" || this.settings[id].state === "PACK_SUCCESS" || this.settings[id].state.startsWith("PACK"))) {
            return;
        }
        const previewsCnt = this.settings[id].previews.length;
        previewId = this.mod(previewId, previewsCnt);
        if (this.previews[id][previewId]) {
            this.preview.setPreviewImages(this.previews[id][previewId], previewId, previewsCnt);
        }
        else {
            this.previews[id][previewId] = { "sourceImagePath": null, "targetImagePath": null };
            this.downloadPreview(this.settings[id].previews[previewId].sourceImageUrl, id + "_" + previewId + "_sourceImage", (path) => {
                this.previews[id][previewId].sourceImagePath = path;
                if (this.previews[id][previewId].targetImagePath && this.curId == id) {
                    this.preview.setPreviewImages(this.previews[id][previewId], previewId, previewsCnt);
                }
            });
            this.downloadPreview(this.settings[id].previews[previewId].targetImageUrl, id + "_" + previewId + "_targetImage", (path) => {
                this.previews[id][previewId].targetImagePath = path;
                if (this.previews[id][previewId].sourceImagePath && this.curId == id) {
                    this.preview.setPreviewImages(this.previews[id][previewId], previewId, previewsCnt);
                }
            });
        }
    }
    openGallery() {
        if (!this.stackedWidget) {
            return;
        }
        this.effectSettingsPage.showGalleryHeader();
        this.stackedWidget.currentIndex = 1;
    }
    openSettingsPage() {
        if (!this.stackedWidget) {
            return;
        }
        this.effectSettingsPage.showEffectHeader();
        this.stackedWidget.currentIndex = 0;
    }
    previewEffect() {
        if (this.previewEffectButton) {
            this.previewEffectButton.enabled = false;
        }
        let prompt = this.effectSettingsPage.prompt;
        const seed = this.effectSettingsPage.seed + "";
        this.effectSettingsPage.lock();
        if (this.reusePromptButton) {
            this.reusePromptButton.visible = true;
        }
        this.dreamId++;
        this.curId = "new_dream_" + this.dreamId;
        this.preview.setWaitingState(this.curId);
        this.effectSettingsPage.setId(this.curId);
        this.openSettingsPage();
        createDream(prompt, seed, (response) => {
            if (response.statusCode == 200) {
                this.onNewDreamCreatedCallback();
            }
            else {
                if (this.curId !== undefined && this.curId !== null && this.curId === this.preview.getId()) {
                    this.preview.setDefaultState();
                    this.showPromptPopup();
                }
                if (response.statusCode === 400 || response.statusCode === 422) {
                    logEventCreate("GUIDELINES_VIOLATION", "NEW", "PROMPT_TEXT");
                }
                else if (response.statusCode == 429) {
                    if (this.curId !== undefined && this.curId !== null && this.curId === this.preview.getId()) {
                        this.preview.setDefaultState();
                        this.showPreviewLimitReachedPopup();
                    }
                }
            }
        });
    }
    checkDreamState(id, intervalVal) {
        const checkState = (id) => {
            if (this.removedItems[id]) {
                clearInterval(interval);
                return;
            }
            getDreamByID(id, (response) => {
                const curSettings = JSON.parse(response.body);
                if (curSettings.state == "SUCCESS") {
                    clearInterval(interval);
                    this.settings[curSettings.id] = curSettings;
                    this.previews[curSettings.id] = {};
                    if (this.preview.getId() + "" === curSettings.id + "" || (this.curId !== undefined && this.curId !== null && this.curId.startsWith("new_dream_") && this.curId === this.preview.getId())) {
                        this.setSettings(curSettings);
                    }
                    this.updateSettings(this.settings[JSON.parse(response.body).id]);
                    this.onPreviewLoadedCallback(curSettings.id, curSettings.previewUrl);
                    logEventCreate("SUCCESS", "NEW", "PROMPT_TEXT");
                }
                else if (curSettings.state == "FAILED") {
                    clearInterval(interval);
                    this.settings[curSettings.id] = curSettings;
                    this.previews[curSettings.id] = {};
                    if (this.preview.getId() + "" === curSettings.id + "" || (this.curId !== undefined && this.curId !== null && this.curId.startsWith("new_dream_") && this.curId === this.preview.getId())) {
                        this.setSettings(curSettings);
                    }
                    this.updateSettings(this.settings[JSON.parse(response.body).id]);
                    this.onPreviewLoadedCallback(curSettings.id, "", true);
                    logEventCreate("FAILED", "NEW", "PROMPT_TEXT");
                }
            });
        };
        const interval = setInterval(() => {
            checkState(id);
        }, intervalVal);
        this.connections.push(interval);
    }
    createDreamPack() {
        createPack(this.curId, (response) => {
            if (response.statusCode == 200) {
                this.settings[JSON.parse(response.body).id] = JSON.parse(response.body);
                this.updateSettings(this.settings[JSON.parse(response.body).id]);
                this.onNewDreamCreatedCallback();
                if (this.statusWidget && this.curId !== undefined && this.curId !== null && this.curId === this.preview.getId()) {
                    this.statusWidget.visible = true;
                    this.importButton.visible = true;
                    this.importButton.enabled = false;
                }
                logEventEffectTraining("SUCCESS");
            }
            else if (response.statusCode == 429) {
                if (this.curId !== undefined && this.curId !== null && this.curId === this.preview.getId()) {
                    this.showLimitReachedPopup();
                }
                logEventEffectTraining("RATE_LIMITED");
            }
            else {
                logEventEffectTraining("FAILED");
            }
        });
    }
    importToProject() {
        if (this.settings[this.curId].packId) {
            this.importer.importToProject(this.settings[this.curId].packId);
        }
    }
    importById(id) {
        if (this.settings[id] && this.settings[id].packId) {
            this.importer.importToProject(this.settings[id].packId);
        }
        else {
            getDreamByID(id, (response) => {
                if (response.statusCode == 200) {
                    this.settings[id] = JSON.parse(response.body);
                    this.importer.importToProject(this.settings[id].packId);
                }
            });
        }
    }
    reusePrompt() {
        this.setSettings({ "state": "DEFAULT", "prompt": this.effectSettingsPage.prompt, "seed": this.effectSettingsPage.seed });
        if (this.previewEffectButton) {
            this.previewEffectButton.enabled = true;
        }
    }
    showFailedPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(72);
        this.popup.move(364, 4);
        this.popupLabel.text = "Failed";
        this.popup.visible = true;
    }
    showPromptPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(320);
        this.popup.move(240, 4);
        this.popupLabel.text = "Prompt does not comply with community guidelines";
        this.popup.visible = true;
    }
    showLimitReachedPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(388);
        this.popup.move(206, 4);
        this.popupLabel.text = "Limit reached – A maximum of 1 model can be trained per 4 hours.";
        this.popup.visible = true;
    }
    showPreviewLimitReachedPopup() {
        if (!this.popup || !this.popupLabel) {
            return;
        }
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(420);
        this.popup.move(190, 4);
        this.popupLabel.text = "Limit reached — A maximum of 10 previews can be generated per hour.";
        this.popup.visible = true;
    }
    onPromptChanged() {
        if (this.previewEffectButton) {
            this.previewEffectButton.enabled = this.effectSettingsPage.prompt.length > 19;
        }
    }
    checkDreamStateById(id, state) {
        this.checkDreamState(id, 5000);
    }
    downloadPreview(url, fileName, callback) {
        const tempDir = this.tempDir;
        downloadFile(url, (response) => {
            if (response.statusCode === 200) {
                const path = tempDir.path.appended(fileName + ".jpeg");
                const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());
                const resolvedFilePath = import.meta.resolve(path.toString());
                if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                    FileSystem.writeFile(path, response.body.toBytes());
                    callback(path);
                }
                else {
                    throw new Error(`Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
                }
            }
        });
    }
    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }
    mod(a, b) {
        return ((a % b) + b) % b;
    }
}
