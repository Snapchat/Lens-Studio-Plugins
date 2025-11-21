import * as Ui from 'LensStudio:Ui';
import { UIConfig } from '../UIConfig';
import { GeneratorState } from '../generator/Generator';
import app from '../Application';
export class Footer {
    constructor() {
        this.canGenerate = false;
        this.creationMenuControls = {};
        this.stateToButtonConfig = {
            [GeneratorState.Uninitialized]: this.setButtonsDisabled.bind(this),
            [GeneratorState.Unauthorized]: this.setButtonsDisabled.bind(this),
            [GeneratorState.UnsupportedApiVersion]: this.setButtonsDisabled.bind(this),
            [GeneratorState.RequestedTermsAndConditions]: this.setButtonsDisabled.bind(this),
            [GeneratorState.Idle]: this.setButtonsIdle.bind(this),
            [GeneratorState.Loading]: this.setButtonsDisabled.bind(this),
            [GeneratorState.Running]: this.setButtonsRunning.bind(this),
            [GeneratorState.Success]: this.setButtonsSuccess.bind(this),
            [GeneratorState.ConnectionFailed]: this.setButtonsDisabled.bind(this),
            [GeneratorState.Failed]: this.setButtonsFailed.bind(this)
        };
    }
    init(creationMenuControls) {
        this.creationMenuControls = creationMenuControls;
    }
    setButtonsDisabled() {
        this.canGenerate = false;
        this.updateGenerateButton();
        this.importToProjectButton.enabled = false;
    }
    setButtonsIdle() {
        this.canGenerate = true;
        this.updateGenerateButton();
        this.regenerateButton.visible = false;
        this.importToProjectButton.enabled = false;
        this.stackedWidget.currentIndex = 0; // Show generate button
    }
    setButtonsRunning() {
        this.canGenerate = false;
        this.updateGenerateButton();
        this.importToProjectButton.enabled = false;
    }
    setButtonsSuccess() {
        this.canGenerate = true;
        this.updateGenerateButton();
        this.generateButton.visible = false;
        this.regenerateButton.visible = true;
        this.importToProjectButton.enabled = true;
        this.stackedWidget.currentIndex = 1; // Show import button
    }
    setButtonsFailed() {
        this.canGenerate = true;
        this.updateGenerateButton();
        this.regenerateButton.visible = false;
        this.importToProjectButton.enabled = false;
        this.stackedWidget.currentIndex = 0; // Show generate button
    }
    create(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setContentsMargins(0, 0, 0, 0);
        this.footer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.footer.setFixedWidth(UIConfig.FOOTER.WIDTH);
        this.footer.setFixedHeight(UIConfig.FOOTER.HEIGHT);
        const footerLeft = new Ui.BoxLayout();
        footerLeft.setDirection(Ui.Direction.LeftToRight);
        footerLeft.setContentsMargins(0, 0, 0, 0);
        footerLeft.spacing = 0;
        const footerRight = new Ui.BoxLayout();
        footerRight.setDirection(Ui.Direction.LeftToRight);
        footerRight.setContentsMargins(0, 0, 0, 0);
        footerRight.spacing = 0;
        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(16, 0, 16, 0);
        footerLayout.spacing = 0;
        this.regenerateButton = new Ui.PushButton(this.footer);
        this.regenerateButton.text = 'Regenerate';
        this.regenerateButton.setFixedHeight(20);
        const regenerateImagePath = new Editor.Path(import.meta.resolve('./Resources/regenerate.svg'));
        this.regenerateButton.setIconWithMode(Editor.Icon.fromFile(regenerateImagePath), Ui.IconMode.MonoChrome);
        this.regenerateButton.visible = false;
        this.regenerateButton.enabled = false;
        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate texture';
        this.generateButton.setFixedHeight(20);
        this.generateButton.visible = true;
        this.generateButton.enabled = false;
        this.importToProjectButton = new Ui.PushButton(this.footer);
        this.importToProjectButton.text = 'Import to project';
        this.importToProjectButton.setFixedHeight(20);
        const importImagePath = new Editor.Path(import.meta.resolve('./Resources/import.svg'));
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;
        this.stackedWidget = new Ui.StackedWidget(this.footer);
        this.stackedWidget.addWidget(this.generateButton);
        this.stackedWidget.addWidget(this.importToProjectButton);
        this.stackedWidget.currentIndex = 0;
        this.stackedWidget.setFixedHeight(20);
        footerLeft.addWidgetWithStretch(this.regenerateButton, 0, Ui.Alignment.AlignLeft);
        footerRight.addWidgetWithStretch(this.stackedWidget, 0, Ui.Alignment.AlignRight);
        footerLayout.addLayout(footerLeft);
        footerLayout.addLayout(footerRight);
        this.footer.layout = footerLayout;
        Object.entries(this.stateToButtonConfig).forEach(([state, handler]) => {
            var _a;
            (_a = app.generator) === null || _a === void 0 ? void 0 : _a.stateChanged.on(parseInt(state), handler);
        });
        return this.footer;
    }
    updateGenerateButton() {
        const promptControl = this.creationMenuControls["prompt"];
        if (!this.canGenerate || (promptControl && promptControl.value.length === 0)) {
            this.generateButton.enabled = false;
            this.regenerateButton.enabled = false;
        }
        else {
            this.generateButton.enabled = true;
            this.regenerateButton.enabled = true;
        }
    }
}
