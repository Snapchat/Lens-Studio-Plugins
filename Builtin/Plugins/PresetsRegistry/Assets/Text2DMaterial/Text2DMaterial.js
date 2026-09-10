import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.Text2DMaterialPreset',
        'name': 'Text2D',
        'description': 'Default material for the Text component',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/text_2d.graphShader'),
    pass_info: {
        // Mirror the Text component's own render-state defaults so this is a drop-in.
        blendMode: Editor.Assets.BlendMode.PremultipliedAlphaAuto, // "Normal"
        depthTest: false,
        twoSided: false,
    },
};

export const Text2DMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
