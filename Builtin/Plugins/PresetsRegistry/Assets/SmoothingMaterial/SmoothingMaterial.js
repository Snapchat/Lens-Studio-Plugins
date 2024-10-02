import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.SmoothingMaterial',
        'name': 'Smoothing',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/smoothing.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'baseColor': 1.0,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const SmoothingMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
