import * as Ui from "LensStudio:Ui";
import { Widget } from "../components/common/widgets/widget.js";
import { VBoxLayout } from "../components/common/layouts/vBoxLayout.js";
import { LBEPreview } from "./LBEPreview.js";
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import { AnimationImporter } from "../AnimationImporter.js";
import { BodyMorphGallery } from "../Menu/BodyMorphGallery.js";
import { HBoxLayout } from "../components/common/layouts/hBoxLayout.js";
import { ImageView } from "../components/common/widgets/imageView.js";
import { logEventImport } from "../analytics.js";
export class Preview {
    constructor() {
        this.isFirstBodyMorphClick = true;
        this.width = 422;
        this.height = 620;
        this.characterType = 0;
        this.category = "";
        this.onCharacterTypeChange = () => { };
        this.bodyMorphGallery = new BodyMorphGallery();
        this.lbePreview = new LBEPreview();
        this.animationImporter = new AnimationImporter();
        dependencyContainer.register(DependencyKeys.LBEPreview, this.lbePreview);
        this.bitmojiButtonBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bitmojiButton.svg'));
        this.bitmojiButtonHoveredBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bitmojiButton_h.svg'));
        this.bitmojiButtonSelectedBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bitmojiButton_s.svg'));
        this.bodyMorphButtonBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bodyMorphButton.svg'));
        this.bodyMorphButtonHoveredBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bodyMorphButton_h.svg'));
        this.bodyMorphButtonSelectedBackground = new Ui.Pixmap(import.meta.resolve('./Resources/bodyMorphButton_s.svg'));
        this.bodyMorphGallery.setOnBodyMorphTapped(this.onBodyMorphTapped.bind(this));
    }
    create(parent) {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.setFixedWidth(this.width);
        widget.setFixedHeight(this.height);
        const layout = new VBoxLayout();
        layout.setDirection(Ui.Direction.BottomToTop);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.footer = this.createFooter(widget);
        this.header = this.createHeader(widget);
        this.stackedWidget = new Ui.StackedWidget(widget.toNativeWidget());
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);
        this.stackedWidget.addWidget(this.lbePreview.create(widget).toNativeWidget());
        this.stackedWidget.addWidget(this.bodyMorphGallery.create(widget).toNativeWidget());
        layout.addWidgetWithStretch(this.footer, 0, Ui.Alignment.AlignBottom);
        layout.addNativeWidget(this.stackedWidget);
        layout.addWidgetWithStretch(this.header, 0, Ui.Alignment.AlignTop);
        this.header.toNativeWidget().visible = false;
        this.footer.toNativeWidget().visible = false;
        widget.layout = layout;
        return widget;
    }
    createHeader(parent) {
        const widget = new Widget(parent);
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.autoFillBackground = true;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        widget.setFixedHeight(74);
        const layout = new VBoxLayout();
        layout.setDirection(Ui.Direction.BottomToTop);
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
        this.bitmojiButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.bitmojiButton.setFixedHeight(20);
        this.bodyMorphButton = new ImageView(buttonsWidget);
        this.bodyMorphButton.pixmap = this.bodyMorphButtonBackground;
        this.bodyMorphButton.responseHover = true;
        this.bodyMorphButton.scaledContents = true;
        this.bodyMorphButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.bodyMorphButton.setFixedHeight(20);
        buttonsLayout.addWidget(this.bitmojiButton);
        buttonsLayout.addWidget(this.bodyMorphButton);
        buttonsLayout.addStretch(0);
        buttonsWidget.layout = buttonsLayout;
        this.bitmojiButton.onHover.connect((hovered) => {
            if (this.characterType === 0 || !this.bitmojiButton) {
                return;
            }
            this.bitmojiButton.pixmap = hovered ? this.bitmojiButtonHoveredBackground : this.bitmojiButtonBackground;
        });
        this.bodyMorphButton.onHover.connect((hovered) => {
            var _a;
            if (!this.bodyMorphButton || ((_a = this.stackedWidget) === null || _a === void 0 ? void 0 : _a.currentIndex) === 1) {
                return;
            }
            if (this.characterType === 0) {
                this.bodyMorphButton.pixmap = hovered ? this.bodyMorphButtonHoveredBackground : this.bodyMorphButtonBackground;
            }
            else {
                this.bodyMorphButton.pixmap = hovered ? this.bodyMorphButtonHoveredBackground : this.bodyMorphButtonSelectedBackground;
            }
        });
        this.bitmojiButton.onClick.connect(() => {
            if (this.characterType === 0) {
                return;
            }
            this.onBitmojiButtonClicked();
        });
        this.bodyMorphButton.onClick.connect(() => {
            var _a;
            if (((_a = this.stackedWidget) === null || _a === void 0 ? void 0 : _a.currentIndex) === 1) {
                return;
            }
            this.onBodyMorphButtonClicked();
        });
        layout.addWidgetWithStretch(buttonsWidget, 0, Ui.Alignment.AlignBottom);
        widget.layout = layout;
        return widget;
    }
    onBitmojiButtonClicked() {
        var _a;
        this.characterType = 0;
        if (this.stackedWidget) {
            this.stackedWidget.currentIndex = 0;
        }
        if (this.bitmojiButton && this.bodyMorphButton) {
            this.bitmojiButton.pixmap = this.bitmojiButtonSelectedBackground;
            this.bodyMorphButton.pixmap = this.bodyMorphButtonBackground;
        }
        if (this.footer) {
            this.footer.toNativeWidget().visible = true;
            (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
                "event_type": "select_bitmoji"
            });
        }
        this.onCharacterTypeChange();
    }
    onBodyMorphButtonClicked() {
        var _a;
        if (this.stackedWidget && (this.characterType !== 0 || this.isFirstBodyMorphClick)) {
            this.stackedWidget.currentIndex = 1;
            if (this.footer) {
                this.footer.toNativeWidget().visible = false;
            }
        }
        if (this.bodyMorphButton && this.bitmojiButton) {
            this.bodyMorphButton.pixmap = this.bodyMorphButtonSelectedBackground;
            this.bitmojiButton.pixmap = this.bitmojiButtonBackground;
        }
        (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
            "event_type": "select_body_morph"
        });
        if (this.characterType !== 1) {
            this.characterType = 1;
            this.onCharacterTypeChange();
        }
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
        this.importButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/import.svg')), Ui.IconMode.MonoChrome);
        this.importButton.text = 'Import to project';
        this.importButton.primary = true;
        this.importButton.enabled = false;
        this.importButton.onClick.connect(() => {
            if (this.fbxPath) {
                if (this.importButton) {
                    this.importButton.enabled = false;
                }
                if (this.characterType === 0) {
                    this.animationImporter.importBitmojiAnimationToProject(this.fbxPath);
                    logEventImport(this.category + "_BITMOJI");
                }
                else {
                    if (this.bodyMorphGlbPath) {
                        this.animationImporter.importBodyMorphAnimationToProject(this.fbxPath, this.bodyMorphGlbPath);
                        logEventImport(this.category + "_BODY_MORPH");
                    }
                }
                dependencyContainer.get(DependencyKeys.AnimationLibrary).clearSelection();
                this.fbxPath = undefined;
                this.onBitmojiButtonClicked();
                this.isFirstBodyMorphClick = true;
            }
        });
        layout.addNativeWidgetWithStretch(this.importButton, 0, Ui.Alignment.AlignRight);
        widget.layout = layout;
        return widget;
    }
    onBodyMorphTapped(bodyMorphGlbPath) {
        this.isFirstBodyMorphClick = false;
        this.bodyMorphGlbPath = bodyMorphGlbPath;
        if (this.stackedWidget && this.footer) {
            this.stackedWidget.currentIndex = 0;
            this.footer.toNativeWidget().visible = true;
        }
    }
    ;
    onAnimationSelected(path, category) {
        this.category = category;
        this.fbxPath = path;
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
        if (this.footer && this.header) {
            this.footer.toNativeWidget().visible = true;
            this.header.toNativeWidget().visible = true;
        }
        this.bodyMorphGallery.onLibraryShown();
    }
    onLibraryHidden() {
        if (this.footer && this.header) {
            this.footer.toNativeWidget().visible = false;
            this.header.toNativeWidget().visible = false;
        }
    }
    getCharacterType() {
        return this.characterType;
    }
    setOnCharacterTypeChange(callback) {
        this.onCharacterTypeChange = callback;
    }
    deinit() {
        this.bodyMorphGallery.deinit();
    }
}
