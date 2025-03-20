import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { FaceMeshMaterialPreset } from '../../Assets/FaceMeshMaterial/FaceMeshMaterial.js';
import { PBRMaterialPreset } from '../../Assets/PBRMaterial/PBRMaterial.js';

export async function createFaceMeshComponent(model, destinationObject, headMeshMode) {
    const assetManager = model.project.assetManager;

    const renderMeshVisual = destinationObject.addComponent('RenderMeshVisual');

    // Add Material
    const MaterialPresetPlugin = headMeshMode ? PBRMaterialPreset : FaceMeshMaterialPreset;
    const materialPreset = new MaterialPresetPlugin(this.pluginSystem);
    renderMeshVisual.materials = [await materialPreset.createAsync()];

    // Add Mesh Material
    const assetName = headMeshMode ? 'Head Mesh' : 'Face Mesh';
    const faceMeshMesh = assetManager.createNativeAsset('FaceMesh', assetName, '');
    renderMeshVisual.mesh = faceMeshMesh;

    if (headMeshMode) {
        faceMeshMesh.skullGeometryEnabled = true;
    }

    return renderMeshVisual;
}

export async function createFaceMeshObject(model, sceneObject, headMeshMode) {
    const scene = model.project.scene;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);

    const headBindingObject = scene.addSceneObject(effectsObject);
    headBindingObject.name = 'Head Binding';

    const headBinding = headBindingObject.addComponent('Head');
    headBinding.attachmentPoint = Editor.Components.HeadAttachmentPointType.HeadCenter;

    const faceMeshObject = scene.addSceneObject(headBindingObject);
    faceMeshObject.name = headMeshMode ? 'Head Mesh' : 'Face Mesh';

    await createFaceMeshComponent.call(this, model, faceMeshObject, headMeshMode);

    return faceMeshObject;
}

function createSpecialMeshObject(id, name, iconPath, headMeshMode) {
    class SpecialMeshObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${id}ObjectPreset`,
                name: name,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: '3D',
                entityType: 'SceneObject'
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);
        }
        async createAsync(destination) {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            return await createFaceMeshObject.call(this, model, destination, headMeshMode);
        }
    }

    return SpecialMeshObjectPreset;
}

export const FaceMeshObjectPreset = createSpecialMeshObject('faceMesh', 'Face Mesh', 'Resources/FaceMesh.svg', false);
export const HeadMeshObjectPreset = createSpecialMeshObject('headMesh', 'Head Mesh', 'Resources/HeadMesh.svg', true);
