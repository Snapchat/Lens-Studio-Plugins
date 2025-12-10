import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.SimplePBRMaterial',
        'name': 'Simple PBR',
        'description': 'Physically Based Rendering material. This version has baseTex, baseColor, metallic, roughness properties',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/simple_pbr.ss_graph'),
    pass_info: {
        'metallic': 0.0,
        'roughness': 0.0,
    },
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('../Resources/Base.png'),
                2,
            ],
        }
    }
};

export const SimplePBRMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
