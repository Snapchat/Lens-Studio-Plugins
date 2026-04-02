// @ts-nocheck
import app from "./app.js";
import * as FileSystem from 'LensStudio:FileSystem';

export class Importer {
    private tempDir: FileSystem.TempDir;

    constructor() {
        this.tempDir = FileSystem.TempDir.create();
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



    private async importEffect(filePath: any, packId: string, previewsPath: string[]) {
        const model = this.findInterface(app.pluginSystem, Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        const scene = model.project.scene;
        const selection = model.project.selection;

        const scriptAssetImportResult = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
        const videoPreviewImportResult = await assetManager.importExternalFileAsync(previewsPath[0], new Editor.Path('./AI Clips Resources/'), Editor.Model.ResultType.Auto);
        const aiOutputRenderTarget = assetManager.createNativeAsset('RenderTarget', 'AI Output', new Editor.Path(`./AI Clips Resources/`));

        const scriptAsset = scriptAssetImportResult.primary;

        let cameraObject = this.getOrthoCameraObject(model);

        if (cameraObject == null) {
            const rootSO = scene.addSceneObject(null);
            cameraObject = this.createOrthographicCameraObject(model, rootSO);
        }

        const so = scene.addSceneObject(cameraObject);

        let addScreenRegion = true;

        so.getParent().components.forEach((component: any) => {
            if (component.getTypeName() == 'ScreenTransform') {
                addScreenRegion = false;
            }
        });

        so.addComponent('ScreenTransform');

        let componentSo = so;


        if (addScreenRegion) {
            so.name = 'Full Frame Region';
            const screenRegion = so.addComponent('ScreenRegionComponent');
            screenRegion.region = Editor.Components.ScreenRegionType.FullFrame;
            const screenEffectObject = scene.addSceneObject(so);
            screenEffectObject.name = app.name;
            screenEffectObject.layer = Editor.Model.LayerId.Ortho;
            const screenTransform = screenEffectObject.addComponent('ScreenTransform');
            screenTransform.transform = new Editor.Transform(new vec3(0, 0, -1), new vec3(0, 0, 0), new vec3(1, 1, 1));

            componentSo = screenEffectObject;
        } else {
            componentSo.name = "AI Clips";
            componentSo.layer = Editor.Model.LayerId.Ortho;
        }

        scriptAsset.dreamPackId = packId;
        scriptAsset.preview = videoPreviewImportResult.primary;

        const scriptComponent = componentSo.addComponent('ScriptComponent');
        scriptComponent.scriptAsset = scriptAsset;

        scriptComponent.outputTexture = aiOutputRenderTarget;

        return componentSo;
    }

    private findInterface(pluginSystem: any, interfaceID: any) {
        return pluginSystem.findInterface(interfaceID);
    }

    importToProject(packId: string, previewsPath: string[]): Promise<any> {
        return this.importEffect(import.meta.resolve('./Resources/AI Clips.lsc'), packId, previewsPath);
    }
}
