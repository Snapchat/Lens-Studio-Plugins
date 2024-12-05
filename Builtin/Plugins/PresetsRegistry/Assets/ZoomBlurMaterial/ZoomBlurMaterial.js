import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        id: 'Com.Snap.MaterialPreset.ZoomBlurMaterial',
        name: 'Zoom Blur',
        icon: import.meta.resolve('../Resources/Material.svg'),
        'description': 'Adds a zoom blur effect.',
    },
    graph_path: import.meta.resolve('Resources/zoom_blur.ss_graph'),
    pass_info: {
        depthTest: false,
        depthWrite: false,

        strength: 2.0,
        radialCenter: new vec2(0.0, 0.0),
        innerRadius: 0.103,
        outerRadius: 0.3401,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const ZoomBlurMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
