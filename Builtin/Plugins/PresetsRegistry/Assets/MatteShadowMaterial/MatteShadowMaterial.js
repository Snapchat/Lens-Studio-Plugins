import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.MatteShadowMaterial',
        'name': 'Matte Shadow',
        'description': 'Renders only shadows cast on object surface, hiding the object itself',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/matte_shadow.ss_graph'),
    pass_info: {
        'blendMode': Editor.Assets.BlendMode.Multiply,
    }
};

export const MatteShadowMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
