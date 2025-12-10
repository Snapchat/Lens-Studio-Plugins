import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.UnlitMaterial',
        'name': 'Unlit',
        'description': 'Basic unlit material for rendering without lighting calculations',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/unlit.ss_graph'),
};

export const UnlitMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
