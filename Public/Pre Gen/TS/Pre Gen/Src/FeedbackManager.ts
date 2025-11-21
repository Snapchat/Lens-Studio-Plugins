// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import app from "./app.js";
import {logEventFeedback, logEventImport} from "./analytics";

export class FeedbackManager {

    private mainWidget: Ui.Widget | undefined;
    private stars: Array<any> = [];
    private checkBoxes: Array<any> = [];
    private starValues: Array<string> = [];
    private reasonValues: Array<string> = [];
    private defaultTexture: Ui.Pixmap;
    private selectedTexture: Ui.Pixmap;
    private hoveredTexture: Ui.Pixmap;
    private submitDialog: Ui.Dialog;
    private selectedIdx: number;
    private isSubmitClicked: boolean = false;

    constructor() {
        this.defaultTexture = new Ui.Pixmap(import.meta.resolve('./Resources/star.svg'));
        this.selectedTexture = new Ui.Pixmap(import.meta.resolve('./Resources/star_s.svg'));
        this.hoveredTexture = new Ui.Pixmap(import.meta.resolve('./Resources/star_h.svg'));

        this.createSubmitDialog();

        this.selectedIdx = -1;
        this.starValues = ["1_STAR", "2_STARS", "3_STARS", "4_STARS", "5_STARS"];
        this.reasonValues = ["GENERATION_FAILED", "DIDNT_FOLLOW_PROMPT", "NOT_VISUALLY_APPEALING", "TOO_LONG_TO_GENERATE", "INAPPROPRIATE_CONTENT", "CONFUSING_UI"];
    }

    create(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setFixedHeight(24);
        // widget.autoFillBackground = true;
        // widget.backgroundRole = Ui.ColorRole.Mid;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const feedbackLabel = new Ui.Label(widget);
        feedbackLabel.text = 'Submit Feedback:';
        feedbackLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
        // feedbackLabel.setFixedWidth(100);
        // feedbackLabel.move(9, 119);

        layout.addWidget(feedbackLabel);

        const spacer = new Ui.Widget(widget);
        spacer.setFixedWidth(8);

        layout.addWidget(spacer);

        for (let i = 0; i < 5; i++) {
            const starImage = new Ui.ImageView(widget);
            starImage.setFixedHeight(20);
            starImage.setFixedWidth(20);
            starImage.scaledContents = true;
            starImage.responseHover = true;
            starImage.pixmap = this.defaultTexture;

            layout.addWidget(starImage);
            this.stars.push(starImage);

            starImage.onHover.connect((hovered) => {
                if (hovered) {
                    for (let j = 0; j < 5; j++) {
                        if (j <= i) {
                            this.stars[j].pixmap = this.hoveredTexture;
                        } else {
                            this.stars[j].pixmap = j <= this.selectedIdx ? this.selectedTexture : this.defaultTexture;
                        }
                    }
                }
                else {
                    for (let j = 0; j < 5; j++) {
                        this.stars[j].pixmap = j <= this.selectedIdx ? this.selectedTexture : this.defaultTexture;
                    }
                }
            })

            starImage.onClick.connect(() => {
                this.selectedIdx = i;
                for (let j = 0; j < 5; j++) {
                    this.stars[j].pixmap = j <= i ? this.selectedTexture : this.defaultTexture;
                }

                if (this.selectedIdx < 3) {
                    this.isSubmitClicked = false;
                    this.submitDialog?.show();
                }
                else {
                    logEventFeedback(this.starValues[this.selectedIdx], "POSITIVE_FEEDBACK");
                }
            })
        }

        widget.layout = layout;
        this.mainWidget = widget;

        return widget;
    }

    private createSubmitDialog() {
        const gui = app.findInterface(Ui.IGui)
        this.submitDialog = gui.createDialog();
        this.submitDialog.setFixedWidth(480);
        this.submitDialog.setFixedHeight(408);
        this.submitDialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.submitDialog.setModal(true);

        this.submitDialog.autoFillBackground = true;
        this.submitDialog.backgroundRole = Ui.ColorRole.Base;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(32, 16, 32, 32);

        const title = new Ui.Label(this.submitDialog);
        title.text = 'Thank you for your feedback!';
        title.fontRole = Ui.FontRole.LargeTitleBold;
        title.foregroundRole = Ui.ColorRole.BrightText;

        layout.addWidgetWithStretch(title, 0, Ui.Alignment.AlignTop);

        const spacer = new Ui.Widget(this.submitDialog);
        spacer.setFixedHeight(32);

        layout.addWidgetWithStretch(spacer, 0, Ui.Alignment.AlignTop);

        const label = new Ui.Label(this.submitDialog);
        label.text = 'We\'d love to hear from you! Please share your feedback on the results of our AI generation to help us improve.';
        label.fontRole = Ui.FontRole.Default;
        label.foregroundRole = Ui.ColorRole.PlaceholderText;
        label.wordWrap = true;

        layout.addWidgetWithStretch(label, 0, Ui.Alignment.AlignTop);

        const spacer1 = new Ui.Widget(this.submitDialog);
        spacer1.setFixedHeight(32);

        layout.addWidgetWithStretch(spacer1, 0, Ui.Alignment.AlignTop);

        const checkBoxText = ["Preview generation failed", "Did not follow my prompt", "Not visually appealing", "Takes too long to generate",
            "Inappropriate content", "Confusing user interface"];

        for (let i = 0; i < 6; i++) {
            const checkBox = new Ui.CheckBox(this.submitDialog);
            checkBox.text = checkBoxText[i];
            checkBox.fontRole = Ui.FontRole.TitleBold;

            this.checkBoxes.push(checkBox);
            layout.addWidgetWithStretch(checkBox, 0, Ui.Alignment.AlignTop);
        }

        const spacer2 = new Ui.Widget(this.submitDialog);
        spacer2.setFixedHeight(32);

        layout.addWidgetWithStretch(spacer2, 0, Ui.Alignment.AlignTop);

        const buttonsWidget = new Ui.Widget(this.submitDialog);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.LeftToRight);
        buttonsLayout.setContentsMargins(0, 0, 0, 0);

        const cancelButton = new Ui.PushButton(buttonsWidget);
        const submitButton = new Ui.PushButton(buttonsWidget);

        cancelButton.text = 'Cancel';
        submitButton.text = 'Submit';

        submitButton.primary = true;

        const _this = this;

        cancelButton.onClick.connect(function() {
            _this.submitDialog?.close();
        });

        submitButton.onClick.connect(function() {
            _this.isSubmitClicked = true;
            _this.submitDialog?.close();

        });

        this.submitDialog.onFinish.connect(() => {
            if (_this.isSubmitClicked) {
                let reason = "";
                this.checkBoxes.forEach((checkBox, i) => {
                    if (checkBox.checkState === Ui.CheckState.Checked) {
                        if (reason.length > 0) {
                            reason += ", ";
                        }
                        reason += this.reasonValues[i];
                    }
                })

                if (reason.length === 0) {
                    reason = "NOT_PROVIDED";
                }

                logEventFeedback(this.starValues[this.selectedIdx], reason);
            }
            else {
                _this.reset();
            }
        })

        buttonsLayout.addStretch(0);
        buttonsLayout.addWidget(cancelButton);
        buttonsLayout.addWidget(submitButton);

        buttonsWidget.layout = buttonsLayout;

        layout.addWidgetWithStretch(buttonsWidget, 0, Ui.Alignment.AlignRight);

        layout.addStretch(0);

        this.submitDialog.layout = layout;
    }

    reset() {
        this.selectedIdx = -1;
        this.stars.forEach((star) => {
            star.pixmap = this.defaultTexture;
        })
        this.checkBoxes.forEach((checkBox) => {
            checkBox.checkState = Ui.CheckState.Unchecked;
        })
    }

    show() {
        if (this.mainWidget) {
            this.mainWidget.visible = true;
        }
    }

    hide() {
        if (this.mainWidget) {
            this.mainWidget.visible = false;
        }
    }
}