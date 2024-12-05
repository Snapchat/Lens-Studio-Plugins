import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.EdgeDetectionMaterial',
        'name': 'Edge Detection',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/edge_detection.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'Outlinecolor': new vec4(0.99, 0.44, 0.81, 1.0),
        'width': 2.27,
        'contrast': -8.64,
        'brightness': 29.60,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const EdgeDetectionMaterialPreset = MaterialPresetFactory.createMaterialPreset(params, 'Post Effects');
