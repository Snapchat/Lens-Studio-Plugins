import * as LensBasedEditorView from "LensStudio:LensBasedEditorView";
import * as Ui from "LensStudio:Ui";
import { Unsubscribe } from "LensStudio:Event.js";
import { MessageBridge } from "./MessageBridge";
import { CanvasRuntime } from "./CanvasRuntime";
import { Model } from "../model/Model";
import { Frame } from "../model/Frame";
import { SelectionType, Selection } from "../model/Selection";
import { Vec2Data } from "../model/types";

const IGNORED_TYPES = [
    "ScriptComponent",
    "AnimationPlayer",
    "AnimationMixer",
    "Animation",
    "AudioComponent",
    "AudioListenerComponent",
    "ColocatedTrackingComponent",
    "DeviceLocationTrackingComponent",
    "DeviceTracking",
    "LocatedAtComponent",
    "ManipulateComponent",
    "MarkerTrackingComponent",
    "ObjectTracking",
    "ObjectTracking3D",
    "VFXComponent",
    "MLComponent",
    "InteractionComponent",
    "MaskingComponent",
    "BodyComponent",
    "ColliderComponent",
    "ConstraintComponent",
];

export class CanvasWidget {
    readonly widget: LensBasedEditorView.LensBasedEditorView;
    readonly runtime: CanvasRuntime;

    private bridge: MessageBridge;
    private modelUnsubs: Unsubscribe[] = [];
    private frameUnsubs: Unsubscribe[] = [];
    private runtimeUnsubs: Unsubscribe[] = [];
    private stateConnection: Editor.ScopedConnection | null = null;

    constructor(
        parent: Ui.Widget,
        private model: Model,
        pluginSystem: Editor.PluginSystem,
    ) {
        const initOptions = new LensBasedEditorView.InitOptions();
        initOptions.authorization = pluginSystem.findInterface(
            Editor.IAuthorization,
        ) as Editor.IAuthorization;

        this.widget = LensBasedEditorView.create(initOptions, parent);
        this.widget.setSizePolicy(
            Ui.SizePolicy.Policy.Expanding,
            Ui.SizePolicy.Policy.Expanding,
        );

        const imageInput = new LensBasedEditorView.ImageInput();
        imageInput.file = new Editor.Path(
            import.meta.resolve("./Resources/background.png"),
        );
        imageInput.fps = 30;
        imageInput.paused = false;

        this.bridge = new MessageBridge(this.widget);
        this.runtime = new CanvasRuntime(this.bridge);

        const loadOptions = new LensBasedEditorView.LoadOptions();
        loadOptions.lens = new Editor.Path(
            import.meta.resolve("./Resources/lens.zip"),
        );
        loadOptions.input = imageInput;
        loadOptions.ignoredTypes = IGNORED_TYPES;
        loadOptions.useOverlayOutput = false;

        this.stateConnection = this.widget.onStateChanged.connect(
            (state: LensBasedEditorView.State) => {
                if (state === LensBasedEditorView.State.Running) {
                    this.onReady();
                }
            },
        );

        this.widget.load(loadOptions);
        this.wireRuntimeEvents();
    }

    private onReady(): void {
        this.wireModelEvents();

        const currentFrame = this.model.getCurrentFrame();
        if (currentFrame) {
            this.subscribeToFrame(currentFrame);
        }

        this.syncCurrentState();
    }

    /**
     * Replay the current model state to the canvas after it becomes ready.
     * Uses loadFullState to send the entire state atomically, avoiding
     * intermediate invalid states from sequential per-frame commands.
     */
    private async syncCurrentState(): Promise<void> {
        const state = this.model.getState();
        if (state.frames.length === 0) return;

        try {
            await this.runtime.loadFullState(state);
        } catch (e) {
            console.error("[CanvasWidget] syncCurrentState error:", e);
            console.error(e.stack);
        }
    }

    // -- Wire model events to canvas commands --

    private wireModelEvents(): void {
        this.modelUnsubs.push(
            this.model.onFrameAdded.add((_data) => {
                this.runtime.addFrame().catch(this.logError);
            }),
        );

        this.modelUnsubs.push(
            this.model.onFrameRemoved.add(({ index }) => {
                this.runtime.removeFrame(index).catch(this.logError);
            }),
        );

        this.modelUnsubs.push(
            this.model.onFrameSelected.add(({ index, frame }) => {
                this.runtime.selectFrame(index).catch(this.logError);
                this.subscribeToFrame(frame);
            }),
        );

        this.modelUnsubs.push(
            this.model.onFrameCopied.add(({ newIndex }) => {
                this.runtime.copyFrame(newIndex).catch(this.logError);
            }),
        );
    }

    private subscribeToFrame(frame: Frame | null): void {
        for (const unsub of this.frameUnsubs) unsub();
        this.frameUnsubs = [];
        if (!frame) return;

        this.frameUnsubs.push(
            frame.onBackgroundUpdated.add(({ property }) => {
                if (property !== "texture") return;
                const bg = frame.getState().background;
                if (!bg.texture) return;
                this.runtime
                    .updateBackground(bg.texture, bg.pivot, bg.transform)
                    .catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBitmojiAdded.add(({ index }) => {
                const bitmoji = frame.getState().bitmojis[index];
                if (!bitmoji) return;
                this.runtime
                    .addBitmoji(bitmoji.transform, bitmoji.pose, bitmoji.bitmojiType)
                    .catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBitmojiRemoved.add(({ index }) => {
                this.runtime.removeBitmoji(index).catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onSelectionChanged.add((sel: Selection) => {
                if (sel.type === SelectionType.Bitmoji) {
                    this.runtime.selectBitmoji(sel.index).catch(this.logError);
                    this.runtime.selectBubble(-1).catch(this.logError);
                } else if (sel.type === SelectionType.Bubble) {
                    this.runtime.selectBubble(sel.index).catch(this.logError);
                    this.runtime.selectBitmoji(-1).catch(this.logError);
                } else {
                    this.runtime.selectBitmoji(-1).catch(this.logError);
                    this.runtime.selectBubble(-1).catch(this.logError);
                }
            }),
        );

        this.frameUnsubs.push(
            frame.onPoseUpdated.add(({ pose }) => {
                this.runtime.updatePose(pose).catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBitmojiTypeUpdated.add(({ bitmojiType }) => {
                this.runtime.updateBitmojiType(bitmojiType).catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBubbleAdded.add(({ index }) => {
                const bubble = frame.getState().bubbles[index];
                if (!bubble) return;
                this.runtime
                    .addBubble(bubble.transform, bubble.text)
                    .catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBubbleRemoved.add(({ index }) => {
                this.runtime.removeBubble(index).catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBubbleTextUpdated.add(({ text }) => {
                this.runtime.updateBubbleText(text).catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBubbleStyleUpdated.add(({ style }) => {
                this.runtime.updateBubbleStyle(style).catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBubbleTailStyleUpdated.add(({ style }) => {
                this.runtime.updateBubbleTailStyle(style).catch(this.logError);
            }),
        );

        this.frameUnsubs.push(
            frame.onBubbleAttachmentUpdated.add(({ attachments }) => {
                this.runtime.updateBubbleAttachments(attachments).catch(this.logError);
            }),
        );
    }

    // -- Wire canvas events back to model --

    private wireRuntimeEvents(): void {
        this.runtimeUnsubs.push(
            this.runtime.onBackgroundClicked.add(() => {
                this.model.selectBackground();
            }),
        );

        this.runtimeUnsubs.push(
            this.runtime.onBackgroundPivotChanged.add((pivot: Vec2Data) => {
                this.model.updateBackgroundPivot(pivot);
            }),
        );

        this.runtimeUnsubs.push(
            this.runtime.onBitmojiClicked.add(({ bitmojiIndex }) => {
                this.model.selectBitmoji(bitmojiIndex);
            }),
        );

        this.runtimeUnsubs.push(
            this.runtime.onBitmojiTransformChanged.add(({ bitmojiIndex, transform }) => {
                this.model.updateBitmojiTransform(bitmojiIndex, transform);
            }),
        );

        this.runtimeUnsubs.push(
            this.runtime.onBubbleClicked.add(({ bubbleIndex }) => {
                this.model.selectBubble(bubbleIndex);
            }),
        );

        this.runtimeUnsubs.push(
            this.runtime.onBubbleTransformChanged.add(({ bubbleIndex, transform }) => {
                this.model.updateBubbleTransform(bubbleIndex, transform);
            }),
        );
    }

    private logError = (e: unknown): void => {
        console.error("[CanvasWidget] Canvas command failed:", e);
    };

    deinit(): void {
        for (const unsub of this.frameUnsubs) unsub();
        this.frameUnsubs = [];
        for (const unsub of this.modelUnsubs) unsub();
        this.modelUnsubs = [];
        for (const unsub of this.runtimeUnsubs) unsub();
        this.runtimeUnsubs = [];

        this.runtime.cleanup();
        this.bridge.cleanup();
        this.stateConnection?.disconnect();
        this.stateConnection = null;

        if (this.widget.isLoaded) {
            this.widget.unload();
        }
        this.widget.deleteLater();
    }
}
