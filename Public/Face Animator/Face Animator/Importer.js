// @ts-nocheck
import app from "./app.js";
import * as FileSystem from 'LensStudio:FileSystem';
export class Importer {
    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }
    getOrthoCameraObject(model) {
        const scene = model.project.scene;
        let cameraObject = null;
        scene.rootSceneObjects.forEach((element) => {
            element.components.forEach((component) => {
                if (component.getTypeName() == 'Camera' && component.cameraType == Editor.Components.CameraType.Orthographic) {
                    cameraObject = element;
                }
            });
        });
        return cameraObject;
    }
    createOrthographicCameraObject(model, sceneObject) {
        const scene = model.project.scene;
        const camera = sceneObject.addComponent('Camera');
        camera.cameraType = Editor.Components.CameraType.Orthographic;
        camera.renderTarget = scene.captureTarget;
        camera.renderOrder = scene.mainCamera.renderOrder + 1;
        camera.renderLayer = Editor.Model.LayerSet.fromId(Editor.Model.LayerId.Ortho);
        camera.size = 20.0;
        camera.near = -1.0;
        camera.far = 200.0;
        sceneObject.name = 'Orthographic Camera';
        sceneObject.localTransform = new Editor.Transform(new vec3(-120, 0, 40), new vec3(0, 0, 0), new vec3(1, 1, 1));
        sceneObject.layer = Editor.Model.LayerId.Ortho;
        return sceneObject;
    }
    createMLFaceEffect(model, sceneObject, scriptAsset, selection) {
        const scriptComponent = sceneObject.addComponent('ScriptComponent');
        scriptComponent.scriptAsset = scriptAsset;
        selection.clear();
        selection.add(sceneObject);
        return scriptComponent;
    }
    instantiateMLFaceEffect(model, sceneObject, scriptAsset, selection) {
        const scene = model.project.scene;
        let addScreenRegion = true;
        sceneObject.getParent().components.forEach((component) => {
            if (component.getTypeName() == 'ScreenTransform') {
                addScreenRegion = false;
            }
        });
        sceneObject.addComponent('ScreenTransform');
        if (addScreenRegion) {
            sceneObject.name = 'Full Frame Region';
            const screenRegion = sceneObject.addComponent('ScreenRegionComponent');
            screenRegion.region = Editor.Components.ScreenRegionType.FullFrame;
            const screenEffectObject = scene.addSceneObject(sceneObject);
            screenEffectObject.name = app.name;
            screenEffectObject.layer = Editor.Model.LayerId.Ortho;
            const screenTransform = screenEffectObject.addComponent('ScreenTransform');
            screenTransform.transform = new Editor.Transform(new vec3(0, 0, -1), new vec3(0, 0, 0), new vec3(1, 1, 1));
            this.createMLFaceEffect(model, screenEffectObject, scriptAsset, selection);
        }
        else {
            sceneObject.name = app.name;
            sceneObject.layer = Editor.Model.LayerId.Ortho;
            this.createMLFaceEffect(model, sceneObject, scriptAsset, selection);
        }
    }
    importEffect(ccPath, dnnPath, audioPath) {
        const model = this.findInterface(app.pluginSystem, Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        const scene = model.project.scene;
        const selection = model.project.selection;
        let scriptAsset = this.boom(app.pluginSystem, ccPath, dnnPath, audioPath);
        scriptAsset = scriptAsset.primary;
        // Check for other ortho cams in the scene
        let cameraObject = this.getOrthoCameraObject(model);
        // Ortho cam does not exist, add a new one to the destination
        if (cameraObject == null) {
            const rootSO = scene.addSceneObject(null);
            cameraObject = this.createOrthographicCameraObject(model, rootSO);
        }
        // Ortho cam exists, add a child scene object and the screen image to the child
        const so = scene.addSceneObject(cameraObject);
        so.layer = Editor.Model.LayerId.Ortho;
        this.instantiateMLFaceEffect(model, so, scriptAsset, selection);
        return new Promise((resolve) => {
            resolve(so);
        });
    }
    findInterface(pluginSystem, interfaceID) {
        return pluginSystem.findInterface(interfaceID);
    }
    importToProject(dnnPath, audioPath) {
        this.importEffect(import.meta.resolve('./Resources/FaceAnimator.lsc'), dnnPath, audioPath);
    }
    boom(pluginSystem, ccPath, dnnPath, audioPath) {
        let model = pluginSystem.findInterface(Editor.Model.IModel);
        let assetManager = model.project.assetManager;
        let mlAsset = assetManager.importExternalFile(dnnPath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
        mlAsset = mlAsset.primary;
        let audioAsset = null;
        if (audioPath !== null) {
            audioAsset = assetManager.importExternalFile(audioPath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
            audioAsset = audioAsset.primary;
        }
        let cc = assetManager.importExternalFile(ccPath, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        let cc1;
        let faceAnimatorProvider;
        let files1 = FileSystem.readDir(assetManager.assetsDirectory + "/" + cc.path, { recursive: false });
        files1.forEach((path) => {
            let fileMeta = assetManager.getFileMeta(cc.path + "/" + path);
            if (!fileMeta || !fileMeta.primaryAsset) {
                return;
            }
            if (fileMeta.primaryAsset.name === "FaceAnimator" && fileMeta.primaryAsset.type === "TypeScriptAsset") {
                cc1 = fileMeta.primaryAsset;
            }
            if (fileMeta.primaryAsset.name === "FaceAnimatorProvider" && fileMeta.primaryAsset.type === "TypeScriptAsset") {
                faceAnimatorProvider = fileMeta.primaryAsset;
            }
        });
        let scriptAssets = [];
        let files2 = FileSystem.readDir(assetManager.assetsDirectory + "/" + cc.path, { recursive: true });
        files2.forEach((path) => {
            let fileMeta = assetManager.getFileMeta(cc.path + "/" + path);
            if (!fileMeta || !fileMeta.primaryAsset) {
                return;
            }
            if (fileMeta.primaryAsset.type === "TypeScriptAsset") {
                scriptAssets.push(fileMeta.primaryAsset);
            }
        });
        faceAnimatorProvider.scriptAssets = scriptAssets;
        assetManager.move(mlAsset.fileMeta, cc.path);
        if (audioAsset) {
            assetManager.move(audioAsset.fileMeta, cc.path);
        }
        cc1.mlAsset = mlAsset;
        if (audioAsset) {
            cc1.audio = audioAsset;
        }
        const actionManager = pluginSystem.findInterface(Editor.IPackageActions);
        const exportOptions = new Editor.Model.ExportOptions();
        exportOptions.packagePolicy = Editor.Assets.PackagePolicy.CannotBeUnpacked;
        actionManager.exportScript(cc1, this.tempDir.path + "/" + "FaceAnimator.lsc", exportOptions);
        assetManager.remove(cc.path);
        let finalCC = assetManager.importExternalFile(this.tempDir.path + "/" + "FaceAnimator.lsc", new Editor.Path('/'), Editor.Model.ResultType.Packed);
        return finalCC;
    }
}
