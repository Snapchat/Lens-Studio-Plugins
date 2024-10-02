import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.ColorRemapMaterial',
        'name': 'Color Remap',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/color_remap.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'color1': new vec4(0.05, 0.09, 0.04, 1.0),
        'color2': new vec4(0.47, 0.7, 0.98, 1.0),
        'color3': new vec4(1.0, 0.74, 0.15, 1.0),
        'color4': new vec4(1.0, 1.0, 1.0, 1.0),
        'alpha': 1.0,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const ColorRemapMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
