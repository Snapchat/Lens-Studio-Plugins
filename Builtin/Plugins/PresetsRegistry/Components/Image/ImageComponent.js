import { Preset } from 'LensStudio:Preset';
import { ImageMaterialPreset } from '../../Assets/ImageMaterial/ImageMaterial.js';

export async function createImageComponent(model, destinationObject) {
    const image = destinationObject.addComponent('Image');

    const materialPreset = new ImageMaterialPreset(this.pluginSystem);
    image.materials = [await materialPreset.createAsync()];

    image.stretchMode = Editor.Components.StretchMode.Fit;

    return image;
}

export class ImageComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ImageComponentPreset',
            name: 'Image',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Image.svg')),
            section: '2D',
            entityType: 'Image'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createImageComponent.call(this, model, destination);
    }
}
