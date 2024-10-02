import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.EyeColorMaterialPreset',
        'name': 'Eye Color',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('../Resources/flat.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,
        'baseColor': new vec4(0.2, 0.7, 0.5, 0.3),
        'blendMode': Editor.Assets.BlendMode.Realistic,
    }
};

export const EyeColorMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
