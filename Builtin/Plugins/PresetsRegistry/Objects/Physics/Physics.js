import { Preset } from 'LensStudio:Preset';
import * as MeshesPreset from '../Meshes/Meshes.js'

function createPhysicsObjectClass(name, iconPath, meshPreset, shapeType) {
    class PhysicsObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.PhysicsObjectPreset.${name}`,
                name: name,
                description: `Creates ${name} physics object with ${meshPreset.descriptor().name} mesh and collider for physics simulation.`,
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: 'Physics',
                entityType: 'SceneObject'
            };
        }
        async createAsync(destination) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const scene = model.project.scene;

                // Add mesh
                const meshObjectPreset = new meshPreset(this.pluginSystem);
                destination = await meshObjectPreset.createAsync(destination);

                destination.name = name;

                // Add matching physics collider
                const physicsBody = destination.addComponent('BodyComponent');
                physicsBody.shape = shapeType.call(this, scene);

                return destination;
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }
    }

    return PhysicsObjectPreset;
}

function createCustomCone(scene) {
    const shape = Editor.Shape.createConeShape(scene);
    shape.length = 1;
    shape.radius = 0.5;

    return shape;
}

function createCustomCylinder(scene) {
    const shape = Editor.Shape.createCylinderShape(scene);
    shape.length = 1.0;
    shape.radius = 0.5;

    return shape;
}

function createCustomCapsule(scene) {
    const shape = Editor.Shape.createCapsuleShape(scene);
    shape.length = 0.5;
    shape.radius = 0.25;

    return shape;
}

// Lens Studio 4.x classic presets
export const BoxPhysicsObjectPreset = createPhysicsObjectClass('Box Body', 'Resources/Physics_Body.svg', MeshesPreset.BoxMeshObjectPreset, Editor.Shape.createBoxShape);
export const SpherePhysicsObjectPreset = createPhysicsObjectClass('Sphere Body', 'Resources/Physics_Body.svg', MeshesPreset.SphereMeshObjectPreset, Editor.Shape.createSphereShape);
export const CapsulePhysicsObjectPreset = createPhysicsObjectClass('Capsule Body ', 'Resources/Physics_Body.svg', MeshesPreset.CapsuleMeshObjectPreset, createCustomCapsule);
export const CylinderPhysicsObjectPreset = createPhysicsObjectClass('Cylinder Body', 'Resources/Physics_Body.svg', MeshesPreset.CylinderMeshObjectPreset, createCustomCylinder);
export const ConePhysicsObjectPreset = createPhysicsObjectClass('Cone Body', 'Resources/Physics_Body.svg', MeshesPreset.ConeMeshObjectPreset, createCustomCone);
