import * as FileSystem from "LensStudio:FileSystem";
import {
    FrameState,
    BackgroundState,
    BitmojiState,
    BubbleState,
    TransformData,
    AttachmentRef,
} from "../model/types";
import { createDefaultBackground } from "../model/Background";
import { RuntimeMap, FrameRuntime } from "../model/RuntimeMap";
import { getAllPoses } from "../panels/PoseTool/PoseProvider";

const BITMOJI_COMPONENT_NAME = "Bitmoji 3D";
const POSE_LOADER_COMPONENT_NAME = "Pose Loader";
const BUBBLE_COMPONENT_NAME = "BubbleComponent";
const STORY_FLOW_MANAGER_ID = "3adfed1c-bd76-4dc3-81b1-484ed508ad8e";

function readTransform(so: Editor.Model.SceneObject): TransformData {
    const t = so.localTransform;
    return {
        position: { x: t.position.x, y: t.position.y, z: t.position.z },
        rotation: { x: t.rotation.x, y: t.rotation.y, z: t.rotation.z },
        scale: { x: t.scale.x, y: t.scale.y, z: t.scale.z },
    };
}

/**
 * Reads the project scene tree under "Comic Root" and extracts model state.
 * Returns null if no existing story is found.
 */
export class SceneReader {
    constructor(
        private scene: Editor.Assets.Scene,
        private runtimeMap: RuntimeMap,
        private assetManager: Editor.Model.AssetManager,
        private assetsDirectory: Editor.Path,
    ) {}

    /**
     * Find the Comic Root scene object with Story Flow Manager script.
     */
    findComicRoot(): Editor.Model.SceneObject | null {
        const sceneObjects = this.scene.sceneObjects;
        for (const so of sceneObjects) {
            const sc = so.getComponent("ScriptComponent") as Editor.Components.ScriptComponent | null;
            if (sc?.scriptAsset?.componentId?.toString() === STORY_FLOW_MANAGER_ID) {
                return so;
            }
        }
        return null;
    }

    /**
     * Extract all frame data and populate the runtime map.
     * Returns frame states for Model.loadState().
     */
    readFrames(root: Editor.Model.SceneObject): FrameState[] {
        const frames: FrameState[] = [];

        for (let i = 0; i < root.children.length; i++) {
            const frameSo = root.children[i];
            const frameData = this.readFrame(frameSo);
            frames.push(frameData.state);

            this.runtimeMap.setFrame(i, frameData.runtime);
        }

        return frames;
    }

    private readFrame(frameSo: Editor.Model.SceneObject): {
        state: FrameState;
        runtime: FrameRuntime;
    } {
        const bgSo = frameSo.children.find(
            (c: Editor.Model.SceneObject) => c.name === "Background",
        );
        const bmRoot = frameSo.children.find(
            (c: Editor.Model.SceneObject) =>
                c.name === "Bitmojis" || c.name === "Avatars",
        );
        const bubRoot = frameSo.children.find(
            (c: Editor.Model.SceneObject) => c.name === "Bubbles",
        );

        const background = bgSo
            ? this.readBackground(bgSo)
            : createDefaultBackground();

        const bitmojis: BitmojiState[] = [];
        const bitmojiSOs: Editor.Model.SceneObject[] = [];
        if (bmRoot) {
            for (const child of bmRoot.children) {
                const bm = this.readBitmoji(child);
                if (bm) {
                    bitmojis.push(bm);
                    bitmojiSOs.push(child);
                }
            }
        }

        const bubbles: BubbleState[] = [];
        const bubbleSOs: Editor.Model.SceneObject[] = [];
        if (bubRoot) {
            for (let i = 0; i < bubRoot.children.length; i++) {
                const child = bubRoot.children[i];
                const bub = this.readBubble(child, i, bmRoot, bubRoot);
                if (bub) {
                    bubbles.push(bub);
                    bubbleSOs.push(child);
                }
            }
        }

        for (let bubIdx = 0; bubIdx < bubbles.length; bubIdx++) {
            for (const att of bubbles[bubIdx].attachments) {
                if (att.type === "bitmoji" && att.index < bitmojis.length) {
                    bitmojis[att.index].parentBubble = bubIdx;
                } else if (att.type === "bubble" && att.index < bubbles.length) {
                    bubbles[att.index].parentBubble = bubIdx;
                }
            }
        }

        return {
            state: { background, bitmojis, bubbles },
            runtime: {
                sceneObject: frameSo,
                bitmojiSceneObjects: bitmojiSOs,
                bubbleSceneObjects: bubbleSOs,
            },
        };
    }

    private readBackground(bgSo: Editor.Model.SceneObject): BackgroundState {
        const image = bgSo.getComponent("Image") as Editor.Components.Image | null;

        if (!image) {
            return createDefaultBackground();
        }

        const transform = readTransform(bgSo);
        let texture: string | null = null;
        let path: string | null = null;
        const pivot = { x: image.pivot.x, y: image.pivot.y };

        try {
            const mat = (image as any).mainMaterial;
            if (mat) {
                const passInfos = (mat as any).passInfos;
                if (passInfos?.length > 0) {
                    const passInfo = passInfos[0];

                    const baseTex = passInfo.baseTex;
                    if (baseTex?.id) {
                        const texId = baseTex.id.toString();
                        for (const asset of this.assetManager.assets) {
                            if ((asset as any).id?.toString() === texId) {
                                const readablePath = this.resolveReadablePath(asset);

                                if (readablePath) {
                                    const bytes = FileSystem.readBytes(readablePath);
                                    texture = Base64.encode(bytes);
                                    path = readablePath.toString();
                                }
                                break;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[SceneReader] Failed to read background texture:", e);
            console.error(e.stack);
        }

        return {
            texture,
            path,
            pivot,
            transform,
        };
    }

    /**
     * Return the first readable Editor.Path for an asset.
     * sourcePath is relative to the project assets directory, so we
     * prepend assetsDirectory to get an absolute path.  Falls back to
     * the project-internal cacheFile.
     */
    private resolveReadablePath(asset: Editor.Assets.Asset): Editor.Path | null {
        try {
            const src = asset.fileMeta?.sourcePath;
            if (src && !src.isEmpty) {
                const abs = this.assetsDirectory.appended(src);
                if (FileSystem.exists(abs)) {
                    return abs;
                }
            }
        } catch { /* sourcePath unavailable */ }

        return null;
    }

    private readBitmoji(so: Editor.Model.SceneObject): BitmojiState | null {
        const scripts = so.getComponents("ScriptComponent") as Editor.Components.ScriptComponent[];
        const bmScript = scripts.find(
            (s) => s.scriptAsset?.name === BITMOJI_COMPONENT_NAME,
        );
        if (!bmScript) return null;

        const poseScript = scripts.find(
            (s) => s.scriptAsset?.name === POSE_LOADER_COMPONENT_NAME,
        );

        let poseAssetId = "";
        if (poseScript) {
            const defaultAsset = (poseScript as any).defaultAsset as Editor.Assets.RemoteReferenceAsset | null;
            if (defaultAsset) {
                poseAssetId = defaultAsset.assetId ?? "";
            }
        }

        const resolvedPose = this.resolvePoseFromAssetId(poseAssetId);

        return {
            transform: readTransform(so),
            pose: resolvedPose ?? { url: "" },
            bitmojiType: (bmScript as any).bitmojiType ?? 0,
            parentBubble: null,
        };
    }

    /**
     * Reverse-lookup pose URL and plugin path from a RemoteReferenceAsset's assetId.
     * The assetId follows the pattern "LENSES_BITMOJI_POSE_NN" (1-based, zero-padded).
     */
    private resolvePoseFromAssetId(assetId: string): { url: string; extraUrl?: string; path?: string; extraPath?: string } | null {
        if (!assetId) return null;

        const match = assetId.match(/LENSES_BITMOJI_POSE_(\d+)/);
        if (!match) return null;

        const poseIndex = parseInt(match[1], 10) - 1;
        const poses = getAllPoses();
        if (poseIndex < 0 || poseIndex >= poses.length) return null;

        const pose = poses[poseIndex];
        return {
            url: pose.url,
            extraUrl: pose.extraUrl,
            path: pose.path,
            extraPath: pose.extraPath,
        };
    }

    private readBubble(
        so: Editor.Model.SceneObject,
        bubbleIndex: number,
        bmRoot: Editor.Model.SceneObject | undefined,
        bubRoot: Editor.Model.SceneObject | undefined,
    ): BubbleState | null {
        const sc = so.getComponent("ScriptComponent") as Editor.Components.ScriptComponent | null;
        if (!sc || sc.scriptAsset?.name !== BUBBLE_COMPONENT_NAME) {
            if (!sc) return null;
        }

        const attachments: AttachmentRef[] = [];
        try {
            const speakerClasses = (sc as any).speakerClasses;
            if (Array.isArray(speakerClasses)) {
                for (const entry of speakerClasses) {
                    const speakerScript = entry?.speaker as Editor.Components.Component | null;
                    const speakerType = entry?.speakerType;
                    if (!speakerScript) continue;

                    const speakerSoId = (speakerScript.sceneObject as any).id?.toString();
                    if (!speakerSoId) continue;

                    if (speakerType === 0 && bmRoot) {
                        for (let i = 0; i < bmRoot.children.length; i++) {
                            if ((bmRoot.children[i] as any).id?.toString() === speakerSoId) {
                                attachments.push({ type: "bitmoji", index: i });
                                break;
                            }
                        }
                    } else if (speakerType === 1 && bubRoot) {
                        for (let i = 0; i < bubRoot.children.length; i++) {
                            if (i === bubbleIndex) continue;
                            if ((bubRoot.children[i] as any).id?.toString() === speakerSoId) {
                                attachments.push({ type: "bubble", index: i });
                                break;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[SceneReader] Failed to read bubble attachments:", e, console.None);
        }

        return {
            transform: readTransform(so),
            text: (sc as any).bubbleText ?? "",
            bubbleStyle: (sc as any).bubbleStyle ?? 0,
            tailStyle: (sc as any).tailStyle ?? 0,
            attachments,
            parentBubble: null,
        };
    }
}
