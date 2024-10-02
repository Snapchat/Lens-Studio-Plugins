import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.ImageMaterialPreset',
        'name': 'Image',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('../Resources/flat.ss_graph'),
    pass_info: {
        'depthWrite': false,
        'depthTest': false,
        'blendMode': Editor.Assets.BlendMode.PremultipliedAlphaAuto,
    },
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('Resources/Image.png'),
                0,
            ],
        }
    }
};

export const ImageMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
