import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.GSMaterial',
        'name': 'Gaussian Splatting Material',
        'description': 'Material for Gaussian Splatting Visual component',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    pass_info: {
        'depthTest': true,
        'depthWrite': false,
        'blendMode': Editor.Assets.BlendMode.PremultipliedAlphaAuto, // AKA Normal
        'twoSided': true,
        'colorMask': new vec4b(true, true, true, true)
    },
    graph_path: import.meta.resolve('Resources/Gaussian Splatting.ss_graph'),
};

export const EmptyGSMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
