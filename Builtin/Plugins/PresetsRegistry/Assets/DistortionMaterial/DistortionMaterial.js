import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.DistortionMaterial',
        'name': 'Distortion',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/distortion.ss_graph'),
    custom_defines: [
        'ENABLE_SPEED_OPTIONS'
    ],
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'speed': 0.7,
        'intensity': new vec2(0.5, 0.5),
        'uvScale': new vec2(1.0, 1.0),
    },
    custom_pass_info: {
        flowTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/PE_Wave_Vector.png'),
            ],
        },
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const DistortionMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
