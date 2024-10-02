import { Preset } from 'LensStudio:Preset';
import { createGPUParticlesComponent } from '../../Components/GPUParticles/GPUParticlesComponent.js';

export class GPUParticlesObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.GPUParticlesObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'GPU Particles',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/GPUParticles.svg')),
            section: 'Visual Effects',
            entityType: 'SceneObject'
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
    }

    async createAsync(destination) {
        const model = super.findInterface(Editor.ModelComponentID);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);
        destination.name = 'GPU Particles';
        return await createGPUParticlesComponent.call(this, model, destination);
    }
}