// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { HomeScreen } from "./HomeScreen.js";
import { eventBus, EventTypes } from "./EventBus.js";
import { StateKeys, stateManager } from "./StateManager.js";
import { logEventOpen } from "./analytics.js";
export class Dialog {
    constructor(dialog, name) {
        this.width = 800;
        this.height = 620;
        this.dialog = dialog;
        this.dialog.setFixedWidth(this.width);
        this.dialog.setFixedHeight(this.height);
        this.dialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.dialog.windowTitle = name;
        this.homeScreen = new HomeScreen();
        this.configureDialog();
    }
    configureDialog() {
        this.homeScreen.create(this.dialog);
    }
    show() {
        this.dialog.show();
        this.dialog.raise();
        stateManager.updateState(StateKeys.IsDialogShown, true);
        eventBus.emit(EventTypes.DialogShown, true);
        logEventOpen();
    }
    deinit() {
        this.homeScreen.deinit();
    }
}
