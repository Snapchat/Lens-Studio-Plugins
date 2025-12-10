import { Preset } from 'LensStudio:Preset';
import { createImageComponent } from '../../Components/Image/ImageComponent.js';
import { createScreenTransformObject } from '../ScreenTransform/ScreenTransformObject.js';

export class ScreenImageObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ScreenImageObjectPreset',
            name: 'Screen Image',
            description: 'Creates a screen-space image with ScreenTransform and Image component for 2D texture display. Default hierarchy: Orthographic Camera -> Screen Region -> Screen Image',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/ScreenImage.svg')),
            section: '2D',
            entityType: 'SceneObject'
        };
    }

    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);
        const screenTransform = createScreenTransformObject(model, destination);
        await createImageComponent.call(this, model, screenTransform);
        screenTransform.name = 'Screen Image';
        return screenTransform;
    }
}
