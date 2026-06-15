import { Event, Unsubscribe } from "LensStudio:Event.js";
import {
    FrameState,
    BitmojiState,
    BubbleState,
    TransformData,
    Vec2Data,
    AttachmentRef,
    PoseData,
    deepClone,
} from "./types";
import { Selection, SelectionType, createEmptySelection } from "./Selection";
import { createDefaultBackground } from "./Background";
import { MAX_BITMOJIS_PER_FRAME } from "./Bitmoji";

export class Frame {
    private state: FrameState;
    private selection: Selection = createEmptySelection();

    readonly onSelectionChanged = new Event<Selection>();
    readonly onBackgroundUpdated = new Event<{
        property: "texture" | "pivot" | "transform";
    }>();
    readonly onBitmojiAdded = new Event<{ index: number }>();
    readonly onBitmojiRemoved = new Event<{ index: number }>();
    readonly onBitmojiTypeUpdated = new Event<{
        index: number;
        bitmojiType: number;
    }>();
    readonly onPoseUpdated = new Event<{ index: number; pose: PoseData }>();
    readonly onBitmojiTransformUpdated = new Event<{
        index: number;
        transform: TransformData;
    }>();
    readonly onBubbleAdded = new Event<{ index: number }>();
    readonly onBubbleRemoved = new Event<{ index: number }>();
    readonly onBubbleTextUpdated = new Event<{
        index: number;
        text: string;
    }>();
    readonly onBubbleStyleUpdated = new Event<{
        index: number;
        style: number;
    }>();
    readonly onBubbleTailStyleUpdated = new Event<{
        index: number;
        style: number;
    }>();
    readonly onBubbleAttachmentUpdated = new Event<{
        index: number;
        attachments: AttachmentRef[];
    }>();
    readonly onBubbleTransformUpdated = new Event<{
        index: number;
        transform: TransformData;
    }>();

    constructor(state?: FrameState) {
        this.state = state ?? {
            background: createDefaultBackground(),
            bitmojis: [],
            bubbles: [],
        };
    }

    // -- Background --

    updateBackgroundTexture(texture: string | null, path: string | null): void {
        this.state.background.texture = texture;
        this.state.background.path = path;
        this.state.background.pivot = { x: 0, y: 0 };
        this.onBackgroundUpdated.trigger({ property: "texture" });
    }

    updateBackgroundPivot(pivot: Vec2Data): void {
        this.state.background.pivot = pivot;
        this.onBackgroundUpdated.trigger({ property: "pivot" });
    }

    updateBackgroundTransform(transform: TransformData): void {
        this.state.background.transform = transform;
        this.onBackgroundUpdated.trigger({ property: "transform" });
    }

    // -- Bitmoji --

    addBitmoji(bitmoji: BitmojiState): boolean {
        if (this.state.bitmojis.length >= MAX_BITMOJIS_PER_FRAME) return false;
        this.state.bitmojis.push(bitmoji);
        this.onBitmojiAdded.trigger({ index: this.state.bitmojis.length - 1 });
        return true;
    }

    removeBitmoji(index: number): boolean {
        const bitmoji = this.state.bitmojis[index];
        if (!bitmoji) return false;

        if (bitmoji.parentBubble != null) {
            this.removeAttachment(bitmoji.parentBubble, {
                type: "bitmoji",
                index,
            });
        }

        this.state.bitmojis.splice(index, 1);

        for (const bubble of this.state.bubbles) {
            for (const att of bubble.attachments) {
                if (att.type === "bitmoji" && att.index > index) {
                    att.index--;
                }
            }
        }

        this.onBitmojiRemoved.trigger({ index });
        return true;
    }

    setBitmojiType(index: number, bitmojiType: number): boolean {
        const bitmoji = this.state.bitmojis[index];
        if (!bitmoji) return false;
        // No-op when type didn't change — otherwise re-firing this event causes the
        // canvas to redownload the avatar against a stale `selectedBitmoji`, which
        // can corrupt the wrong bitmoji (e.g. Me being rebuilt as Friend).
        if (bitmoji.bitmojiType === bitmojiType) return false;
        bitmoji.bitmojiType = bitmojiType;
        this.onBitmojiTypeUpdated.trigger({ index, bitmojiType });
        return true;
    }

    setPose(index: number, pose: PoseData): boolean {
        const bitmoji = this.state.bitmojis[index];
        if (!bitmoji) return false;
        bitmoji.pose = pose;
        this.onPoseUpdated.trigger({ index, pose });
        return true;
    }

    updateBitmojiTransform(index: number, transform: TransformData): void {
        const bitmoji = this.state.bitmojis[index];
        if (!bitmoji) return;
        bitmoji.transform = transform;
        this.onBitmojiTransformUpdated.trigger({ index, transform });
    }

    // -- Bubble --

    addBubble(bubble: BubbleState): boolean {
        this.state.bubbles.push(bubble);
        this.onBubbleAdded.trigger({ index: this.state.bubbles.length - 1 });
        return true;
    }

    removeBubble(index: number): boolean {
        const bubble = this.state.bubbles[index];
        if (!bubble) return false;

        for (const att of bubble.attachments) {
            if (att.type === "bitmoji") {
                const bitmoji = this.state.bitmojis[att.index];
                if (bitmoji) bitmoji.parentBubble = null;
            } else {
                const child = this.state.bubbles[att.index];
                if (child) child.parentBubble = null;
            }
        }

        if (bubble.parentBubble != null) {
            this.removeAttachment(bubble.parentBubble, {
                type: "bubble",
                index,
            });
        }

        this.state.bubbles.splice(index, 1);

        for (const bitmoji of this.state.bitmojis) {
            if (bitmoji.parentBubble != null && bitmoji.parentBubble > index) {
                bitmoji.parentBubble--;
            }
        }

        for (const b of this.state.bubbles) {
            if (b.parentBubble != null && b.parentBubble > index) {
                b.parentBubble--;
            }
            for (const att of b.attachments) {
                if (att.type === "bubble" && att.index > index) {
                    att.index--;
                }
            }
        }

        this.onBubbleRemoved.trigger({ index });
        return true;
    }

    setBubbleText(index: number, text: string): boolean {
        const bubble = this.state.bubbles[index];
        if (!bubble) return false;
        bubble.text = text;
        this.onBubbleTextUpdated.trigger({ index, text });
        return true;
    }

    setBubbleStyle(index: number, style: number): boolean {
        const bubble = this.state.bubbles[index];
        if (!bubble) return false;
        bubble.bubbleStyle = style;
        this.onBubbleStyleUpdated.trigger({ index, style });
        return true;
    }

    setBubbleTailStyle(index: number, style: number): boolean {
        const bubble = this.state.bubbles[index];
        if (!bubble) return false;
        bubble.tailStyle = style;
        this.onBubbleTailStyleUpdated.trigger({ index, style });
        return true;
    }

    updateBubbleTransform(index: number, transform: TransformData): void {
        const bubble = this.state.bubbles[index];
        if (!bubble) return;
        bubble.transform = transform;
        this.onBubbleTransformUpdated.trigger({ index, transform });
    }

    addAttachment(bubbleIndex: number, attachment: AttachmentRef): boolean {
        const bubble = this.state.bubbles[bubbleIndex];
        if (!bubble) return false;

        if (attachment.type === "bitmoji") {
            const bitmoji = this.state.bitmojis[attachment.index];
            if (!bitmoji) return false;
            bitmoji.parentBubble = bubbleIndex;
        } else {
            const target = this.state.bubbles[attachment.index];
            if (!target) return false;
            target.parentBubble = bubbleIndex;
        }

        bubble.attachments.push(attachment);
        this.onBubbleAttachmentUpdated.trigger({
            index: bubbleIndex,
            attachments: bubble.attachments,
        });
        return true;
    }

    removeAttachment(bubbleIndex: number, attachment: AttachmentRef): boolean {
        const bubble = this.state.bubbles[bubbleIndex];
        if (!bubble) return false;

        bubble.attachments = bubble.attachments.filter(
            (a) => a.type !== attachment.type || a.index !== attachment.index,
        );

        if (attachment.type === "bitmoji") {
            const bitmoji = this.state.bitmojis[attachment.index];
            if (bitmoji) bitmoji.parentBubble = null;
        } else {
            const target = this.state.bubbles[attachment.index];
            if (target) target.parentBubble = null;
        }

        this.onBubbleAttachmentUpdated.trigger({
            index: bubbleIndex,
            attachments: bubble.attachments,
        });
        return true;
    }

    // -- Selection --

    selectBitmoji(index: number): void {
        this.selection = { type: SelectionType.Bitmoji, index };
        this.onSelectionChanged.trigger(this.selection);
    }

    selectBubble(index: number): void {
        this.selection = { type: SelectionType.Bubble, index };
        this.onSelectionChanged.trigger(this.selection);
    }

    selectBackground(): void {
        this.selection = { type: SelectionType.Background, index: -1 };
        this.onSelectionChanged.trigger(this.selection);
    }

    clearSelection(): void {
        this.selection = createEmptySelection();
        this.onSelectionChanged.trigger(this.selection);
    }

    getSelection(): Readonly<Selection> {
        return this.selection;
    }

    // -- State --

    getState(): Readonly<FrameState> {
        return this.state;
    }

    static fromState(state: FrameState): Frame {
        return new Frame(state);
    }

    clone(): Frame {
        return Frame.fromState(deepClone(this.state));
    }

    cloneBackgroundOnly(): Frame {
        return new Frame({
            background: deepClone(this.state.background),
            bitmojis: [],
            bubbles: [],
        });
    }

    // -- Cleanup --

    deinit(): void {
        this.onSelectionChanged.clear();
        this.onBackgroundUpdated.clear();
        this.onBitmojiAdded.clear();
        this.onBitmojiRemoved.clear();
        this.onBitmojiTypeUpdated.clear();
        this.onPoseUpdated.clear();
        this.onBitmojiTransformUpdated.clear();
        this.onBubbleAdded.clear();
        this.onBubbleRemoved.clear();
        this.onBubbleTextUpdated.clear();
        this.onBubbleStyleUpdated.clear();
        this.onBubbleTailStyleUpdated.clear();
        this.onBubbleAttachmentUpdated.clear();
        this.onBubbleTransformUpdated.clear();
    }
}
