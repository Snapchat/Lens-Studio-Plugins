import * as FileSystem from "LensStudio:FileSystem";
import { Unsubscribe } from "LensStudio:Event.js";
import { Model } from "../model/Model";
import { Frame } from "../model/Frame";
import { RuntimeMap, FrameRuntime } from "../model/RuntimeMap";
import {
    TransformData,
    Vec2Data,
    PoseData,
    AttachmentRef,
} from "../model/types";

const BITMOJI_COMPONENT_NAME = "Bitmoji 3D";
const POSE_LOADER_COMPONENT_NAME = "Pose Loader";
const STORY_FRAME_MANAGER_COMPONENT_NAME = "Story Frame Manager";
const BUBBLE_COMPONENT_NAME = "BubbleComponent";

function addDefine(passInfo: Editor.Assets.PassInfo, define: string): void {
    const defines = passInfo.defines;
    defines.push(define);
    passInfo.defines = defines;
}

function setTransform(
    so: Editor.Model.SceneObject,
    transform: TransformData,
): void {
    so.localTransform.position = new vec3(
        transform.position.x,
        transform.position.y,
        transform.position.z,
    );
    so.localTransform.rotation = new vec3(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z,
    );
    so.localTransform.scale = new vec3(
        transform.scale.x,
        transform.scale.y,
        transform.scale.z,
    );
}

/**
 * Listens to model events and writes changes to the project scene.
 * This is the model->scene half of the sync system.
 */
export class SceneWriter {
    private modelUnsubs: Unsubscribe[] = [];
    private frameUnsubs: Unsubscribe[] = [];

    constructor(
        private model: Model,
        private runtimeMap: RuntimeMap,
        private rootSceneObject: Editor.Model.SceneObject,
        private scene: Editor.Assets.Scene,
        private assetManager: Editor.Model.AssetManager,
        private buildingBlocksPackage: Editor.Assets.Asset,
    ) {
        this.wireModelEvents();
    }

    private findAssetByName(name: string): any {
        return (this.buildingBlocksPackage as any).attachments.find(
            (a: Editor.Assets.Asset) => a.name === name,
        );
    }

    private findOrImportPose(posePath: string): Editor.Assets.Asset {
        const editorPath = new Editor.Path(posePath);
        const dest = new Editor.Model.SourcePath(
            new Editor.Path("Comic Maker Resources/"),
            Editor.Model.SourceRootDirectory.Assets,
        );
        const meta = this.assetManager.findImportedCopy(editorPath, dest);
        if (meta) {
            return meta.primaryAsset;
        }
        return this.assetManager.importExternalFile(
            editorPath,
            dest,
            Editor.Model.ResultType.Auto,
        ).primary;
    }

    private wireModelEvents(): void {
        this.modelUnsubs.push(
            this.model.onFrameAdded.add(({ index }) => this.onFrameAdded(index)),
        );
        this.modelUnsubs.push(
            this.model.onFrameRemoved.add(({ index }) => this.onFrameRemoved(index)),
        );
        this.modelUnsubs.push(
            this.model.onFrameSelected.add(({ index, frame }) =>
                this.onFrameSelected(index, frame),
            ),
        );
        this.modelUnsubs.push(
            this.model.onFrameCopied.add(({ sourceIndex, newIndex }) =>
                this.onFrameCopied(sourceIndex, newIndex),
            ),
        );
    }

    private onFrameAdded(index: number): void {
        const frameSo = this.scene.addSceneObject(this.rootSceneObject);
        frameSo.name = "Frame";
        frameSo.enabled = false;

        const storyFrameManager = frameSo.addComponent("ScriptComponent") as any;
        storyFrameManager.scriptAsset = this.findAssetByName(STORY_FRAME_MANAGER_COMPONENT_NAME);

        const bgSo = this.scene.addSceneObject(frameSo);
        bgSo.name = "Background";

        const bitmojiRoot = this.scene.addSceneObject(frameSo);
        bitmojiRoot.name = "Bitmojis";

        const bubbleRoot = this.scene.addSceneObject(frameSo);
        bubbleRoot.name = "Bubbles";

        this.runtimeMap.setFrame(index, {
            sceneObject: frameSo,
            bitmojiSceneObjects: [],
            bubbleSceneObjects: [],
        });
    }

    private onFrameRemoved(index: number): void {
        this.rootSceneObject.removeChildAt(index);
        this.runtimeMap.removeFrame(index);
        this.runtimeMap.reindex(index);
    }

    private onFrameSelected(index: number, frame: Frame): void {
        const children = this.rootSceneObject.children;
        for (let i = 0; i < children.length; i++) {
            children[i].enabled = i === index;
        }
        this.subscribeToFrame(index, frame);
    }

    private onFrameCopied(sourceIndex: number, newIndex: number): void {
        const srcRuntime = this.runtimeMap.getFrame(sourceIndex);
        if (!srcRuntime) return;

        const newFrame = this.model.getFrame(newIndex);
        if (!newFrame) return;
        const newState = newFrame.getState();

        const srcFrameSo = srcRuntime.sceneObject;
        const srcBgSo = srcFrameSo.children.find(
            (c: Editor.Model.SceneObject) => c.name === "Background",
        );

        const newFrameSo = this.scene.addSceneObject(this.rootSceneObject);
        newFrameSo.name = "Frame";
        newFrameSo.enabled = false;

        const sfm = newFrameSo.addComponent("ScriptComponent") as any;
        sfm.scriptAsset = this.findAssetByName(STORY_FRAME_MANAGER_COMPONENT_NAME);

        // -- Background --
        if (srcBgSo) {
            const bgCopy = srcBgSo.copy();
            bgCopy.setParent(newFrameSo);

            const srcImage = srcBgSo.getComponent("Image") as any;
            const newImage = bgCopy.getComponent("Image") as any;
            if (srcImage && newImage && srcImage.mainMaterial) {
                const flat = this.findAssetByName("flat");
                const dest = new Editor.Model.SourcePath(
                    new Editor.Path("Materials"),
                    Editor.Model.SourceRootDirectory.Assets,
                );
                const mat = this.assetManager.createNativeAsset(
                    "Material",
                    "Background Image",
                    dest,
                ) as any;
                mat.addPass(flat);
                const passInfo = mat.passInfos[0];
                passInfo.depthWrite = false;
                passInfo.depthTest = false;
                addDefine(passInfo, "ENABLE_BASE_TEX");
                passInfo.baseTex = srcImage.mainMaterial.passInfos[0].baseTex;
                newImage.mainMaterial = mat;
            }
        } else {
            const bgSo = this.scene.addSceneObject(newFrameSo);
            bgSo.name = "Background";
        }

        // -- Bitmojis --
        const bmRoot = this.scene.addSceneObject(newFrameSo);
        bmRoot.name = "Bitmojis";

        const bitmojiSceneObjects: Editor.Model.SceneObject[] = [];
        for (let i = 0; i < newState.bitmojis.length; i++) {
            const bitmoji = newState.bitmojis[i];

            const bmSo = this.scene.addSceneObject(bmRoot);
            bmSo.name = "Bitmoji";
            bmSo.enabled = true;
            setTransform(bmSo, bitmoji.transform);

            const bmScript = bmSo.addComponent("ScriptComponent") as any;
            bmScript.scriptAsset = this.findAssetByName(BITMOJI_COMPONENT_NAME);
            (bmScript as any).mixamoAnimation = false;
            (bmScript as any).autoDownload = false;
            (bmScript as any).bitmojiType = bitmoji.bitmojiType;

            const sfmComponent = newFrameSo.getComponent("ScriptComponent") as Editor.Components.ScriptComponent;
            if (sfmComponent) {
                const list = (sfmComponent as any).bitmojiList ?? [];
                list.push(bmScript);
                (sfmComponent as any).bitmojiList = list;
            }

            const poseScript = bmSo.addComponent("ScriptComponent") as any;
            poseScript.scriptAsset = this.findAssetByName(POSE_LOADER_COMPONENT_NAME);

            if (bitmoji.pose.path) {
                try {
                    const defaultAsset = this.findOrImportPose(bitmoji.pose.path);
                    (poseScript as any).defaultAsset = defaultAsset;

                    const extraPath = bitmoji.pose.extraPath ?? bitmoji.pose.path;
                    const extraAsset = extraPath !== bitmoji.pose.path
                        ? this.findOrImportPose(extraPath)
                        : defaultAsset;
                    (poseScript as any).extraAsset = extraAsset;
                } catch (e) {
                    console.error("[SceneWriter] Failed to import pose:", e);
                }
            }

            bitmojiSceneObjects.push(bmSo);
        }

        // -- Bubbles --
        const bubRoot = this.scene.addSceneObject(newFrameSo);
        bubRoot.name = "Bubbles";

        const bubbleSceneObjects: Editor.Model.SceneObject[] = [];
        for (let i = 0; i < newState.bubbles.length; i++) {
            const bubble = newState.bubbles[i];

            const bubSo = this.scene.addSceneObject(bubRoot);
            bubSo.name = "Bubble";
            bubSo.enabled = true;
            setTransform(bubSo, bubble.transform);

            const bubScript = bubSo.addComponent("ScriptComponent") as any;
            bubScript.scriptAsset = this.findAssetByName(BUBBLE_COMPONENT_NAME);
            (bubScript as any).bubbleText = bubble.text;
            (bubScript as any).bubbleStyle = bubble.bubbleStyle;
            (bubScript as any).tailStyle = bubble.tailStyle;

            bubbleSceneObjects.push(bubSo);
        }

        // -- Attachments (speakerClasses) --
        for (let i = 0; i < newState.bubbles.length; i++) {
            const bubble = newState.bubbles[i];
            if (bubble.attachments.length === 0) continue;

            const bubSo = bubbleSceneObjects[i];
            const sc = bubSo.getComponent("ScriptComponent") as Editor.Components.ScriptComponent;
            if (!sc) continue;

            const speakerClasses = bubble.attachments.map((att) => {
                if (att.type === "bitmoji") {
                    const bmSo = bitmojiSceneObjects[att.index];
                    const scripts = bmSo?.getComponents("ScriptComponent") as Editor.Components.ScriptComponent[];
                    return {
                        speaker: scripts?.find((s) => s.scriptAsset?.name === BITMOJI_COMPONENT_NAME),
                        speakerType: 0,
                    };
                } else {
                    const bSo = bubbleSceneObjects[att.index];
                    const scripts = bSo?.getComponents("ScriptComponent") as Editor.Components.ScriptComponent[];
                    return {
                        speaker: scripts?.find((s) => s.scriptAsset?.name === BUBBLE_COMPONENT_NAME),
                        speakerType: 1,
                    };
                }
            });

            (sc as any).speakerClasses = speakerClasses;
        }

        // -- Position: re-parent at the correct index --
        newFrameSo.setParent(this.rootSceneObject, newIndex);

        this.runtimeMap.reindexInsert(newIndex);
        this.runtimeMap.setFrame(newIndex, {
            sceneObject: newFrameSo,
            bitmojiSceneObjects,
            bubbleSceneObjects,
        });
    }

    private subscribeToFrame(frameIndex: number, frame: Frame | null): void {
        for (const unsub of this.frameUnsubs) unsub();
        this.frameUnsubs = [];
        if (!frame) return;

        this.frameUnsubs.push(
            frame.onBackgroundUpdated.add(({ property }) => {
                if (property !== "texture") return;
                this.writeBackground(frameIndex, frame);
            }),
        );

        this.frameUnsubs.push(
            frame.onBitmojiAdded.add(({ index }) =>
                this.writeBitmojiAdded(frameIndex, frame, index),
            ),
        );

        this.frameUnsubs.push(
            frame.onBitmojiRemoved.add(({ index }) =>
                this.writeBitmojiRemoved(frameIndex, index),
            ),
        );

        this.frameUnsubs.push(
            frame.onBitmojiTypeUpdated.add(({ index, bitmojiType }) =>
                this.writeBitmojiType(frameIndex, index, bitmojiType),
            ),
        );

        this.frameUnsubs.push(
            frame.onPoseUpdated.add(({ index, pose }) =>
                this.writePose(frameIndex, index, pose),
            ),
        );

        this.frameUnsubs.push(
            frame.onBitmojiTransformUpdated.add(({ index, transform }) =>
                this.writeBitmojiTransform(frameIndex, index, transform),
            ),
        );

        this.frameUnsubs.push(
            frame.onBubbleAdded.add(({ index }) =>
                this.writeBubbleAdded(frameIndex, frame, index),
            ),
        );

        this.frameUnsubs.push(
            frame.onBubbleRemoved.add(({ index }) =>
                this.writeBubbleRemoved(frameIndex, index),
            ),
        );

        this.frameUnsubs.push(
            frame.onBubbleTextUpdated.add(({ index, text }) =>
                this.writeBubbleText(frameIndex, index, text),
            ),
        );

        this.frameUnsubs.push(
            frame.onBubbleStyleUpdated.add(({ index, style }) =>
                this.writeBubbleStyle(frameIndex, index, style),
            ),
        );

        this.frameUnsubs.push(
            frame.onBubbleTailStyleUpdated.add(({ index, style }) =>
                this.writeBubbleTailStyle(frameIndex, index, style),
            ),
        );

        this.frameUnsubs.push(
            frame.onBubbleTransformUpdated.add(({ index, transform }) =>
                this.writeBubbleTransform(frameIndex, index, transform),
            ),
        );

        this.frameUnsubs.push(
            frame.onBubbleAttachmentUpdated.add(({ index, attachments }) =>
                this.writeBubbleAttachments(frameIndex, index, attachments),
            ),
        );
    }

    private getFrameSo(frameIndex: number): Editor.Model.SceneObject | undefined {
        return this.runtimeMap.getFrame(frameIndex)?.sceneObject;
    }

    private getChild(
        frameSo: Editor.Model.SceneObject,
        name: string,
    ): Editor.Model.SceneObject | undefined {
        return frameSo.children.find(
            (c: Editor.Model.SceneObject) => c.name === name,
        );
    }

    // -- Background --

    private writeBackground(frameIndex: number, frame: Frame): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bgSo = this.getChild(frameSo, "Background");
        if (!bgSo) return;

        const state = frame.getState().background;
        if (!state.path) return;

        let image = bgSo.getComponent("Image") as any;
        if (!image) {
            image = bgSo.addComponent("Image");
            image.renderOrder = -100;
        }

        const editorPath = new Editor.Path(state.path);
        const dest = new Editor.Model.SourcePath(
            new Editor.Path(""),
            Editor.Model.SourceRootDirectory.Assets,
        );
        const meta = this.assetManager.importExternalFile(
            editorPath,
            dest,
            Editor.Model.ResultType.Packed,
        );
        const texParam = new Editor.Assets.TextureParameter(meta.primary.id);

        if (!image.mainMaterial) {
            const flat = this.findAssetByName("flat");
            const matDest = new Editor.Model.SourcePath(
                new Editor.Path("Materials"),
                Editor.Model.SourceRootDirectory.Assets,
            );
            const mat = this.assetManager.createNativeAsset(
                "Material",
                "Background Image",
                matDest,
            ) as any;
            mat.addPass(flat);
            const passInfo = mat.passInfos[0];
            passInfo.depthWrite = false;
            passInfo.depthTest = false;
            addDefine(passInfo, "ENABLE_BASE_TEX");
            image.mainMaterial = mat;
        }

        image.mainMaterial.passInfos[0].baseTex = texParam;
        image.pivot = new vec2(state.pivot.x, state.pivot.y);
        image.stretchMode = Editor.Components.StretchMode.Fill;

        setTransform(bgSo, state.transform);
    }

    // -- Bitmoji --

    private writeBitmojiAdded(
        frameIndex: number,
        frame: Frame,
        bitmojiIndex: number,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bmRoot = this.getChild(frameSo, "Bitmojis");
        if (!bmRoot) return;

        const bitmoji = frame.getState().bitmojis[bitmojiIndex];
        if (!bitmoji) return;

        const bmSo = this.scene.addSceneObject(bmRoot);
        bmSo.name = "Bitmoji";
        bmSo.enabled = true;
        setTransform(bmSo, bitmoji.transform);

        const bmScript = bmSo.addComponent("ScriptComponent") as any;
        bmScript.scriptAsset = this.findAssetByName(BITMOJI_COMPONENT_NAME);
        (bmScript as any).mixamoAnimation = false;
        (bmScript as any).autoDownload = false;

        const sfm = frameSo.getComponent("ScriptComponent") as Editor.Components.ScriptComponent;
        if (sfm) {
            const list = (sfm as any).bitmojiList ?? [];
            list.push(bmScript);
            (sfm as any).bitmojiList = list;
        }

        const poseScript = bmSo.addComponent("ScriptComponent") as any;
        poseScript.scriptAsset = this.findAssetByName(POSE_LOADER_COMPONENT_NAME);

        if (bitmoji.pose.path) {
            try {
                const defaultAsset = this.findOrImportPose(bitmoji.pose.path);
                (poseScript as any).defaultAsset = defaultAsset;

                const extraPath = bitmoji.pose.extraPath ?? bitmoji.pose.path;
                const extraAsset = extraPath !== bitmoji.pose.path
                    ? this.findOrImportPose(extraPath)
                    : defaultAsset;
                (poseScript as any).extraAsset = extraAsset;
            } catch (e) {
                console.error("[SceneWriter] Failed to import pose:", e);
            }
        }

        const runtime = this.runtimeMap.getFrame(frameIndex);
        if (runtime) {
            runtime.bitmojiSceneObjects.push(bmSo);
        }
    }

    private writeBitmojiRemoved(frameIndex: number, bitmojiIndex: number): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bmRoot = this.getChild(frameSo, "Bitmojis");
        if (!bmRoot) return;

        bmRoot.removeChildAt(bitmojiIndex);

        const runtime = this.runtimeMap.getFrame(frameIndex);
        if (runtime) {
            runtime.bitmojiSceneObjects.splice(bitmojiIndex, 1);
        }
    }

    private writeBitmojiType(
        frameIndex: number,
        bitmojiIndex: number,
        bitmojiType: number,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bmRoot = this.getChild(frameSo, "Bitmojis");
        if (!bmRoot) return;

        const bmSo = bmRoot.children[bitmojiIndex];
        if (!bmSo) return;

        const sc = bmSo.getComponent("ScriptComponent") as Editor.Components.ScriptComponent;
        if (sc) (sc as any).bitmojiType = bitmojiType;
    }

    private writePose(
        frameIndex: number,
        bitmojiIndex: number,
        pose: PoseData,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bmRoot = this.getChild(frameSo, "Bitmojis");
        if (!bmRoot) return;

        const bmSo = bmRoot.children[bitmojiIndex];
        if (!bmSo) return;

        const scripts = bmSo.getComponents("ScriptComponent") as Editor.Components.ScriptComponent[];
        const poseScript = scripts.find(
            (s) => s.scriptAsset?.name === POSE_LOADER_COMPONENT_NAME,
        );
        if (!poseScript || !pose.path) return;

        try {
            const defaultAsset = this.findOrImportPose(pose.path);
            (poseScript as any).defaultAsset = defaultAsset;

            const extraPath = pose.extraPath ?? pose.path;
            const extraAsset = extraPath !== pose.path
                ? this.findOrImportPose(extraPath)
                : defaultAsset;
            (poseScript as any).extraAsset = extraAsset;
        } catch (e) {
            console.error("[SceneWriter] Failed to import pose:", e);
        }
    }

    private writeBitmojiTransform(
        frameIndex: number,
        bitmojiIndex: number,
        transform: TransformData,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bmRoot = this.getChild(frameSo, "Bitmojis");
        if (!bmRoot) return;

        const bmSo = bmRoot.children[bitmojiIndex];
        if (bmSo) setTransform(bmSo, transform);
    }

    // -- Bubble --

    private writeBubbleAdded(
        frameIndex: number,
        frame: Frame,
        bubbleIndex: number,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bubRoot = this.getChild(frameSo, "Bubbles");
        if (!bubRoot) return;

        const bubble = frame.getState().bubbles[bubbleIndex];
        if (!bubble) return;

        const bubSo = this.scene.addSceneObject(bubRoot);
        bubSo.name = "Bubble";
        bubSo.enabled = true;
        setTransform(bubSo, bubble.transform);

        const bubScript = bubSo.addComponent("ScriptComponent") as any;
        bubScript.scriptAsset = this.findAssetByName(BUBBLE_COMPONENT_NAME);
        (bubScript as any).bubbleText = bubble.text;

        const runtime = this.runtimeMap.getFrame(frameIndex);
        if (runtime) {
            runtime.bubbleSceneObjects.push(bubSo);
        }
    }

    private writeBubbleRemoved(frameIndex: number, bubbleIndex: number): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bubRoot = this.getChild(frameSo, "Bubbles");
        if (!bubRoot) return;

        bubRoot.removeChildAt(bubbleIndex);

        const runtime = this.runtimeMap.getFrame(frameIndex);
        if (runtime) {
            runtime.bubbleSceneObjects.splice(bubbleIndex, 1);
        }
    }

    private writeBubbleText(
        frameIndex: number,
        bubbleIndex: number,
        text: string,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bubRoot = this.getChild(frameSo, "Bubbles");
        if (!bubRoot) return;

        const sc = bubRoot.children[bubbleIndex]?.getComponent(
            "ScriptComponent",
        ) as Editor.Components.ScriptComponent | null;
        if (sc) (sc as any).bubbleText = text;
    }

    private writeBubbleStyle(
        frameIndex: number,
        bubbleIndex: number,
        style: number,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bubRoot = this.getChild(frameSo, "Bubbles");
        if (!bubRoot) return;

        const sc = bubRoot.children[bubbleIndex]?.getComponent(
            "ScriptComponent",
        ) as Editor.Components.ScriptComponent | null;
        if (sc) (sc as any).bubbleStyle = style;
    }

    private writeBubbleTailStyle(
        frameIndex: number,
        bubbleIndex: number,
        style: number,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bubRoot = this.getChild(frameSo, "Bubbles");
        if (!bubRoot) return;

        const sc = bubRoot.children[bubbleIndex]?.getComponent(
            "ScriptComponent",
        ) as Editor.Components.ScriptComponent | null;
        if (sc) (sc as any).tailStyle = style;
    }

    private writeBubbleTransform(
        frameIndex: number,
        bubbleIndex: number,
        transform: TransformData,
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bubRoot = this.getChild(frameSo, "Bubbles");
        if (!bubRoot) return;

        const bubSo = bubRoot.children[bubbleIndex];
        if (bubSo) setTransform(bubSo, transform);
    }

    private writeBubbleAttachments(
        frameIndex: number,
        bubbleIndex: number,
        attachments: AttachmentRef[],
    ): void {
        const frameSo = this.getFrameSo(frameIndex);
        if (!frameSo) return;
        const bubRoot = this.getChild(frameSo, "Bubbles");
        const bmRoot = this.getChild(frameSo, "Bitmojis");
        if (!bubRoot || !bmRoot) return;

        const bubSo = bubRoot.children[bubbleIndex];
        if (!bubSo) return;

        const sc = bubSo.getComponent("ScriptComponent") as Editor.Components.ScriptComponent;
        if (!sc) return;

        const speakerClasses = attachments.map((att) => {
            if (att.type === "bitmoji") {
                const bmSo = bmRoot.children[att.index];
                const scripts = bmSo?.getComponents("ScriptComponent") as Editor.Components.ScriptComponent[];
                return {
                    speaker: scripts?.find((s) => s.scriptAsset?.name === BITMOJI_COMPONENT_NAME),
                    speakerType: 0,
                };
            } else {
                const bSo = bubRoot.children[att.index];
                const scripts = bSo?.getComponents("ScriptComponent") as Editor.Components.ScriptComponent[];
                return {
                    speaker: scripts?.find((s) => s.scriptAsset?.name === BUBBLE_COMPONENT_NAME),
                    speakerType: 1,
                };
            }
        });

        (sc as any).speakerClasses = speakerClasses;
    }

    deinit(): void {
        for (const unsub of this.frameUnsubs) unsub();
        this.frameUnsubs = [];
        for (const unsub of this.modelUnsubs) unsub();
        this.modelUnsubs = [];
    }
}
