import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.EmptyMaterial',
        'name': 'Empty Material',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/empty.ss_graph'),
};

export const EmptyMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
