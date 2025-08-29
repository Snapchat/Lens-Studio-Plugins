import {dependencyContainer, DependencyKeys} from "./DependencyContainer.js";
import * as FileSystem from 'LensStudio:FileSystem';

export class AnimationImporter {

    private tempDir: FileSystem.TempDir;

    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }

    importToProject(path: Editor.Path) {
        const pluginSystem: Editor.PluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as Editor.PluginSystem;
        const model: Editor.Model.IModel = pluginSystem.findInterface(Editor.Model.IModel);
        const scene: Editor.Assets.Scene = model.project.scene;
        const assetManager: Editor.Model.AssetManager = model.project.assetManager

        const animationPrefab: Editor.Model.ImportResult = assetManager.importExternalFile(path, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        let animTrackMeta = assetManager.getFileMeta(new Editor.Path(animationPrefab.path + "/Animations" + "/BaseLayer.animationAsset"));
        if (!animTrackMeta) {
            animTrackMeta = assetManager.getFileMeta(new Editor.Path(animationPrefab.path + "/Animations" + "/Scene.animationAsset"));
            if (!animTrackMeta) {
                animTrackMeta = assetManager.getFileMeta(new Editor.Path(animationPrefab.path + "/Animations" + "/Root Scene.animationAsset"));
            }
        }

        const bitmojiPackage = assetManager.importExternalFile(new Editor.Path(import.meta.resolve("./Resources/Bitmoji Animation.lspkg")), new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        let scriptIsFound = false;
        let scriptFilePath!: Editor.Path;
        let nativePackageDescriptorFile!: Editor.Assets.NativePackageDescriptor;
        for (let i = 0; i < bitmojiPackage.files.length; i++) {
            if (!scriptIsFound && bitmojiPackage.files[i].primaryAsset.name === "script") {
                scriptFilePath = bitmojiPackage.files[i].sourcePath;
                scriptIsFound = true;
            }
            if (bitmojiPackage.files[i].primaryAsset.type === "NativePackageDescriptor") {
                nativePackageDescriptorFile = bitmojiPackage.files[i].primaryAsset as Editor.Assets.NativePackageDescriptor;
            }
        }

        assetManager.remove(scriptFilePath);
        assetManager.move(animTrackMeta, bitmojiPackage.path);

        const actionManager = pluginSystem.findInterface(Editor.IPackageActions) as Editor.IPackageActions;
        actionManager.exportPackage(nativePackageDescriptorFile, new Editor.Path(this.tempDir.path + "/Bitmoji Animation.lspkg"), Editor.Assets.ScriptTypes.Visibility.Editable);

        assetManager.remove(bitmojiPackage.path);
        assetManager.remove(animationPrefab.path);

        let packedBitmojiPackage = assetManager.importExternalFile(new Editor.Path(this.tempDir.path + "/Bitmoji Animation.lspkg"), new Editor.Path('/'), Editor.Model.ResultType.Packed);

        animTrackMeta = assetManager.getFileMeta(new Editor.Path(packedBitmojiPackage.path + "/BaseLayer.animationAsset"));
        if (!animTrackMeta) {
            animTrackMeta = assetManager.getFileMeta(new Editor.Path(packedBitmojiPackage.path + "/Scene.animationAsset"));
            if (!animTrackMeta) {
                animTrackMeta = assetManager.getFileMeta(new Editor.Path(packedBitmojiPackage.path + "/Root Scene.animationAsset"));
            }
        }

        const bitmojiComponent: Editor.Components.Component = dependencyContainer.get(DependencyKeys.BitmojiComponent) as Editor.Components.Component;
        const so: Editor.Model.SceneObject = bitmojiComponent.sceneObject;
        //@ts-ignore
        bitmojiComponent.mixamoAnimation = false;
        let animationPlayer: Editor.Components.AnimationPlayer = so.getComponent("AnimationPlayer") as Editor.Components.AnimationPlayer;

        if (!animationPlayer) {
            animationPlayer = so.addComponent("AnimationPlayer") as Editor.Components.AnimationPlayer;
        }
        const clip: Editor.AnimationClip = Editor.createAnimationClip(scene);
        clip.name = "Clip 0";
        clip.animation = animTrackMeta.primaryAsset as Editor.Assets.AnimationAsset;
        clip.end = clip.animation.duration;
        animationPlayer.animationClips = [clip];
    }

    private async importExternalFileAsync(assetManager: Editor.Model.AssetManager, path: Editor.Path): Promise<Editor.Model.ImportResult> {
        let objectPrefab = assetManager.importExternalFileAsync(path, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);

        return new Promise((resolve) => {
            resolve(objectPrefab);
        });
    }
}
