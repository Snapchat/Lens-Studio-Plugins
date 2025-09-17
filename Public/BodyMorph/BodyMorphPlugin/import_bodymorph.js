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

export async function importBodymorph(filePath, tmp) {
    const model = findInterface(app.pluginSystem, Editor.Model.IModel);
    const assetManager = model.project.assetManager;
    const scene = model.project.scene;

    const rootObject = findOrCreateCameraObject(scene, null);

    let packageRoot = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Packed);

    let nativePackageItems = packageRoot.files[0].getNativePackageItems(Editor.Model.AssetImportMetadata.PackageIterate.Shallow);

    for (let i = 0; i < nativePackageItems.length; i++) {
        if (nativePackageItems[i].primaryAsset.type === "ObjectPrefab" && nativePackageItems[i].primaryAsset.name === "Body Morph") {
            scene.instantiatePrefab(nativePackageItems[i].primaryAsset, rootObject)
        }
    }

    return new Promise((resolve) => {
        resolve();
    });
}

function findInterface(pluginSystem, interfaceID) {
    return pluginSystem.findInterface(interfaceID);
}
