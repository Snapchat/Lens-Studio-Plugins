import { Event, Unsubscribe } from "LensStudio:Event.js";
import { MessageBridge } from "./MessageBridge";
import {
    TransformData,
    Vec2Data,
    PoseData,
    AttachmentRef,
    StoryState,
} from "../model/types";

export class CanvasRuntime {
    readonly onBackgroundClicked = new Event<void>();
    readonly onBackgroundPivotChanged = new Event<Vec2Data>();
    readonly onBitmojiClicked = new Event<{ bitmojiIndex: number }>();
    readonly onBitmojiTransformChanged = new Event<{
        bitmojiIndex: number;
        transform: TransformData;
    }>();
    readonly onBubbleClicked = new Event<{ bubbleIndex: number }>();
    readonly onBubbleTransformChanged = new Event<{
        bubbleIndex: number;
        transform: TransformData;
    }>();

    private eventUnsub: Unsubscribe;

    constructor(private bridge: MessageBridge) {
        this.eventUnsub = this.bridge.onEvent.add((event) => this.routeEvent(event));
    }

    // -- Commands (Editor -> Lens) --

    async addFrame(): Promise<void> {
        await this.bridge.request("addFrame", {});
    }

    async removeFrame(frameIndex: number): Promise<void> {
        await this.bridge.request("removeFrame", { frameIndex });
    }

    async selectFrame(frameIndex: number): Promise<void> {
        await this.bridge.request("selectFrame", { frameIndex });
    }

    async copyFrame(insertAt: number): Promise<void> {
        await this.bridge.request("copyFrame", { insertAt });
    }

    async updateBackground(
        texture: string,
        pivot: Vec2Data,
        transform: TransformData,
    ): Promise<void> {
        await this.bridge.request("updateBackground", { texture, pivot, transform });
    }

    async addBitmoji(
        transform: TransformData,
        pose: PoseData,
        bitmojiType: number,
    ): Promise<void> {
        await this.bridge.request("addBitmoji", { transform, pose, bitmojiType });
    }

    async removeBitmoji(bitmojiIndex: number): Promise<void> {
        await this.bridge.request("removeBitmoji", { bitmojiIndex });
    }

    async selectBitmoji(bitmojiIndex: number): Promise<void> {
        await this.bridge.request("selectBitmoji", { bitmojiIndex });
    }

    async updatePose(pose: PoseData): Promise<void> {
        await this.bridge.request("updatePose", { pose });
    }

    async updateBitmojiType(bitmojiType: number): Promise<void> {
        await this.bridge.request("updateBitmojiType", { bitmojiType });
    }

    async addBubble(transform: TransformData, text: string): Promise<void> {
        await this.bridge.request("addBubble", { transform, text });
    }

    async removeBubble(bubbleIndex: number): Promise<void> {
        await this.bridge.request("removeBubble", { bubbleIndex });
    }

    async selectBubble(bubbleIndex: number): Promise<void> {
        await this.bridge.request("selectBubble", { bubbleIndex });
    }

    async updateBubbleText(text: string): Promise<void> {
        await this.bridge.request("updateBubbleText", { text });
    }

    async updateBubbleStyle(style: number): Promise<void> {
        await this.bridge.request("updateBubbleStyle", { style });
    }

    async updateBubbleTailStyle(style: number): Promise<void> {
        await this.bridge.request("updateBubbleTailStyle", { style });
    }

    async updateBubbleAttachments(attachments: AttachmentRef[]): Promise<void> {
        await this.bridge.request("updateBubbleAttachments", { attachments });
    }

    async loadFullState(state: StoryState): Promise<void> {
        await this.bridge.request("loadFullState", { state }, 15000);
    }

    // -- Event routing (Lens -> Editor) --

    private routeEvent(event: { type: string; payload: unknown }): void {
        const p = event.payload as Record<string, unknown> | undefined;

        switch (event.type) {
            case "backgroundClicked":
                this.onBackgroundClicked.trigger();
                break;
            case "backgroundPivotChanged":
                this.onBackgroundPivotChanged.trigger(p as unknown as Vec2Data);
                break;
            case "bitmojiClicked":
                this.onBitmojiClicked.trigger(p as unknown as { bitmojiIndex: number });
                break;
            case "bitmojiTransformChanged":
                this.onBitmojiTransformChanged.trigger(
                    p as unknown as { bitmojiIndex: number; transform: TransformData },
                );
                break;
            case "bubbleClicked":
                this.onBubbleClicked.trigger(p as unknown as { bubbleIndex: number });
                break;
            case "bubbleTransformChanged":
                this.onBubbleTransformChanged.trigger(
                    p as unknown as { bubbleIndex: number; transform: TransformData },
                );
                break;
        }
    }

    cleanup(): void {
        this.eventUnsub();
        this.onBackgroundClicked.clear();
        this.onBackgroundPivotChanged.clear();
        this.onBitmojiClicked.clear();
        this.onBitmojiTransformChanged.clear();
        this.onBubbleClicked.clear();
        this.onBubbleTransformChanged.clear();
    }
}
