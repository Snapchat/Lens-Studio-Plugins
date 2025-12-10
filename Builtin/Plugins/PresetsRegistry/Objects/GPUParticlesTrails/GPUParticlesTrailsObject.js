import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { GPUParticlesTrailsMaterialPreset } from '../../Assets/GPUParticlesTrailsMaterial/GPUParticlesTrailsMaterial.js';

export class GPUParticlesTrailsObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.GPUParticlesTrailsObjectPreset',
            name: 'GPU Particles Trails',
            description: 'GPU-based particle system with trails using RenderMeshVisual with GPU Particles Trails material and mesh. Creates particle effects with motion trails.',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/GPUParticles.svg')),
            section: 'Visual Effects',
            entityType: 'SceneObject'
        };
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
