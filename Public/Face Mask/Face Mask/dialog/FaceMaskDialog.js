import * as Ui from 'LensStudio:Ui';
import app from '../Application';
import { logEventOpen, logEventAssetImport, EVENT_STATUS, EVENT_CREATE_ASSET } from '../common/Analytics';
import { GeneratorState } from '../generator/Generator';
import { CreationMenu } from './CreationMenu';
import { Preview } from './Preview';
import { Footer } from './Footer';
import { UIConfig } from '../UIConfig';
import { NotificationKey } from '../common/NotificationManager';
export class FaceMaskDialog {
    constructor(dialog) {
        this.connections = [];
        this.isActive = false;
        this.connections = [];
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
    }
    stop() { }
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
    }
    configurePromptValueChangedCallback() {
        const promptControl = this.creationMenu.controls["prompt"];
        if (promptControl) {
            promptControl.addOnValueChanged((value) => {
                this.footer.updateGenerateButton();
            });
        }
    }
    async onGenerationRequested() {
        let origin = "NEW";
        if (app.generator) {
            if (app.generator.state === GeneratorState.Idle) {
                origin = EVENT_CREATE_ASSET.ORIGIN.NEW;
            }
            else {
                origin = EVENT_CREATE_ASSET.ORIGIN.REGENERATE;
            }
            await app.generator.generate({
                prompt: this.creationMenu.controls["prompt"].value,
                negativePrompt: this.creationMenu.controls["negativePrompt"].value,
                seed: this.creationMenu.controls["seed"].value
            }, origin);
        }
    }
    onImportClicked() {
        if (app.generator && app.generator.textureBytes) {
            this.footer.importToProjectButton.enabled = false;
            this.footer.importToProjectButton.text = "Importing...";
            app.importer.import(app.generator.textureBytes).then(() => {
                var _a;
                logEventAssetImport(EVENT_STATUS.SUCCESS);
                app.notificationManager.showNotification(NotificationKey.InfoImportSuccess);
                (_a = app.generator) === null || _a === void 0 ? void 0 : _a.changeState(GeneratorState.Idle);
            }).catch((error) => {
                logEventAssetImport(EVENT_STATUS.FAILED);
                app.notificationManager.showNotification(NotificationKey.ErrorImportFailed);
            }).finally(() => {
                this.footer.importToProjectButton.text = "Import to project";
                this.footer.importToProjectButton.enabled = true;
            });
        }
    }
    createMainContentWidget(parent) {
        const mainContentWidget = new Ui.Widget(parent);
        mainContentWidget.setContentsMargins(0, 0, 0, 0);
        mainContentWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        mainContentWidget.setFixedWidth(UIConfig.DIALOG.WIDTH);
        mainContentWidget.setFixedHeight(UIConfig.CREATION_MENU.HEIGHT);
        const mainContentLayout = new Ui.BoxLayout();
        mainContentLayout.setDirection(Ui.Direction.LeftToRight);
        mainContentLayout.setContentsMargins(0, 0, 0, 0);
        mainContentLayout.spacing = 0;
        const menuWidget = this.creationMenu.create(parent);
        mainContentLayout.addWidget(menuWidget);
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, parent);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        mainContentLayout.addWidget(separator);
        const previewWidget = this.preview.create(parent);
        mainContentLayout.addWidget(previewWidget);
        mainContentWidget.layout = mainContentLayout;
        return mainContentWidget;
    }
    createStackedContainer(parent, mainContentWidget, notificationContainerWidget) {
        const stackedContainer = new Ui.Widget(parent);
        stackedContainer.setContentsMargins(0, 0, 0, 0);
        stackedContainer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        stackedContainer.setFixedWidth(UIConfig.DIALOG.WIDTH);
        stackedContainer.setFixedHeight(UIConfig.CREATION_MENU.HEIGHT);
        const stackedLayout = new Ui.StackedLayout();
        stackedLayout.stackingMode = Ui.StackingMode.StackAll;
        stackedLayout.setContentsMargins(0, 0, 0, 0);
        stackedContainer.layout = stackedLayout;
        stackedLayout.addWidget(notificationContainerWidget);
        stackedLayout.addWidget(mainContentWidget);
        stackedContainer.layout = stackedLayout;
        return stackedContainer;
    }
    configureDialog() {
        this.widget = new Ui.Widget(this.dialog);
        this.widget.autoFillBackground = true;
        this.widget.backgroundRole = Ui.ColorRole.Base;
        this.widget.setContentsMargins(0, 0, 0, 0);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        const mainContentWidget = this.createMainContentWidget(this.widget);
        const notificationContainerWidget = app.notificationManager.createWidget(this.widget);
        const stackedContainer = this.createStackedContainer(this.widget, mainContentWidget, notificationContainerWidget);
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
        this.configurePromptValueChangedCallback();
        return this.dialog;
    }
}
