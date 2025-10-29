import * as Ui from 'LensStudio:Ui';

import app from '../application/app.js';
import { logEventAssetImport, logEventAssetCreation } from '../application/analytics.js';
import { GeneratorState } from '../generator/generator.js';
import { logEventOpen } from '../application/analytics.js';
import { CreationMenu } from './CreationMenu/CreationMenu.js';
import { Preview } from './Preview/Preview.js';
import { Footer } from './Footer/Footer.js';
import { UIConfig } from './UIConfig.js';

export class GarmentDialog {
    constructor(dialog) {
        this.connections = [];
        this.controls = {};
        
        this.width = UIConfig.DIALOG.WIDTH;
        this.height = UIConfig.DIALOG.HEIGHT;

        this.dialog = dialog;
        this.dialog.setFixedWidth(this.width);
        this.dialog.setFixedHeight(this.height);
        this.dialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.creationMenu = new CreationMenu();
        this.preview = new Preview();
        this.footer = new Footer();

        this.configureDialog();

    };

    onLog(text, options) {
        if (options.type && options.type == 'logger') {
            if (options.enabled) {
                this.showError(text, options.progressBar);
            } else {
                this.hideError();
            }
        }
    }

    stop() {
    }

    hideCallout() {
        if (this.importSuccessWidget) {
            this.importSuccessWidget.hidden = true;
        }
    }

    showCallout() {
        if (this.importSuccessWidget) {
            this.importSuccessWidget.hidden = false;
        }
    }

    hideError() {
        if (this.errorScreen) {
            this.errorScreen.visible = false;
        }
    }

    showError(text, progressBar) {
        if (this.errorScreen) {
            this.errorScreen.text = text;

            this.errorScreen.visible = true;

            if (progressBar) {
                this.errorScreen.start();
            } else {
                this.errorScreen.stop();
            }
        }
    }

    setName(name) {
        this.dialog.windowTitle = name;
    }

    show() {
        if (this.isActive) {
            this.dialog.show();
            this.dialog.raise();
            this.dialog.activateWindow();
        }
    }

    close() {
        this.isActive = false;
        this.stop();
    }

    init() {
        logEventOpen();
        this.creationMenu.init();
        this.preview.init();
        this.footer.init(this.creationMenu.controls);

        this.hideError();
        this.hideCallout();
    }

    configureErrorScreen() {
        this.errorScreen = new Ui.StatusIndicator('Error happend', this.dialog);

        this.errorScreen.setFixedWidth(UIConfig.DIALOG.WIDTH);
        const positionX = 0;
        const positionY = UIConfig.DIALOG.HEIGHT - 20;
        this.errorScreen.move(positionX, positionY);

        this.hideError();
    }

    configurePromptValueChangedCallback() {
        this.creationMenu.controls["promptPicker"].addOnValueChanged((value) => {
            this.footer.updateGenerateButton();
        });
    }

    async onGenerationRequested() {
        this.hideCallout();

        let origin = "";
        if (app.generator.state === GeneratorState.Idle || app.generator.state === GeneratorState.IdleWithPrompt) {
            origin = "NEW";
        } else {
            origin = "REGENERATE";
        }

        await app.generator.generate({
            "prompt": this.creationMenu.controls["promptPicker"].value + " " + this.creationMenu.controls["garmentType"].value.toLowerCase(),
            "garmentType": this.creationMenu.controls["garmentType"].backendValue
        });

        let garmnetTypeToLog = "";

        switch (this.creationMenu.controls["garmentType"].backendValue) {
            case 'hoodie':
                garmnetTypeToLog = "HOODIE";
                break;
            case 'sweater':
                garmnetTypeToLog = "SWEATER";
                break;
            case 't-shirt':
                garmnetTypeToLog = "T_SHIRT";
                break;
            case 'dress-suit':
                garmnetTypeToLog = "DRESS_SUIT";
                break;
            case 'bomber-jacket':
                garmnetTypeToLog = "BOMBER";
                break;
        }

        if (app.generator.state === GeneratorState.Success) {
            logEventAssetCreation("SUCCESS", garmnetTypeToLog, origin);
        } else {
            logEventAssetCreation("FAILED", garmnetTypeToLog, origin);
        }
    }

    onImportClicked() {
        app.importer.import(app.generator.textureBytes, app.generator.maskBytes).then(() => {
            logEventAssetImport("SUCCESS");
            this.hideError();
            this.showCallout();
            app.generator.changeState(GeneratorState.Idle);
            
            let timeout = setTimeout(() => {
                this.hideCallout();
                clearTimeout(timeout);
            }, 3000);

        }).catch((error) => {
            logEventAssetImport("FAILED");
            app.log('Failed to import Garment, please try again.');
        });
    }

    // Content = Control Menu + Preview
    createContentWidget(parent) {
        const content = new Ui.Widget(parent);
        content.setContentsMargins(0, 0, 0, 0);
        content.spacing = 0;
        content.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        content.setFixedWidth(UIConfig.DIALOG.WIDTH);
        content.setFixedHeight(UIConfig.CREATION_MENU.HEIGHT);

        const contentLayout = new Ui.BoxLayout();
        contentLayout.setDirection(Ui.Direction.LeftToRight);
        contentLayout.setContentsMargins(0, 0, 0, 0);
        contentLayout.spacing = 0;
        
        const menuWidget = this.creationMenu.create(parent);
        contentLayout.addWidget(menuWidget);

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, parent);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        contentLayout.addWidget(separator);

        const previewWidget = this.preview.create(parent);

        contentLayout.addWidget(previewWidget);
        content.layout = contentLayout;

        return content;
    }

    createImportSuccessBanner(parent) {
        const calloutFrame = new Ui.CalloutFrame(parent);
        calloutFrame.setFixedWidth(UIConfig.IMPORT_SUCCESS_BANNER.WIDTH);
        calloutFrame.setFixedHeight(UIConfig.IMPORT_SUCCESS_BANNER.HEIGHT);
        
        const backgroundColor = new Ui.Color();
        backgroundColor.red = 154;
        backgroundColor.green = 112;
        backgroundColor.blue = 205;
        backgroundColor.alpha = 255;
        calloutFrame.setBackgroundColor(backgroundColor);

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.LeftToRight);
        frameLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        frameLayout.spacing = Ui.Sizes.Padding;

        const iconImagePath = import.meta.resolve('Resources/warning_icon.svg');
        const iconPixmap = new Ui.Pixmap(iconImagePath);
        const iconView = new Ui.ImageView(calloutFrame);
        iconView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        iconView.setFixedHeight(Ui.Sizes.IconSide);
        iconView.setFixedWidth(Ui.Sizes.IconSide);
        iconView.scaledContents = true;
        iconView.pixmap = iconPixmap;

        frameLayout.addWidget(iconView);

        const successLabel = new Ui.Label(calloutFrame);
        successLabel.text = 'Garment has been Imported successfully';
        successLabel.wordWrap = true;

        frameLayout.addWidgetWithStretch(successLabel, 1, Ui.Alignment.Default);
        calloutFrame.layout = frameLayout;

        return calloutFrame;
    }

    createImportSuccessWidget(parent) {
        const importSuccessBanner = this.createImportSuccessBanner(parent);
        const importSuccessWidget = new Ui.Widget(parent);
        importSuccessWidget.setContentsMargins(0, 0, 0, 0);
        importSuccessWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        importSuccessWidget.setFixedWidth(UIConfig.DIALOG.WIDTH);
        importSuccessWidget.setFixedHeight(UIConfig.IMPORT_SUCCESS_BANNER.HEIGHT);
        
        const importSuccessLayout = new Ui.BoxLayout();
        importSuccessLayout.setDirection(Ui.Direction.TopToBottom);
        importSuccessLayout.setContentsMargins(0, 0, 0, 0);
        importSuccessLayout.spacing = 0;
        importSuccessLayout.addWidget(importSuccessBanner);
        importSuccessLayout.addStretch(0);
        importSuccessLayout.setWidgetAlignment(importSuccessBanner, Ui.Alignment.AlignCenter);

        importSuccessWidget.layout = importSuccessLayout;

        return importSuccessWidget;
    }

    createStackedContainer(parent, contentWidget, importSuccessWidget) {
        const stackedContainer = new Ui.Widget(parent);
        stackedContainer.setContentsMargins(0, 0, 0, 0);
        stackedContainer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        stackedContainer.setFixedWidth(UIConfig.DIALOG.WIDTH);
        stackedContainer.setFixedHeight(UIConfig.CREATION_MENU.HEIGHT);

        const stackedLayout = new Ui.StackedLayout();
        stackedLayout.stackingMode = Ui.StackingMode.StackAll;
        stackedLayout.setContentsMargins(0, 0, 0, 0);
        
        stackedContainer.layout = stackedLayout;

        stackedLayout.addWidget(importSuccessWidget);
        stackedLayout.addWidget(contentWidget);
        stackedContainer.layout = stackedLayout;

        return stackedContainer;
    }

    configureDialog() {
        this.widget = new Ui.Widget(this.dialog);
        this.widget.setContentsMargins(0, 0, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const contentWidget = this.createContentWidget(this.widget);
        this.importSuccessWidget = this.createImportSuccessWidget(this.widget);
        const stackedContainer = this.createStackedContainer(this.widget, contentWidget, this.importSuccessWidget);
        
        const footer = this.footer.create(this.widget);
        this.connections.push(this.footer.generateButton.onClick.connect(() => this.onGenerationRequested()));
        this.connections.push(this.footer.regenerateButton.onClick.connect(() => this.onGenerationRequested()));
        this.connections.push(this.footer.importToProjectButton.onClick.connect(() => this.onImportClicked()));
        
        const separatorFooter = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separatorFooter.setContentsMargins(0, 0, 0, 0);
        separatorFooter.setFixedHeight(1);

        layout.addWidget(stackedContainer);
        layout.addWidget(separatorFooter);
        layout.addWidget(footer);
        this.widget.layout = layout;

        this.configureErrorScreen();
        this.configurePromptValueChangedCallback();

        return this.dialog;
    }
}
