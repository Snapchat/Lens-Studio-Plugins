import { TransformData, Vec3Data } from "./types";

const ZERO: Vec3Data = { x: 0, y: 0, z: 0 };
const ONE: Vec3Data = { x: 1, y: 1, z: 1 };

export function createTransform(
    position: Vec3Data = ZERO,
    rotation: Vec3Data = ZERO,
    scale: Vec3Data = ONE,
): TransformData {
    return {
        position: { ...position },
        rotation: { ...rotation },
        scale: { ...scale },
    };
}
