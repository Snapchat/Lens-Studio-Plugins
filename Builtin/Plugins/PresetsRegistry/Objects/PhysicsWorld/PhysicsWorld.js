import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

export class PhysicsWorldObjectPreset extends Preset {
    static descriptor() {
        return {
            id: `Com.Snap.PhysicsObjectPreset.World`,
            name: 'Physics World',
            description: 'Creates a Physics World object with WorldComponent for managing physics simulation environment and settings',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Physics_World.svg')),
            section: 'Physics',
            entityType: 'SceneObject'
        };
    }
    async createAsync(destination) {
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            const scene = Utils.resolveScene(model, destination);

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
