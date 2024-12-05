import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

function createMeshClass(name) {
    class MeshPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.MeshPreset.${name}`,
                interfaces: Preset.descriptor().interfaces,
                name: name,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/Mesh.svg')),
                section: 'Meshes',
                entityType: 'RenderMesh'
            };
        }
        async createAsync(d) {
            try {
                const destination = d ? d : new Editor.Path('');

                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const assetManager = model.project.assetManager;

                const resourceLoc = import.meta.resolve(`Resources/${name}.mesh`);
                const absGraphPath = new Editor.Path(resourceLoc);

                return await Utils.findOrCreateAsync(assetManager, absGraphPath, destination);
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }
    }
    return MeshPreset;
}
// Unfortunately can't do for-in
export const BoxMeshPreset = createMeshClass('Box');
export const CapsuleMeshPreset = createMeshClass('Capsule');
export const ConeMeshPreset = createMeshClass('Cone');
export const CylinderMeshPreset = createMeshClass('Cylinder');
export const DiscMeshPreset = createMeshClass('Disc');
export const HeadMeshPreset = createMeshClass('Head');
export const PlaneMeshPreset = createMeshClass('Plane');
export const PlatonicMeshPreset = createMeshClass('Platonic');
export const PyramidMeshPreset = createMeshClass('Pyramid');
export const SphereMeshPreset = createMeshClass('Sphere');
export const TorusMeshPreset = createMeshClass('Torus');
export const TubeMeshPreset = createMeshClass('Tube');
