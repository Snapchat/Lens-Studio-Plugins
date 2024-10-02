import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.HalfToneMaterial',
        'name': 'Half Tone',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/half_tone.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'color1': new vec3(0.07, 0.51, 0.01),
        'color2': new vec3(1.0, 0.85, 0.84),
        'halftoneNum': 70.0,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const HalfToneMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
