import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.FaceInsetMaterialPreset',
        'name': 'Face Inset',
        'description': 'Provides a section of the face as a texture (such eyes eyes, mouth, etc.). Use with FaceInset component.',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('../Resources/flat.ss_graph'),
    custom_defines: [
        'ENABLE_BASE_TEX'
    ],
    pass_info: {
        depthTest: false,
        depthWrite: false,

        blendMode: Editor.Assets.BlendMode.PremultipliedAlphaAuto,
    },
    custom_pass_info: {
        opacityTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.opacityTexture,
            params: [
                import.meta.resolve('Resources/Mask.png'),
                1,
            ],
        },
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const FaceInsetMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
