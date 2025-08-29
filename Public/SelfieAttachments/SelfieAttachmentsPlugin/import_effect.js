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

function setRenderLayerRecursively(object, renderLayer) {
    object.layers = renderLayer;

    object.children.forEach((child) => setRenderLayerRecursively(child, renderLayer));
}

export async function importEffect(filePath, tmp) {
    const model = findInterface(app.pluginSystem, Editor.Model.IModel);
    const assetManager = model.project.assetManager;
    const scene = model.project.scene;

    const rootObject = findOrCreateCameraObject(scene, null);

    const renderLayer = rootObject.getComponent("Camera").renderLayer;

    let packageRoot = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
    for (let i = 0; i < packageRoot.files.length; i++) {
        if (packageRoot.files[i].primaryAsset.type === "ObjectPrefab") {
            const so  = scene.instantiatePrefab(packageRoot.files[i].primaryAsset, rootObject);

            setRenderLayerRecursively(so, renderLayer);

            break;
        }
    }

    return new Promise((resolve) => {
        resolve();
    });
}

function findInterface(pluginSystem, interfaceID) {
    return pluginSystem.findInterface(interfaceID);
}
