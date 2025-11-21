import { Preset } from 'LensStudio:Preset';

export function createTextComponent(model, destinationObject) {
    const textComponent = destinationObject.addComponent('Text');
    textComponent.text = 'Text';

    return textComponent;
}

export class TextComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.TextComponentPreset',
            name: 'Text',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Text.svg')),
            section: '2D',
            entityType: 'Text'
        };
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return createTextComponent(model, destination);
    }
}
