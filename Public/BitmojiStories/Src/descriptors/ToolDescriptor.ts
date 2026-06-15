import { Widget } from "LensStudio:Ui";
import { Model } from "../model/Model";
import { Selection } from "../model/Selection";
import { BackgroundToolPanel } from "../panels/BackgroundToolPanel";
import { BitmojiToolPanel } from "../panels/BitmojiToolPanel";
import { BubbleToolPanel } from "../panels/BubbleToolPanel";

export interface ToolPanel {
    widget: Widget;
    deinit(): void;
    onSelectionChanged?(selection: Selection): void;
}

export interface ToolDescriptor {
    id: string;
    icon: Editor.Icon;
    tooltip: string;
    panelFactory: (parent: Widget, model: Model, pluginSystem: Editor.PluginSystem) => ToolPanel;
}

export const toolDescriptors: ToolDescriptor[] = [
    {
        id: "background_tool",
        icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("./icons/background_tool.svg"))),
        tooltip: "Add background",
        panelFactory: (parent, model, ps) => new BackgroundToolPanel(parent, model, ps),
    },
    {
        id: "bitmoji_tool",
        icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("./icons/bitmoji_tool.svg"))),
        tooltip: "Add Bitmoji",
        panelFactory: (parent, model, ps) => new BitmojiToolPanel(parent, model, ps),
    },
    {
        id: "bubble_tool",
        icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("./icons/bubble_tool.svg"))),
        tooltip: "Add speech bubble",
        panelFactory: (parent, model, ps) => new BubbleToolPanel(parent, model, ps),
    },
];
