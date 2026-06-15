import { PanelPlugin, Descriptor } from "LensStudio:PanelPlugin";
import {
    Widget,
    BoxLayout,
    Direction,
    Size,
    DockState,
    Label,
    Separator,
    Orientation,
    Shadow,
    ProgressIndicator,
    SizePolicy,
    Sizes,
    Alignment,
    ColorRole,
    PushButton,
    ClearLayoutBehavior
} from "LensStudio:Ui";
import { GuiService } from "LensStudio:GuiService";
import { Unsubscribe } from "LensStudio:Event.js";
import { LoginGuardWidget, ILoginGuardContent } from "@design-system";

import { Model } from "./model/Model";
import { Frame } from "./model/Frame";
import { SelectionType, Selection } from "./model/Selection";
import { ToolDescriptor, ToolPanel, toolDescriptors } from "./descriptors/ToolDescriptor";
import { ToolBar } from "./widgets/ToolBar";
import { SideBar } from "./widgets/SideBar";
import { FrameControlBar } from "./widgets/FrameControlBar";
import { CanvasWidget } from "./canvas/CanvasWidget";
import { SceneSyncManager } from "./sync/SceneSyncManager";
import { BUILDING_BLOCKS_PACKAGE_ID } from "./common/constants";

const SELECTION_TOOL_MAP: Record<string, string> = {
    [SelectionType.Background]: "background_tool",
    [SelectionType.Bitmoji]: "bitmoji_tool",
    [SelectionType.Bubble]: "bubble_tool",
};

export class BitmojiStoriesPanel extends PanelPlugin {
    private guard: LoginGuardWidget | null = null;

    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = "Com.Snap.ComicMakerBetaPanel";
        descriptor.name = "Comic Maker Beta";
        descriptor.description = "Comic Maker Beta";
        descriptor.isUnique = true;
        descriptor.menuActionHierarchy = ["Window", "Bitmoji Suite"];
        descriptor.defaultDockState = DockState.Attached;
        descriptor.defaultSize = new Size(800, 600);
        descriptor.minimumSize = new Size(800, 600);
        return descriptor;
    }

    createWidget(parent: Widget): Widget {
        const content = new BitmojiStoriesContent(this.pluginSystem);
        this.guard = new LoginGuardWidget(parent, {
            pluginSystem: this.pluginSystem,
            content,
            loginWidgetFactory: createLoginPrompt,
        });
        this.guard.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        return this.guard;
    }

    deinit(): void {
        if (this.guard) {
            this.guard.deinit();
            this.guard = null;
        }
    }
}

function createLoginPrompt(parent: Widget, authorize: () => void): Widget {
    const container = new Widget(parent);
    const layout = new BoxLayout();
    layout.setDirection(Direction.TopToBottom);
    layout.setContentsMargins(Sizes.DoublePadding, Sizes.DoublePadding, Sizes.DoublePadding, Sizes.DoublePadding);
    layout.spacing = Sizes.HalfPadding;
    layout.addStretch(0);

    const message = new Label(container);
    message.text = "<center>Log in to your Snapchat account to use Comic Maker Beta.</center>";
    message.wordWrap = true;
    message.foregroundRole = ColorRole.Text;
    message.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Preferred);
    layout.addWidget(message);

    const loginButton = new PushButton(container);
    loginButton.text = "Login";
    loginButton.primary = true;
    loginButton.onClick.connect(() => authorize());
    layout.addWidgetWithStretch(loginButton, 0, Alignment.AlignHCenter);

    layout.addStretch(0);
    container.layout = layout;
    return container;
}

class BitmojiStoriesContent implements ILoginGuardContent {
    private model: Model | null = null;
    private toolBar: ToolBar | null = null;
    private sideBar: SideBar | null = null;
    private frameControlBar: FrameControlBar | null = null;
    private canvasWidget: CanvasWidget | null = null;
    private sceneSyncManager: SceneSyncManager | null = null;
    private unsubs: Unsubscribe[] = [];
    private frameUnsubs: Unsubscribe[] = [];
    private rootWidget: Widget | null = null;
    private isHandlingSelection = false;

    constructor(private pluginSystem: Editor.PluginSystem) {}

    createWidget(parent: Widget): Widget {
        const root = new Widget(parent);
        root.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        this.rootWidget = root;
        this.initAsync(root);
        return root;
    }

    private async initAsync(root: Widget): Promise<void> {
        // Set root layout once — reused for both loading and editor states
        const rootLayout = new BoxLayout();
        rootLayout.setDirection(Direction.TopToBottom);
        rootLayout.spacing = 0;
        rootLayout.setContentsMargins(0, 0, 0, 0);
        root.layout = rootLayout;

        // Loading screen in its own container so clear() removes everything
        const loadingWidget = new Widget(root);
        loadingWidget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        const loadingLayout = new BoxLayout();
        loadingLayout.setDirection(Direction.TopToBottom);
        loadingLayout.setContentsMargins(Sizes.DoublePadding, Sizes.DoublePadding, Sizes.DoublePadding, Sizes.DoublePadding);
        loadingLayout.addStretch(0);

        const spinner = new ProgressIndicator(loadingWidget);
        spinner.start();
        loadingLayout.addWidgetWithStretch(spinner, 0, Alignment.AlignHCenter);

        const loadingLabel = new Label(loadingWidget);
        loadingLabel.text = "Importing building blocks...";
        loadingLabel.foregroundRole = ColorRole.Text;
        loadingLayout.addWidgetWithStretch(loadingLabel, 0, Alignment.AlignHCenter);

        loadingLayout.addStretch(0);
        loadingWidget.layout = loadingLayout;
        rootLayout.addWidget(loadingWidget);

        try {
            await this.importBuildingBlocks();
        } catch (e) {
            console.error("[BitmojiStories] Failed to import building blocks:", e);
        }

        // Tear down loading screen and build editor UI into the same rootLayout
        spinner.stop();
        rootLayout.clear(ClearLayoutBehavior.DeleteClearedWidgets);
        this.buildEditorUI(root, rootLayout);
    }

    private async importBuildingBlocks(): Promise<void> {
        const editorModel = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
        const assetManager = editorModel.project.assetManager;

        const existing = assetManager.assets.find(
            (asset: Editor.Assets.Asset) =>
                asset.getTypeName() === "NativePackageDescriptor" &&
                (asset as any).componentId?.toString() === BUILDING_BLOCKS_PACKAGE_ID,
        );
        if (existing) return;

        const filePath = new Editor.Path(import.meta.resolve("./resources/Comic Maker Building Blocks.lspkg"));
        const destPath = new Editor.Model.SourcePath(new Editor.Path("/"), Editor.Model.SourceRootDirectory.Assets);
        await assetManager.importExternalFileAsync(filePath, destPath, Editor.Model.ResultType.Packed);
    }

    private buildEditorUI(root: Widget, rootLayout: BoxLayout): void {
        this.model = new Model();

        // Create widgets
        this.sideBar = new SideBar(root);
        this.sideBar.close();

        this.toolBar = new ToolBar(root, toolDescriptors);
        this.toolBar.enabled = false;

        this.canvasWidget = new CanvasWidget(root, this.model, this.pluginSystem);

        this.frameControlBar = new FrameControlBar(root, this.pluginSystem);

        // --- Layout ---

        const horizontalContainer = new Widget(root);
        horizontalContainer.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);

        const sepV1 = new Separator(Orientation.Vertical, Shadow.Plain, root);
        sepV1.setMaximumWidth(Sizes.SeparatorLineWidth);

        const sepV2 = new Separator(Orientation.Vertical, Shadow.Plain, root);
        sepV2.setMaximumWidth(Sizes.SeparatorLineWidth);

        const hLayout = new BoxLayout();
        hLayout.setDirection(Direction.LeftToRight);
        hLayout.setContentsMargins(0, 0, 0, 0);
        hLayout.spacing = 0;
        hLayout.addWidget(this.toolBar.widget);
        hLayout.addWidget(sepV1);
        hLayout.addWidget(this.canvasWidget.widget);
        hLayout.addWidget(sepV2);
        hLayout.addWidget(this.sideBar.widget);
        horizontalContainer.layout = hLayout;

        const sepH = new Separator(Orientation.Horizontal, Shadow.Plain, root);
        sepH.setMaximumHeight(Sizes.SeparatorLineWidth);

        rootLayout.addWidget(horizontalContainer);
        rootLayout.addWidget(sepH);
        rootLayout.addWidget(this.frameControlBar.widget);

        // --- Wire events ---
        this.wireToolBar();
        this.wireFrameControlBar();
        this.wireModelEvents();

        // Initialize scene sync
        this.sceneSyncManager = new SceneSyncManager(this.model, this.pluginSystem);
        const rehydrated = this.sceneSyncManager.initializeFromExistingScene();

        if (!rehydrated) {
            this.sceneSyncManager.initializeNewScene();
            this.model.addFrame();
        } else {
            // loadState doesn't fire onFrameAdded, so manually populate the frame control bar
            for (let i = 0; i < this.model.getFrameCount(); i++) {
                this.frameControlBar!.addFrame();
            }
            this.frameControlBar!.updateSelection(this.model.getCurrentFrameIndex());
            this.toolBar!.enabled = true;
        }
    }

    private wireToolBar(): void {
        if (!this.toolBar || !this.sideBar || !this.model) return;

        this.unsubs.push(
            this.toolBar.onToolClicked.add((desc: ToolDescriptor) => {
                if (!this.sideBar || !this.model || !this.rootWidget) return;

                const selected = this.toolBar!.selectTool(desc.id);

                if (selected) {
                    this.isHandlingSelection = true;
                    try {
                        const panel = desc.panelFactory(this.sideBar.widget, this.model, this.pluginSystem);
                        this.sideBar.setContent(panel);
                        this.sideBar.open();

                        // Sync panel with current selection
                        const frame = this.model.getCurrentFrame();
                        if (frame && panel.onSelectionChanged) {
                            panel.onSelectionChanged(frame.getSelection());
                        }
                    } finally {
                        this.isHandlingSelection = false;
                    }
                } else {
                    this.sideBar.close();
                }
            }),
        );
    }

    private wireFrameControlBar(): void {
        if (!this.frameControlBar || !this.model) return;
        const fcb = this.frameControlBar;
        const model = this.model;

        this.unsubs.push(fcb.onAddFrame.add(() => model.addFrame()));
        this.unsubs.push(fcb.onCopyFrame.add(() => model.copyFrame()));
        this.unsubs.push(fcb.onRemoveFrame.add((index: number) => model.removeFrame(index)));
        this.unsubs.push(fcb.onSelectFrame.add((index: number) => model.selectFrame(index)));
    }

    private wireModelEvents(): void {
        if (!this.model || !this.frameControlBar || !this.toolBar) return;
        const model = this.model;
        const fcb = this.frameControlBar;
        const toolbar = this.toolBar;

        this.unsubs.push(
            model.onFrameAdded.add(() => fcb.addFrame()),
        );
        this.unsubs.push(
            model.onFrameCopied.add(({ newIndex }) => fcb.insertFrame(newIndex)),
        );
        this.unsubs.push(
            model.onFrameRemoved.add(({ index }: { index: number }) => fcb.removeFrame(index)),
        );
        this.unsubs.push(
            model.onFrameSelected.add(({ index, frame }: { index: number; frame: Frame }) => {
                fcb.updateSelection(index);
                toolbar.enabled = index !== -1;
                this.subscribeToFrame(frame);
            }),
        );
    }

    private subscribeToFrame(frame: Frame | null): void {
        // Unsubscribe from previous frame
        for (const unsub of this.frameUnsubs) unsub();
        this.frameUnsubs = [];

        if (!frame) return;

        this.frameUnsubs.push(
            frame.onSelectionChanged.add((selection: Selection) => {
                this.handleSelectionChanged(selection);
            }),
        );
    }

    private handleSelectionChanged(selection: Selection): void {
        if (this.isHandlingSelection) return;
        if (!this.toolBar || !this.sideBar || !this.model || !this.rootWidget) return;

        this.isHandlingSelection = true;
        try {
            if (selection.type === null) {
                this.toolBar.selectTool(null);
                this.sideBar.close();
                return;
            }

            const targetToolId = SELECTION_TOOL_MAP[selection.type];
            if (!targetToolId) return;

            // If the correct tool panel is already open, just notify it
            if (this.toolBar.currentToolId === targetToolId && this.sideBar.isOpen) {
                const panel = this.sideBar.panel;
                if (panel?.onSelectionChanged) {
                    panel.onSelectionChanged(selection);
                }
                return;
            }

            // Switch to the right tool
            const desc = toolDescriptors.find((d) => d.id === targetToolId);
            if (!desc) return;

            this.toolBar.selectTool(targetToolId);
            const panel = desc.panelFactory(this.sideBar.widget, this.model, this.pluginSystem);
            this.sideBar.setContent(panel);
            this.sideBar.open();

            if (panel.onSelectionChanged) {
                panel.onSelectionChanged(selection);
            }
        } finally {
            this.isHandlingSelection = false;
        }
    }

    deinit(): void {
        for (const unsub of this.frameUnsubs) unsub();
        this.frameUnsubs = [];
        for (const unsub of this.unsubs) unsub();
        this.unsubs = [];

        this.sideBar?.close();
        this.toolBar?.deinit();
        this.frameControlBar?.deinit();
        this.canvasWidget?.deinit();
        this.sceneSyncManager?.deinit();
        this.model?.deinit();

        this.model = null;
        this.toolBar = null;
        this.sideBar = null;
        this.frameControlBar = null;
        this.canvasWidget = null;
        this.sceneSyncManager = null;

        if (this.rootWidget) {
            this.rootWidget.deleteLater();
            this.rootWidget = null;
        }
    }
}
/*
export class MyPanelLauncher extends GuiService {
    panel: BitmojiStoriesPanel | null = null;
    timer: ReturnType<typeof setTimeout> | null = null;

    static descriptor() {
        return {
            id: "Com.Snap.BMStoriesPanelLauncher",
            name: "Bitmoji Stories Panel Launcher",
            description: "Bitmoji Stories Panel Launcher",
            dependencies: [Editor.Dock.IDockManager],
        };
    }

    start() {
        this.timer = setTimeout(() => {
            const panelFilter = (descriptor: IPluginDescriptor) =>
                descriptor.id === BitmojiStoriesPanel.descriptor().id;
            const allDescriptors = this.pluginSystem.descriptors;
            const targetPanelDescriptor = allDescriptors.find(panelFilter) as IPluginDescriptor;

            this.panel = this.pluginSystem.create(targetPanelDescriptor) as BitmojiStoriesPanel;
            const dockManager = this.pluginSystem.findInterface(
                Editor.Dock.IDockManager,
            ) as Editor.Dock.IDockManager;
            dockManager.add(this.panel);
        }, 500);
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}
*/
