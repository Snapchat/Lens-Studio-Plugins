import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.GaussianBlurMaterial',
        'name': 'Gaussian Blur',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/gauss_blur.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'blurFactor': 4.0,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [
                true,
            ],
        }
    }
};

export const GaussianBlurMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
