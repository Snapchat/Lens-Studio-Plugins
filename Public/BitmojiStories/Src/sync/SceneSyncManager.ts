import { Model } from "../model/Model";
import { Frame } from "../model/Frame";
import { RuntimeMap } from "../model/RuntimeMap";
import { SceneReader } from "./SceneReader";
import { SceneWriter } from "./SceneWriter";
import { BUILDING_BLOCKS_PACKAGE_ID } from "../common/constants";

const STORY_FLOW_MANAGER_COMPONENT_NAME = "Story Flow Manager";

/**
 * Orchestrates bidirectional sync between the Model and the project scene.
 * - On fresh start: creates "Comic Root" in the scene and starts the SceneWriter.
 * - On reopen: reads the existing scene tree (SceneReader), populates the Model,
 *   and then starts the SceneWriter for subsequent edits.
 */
export class SceneSyncManager {
    private runtimeMap = new RuntimeMap();
    private sceneWriter: SceneWriter | null = null;
    private sceneReader: SceneReader;
    private editorModel: Editor.Model.IModel;
    private scene: Editor.Assets.Scene;
    private assetManager: Editor.Model.AssetManager;
    private rootSceneObject: Editor.Model.SceneObject | null = null;
    private buildingBlocksPackage: Editor.Assets.Asset | null = null;

    constructor(
        private model: Model,
        private pluginSystem: Editor.PluginSystem,
    ) {
        this.editorModel = pluginSystem.findInterface(
            Editor.Model.IModel,
        ) as Editor.Model.IModel;
        this.scene = this.editorModel.project.scene;
        this.assetManager = this.editorModel.project.assetManager;
        this.sceneReader = new SceneReader(
            this.scene,
            this.runtimeMap,
            this.assetManager,
            this.editorModel.project.assetsDirectory,
        );

        this.buildingBlocksPackage = this.findBuildingBlocksPackage();
    }

    /**
     * Attempt to rehydrate from an existing scene.
     * Returns true if a story was found and loaded into the model.
     */
    initializeFromExistingScene(): boolean {
        const root = this.sceneReader.findComicRoot();
        if (!root || root.children.length === 0) {
            return false;
        }

        this.rootSceneObject = root;
        const frames = this.sceneReader.readFrames(root);

        if (frames.length === 0) {
            return false;
        }

        this.model.loadState({
            version: 1,
            frames,
            currentFrameIndex: 0,
        });

        // Start writer BEFORE selecting frame so it receives onFrameSelected
        // and subscribes to frame-level events (onBitmojiAdded, etc.)
        this.startSceneWriter();

        this.model.selectFrame(0);

        return true;
    }

    /**
     * Create a fresh "Comic Root" in the scene and start writing.
     */
    initializeNewScene(): void {
        const mainCamera = this.scene.mainCamera;
        const mainCameraSo = mainCamera.sceneObject;

        mainCamera.deviceProperty = Editor.Components.CameraDeviceProperty.Aspect;
        mainCamera.fov = 63.541;
        mainCamera.near = 1;
        mainCamera.far = 5000;

        while (mainCameraSo.getChildrenCount() > 0) {
            mainCameraSo.removeChildAt(0);
        }

        this.rootSceneObject = this.scene.addSceneObject(mainCameraSo);
        this.rootSceneObject.name = "Comic Root";

        if (this.buildingBlocksPackage) {
            const sfmAsset = (this.buildingBlocksPackage as any).attachments?.find(
                (a: Editor.Assets.Asset) =>
                    a.name === STORY_FLOW_MANAGER_COMPONENT_NAME,
            );
            if (sfmAsset) {
                const sfm = this.rootSceneObject.addComponent(
                    "ScriptComponent",
                ) as Editor.Components.ScriptComponent;
                sfm.scriptAsset = sfmAsset;
                (sfm as any).simulateInEditor = false;
            }
        }

        this.startSceneWriter();
    }

    private startSceneWriter(): void {
        if (!this.rootSceneObject || !this.buildingBlocksPackage) return;

        this.sceneWriter = new SceneWriter(
            this.model,
            this.runtimeMap,
            this.rootSceneObject,
            this.scene,
            this.assetManager,
            this.buildingBlocksPackage,
        );
    }

    private findBuildingBlocksPackage(): Editor.Assets.Asset | null {
        return (
            this.assetManager.assets.find(
                (asset: Editor.Assets.Asset) =>
                    asset.getTypeName() === "NativePackageDescriptor" &&
                    (asset as any).componentId?.toString() ===
                        BUILDING_BLOCKS_PACKAGE_ID,
            ) ?? null
        );
    }

    get runtime(): RuntimeMap {
        return this.runtimeMap;
    }

    deinit(): void {
        this.sceneWriter?.deinit();
        this.sceneWriter = null;
        this.runtimeMap.clear();
    }
}
