// @ts-nocheck
import {dependencyContainer, DependencyKeys} from "./DependencyContainer.js";
import * as FileSystem from 'LensStudio:FileSystem';
import {LBEPreview} from "./Preview/LBEPreview.js";
//@ts-ignore
import {createBitmoji3DObject} from "./helpers/preset.js";
import ObjectPrefab = Editor.Assets.ObjectPrefab;

export class AnimationImporter {

    private tempDir: FileSystem.TempDir;

    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }

    async importBitmojiAnimationToProject(path: Editor.Path) {
        const pluginSystem: Editor.PluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as Editor.PluginSystem;
        const model: Editor.Model.IModel = pluginSystem.findInterface(Editor.Model.IModel);
        const scene: Editor.Assets.Scene = model.project.scene;
        const assetManager: Editor.Model.AssetManager = model.project.assetManager

        const animationPrefab: Editor.Model.ImportResult = assetManager.importExternalFile(path, '/', Editor.Model.ResultType.Unpacked);
        const fileNames: string[] = ["BaseLayer", "Scene", "Root Scene", "Layer0", "baseLayer"];
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
        const bitmojiPackage = assetManager.importExternalFile(import.meta.resolve("./Resources/Character Animation.lspkg"), '/', Editor.Model.ResultType.Unpacked);
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
        assetManager.move(heavyAnimTrackMeta, bitmojiPackage.path);
        assetManager.move(animationController.primary.fileMeta, bitmojiPackage.path);

        const actionManager = pluginSystem.findInterface(Editor.IPackageActions) as Editor.IPackageActions;
        const exportOptions = new Editor.Model.ExportOptions();
        exportOptions.packagePolicy = Editor.Assets.PackagePolicy.CanBeUnpacked;
        actionManager.exportPackage(nativePackageDescriptorFile, this.tempDir.path + "/Character Animation.lspkg", exportOptions);

        let packedBitmojiPackage = assetManager.importExternalFile(this.tempDir.path + "/Character Animation.lspkg", '/', Editor.Model.ResultType.Packed);

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

            let so: Editor.Model.SceneObject = await createBitmoji3DObject(pluginSystem);
            const bitmojiScriptComponent = so.getComponent('ScriptComponent')

            if (!so) {
                return;
            }

            let animationPlayer: Editor.Components.AnimationPlayer = so.getComponent("AnimationPlayer") as Editor.Components.AnimationPlayer;

            if (!animationPlayer) {
                animationPlayer = so.addComponent("AnimationPlayer") as Editor.Components.AnimationPlayer;
            }

            animationControllerAsset.animationPlayer = animationPlayer;

            const clip: Editor.AnimationClip = Editor.createAnimationClip(scene);
            clip.name = "Clip 0";
            clip.animation = animTrackMeta.primaryAsset as Editor.Assets.AnimationAsset;
            clip.end = clip.animation.duration;
            animationPlayer.animationClips = [clip];

            animationControllerAsset.bitmoji3dComponent = bitmojiScriptComponent;

            const scriptComponent = so.addComponent('ScriptComponent');
            scriptComponent.scriptAsset = animationControllerAsset;
            scriptComponent.enabled = true;
        } catch (e) {
            console.error(e);
        }
    }

    async importBodyMorphAnimationToProject(path: Editor.Path | string, bodyMorphGlbPath: Editor.Path | string) {
        const pluginSystem: Editor.PluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as Editor.PluginSystem;
        const model: Editor.Model.IModel = pluginSystem.findInterface(Editor.Model.IModel);
        const scene: Editor.Assets.Scene = model.project.scene;
        const assetManager: Editor.Model.AssetManager = model.project.assetManager

        const animationPrefab: Editor.Model.ImportResult = assetManager.importExternalFile(path, '/', Editor.Model.ResultType.Unpacked);
        let animTrackMeta = assetManager.getFileMeta(animationPrefab.path + "/Animations" + "/BaseLayer.animationAsset");
        if (!animTrackMeta) {
            animTrackMeta = assetManager.getFileMeta(animationPrefab.path + "/Animations" + "/Scene.animationAsset");
            if (!animTrackMeta) {
                animTrackMeta = assetManager.getFileMeta(animationPrefab.path + "/Animations" + "/Root Scene.animationAsset");
                if (!animTrackMeta) {
                    animTrackMeta = assetManager.getFileMeta(animationPrefab.path + "/Animations" + "/Layer0.animationAsset");
                    if (!animTrackMeta) {
                        animTrackMeta = assetManager.getFileMeta(animationPrefab.path + "/Animations" + "/baseLayer.animationAsset");
                    }
                }
            }
        }

        const bodyMorphPrefab: Editor.Model.ImportResult = assetManager.importExternalFile(bodyMorphGlbPath, '/', Editor.Model.ResultType.Unpacked);

        const bitmojiPackage = assetManager.importExternalFile(import.meta.resolve("./Resources/Character Animation.lspkg"), '/', Editor.Model.ResultType.Unpacked);
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
        assetManager.remove(animationPrefab.path);

        let objPrefab: any = null;
        let files = FileSystem.readDir(assetManager.assetsDirectory + "/" + bodyMorphPrefab.path, {recursive: true});
        files.forEach((path) => {
            let fileMeta = assetManager.getFileMeta(bodyMorphPrefab.path + "/" + path);
            if (!fileMeta || !fileMeta.primaryAsset) {
                return;
            }

            if (fileMeta.primaryAsset.type === "ObjectPrefab") {
                objPrefab = fileMeta.primaryAsset;
                return;
            }
            assetManager.move(fileMeta, bitmojiPackage.path)
        })

        if (objPrefab) {
            const so = scene.instantiatePrefab(objPrefab, null);
            so.worldTransform = new Editor.Transform(new vec3(0, -80, -150),
                new vec3(0, 0, 0),
                new vec3(1, 1, 1));
            so.name = "Character Animation";
            const animObj = so.getChildAt(0).getChildAt(0);
            animObj.name = "Skeleton";

            let animationPlayer: Editor.Components.AnimationPlayer = animObj.getComponent("AnimationPlayer") as Editor.Components.AnimationPlayer;

            if (!animationPlayer) {
                animationPlayer = animObj.addComponent("AnimationPlayer") as Editor.Components.AnimationPlayer;
            }

            const clip: Editor.AnimationClip = Editor.createAnimationClip(scene);
            clip.name = "Clip 0";
            clip.animation = animTrackMeta.primaryAsset as Editor.Assets.AnimationAsset;
            clip.end = clip.animation.duration;
            animationPlayer.animationClips = [clip];

            assetManager.saveAsPrefab(so, bitmojiPackage.path);
            so.destroy();
        }

        const actionManager = pluginSystem.findInterface(Editor.IPackageActions) as Editor.IPackageActions;
        const exportOptions = new Editor.Model.ExportOptions();
        exportOptions.packagePolicy = Editor.Assets.PackagePolicy.CanBeUnpacked;
        actionManager.exportPackage(nativePackageDescriptorFile, this.tempDir.path + "/Character Animation.lspkg", exportOptions);

        let packedBitmojiPackage = assetManager.importExternalFile(this.tempDir.path + "/Character Animation.lspkg", '/', Editor.Model.ResultType.Packed);

        assetManager.remove(bitmojiPackage.path);
        assetManager.remove(bodyMorphPrefab.path);

        let bitmojiAnimMeta = assetManager.getFileMeta(packedBitmojiPackage.path + "/" + "Character Animation" + ".prefab");
        let obj = scene.instantiatePrefab(bitmojiAnimMeta.primaryAsset as ObjectPrefab, null);
        obj.enabled = true;
    }
}
