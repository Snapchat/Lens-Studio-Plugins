import { Preset } from 'LensStudio:Preset';
import { EyeColorMaterialPreset } from '../../Assets/EyeColorMaterial/EyeColorMaterial.js';

export async function createEyeColorComponent(model, destinationObject) {
    const eyeColor = destinationObject.addComponent('EyeColorVisual');

    const materialPreset = new EyeColorMaterialPreset(this.pluginSystem);
    eyeColor.mainMaterial = await materialPreset.createAsync();

    return eyeColor;
}

export class EyeColorComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.EyeColorComponentPreset',
            name: 'Eye Color',
            description: 'EyeColorVisual component',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/EyeColor.svg')),
            section: 'Face',
            entityType: 'EyeColorVisual'
        };
    }

    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createEyeColorComponent.call(this, model, destination);
    }
}
