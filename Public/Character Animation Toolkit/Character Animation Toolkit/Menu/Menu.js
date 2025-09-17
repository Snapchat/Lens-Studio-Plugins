// @ts-nocheck
import { Widget } from "../components/common/widgets/widget.js";
import { VBoxLayout } from "../components/common/layouts/vBoxLayout.js";
import * as Ui from "LensStudio:Ui";
import { BoxLayout } from "../components/common/layouts/boxLayout.js";
import { AnimationLibrary } from "./AnimationLibrary.js";
import { TextPromptMode } from "./TextPromptMode.js";
import { CaptureFromVideoMode } from "./CaptureFromVideoMode.js";
import { MenuTemplate } from "./MenuTemplate.js";
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import { UploadAnimationMode } from "./UploadAnimationMode.js";
export class Menu {
    constructor() {
        this.connections = [];
        this.width = 378;
        this.height = 620;
        this.animationLibrary = new AnimationLibrary();
        this.textPromptMode = new TextPromptMode(this.animationLibrary);
        this.captureFromVideoMode = new CaptureFromVideoMode(this.animationLibrary);
        this.uploadAnimationMode = new UploadAnimationMode(this.animationLibrary);
        this.menuTemplate = new MenuTemplate();
    }
    create(parent) {
        const widget = new Widget(parent);
        widget.setFixedWidth(this.width);
        widget.setFixedHeight(this.height);
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.autoFillBackground = true;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new VBoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.menuStackedWidget = new Ui.StackedWidget(widget.toNativeWidget());
        this.menuStackedWidget.setContentsMargins(0, 0, 0, 0);
        this.menuStackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const menuWidget = this.createMenu(this.menuStackedWidget);
        this.menuStackedWidget.addWidget(menuWidget.toNativeWidget());
        this.menuStackedWidget.addWidget(this.animationLibrary.create(menuWidget, () => {
            this.changeStackedWidgetIndex(this, 0);
        }).toNativeWidget());
        this.menuStackedWidget.addWidget(this.textPromptMode.create(menuWidget.toNativeWidget(), () => {
            this.changeStackedWidgetIndex(this, 0);
        }, this.goToGalleryPage.bind(this)));
        this.menuStackedWidget.addWidget(this.captureFromVideoMode.create(menuWidget.toNativeWidget(), () => {
            this.changeStackedWidgetIndex(this, 0);
        }, this.goToGalleryPage.bind(this)));
        this.menuStackedWidget.addWidget(this.uploadAnimationMode.create(menuWidget.toNativeWidget(), () => {
            this.changeStackedWidgetIndex(this, 0);
        }, this.goToGalleryPage.bind(this)));
        this.menuStackedWidget.currentIndex = 0;
        layout.addNativeWidget(this.menuStackedWidget);
        widget.layout = layout;
        return widget;
    }
    createMenu(parent) {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new BoxLayout();
        layout.setDirection(Ui.Direction.BottomToTop);
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding);
        layout.spacing = Ui.Sizes.DoublePadding;
        // Buttons
        const buttonsWidget = this.createButtons(widget.toNativeWidget());
        const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/character-animation';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices.';
        const guideLines = this.menuTemplate.createCalloutWidget(widget.toNativeWidget(), guideLinesText);
        layout.addNativeWidgetWithStretch(guideLines, 0, Ui.Alignment.AlignBottom);
        const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
        const termsUrlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);
        const termsText = 'By using the feature, you agree to our ' + termsUrlString;
        const terms = this.menuTemplate.createCalloutWidget(widget.toNativeWidget(), termsText);
        layout.addNativeWidgetWithStretch(terms, 0, Ui.Alignment.AlignBottom);
        layout.addStretch(1);
        layout.addNativeWidgetWithStretch(buttonsWidget, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(1);
        widget.layout = layout;
        return widget;
    }
    changeStackedWidgetIndex(_this, idx) {
        if (_this.menuStackedWidget) {
            const preview = dependencyContainer.get(DependencyKeys.Preview);
            if (idx === 1) {
                preview.onLibraryShown();
            }
            else {
                preview.onLibraryHidden();
            }
            _this.menuStackedWidget.currentIndex = idx;
        }
    }
    goToGalleryPage(val) {
        this.animationLibrary.showMyGalleryPage();
        if (val === 1) {
            this.animationLibrary.setReturnFunction(this.goToTextPromptPage.bind(this));
        }
        else if (val === 2) {
            this.animationLibrary.setReturnFunction(this.goToCaptureFromVideoPage.bind(this));
        }
        else if (val === 3) {
            this.animationLibrary.setReturnFunction(this.goToUploadFilePage.bind(this));
        }
        this.changeStackedWidgetIndex(this, 1);
    }
    goToTextPromptPage() {
        this.changeStackedWidgetIndex(this, 2);
    }
    goToCaptureFromVideoPage() {
        this.changeStackedWidgetIndex(this, 3);
    }
    goToUploadFilePage() {
        this.changeStackedWidgetIndex(this, 4);
    }
    createButtons(parent) {
        const buttonsWidget = new Ui.Widget(parent);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.TopToBottom);
        buttonsLayout.setContentsMargins(0, 0, 0, 0);
        buttonsLayout.spacing = Ui.Sizes.Padding;
        const buttonsLayout1 = new Ui.BoxLayout();
        buttonsLayout1.setDirection(Ui.Direction.LeftToRight);
        buttonsLayout1.setContentsMargins(0, 0, 0, 0);
        buttonsLayout1.spacing = Ui.Sizes.Padding;
        const buttonsLayout2 = new Ui.BoxLayout();
        buttonsLayout2.setDirection(Ui.Direction.LeftToRight);
        buttonsLayout2.setContentsMargins(0, 0, 0, 0);
        buttonsLayout2.spacing = Ui.Sizes.Padding;
        const textPromptButton = this.createButton(buttonsWidget, "textPromptMenuButton.svg", "textPromptMenuButton_h.svg", 135, 2, this.changeStackedWidgetIndex);
        const captureFromVideoButton = this.createButton(buttonsWidget, "captureFromVideoMenuButton.svg", "captureFromVideoMenuButton_h.svg", 135, 3, this.changeStackedWidgetIndex);
        const uploadAnimationButton = this.createButton(buttonsWidget, "uploadAnimationMenuButton.svg", "uploadAnimationMenuButton_h.svg", 135, 4, this.changeStackedWidgetIndex);
        const chooseFromLibraryButton = this.createButton(buttonsWidget, "animationLibraryMenuButton.svg", "animationLibraryMenuButton_h.svg", 135, 1, () => {
            this.animationLibrary.setReturnFunction(() => {
                this.changeStackedWidgetIndex(this, 0);
            });
            this.changeStackedWidgetIndex(this, 1);
        });
        buttonsLayout1.addWidget(chooseFromLibraryButton);
        buttonsLayout1.addWidget(uploadAnimationButton);
        buttonsLayout1.addStretch(0);
        buttonsLayout2.addWidget(textPromptButton);
        buttonsLayout2.addWidget(captureFromVideoButton);
        buttonsLayout2.addStretch(0);
        buttonsLayout.addLayout(buttonsLayout1);
        buttonsLayout.addStretch(0);
        buttonsLayout.addLayout(buttonsLayout2);
        buttonsWidget.layout = buttonsLayout;
        return buttonsWidget;
    }
    createButton(parent, iconName, hoveredIconName, size, idx, onButtonClicked) {
        const defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/' + iconName));
        const hoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/' + hoveredIconName));
        const button = new Ui.ImageView(parent);
        button.responseHover = true;
        button.scaledContents = true;
        button.pixmap = defaultImage;
        button.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        const buttonSize = size;
        button.setFixedHeight(135);
        button.setFixedWidth(buttonSize);
        const _this = this;
        this.connections.push(button.onClick.connect(() => {
            onButtonClicked(_this, idx);
        }));
        this.connections.push(button.onHover.connect((hovered) => {
            button.pixmap = hovered ? hoveredImage : defaultImage;
        }));
        return button;
    }
    deinit() {
        this.animationLibrary.deinit();
        this.textPromptMode.deinit();
        this.captureFromVideoMode.deinit();
    }
}
