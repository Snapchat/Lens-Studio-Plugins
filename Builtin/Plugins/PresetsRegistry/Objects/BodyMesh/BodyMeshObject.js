import { Preset } from 'LensStudio:Preset';
import { BodyMeshMaterialPreset } from '../../Assets/BodyMeshMaterial/BodyMeshMaterial.js';
import { BodyObjectTracking3DPreset } from '../ObjectTracking3D/ObjectTracking3D.js';

async function createBodyMeshComponent(model, destinationObject) {
    const assetManager = model.project.assetManager;

    const renderMeshVisual = destinationObject.addComponent('RenderMeshVisual');

    // Add Material
    const bodyMeshMaterialPreset = new BodyMeshMaterialPreset(this.pluginSystem);
    renderMeshVisual.materials = [await bodyMeshMaterialPreset.createAsync()];

    // Add Mesh
    renderMeshVisual.mesh = assetManager.createNativeAsset('BodyMesh', 'Full Body Mesh', new Editor.Path(''));

    return renderMeshVisual;
}

async function createBodyMeshObject(model, sceneObject) {
    const scene = model.project.scene;

    const bodyTracking3DPreset = new BodyObjectTracking3DPreset(this.pluginSystem);
    const bodyTrackingObject = await bodyTracking3DPreset.createAsync(sceneObject);

    const bodyMeshObject = scene.addSceneObject(bodyTrackingObject);
    bodyMeshObject.name = 'Body Mesh';

    await createBodyMeshComponent.call(this, model, bodyMeshObject);

    return bodyMeshObject;
}

export class BodyMeshObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.BodyMeshObjectPreset',
            name: 'Full Body Mesh',
            description: 'Creates 3D body tracking object with RenderMeshVisual, Body Mesh Material, and Full Body Mesh.',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/FullBodyMesh.svg')),
            section: '3D',
            entityType: 'SceneObject'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createBodyMeshObject.call(this, model, destination);
    }
}
