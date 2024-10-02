import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.BodyMeshMaterialPreset',
        'name': 'Body Mesh',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/body_mesh.ss_graph'),
    pass_info: {
        'metallic': 0.0,
        'roughness': 0.0,
    }
};

export const BodyMeshMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
