// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { defaultPrompts } from "./Prompts.js";
import { deleteById } from "./api.js";
export class EffectSettingsPage {
    constructor(onReturnCallback, onPromptChangedCallback, onRemoveCallback, resetGallery) {
        this.connections = [];
        this.textFields = [];
        this.curId = "";
        this.maxSymbols = 560;
        this.reservedSymbolsCount = 19;
        this.onReturnCallback = onReturnCallback;
        this.onPromptChangedCallback = onPromptChangedCallback;
        this.onRemoveCallback = onRemoveCallback;
        this.resetGallery = resetGallery;
    }
    create(parent) {
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
        const promptWidget = new Ui.ImageView(widget);
        promptWidget.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/prompt_frame.svg'));
        promptWidget.scaledContents = true;
        promptWidget.setFixedHeight(354);
        const promptLayout = new Ui.BoxLayout();
        promptLayout.setDirection(Ui.Direction.TopToBottom);
        promptWidget.layout = promptLayout;
        const limitationLabel = new Ui.Label(promptWidget);
        limitationLabel.text = "0 / " + this.maxSymbols;
        limitationLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
        promptLayout.addWidgetWithStretch(limitationLabel, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignTop);
        this.textFields.push(new TextField(promptWidget, 'Person', 'Describe the Person..', import.meta.resolve('./Resources/person_hint.png'), this.onSurpriseMeButtonClicked.bind(this)));
        this.textFields.push(new TextField(promptWidget, 'Action', 'Describe the Action..', import.meta.resolve('./Resources/action_hint.png')));
        this.textFields.push(new TextField(promptWidget, 'Scene', 'Describe the Scene..', import.meta.resolve('./Resources/scene_hint.png')));
        this.textFields.forEach((textField) => {
            promptLayout.addWidgetWithStretch(textField.widget, 0, Ui.Alignment.AlignTop);
            textField.addOnTextChangeCallback((text) => {
                if (this.prompt.length > this.maxSymbols + this.reservedSymbolsCount) {
                    textField.trimEndChars(this.prompt.length - this.maxSymbols - this.reservedSymbolsCount);
                }
                limitationLabel.text = (this.prompt.length - this.reservedSymbolsCount) + " / " + this.maxSymbols;
                this.onPromptChanged();
            });
        });
        layout.addWidgetWithStretch(promptWidget, 0, Ui.Alignment.AlignTop);
        this.seedField = new Seed(widget);
        layout.addWidgetWithStretch(this.seedField.widget, 0, Ui.Alignment.AlignTop);
        layout.addStretch(1);
        widget.layout = layout;
        return widget;
    }
    createHeader(parent, text, onReturnClicked) {
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
        imageView.pixmap = defaultImage;
        imageView.setFixedHeight(16);
        imageView.setFixedWidth(16);
        this.connections.push(imageView.onClick.connect(() => {
            onReturnClicked();
        }));
        this.connections.push(imageView.onHover.connect((hovered) => {
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
                if (this.curId !== "DEFAULT" && !this.curId.startsWith("new_dream_")) {
                    this.resetGallery(this.curId);
                    deleteById(this.curId, () => {
                        this.onRemoveCallback();
                    });
                }
                onReturnClicked();
            });
        });
        widget.layout = layout;
        return widget;
    }
    createNewEffectHeader(parent, text) {
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
    createCalloutWidget(parent, text) {
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
    createInfoIcon(parent) {
        return this.createIcon(parent, new Ui.Pixmap(import.meta.resolve('./Resources/info.svg')));
    }
    createIcon(parent, iconImage) {
        const imageView = new Ui.ImageView(parent);
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(Ui.Sizes.IconSide);
        imageView.setFixedHeight(Ui.Sizes.IconSide);
        imageView.scaledContents = true;
        imageView.pixmap = iconImage;
        return imageView;
    }
    setSettings(settings) {
        var _a;
        const prompts = settings.prompt.match(/1\.(.*?)2\.(.*?)3\.(.*)/s);
        this.textFields.forEach((field, i) => {
            if (prompts && i + 1 < prompts.length) {
                field.setText(prompts[i + 1]);
            }
            else {
                field.setText("");
            }
        });
        (_a = this.seedField) === null || _a === void 0 ? void 0 : _a.setValue(Number(settings.seed));
    }
    onPromptChanged() {
        this.onPromptChangedCallback();
    }
    lock() {
        var _a;
        this.textFields.forEach((textField) => {
            textField.lock();
        });
        (_a = this.seedField) === null || _a === void 0 ? void 0 : _a.lock();
    }
    unlock() {
        var _a;
        this.textFields.forEach((textField) => {
            textField.unlock();
        });
        (_a = this.seedField) === null || _a === void 0 ? void 0 : _a.unlock();
    }
    setId(id) {
        this.curId = id;
        if (this.removeButton) {
            this.removeButton.visible = this.curId !== "DEFAULT";
        }
    }
    onSurpriseMeButtonClicked() {
        const prompts = defaultPrompts();
        const prompt = prompts[Math.floor(Math.random() * prompts.length)];
        this.textFields[0].setText(prompt.person);
        this.textFields[1].setText(prompt.action);
        this.textFields[2].setText(prompt.scene);
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
    createColor(r, g, b, a) {
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
        });
        return curPrompt;
    }
    get seed() {
        var _a;
        return (_a = this.seedField) === null || _a === void 0 ? void 0 : _a.getValue();
    }
}
class TextField {
    constructor(parent, text, placeholderText = "", image_path, onSurpriseMeButtonClickCallback = null) {
        this.hasSurpriseMeButton = false;
        this.connections = [];
        this.onTextChangeCallbacks = [];
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
        const infoIcon = this.createInfoIcon(widget, image_path);
        headerLayout.addWidgetWithStretch(infoIcon, 0, Ui.Alignment.AlignLeft);
        headerLayout.addStretch(0);
        const surpriseMeLabel = new Ui.ClickableLabel(header);
        surpriseMeLabel.text = Ui.getUrlString('Surprise Me', '');
        this.surpriseMeLabel = surpriseMeLabel;
        if (onSurpriseMeButtonClickCallback) {
            this.hasSurpriseMeButton = true;
            this.surpriseMeLabel.visible = true;
            this.connections.push(this.surpriseMeLabel.onClick.connect(() => {
                if (this.lockedBox.visible) {
                    return;
                }
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
        textEdit.acceptRichText = false;
        this.connections.push(textEdit.onTextChange.connect(() => {
            this.onTextChange();
        }));
        layout.addWidget(textEdit);
        this.textEdit = textEdit;
        this.textEdit.visible = true;
        this.lockedBox = new Ui.ImageView(widget);
        this.lockedBox.setFixedWidth(328);
        this.lockedBox.setFixedHeight(72);
        this.lockedBox.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/multi_line_box.svg'));
        const lockedBoxLayout = new Ui.BoxLayout();
        lockedBoxLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
        this.lockedBox.layout = lockedBoxLayout;
        this.lockedLabel = new Ui.Label(this.lockedBox);
        this.lockedLabel.wordWrap = true;
        this.lockedLabel.setFixedWidth(324);
        lockedBoxLayout.addWidgetWithStretch(this.lockedLabel, 0, Ui.Alignment.AlignTop | Ui.Alignment.AlignLeft);
        layout.addWidget(this.lockedBox);
        this.lockedBox.visible = false;
        widget.layout = layout;
        this.mainWidget = widget;
    }
    createInfoIcon(parent, image_path) {
        const infoImage = new Ui.Pixmap(import.meta.resolve('./Resources/small_info.svg'));
        const info = new Ui.ImageView(parent);
        info.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        info.setFixedHeight(Ui.Sizes.IconSide);
        info.setFixedWidth(Ui.Sizes.IconSide);
        info.scaledContents = true;
        info.pixmap = infoImage;
        info.responseHover = true;
        const popupWidget = new Ui.PopupWithArrow(info, Ui.ArrowPosition.Top);
        popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        popupWidget.setMainWidget(this.createHint(popupWidget, image_path));
        const connection = info.onHover.connect((hovered) => {
            if (hovered) {
                popupWidget.popup(info);
            }
            else {
                popupWidget.close();
                parent.activateWindow();
            }
        });
        return info;
    }
    createHint(parent, image_path) {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        const content = new Ui.Widget(parent);
        const imageView = new Ui.ImageView(content);
        const image = new Ui.Pixmap(image_path);
        // image.resize(image_width * 2, image_height * 2);
        imageView.pixmap = image;
        imageView.setFixedWidth(120);
        imageView.setFixedHeight(216);
        imageView.scaledContents = true;
        layout.addWidget(imageView);
        content.layout = layout;
        return content;
    }
    onTextChange() {
        this.onTextChangeCallbacks.forEach((callback) => {
            callback(this.textEdit.plainText);
        });
    }
    addOnTextChangeCallback(callback) {
        this.onTextChangeCallbacks.push(callback);
    }
    setText(text) {
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
    trimEndChars(count) {
        this.textEdit.blockSignals(true);
        this.textEdit.plainText = this.textEdit.plainText.slice(0, -count);
        this.moveCursorToEnd();
        this.textEdit.blockSignals(false);
    }
    moveCursorToEnd() {
        const cursor = this.textEdit.textCursor;
        cursor.movePosition(Ui.TextCursor.MoveOperation.End, Ui.TextCursor.MoveMode.MoveAnchor);
        this.textEdit.textCursor = cursor;
    }
    get text() {
        return this.textEdit.plainText;
    }
    get widget() {
        return this.mainWidget;
    }
}
class Seed {
    constructor(parent) {
        this.connections = [];
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, Ui.Sizes.Padding, 0, 0);
        const label = new Ui.Label(widget);
        label.text = 'Seed';
        layout.addWidget(label);
        layout.spacing = 4;
        // const spacer = new Ui.Widget(widget);
        // spacer.setFixedWidth(8);
        // layout.addWidget(spacer);
        const infoIcon = this.createInfoIcon(widget);
        layout.addWidget(infoIcon);
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
        diceImageView.scaledContents = true;
        diceImageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/dice.svg'));
        diceImageView.setFixedHeight(16);
        diceImageView.setFixedWidth(16);
        randomButtonLayout.addWidgetWithStretch(diceImageView, 0, Ui.Alignment.AlignCenter);
        [randomButton, diceImageView].forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                spinBox.value = this.getRandomInt();
            }));
        });
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
    getRandomInt() {
        const max = 2147483648;
        return Math.floor(Math.random() * max);
    }
    createInfoIcon(parent) {
        const infoImage = new Ui.Pixmap(import.meta.resolve('./Resources/small_info.svg'));
        const info = new Ui.ImageView(parent);
        info.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        info.setFixedHeight(Ui.Sizes.IconSide);
        info.setFixedWidth(Ui.Sizes.IconSide);
        info.scaledContents = true;
        info.pixmap = infoImage;
        info.responseHover = true;
        const popupWidget = new Ui.PopupWithArrow(info, Ui.ArrowPosition.Top);
        popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        popupWidget.setMainWidget(this.createHint(popupWidget, "Seed", "Control randomness with a seed. Use the same number to recreate the same look, or try different ones for new variations!"));
        const connection = info.onHover.connect((hovered) => {
            if (hovered) {
                popupWidget.popup(info);
            }
            else {
                popupWidget.close();
                parent.activateWindow();
            }
        });
        return info;
    }
    createHint(parent, title, text) {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        const content = new Ui.Widget(parent);
        const header = new Ui.Label(content);
        header.text = title;
        header.fontRole = Ui.FontRole.TitleBold;
        const desc = new Ui.Label(content);
        desc.text = text;
        desc.wordWrap = true;
        layout.addWidget(header);
        layout.addWidget(desc);
        content.layout = layout;
        return content;
    }
    setValue(value) {
        if (!value) {
            value = this.getRandomInt();
        }
        this.spinBox.value = value;
    }
    getValue() {
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
    get widget() {
        return this.mainWidget;
    }
}
