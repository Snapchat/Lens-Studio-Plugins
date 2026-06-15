import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.CodeNodeMaterial',
        'name': 'Code Node Material',
        'description': 'Material driven by a Custom Code node that multiplies a base texture by a base color',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/codeNode.graphShader'),
    custom_pass_info: {
        baseTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/UV Reference.png'),
            ],
        },
    }
};

export const CodeNodeMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
