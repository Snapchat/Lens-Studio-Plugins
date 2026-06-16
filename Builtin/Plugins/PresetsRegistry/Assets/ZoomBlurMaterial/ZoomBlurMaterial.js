import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        id: 'Com.Snap.MaterialPreset.ZoomBlurMaterial',
        name: 'Zoom Blur',
        icon: import.meta.resolve('../Resources/Material.svg'),
        'description': 'PostEffectVisual material applying radial zoom blur effect',
        intendedPlatforms: [Editor.TargetPlatform.Snapchat],
    },
    graph_path: import.meta.resolve('Resources/zoom_blur.graphShader'),
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
