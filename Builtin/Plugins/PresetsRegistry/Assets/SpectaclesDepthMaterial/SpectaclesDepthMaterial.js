import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.SpectaclesDepthMaterialPreset',
        'name': 'Spectacles Depth',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/spectacles_depth.ss_graph'),
    custom_defines: [
        'ENABLE_BASE_TEX'
    ],
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.depthTexture,
        },
    }
};

export const SpectaclesDepthMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
