import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { createCanvasComponent } from '../../Components/Canvas/CanvasComponent.js';

function getFirstParentOrthoCamRecursive(object) {
    const camera = object.getComponent('Camera');

    if (
        camera
        && camera.cameraType === Editor.Components.CameraType.Orthographic
    ) {
        return object;
    }

    const objectParent = object.getParent();
    if (objectParent) {
        return getFirstParentOrthoCamRecursive(objectParent);
    }

    return null;
}

function getFirstOrthoCamInScene(scene) {
    const cameras = scene.findComponents('Camera');

    // Look for any ortho cam.
    for (let i = 0; i < cameras.length; i++) {
        const camera = cameras[i];
        if (camera.cameraType !== Editor.Components.CameraType.Orthographic) {
            continue;
        }

        return camera.sceneObject;
    }
}

export function findOrCreateOrthoCam(model, sceneObject) {
    const scene = Utils.resolveScene(model, sceneObject);

    // Go up parents to find ortho camera.
    let cameraObject = getFirstParentOrthoCamRecursive(sceneObject);

    // If not found, find first ortho camera in scene.
    if (!cameraObject) {
        cameraObject = getFirstOrthoCamInScene(scene);
    }

    // If still have not found any, make a new one.
    // For prefabs, add under the root object (prefabs must have exactly one root).
    // For scenes, add at the top level.
    if (!cameraObject) {
        cameraObject = scene.addSceneObject(Utils.getSafeParent(scene));
        createOrthographicCameraObject(model, cameraObject);
        createCanvasComponent(cameraObject);
    }

    return cameraObject;
}

export function createOrthographicCameraObject(model, sceneObject) {
    const scene = Utils.resolveScene(model, sceneObject);
    const isScene = scene.isOfType('Scene');
    const camera = sceneObject.addComponent('Camera');
    const layerSet = Editor.Model.LayerSet.fromId(Editor.Model.LayerId.Ortho);
    camera.cameraType = Editor.Components.CameraType.Orthographic;
    if (isScene) {
        camera.renderTarget = scene.captureTarget;
        camera.renderOrder = scene.mainCamera.renderOrder + 1;
    } else {
        console.warn('[OrthographicCamera] A new camera was added without a render target. Please set the render target manually.');
    }
    camera.renderLayer = layerSet;
    camera.size = 20.0;
    camera.near = -1.0;
    camera.far = 200.0;
    sceneObject.name = 'Orthographic Camera';
    sceneObject.localTransform = new Editor.Transform(new vec3(-120, 0, 40),
        new vec3(0, 0, 0),
        new vec3(1, 1, 1));
    sceneObject.layers = layerSet;

    return sceneObject;
}

export class OrthographicCameraObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.OrthographicCameraObjectPreset',
            name: 'Orthographic Camera',
            description: 'Creates a scene object with Orthographic Camera component',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Camera.svg')),
            section: 'General',
            entityType: 'SceneObject'
        };
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = Utils.resolveScene(model, destination);
        destination = scene.addSceneObject(destination);
        return createOrthographicCameraObject(model, destination);
    }
}
