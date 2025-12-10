import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.ColorGradient',
        'name': 'Color Gradient',
        'description': 'PostEffectVisual material mapping screen color ranges to four-color gradient',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/color_gradient.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'color1': new vec4(0.0, 0.04, 0.18, 1.0),
        'color2': new vec4(0.16, 0.21, 0.47, 1.0),
        'color3': new vec4(0.61, 0.0, 1.0, 1.0),
        'color4': new vec4(1.0, 0.82, 0.75, 1.0),
        'alpha': 1.0,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const ColorGradientMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
