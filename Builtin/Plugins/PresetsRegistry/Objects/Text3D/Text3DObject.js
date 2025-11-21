import { Preset } from 'LensStudio:Preset';
import { createText3DComponent } from '../../Components/Text3D/Text3DComponent.js';

export async function createText3DObject(model, destinationObject) {
    await createText3DComponent.call(this, model, destinationObject);
    destinationObject.name = 'Text3D';
    destinationObject.localTransform = new Editor.Transform(new vec3(0, 0, 20),
        new vec3(0, 0, 0),
        new vec3(1, 1, 1));

    return destinationObject;
}

export class Text3DObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.Text3DObjectPreset',
            name: 'Text3D',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Text3D.svg')),
            section: '3D',
            entityType: 'SceneObject'
        };
    }
    async createAsync(parent) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        const destination = scene.addSceneObject(parent);
        const text3DObject = await createText3DObject.call(this, model, destination);

        // If object is under a canvas hierarchy, add screen transform
        if (parent && parent.isOfType('SceneObject')) {
            const parentComponentsWithST = parent.components.filter(component => {
                return component.isOfType('ScreenTransform') || component.isOfType('Canvas');
            });

            if (parentComponentsWithST.length > 0) {
                destination.addComponent('ScreenTransform');
            }
        }

        return text3DObject;
    }
}
