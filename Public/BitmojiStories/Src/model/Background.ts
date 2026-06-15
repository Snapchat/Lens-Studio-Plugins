import { BackgroundState } from "./types";
import { createTransform } from "./Transform";

export const DEFAULT_BACKGROUND_POSITION = { x: 0, y: 0, z: -4500 };
export const DEFAULT_BACKGROUND_SCALE = { x: 3200, y: 5600, z: 3200 };

export function createDefaultBackground(): BackgroundState {
    return {
        texture: null,
        path: null,
        pivot: { x: 0, y: 0 },
        transform: createTransform(
            DEFAULT_BACKGROUND_POSITION,
            { x: 0, y: 0, z: 0 },
            DEFAULT_BACKGROUND_SCALE,
        ),
    };
}
