import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.Text3DMaterialPreset',
        'name': 'Text3D',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/text_3d.ss_graph'),
    custom_defines: [
        'DROPLIST_FRONT_CAP_MODE 2',
        'DROPLIST_BACK_CAP_MODE 2',
        'DROPLIST_OUTER_EDGE_MODE 1',
        'DROPLIST_INNER_EDGE_MODE 1'
    ],
    pass_info: {
        frontCapStartingColor: new vec4(0.13, 1.0, 0.82, 1.0),

        backCapStartingColor: new vec4(0.99, 0.82, 0.1, 1.0),

        outerEdgeStartingColor: new vec4(0.13, 1.0, 0.82, 1.0),
        outerEdgeEndingColor: new vec4(0.99, 0.82, 0.1, 1.0),
        outerEdgeGradientRamp: 0.0,

        InnerEdgeStartingColor: new vec4(0.13, 1.0, 0.82, 1.0),
        InnerEdgeEndingColor: new vec4(0.99, 0.82, 0.1, 1.0),
        InnerEdgeGradientRamp: 0.0,

        blendMode: Editor.Assets.BlendMode.PremultipliedAlphaAuto,
    },
};

export const Text3DMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
