import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.NailsSegmentation',
        'name': 'Nails Segmentation',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/object_seg.ss_graph'),
    custom_defines: [
        'ENABLE_ADVANCED'
    ],
    pass_info: {

        'baseColor' : new vec4(0.95, 0.6, 1.0, 0.5),
        'radius' : 0.5,
        'softness' : 0.5,

    },
    custom_pass_info: {

        objectTrackingTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.objectTrackingTexture,
            params: [
               Editor.Assets.ObjectTrackingTextureType.Nails,
            ],
        },
    }
};

export const NailsSegmentationMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
