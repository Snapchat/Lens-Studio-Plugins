import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.GLTFMaterial',
        'name': 'GLTF',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/gltf.ss_graph'),
    custom_defines: [
        'ENABLE_GLTF_LIGHTING',
        'ENABLE_TRANSMISSION'
    ],
    pass_info: {
        'metallicFactor': 0.0,
        'roughnessFactor': 0.0,
        'transmissionFactor': 0.0,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const GLTFMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
