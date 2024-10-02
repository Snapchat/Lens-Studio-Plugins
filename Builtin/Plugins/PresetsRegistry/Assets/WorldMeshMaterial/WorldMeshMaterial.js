import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        id: 'Com.Snap.MaterialPreset.WorldMeshMaterial',
        name: 'World Mesh',
        description: 'A material useful for visualizing a World Mesh.',
        icon: import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/world_mesh.ss_graph'),
};

export const WorldMeshMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
