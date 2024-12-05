import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.ShakeMaterial',
        'name': 'Shake',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/shake.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'uniAmplX': 1.0,
        'uniAmplY': 1.0,
        'uniFreq': new vec2(8.0, 6.0),
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const ShakeMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
