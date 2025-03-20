import { Preset } from 'LensStudio:Preset';
import { createScreenTransformObject } from '../ScreenTransform/ScreenTransformObject.js';
import { createTextObject } from '../Text/TextObject.js';

export class ScreenTextObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ScreenTextObjectPreset',
            name: 'Screen Text',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/ScreenText.svg')),
            section: '2D',
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
        const screenTransform = createScreenTransformObject(model, destination);
        createTextObject(model, screenTransform);
        screenTransform.name = 'Screen Text';
        return screenTransform;
    }
}
