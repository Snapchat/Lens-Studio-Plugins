import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        id: 'Com.Snap.MaterialPreset.WorldMeshMaterial',
        name: 'World Mesh',
        description: 'Material for visualizing World Mesh',
        icon: import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/world_mesh.graphShader'),
};

export const WorldMeshMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
