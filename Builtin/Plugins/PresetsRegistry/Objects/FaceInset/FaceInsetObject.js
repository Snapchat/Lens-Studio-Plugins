import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { createFaceInsetComponent } from '../../Components/FaceInset/FaceInsetComponent.js';

export function createFaceInsetObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);
    const headBindingObject = scene.addSceneObject(effectsObject);
    headBindingObject.name = 'Face Inset Binding';
    const headBinding = headBindingObject.addComponent('Head');
    headBinding.attachmentPoint = Editor.Components.HeadAttachmentPointType.CandideCenter;

    const faceInsetObject = scene.addSceneObject(headBindingObject);
    faceInsetObject.name = 'Face Inset';
    createFaceInsetComponent.call(this, model, faceInsetObject);

    return faceInsetObject;
}

export class FaceInsetObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.FaceInsetObjectPreset',
            name: 'Face Inset',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/FaceInset.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return createFaceInsetObject.call(this, model, destination);
    }
}
