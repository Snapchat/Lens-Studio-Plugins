import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.DitheringMaterial',
        'name': 'Dithering',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/dithering.ss_graph'),
    custom_defines: [
        'COLOR_MODE 0'
    ],
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'colortint': new vec4(1.0, 1.0, 1.0, 1.0),
        'intensity': 0.5,
        'ditheringSize': 1.0,
        'contrast': 5,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const DitheringMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
