import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

export class VoxelizerCameraObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.VoxelizerCameraObjectPreset',
            name: 'Voxelizer Camera',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Camera.svg')),
            section: 'General',
            entityType: 'SceneObject',
            intendedPlatforms: [Editor.TargetPlatform.Snapchat]
        };
    }

create(destination) {

        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = Utils.resolveScene(model, destination);
        destination = scene.addSceneObject(destination);
        destination.name = 'Voxelizer Camera';
        const voxComp = destination.addComponent('VoxelDataComponent');
        return destination;
    }
}
