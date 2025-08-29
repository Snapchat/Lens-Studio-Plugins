import * as Ui from "LensStudio:Ui";
import { HomeScreen } from "./HomeScreen.js";
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
        logEventOpen();
        this.homeScreen.updateGallery();
    }
    deinit() {
        this.homeScreen.deinit();
    }
}
