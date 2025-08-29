import app from '../application/app.js';

function findOrCreateCameraObject(scene, parentObject) {
    let result = null;

    const mainCamera = scene.mainCamera;

    if (mainCamera === null) {
        result = parentObject;

        if (!result) {
            result = scene.addSceneObject(null);
        }

        const camera = result.addComponent('Camera');
        camera.cameraType = Editor.Components.CameraType.Perspective;
        camera.renderTarget = scene.captureTarget;
        result.name = 'Camera';
    } else {
        if (parentObject) {
            parentObject.destroy();
        }
        result = mainCamera.sceneObject;
    }

    return result;
}

function findOrCreateChildWithName(rootObject, name, scene) {
    let result = null;

    const sceneObjects = rootObject.children;
    for (let i = 0; i < sceneObjects.length; i++) {
        const object = sceneObjects[i];
        if (object.name === name) {
            result = object;
        }
    }

    if (result === null) {
        result = scene.addSceneObject(rootObject);
        result.name = name;
    }

    return result;
}

function createHeadBindingObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = findOrCreateChildWithName(rootObject, 'Effects', scene);

    const headBindingObject = scene.addSceneObject(effectsObject);
    headBindingObject.name = 'Head Binding';
    const headBinding = headBindingObject.addComponent('Head');
    headBinding.attachmentPoint = Editor.Components.HeadAttachmentPointType.HeadCenter;

    return headBindingObject;
}

export async function importHeadmorph(filePath, tmp) {

    const model = findInterface(app.pluginSystem, Editor.Model.IModel);
    const assetManager = model.project.assetManager;
    const scene = model.project.scene;
    const selection = model.project.selection;

    let scriptAsset = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
    scriptAsset = scriptAsset.primary;

    const headBindingObject = createHeadBindingObject(model, null);

    const so = findOrCreateChildWithName(headBindingObject, `${app.name} Effect`, scene);
    so.localTransform = new Editor.Transform(new vec3(0, 0, 0), new vec3(0, 0, 0), new vec3(1.1, 1.1, 1.1));
    const scriptComponent = so.addComponent('ScriptComponent');
    scriptComponent.scriptAsset = scriptAsset;

    const deviceCameraTextureAsset = assetManager.createNativeAsset('DeviceCameraTexture', 'Device Camera Texture', new Editor.Path(`${app.name} Resources`));
    scriptAsset.inputTexture = deviceCameraTextureAsset;

    selection.clear();
    selection.add(so);

    return new Promise((resolve) => {
        resolve();
    });
}

function findInterface(pluginSystem, interfaceID) {
    return pluginSystem.findInterface(interfaceID);
}
