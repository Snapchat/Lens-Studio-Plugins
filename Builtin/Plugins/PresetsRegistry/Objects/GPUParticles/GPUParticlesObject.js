import { Preset } from 'LensStudio:Preset';
import { createGPUParticlesComponent } from '../../Components/GPUParticles/GPUParticlesComponent.js';

export class GPUParticlesObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.GPUParticlesObjectPreset',
            name: 'GPU Particles',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/GPUParticles.svg')),
            section: 'Visual Effects',
            entityType: 'SceneObject'
        };
    }

    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);
        destination.name = 'GPU Particles';
        return await createGPUParticlesComponent.call(this, model, destination);
    }
}
