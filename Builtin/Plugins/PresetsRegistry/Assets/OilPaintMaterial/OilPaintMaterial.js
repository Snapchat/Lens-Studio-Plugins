import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.OilPaintMaterial',
        'name': 'Oil Paint',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/oil_paint.ss_graph'),
    custom_defines: [
        'COLOR_MODE 0'
    ],
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'offset': 0.5,
    },
    custom_pass_info: {
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const OilPaintMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
