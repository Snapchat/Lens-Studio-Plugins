import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

const params = {
    'descriptor': {
        'id': 'Com.Snap.MaterialPreset.GPUParticlesMaterialPreset',
        'name': 'GPU Particles',
        'description': 'GPU-based particle system with configurable lifetime, alpha, velocity, rotation, size, and gravity properties',
        'icon': import.meta.resolve('../Resources/GPUParticles.svg')
    },
    graph_path: import.meta.resolve('../Resources/gpu_particles.ss_graph'),
    custom_defines: [
        'LIFETIMEMINMAX',
        'ENABLE_FACE_TEX',
        'ALPHAMINMAX',
        'BASETEXTURE',
        'MESHTYPE 0',
        'rotationSpace 0',
        'ALIGN_TO_CAMERA 0',
        'ALIGN_PARTICLES_TO_OPTION 0',
        'TRAILBEHAVIOR 0'
    ],
    pass_info: {
        'instanceCount': 100,
        'twoSided': true,
        'depthWrite': false,
        'blendMode': Editor.Assets.BlendMode.PremultipliedAlphaAuto,

        'externalSeed': 0.0,
        'spawnDuration': 0.0,

        'lifeTimeMinMax': new vec2(1.0, 2.0),

        'alphaMinStart': 1.0,
        'alphaMinEnd': 0.0,
        'alphaMaxStart': 1.0,
        'alphaMaxEnd': 0.5,

        'velocityMin': new vec3(-5.0, 5.0, -5.0),
        'velocityMax': new vec3(5.0, 15.0, 5.0),
        'velocityDrag': new vec3(1.0, 1.0, 1.0),

        'rotationRate': new vec2(0.0, 0.0),
        'rotationRandom': new vec2(-1.0, 1.0),

        'sizeStart': new vec2(1.0, 1.0),
        'sizeEnd': new vec2(0.0, 0.0),

        'gravity': - 9.8,
    },
    custom_pass_info: {
        mainTexture: {
            type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
            params: [
                import.meta.resolve('Resources/GPUParticlesTexture.png'),
                0,
            ],
        }
    }
};

export const GPUParticlesMaterialPreset = MaterialPresetFactory.createMaterialPreset(params);
