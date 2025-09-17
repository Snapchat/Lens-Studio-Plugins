// @ts-nocheck
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
        const animationPrefab = assetManager.importExternalFile(path, '/', Editor.Model.ResultType.Unpacked);
        const fileNames = ["BaseLayer", "Scene", "Root Scene", "Layer0", "baseLayer"];
        let animTrackMeta;
        let heavyAnimTrackMeta;
        for (let i = 0; i < fileNames.length; i++) {
            animTrackMeta = assetManager.getFileMeta(animationPrefab.path + "/Animations" + "/" + fileNames[i] + ".animationAsset");
            heavyAnimTrackMeta = assetManager.getFileMeta(animationPrefab.path + "/" + fileNames[i] + "_heavy" + ".animationAsset");
            if (animTrackMeta) {
                break;
            }
        }
        const animationController = assetManager.importExternalFile(import.meta.resolve("./Resources/BitmojiAnimationController.js"), '/', Editor.Model.ResultType.Unpacked);
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
        assetManager.move(heavyAnimTrackMeta, bitmojiPackage.path);
        assetManager.move(animationController.primary.fileMeta, bitmojiPackage.path);
        const actionManager = pluginSystem.findInterface(Editor.IPackageActions);
        const exportOptions = new Editor.Model.ExportOptions();
        exportOptions.packagePolicy = Editor.Assets.PackagePolicy.CanBeUnpacked;
        actionManager.exportPackage(nativePackageDescriptorFile, new Editor.Path(this.tempDir.path + "/Bitmoji Animation.lspkg"), exportOptions);
        let packedBitmojiPackage = assetManager.importExternalFile(new Editor.Path(this.tempDir.path + "/Bitmoji Animation.lspkg"), new Editor.Path('/'), Editor.Model.ResultType.Packed);
        assetManager.remove(bitmojiPackage.path);
        assetManager.remove(animationPrefab.path);
        try {
            animTrackMeta = null;
            heavyAnimTrackMeta = null;
            for (let i = 0; i < fileNames.length; i++) {
                animTrackMeta = assetManager.getFileMeta(packedBitmojiPackage.path + "/" + fileNames[i] + ".animationAsset");
                heavyAnimTrackMeta = assetManager.getFileMeta(packedBitmojiPackage.path + "/" + fileNames[i] + "_heavy" + ".animationAsset");
                if (animTrackMeta) {
                    break;
                }
            }
            let animationControllerAsset = assetManager.getFileMeta(packedBitmojiPackage.path + "/" + "BitmojiAnimationController" + ".js").primaryAsset;
            animationControllerAsset.animationAsset = animTrackMeta.primaryAsset;
            animationControllerAsset.heavyAnimationAsset = heavyAnimTrackMeta.primaryAsset;
            const bitmojiComponent = dependencyContainer.get(DependencyKeys.BitmojiComponent);
            const so = bitmojiComponent.sceneObject;
            //@ts-ignore
            bitmojiComponent.mixamoAnimation = false;
            animationControllerAsset.bitmoji3dComponent = bitmojiComponent;
            let animationPlayer = so.getComponent("AnimationPlayer");
            if (!animationPlayer) {
                animationPlayer = so.addComponent("AnimationPlayer");
            }
            animationControllerAsset.animationPlayer = animationPlayer;
            const clip = Editor.createAnimationClip(scene);
            clip.name = "Clip 0";
            clip.animation = animTrackMeta.primaryAsset;
            clip.end = clip.animation.duration;
            animationPlayer.animationClips = [clip];
            let scriptComponentWasFound = false;
            const scriptComponents = so.getComponents("ScriptComponent");
            for (let i = 0; i < scriptComponents.length; i++) {
                if (scriptComponents[i].name === "BitmojiAnimationController") {
                    scriptComponents[i].scriptAsset = animationControllerAsset;
                    scriptComponentWasFound = true;
                }
            }
            if (!scriptComponentWasFound) {
                const scriptComponent = so.addComponent('ScriptComponent');
                scriptComponent.scriptAsset = animationControllerAsset;
                scriptComponent.enabled = true;
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    async importExternalFileAsync(assetManager, path) {
        let objectPrefab = assetManager.importExternalFileAsync(path, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        return new Promise((resolve) => {
            resolve(objectPrefab);
        });
    }
}
