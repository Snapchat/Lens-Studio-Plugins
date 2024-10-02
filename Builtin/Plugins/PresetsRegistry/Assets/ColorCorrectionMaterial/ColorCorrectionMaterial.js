import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.ColorCorrectionMaterial',
        'name': 'Color Correction',
        'description': 'Applies a LUT (Look Up Table).',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/color_correction.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,
    },
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('Resources/Beauty.png'),
                0
            ]
        },
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const ColorCorrectionMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
