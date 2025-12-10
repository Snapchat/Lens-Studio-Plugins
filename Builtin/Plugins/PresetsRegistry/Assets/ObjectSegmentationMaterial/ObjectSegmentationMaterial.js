import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.ObjectSegmentation',
        'name': 'Object Segmentation',
        'description': 'Segments objects using tracking texture with configurable radius and softness (defaults to hand segmentation)',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/object_seg.ss_graph'),
    custom_defines: [
        'ENABLE_ADVANCED'
    ],
    pass_info: {
        'radius' : 0.5,
        'softness' : 0.5,
    },
    custom_pass_info: {

        objectTrackingTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.objectTrackingTexture,
            params: [
                Editor.Assets.ObjectTrackingTextureType.Hand,
            ],
        },
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('Resources/Pattern.png'),
                2,
            ],
        },
    }
};

export const ObjectSegmentationMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
