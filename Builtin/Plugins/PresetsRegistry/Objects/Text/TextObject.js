import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
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
            name: 'Text',
            description: 'Creates a scene object with Text component for rendering 2D text labels in world space',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Text.svg')),
            section: '2D',
            entityType: 'SceneObject'
        };
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = Utils.resolveScene(model, destination);
        destination = scene.addSceneObject(destination);
        return createTextObject(model, destination);
    }
}
