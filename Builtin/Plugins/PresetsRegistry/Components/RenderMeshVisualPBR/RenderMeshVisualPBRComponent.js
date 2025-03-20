import { Preset } from 'LensStudio:Preset';
import { UberPBRMaterialPreset } from '../../Assets/UberPBRMaterial/UberPBRMaterial.js';

export async function createRenderMeshVisualPBRComponent(model, sceneObject) {
    const renderMeshVisualComponent = sceneObject.addComponent('RenderMeshVisual');

    const pbrMaterialPreset = new UberPBRMaterialPreset(this.pluginSystem);
    const pbrMaterial = await pbrMaterialPreset.createAsync();

    renderMeshVisualComponent.materials = [pbrMaterial];

    return renderMeshVisualComponent;
}

export class RenderMeshVisualPBRComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.RenderMeshVisualPBRPreset',
            name: 'Render Mesh Visual (PBR)',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/RenderMeshVisual.svg')),
            section: '3D',
            entityType: 'Component'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createRenderMeshVisualPBRComponent.apply(this, [model, destination]);
    }
}
