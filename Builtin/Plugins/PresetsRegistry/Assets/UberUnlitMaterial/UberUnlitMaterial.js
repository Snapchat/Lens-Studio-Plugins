import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.UberUnlitMaterial',
        'name': 'Uber Unlit',
        'description': '',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/uber_unlit.ss_graph'),
    pass_info: {
        'uv2Offset': new vec2(0.0, 0.0),
        'uv3Offset': new vec2(0.0, 0.0),
    },
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('../Resources/Base.png'),
                2,
            ],
        }
    }
};

export const UberUnlitMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
