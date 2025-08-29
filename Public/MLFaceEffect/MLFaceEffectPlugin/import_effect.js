import app from '../application/app.js';

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

function createMLFaceEffect(model, sceneObject, scriptAsset, selection) {
    const scriptComponent = sceneObject.addComponent('ScriptComponent');

    scriptComponent.scriptAsset = scriptAsset;

    const assetManager = model.project.assetManager;

    const faceCropTextureAsset = assetManager.createNativeAsset('FaceCropTexture', 'Face Crop Texture', new Editor.Path(`${app.name} Resources`));
    const deviceCameraTextureAsset = assetManager.createNativeAsset('DeviceCameraTexture', 'Device Camera Texture', new Editor.Path(`${app.name} Resources`));

    faceCropTextureAsset.inputTexture = deviceCameraTextureAsset;

    scriptComponent.inputTexture = faceCropTextureAsset;

    selection.clear();
    selection.add(sceneObject);

    return scriptComponent;
}

function instantiateMLFaceEffect(model, sceneObject, scriptAsset, selection) {
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
        screenEffectObject.name = app.name;
        screenEffectObject.layer = Editor.Model.LayerId.Ortho;
        const screenTransform = screenEffectObject.addComponent('ScreenTransform');
        screenTransform.transform = new Editor.Transform(new vec3(0, 0, -1), new vec3(0, 0, 0), new vec3(1, 1, 1));

        createMLFaceEffect(model, screenEffectObject, scriptAsset, selection);
    } else {
        sceneObject.name = app.name;
        sceneObject.layer = Editor.Model.LayerId.Ortho;

        createMLFaceEffect(model, sceneObject, scriptAsset, selection);
    }
}

export async function importEffect(filePath, tempDir) {
    const model = findInterface(app.pluginSystem, Editor.Model.IModel);
    const assetManager = model.project.assetManager;
    const scene = model.project.scene;
    const selection = model.project.selection;

    let scriptAsset = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
    scriptAsset = scriptAsset.primary;

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
    instantiateMLFaceEffect(model, so, scriptAsset, selection);

    return new Promise((resolve) => {
        resolve();
    });
}

function findInterface(pluginSystem, interfaceID) {
    return pluginSystem.findInterface(interfaceID);
}
