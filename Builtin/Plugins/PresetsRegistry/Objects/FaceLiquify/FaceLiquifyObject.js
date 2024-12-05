import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

export function createFaceLiquifyAtAttachment(attachment, model, sceneObject) {
    const scene = model.project.scene;

    const liquifyVisualObject = scene.addSceneObject(sceneObject);
    liquifyVisualObject.name = 'Liquify Visual';

    const headBinding = liquifyVisualObject.addComponent('Head');
    headBinding.attachmentPoint = attachment;

    const liquifyVisual = liquifyVisualObject.addComponent('LiquifyVisual');
    liquifyVisual.radius = 2;
    liquifyVisual.intensity = 2;

    return liquifyVisualObject;
}

export function createFaceLiquifyObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);

    const faceLiquifyContainerObject = scene.addSceneObject(effectsObject);
    faceLiquifyContainerObject.name = 'Face Liquify';

    createFaceLiquifyAtAttachment(Editor.Components.HeadAttachmentPointType.LeftEyeballCenter, model, faceLiquifyContainerObject);
    createFaceLiquifyAtAttachment(Editor.Components.HeadAttachmentPointType.RightEyeballCenter, model, faceLiquifyContainerObject);

    return faceLiquifyContainerObject;
}

export class FaceLiquifyObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.FaceLiquifyObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Face Liquify',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/FaceLiquify.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return createFaceLiquifyObject(model, destination);
    }
}
