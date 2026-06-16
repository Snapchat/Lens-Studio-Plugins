import { Preset } from 'LensStudio:Preset';
import { UberPBRMaterialPreset } from '../../Assets/UberPBRMaterial/UberPBRMaterial.js';
import { UberDiffuseMaterialPreset } from '../../Assets/UberDiffuseMaterial/UberDiffuseMaterial.js';

export async function createRenderMeshVisualPBRComponent(model, sceneObject) {
    const renderMeshVisualComponent = sceneObject.addComponent('RenderMeshVisual');

    const isSpectacles = model.project.targetPlatform === Editor.TargetPlatform.Spectacles;
    const MaterialPreset = isSpectacles ? UberDiffuseMaterialPreset : UberPBRMaterialPreset;
    const materialPreset = new MaterialPreset(this.pluginSystem);
    const material = await materialPreset.createAsync();

    renderMeshVisualComponent.materials = [material];

    return renderMeshVisualComponent;
}

export class RenderMeshVisualPBRComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.RenderMeshVisualPBRPreset',
            name: 'Render Mesh Visual',
            description: 'RenderMeshVisual component with a platform-appropriate material (Uber PBR on Snapchat, Uber Diffuse on Spectacles)',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/RenderMeshVisual.svg')),
            section: '3D',
            entityType: 'Component'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createRenderMeshVisualPBRComponent.apply(this, [model, destination]);
    }
}
