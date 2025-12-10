import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.OccluderMaterial',
        'name': 'Occluder',
        'description': 'Occludes or masks other objects without rendering itself',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/occluder.ss_graph'),
    pass_info: {
        'colorMask': new vec4b(false, false, false, false),

    }
};

export const OccluderMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
