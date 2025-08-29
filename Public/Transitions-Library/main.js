
import PanelPlugin from "LensStudio:PanelPlugin";
import * as Ui from "LensStudio:Ui";
import {TransitionController} from "./Transitions/transitions-controller.js";
import {MainPage} from "./Menu/main-page.js";


export class TransitionManagerPlugin extends PanelPlugin {
    static descriptor() {
        return {
            id: "Com.Snap.TransitionManagerPlugin",
            name: "Transitions Library",
            description: "Transitions Library",
            isUnique: true,
            dependencies: [],
            defaultDockState: Ui.DockState.Detached,
            defaultSize: new Ui.Size(654, 514),
            minimumSize: new Ui.Size(44, 514)
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
    }
    createWidget(parentWidget) {

        this.mainWidget = new Ui.Widget(parentWidget);
        this.mainWidget.setContentsMargins(0, 0, 0, 0);
        this.mainLayout = new Ui.BoxLayout();
        this.mainLayout.setDirection(Ui.Direction.TopToBottom);
        this.mainLayout.setContentsMargins(0, 4, 0, 0);
        this.mainWidget.layout = this.mainLayout;

        this.controller = new TransitionController(this.mainWidget, this.mainLayout, this.pluginSystem);
        this.categoryPage = new MainPage(this.mainWidget, this.mainLayout, this.controller);
        return this.mainWidget;
    }
}
