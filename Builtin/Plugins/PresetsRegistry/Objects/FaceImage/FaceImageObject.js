import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { createImageComponent } from '../../Components/Image/ImageComponent.js';

export async function createFaceImageObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);
    const headBindingObject = scene.addSceneObject(effectsObject);
    headBindingObject.name = 'Head Binding';
    const headBinding = headBindingObject.addComponent('Head');
    headBinding.attachmentPoint = Editor.Components.HeadAttachmentPointType.CandideCenter;

    const faceImageObject = scene.addSceneObject(headBindingObject);
    faceImageObject.name = 'Face Image';
    faceImageObject.localTransform = new Editor.Transform(new vec3(0, 0, 0), new vec3(0, 0, 0), new vec3(5, 5, 1));

    await createImageComponent.call(this, model, faceImageObject);

    return faceImageObject;
}

export class FaceImageObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.FaceImageObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Face Image',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/FaceImage.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createFaceImageObject.call(this, model, destination);
    }
}
