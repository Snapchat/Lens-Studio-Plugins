import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { createFaceMaskComponent } from '../../Components/FaceMask/FaceMaskComponent.js';

export async function createFaceMaskObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);
    const faceMaskObject = scene.addSceneObject(effectsObject);
    faceMaskObject.name = 'Face Mask';
    await createFaceMaskComponent.call(this, model, faceMaskObject);

    return faceMaskObject;
}

export class FaceMaskObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.FaceMaskObjectPreset',
            name: 'Face Mask',
            description: 'Creates a scene object with FaceMaskVisual component with default Face Mask material',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/FaceMask.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createFaceMaskObject.call(this, model, destination);
    }
}
