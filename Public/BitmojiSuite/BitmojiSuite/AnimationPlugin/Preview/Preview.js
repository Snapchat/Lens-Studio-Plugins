// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Widget } from "../components/common/widgets/widget.js";
import { VBoxLayout } from "../components/common/layouts/vBoxLayout.js";
import { LBEPreview } from "./LBEPreview.js";
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import { AnimationImporter } from "../AnimationImporter.js";
import { logEventImport } from "../analytics.js";
import { TransitionMenu } from "../Menu/TransitionMenu.js";
import { blendAnimations, blendAnimationsPromise, getAnimationById } from "../api.js";
import AssetLibImporter from "../Menu/assetLibImporter.js";
export class Preview {
    constructor() {
        this.category = "";
        this.connections = [];
        this.assetId = "";
        this.isActive = true;
        this.lbePreview = new LBEPreview();
        this.animationImporter = new AnimationImporter();
        this.transitionMenu = new TransitionMenu();
        this.transitionMenu.addOnClickCallback(this.onTransitionTileClicked.bind(this));
        this.transitionMenu.addNewTileCallback(this.onNewTileClicked.bind(this));
        this.transitionMenu.addOnTileRemovedCallback(this.onTransitionTileRemoved.bind(this));
        dependencyContainer.register(DependencyKeys.LBEPreview, this.lbePreview);
    }
    create(parent) {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.setMinimumWidth(324);
        const layout = new VBoxLayout();
        layout.setDirection(Ui.Direction.BottomToTop);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.transitionMenuWidget = this.transitionMenu.create(widget);
        layout.addWidgetWithStretch(this.createFooter(widget), 0, Ui.Alignment.AlignBottom);
        layout.addWidgetWithStretch(this.transitionMenuWidget, 0, Ui.Alignment.AlignBottom);
        layout.addWidget(this.lbePreview.create(widget));
        this.transitionMenuWidget.toNativeWidget().visible = false;
        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
        this.assetLibImporter = new AssetLibImporter(pluginSystem);
        widget.layout = layout;
        return widget;
    }
    createFooter(parent) {
        const widget = new Widget(parent);
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.autoFillBackground = true;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        widget.setFixedHeight(56);
        const layout = new VBoxLayout();
        layout.setContentsMargins(16, 0, 16, 0);
        layout.spacing = 0;
        this.importButton = new Ui.PushButton(widget.toNativeWidget());
        this.importButton.text = 'Apply';
        this.importButton.primary = true;
        this.importButton.enabled = false;
        this.importButton.onClick.connect(() => {
            this.onImportTapped();
        });
        layout.addNativeWidgetWithStretch(this.importButton, 0, Ui.Alignment.AlignRight);
        this.blendButton = new Ui.PushButton(widget.toNativeWidget());
        this.blendButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/blend.svg')), Ui.IconMode.MonoChrome);
        this.blendButton.text = 'Blend animation';
        this.blendButton.primary = true;
        this.blendButton.visible = false;
        this.blendButton.onClick.connect(() => {
            var _a;
            this.blendButton.visible = false;
            this.importButton.enabled = false;
            this.importButton.visible = true;
            const tileData = this.transitionMenu.getSelectedAnimationsData();
            const animations = [];
            const animationLibrary = dependencyContainer.get(DependencyKeys.AnimationLibrary);
            tileData.forEach((data) => {
                animations.push(animationLibrary.getAnimationId(data.pageName, data.id));
            });
            animationLibrary.clearSelection();
            this.transitionMenu.reset();
            this.fbxPath = undefined;
            (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
                "event_type": "reset_animation"
            });
            const startIntervalFunction = animationLibrary.addAnimationToMyGallery("STITCHED");
            blendAnimations(animations, (response) => {
                if (!this.isActive) {
                    return;
                }
                if (response.statusCode === 200 || response.statusCode === 201) {
                    startIntervalFunction(JSON.parse(response.body).id);
                }
                else {
                    startIntervalFunction(null);
                }
            });
            animationLibrary.showMyGalleryPage();
        });
        layout.addNativeWidgetWithStretch(this.blendButton, 0, Ui.Alignment.AlignRight);
        widget.layout = layout;
        return widget;
    }
    async onImportTapped() {
        if (this.fbxPath) {
            dependencyContainer.get(DependencyKeys.TransparentScreen).visible = true;
            if (this.importButton) {
                this.importButton.enabled = false;
            }
            if (this.category !== "STITCHED") {
                try {
                    const response = await blendAnimationsPromise([this.assetId]);
                    const stitchedResponse = await this.getStitchedAnimation(JSON.parse(response.body).id);
                    const fileName = this.assetId + "_" + "bitmoji_animation" + ".fbx";
                    const url = JSON.parse(stitchedResponse.body).bitmojiUrl;
                    this.fbxPath = await this.getStitchedAsset(fileName, url);
                }
                catch (error) {
                    console.error(error);
                }
            }
            this.animationImporter.importToProject(this.fbxPath);
            logEventImport(this.category + "_BITMOJI");
            //@ts-ignore
            dependencyContainer.get(DependencyKeys.Main).editWithBitmojiComponent();
            dependencyContainer.get(DependencyKeys.AnimationLibrary).clearSelection();
            this.transitionMenuWidget.toNativeWidget().visible = false;
            dependencyContainer.get(DependencyKeys.TransparentScreen).visible = false;
        }
    }
    async getStitchedAnimation(id) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!this.isActive) {
                    clearInterval(interval);
                    return;
                }
                getAnimationById(id, (response) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        if (JSON.parse(response.body).state === "SUCCESS" || JSON.parse(response.body).state === "FAILED") {
                            clearInterval(interval);
                            resolve(response);
                        }
                    }
                });
            }, 5000);
            this.connections.push(interval);
        });
    }
    async getStitchedAsset(fileName, url) {
        return new Promise((resolve) => {
            var _a;
            (_a = this.assetLibImporter) === null || _a === void 0 ? void 0 : _a.downloadAsset(url, fileName, (response) => {
                if (!this.isActive) {
                    return;
                }
                if (response.success) {
                    resolve(response.path);
                }
            });
        });
    }
    selectTile(pageName, id, path) {
        this.transitionMenu.show();
        this.transitionMenu.selectTile(pageName, id, path);
    }
    onAnimationSelected(path, category, assetId) {
        this.category = category;
        this.fbxPath = path;
        this.assetId = assetId;
        if (this.importButton) {
            this.importButton.enabled = true;
        }
    }
    onAnimationLoadStart() {
        this.fbxPath = undefined;
        if (this.importButton) {
            this.importButton.enabled = false;
        }
    }
    onLibraryShown() {
        if (this.transitionMenuWidget) {
            this.transitionMenuWidget.toNativeWidget().visible = true;
        }
    }
    onLibraryHidden() {
        if (this.transitionMenuWidget) {
            this.transitionMenuWidget.toNativeWidget().visible = false;
        }
    }
    onTransitionTileClicked(pageName, id) {
        var _a;
        const animLibrary = dependencyContainer.get(DependencyKeys.AnimationLibrary);
        if (pageName !== null && id !== null && id !== undefined && pageName !== undefined) {
            animLibrary.selectTile(pageName, id);
        }
        else {
            animLibrary.clearSelection();
            (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
                "event_type": "reset_animation"
            });
        }
    }
    onNewTileClicked() {
        var _a;
        this.importButton.visible = false;
        this.blendButton.visible = true;
        (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
            "event_type": "reset_animation"
        });
    }
    onTransitionTileRemoved() {
        var _a;
        const visibleTilesCnt = this.transitionMenu.getVisibleTilesCount();
        if (visibleTilesCnt == 0) {
            this.importButton.visible = false;
            (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
                "event_type": "reset_animation"
            });
        }
        else if (visibleTilesCnt === 1) {
            this.blendButton.visible = false;
            this.importButton.visible = true;
        }
    }
    deinit() {
        this.isActive = false;
    }
}
