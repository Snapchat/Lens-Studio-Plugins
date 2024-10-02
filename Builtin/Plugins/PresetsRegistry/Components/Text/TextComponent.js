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
            interfaces: Preset.descriptor().interfaces,
            name: 'Text',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Text.svg')),
            section: '2D',
            entityType: 'Text'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    create(destination) {
        const model = super.findInterface(Editor.ModelComponentID);
        return createTextComponent(model, destination);
    }
}
