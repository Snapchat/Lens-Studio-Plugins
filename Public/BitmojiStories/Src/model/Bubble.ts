import { BubbleState } from "./types";
import { createTransform } from "./Transform";

export const DEFAULT_BUBBLE_TEXT = "Hello, how are you?";

export function createDefaultBubble(): BubbleState {
    return {
        transform: createTransform({ x: 0, y: 20, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }),
        text: DEFAULT_BUBBLE_TEXT,
        bubbleStyle: 0,
        tailStyle: 0,
        attachments: [],
        parentBubble: null,
    };
}
