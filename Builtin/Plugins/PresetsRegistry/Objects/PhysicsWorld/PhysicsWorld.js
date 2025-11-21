import { Preset } from 'LensStudio:Preset';

export class PhysicsWorldObjectPreset extends Preset {
    static descriptor() {
        return {
            id: `Com.Snap.PhysicsObjectPreset.World`,
            name: 'Physics World',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Physics_World.svg')),
            section: 'Physics',
            entityType: 'SceneObject'
        };
    }
    async createAsync(destination) {
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            const scene = model.project.scene;

            // Add object
            destination = scene.addSceneObject(destination);
            destination.name = 'Physics World';

            // Add physics world
            const physicsWorld = destination.addComponent('WorldComponent');

            return destination;
        } catch (e) {
            console.log(`${e.message}\n${e.stack}`);
        }
    }
}
