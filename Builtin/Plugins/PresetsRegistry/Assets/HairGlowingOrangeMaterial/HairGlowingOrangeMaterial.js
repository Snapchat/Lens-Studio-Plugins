import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.HairGlowingOrange',
        'name': 'Hair Glowing Orange',
        'description': 'Glowing orange hair material for HairVisual component with configurable growth, color, and lighting',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/hair_glowing_orange.ss_graph'),
    custom_defines: [
        'ENABLE_ADVANCED'
    ],
    pass_info: {

        'alphaTestThresh' : 0.13,
        'blurMultiplier' : 1.0,
        'hairGrowth' : 1.0,
        'hairTipsColor' : new vec4(0.98, 0.51, 0.25, 1.0),
        'hairRootsColor' : new vec4(1.0, 0.37, 0.24, 1.0),
        'mixEdge' : 0.0,
        'mixEdge' : 1.0,
        'diffuseLightColor' : new vec4(0.98, 0.51, 0.25, 1.0),
        'specularLightColor' : new vec4(1.0, 0.96, 0.84, 1.0),
        'litOffset' : -0.451,
        'litRotation' : 0.656,
    },
    custom_pass_info: {

        hairTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/alpha_straight.png'),
            ],
        },
        LitLookup: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/lit_default_light.jpg'),
            ],
        },
    }
};

export const HairGlowingOrangeMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
