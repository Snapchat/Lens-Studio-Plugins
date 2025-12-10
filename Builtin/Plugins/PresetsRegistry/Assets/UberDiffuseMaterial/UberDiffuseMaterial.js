import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.UberDiffuseMaterial',
        'name': 'Uber Diffuse',
        'description': 'Diffuse material with comprehensive set of standard properties. This version has baseTex, normalTex, uv2Offset, uv3Offset properties',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/uber_diffuse.ss_graph'),
    pass_info: {
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
        materialParamsTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.materialParamsTexture,
            params: [
                import.meta.resolve('../Resources/MaterialParams.png'),
            ],
        },
    }
};

export const UberDiffuseMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
