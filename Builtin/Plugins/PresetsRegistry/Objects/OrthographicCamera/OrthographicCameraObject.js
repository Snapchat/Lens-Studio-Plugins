import { Preset } from 'LensStudio:Preset';
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

function getFirstOrthoCamInScene(model) {
    const scene = model.project.scene;

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
    const scene = model.project.scene;

    // Go up parents to find ortho camera.
    let cameraObject = getFirstParentOrthoCamRecursive(sceneObject);

    // If not found, find first ortho camera in scene.
    if (!cameraObject) {
        cameraObject = getFirstOrthoCamInScene(model);
    }

    // If still have not found any, make a new one.
    if (!cameraObject) {
        cameraObject = scene.addSceneObject(null); // Add object to top level without parent.
        createOrthographicCameraObject(model, cameraObject);
        createCanvasComponent(cameraObject);
    }

    return cameraObject;
}

export function createOrthographicCameraObject(model, sceneObject) {
    const scene = model.project.scene;
    const camera = sceneObject.addComponent('Camera');
    camera.cameraType = Editor.Components.CameraType.Orthographic;
    camera.renderTarget = scene.renderOutput;
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

export class OrthographicCameraObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.OrthographicCameraObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Orthographic Camera',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Camera.svg')),
            section: 'General',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);
        return createOrthographicCameraObject(model, destination);
    }
}
