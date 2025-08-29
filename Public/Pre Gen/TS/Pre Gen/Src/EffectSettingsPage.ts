import * as Ui from "LensStudio:Ui";
import {defaultPrompts} from "./Prompts.js";
import {deleteById} from "./api.js";

export class EffectSettingsPage {

    private connections: Array<any> = [];
    private onReturnCallback: Function;
    private onPromptChangedCallback: Function;
    private onRemoveCallback: Function;
    private resetGallery: Function;
    private removeButton: Ui.PushButton | undefined;
    private textFields: TextField[] = [];
    private seedField: Seed | undefined;
    private curId: string = "";

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

        const header = this.createHeader(widget, 'Effect Settings', this.onReturnCallback);
        layout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignTop);

        const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/ai-portraits';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices.';
        const guideLines = this.createCalloutWidget(widget, guideLinesText);

        layout.addWidgetWithStretch(guideLines, 0, Ui.Alignment.AlignTop);

        const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
        const termsUrlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);
        const termsText = 'By using the feature, you agree to our ' + termsUrlString;
        const terms = this.createCalloutWidget(widget, termsText);

        layout.addWidgetWithStretch(terms, 0, Ui.Alignment.AlignTop);

        this.textFields.push(new TextField(widget, 'Person', 'Describe the Person..', this.onSurpriseMeButtonClicked.bind(this)));
        this.textFields.push(new TextField(widget, 'Action', 'Describe the Action..', ));
        this.textFields.push(new TextField(widget, 'Scene', 'Describe the Scene..', ));

        this.textFields.forEach((textField: TextField) => {
            layout.addWidgetWithStretch(textField.widget, 0, Ui.Alignment.AlignTop);
            textField.addOnTextChangeCallback((text: string) => {
                this.onPromptChanged();
            })
        })

        // const seedField = this.createSeedWidget(widget);
        this.seedField = new Seed(widget);

        layout.addWidgetWithStretch(this.seedField.widget, 0, Ui.Alignment.AlignTop);

        layout.addStretch(1);

        widget.layout = layout;

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
        imageView.responseHover = true;
        const defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/arrow.svg'));
        const hoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/arrow_h.svg'));
        imageView.pixmap = defaultImage
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
        removeButtonLayout.addWidgetWithStretch(trashCanImageView, 0, Ui.Alignment.AlignCenter);

        // this.removeButton.visible = false;

        layout.addWidgetWithStretch(this.removeButton, 0, Ui.Alignment.AlignRight);

        const items = [this.removeButton, trashCanImageView];
        items.forEach((item) => {
            item.onClick.connect(() => {
                if (this.curId !== "DEFAULT" && !this.curId.startsWith("new_dream_")) {
                    this.resetGallery();
                    deleteById(this.curId, () => {
                        this.onRemoveCallback();
                    });
                }
                onReturnClicked();
            });
        })

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
        const prompts = settings.prompt.match(/1\.(.*?)2\.(.*?)3\.(.*)/s);
        this.textFields.forEach((field, i) => {
            if (prompts && i + 1 < prompts.length) {
                field.setText(prompts[i + 1]);
            }
            else {
                field.setText("");
            }
        })

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

        this.textFields[0].setText(prompt.person);
        this.textFields[1].setText(prompt.action);
        this.textFields[2].setText(prompt.scene);
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
        let curPrompt = "a portrait of";
        this.textFields.forEach((field, i) => {
            curPrompt += (i + 1) + "." + field.text;
        })

        return curPrompt;
    }

    get seed() {
        return this.seedField?.getValue();
    }
}

class TextField {

    private mainWidget: Ui.Widget;
    private textEdit: Ui.TextEdit;
    private surpriseMeLabel: Ui.ClickableLabel;
    private lockedBox: Ui.ImageView;
    private lockedLabel: Ui.Label;
    private hasSurpriseMeButton: boolean = false;
    private connections: Array<any> = [];
    private onTextChangeCallbacks: Function[] = [];

    constructor(parent: Ui.Widget, text: string, placeholderText: string = "", onSurpriseMeButtonClickCallback: Function | null = null) {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, Ui.Sizes.Padding, 0, 0);

        // Header

        const header = new Ui.Widget(widget);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(0, 0, 0, 0);

        const label = new Ui.Label(header);
        label.text = text;

        headerLayout.addWidget(label);

        const surpriseMeLabel = new Ui.ClickableLabel(header);
        surpriseMeLabel.text = Ui.getUrlString('Surprise Me', '');

        this.surpriseMeLabel = surpriseMeLabel;

        if (onSurpriseMeButtonClickCallback) {
            this.surpriseMeLabel.visible = true;
            this.connections.push(this.surpriseMeLabel.onClick.connect(() => {
                onSurpriseMeButtonClickCallback();
            }));
        }
        else {
            this.hasSurpriseMeButton = false;
            this.surpriseMeLabel.visible = false;
        }

        headerLayout.addWidgetWithStretch(surpriseMeLabel, 0, Ui.Alignment.AlignRight);

        header.layout = headerLayout;
        layout.addWidget(header);

        // Text Edit

        const textEdit = new Ui.TextEdit(widget);
        textEdit.placeholderText = placeholderText;
        textEdit.setFixedHeight(72);

        this.connections.push(textEdit.onTextChange.connect(() => {
            this.onTextChange();
        }))

        layout.addWidget(textEdit);
        this.textEdit = textEdit;
        this.textEdit.visible = true;

        this.lockedBox = new Ui.ImageView(widget);
        this.lockedBox.setFixedWidth(346);
        this.lockedBox.setFixedHeight(72);
        this.lockedBox.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/multi_line_box.svg'));

        const lockedBoxLayout = new Ui.BoxLayout();
        lockedBoxLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
        this.lockedBox.layout = lockedBoxLayout;

        this.lockedLabel = new Ui.Label(this.lockedBox);
        this.lockedLabel.wordWrap = true;
        this.lockedLabel.setFixedWidth(338);

        lockedBoxLayout.addWidgetWithStretch(this.lockedLabel, 0, Ui.Alignment.AlignTop | Ui.Alignment.AlignLeft);

        layout.addWidget(this.lockedBox);

        this.lockedBox.visible = false;

        widget.layout = layout;
        this.mainWidget = widget;
    }

    onTextChange(): void {
        this.onTextChangeCallbacks.forEach((callback: Function) => {
            callback(this.textEdit.plainText);
        })
    }

    addOnTextChangeCallback(callback: Function): void {
        this.onTextChangeCallbacks.push(callback);
    }

    setText(text: string): void {
        this.textEdit.plainText = text;
    }

    lock() {
        this.lockedLabel.text = this.textEdit.plainText;
        this.textEdit.visible = false;
        this.lockedBox.visible = true;
        if (this.hasSurpriseMeButton) {
            this.surpriseMeLabel.visible = false;
        }
    }

    unlock() {
        this.textEdit.visible = true;
        this.lockedBox.visible = false;
        if (this.hasSurpriseMeButton) {
            this.surpriseMeLabel.visible = true;
        }
    }

    get text(): string {
        return this.textEdit.plainText;
    }

    get widget(): Ui.Widget {
        return this.mainWidget;
    }
}

class Seed {

    private connections: Array<any> = [];
    private mainWidget: Ui.Widget;
    private spinBox: Ui.SpinBox;
    private randomButton: Ui.PushButton;
    private lockedBox: Ui.ImageView;
    private lockedLabel: Ui.Label;

    constructor(parent: Ui.Widget) {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, Ui.Sizes.Padding, 0, 0);

        const label = new Ui.Label(widget);
        label.text = 'Seed';
        layout.addWidget(label);

        // const spacer = new Ui.Widget(widget);
        // spacer.setFixedWidth(8);
        // layout.addWidget(spacer);

        const spinBox = new Ui.SpinBox(widget);
        spinBox.setRange(0, 2147483647);
        spinBox.singleStep = 1;
        spinBox.setFixedWidth(120);
        spinBox.setFixedHeight(24);

        layout.addWidget(spinBox);

        const randomButton = new Ui.PushButton(widget);

        randomButton.setFixedWidth(24);
        randomButton.setFixedHeight(24);

        const randomButtonLayout = new Ui.BoxLayout();
        randomButtonLayout.setContentsMargins(0, 0, 0, 0);

        randomButton.layout = randomButtonLayout;

        const diceImageView = new Ui.ImageView(randomButton);
        diceImageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/dice.svg'));
        diceImageView.setFixedHeight(16);
        diceImageView.setFixedWidth(16);
        randomButtonLayout.addWidgetWithStretch(diceImageView, 0, Ui.Alignment.AlignCenter);

        [randomButton, diceImageView].forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                spinBox.value = this.getRandomInt();
            }));
        })

        layout.addWidget(randomButton);

        this.lockedBox = new Ui.ImageView(widget);
        this.lockedBox.setFixedWidth(120);
        this.lockedBox.setFixedHeight(24);
        this.lockedBox.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/number_box.svg'));

        const lockedBoxLayout = new Ui.BoxLayout();
        lockedBoxLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
        this.lockedBox.layout = lockedBoxLayout;

        this.lockedLabel = new Ui.Label(this.lockedBox);
        this.lockedLabel.wordWrap = true;
        this.lockedLabel.setFixedWidth(112);

        lockedBoxLayout.addWidgetWithStretch(this.lockedLabel, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);

        layout.addWidget(this.lockedBox);

        this.lockedBox.visible = false;

        layout.addStretch(1);

        widget.layout = layout;

        this.mainWidget = widget;
        this.spinBox = spinBox;
        this.randomButton = randomButton;

        spinBox.value = this.getRandomInt();
    }

    private getRandomInt(): number {
        const max = 2147483648;
        return Math.floor(Math.random() * max);
    }

    setValue(value: number): void {
        if (!value) {
            value = this.getRandomInt();
        }
        this.spinBox.value = value;
    }

    getValue(): number {
        return this.spinBox.value;
    }

    lock() {
        this.lockedLabel.text = this.spinBox.value + "";
        this.randomButton.visible = false;
        this.spinBox.visible = false;
        this.lockedBox.visible = true;
    }

    unlock() {
        this.spinBox.visible = true;
        this.randomButton.visible = true;
        this.lockedBox.visible = false;
    }

    get widget(): Ui.Widget {
        return this.mainWidget;
    }
}
