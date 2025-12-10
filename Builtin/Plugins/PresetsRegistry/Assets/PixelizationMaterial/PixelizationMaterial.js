import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.PixelizationMaterial',
        'name': 'Pixelization',
        'description': 'PostEffectVisual material pixelating screen with tunable pixel size',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/Pixelization.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'pixelOffset': 96.74,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const PixelizationMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
