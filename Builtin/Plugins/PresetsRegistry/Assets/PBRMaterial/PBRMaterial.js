import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.PBRMaterial',
        'name': 'PBR',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/pbr.ss_graph'),
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

export const PBRMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
