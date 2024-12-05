import { Preset } from 'LensStudio:Preset';
import { createImageComponent } from '../../Components/Image/ImageComponent.js';

export class ImageObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ImageObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Image',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Image.svg')),
            section: '2D',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const image = model.project.scene.createSceneObject('Image');
        if (destination !== null) {
            image.setParent(destination, undefined);
        }
        image.localTransform = new Editor.Transform(new vec3(0, 0, 0),
            new vec3(0, 0, 0),
            new vec3(32, 32, 32));
        await createImageComponent.call(this, model, image);
        return image;
    }
}
