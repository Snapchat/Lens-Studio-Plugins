import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.VHSMaterial',
        'name': 'VHS',
        'description': 'PostEffectVisual material simulating VHS tape effects (chromatic aberration, distortion)',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/vhs.ss_graph'),
    pass_info: {
        depthTest :false,
        depthWrite :false,

        chromaticAberration: 0.02,
        baseSaturation: 0.30,
        bandHeight: 0.1,
        bandAmplitude: 0.05,
        bandSpeed: 0.3,
        bandInterval: 0.0,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const VHSMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
