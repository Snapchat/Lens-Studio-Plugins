import * as Ui from 'LensStudio:Ui';

import { UIConfig } from '../UIConfig.js';
import { GeneratorState } from '../../generator/generator.js';
import app from '../../application/app.js';

export class Footer {
    constructor() {
        this.connections = [];
        this.controls = {};
        this.canGenerate = false;
        this.hasGeneratedBefore = false;

        this.stateToButtonConfig = {
            [GeneratorState.Uninitialized]: this.setButtonsDisabled,
            [GeneratorState.Unauthorized]: this.setButtonsDisabled,
            [GeneratorState.UnsupportedApiVersion]: this.setButtonsDisabled,
            [GeneratorState.RequestedTermsAndConditions]: this.setButtonsDisabled,
            [GeneratorState.Idle]: this.setButtonsIdle,
            [GeneratorState.Loading]: this.setButtonsDisabled,
            [GeneratorState.Running]: this.setButtonsRunning,
            [GeneratorState.Success]: this.setButtonsSuccess,
            [GeneratorState.ConnectionFailed]: this.setButtonsDisabled,
            [GeneratorState.Failed]: this.setButtonsFailed
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
        this.hasGeneratedBefore = true;
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
        this.footer.spacing = 0;
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
        this.regenerateButton.visible = false;
        this.regenerateButton.enabled = false;

        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate texture';
        this.generateButton.visible = true;
        this.generateButton.enabled = false;

        this.importToProjectButton = new Ui.PushButton(this.footer);
        this.importToProjectButton.text = 'Import to Project';
        const importImagePath = import.meta.resolve('../Resources/import.svg');
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;

        this.stackedWidget = new Ui.StackedWidget(this.footer);
        this.stackedWidget.addWidget(this.generateButton);
        this.stackedWidget.addWidget(this.importToProjectButton);
        this.stackedWidget.currentIndex = 0;
        this.stackedWidget.setFixedHeight(18);

        footerLeft.addWidgetWithStretch(this.regenerateButton, 0, Ui.Alignment.AlignLeft);
        footerRight.addWidgetWithStretch(this.stackedWidget, 0, Ui.Alignment.AlignRight);
        footerLayout.addLayout(footerLeft);
        footerLayout.addLayout(footerRight);

        this.footer.layout = footerLayout;

        Object.entries(this.stateToButtonConfig).forEach(([state, handler]) => {
            app.generator.stateChanged.on(state, handler.bind(this));
        });

        return this.footer;
    }

    updateGenerateButton() {
        if (!this.canGenerate || this.creationMenuControls["promptPicker"].value.length === 0) {
            this.generateButton.enabled = false;
            this.regenerateButton.enabled = false;
        } else {
            this.generateButton.enabled = true;
            this.regenerateButton.enabled = true;
        }
    }

}
