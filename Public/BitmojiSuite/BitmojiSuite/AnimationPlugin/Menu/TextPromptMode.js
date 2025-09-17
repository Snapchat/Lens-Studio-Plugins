// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { MenuTemplate } from "./MenuTemplate.js";
import { Alignment } from "LensStudio:Ui";
import { promptToAnimation } from "../api.js";
export class TextPromptMode {
    constructor(animationLibrary) {
        this.connections = [];
        this.defaultPrompt = [
            "A person celebrating a big win with fist pumps, jumping in excitement",
            "A person walking like a zombie",
            "Waving hello with the right hand and a friendly smile",
            "A person dancing like a monkey, with exaggerated arm movements",
            "A person stands frozen, looking around as if they're scared",
            "A person strikes a playful, flirty pose, winking and tilting their head slightly, with a charming smile",
            "A person waving goodbye with their right hand"
        ];
        this.animationLibrary = animationLibrary;
        this.menuTemplate = new MenuTemplate();
        this.trashCanIcon = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/trashCan.svg')));
        this.inactiveTrashCanIcon = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/inactiveTrashCan.svg')));
        this.hoveredTrashCanIcon = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/trashCan_h.svg')));
        this.isActive = true;
    }
    create(parent, onReturnCallback, goToGalleryPage) {
        const widget = this.menuTemplate.createWidget(parent);
        const layout = this.menuTemplate.createLayout();
        const header = this.menuTemplate.createHeader(widget, 'Text Prompt', () => {
            onReturnCallback();
        });
        const contentLayout = this.menuTemplate.createContentLayout();
        const textEditButtonsLayout = new Ui.BoxLayout();
        textEditButtonsLayout.setDirection(Ui.Direction.LeftToRight);
        const surpriseMeButton = new Ui.PushButton(widget);
        surpriseMeButton.text = 'Surprise me';
        surpriseMeButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/surpriseMeIcon.svg'))), Ui.IconMode.MonoChrome);
        surpriseMeButton.setFixedWidth(100);
        surpriseMeButton.setFixedHeight(20);
        const clearButton = new Ui.ImageView(widget);
        clearButton.pixmap = this.inactiveTrashCanIcon;
        clearButton.responseHover = true;
        clearButton.setFixedWidth(20);
        clearButton.setFixedHeight(20);
        textEditButtonsLayout.addWidget(surpriseMeButton);
        textEditButtonsLayout.addStretch(0);
        textEditButtonsLayout.addWidget(clearButton);
        contentLayout.addLayout(textEditButtonsLayout);
        contentLayout.addStretch(0);
        const textEdit = new Ui.TextEdit(parent);
        textEdit.placeholderText = 'Please describe your creative idea for the animation here..';
        textEdit.setFixedHeight(110);
        textEdit.backgroundRole = Ui.ColorRole.BrightText;
        textEdit.foregroundRole = Ui.ColorRole.BrightText;
        contentLayout.addWidget(textEdit);
        contentLayout.addStretch(0);
        const generateButton = new Ui.PushButton(widget);
        generateButton.text = 'Generate Animation';
        generateButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/generate.svg'))), Ui.IconMode.MonoChrome);
        generateButton.setFixedWidth(149);
        generateButton.setFixedHeight(20);
        generateButton.primary = true;
        generateButton.enabled = false;
        contentLayout.addWidgetWithStretch(generateButton, 0, Alignment.AlignCenter);
        contentLayout.addStretch(1);
        this.connections.push(textEdit.onTextChange.connect(() => {
            if (textEdit.plainText.length > 0) {
                generateButton.enabled = true;
                clearButton.pixmap = this.trashCanIcon;
            }
            else {
                generateButton.enabled = false;
                clearButton.pixmap = this.inactiveTrashCanIcon;
            }
        }));
        this.connections.push(clearButton.onClick.connect(() => {
            if (textEdit.plainText.length > 0) {
                textEdit.plainText = "";
            }
        }));
        this.connections.push(clearButton.onHover.connect((hovered) => {
            if (textEdit.plainText.length === 0) {
                return;
            }
            if (hovered) {
                clearButton.pixmap = this.hoveredTrashCanIcon;
            }
            else {
                clearButton.pixmap = this.trashCanIcon;
            }
        }));
        this.connections.push(generateButton.onClick.connect(() => {
            const startIntervalFunction = this.animationLibrary.addAnimationToMyGallery("PROMPT_TEXT");
            goToGalleryPage(1);
            promptToAnimation(textEdit.plainText, (response) => {
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
        }));
        this.connections.push(surpriseMeButton.onClick.connect(() => {
            textEdit.plainText = this.defaultPrompt[Math.floor(Math.random() * this.defaultPrompt.length)];
        }));
        const guidelinesLink = 'https://developers.snap.com/lens-studio/features/bitmoji-suite/animate#text-prompt';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices.';
        const guideLines = this.menuTemplate.createCalloutWidget(widget, guideLinesText);
        contentLayout.addWidget(guideLines);
        contentLayout.addStretch(0);
        layout.addWidget(header);
        layout.addLayout(contentLayout);
        widget.layout = layout;
        return widget;
    }
    deinit() {
        this.isActive = false;
    }
}
