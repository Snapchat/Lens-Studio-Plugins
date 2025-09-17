// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {Widget} from "../components/common/widgets/widget.js";
import {VBoxLayout} from "../components/common/layouts/vBoxLayout.js";
import {LBEPreview} from "./LBEPreview.js";
import {dependencyContainer, DependencyKeys} from "../DependencyContainer.js";
import {AnimationImporter} from "../AnimationImporter.js";
import {AnimationLibrary} from "../Menu/AnimationLibrary.js";
import {BodyMorphGallery} from "../Menu/BodyMorphGallery.js";
import {HBoxLayout} from "../components/common/layouts/hBoxLayout.js";
import {ImageView} from "../components/common/widgets/imageView.js";
import {logEventImport} from "../analytics.js";
import {TransitionMenu} from "../Menu/TransitionMenu.js";
import {blendAnimations, blendAnimationsPromise, getAnimationById} from "../api";
import AssetLibImporter from "../Menu/assetLibImporter";

export class Preview {

    private lbePreview: LBEPreview;
    private animationImporter: AnimationImporter;
    private bodyMorphGallery: BodyMorphGallery;
    private transitionMenu = new TransitionMenu()
    private assetLibImporter: AssetLibImporter | undefined;
    private stackedWidget: Ui.StackedWidget | undefined;
    private importButton: Ui.PushButton | undefined;
    private blendButton: Ui.PushButton | undefined;
    private fbxPath: Editor.Path | undefined;
    private bodyMorphGlbPath: string | undefined;
    private header: Widget | undefined;
    private footer: Widget | undefined;
    private transitionMenuWidget: Widget | undefined;

    private bitmojiButton: ImageView | undefined;
    private bodyMorphButton: ImageView | undefined;
    private bitmojiButtonBackground: Ui.Pixmap;
    private bitmojiButtonHoveredBackground: Ui.Pixmap;
    private bitmojiButtonSelectedBackground: Ui.Pixmap;
    private bodyMorphButtonBackground: Ui.Pixmap;
    private bodyMorphButtonHoveredBackground: Ui.Pixmap;
    private bodyMorphButtonSelectedBackground: Ui.Pixmap;
    private isFirstBodyMorphClick: boolean = true;

    private connections: Array<any> = [];
    private width: number = 422;
    private height: number = 620;
    private characterType = 0;
    private category: string = "";
    private assetId: string = "";
    private isActive = true;
    private onCharacterTypeChange: Function = () => {};

    constructor() {
        this.bodyMorphGallery = new BodyMorphGallery();
        this.lbePreview = new LBEPreview();
        this.animationImporter = new AnimationImporter();
        this.transitionMenu = new TransitionMenu();
        this.transitionMenu.addOnClickCallback(this.onTransitionTileClicked.bind(this));
        this.transitionMenu.addNewTileCallback(this.onNewTileClicked.bind(this));
        this.transitionMenu.addOnTileRemovedCallback(this.onTransitionTileRemoved.bind(this));
        dependencyContainer.register(DependencyKeys.LBEPreview, this.lbePreview);

        this.bitmojiButtonBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bitmojiButton.svg'));
        this.bitmojiButtonHoveredBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bitmojiButton_h.svg'));
        this.bitmojiButtonSelectedBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bitmojiButton_s.svg'));

        this.bodyMorphButtonBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bodyMorphButton.svg'));
        this.bodyMorphButtonHoveredBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bodyMorphButton_h.svg'));
        this.bodyMorphButtonSelectedBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bodyMorphButton_s.svg'));

        this.bodyMorphGallery.setOnBodyMorphTapped(this.onBodyMorphTapped.bind(this));
    }

    create(parent: Widget): Widget {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.setFixedWidth(this.width);
        widget.setFixedHeight(this.height);

        const layout = new VBoxLayout()
        layout.setDirection(Ui.Direction.BottomToTop)
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        this.transitionMenuWidget = this.transitionMenu.create(widget);
        this.footer = this.createFooter(widget);
        this.header = this.createHeader(widget);

        this.stackedWidget = new Ui.StackedWidget(widget.toNativeWidget());
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget.addWidget(this.lbePreview.create(widget).toNativeWidget());
        this.stackedWidget.addWidget(this.bodyMorphGallery.create(widget).toNativeWidget());

        layout.addWidgetWithStretch(this.footer, 0, Ui.Alignment.AlignBottom);
        layout.addWidgetWithStretch(this.transitionMenuWidget, 0, Ui.Alignment.AlignBottom);
        layout.addNativeWidget(this.stackedWidget);
        layout.addWidgetWithStretch(this.header, 0, Ui.Alignment.AlignTop);

        this.header.toNativeWidget().visible = false;
        this.footer.toNativeWidget().visible = false;
        this.transitionMenuWidget.toNativeWidget().visible = false;

        const pluginSystem: Editor.PluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as Editor.PluginSystem;
        this.assetLibImporter = new AssetLibImporter(pluginSystem);

        widget.layout = layout;

        return widget;
    }

    private createHeader(parent: Widget): Widget {
        const widget = new Widget(parent);
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.autoFillBackground = true;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        widget.setFixedHeight(74);

        const layout = new VBoxLayout()
        layout.setDirection(Ui.Direction.BottomToTop)
        layout.setContentsMargins(16, 0, 16, 0);
        layout.spacing = 0;

        const buttonsWidget = new Widget(widget);
        buttonsWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const buttonsLayout = new HBoxLayout();
        buttonsLayout.setContentsMargins(0, 0, 0, 0);
        buttonsLayout.spacing = 0;

        this.bitmojiButton = new ImageView(buttonsWidget);
        this.bitmojiButton.pixmap = this.bitmojiButtonSelectedBackground;
        this.bitmojiButton.responseHover = true;
        this.bitmojiButton.scaledContents = true;
        this.bitmojiButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed)
        this.bitmojiButton.setFixedHeight(20);

        this.bodyMorphButton = new ImageView(buttonsWidget);
        this.bodyMorphButton.pixmap = this.bodyMorphButtonBackground;
        this.bodyMorphButton.responseHover = true;
        this.bodyMorphButton.scaledContents = true;
        this.bodyMorphButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed)
        this.bodyMorphButton.setFixedHeight(20);

        buttonsLayout.addWidget(this.bitmojiButton);
        buttonsLayout.addWidget(this.bodyMorphButton);
        buttonsLayout.addStretch(0);

        buttonsWidget.layout = buttonsLayout;

        this.bitmojiButton.onHover.connect((hovered: boolean) => {
            if (this.characterType === 0 || !this.bitmojiButton) {
                return;
            }

            this.bitmojiButton.pixmap = hovered ? this.bitmojiButtonHoveredBackground : this.bitmojiButtonBackground;
        })

        this.bodyMorphButton.onHover.connect((hovered: boolean) => {
            if (!this.bodyMorphButton || this.stackedWidget?.currentIndex === 1) {
                return;
            }
            if (this.characterType === 0) {
                this.bodyMorphButton.pixmap = hovered ? this.bodyMorphButtonHoveredBackground : this.bodyMorphButtonBackground;
            }
            else {
                this.bodyMorphButton.pixmap = hovered ? this.bodyMorphButtonHoveredBackground : this.bodyMorphButtonSelectedBackground;
            }
        })

        this.bitmojiButton.onClick.connect(() => {
            if (this.characterType === 0) {
                return;
            }
            this.onBitmojiButtonClicked();
        })

        this.bodyMorphButton.onClick.connect(() => {
            if (this.stackedWidget?.currentIndex === 1) {
                return;
            }
            this.onBodyMorphButtonClicked();
        })

        layout.addWidgetWithStretch(buttonsWidget, 0, Ui.Alignment.AlignBottom);

        widget.layout = layout;

        return widget;
    }

    private onBitmojiButtonClicked() {
        this.characterType = 0;
        if (this.stackedWidget) {
            this.stackedWidget.currentIndex = 0;
        }

        if (this.bitmojiButton && this.bodyMorphButton) {
            this.bitmojiButton.pixmap = this.bitmojiButtonSelectedBackground;
            this.bodyMorphButton.pixmap = this.bodyMorphButtonBackground;
        }

        if (this.footer && this.transitionMenuWidget) {
            this.footer.toNativeWidget().visible = true;
            this.transitionMenuWidget?.toNativeWidget().visible = true;
            this.lbePreview?.sendMessage({
                "event_type": "select_bitmoji"
            });
        }

        this.onCharacterTypeChange();
    }

    private onBodyMorphButtonClicked() {
        if (this.stackedWidget && (this.characterType !== 0 || this.isFirstBodyMorphClick)) {
            this.stackedWidget.currentIndex = 1;
            if (this.footer && this.transitionMenuWidget) {
                this.footer.toNativeWidget().visible = false;
                this.transitionMenuWidget.toNativeWidget().visible = false;
            }
        }

        if (this.bodyMorphButton && this.bitmojiButton) {
            this.bodyMorphButton.pixmap = this.bodyMorphButtonSelectedBackground;
            this.bitmojiButton.pixmap = this.bitmojiButtonBackground;
        }

        this.lbePreview?.sendMessage({
            "event_type": "select_body_morph"
        });

        if (this.characterType !== 1) {
            this.characterType = 1;
            this.onCharacterTypeChange();
        }
    }

    private createFooter(parent: Widget): Widget {
        const widget = new Widget(parent);
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.autoFillBackground = true;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        widget.setFixedHeight(56);

        const layout = new VBoxLayout()
        layout.setContentsMargins(16, 0, 16, 0);
        layout.spacing = 0;

        this.importButton = new Ui.PushButton(widget.toNativeWidget());
        this.importButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/import.svg')), Ui.IconMode.MonoChrome);
        this.importButton.text = 'Import to project';
        this.importButton.primary = true;
        this.importButton.enabled = false;

        this.importButton.onClick.connect(() => {
            this.onImportTapped();
        })

        layout.addNativeWidgetWithStretch(this.importButton, 0, Ui.Alignment.AlignRight);

        this.blendButton = new Ui.PushButton(widget.toNativeWidget());
        this.blendButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/blend.svg')), Ui.IconMode.MonoChrome);
        this.blendButton.text = 'Blend animation';
        this.blendButton.primary = true;
        this.blendButton.visible = false;

        this.blendButton.onClick.connect(() => {
            this.blendButton.visible = false;
            this.importButton.enabled = false;
            this.importButton.visible = true;

            const tileData = this.transitionMenu.getSelectedAnimationsData();
            const animations: string[] = [];
            const animationLibrary = (dependencyContainer.get(DependencyKeys.AnimationLibrary) as AnimationLibrary);

            tileData.forEach((data) => {
                animations.push(animationLibrary.getAnimationId(data.pageName, data.id));
            })

            animationLibrary.clearSelection();
            this.transitionMenu.reset();
            this.fbxPath = undefined;

            this.lbePreview?.sendMessage({
                "event_type": "reset_animation"
            });

            const startIntervalFunction =  animationLibrary.addAnimationToMyGallery("STITCHED");
            blendAnimations(animations, (response: any) => {
                if (!this.isActive) {
                    return;
                }
                if (response.statusCode === 200 || response.statusCode === 201) {
                    startIntervalFunction(JSON.parse(response.body).id);
                }
                else {
                    startIntervalFunction(null);
                }
            })

            animationLibrary.showMyGalleryPage();
        })

        layout.addNativeWidgetWithStretch(this.blendButton, 0, Ui.Alignment.AlignRight);

        widget.layout = layout;

        return widget;
    }

    private async onImportTapped() {
        if (this.fbxPath) {
            dependencyContainer.get(DependencyKeys.TransparentScreen).visible = true;
            if (this.importButton) {
                this.importButton.enabled = false;
            }
            if (this.characterType === 0) {
                if (this.category !== "STITCHED") {
                    try {
                        const response = await blendAnimationsPromise([this.assetId]);
                        const stitchedResponse = await this.getStitchedAnimation(JSON.parse(response.body).id);
                        const fileName = this.assetId + "_" + "bitmoji_animation" + ".fbx";
                        const url = JSON.parse(stitchedResponse.body).bitmojiUrl;
                        this.fbxPath = await this.getStitchedAsset(fileName, url);
                    } catch (error) {
                        console.error(error);
                    }
                }

                this.animationImporter.importBitmojiAnimationToProject(this.fbxPath);
                logEventImport(this.category + "_BITMOJI");
            }
            else {
                if (this.bodyMorphGlbPath) {
                    this.animationImporter.importBodyMorphAnimationToProject(this.fbxPath, this.bodyMorphGlbPath);
                    logEventImport(this.category + "_BODY_MORPH");
                }
            }
            (dependencyContainer.get(DependencyKeys.AnimationLibrary) as AnimationLibrary).clearSelection();
            this.fbxPath = undefined;

            this.onBitmojiButtonClicked();
            this.isFirstBodyMorphClick = true;
            dependencyContainer.get(DependencyKeys.TransparentScreen).visible = false;
        }
    }

    private async getStitchedAnimation(id: string) : Promise<any> {
        return new Promise((resolve) => {

            const interval = setInterval(() => {
                if (!this.isActive) {
                    clearInterval(interval);
                    return;
                }

                getAnimationById(id, (response) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        if (JSON.parse(response.body).state === "SUCCESS" || JSON.parse(response.body).state === "FAILED" ) {
                            clearInterval(interval);
                            resolve(response);
                        }
                    }
                });
            }, 5000);

            this.connections.push(interval);
        });
    }

    private async getStitchedAsset(fileName: string, url: string) : Promise<any> {
        return new Promise((resolve) => {
            this.assetLibImporter?.downloadAsset(url, fileName, (response: any) => {
                if (!this.isActive) {
                    return;
                }

                if (response.success) {
                    resolve(response.path);
                }
            })
        })
    }

    private onBodyMorphTapped(bodyMorphGlbPath: string) {
        this.isFirstBodyMorphClick = false;
        this.bodyMorphGlbPath = bodyMorphGlbPath;
        if (this.stackedWidget && this.footer && this.transitionMenuWidget) {
            this.stackedWidget.currentIndex = 0;
            this.footer.toNativeWidget().visible = true;
            this.transitionMenuWidget.toNativeWidget().visible = true;
        }
    };

    selectTile(pageName: string, id: number, path: Editor.Path): void {
        this.transitionMenu.show();
        this.transitionMenu.selectTile(pageName, id, path);
    }

    onAnimationSelected(path: Editor.Path, category: string, assetId: string) {
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
        if (this.footer && this.header && this.transitionMenuWidget) {
            this.footer.toNativeWidget().visible = true;
            this.header.toNativeWidget().visible = true;
            this.transitionMenuWidget.toNativeWidget().visible = true;
        }

        this.bodyMorphGallery.onLibraryShown();
    }

    onLibraryHidden() {
        if (this.footer && this.header && this.transitionMenuWidget) {
            this.footer.toNativeWidget().visible = false;
            this.header.toNativeWidget().visible = false;
            this.transitionMenuWidget.toNativeWidget().visible = false;
        }
    }

    getCharacterType() {
        return this.characterType;
    }

    setOnCharacterTypeChange(callback: Function) {
        this.onCharacterTypeChange = callback;
    }

    onTransitionTileClicked(pageName: string, id: number) {
        const animLibrary = (dependencyContainer.get(DependencyKeys.AnimationLibrary) as AnimationLibrary);
        if (pageName !== null && id !== null && id !== undefined && pageName !== undefined) {
            animLibrary.selectTile(pageName, id);
        }
        else {
            animLibrary.clearSelection();
            this.lbePreview?.sendMessage({
                "event_type": "reset_animation"
            });
        }
    }

    onNewTileClicked(){
        this.importButton.visible = false;
        this.blendButton.visible = true;

        this.lbePreview?.sendMessage({
            "event_type": "reset_animation"
        });
    }

    onTransitionTileRemoved() {
        const visibleTilesCnt = this.transitionMenu.getVisibleTilesCount();
        if (visibleTilesCnt == 0) {
            this.importButton.visible = false;
            this.lbePreview?.sendMessage({
                "event_type": "reset_animation"
            });
        }
        else if (visibleTilesCnt === 1) {
            this.blendButton.visible = false;
            this.importButton.visible = true
        }
    }

    deinit() {
        this.bodyMorphGallery.deinit();
        this.isActive = false;
    }
}
