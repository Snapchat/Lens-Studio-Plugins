/*!
 * glTF 2.0 TypeScript type definitions
 */

type integer = number

export const BYTE = 5120
export const UNSIGNED_BYTE = 5121
export const SHORT = 5122
export const UNSIGNED_SHORT = 5123
export const UNSIGNED_INT = 5125
export const FLOAT = 5126

type BYTE = typeof BYTE
type UNSIGNED_BYTE = typeof UNSIGNED_BYTE
type SHORT = typeof SHORT
type UNSIGNED_SHORT = typeof UNSIGNED_SHORT
type UNSIGNED_INT = typeof UNSIGNED_INT
type FLOAT = typeof FLOAT

export const SCALAR = "SCALAR"
export const VEC2 = "VEC2"
export const VEC3 = "VEC3"
export const VEC4 = "VEC4"
export const MAT2 = "MAT2"
export const MAT3 = "MAT3"
export const MAT4 = "MAT4"

type SCALAR = typeof SCALAR
type VEC2 = typeof VEC2
type VEC3 = typeof VEC3
type VEC4 = typeof VEC4
type MAT2 = typeof MAT2
type MAT3 = typeof MAT3
type MAT4 = typeof MAT4

export const POINTS = 0
export const LINES = 1
export const LINE_LOOP = 2
export const LINE_STRIP = 3
export const TRIANGLES = 4
export const TRIANGLE_STRIP = 5
export const TRIANGLE_FAN = 6

type POINTS = typeof POINTS
type LINES = typeof LINES
type LINE_LOOP = typeof LINE_LOOP
type LINE_STRIP = typeof LINE_STRIP
type TRIANGLES = typeof TRIANGLES
type TRIANGLE_STRIP = typeof TRIANGLE_STRIP
type TRIANGLE_FAN = typeof TRIANGLE_FAN

export const ARRAY_BUFFER = 34962
export const ELEMENT_ARRAY_BUFFER = 34963

type ARRAY_BUFFER = typeof ARRAY_BUFFER
type ELEMENT_ARRAY_BUFFER = typeof ELEMENT_ARRAY_BUFFER

export const NEAREST = 9728
export const LINEAR = 9729
export const NEAREST_MIPMAP_NEAREST = 9984
export const LINEAR_MIPMAP_NEAREST = 9985
export const NEAREST_MIPMAP_LINEAR = 9986
export const LINEAR_MIPMAP_LINEAR = 9987

type NEAREST = typeof NEAREST
type LINEAR = typeof LINEAR
type NEAREST_MIPMAP_NEAREST = typeof NEAREST_MIPMAP_NEAREST
type LINEAR_MIPMAP_NEAREST = typeof LINEAR_MIPMAP_NEAREST
type NEAREST_MIPMAP_LINEAR = typeof NEAREST_MIPMAP_LINEAR
type LINEAR_MIPMAP_LINEAR = typeof LINEAR_MIPMAP_LINEAR

export const REPEAT = 10497
export const CLAMP_TO_EDGE = 33071
export const MIRRORED_REPEAT = 33648

type REPEAT = typeof REPEAT
type CLAMP_TO_EDGE = typeof CLAMP_TO_EDGE
type MIRRORED_REPEAT = typeof MIRRORED_REPEAT

export const POSITION = "POSITION"
export const NORMAL = "NORMAL"
export const TANGENT = "TANGENT"
export const TEXCOORD_0 = "TEXCOORD_0"
export const TEXCOORD_1 = "TEXCOORD_1"
export const TEXCOORD_2 = "TEXCOORD_2"
export const TEXCOORD_3 = "TEXCOORD_3"
export const COLOR_0 = "COLOR_0"
export const JOINTS_0 = "JOINTS_0"
export const WEIGHTS_0 = "WEIGHTS_0"

type POSITION = typeof POSITION
type NORMAL = typeof NORMAL
type TANGENT = typeof TANGENT
type TEXCOORD_0 = typeof TEXCOORD_0
type TEXCOORD_1 = typeof TEXCOORD_1
type TEXCOORD_2 = typeof TEXCOORD_2
type TEXCOORD_3 = typeof TEXCOORD_3
type COLOR_0 = typeof COLOR_0
type JOINTS_0 = typeof JOINTS_0
type WEIGHTS_0 = typeof WEIGHTS_0

/** An identifier based on array index. */
export type glTFid = integer

/** Properties common to all glTF objects. */
interface GltfObject {
    /** JSON object with extension-specific objects. */
    extensions?: { [k: string]: unknown }
    /** Application-specific data. */
    extras?: { [k: string]: unknown } | {}
}

/** An object pointing to a buffer view containing the indices of deviating accessor values. The number of indices is equal to `accessor.sparse.count`. Indices **MUST** strictly increase. */
export interface AccessorSparseIndices extends GltfObject {
    /** The index of the buffer view with sparse indices. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined. The buffer view and the optional `byteOffset` **MUST** be aligned to the `componentType` byte length. */
    bufferView: glTFid
    /** The offset relative to the start of the buffer view in bytes. */
    byteOffset?: integer
    /** The indices data type. */
    componentType: UNSIGNED_BYTE | UNSIGNED_SHORT | UNSIGNED_INT | (integer & {})
}

/** An object pointing to a buffer view containing the deviating accessor values. The number of elements is equal to `accessor.sparse.count` times number of components. The elements have the same component type as the base accessor. The elements are tightly packed. Data **MUST** be aligned following the same rules as the base accessor. */
export interface AccessorSparseValues extends GltfObject {
    /** The index of the bufferView with sparse values. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined. */
    bufferView: glTFid
    /** The offset relative to the start of the bufferView in bytes. */
    byteOffset?: integer
}

/** Sparse storage of accessor values that deviate from their initialization value. */
export interface AccessorSparse extends GltfObject {
    /** Number of deviating accessor values stored in the sparse array. */
    count: integer
    /** An object pointing to a buffer view containing the deviating accessor values. */
    values: AccessorSparseValues
    /** An object pointing to a buffer view containing the indices of deviating accessor values. The number of indices is equal to `count`. Indices **MUST** strictly increase. */
    indices: AccessorSparseIndices
}

/** A typed view into a buffer view that contains raw binary data. */
export interface Accessor extends GltfObject {
    /** The index of the bufferView. */
    bufferView?: glTFid
    /** The offset relative to the start of the buffer view in bytes. */
    byteOffset?: integer
    /** The datatype of the accessor's components. */
    componentType: BYTE | UNSIGNED_BYTE | SHORT | UNSIGNED_SHORT | UNSIGNED_INT | FLOAT | (integer & {})
    /** Specifies whether integer data values are normalized before usage. */
    normalized?: boolean
    /** The number of elements referenced by this accessor. */
    count: integer
    /** Specifies if the accessor's elements are scalars, vectors, or matrices. */
    type: SCALAR | VEC2 | VEC3 | VEC4 | MAT2 | MAT3 | MAT4 | (string & {})
    /** Maximum value of each component in this accessor. */
    max?: number[]
    /** Minimum value of each component in this accessor. */
    min?: number[]
    /** Sparse storage of elements that deviate from their initialization value. */
    sparse?: AccessorSparse
    /**	The user-defined name of this object. */
    name?: string
}

/** The descriptor of the animated property. */
export interface AnimationChannelTarget extends GltfObject {
    /** The index of the node to animate. When undefined, the animated object **MAY** be defined by an extension. */
    node?: glTFid
    /** The name of the node's TRS property to animate, or the `"weights"` of the Morph Targets it instantiates. For the `"translation"` property, the values that are provided by the sampler are the translation along the X, Y, and Z axes. For the `"rotation"` property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the `"scale"` property, the values are the scaling factors along the X, Y, and Z axes. */
    path: "translation" | "rotation" | "scale" | "weights" | (string & {})
}

/** An animation channel combines an animation sampler with a target property being animated. */
export interface AnimationChannel {
    /** The index of a sampler in this animation used to compute the value for the target. */
    sampler: glTFid
    /** The descriptor of the animated property. */
    target: AnimationChannelTarget
}

/** An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm. */
export interface AnimationSampler extends GltfObject {
    /** The index of an accessor containing keyframe timestamps. */
    input: glTFid
    /** The index of an accessor, containing keyframe output values. */
    output: glTFid
    /** Interpolation algorithm. */
    interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE" | (string & {})
}

/** A keyframe animation. */
export interface Animation extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** An array of animation channels. An animation channel combines an animation sampler with a target property being animated. Different channels of the same animation **MUST NOT** have the same targets. */
    channels: AnimationChannel[]
    /** An array of animation samplers. An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm. */
    samplers: AnimationSampler[]
}

/** A buffer points to binary geometry, animation, or skins. */
export interface Buffer extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** The URI (or IRI) of the buffer. */
    uri?: string
    /** The length of the buffer in bytes. */
    byteLength: integer
}

/** A view into a buffer generally representing a subset of the buffer. */
export interface BufferView extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** The index of the buffer. */
    buffer: glTFid
    /** The offset into the buffer in bytes. */
    byteOffset?: integer
    /** The length of the bufferView in bytes. */
    byteLength: integer
    /** The stride, in bytes. */
    byteStride?: integer
    /** The hint representing the intended GPU buffer type to use with this buffer view. */
    target?: ARRAY_BUFFER | ELEMENT_ARRAY_BUFFER | (integer & {})
}

/** An orthographic camera containing properties to create an orthographic projection matrix. */
export interface CameraOrthographic extends GltfObject {
    /** The floating-point horizontal magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative. */
    xmag: number
    /** The floating-point vertical magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative. */
    ymag: number
    /** The floating-point distance to the near clipping plane. */
    znear: number
    /** The floating-point distance to the far clipping plane. This value **MUST NOT** be equal to zero. `zfar` **MUST** be greater than `znear`. */
    zfar: number
}

/** A perspective camera containing properties to create a perspective projection matrix. */
export interface CameraPerspective extends GltfObject {
    /** The floating-point aspect ratio of the field of view. */
    aspectRatio?: number
    /** The floating-point vertical field of view in radians. This value **SHOULD** be less than π. */
    yfov: number
    /** The floating-point distance to the near clipping plane. */
    znear: number
    /** The floating-point distance to the far clipping plane. */
    zfar?: number
}

/** A camera's projection. A node **MAY** reference a camera to apply a transform to place the camera in the scene. */
export interface Camera extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** Specifies if the camera uses a perspective or orthographic projection. */
    type: "perspective" | "orthographic" | (string & {})
    /** A perspective camera containing properties to create a perspective projection matrix. This property **MUST NOT** be defined when `orthographic` is defined. */
    perspective?: CameraPerspective
    /** An orthographic camera containing properties to create an orthographic projection matrix. This property **MUST NOT** be defined when `perspective` is defined. */
    orthographic?: CameraOrthographic
}

/** Image data used to create a texture. Image **MAY** be referenced by an URI (or IRI) or a buffer view index. */
export interface Image extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** The URI (or IRI) of the image. */
    uri?: string
    /** The image's media type. This field **MUST** be defined when `bufferView` is defined. */
    mimeType?: "image/jpeg" | "image/png" | (string & {})
    /** The index of the bufferView that contains the image. This field **MUST NOT** be defined when `uri` is defined. */
    bufferView?: glTFid
}

/** Reference to a texture. */
export interface TextureInfo extends GltfObject {
    /** The index of the texture. */
    index: glTFid
    /** The set index of texture's TEXCOORD attribute used for texture coordinate mapping. */
    texCoord?: integer
}

/** A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology. */
export interface MaterialPbrMetallicRoughness extends GltfObject {
    /** The factors for the base color of the material. */
    baseColorFactor?: [r: number, g: number, b: number, a: number]
    /** The base color texture. */
    baseColorTexture?: TextureInfo
    /** The factor for the metalness of the material. */
    metallicFactor?: number
    /** The factor for the roughness of the material. */
    roughnessFactor?: number
    /** The metallic-roughness texture. */
    metallicRoughnessTexture?: TextureInfo
}

/** The tangent space normal texture. The texture encodes RGB components with linear transfer function. Each texel represents the XYZ components of a normal vector in tangent space. The normal vectors use the convention +X is right and +Y is up. +Z points toward the viewer. If a fourth component (A) is present, it MUST be ignored. When undefined, the material does not have a tangent space normal texture. */
export interface MaterialNormalTextureInfo extends GltfObject {
    /** The index of the texture. */
    index?: integer
    /** The set index of texture's TEXCOORD attribute used for texture coordinate mapping. */
    texCoord?: integer
    /** The scalar parameter applied to each normal vector of the normal texture. */
    scale?: number
}

/** The occlusion texture. The occlusion values are linearly sampled from the R channel. Higher values indicate areas that receive full indirect lighting and lower values indicate no indirect lighting. If other channels are present (GBA), they MUST be ignored for occlusion calculations. When undefined, the material does not have an occlusion texture. */
export interface MaterialOcclusionTextureInfo extends GltfObject {
    /** The index of the texture. */
    index?: integer
    /** The set index of texture’s TEXCOORD attribute used for texture coordinate mapping. */
    texCoord?: integer
    /** A scalar multiplier controlling the amount of occlusion applied. */
    strength?: number
}

/** The material appearance of a primitive. */
export interface Material extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** A set of parameter values that are used to define the metallic-roughness material model from Physically Based Rendering (PBR) methodology. When undefined, all the default values of `pbrMetallicRoughness` **MUST** apply. */
    pbrMetallicRoughness?: MaterialPbrMetallicRoughness
    /** The tangent space normal texture. */
    normalTexture?: MaterialNormalTextureInfo
    /** The occlusion texture. */
    occlusionTexture?: MaterialOcclusionTextureInfo
    /** The emissive texture. */
    emissiveTexture?: TextureInfo
    /** The factors for the emissive color of the material. */
    emissiveFactor?: [r: number, g: number, b: number]
    /** The alpha rendering mode of the material. */
    alphaMode?: "OPAQUE" | "MASK" | "BLEND" | (string & {})
    /** The alpha cutoff value of the material. */
    alphaCutoff?: number
    /** Specifies whether the material is double sided. */
    doubleSided?: boolean
}

/** Geometry to be rendered with the given material. */
export interface MeshPrimitive extends GltfObject {
    /** A plain JSON object, where each key corresponds to a mesh attribute semantic and each value is the index of the accessor containing attribute's data. */
    attributes: { [k: string]: glTFid }
    /** The index of the accessor that contains the vertex indices. */
    indices?: glTFid
    /** The index of the material to apply to this primitive when rendering. */
    material?: glTFid
    /** The topology type of primitives to render. Default: TRIANGLES */
    mode?: POINTS | LINES | LINE_LOOP | LINE_STRIP | TRIANGLES | TRIANGLE_STRIP | TRIANGLE_FAN | (integer & {})
    /** An array of morph targets. */
    targets?: { [k: string]: glTFid }[]
}

/** A set of primitives to be rendered. Its global transform is defined by a node that references it. */
export interface Mesh extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** An array of primitives, each defining geometry to be rendered. */
    primitives: MeshPrimitive[]
    /** Array of weights to be applied to the morph targets. The number of array elements **MUST** match the number of morph targets. */
    weights?: number[]
}

/** A node in the node hierarchy. When the node contains `skin`, all `mesh.primitives` **MUST** contain `JOINTS_0` and `WEIGHTS_0` attributes. A node **MAY** have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), `matrix` **MUST NOT** be present. */
export interface Node extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** The indices of this node's children. */
    children?: glTFid[]
    /** A floating-point 4x4 transformation matrix stored in column-major order. */
    matrix?: [m00: number, m10: number, m20: number, m30: number, m01: number, m11: number, m21: number, m31: number, m02: number, m12: number, m22: number, m32: number, m03: number, m13: number, m23: number, m33: number]
    /** The node's translation along the x, y, and z axes. */
    translation?: [x: number, y: number, z: number]
    /** The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar. */
    rotation?: [x: number, y: number, z: number, w: number]
    /** The node's non-uniform scale, given as the scaling factors along the x, y, and z axes. */
    scale?: [x: number, y: number, z: number]
    /** The weights of the instantiated morph target. The number of array elements **MUST** match the number of morph targets of the referenced mesh. When defined, `mesh` **MUST** also be defined. */
    weights?: number[]
    /** The index of the camera referenced by this node. */
    camera?: glTFid
    /** The index of the mesh in this node. */
    mesh?: glTFid
    /** The index of the skin referenced by this node. */
    skin?: glTFid
}

/** Texture sampler properties for filtering and wrapping modes. */
export interface Sampler extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** Magnification filter. */
    magFilter?: NEAREST | LINEAR | (integer & {})
    /** Minification filter. */
    minFilter?: NEAREST | LINEAR | NEAREST_MIPMAP_NEAREST | LINEAR_MIPMAP_NEAREST | NEAREST_MIPMAP_LINEAR | LINEAR_MIPMAP_LINEAR | (integer & {})
    /** S (U) wrapping mode. */
    wrapS?: REPEAT | CLAMP_TO_EDGE | MIRRORED_REPEAT | (integer & {})
    /** T (V) wrapping mode. */
    wrapT?: REPEAT | CLAMP_TO_EDGE | MIRRORED_REPEAT | (integer & {})
}

/** Joints and matrices defining a skin. */
export interface Skin extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** The index of the accessor containing the floating-point 4x4 inverse-bind matrices. */
    inverseBindMatrices?: glTFid
    /** Indices of skeleton nodes, used as joints in this skin. */
    joints: glTFid[]
    /** The index of the node used as a skeleton root. */
    skeleton?: glTFid
}

/** A texture and its sampler. */
export interface Texture extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** The index of the image used by this texture. When undefined, an extension or other mechanism **SHOULD** supply an alternate texture source, otherwise behavior is undefined. */
    source?: glTFid
    /** The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering **SHOULD** be used. */
    sampler?: glTFid
}

/** The root nodes of a scene. */
export interface Scene extends GltfObject {
    /**	The user-defined name of this object. */
    name?: string
    /** The indices of each root node. */
    nodes?: glTFid[]
}

/** Metadata about the glTF asset. */
export interface Asset extends GltfObject {
    /** A copyright message suitable for display to credit the content creator. */
    copyright?: string
    /** Tool that generated this glTF model. Useful for debugging. */
    generator?: string
    /** The glTF version in the form of `<major>.<minor>` that this asset targets. */
    version: `${integer}.${integer}`
    /** The minimum glTF version in the form of `<major>.<minor>` that this asset targets. This property **MUST NOT** be greater than the asset version. */
    minVersion?: `${integer}.${integer}`
}

/** The root object for a glTF asset. */
export interface GltfAsset {
    /** Names of glTF extensions used in this asset. */
    extensionsUsed?: string[]
    /** Names of glTF extensions required to properly load this asset. */
    extensionsRequired?: string[]
    /** Metadata about the glTF asset. */
    asset: Asset
    /** The index of the default scene. */
    scene?: glTFid
    /** An array of scenes. */
    scenes?: Scene[]
    /** An array of accessors. */
    accessors?: Accessor[]
    /** An array of keyframe animations. */
    animations?: Animation[]
    /** An array of buffers. */
    buffers?: Buffer[]
    /** An array of bufferViews. */
    bufferViews?: BufferView[]
    /** An array of cameras. */
    cameras?: Camera[]
    /** An array of images. */
    images?: Image[]
    /** An array of materials. */
    materials?: Material[]
    /** An array of meshes. */
    meshes?: Mesh[]
    /** An array of nodes. */
    nodes?: Node[]
    /** An array of samplers. */
    samplers?: Sampler[]
    /** An array of skins. */
    skins?: Skin[]
    /** An array of textures. */
    textures?: Texture[]
}
