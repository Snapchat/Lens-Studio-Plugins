import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.HairCurlyBlue',
        'name': 'Hair Curly Blue',
        'description': 'Curly blue hair material for HairVisual component with configurable growth, color, and lighting',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/hair_curly_blue.ss_graph'),
    custom_defines: [
        'ENABLE_ADVANCED'
    ],
    pass_info: {

        'alphaTestThresh' : 0.755,
        'blurMultiplier' : 0.03,
        'textureScale' : 1.4,
        'Offset' : 0.54,
        'hairGrowth' : 1.0,
        'primaryDiffuseIntensity' : 0.2,
        'primarypecularIntensity' : 1.0,
        'hairTipsColor' : new vec4(0.32, 0.77, 1.0, 1.0),
        'hairRootsColor' : new vec4(0.19, 0.21, 0.33, 1.0),
        'mixEdge' : 0.38,
        'mixEdge' : 0.655,
        'diffuseLightColor' : new vec4(0.89, 0.71, 0.67, 1.0),
        'specularLightColor' : new vec4(0.99, 1.0, 0.99, 1.0),
        'litOffset' : -0.864,
        'litRotation' : 3.14,
    },
    custom_pass_info: {

        hairTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/alpha_curly_big.png'),
            ],
        },
        LitLookup: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/lit_mild.jpg'),
            ],
        },
        directionMap: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/hair_curly_param.jpg'),
            ],
        },
        intensityMap: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/hair_intensity_gradient.jpg'),
            ],
        },
    }
};

export const HairCurlyBlueMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
