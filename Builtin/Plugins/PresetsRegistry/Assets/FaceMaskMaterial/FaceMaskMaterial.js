import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.FaceMaskMaterialPreset',
        'name': 'Face Mask',
        'description': 'Default material for FaceMaskVisual component',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('../Resources/flat.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'blendMode': Editor.Assets.BlendMode.PremultipliedAlphaAuto,
    },
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('Resources/FaceMask.png'),
                0,
            ],
        },
        opacityTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.opacityTexture,
            params: [
                import.meta.resolve('Resources/FaceMaskOpacity.jpg'),
                0,
            ],
        }
    }
};

export const FaceMaskMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
