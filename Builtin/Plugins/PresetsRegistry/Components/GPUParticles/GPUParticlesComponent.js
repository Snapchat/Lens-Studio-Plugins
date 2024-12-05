import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { GPUParticlesMaterialPreset } from '../../Assets/GPUParticlesMaterial/GPUParticlesMaterial.js';

export async function createGPUParticlesComponent(model, destinationObject) {
    const assetManager = model.project.assetManager;
    const renderMeshVis = destinationObject.addComponent('RenderMeshVisual');

    const gpuParticlesMeshPath = new Editor.Path(import.meta.resolve('Resources/GPUParticlesMesh.mesh'));
    const particlesMesh = Utils.findOrCreate(assetManager, gpuParticlesMeshPath);
    const gPUParticlesMaterialPreset = new GPUParticlesMaterialPreset(this.pluginSystem);
    const material = await gPUParticlesMaterialPreset.createAsync();

    renderMeshVis.materials = [material];
    renderMeshVis.mesh = particlesMesh;

    return renderMeshVis;
}

export class GPUParticlesComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.GPUParticlesComponentPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'GPU Particles',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/GPUParticles.svg')),
            section: 'Visual Effects',
            entityType: 'Component'
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
    }

    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createGPUParticlesComponent.call(this, model, destination);
    }
}
