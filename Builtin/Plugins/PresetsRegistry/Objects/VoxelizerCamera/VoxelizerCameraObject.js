import { Preset } from 'LensStudio:Preset';

export class VoxelizerCameraObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.VoxelizerCameraObjectPreset',
            name: 'Voxelizer Camera',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Camera.svg')),
            section: 'General',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }

create(destination) {
    
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);
        destination.name = 'Voxelizer Camera';
        const voxComp = destination.addComponent('VoxelDataComponent');
        return destination;
    }
}
