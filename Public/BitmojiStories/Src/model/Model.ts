import { Event } from "LensStudio:Event.js";
import { Frame } from "./Frame";
import {
    FrameState,
    StoryState,
    BitmojiState,
    BubbleState,
    TransformData,
    Vec2Data,
    PoseData,
    AttachmentRef,
    deepClone,
} from "./types";
import { SelectionType } from "./Selection";

export class Model {
    private frames: Frame[] = [];
    private currentFrameIndex = -1;

    readonly onFrameAdded = new Event<{ index: number }>();
    readonly onFrameRemoved = new Event<{ index: number }>();
    readonly onFrameSelected = new Event<{ index: number; frame: Frame }>();
    readonly onFrameCopied = new Event<{
        sourceIndex: number;
        newIndex: number;
    }>();

    // -- Frame Management --

    addFrame(state?: FrameState): Frame {
        const frame = new Frame(state);
        this.frames.push(frame);
        const index = this.frames.length - 1;
        this.onFrameAdded.trigger({ index });

        if (this.frames.length === 1) {
            this.selectFrame(0);
        }

        return frame;
    }

    copyFrame(): Frame | null {
        const current = this.getCurrentFrame();
        if (!current) return null;

        const sourceIndex = this.currentFrameIndex;
        const newIndex = sourceIndex + 1;
        const cloned = current.clone();
        this.frames.splice(newIndex, 0, cloned);
        this.onFrameCopied.trigger({ sourceIndex, newIndex });
        this.selectFrame(newIndex);
        return cloned;
    }

    selectFrame(index: number): void {
        if (index < -1 || index >= this.frames.length) return;

        // Clear the old frame's selection while listeners are still subscribed
        // to it — this lets sidebar/toolbar/canvas react to the deselection.
        const oldFrame = this.frames[this.currentFrameIndex];
        if (oldFrame && this.currentFrameIndex !== index) {
            oldFrame.clearSelection();
        }

        this.currentFrameIndex = index;
        const frame = this.frames[index];
        this.onFrameSelected.trigger({ index, frame });
    }

    removeFrame(index: number): void {
        if (index < 0 || index >= this.frames.length) return;

        const wasSelected = this.currentFrameIndex === index;
        if (wasSelected) {
            this.frames[index].clearSelection();
        }

        const removed = this.frames[index];
        removed.deinit();
        this.frames.splice(index, 1);
        this.onFrameRemoved.trigger({ index });

        if (wasSelected) {
            const newIndex =
                this.currentFrameIndex >= this.frames.length
                    ? this.currentFrameIndex - 1
                    : this.currentFrameIndex;
            this.selectFrame(newIndex);
        } else if (this.currentFrameIndex > index) {
            this.selectFrame(this.currentFrameIndex - 1);
        }
    }

    getCurrentFrame(): Frame | null {
        return this.frames[this.currentFrameIndex] ?? null;
    }

    getCurrentFrameIndex(): number {
        return this.currentFrameIndex;
    }

    getFrame(index: number): Frame | null {
        return this.frames[index] ?? null;
    }

    getFrameCount(): number {
        return this.frames.length;
    }

    // -- Background (delegates to current frame) --

    updateBackgroundTexture(texture: string | null, path: string | null): void {
        this.getCurrentFrame()?.updateBackgroundTexture(texture, path);
    }

    updateBackgroundPivot(pivot: Vec2Data): void {
        this.getCurrentFrame()?.updateBackgroundPivot(pivot);
    }

    updateBackgroundTransform(transform: TransformData): void {
        this.getCurrentFrame()?.updateBackgroundTransform(transform);
    }

    selectBackground(): void {
        this.getCurrentFrame()?.selectBackground();
    }

    // -- Bitmoji (delegates to current frame, manages selection) --

    addBitmoji(bitmoji: BitmojiState): boolean {
        const frame = this.getCurrentFrame();
        if (!frame) return false;

        const added = frame.addBitmoji(bitmoji);
        if (added) {
            frame.selectBitmoji(frame.getState().bitmojis.length - 1);
        }
        return added;
    }

    removeBitmoji(index: number): boolean {
        const frame = this.getCurrentFrame();
        if (!frame) return false;

        const removed = frame.removeBitmoji(index);
        if (removed) {
            frame.clearSelection();
        }
        return removed;
    }

    selectBitmoji(index: number): void {
        this.getCurrentFrame()?.selectBitmoji(index);
    }

    updateBitmojiType(bitmojiType: number): void {
        const frame = this.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bitmoji || sel.index === -1) return;
        frame.setBitmojiType(sel.index, bitmojiType);
    }

    updateBitmojiTransform(index: number, transform: TransformData): void {
        this.getCurrentFrame()?.updateBitmojiTransform(index, transform);
    }

    setPose(pose: PoseData): void {
        const frame = this.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bitmoji || sel.index === -1) return;
        frame.setPose(sel.index, pose);
    }

    // -- Bubble (delegates to current frame, manages selection) --

    addBubble(bubble: BubbleState): boolean {
        const frame = this.getCurrentFrame();
        if (!frame) return false;

        const added = frame.addBubble(bubble);
        if (added) {
            frame.selectBubble(frame.getState().bubbles.length - 1);
        }
        return added;
    }

    removeBubble(index: number): boolean {
        const frame = this.getCurrentFrame();
        if (!frame) return false;

        const removed = frame.removeBubble(index);
        if (removed) {
            const remaining = frame.getState().bubbles.length;
            if (remaining === 0) {
                frame.clearSelection();
            } else {
                frame.selectBubble(remaining - 1);
            }
        }
        return removed;
    }

    selectBubble(index: number): void {
        this.getCurrentFrame()?.selectBubble(index);
    }

    setBubbleText(text: string): void {
        const frame = this.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bubble || sel.index === -1) return;
        frame.setBubbleText(sel.index, text);
    }

    setBubbleStyle(style: number): void {
        const frame = this.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bubble || sel.index === -1) return;
        frame.setBubbleStyle(sel.index, style);
    }

    setBubbleTailStyle(style: number): void {
        const frame = this.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bubble || sel.index === -1) return;
        frame.setBubbleTailStyle(sel.index, style);
    }

    updateBubbleTransform(index: number, transform: TransformData): void {
        this.getCurrentFrame()?.updateBubbleTransform(index, transform);
    }

    addAttachment(attachment: AttachmentRef): void {
        const frame = this.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bubble || sel.index === -1) return;
        frame.addAttachment(sel.index, attachment);
    }

    removeAttachment(attachment: AttachmentRef): void {
        const frame = this.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bubble || sel.index === -1) return;
        frame.removeAttachment(sel.index, attachment);
    }

    // -- State Snapshot / Rehydration --

    getState(): Readonly<StoryState> {
        return {
            version: 1,
            frames: this.frames.map((f) => f.getState()),
            currentFrameIndex: this.currentFrameIndex,
        };
    }

    loadState(state: StoryState): void {
        for (const frame of this.frames) {
            frame.deinit();
        }
        this.frames = state.frames.map((fs) =>
            Frame.fromState(deepClone(fs)),
        );
        this.currentFrameIndex = state.currentFrameIndex;
    }

    // -- Cleanup --

    deinit(): void {
        for (const frame of this.frames) {
            frame.deinit();
        }
        this.frames = [];
        this.onFrameAdded.clear();
        this.onFrameRemoved.clear();
        this.onFrameSelected.clear();
        this.onFrameCopied.clear();
    }
}
