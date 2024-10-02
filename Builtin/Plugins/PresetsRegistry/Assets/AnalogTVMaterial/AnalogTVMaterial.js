import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.AnalogTV',
        'name': 'Analog TV',
        'description': 'Adds a visual effect similar to old VCRs with scanline, distortion, and noise.',
        'icon': import.meta.resolve('../Resources/Material.svg')
    },
    graph_path: import.meta.resolve('Resources/analog_tv.ss_graph'),
    pass_info: {
        'depthTest': false,
        'depthWrite': false,

        'noiseColor': new vec4(0.26, 0.26, 0.26, 1.0),
        'noiseIntensity': 0.36,
        'uvScale': new vec2(1.0, 0.5),
        'intensity': 2.0,

        'distortion': 0.1,
    },
    custom_pass_info: {
        normalTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.normalTexture,
            params: [
                import.meta.resolve('Resources/PE_Screen_Vector.png'),
            ]
        },
        scanlinesTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/PE_Scanline.png'),
            ],
        },
        screenTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
            params: [],
        },
    }
};

export const AnalogTVMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
