import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { OccluderMaterialPreset } from '../../Assets/OccluderMaterial/OccluderMaterial.js';

export async function createFaceOccluder(model, parent) {

    const scene = model.project.scene;
    const assetManager = model.project.assetManager;

    // Create the required assets
    const result = assetManager.importExternalFile(import.meta.resolve('../../Assets/Meshes/Resources/Head.mesh'), '', Editor.Model.ResultType.Packed);

    // Create the Face Occluder
    const faceOccluderObject = scene.addSceneObject(parent);
    faceOccluderObject.name = 'Face Occluder';

    // Set transform to put occluder in correct place on
    // default head binding: HeadCenter.
    // Numbers are based on LS 4.55.1
    faceOccluderObject.localTransform = new Editor.Transform(new vec3(0, 7.33, 8.74), new vec3(0, 0, 0), new vec3(0.83, 0.83, 0.83));

    const meshVisual = faceOccluderObject.addComponent('RenderMeshVisual');
    meshVisual.mesh = result.primary;

    // Add Material
    const materialPreset = new OccluderMaterialPreset(this.pluginSystem);
    meshVisual.materials = [await materialPreset.createAsync()];

    return meshVisual;
}

export function createHeadBindingObject(model, sceneObject) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);
    const headBindingObject = scene.addSceneObject(effectsObject);
    headBindingObject.name = 'Head Binding';
    const headBinding = headBindingObject.addComponent('Head');
    headBinding.attachmentPoint = Editor.Components.HeadAttachmentPointType.HeadCenter;

    return headBindingObject;
}

export class HeadBindingObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.HeadBindingPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Head Binding',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/HeadBinding.svg')),
            section: 'Face',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }

    async createAsync(destination) {
        const model = super.findInterface(Editor.ModelComponentID);
        const headBindingObject = createHeadBindingObject(model, destination);
        await createFaceOccluder.apply(this, [model, headBindingObject]);
        return headBindingObject;
    }
}
