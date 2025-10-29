import app from "../application/app.js";

function getOrthoCameraObject(model) {
    const scene = model.project.scene;
    let cameraObject = null;
    scene.rootSceneObjects.forEach(element => {
        element.components.forEach(component => {
            if (component.getTypeName() == 'Camera' && component.cameraType == Editor.Components.CameraType.Orthographic) {
                cameraObject = element;
            }
        });
    });
    return cameraObject;
}

function createOrthographicCameraObject(model, sceneObject) {
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

function createGarmentTransferComponent(sceneObject, scriptAsset, selection, garmentImage, garmentMask) {
    const scriptComponent = sceneObject.addComponent('ScriptComponent');

    scriptComponent.scriptAsset = scriptAsset;

    scriptComponent.garmentImage = garmentImage;
    scriptComponent.garmentMask = garmentMask;

    selection.clear();
    selection.add(sceneObject);

    return scriptComponent;
}

function instantiateGarmentTransfer(model, sceneObject, scriptAsset, selection, garmentImage, garmentMask) {
    const scene = model.project.scene;
    let addScreenRegion = true;

    sceneObject.getParent().components.forEach(component => {
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
        screenEffectObject.name = 'Garment Transfer';
        screenEffectObject.layer = Editor.Model.LayerId.Ortho;
        const screenTransform = screenEffectObject.addComponent('ScreenTransform');
        screenTransform.transform = new Editor.Transform(new vec3(0, 0, -1), new vec3(0, 0, 0), new vec3(1, 1, 1));

        createGarmentTransferComponent(screenEffectObject, scriptAsset, selection, garmentImage, garmentMask);
    } else {
        sceneObject.name = 'Garment Transfer';
        sceneObject.layer = Editor.Model.LayerId.Ortho;

        createGarmentTransferComponent(sceneObject, scriptAsset, selection, garmentImage, garmentMask);
    }
}

// TO-DO: change this one to new custom component id
const CUSTOM_COMPONENT_ID = "00061dfb-4f09-78c6-0000-000000020135";

export class Importer {
    constructor() {
    }

    async findOrImportScript(assetManager) {
        const allAssets = assetManager.assets;
        for (let asset of allAssets) {
            if (asset.componentId && asset.componentId.toString() === CUSTOM_COMPONENT_ID) {
                return asset;
            }
        }

        let scriptAsset = await assetManager.importExternalFileAsync(import.meta.resolve("./Resources/Garment Transfer.lsc"), "/", Editor.Model.ResultType.Auto);
        scriptAsset = scriptAsset.primary;

        return scriptAsset;
    }

    async import(textureBytes, maskBytes) {
        const model = app.findInterface(Editor.Model.IModel);
        const assetManager =  model.project.assetManager;
        const scene = model.project.scene;
        const selection = model.project.selection;

        let scriptAsset = await this.findOrImportScript(assetManager);

        let garmentImage = await assetManager.importExternalFileAsync(app.storage.createFile("Generated Garment Image.png", textureBytes), "/", Editor.Model.ResultType.Auto);
        garmentImage = garmentImage.primary;

        let garmentMask = await assetManager.importExternalFileAsync(app.storage.createFile("Generated Garment Mask.png", maskBytes), "/", Editor.Model.ResultType.Auto);
        garmentMask = garmentMask.primary;

        // Check for other ortho cams in the scene
        let cameraObject = getOrthoCameraObject(model);

        // Ortho cam does not exist, add a new one to the destination
        if (cameraObject == null) {
            const rootSO = scene.addSceneObject(null);
            cameraObject = createOrthographicCameraObject(model, rootSO);
        }
        
        // Ortho cam exists, add a child scene object and the screen image to the child
        const so = scene.addSceneObject(cameraObject);
        so.layer = Editor.Model.LayerId.Ortho;
        instantiateGarmentTransfer(model, so, scriptAsset, selection, garmentImage, garmentMask);

        return new Promise((resolve) => {
            resolve();
        });
    }
}
