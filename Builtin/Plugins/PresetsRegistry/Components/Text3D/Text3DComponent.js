import { Preset } from 'LensStudio:Preset';
import { Text3DMaterialPreset } from '../../Assets/Text3DMaterial/Text3DMaterial.js';

export async function createText3DComponent(model, destinationObject) {
    const textComponent = destinationObject.addComponent('Text3D');
    textComponent.text = '3D Text';

    const text3DMaterialPreset = new Text3DMaterialPreset(this.pluginSystem);
    textComponent.mainMaterial = await text3DMaterialPreset.createAsync();

    return textComponent;
}

export class Text3DComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.Text3DComponentPreset',
            name: 'Text3D',
            description: 'Text3D component with default Text3D material',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Text3D.svg')),
            section: '3D',
            entityType: 'Text3D'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createText3DComponent.call(this, model, destination);
    }
}
