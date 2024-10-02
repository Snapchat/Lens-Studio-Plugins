import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.GoldMaterial',
        'name': 'Gold',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/uber_spec.ss_graph'),
    pass_info: {
        'baseColor': new vec4(1.0, 0.86, 0.55, 1.0),
        'uv2Offset': new vec2(0.0, 0.0),
        'uv3Offset': new vec2(0.0, 0.0),
        'metallic': 1.0,
        'roughness': 0.0,
    },
};

export const GoldMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
