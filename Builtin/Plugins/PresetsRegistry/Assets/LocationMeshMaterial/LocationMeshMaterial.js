import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.LocationMeshMaterial',
        'name': 'Location Material',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/location_material.ss_graph')
};

export const LocationMeshMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
