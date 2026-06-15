export interface Vec2Data {
    x: number;
    y: number;
}

export interface Vec3Data {
    x: number;
    y: number;
    z: number;
}

export interface TransformData {
    position: Vec3Data;
    rotation: Vec3Data;
    scale: Vec3Data;
}

export interface PoseData {
    url: string;
    extraUrl?: string;
    path?: string;
    extraPath?: string;
}

export interface AttachmentRef {
    type: "bitmoji" | "bubble";
    index: number;
}

export interface BackgroundState {
    texture: string | null;
    path: string | null;
    pivot: Vec2Data;
    transform: TransformData;
}

export interface BitmojiState {
    transform: TransformData;
    pose: PoseData;
    bitmojiType: number;
    parentBubble: number | null;
}

export interface BubbleState {
    transform: TransformData;
    text: string;
    bubbleStyle: number;
    tailStyle: number;
    attachments: AttachmentRef[];
    parentBubble: number | null;
}

export interface FrameState {
    background: BackgroundState;
    bitmojis: BitmojiState[];
    bubbles: BubbleState[];
}

export interface StoryState {
    version: 1;
    frames: FrameState[];
    currentFrameIndex: number;
}

export function deepClone<T>(value: T): T {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value))
        return value.map((item) => deepClone(item)) as T;
    const result = {} as T;
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            result[key] = deepClone(value[key]);
        }
    }
    return result;
}
