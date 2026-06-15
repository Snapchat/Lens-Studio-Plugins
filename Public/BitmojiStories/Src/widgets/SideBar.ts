import {
    Widget,
    BoxLayout,
    Direction,
    SizePolicy,
    ClearLayoutBehavior,
} from "LensStudio:Ui";
import { ToolPanel } from "../descriptors/ToolDescriptor";
import { SIDE_BAR_WIDTH } from "../common/constants";

export class SideBar {
    readonly widget: Widget;
    private layout: BoxLayout;
    private currentPanel: ToolPanel | null = null;

    constructor(parent: Widget) {
        this.widget = new Widget(parent);
        this.widget.setSizePolicy(SizePolicy.Policy.Fixed, SizePolicy.Policy.Expanding);
        this.widget.setFixedWidth(SIDE_BAR_WIDTH);

        this.layout = new BoxLayout();
        this.layout.setDirection(Direction.TopToBottom);
        this.widget.layout = this.layout;
    }

    setContent(panel: ToolPanel): void {
        this.teardown();
        this.currentPanel = panel;
        this.layout.addWidget(panel.widget);
    }

    open(): void {
        this.widget.visible = true;
    }

    close(): void {
        this.teardown();
        this.widget.visible = false;
    }

    get isOpen(): boolean {
        return this.widget.visible;
    }

    get panel(): ToolPanel | null {
        return this.currentPanel;
    }

    private teardown(): void {
        if (this.currentPanel) {
            this.currentPanel.deinit();
            this.currentPanel = null;
        }
        this.layout.clear(ClearLayoutBehavior.DeleteClearedWidgets);
    }
}
