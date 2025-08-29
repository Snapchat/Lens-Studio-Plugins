import { dependencyContainer, DependencyKeys } from "./DependencyContainer.js";
import * as FileSystem from 'LensStudio:FileSystem';
export class AnimationImporter {
    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }
    importToProject(path) {
        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
        const model = pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        const assetManager = model.project.assetManager;
        const animationPrefab = assetManager.importExternalFile(path, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        let animTrackMeta = assetManager.getFileMeta(new Editor.Path(animationPrefab.path + "/Animations" + "/BaseLayer.animationAsset"));
        if (!animTrackMeta) {
            animTrackMeta = assetManager.getFileMeta(new Editor.Path(animationPrefab.path + "/Animations" + "/Scene.animationAsset"));
            if (!animTrackMeta) {
                animTrackMeta = assetManager.getFileMeta(new Editor.Path(animationPrefab.path + "/Animations" + "/Root Scene.animationAsset"));
            }
        }
        const bitmojiPackage = assetManager.importExternalFile(new Editor.Path(import.meta.resolve("./Resources/Bitmoji Animation.lspkg")), new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        let scriptIsFound = false;
        let scriptFilePath;
        let nativePackageDescriptorFile;
        for (let i = 0; i < bitmojiPackage.files.length; i++) {
            if (!scriptIsFound && bitmojiPackage.files[i].primaryAsset.name === "script") {
                scriptFilePath = bitmojiPackage.files[i].sourcePath;
                scriptIsFound = true;
            }
            if (bitmojiPackage.files[i].primaryAsset.type === "NativePackageDescriptor") {
                nativePackageDescriptorFile = bitmojiPackage.files[i].primaryAsset;
            }
        }
        assetManager.remove(scriptFilePath);
        assetManager.move(animTrackMeta, bitmojiPackage.path);
        const actionManager = pluginSystem.findInterface(Editor.IPackageActions);
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
        const bitmojiComponent = dependencyContainer.get(DependencyKeys.BitmojiComponent);
        const so = bitmojiComponent.sceneObject;
        //@ts-ignore
        bitmojiComponent.mixamoAnimation = false;
        let animationPlayer = so.getComponent("AnimationPlayer");
        if (!animationPlayer) {
            animationPlayer = so.addComponent("AnimationPlayer");
        }
        const clip = Editor.createAnimationClip(scene);
        clip.name = "Clip 0";
        clip.animation = animTrackMeta.primaryAsset;
        clip.end = clip.animation.duration;
        animationPlayer.animationClips = [clip];
    }
    async importExternalFileAsync(assetManager, path) {
        let objectPrefab = assetManager.importExternalFileAsync(path, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        return new Promise((resolve) => {
            resolve(objectPrefab);
        });
    }
}
