import { BitmojiState, PoseData, Vec3Data } from "./types";
import { createTransform } from "./Transform";

export const MAX_BITMOJIS_PER_FRAME = 2;

export const LEFT_BITMOJI_POSITION: Vec3Data = { x: -30, y: -100, z: -200 };
export const RIGHT_BITMOJI_POSITION: Vec3Data = { x: 30, y: -100, z: -200 };

export function createDefaultBitmoji(existingCount: number, pose: PoseData): BitmojiState {
    const position = existingCount === 0 ? LEFT_BITMOJI_POSITION : RIGHT_BITMOJI_POSITION;
    return {
        transform: createTransform(position, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }),
        pose,
        bitmojiType: 0,
        parentBubble: null,
    };
}
