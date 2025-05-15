import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.GPUParticlesTrailsMaterialPreset',
        'name': 'GPU Particles Trails',
        'description': '',
        'icon': import.meta.resolve('../Resources/GPUParticles.svg')
    },
    graph_path: import.meta.resolve('../Resources/gpu_particles.ss_graph'),
    custom_defines: [
        'LIFETIMEMINMAX',
        'BASETEXTURE',
        'COLORRAMP',
        'NOISE',
        'TRAILS',
        'TRAILTEXTURE',
        'MESHTYPE 0',
        'rotationSpace 0',
        'ALIGN_TO_CAMERA 0',
        'ALIGN_PARTICLES_TO_OPTION 0',
        'TRAILBEHAVIOR 0'
    ],
    pass_info: {
        'instanceCount': 50,
        'twoSided': true,
        'depthWrite': false,
        'depthTest': false,
        'blendMode': Editor.Assets.BlendMode.PremultipliedAlphaAuto,

        'externalSeed': 0.0,
        'spawnDuration': 0.0,

        'lifeTimeMinMax': new vec2(2.0, 4.0),

        'alphaStart': 1.0,
        'alphaEnd': 1.0,

        'noiseMult': new vec3(3.0, 0.0, 3.0),
        'noiseFrequency': new vec3(3.0, 0.0, 3.0),

        'velocityMin': new vec3(-2.0, -10.0, -2.0),
        'velocityMax': new vec3(2.0, 10.0, 2.0),
        'velocityDrag': new vec3(1.0, 1.0, 1.0),

        'rotationRate': new vec2(-2.0, 2.0),
        'rotationRandom': new vec2(-3.14, 3.14),

        'sizeStart': new vec2(0.0, 0.0),
        'sizeEnd': new vec2(5.0, 5.0),

        'gravity': 0.0,

        'trailLength': 2.0,
        'trailWidth': 0.5,
        'trailTaper': new vec2(1.0, 0.0),
        'trailFadeStartEnd': new vec2(0.2, 0.2)
    },
    custom_pass_info: {
        mainTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/GPUParticlesTrailsBaseTexure.png'),
                0,
            ],
        },
        colorRampTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/GPUParticlesTrailsColorRamp.png'),
                0,
            ],
        },
        trailTex: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.texture,
            params: [
                import.meta.resolve('Resources/GPUParticlesTrailsTrailTexture.png'),
                0,
            ],
        }
    }
};

export const GPUParticlesTrailsMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
