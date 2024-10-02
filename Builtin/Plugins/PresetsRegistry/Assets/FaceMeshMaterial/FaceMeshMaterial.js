import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.FaceMeshMaterialPreset',
        'name': 'Face Mesh',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/face_mesh.ss_graph'),
    custom_defines: [
        'ENABLE_SMOOTH_EDGES',
        'ENABLE_FACE_TEX'
    ],
    pass_info: {
        'blendMode': Editor.Assets.BlendMode.PremultipliedAlphaAuto,
        'metallic': 0.0,
        'roughness': 0.0,
        'radius': 0.75,
        'softness': 0.75,
    },
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('../Resources/Base.png'),
                0,
            ],
        },
        maskTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/FaceMeshTexture.jpg'),
            ],
        },
    }
};

export const FaceMeshMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
