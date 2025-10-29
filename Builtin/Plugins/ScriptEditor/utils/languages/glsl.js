/**
 * CustomCodeNodeAsset GLSL language definition for Monaco Editor
 * Used for .customCode files
 */

export const glslLanguageConfig = {
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
    ],
    autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '(', close: ')' },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
        { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
    folding: {
        markers: {
            start: new RegExp('^\\s*//\\s*#?region\\b'),
            end: new RegExp('^\\s*//\\s*#?endregion\\b')
        }
    }
};

 export const glslKeywords = [
        // Preprocessor directives
        '#define', '#else', '#elif', '#endif', '#ifdef', '#ifndef', '#undef',
        // Language keywords
        'bool', 'break', 'bvec2', 'bvec3', 'bvec4', 'case', 'color', 'const', 'continue',
        'default', 'defined', 'discard', 'do', 'else', 'false', 'float', 'for', 'goto',
        'if', 'in', 'inout', 'int', 'ivec2', 'ivec3', 'ivec4', 'mat2', 'mat3', 'mat4',
        'out', 'return', 'static', 'struct', 'switch', 'true', 'typedef',
        'uint', 'unsigned', 'vec2', 'vec3', 'vec4', 'void', 'while',
        // Input/Output types
        'global_float', 'global_vec2', 'global_vec3', 'global_vec4', 'global_mat2', 'global_mat3', 'global_mat4',
        'input_int', 'input_bool', 'input_float', 'input_float_array', 'input_vec2', 'input_vec3', 'input_vec4',
        'input_color3', 'input_color4', 'input_mat2', 'input_mat3', 'input_mat4',
        'input_texture_2d', 'input_texture_2d_array', 'input_texture_3d', 'input_texture_cube',
        'input_curve', 'input_group', 'input_checkbox', 'input_droplist',
        'output_float', 'output_vec2', 'output_vec3', 'output_vec4', 'output_mat2', 'output_mat3', 'output_mat4'
    ];

export const glslLanguageDefinition = {
    defaultToken: '',
    tokenPostfix: '.glsl',

    keywords: glslKeywords,

    operators: [
        '=', '>', '<', '!', '~', '?', ':',
        '==', '<=', '>=', '!=', '&&', '||', '++', '--',
        '+', '-', '*', '/', '&', '|', '^', '%', '<<',
        '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
        '^=', '%=', '<<=', '>>=', '>>>='
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
        root: [
            // identifiers and keywords
            [/[a-zA-Z_$][\w$]*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'identifier'
                }
            }],

            // whitespace
            { include: '@whitespace' },

            // delimiters and operators
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
                cases: {
                    '@operators': 'operator',
                    '@default': ''
                }
            }],

            // numbers
            [/\d*\.\d+([eE][\-+]?\d+)?[fF]?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            // delimiter: after number because of .\d floats
            [/[;,.]/, 'delimiter'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
            [/"/, 'string', '@string'],

            // characters
            [/'[^\\']'/, 'string'],
            [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
            [/'/, 'string.invalid']
        ],

        whitespace: [
            [/[ \t\r\n]+/, ''],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],

        comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],

        string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, 'string', '@pop']
        ],
    },
};

// Standard GLSL functions
export const glslBuiltInFunctions = [
    'abs', 'acos', 'asin', 'all', 'any', 'atan', 'ceil', 'clamp', 'cos', 'cosh',
    'cross', 'dFdx', 'dFdy', 'degrees', 'determinant', 'distance', 'dot', 'exp',
    'equal', 'exp2', 'faceforward', 'floor', 'fract', 'frexp', 'fwidth',
    'greaterThan', 'greaterThanEqual', 'inversesqrt', 'isinf', 'isnan', 'ldexp',
    'lessThan', 'lessThanEqual', 'length', 'log', 'log10', 'log2', 'max', 'min',
    'mix', 'mod', 'modf', 'mul', 'noise', 'normalize', 'notEqual', 'pow',
    'radians', 'reflect', 'refract', 'round', 'sign', 'sin', 'sinh', 'smoothstep',
    'sqrt', 'step', 'tan', 'tanh', 'transpose', 'trunc'
];

// Texture functions
export const glslTextureFunctions = [
    'arraySize', 'evaluate', 'pixelSize', 'sample', 'sampleLod', 'sampleMirrored',
    'sampleRepeat', 'textureSize', 'sampleDepthScreenSpace', 'sampleDepthViewSpace',
    'sampleDepthViewSpacePositive', 'sampleDepthViewSpaceNormalized'
];

// Custom utility functions
export const glslUtilityFunctions = [
    'getNodeID', 'getRandomFloat', 'getRandomVec2', 'getRandomVec3', 'getRandomVec4',
    'linearToSrgb', 'linearToneMapping', 'matrixFromRotatedAxis', 'pack16Bit',
    'pack24Bit', 'pack32Bit', 'pi', 'remap', 'sampleDiffuseEnvironment',
    'sampleSpecularEnvironment', 'setPreviewColor', 'srgbToLinear', 'unpack16Bit',
    'unpack24Bit', 'unpack32Bit'
];

// Surface/Camera/Matrix getter functions
export const glslGetterFunctions = [
    // AABB
    'getAABBMaxLocal', 'getAABBMaxWorld', 'getAABBMinLocal', 'getAABBMinWorld',
    // Camera
    'getCameraAspect', 'getCameraFar', 'getCameraFOV', 'getCameraForward',
    'getCameraNear', 'getCameraPosition', 'getCameraRight', 'getCameraUp',
    'getStereoViewIndex',
    // Custom Vertex
    'getCustomVertexAttribute',
    // Hair
    'getHairStrandID', 'getHairDebugColor',
    // Instance
    'getInstanceCount', 'getInstanceID', 'getInstanceRatio',
    // Surface Position
    'getSurfacePosition', 'getSurfacePositionObjectSpace', 'getSurfacePositionWorldSpace',
    'getSurfacePositionCameraSpace', 'getSurfacePositionScreenSpace',
    // Surface Normal
    'getSurfaceNormal', 'getSurfaceNormalFaceted', 'getSurfaceNormalObjectSpace',
    'getSurfaceNormalWorldSpace', 'getSurfaceNormalCameraSpace',
    // Surface Tangent
    'getSurfaceTangent', 'getSurfaceTangentObjectSpace', 'getSurfaceTangentWorldSpace',
    'getSurfaceTangentCameraSpace',
    // Surface Bitangent
    'getSurfaceBitangent', 'getSurfaceBitangentObjectSpace', 'getSurfaceBitangentWorldSpace',
    'getSurfaceBitangentCameraSpace',
    // Surface UV
    'getSurfaceUVCoord0', 'getSurfaceUVCoord1', 'getSurfaceUVCoord2', 'getSurfaceUVCoord3',
    'getSurfaceUVCoord4', 'getSurfaceUVCoord5', 'getSurfaceUVCoord6', 'getSurfaceUVCoord7',
    // Surface Color
    'getSurfaceColor',
    // Time
    'getTimeElapsed', 'getTimeDelta',
    // Screen
    'getScreenUVCoord',
    // Matrices
    'getMatrixProjectionViewWorldInverse', 'getMatrixProjectionViewWorld',
    'getMatrixProjectionViewInverse', 'getMatrixProjectionView',
    'getMatrixViewWorldInverse', 'getMatrixViewWorld',
    'getMatrixWorldInverse', 'getMatrixCamera', 'getMatrixWorld', 'getMatrixPrevFrameWorld',
    'getMatrixViewInverse', 'getMatrixView', 'getMatrixProjectionInverse', 'getMatrixProjection',
    // View
    'getViewVector',
    // Skinning
    'getBoneWeights', 'getBoneIndices', 'getSkinMatrix',
    // Lighting
    'getAmbientLightCount', 'getAmbientLightColor', 'getAmbientLightIntensity',
    'getDirectionalLightCount', 'getDirectionalLightDirection', 'getDirectionalLightColor',
    'getDirectionalLightIntensity',
    'getPointLightCount', 'getPointLightPosition', 'getPointLightColor', 'getPointLightIntensity',
    // Depth
    'getViewSpacePositionFromDepth', 'getWorldSpacePositionFromDepth'
];

// VFX Particle getter functions
export const glslVFXGetterFunctions = [
    'getParticleAge', 'getParticleAgeRatio', 'getParticleBurstRate', 'getParticleColor',
    'getParticleColorMax', 'getParticleColorMin', 'getParticleCount', 'getParticleDelay',
    'getParticleForce', 'getParticleIndex', 'getParticleIndexRatio', 'getParticleLife',
    'getParticleMaxLife', 'getParticleMass', 'getParticleMassMax', 'getParticleMassMin',
    'getParticleMatrix', 'getParticlePosition', 'getParticlePositionMax', 'getParticlePositionMin',
    'getParticleRandomFloat', 'getParticleRandomVec2', 'getParticleRandomVec3', 'getParticleRandomVec4',
    'getParticleSeed', 'getParticleSize', 'getParticleSizeMax', 'getParticleSizeMin',
    'getParticleSpawned', 'getParticleSpawnRate', 'getParticleVelocity', 'getParticleVelocityMax',
    'getParticleVelocityMin'
];

// VFX Particle setter functions
export const glslVFXSetterFunctions = [
    'killParticle', 'setParticlePosition', 'setParticleVelocity', 'setParticleLife',
    'setParticleForce', 'setParticleMass', 'setParticleColor', 'setParticleSize', 'setParticleMatrix'
];

// VFX Vertex output setters
export const glslVFXVertexOutputFunctions = [
    'setVertexPosition', 'setVertexNormal', 'setVertexTangent'
];

// VFX Pixel output setters
export const glslVFXPixelOutputFunctions = [
    'setPixelColor0', 'setPixelColor1', 'setPixelColor2', 'setPixelColor3', 'setPixelDepth'
];
