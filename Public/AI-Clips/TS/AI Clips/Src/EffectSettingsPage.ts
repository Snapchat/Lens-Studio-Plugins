// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {defaultPrompts} from "./Prompts.js";
import {deleteById} from "./api.js";
import {Seed} from "./Seed.js";
import {TextField} from "./TextField.js";

export class EffectSettingsPage {

    private connections: Array<any> = [];
    private onReturnCallback: Function;
    private onPromptChangedCallback: Function;
    private onRemoveCallback: Function;
    private resetGallery: Function;
    private removeButton: Ui.PushButton | undefined;
    private headerStackedWidget: Ui.StackedWidget | undefined;
    private textFields: TextField[] = [];
    private seedField: Seed | undefined;
    private curId: string = "";
    private maxSymbols: number = 560;

    constructor(onReturnCallback: Function, onPromptChangedCallback: Function, onRemoveCallback: Function, resetGallery: Function) {
        this.onReturnCallback = onReturnCallback;
        this.onPromptChangedCallback = onPromptChangedCallback;
        this.onRemoveCallback = onRemoveCallback;
        this.resetGallery = resetGallery;
    }

    create(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setFixedHeight(563);
        widget.setFixedWidth(378);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.Padding, Ui.Sizes.DoublePadding, Ui.Sizes.Padding);
        layout.spacing = Ui.Sizes.Padding;

        this.headerStackedWidget = new Ui.StackedWidget(widget);
        this.headerStackedWidget.setContentsMargins(0, 0, 0, 0);
        this.headerStackedWidget.setFixedHeight(24);

        const header = this.createHeader(widget, 'Effect Settings', this.onReturnCallback);
        this.headerStackedWidget.addWidget(header);

        const newEffectHeader = this.createNewEffectHeader(widget, 'New Effect');
        this.headerStackedWidget.addWidget(newEffectHeader);

        this.showGalleryHeader();

        layout.addWidgetWithStretch(this.headerStackedWidget, 0, Ui.Alignment.AlignTop);

        const lensPlusCard = this.createLensPlusCard(widget);
        layout.addWidgetWithStretch(lensPlusCard, 0, Ui.Alignment.AlignTop);

        const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/ai-clips';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices.';
        const guideLines = this.createCalloutWidget(widget, guideLinesText);

        layout.addWidgetWithStretch(guideLines, 0, Ui.Alignment.AlignTop);

        const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
        const termsUrlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);
        const termsText = 'By using the feature, you agree to our ' + termsUrlString;
        const terms = this.createCalloutWidget(widget, termsText);

        layout.addWidgetWithStretch(terms, 0, Ui.Alignment.AlignTop);

        this.textFields.push(new TextField(widget, 'Prompt', 'Describe the clip..', () => {
            this.onSurpriseMeButtonClicked();
        }, 500));

        this.textFields.forEach((textField: TextField) => {
            layout.addWidgetWithStretch(textField.widget, 0, Ui.Alignment.AlignTop);
            textField.addOnTextChangeCallback((text: string) => {
                if (this.prompt.length > this.maxSymbols) {
                    textField.trimEndChars(this.prompt.length - this.maxSymbols);
                }
                this.onPromptChanged();
            })
        })

        this.seedField = new Seed(widget);
        layout.addWidgetWithStretch(this.seedField.widget, 0, Ui.Alignment.AlignTop);

        layout.addStretch(1);

        widget.layout = layout;

        return widget;
    }

    private createLensPlusCard(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.ImageView(parent);

        widget.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/lens_plus_card.svg'));
        widget.radius = 8;
        widget.scaledContents = true;

        const snapchatLogo = new Ui.ImageView(widget);
        snapchatLogo.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/snapchat_plus_logo.svg'));
        snapchatLogo.setFixedWidth(114);
        snapchatLogo.setFixedHeight(114);

        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(Ui.Sizes.Padding * 1.5, Ui.Sizes.Padding * 1.5, Ui.Sizes.Padding * 1.5, Ui.Sizes.Padding * 1.5);
        layout.setDirection(Ui.Direction.TopToBottom);

        const title = new Ui.Label(widget);
        title.text = 'Lens+ Payouts';
        title.fontRole = Ui.FontRole.MediumTitleBold;
        title.foregroundRole = Ui.ColorRole.BrightText;
        layout.addWidget(title);

        const description = new Ui.Label(widget);

        const lensPlusLink = 'https://developers.snap.com/lens-studio/monetization/lens-creator-rewards/lens-plus-payouts';

        const lensPlusUrlString = Ui.getUrlString('apply here', lensPlusLink);

        description.text = `Lenses created with "AI Clips" will be available only to Lens+ subscribers. Using "AI Clips" does not automatically enroll you in Lens+ Payouts, to begin monetizing your Lenses, ${lensPlusUrlString}.`;
        description.wordWrap = true;
        description.openExternalLinks = true;

        layout.addWidget(description);

        widget.layout = layout;

        snapchatLogo.move(225, 0);

        return widget;
    }

    private createHeader(parent: Ui.Widget, text: string, onReturnClicked: Function): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setFixedHeight(24);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = Ui.Sizes.DoublePadding;

        const imageView = new Ui.ImageView(widget);
        imageView.scaledContents = true;
        imageView.responseHover = true;
        const defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/arrow.svg'));
        const hoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/arrow_h.svg'));
        imageView.pixmap = defaultImage
        imageView.setFixedHeight(16);
        imageView.setFixedWidth(16);

        this.connections.push(imageView.onClick.connect(() => {
            onReturnClicked();
        }));
        this.connections.push(imageView.onHover.connect((hovered: boolean) => {
            imageView.pixmap = hovered ? hoveredImage : defaultImage;
        }));

        layout.addWidget(imageView);
        layout.addStretch(0);

        const title = new Ui.Label(widget);
        title.text = text;
        title.fontRole = Ui.FontRole.MediumTitleBold;
        title.foregroundRole = Ui.ColorRole.BrightText;

        layout.addWidget(title);
        layout.addStretch(1);

        this.removeButton = new Ui.PushButton(widget);

        this.removeButton.setFixedWidth(24);
        this.removeButton.setFixedHeight(24);

        const removeButtonLayout = new Ui.BoxLayout();
        removeButtonLayout.setContentsMargins(0, 0, 0, 0);

        this.removeButton.layout = removeButtonLayout;

        const trashCanImageView = new Ui.ImageView(this.removeButton);
        trashCanImageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/trashCan.svg'));
        trashCanImageView.setFixedHeight(16);
        trashCanImageView.setFixedWidth(16);
        trashCanImageView.scaledContents = true;
        removeButtonLayout.addWidgetWithStretch(trashCanImageView, 0, Ui.Alignment.AlignCenter);

        // this.removeButton.visible = false;

        layout.addWidgetWithStretch(this.removeButton, 0, Ui.Alignment.AlignRight);

        const items = [this.removeButton, trashCanImageView];
        items.forEach((item) => {
            item.onClick.connect(() => {
                this.resetGallery(this.curId);
                deleteById(this.curId, () => {
                    this.onRemoveCallback();
                });
                onReturnClicked();
            });
        })

        widget.layout = layout;

        return widget;
    }

    private createNewEffectHeader(parent: Ui.Widget, text: string) {
        const widget = new Ui.Widget(parent);
        widget.setFixedHeight(24);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = Ui.Sizes.DoublePadding;

        const title = new Ui.Label(widget);
        title.text = text;
        title.fontRole = Ui.FontRole.MediumTitleBold;
        title.foregroundRole = Ui.ColorRole.BrightText;

        layout.addWidgetWithStretch(title, 0, Ui.Alignment.AlignCenter);

        widget.layout = layout;

        return widget;
    }

    private createCalloutWidget(parent: Ui.Widget, text: string): Ui.Widget {
        const frame = new Ui.CalloutFrame(parent);
        frame.setBackgroundColor(this.createColor(68, 74, 85, 255));

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.LeftToRight);
        frameLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        frameLayout.spacing = Ui.Sizes.Padding;

        const info = this.createInfoIcon(frame);

        frameLayout.addWidget(info);
        frameLayout.addStretch(0);

        const guidelinesLabel = new Ui.Label(frame);
        guidelinesLabel.text = text;
        guidelinesLabel.wordWrap = true;
        guidelinesLabel.openExternalLinks = true;

        frameLayout.addWidgetWithStretch(guidelinesLabel, 1, Ui.Alignment.Default);

        frame.layout = frameLayout;
        return frame;
    }

    private createInfoIcon(parent: Ui.Widget): Ui.Widget {
        return this.createIcon(parent, new Ui.Pixmap(import.meta.resolve('./Resources/info.svg')));
    }

    private createIcon(parent: Ui.Widget, iconImage: Ui.Pixmap) {
        const imageView = new Ui.ImageView(parent);

        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        imageView.setFixedWidth(Ui.Sizes.IconSide);
        imageView.setFixedHeight(Ui.Sizes.IconSide);

        imageView.scaledContents = true;
        imageView.pixmap = iconImage;

        return imageView;
    }

    setSettings(settings: any): void {
        const prompt = settings.prompt;
        this.textFields[0].setText(prompt);

        this.seedField?.setValue(Number(settings.seed));
    }

    onPromptChanged(): void {
        this.onPromptChangedCallback();
    }

    lock(): void {
        this.textFields.forEach((textField: TextField) => {
            textField.lock();
        })
        this.seedField?.lock();
    }

    unlock(): void {
        this.textFields.forEach((textField: TextField) => {
            textField.unlock();
        })
        this.seedField?.unlock();
    }

    setId(id: string): void {
        this.curId = id;
        if (this.removeButton) {
            this.removeButton.visible = this.curId !== "DEFAULT";
        }
    }

    onSurpriseMeButtonClicked(): void {
        const prompts = defaultPrompts();
        const prompt = prompts[Math.floor(Math.random() * prompts.length)];

        this.textFields[0].setText(prompt.prompt);
    }

    showGalleryHeader() {
        if (this.headerStackedWidget) {
            this.headerStackedWidget.currentIndex = 1;
        }
    }

    showEffectHeader() {
        if (this.headerStackedWidget) {
            this.headerStackedWidget.currentIndex = 0;
        }
    }

    private createColor(r: number, g: number, b: number, a: number) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }

    get prompt() {
        let curPrompt = "";
        this.textFields.forEach((field, i) => {
            curPrompt += field.text;
        })

        return curPrompt;
    }

    get seed() {
        return this.seedField?.getValue();
    }
}
