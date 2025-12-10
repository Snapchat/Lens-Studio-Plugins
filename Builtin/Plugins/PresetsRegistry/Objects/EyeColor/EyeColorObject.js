import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { createEyeColorComponent } from '../../Components/EyeColor/EyeColorComponent.js';

export async function createEyeColorObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);
    const eyeColorObject = scene.addSceneObject(effectsObject);
    eyeColorObject.name = 'Eye Color';
    await createEyeColorComponent.call(this, model, eyeColorObject);

    return eyeColorObject;
}

export class EyeColorObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.EyeColorObjectPreset',
            name: 'Eye Color',
            description: 'Creates a scene object with EyeColorVisual component with default Eye Color material',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/EyeColor.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createEyeColorObject.call(this, model, destination);
    }
}
