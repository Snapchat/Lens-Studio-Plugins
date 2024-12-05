import { Preset } from 'LensStudio:Preset';
import { createTextComponent } from '../../Components/Text/TextComponent.js';

export function createTextObject(model, destinationObject) {
    createTextComponent(model, destinationObject);
    destinationObject.name = 'Text';

    return destinationObject;
}

export class TextObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.TextObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Text',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Text.svg')),
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
        return createTextObject(model, destination);
    }
}
