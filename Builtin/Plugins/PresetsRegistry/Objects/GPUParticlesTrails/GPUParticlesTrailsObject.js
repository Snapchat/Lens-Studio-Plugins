import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { GPUParticlesTrailsMaterialPreset } from '../../Assets/GPUParticlesTrailsMaterial/GPUParticlesTrailsMaterial.js';

export class GPUParticlesTrailsObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.GPUParticlesTrailsObjectPreset',
            name: 'GPU Particles Trails',
            description: 'Adds a GPU Particles object to the scene which uses Trails settings',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/GPUParticles.svg')),
            section: 'Visual Effects',
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
        parent.name = 'GPU Particles Trails';

        // Add Material
        const gpuParticlesTrailsMaterialPreset = new GPUParticlesTrailsMaterialPreset(this.pluginSystem);
        const gpuParticlesTrailsMaterial = await gpuParticlesTrailsMaterialPreset.createAsync(/*destination*/null);
        const renderMeshVisual = parent.addComponent('RenderMeshVisual');
        renderMeshVisual.materials = [gpuParticlesTrailsMaterial];

        // Add Mesh
        const assetManager = model.project.assetManager;
        const gpuParticlesTrailsMeshPath = import.meta.resolve('Resources/GPUParticlesTrailsMesh.mesh');
        const particlesMesh = Utils.findOrCreate(assetManager, gpuParticlesTrailsMeshPath);
        renderMeshVisual.mesh = particlesMesh;

        return renderMeshVisual;
    }
}
