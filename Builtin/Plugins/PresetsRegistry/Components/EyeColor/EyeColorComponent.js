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
            interfaces: Preset.descriptor().interfaces,
            name: 'Eye Color',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/EyeColor.svg')),
            section: 'Face',
            entityType: 'EyeColorVisual'
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
    }

    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createEyeColorComponent.call(this, model, destination);
    }
}
