import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

export function createFaceStretchObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);

    const faceStretchObject = scene.addSceneObject(effectsObject);
    faceStretchObject.name = 'Face Stretch';

    const faceStretchComponent = faceStretchObject.addComponent('FaceStretchVisual');
    faceStretchComponent.addFeature('Feature 0');

    return faceStretchObject;
}

export class FaceStretchObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.FaceStretchObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Face Stretch',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/FaceStretch.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return createFaceStretchObject(model, destination);
    }
}
