import { Preset } from 'LensStudio:Preset';
import { WorldMeshMaterialPreset } from '../../Assets/WorldMeshMaterial/WorldMeshMaterial.js';

export class WorldMeshObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.WorldMeshObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'World Mesh',
            description: 'Adds a World Mesh, which dynamically changes to the surfaces seen in the camera',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/WorldMesh.svg')),
            section: 'World',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    async createAsync(parent) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        parent = scene.addSceneObject(parent);
        parent.name = 'World Mesh';

        // Add Material
        const worldMeshMaterialPreset = new WorldMeshMaterialPreset(this.pluginSystem);
        const worldMeshMaterial = await worldMeshMaterialPreset.createAsync(/*destination*/null);
        const renderMeshVisual = parent.addComponent('RenderMeshVisual');
        renderMeshVisual.materials = [worldMeshMaterial];

        // Add Mesh Material
        const assetManager = model.project.assetManager;
        renderMeshVisual.mesh = assetManager.createNativeAsset('WorldMesh', 'World Mesh', new Editor.Path(''));
        return renderMeshVisual;
    }
}
