import { Preset } from 'LensStudio:Preset';

export async function createRenderMeshVisualComponent(model, sceneObject) {
    const renderMeshVisualComponent = sceneObject.addComponent('RenderMeshVisual');

    return renderMeshVisualComponent;
}

export class RenderMeshVisualComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.RenderMeshVisualPreset',
            name: 'Render Mesh Visual',
            description: 'RenderMeshVisual component without any material',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/RenderMeshVisual.svg')),
            section: '3D',
            entityType: 'Component'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createRenderMeshVisualComponent.apply(this, [model, destination]);
    }
}
