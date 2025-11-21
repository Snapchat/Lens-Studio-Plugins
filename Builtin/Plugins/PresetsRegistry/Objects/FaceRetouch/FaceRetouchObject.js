import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

async function createFaceRetouchObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);
    const FaceRetouchObject = scene.addSceneObject(effectsObject);

    FaceRetouchObject.name = 'Face Retouch';
    FaceRetouchObject.addComponent('RetouchVisual');

    return FaceRetouchObject;
}

export class FaceRetouchObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.FaceRetouchObjectPreset',
            name: 'Face Retouch',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/FaceRetouch.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createFaceRetouchObject.call(this, model, destination);
    }
}
