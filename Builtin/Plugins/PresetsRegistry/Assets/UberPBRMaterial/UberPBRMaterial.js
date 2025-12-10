import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.UberPBRMaterial',
        'name': 'Uber PBR',
        'description': 'Physically Based Rendering material with comprehensive set of configurable properties',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/uber_pbr.ss_graph'),
    pass_info: {
        'metallic': 0.0,
        'roughness': 0.0,
        'uv2Offset': new vec2(0.0, 0.0),
        'uv3Offset': new vec2(0.0, 0.0),
    },
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('../Resources/Base.png'),
                2,
            ],
        },
        normalTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.normalTexture,
            params: [
                import.meta.resolve('../Resources/Normal.png'),
            ],
        },
    }
};

export const UberPBRMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
