import { Event, Unsubscribe } from "LensStudio:Event.js";
import {
    Widget,
    BoxLayout,
    Direction,
    PushButton,
    SizePolicy,
} from "LensStudio:Ui";
import { ToolDescriptor } from "../descriptors/ToolDescriptor";
import { TOOL_BAR_BUTTON_WIDTH } from "../common/constants";

interface ToolEntry {
    descriptor: ToolDescriptor;
    button: PushButton;
    index: number;
}

export class ToolBar {
    readonly widget: Widget;
    readonly onToolClicked = new Event<ToolDescriptor>();
    private tools: ToolEntry[] = [];
    private _currentIndex = -1;
    private _enabled = true;

    constructor(parent: Widget, descriptors: ToolDescriptor[]) {
        this.widget = new Widget(parent);
        this.widget.setSizePolicy(SizePolicy.Policy.Fixed, SizePolicy.Policy.Expanding);

        const layout = new BoxLayout();
        layout.setDirection(Direction.TopToBottom);
        layout.addStretch(0);

        for (const desc of descriptors) {
            const button = new PushButton(this.widget);
            button.setFixedWidth(TOOL_BAR_BUTTON_WIDTH);
            button.setFixedHeight(TOOL_BAR_BUTTON_WIDTH);
            button.setIcon(desc.icon);
            button.toolTip = desc.tooltip;
            button.checkable = true;

            const entry: ToolEntry = { descriptor: desc, button, index: this.tools.length };
            button.onClick.connect(() => this.onToolClicked.trigger(desc));
            this.tools.push(entry);
            layout.addWidget(button);
        }

        layout.addStretch(0);
        this.widget.layout = layout;
    }

    /**
     * Toggle selection state. Returns true if the tool is now selected.
     */
    selectTool(id: string | null): boolean {
        // Deselect previous
        if (this._currentIndex >= 0) {
            this.tools[this._currentIndex].button.checked = false;
        }

        if (id === null) {
            this._currentIndex = -1;
            return false;
        }

        const entry = this.tools.find((t) => t.descriptor.id === id);
        if (!entry) {
            this._currentIndex = -1;
            return false;
        }

        if (entry.index === this._currentIndex) {
            // Toggle off
            this._currentIndex = -1;
            return false;
        }

        entry.button.checked = true;
        this._currentIndex = entry.index;
        return true;
    }

    get currentToolId(): string | null {
        if (this._currentIndex < 0) return null;
        return this.tools[this._currentIndex].descriptor.id;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        this.widget.enabled = value;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    deinit(): void {
        this.onToolClicked.clear();
    }
}
