import * as Ui from "LensStudio:Ui";
import {HomeScreen} from "./HomeScreen.js";
import {eventBus, EventTypes} from "./EventBus.js";
import {StateKeys, stateManager} from "./StateManager.js";
import {logEventOpen} from "./analytics.js";

export class Dialog {

    private width:number = 800;
    private height:number = 620;

    private readonly dialog: Ui.Dialog;
    private homeScreen: HomeScreen;

    constructor(dialog: Ui.Dialog, name: string) {
        this.dialog = dialog;
        this.dialog.setFixedWidth(this.width);
        this.dialog.setFixedHeight(this.height);
        this.dialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.dialog.windowTitle = name;
        this.homeScreen = new HomeScreen();

        this.configureDialog();
    }

    configureDialog(): void {
        this.homeScreen.create(this.dialog);
    }

    show(): void {
        this.dialog.show();
        stateManager.updateState(StateKeys.IsDialogShown, true);
        eventBus.emit(EventTypes.DialogShown, true);
        logEventOpen();
    }

    deinit(): void {
        this.homeScreen.deinit();
    }
}
