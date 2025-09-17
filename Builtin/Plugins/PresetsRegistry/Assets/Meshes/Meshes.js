import {createResourcePresetClass, PresetCreateMethod} from '../Utils/ResourcePresetFactory.js';

function createMeshClass(name) {
    return createResourcePresetClass({
        name,
        id: `Com.Snap.MeshPreset.${name}`,
        description: '',
        icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('../Resources/Mesh.svg'))),
        section: 'Meshes',
        entityType: 'RenderMesh',
        resourcePath: new Editor.Path(import.meta.resolve(`Resources/${name}.mesh`)),
        createMethod: PresetCreateMethod.FindOrCreate
    });
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
