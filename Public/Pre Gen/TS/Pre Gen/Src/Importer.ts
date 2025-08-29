import app from "./app.js";

export class Importer {

    constructor() {

    }

    private getOrthoCameraObject(model: any) {
        const scene = model.project.scene;
        let cameraObject = null;
        scene.rootSceneObjects.forEach((element: any) => {
            element.components.forEach((component: any) => {
                if (component.getTypeName() == 'Camera' && component.cameraType == Editor.Components.CameraType.Orthographic) {
                    cameraObject = element;
                }
            });
        });
        return cameraObject;
    }

    private createOrthographicCameraObject(model: any, sceneObject: any) {
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
        sceneObject.localTransform = new Editor.Transform(new vec3(-120, 0, 40),
            new vec3(0, 0, 0),
            new vec3(1, 1, 1));
        sceneObject.layer = Editor.Model.LayerId.Ortho;

        return sceneObject;
    }

    private createMLFaceEffect(model: any, sceneObject: any, scriptAsset: any, selection: any, packId: string) {
        const scriptComponent = sceneObject.addComponent('ScriptComponent');

        scriptComponent.scriptAsset = scriptAsset;

        const assetManager = model.project.assetManager;

        scriptComponent.dreamPackId = packId;

        selection.clear();
        selection.add(sceneObject);

        return scriptComponent;
    }

    private instantiateMLFaceEffect(model: any, sceneObject: any, scriptAsset: any, selection: any, packId: string) {
        const scene  = model.project.scene;
        let addScreenRegion = true;

        sceneObject.getParent().components.forEach((component: any) => {
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

            this.createMLFaceEffect(model, screenEffectObject, scriptAsset, selection, packId);
        } else {
            sceneObject.name = app.name;
            sceneObject.layer = Editor.Model.LayerId.Ortho;

            this.createMLFaceEffect(model, sceneObject, scriptAsset, selection, packId);
        }
    }

    private async importEffect(filePath: any, packId: string) {
        const model = this.findInterface(app.pluginSystem, Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        const scene = model.project.scene;
        const selection = model.project.selection;

        let scriptAsset = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
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
        this.instantiateMLFaceEffect(model, so, scriptAsset, selection, packId);

        return new Promise((resolve) => {
            resolve(so);
        });
    }

    private findInterface(pluginSystem: any, interfaceID: any) {
        return pluginSystem.findInterface(interfaceID);
    }

    async importToProject(packId: string) {
        this.importEffect(import.meta.resolve('./Resources/AI Portraits.lsc'), packId);
    }
}
