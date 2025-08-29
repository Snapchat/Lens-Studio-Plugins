import * as fs from "LensStudio:FileSystem"
import * as gl from "./gltf.js"
import { assert, assertNever, verify } from "./assert.js"
import { BinaryStream } from "./stream.js"

// deserialization data types for document object model
type int = number
type float = number
type NodeValue = boolean | number | vec2 | vec3 | vec4 | mat3 | mat4 | string | Uint8Array | NodeGroup
type Property = [key: string, val: NodeValue]
type MapNode = Map<string, NodeValue>
type NodeGroup = MapNode | NodeValue[]

/** read a property from the stream */
function deserializeProperty(file: BinaryStream, blobs: Uint8Array, strings: string[]): Property | null {
    const type = file.readUint16()
    if (type === 0) return null // end of collection
    const key = strings.length > 0
        ? deserializeString(file, strings) // version 2
        : file.readString() // version 1
    switch (type) {
        case 1: // bool
            assert(file.readUint32() === 1)
            return [key, file.readBool()]
        case 2: // enum
            assert(file.readUint32() === 4)
            return [key, file.readUint32()]
        case 3: // float
            assert(file.readUint32() === 4)
            return [key, file.readFloat32()]
        case 4: // string (version 1)
            assert(file.readUint32() > 0)
            return [key, file.readString()]
        case 6: // int
            assert(file.readUint32() === 4)
            return [key, file.readInt32()]
        case 7: // vec2
            assert(file.readUint32() === 8)
            return [key, file.readVec2()]
        case 8: // vec3
            assert(file.readUint32() === 12)
            return [key, file.readVec3()]
        case 11: // mat4
            assert(file.readUint32() === 64)
            return [key, file.readMat4()]
        case 24: // string (version 2)
            assert(file.readUint32() === 4)
            return [key, deserializeString(file, strings)]
        case 15: // blob
            return [key, deserializeBlob(file, blobs)]
        case 14: // subnode
            assert(file.readUint32() === 0)
            return [key, deserializeGroup(file, blobs, strings)]
        default:
            assert(false, `unsupported value type ${type}`)
    }
}

/** read string id from the stream then lookup value from the string pool */
function deserializeString(file: BinaryStream, strings: string[]): string {
    const token = file.readUint32()
    return token === 0 ? "" : strings[token - 1]
}

/** read byte range from the stream then return a view into the binary section */
function deserializeBlob(file: BinaryStream, blobs: Uint8Array): Uint8Array {
    const length = file.readUint32()
    const offset = file.readUint32()
    return blobs.subarray(offset, offset + length)
}

/** read a child node from the stream */
function deserializeGroup(file: BinaryStream, blobs: Uint8Array, strings: string[]): NodeGroup {
    let obj: NodeGroup | null = null
    while (true) {
        const prop = deserializeProperty(file, blobs, strings)
        if (prop === null) break // end of subnode
        const [key, value] = prop
        if (key === "") { // node is array type
            obj ??= []
            assert(Array.isArray(obj))
            obj.push(value)
        } else { // node is map type
            obj ??= new Map<string, NodeValue>()
            assert(obj instanceof Map)
            obj.set(key, value)
        }
    }
    obj ??= [] // null nodes default to empty arrays
    return obj
}

/** read an entire model file from disk in generic structure */
function deserializeFile(file: BinaryStream): [version: number, dom: MapNode] {
    // first 4 bytes of the file is version number
    const version = file.readUint32()
    assert([1, 2].includes(version), "file version unsupported")

    // offset to binary section that byte ranges references
    const blobs = file.subarray(file.readUint32())

    // the header is 64 bytes of zeros
    file.position += 64

    // next section is an array of strings
    const strings = version >= 2 ? Array.from({ length: file.readUint32() }, () => file.readString()) : []

    // read object hierarchy
    const root = deserializeGroup(file, blobs, strings)
    assert(root instanceof Map)

    // done with file
    return [version, root]
}

/** access data in dom */
function getBoolean(node: MapNode, key: string): boolean {
    const value = verify(node.get(key), `${key} not found`)
    assert(typeof value === "boolean", `${key} value is not a bool`)
    return value
}

/** access data in dom */
function getNumber(node: MapNode, key: string): number {
    const value = verify(node.get(key), `${key} not found`)
    assert(typeof value === "number", `${key} value is not a float`)
    return value
}

/** access data in dom */
function getVec2(node: MapNode, key: string): vec2 {
    const value = verify(node.get(key), `${key} not found`)
    assert(value instanceof vec2, `${key} value is not a vec2`)
    return value
}

/** access data in dom */
function getVec3(node: MapNode, key: string): vec3 {
    const value = verify(node.get(key), `${key} not found`)
    assert(value instanceof vec3, `${key} value is not a vec3`)
    return value
}

/** access data in dom */
function getMat4(node: MapNode, key: string): mat4 {
    const value = verify(node.get(key), `${key} not found`)
    assert(value instanceof mat4, `${key} value is not a mat4`)
    return value
}

/** access data in dom */
function getString(node: MapNode, key: string): string {
    const value = verify(node.get(key), `${key} not found`)
    assert(typeof value === "string", `${key} value is not a string`)
    return value
}

/** access data in dom */
function getBlob(node: MapNode, key: string): Uint8Array {
    const val = verify(node.get(key), `${key} not found`)
    assert(val instanceof Uint8Array, `${key} is not a blob`)
    return val
}

/** access data in dom */
function getArray<T extends new (node: MapNode, ...args: any) => any>(
    node: MapNode,
    key: string,
    elementClass: T,
    ...args: ConstructorParameters<T> extends [MapNode, ...infer P] ? P : never
): InstanceType<T>[] {
    const val = verify(node.get(key), `${key} not found`)
    assert(Array.isArray(val), `${key} is not an array`)
    return val.map((elem) => {
        assert(elem instanceof Map, `${key} array element is not a map`)
        return new elementClass(elem, ...args)
    })
}

/** navigate to a child node in dom */
function getMap(node: MapNode, key: string): MapNode {
    const val = verify(node.get(key))
    assert(val instanceof Map, `${key} is not a node`)
    return val
}

/** lenscore data format */
namespace lc {
    /** primitive topology */
    export enum Topology {
        TRIANGLES = 0,
        TRIANGLE_STRIP = 1,
        TRIANGLE_FAN = 2,
        POINTS = 3,
        LINES = 4,
        LINE_STRIP = 5,
    }

    /** index buffer data type */
    export enum IndexType {
        NONE = 0,
        USHORT = 1,
        UINT = 2,
    }

    /** attribute types for vertex layout */
    export enum ComponentType {
        UNKNOWN = 0,
        BYTE = 1,
        UBYTE = 2,
        SHORT = 3,
        USHORT = 4,
        FLOAT = 5,
        HALF = 6,
    }

    /** returns the size in bytes of an index buffer element */
    export function indexSize(type: IndexType): int {
        switch (type) {
            case IndexType.NONE: return 0
            case IndexType.USHORT: return 2
            case IndexType.UINT: return 4
            default: assertNever(type)
        }
    }

    /** returns the number of bytes per component of an attribute */
    export function componentSize(type: ComponentType): int {
        switch (type) {
            case ComponentType.UNKNOWN: assert(false)
            case ComponentType.BYTE: return 1
            case ComponentType.UBYTE: return 1
            case ComponentType.SHORT: return 2
            case ComponentType.USHORT: return 2
            case ComponentType.FLOAT: return 4
            case ComponentType.HALF: return 2
            default: assertNever(type)
        }
    }

    /** predefined attribute types used by lenscore rendering */
    export enum Semantic {
        Position = "position",
        Normal = "normal",
        Tangent = "tangent",
        Bitangent = "bitangent",
        Color = "color",
        Texture0 = "texture0",
        Texture1 = "texture1",
        Texture2 = "texture2",
        Texture3 = "texture3",
        BoneData = "boneData",
        Joints = "joints", // synthetic for exporter
        Weights = "weights", // synthetic for exporter
    }
}

/** extract interleaved data into a compact buffer */
function arrayGather(buffer: Uint8Array, offset: number, length: number, stride: number): Uint8Array {
    const count = buffer.length / stride
    const output = new Uint8Array(count * length)
    const writer = new BinaryStream(output)
    for (let i = 0; i < count; i++) {
        const begin = i * stride + offset
        const end = begin + length
        writer.writeBytes(buffer.subarray(begin, end))
    }
    assert(writer.eof)
    return output
}

/** generic vertex attribute data */
class Attribute {
    readonly semantic: string
    readonly index: int
    readonly type: lc.ComponentType
    readonly componentCount: int
    readonly normalized: boolean

    buffer: Uint8Array

    constructor(node: MapNode, inputBuffer: Uint8Array, vertexStride: number) {
        this.semantic = getString(node, "semantic")
        this.index = getNumber(node, "index")
        this.type = getNumber(node, "type")
        this.componentCount = getNumber(node, "componentCount")
        this.normalized = getBoolean(node, "normalized")
        const offset = getNumber(node, "offset")

        switch (this.semantic) {
            case lc.Semantic.Texture0:
            case lc.Semantic.Texture1:
            case lc.Semantic.Texture2:
            case lc.Semantic.Texture3:
                // texture coordinates: flip vertically because gltf has upper-left origin
                const tvertexCount = inputBuffer.length / vertexStride
                assert(this.type === lc.ComponentType.FLOAT, "currently only float texcoords handled")
                const buffer = arrayGather(inputBuffer, offset, this.vertexSize, vertexStride)
                const stream = new BinaryStream(buffer)
                for (let i = 0; i < tvertexCount; i++) {
                    const voffset = i * this.vertexSize + lc.componentSize(this.type)
                    stream.position = voffset
                    const v = stream.readFloat32()
                    stream.position = voffset
                    stream.writeFloat32(1 - v)
                }
                this.buffer = buffer
                break

            case lc.Semantic.Joints:
            case lc.Semantic.Weights:
                // special handling: joints and weights use bone data as input buffer
                const vertexCount = inputBuffer.length / vertexStride
                const unpacked = new Uint8Array(vertexCount * this.vertexSize)
                const writer = new BinaryStream(unpacked)
                const reader = new BinaryStream(inputBuffer)
                for (let i = 0; i < vertexCount; i++) {
                    for (let j = 0; j < 4; j++) {
                        const boneData = reader.readFloat32()
                        if (this.semantic == lc.Semantic.Joints) {
                            writer.writeUint16(Math.floor(boneData)) // joints
                        } else {
                            writer.writeFloat32(Math.trunc(boneData)) // weights
                        }
                    }
                }
                assert(writer.eof)
                this.buffer = unpacked
                break

            default:
                // normal handling: extract attribute data from interleaved buffer
                this.buffer = arrayGather(inputBuffer, offset, this.vertexSize, vertexStride)
                break
        }
    }

    /** size in bytes of attribute data per vertex */
    get vertexSize(): number {
        return lc.componentSize(this.type) * this.componentCount
    }
}

/** generic vertex layout data */
class VertexLayout {
    readonly vertexCount: number
    readonly attributes: Attribute[]

    constructor(node: MapNode, interleavedBuffer: Uint8Array) {
        const vertexStride = getNumber(node, "vertexSize")
        this.vertexCount = interleavedBuffer.length / vertexStride
        this.attributes = getArray(node, "attributes", Attribute, interleavedBuffer, vertexStride)

        // bone data needs to be unpacked into two separate attributes
        const index = this.attributes.findIndex(a => a.semantic === lc.Semantic.BoneData)
        if (index !== -1) {
            const boneData = this.attributes[index]
            const joints = new Attribute(new Map<string, NodeValue>([
                ["semantic", lc.Semantic.Joints],
                ["index", boneData.index],
                ["type", lc.ComponentType.USHORT],
                ["componentCount", boneData.componentCount],
                ["normalized", false],
                ["offset", 0],
            ]), boneData.buffer, boneData.vertexSize)
            const weights = new Attribute(new Map<string, NodeValue>([
                ["semantic", lc.Semantic.Weights],
                ["index", boneData.index],
                ["type", lc.ComponentType.FLOAT],
                ["componentCount", boneData.componentCount],
                ["normalized", false],
                ["offset", 0],
            ]), boneData.buffer, boneData.vertexSize)
            this.attributes.splice(index, 1, joints, weights)
        }
    }

    /** find attribute in array */
    getBySemantic(semantic: lc.Semantic): Attribute {
        return verify(this.attributes.find(a => a.semantic === semantic))
    }
}

/** morph target represented as a sparse array of relative vertex positions and absolute vertex normals */
class BlendShape {
    readonly name: string
    readonly defaultWeight: float
    readonly vertexCount: int // highest vertex the index buffer can references
    readonly sparseCount: int // sparse vertex and sparse index array length
    readonly deltaMin: vec3
    readonly deltaMax: vec3

    positionBuffer: Uint8Array
    normalBuffer: Uint8Array
    indexBuffer: Uint8Array

    private static readonly PACKED_VERTEX_SIZE = 9
    private static readonly VEC3_SIZE = 12

    constructor(node: MapNode, basisNormalBuffer: Uint8Array) {
        this.name = getString(node, "name")
        this.defaultWeight = getNumber(node, "defaultWeight")
        this.vertexCount = getNumber(node, "vertexCount")
        this.deltaMin = getVec3(node, "deltaMin")
        this.deltaMax = getVec3(node, "deltaMax")

        // blend shapes might not have these buffers defined
        const packedBuffer = node.has("vertices2") ? getBlob(node, "vertices2") : new Uint8Array(0)
        const indexBuffer = node.has("indices") ? getBlob(node, "indices") : new Uint8Array(0)

        // sparse data should have 1 index for each vertex
        this.sparseCount = packedBuffer.length / BlendShape.PACKED_VERTEX_SIZE
        assert(indexBuffer.length / lc.indexSize(lc.IndexType.USHORT) === this.sparseCount)

        // expand packed vertex data into array data suitable for gltf file format
        const sparseIndexReader = new BinaryStream(indexBuffer)
        const interleavedReader = new BinaryStream(packedBuffer)
        const basisNormalReader = new BinaryStream(basisNormalBuffer)
        const positionBuffer = new Uint8Array(this.sparseCount * BlendShape.VEC3_SIZE)
        const normalBuffer = new Uint8Array(this.sparseCount * BlendShape.VEC3_SIZE)
        const positionWriter = new BinaryStream(positionBuffer)
        const normalWriter = new BinaryStream(normalBuffer)

        for (let i = 0; i < this.sparseCount; i++) {
            const index = sparseIndexReader.readUint16()
            basisNormalReader.position = index * BlendShape.VEC3_SIZE
            const basisNormal = basisNormalReader.readVec3()

            const position = interleavedReader.readVec3_xyz16f()
            const normal = interleavedReader.readVec3_x11y11z1()
            positionWriter.writeVec3(position)
            normalWriter.writeVec3(normal.sub(basisNormal))

            // calculate bounds because deltaMin and deltaMax are zero
            this.deltaMin.x = Math.min(this.deltaMin.x, position.x)
            this.deltaMin.y = Math.min(this.deltaMin.y, position.y)
            this.deltaMin.z = Math.min(this.deltaMin.z, position.z)
            this.deltaMax.x = Math.max(this.deltaMax.x, position.x)
            this.deltaMax.z = Math.max(this.deltaMax.z, position.z)
            this.deltaMax.y = Math.max(this.deltaMax.y, position.y)
        }

        this.positionBuffer = positionBuffer
        this.normalBuffer = normalBuffer
        this.indexBuffer = indexBuffer
    }
}

/** not yet suported */
class VertexCache {
    constructor(node: MapNode) {
    }
}

/** not yet supported */
class VertexCacheAabbKeyframes {
    constructor(node: MapNode) {
    }
}

/** axis-aligned bounding box for a bone */
class Aabb {
    readonly center: vec3
    readonly extent: vec3

    constructor(node: MapNode) {
        this.center = getVec3(node, "center")
        this.extent = getVec3(node, "extent")
    }
}

/** bone used for skinning */
class Bone {
    readonly name: string
    readonly invtm: mat4

    constructor(node: MapNode) {
        this.name = getString(node, "boneName")
        this.invtm = getMat4(node, "invtm")
    }
}

/** each render group can only use a limited number of bones */
class BoneRemap {
    readonly boneIndex: int

    constructor(node: MapNode) {
        this.boneIndex = getNumber(node, "boneIndex")
    }
}

/** segment of index buffer */
class IndexSegment {
    readonly offset: int
    readonly count: int
    readonly submesh: int

    constructor(node: MapNode) {
        this.offset = getNumber(node, "indexOffset")
        this.count = getNumber(node, "indexCount")
        this.submesh = getNumber(node, "indexSubMesh")
    }
}

/** group of primitives that can be drawn as a batch */
class RenderGroup {
    readonly indexSegments: IndexSegment[]
    readonly bonesRemapping: BoneRemap[]

    constructor(node: MapNode) {
        this.indexSegments = getArray(node, "indexSegment", IndexSegment)
        this.bonesRemapping = getArray(node, "bonesremaping", BoneRemap)
    }
}

/** part of a mesh that share the same material */
class SubMesh {
    constructor(node: MapNode) {
    }
}

/** deserialized and processed representation of mesh file */
class MeshAsset {
    readonly indexType: lc.IndexType
    readonly topology: lc.Topology
    readonly attributes: Attribute[]
    readonly blendShapes: BlendShape[]
    readonly vertexCache: VertexCache[]
    readonly vertexCacheAabbKeyframes: VertexCacheAabbKeyframes[]
    readonly bbMin: vec3
    readonly bbMax: vec3
    readonly texMin: vec2
    readonly texMax: vec2
    readonly skinBones: Bone[]
    readonly boneAabbs: Aabb[]
    readonly renderGroups: RenderGroup[]
    readonly submeshes: SubMesh[]

    readonly indexBuffer: Uint8Array
    readonly outputBuffer: Uint8Array

    constructor(version: number, root: MapNode) {
        this.indexType = getNumber(root, "indexType")
        this.topology = getNumber(root, "topology")

        // this is the main set the vertex and index data
        const vertexLayout = new VertexLayout(getMap(root, "vertexlayout"), getBlob(root, "vertices"))
        const indexBuffer = getBlob(root, "indices")

        // blend shapes have vertex data that is unpacked into larger buffers
        const normalBuffer = vertexLayout.getBySemantic(lc.Semantic.Normal).buffer
        this.blendShapes = getArray(root, "blendshapes", BlendShape, normalBuffer)

        // TODO: vertex caches are not yet supported
        if (version >= 2) {
            const vertexCacheVersion = getNumber(root, "vertexCacheVersion")
            this.vertexCache = getArray(root, "vertexCache", VertexCache)
            this.vertexCacheAabbKeyframes = getArray(root, "vertexCacheAabbKeyframes", VertexCacheAabbKeyframes)
        } else {
            this.vertexCache = []
            this.vertexCacheAabbKeyframes = []
        }

        this.bbMin = getVec3(root, "bbmin")
        this.bbMax = getVec3(root, "bbmax")
        this.texMin = version >= 2 ? getVec2(root, "texmin") : vec2.zero()
        this.texMax = version >= 2 ? getVec2(root, "texmax") : vec2.zero()
        this.skinBones = getArray(root, "skinbones", Bone)
        this.boneAabbs = version >= 2 ? getArray(root, "boneAabbs", Aabb) : []
        this.renderGroups = getArray(root, "rgroups", RenderGroup)
        this.submeshes = version >= 2 ? getArray(root, "submeshes", SubMesh) : []

        // calculate the size needed for final combined output buffer
        let outputLength = 0
        for (const attribute of vertexLayout.attributes) {
            const align = lc.componentSize(attribute.type)
            outputLength += (align - (outputLength % align)) % align
            outputLength += attribute.buffer.length
        }
        for (const shape of this.blendShapes) {
            let align = lc.componentSize(lc.ComponentType.FLOAT)
            outputLength += (align - (outputLength % align)) % align
            outputLength += shape.positionBuffer.length
            align = lc.componentSize(lc.ComponentType.FLOAT)
            outputLength += (align - (outputLength % align)) % align
            outputLength += shape.normalBuffer.length
            align = lc.indexSize(lc.IndexType.USHORT)
            outputLength += (align - (outputLength % align)) % align
            outputLength += shape.indexBuffer.length
        }
        {
            const align = lc.indexSize(this.indexType)
            outputLength += (align - (outputLength % align)) % align
            outputLength += indexBuffer.length
        }
        const outputBuffer = new Uint8Array(outputLength)

        // write all buffers into output buffer, updating buffer references
        const writer = new BinaryStream(outputBuffer)
        for (const attribute of vertexLayout.attributes) {
            const align = lc.componentSize(attribute.type)
            writer.position += (align - (writer.position % align)) % align
            attribute.buffer = writer.writeBytes(attribute.buffer)
        }
        for (const shape of this.blendShapes) {
            let align = lc.componentSize(lc.ComponentType.FLOAT)
            writer.position += (align - (writer.position % align)) % align
            shape.positionBuffer = writer.writeBytes(shape.positionBuffer)
            align = lc.componentSize(lc.ComponentType.FLOAT)
            writer.position += (align - (writer.position % align)) % align
            shape.normalBuffer = writer.writeBytes(shape.normalBuffer)
            align = lc.indexSize(lc.IndexType.USHORT)
            writer.position += (align - (writer.position % align)) % align
            shape.indexBuffer = writer.writeBytes(shape.indexBuffer)
        }
        {
            const align = lc.indexSize(this.indexType)
            writer.position += (align - (writer.position % align)) % align
            this.indexBuffer = writer.writeBytes(indexBuffer)
        }
        this.attributes = vertexLayout.attributes
        this.outputBuffer = outputBuffer
    }
}

/** convert lenscore topology to gltf topology */
function gltfTopology(topology: lc.Topology): int {
    switch (topology) {
        case lc.Topology.TRIANGLES: return gl.TRIANGLES
        case lc.Topology.TRIANGLE_STRIP: return gl.TRIANGLE_STRIP
        case lc.Topology.TRIANGLE_FAN: return gl.TRIANGLE_FAN
        case lc.Topology.POINTS: return gl.POINTS
        case lc.Topology.LINES: return gl.LINES
        case lc.Topology.LINE_STRIP: return gl.LINE_STRIP
        default: assertNever(topology)
    }
}

/** convert lenscore index type to gltf index type */
function gltfIndexType(indexType: lc.IndexType): int {
    switch (indexType) {
        case lc.IndexType.NONE: assert(false, "no indices not supported")
        case lc.IndexType.USHORT: return gl.UNSIGNED_SHORT
        case lc.IndexType.UINT: return gl.UNSIGNED_INT
        default: assertNever(indexType)
    }
}

/** convert lenscore attribute type to gltf component type */
function gltfComponentType(componentType: lc.ComponentType): int {
    switch (componentType) {
        case lc.ComponentType.UNKNOWN: assert(false, "unknown component type not supported")
        case lc.ComponentType.BYTE: return gl.BYTE
        case lc.ComponentType.UBYTE: return gl.UNSIGNED_BYTE
        case lc.ComponentType.SHORT: return gl.SHORT
        case lc.ComponentType.USHORT: return gl.UNSIGNED_SHORT
        case lc.ComponentType.FLOAT: return gl.FLOAT
        case lc.ComponentType.HALF: assert(false, "half data not supported")
        default: assertNever(componentType)
    }
}

/** convert lenscore component count to gltf accessor type */
function gltfAccessorType(componentCount: int): string {
    switch (componentCount) {
        case 1: return gl.SCALAR
        case 2: return gl.VEC2
        case 3: return gl.VEC3
        case 4: return gl.VEC4
        case 9: return gl.MAT3
        case 16: return gl.MAT4
        default: assert(false, `unexpected component count: ${componentCount}`)
    }
}

/** convert lenscore semantic to gltf semantic */
function gltfSemantic(semantic: string): string {
    switch (semantic) {
        case lc.Semantic.Position: return gl.POSITION
        case lc.Semantic.Normal: return gl.NORMAL
        case lc.Semantic.Tangent: return gl.TANGENT
        case lc.Semantic.Bitangent: assert(false) // should've been ignored
        case lc.Semantic.Color: return gl.COLOR_0
        case lc.Semantic.Texture0: return gl.TEXCOORD_0
        case lc.Semantic.Texture1: return gl.TEXCOORD_1
        case lc.Semantic.Texture2: return gl.TEXCOORD_2
        case lc.Semantic.Texture3: return gl.TEXCOORD_3
        case lc.Semantic.BoneData: assert(false) // unpacked into joints and weights
        case lc.Semantic.Joints: return gl.JOINTS_0 // integer portion of boneData
        case lc.Semantic.Weights: return gl.WEIGHTS_0 // fractional portion of boneData
        default: assert(false, `unknown semantic: ${semantic}`)
    }
}

/** create complete gltf json representation from mesh data */
function generateGltf(mesh: MeshAsset, assetName: string): gl.GltfAsset {
    let g: gl.GltfAsset = {
        asset: {
            generator: "Lens Studio - Export Mesh to GLB",
            version: "2.0"
        }
    }

    g.buffers = []
    g.buffers.push({
        byteLength: mesh.outputBuffer.byteLength
    })

    const bufferId = g.buffers.length - 1

    g.bufferViews = []
    g.accessors = []

    // vertex buffers
    const vertexAccessorIds: { [k: string]: number } = {}

    for (const attribute of mesh.attributes) {
        if (attribute.semantic === lc.Semantic.Bitangent) continue // not supported

        g.bufferViews.push({
            buffer: bufferId,
            byteLength: attribute.buffer.byteLength,
            byteOffset: attribute.buffer.byteOffset,
            byteStride: attribute.vertexSize,
            target: gl.ARRAY_BUFFER,
        })

        const bufferViewId = g.bufferViews.length - 1

        g.accessors.push({
            bufferView: bufferViewId,
            componentType: gltfComponentType(attribute.type),
            normalized: attribute.normalized,
            count: attribute.buffer.length / attribute.vertexSize,
            type: gltfAccessorType(attribute.componentCount),
        })

        const accessorId = g.accessors.length - 1

        // position requires bounding box
        if (attribute.semantic === lc.Semantic.Position) {
            g.accessors[accessorId].min = [mesh.bbMin.x, mesh.bbMin.y, mesh.bbMin.z]
            g.accessors[accessorId].max = [mesh.bbMax.x, mesh.bbMax.y, mesh.bbMax.z]
        }

        vertexAccessorIds[gltfSemantic(attribute.semantic)] = accessorId
    }

    // blend shapes
    const blendShapeAccessorIds: { [k: string]: number }[] = []
    const blendShapeWeights: number[] = []
    const blendShapeNames: string[] = []

    for (const shape of mesh.blendShapes) {
        if (!shape.positionBuffer.length || !shape.normalBuffer.length || !shape.indexBuffer.length) continue

        g.bufferViews.push({
            buffer: bufferId,
            byteLength: shape.positionBuffer.byteLength,
            byteOffset: shape.positionBuffer.byteOffset,
        })

        const deltaPositionBufferViewId = g.bufferViews.length - 1

        g.bufferViews.push({
            buffer: bufferId,
            byteLength: shape.normalBuffer.byteLength,
            byteOffset: shape.normalBuffer.byteOffset,
        })

        const deltaNormalBufferViewId = g.bufferViews.length - 1

        g.bufferViews.push({
            buffer: bufferId,
            byteLength: shape.indexBuffer.byteLength,
            byteOffset: shape.indexBuffer.byteOffset,
        })

        const sparseIndexBufferViewIds = g.bufferViews.length - 1

        g.accessors.push({
            componentType: gl.FLOAT,
            count: shape.vertexCount,
            type: gl.VEC3,
            sparse: {
                count: shape.sparseCount,
                indices: {
                    bufferView: sparseIndexBufferViewIds,
                    componentType: gl.UNSIGNED_SHORT,
                },
                values: {
                    bufferView: deltaPositionBufferViewId,
                }
            },
            min: [shape.deltaMin.x, shape.deltaMin.y, shape.deltaMin.z],
            max: [shape.deltaMax.x, shape.deltaMax.y, shape.deltaMax.z],
        })

        const deltaPositionAccessorId = g.accessors.length - 1

        g.accessors.push({
            componentType: gl.FLOAT,
            count: shape.vertexCount,
            type: gl.VEC3,
            sparse: {
                count: shape.sparseCount,
                indices: {
                    bufferView: sparseIndexBufferViewIds,
                    componentType: gl.UNSIGNED_SHORT,
                },
                values: {
                    bufferView: deltaNormalBufferViewId,
                }
            }
        })

        const deltaNormalAccessorId = g.accessors.length - 1

        blendShapeAccessorIds.push({
            [gl.POSITION]: deltaPositionAccessorId,
            [gl.NORMAL]: deltaNormalAccessorId,
        })

        blendShapeWeights.push(shape.defaultWeight)
        blendShapeNames.push(shape.name)
    }

    // index buffer
    {
        g.bufferViews.push({
            buffer: bufferId,
            byteLength: mesh.indexBuffer.byteLength,
            byteOffset: mesh.indexBuffer.byteOffset,
            target: gl.ELEMENT_ARRAY_BUFFER,
        })

        const bufferViewId = g.bufferViews.length - 1

        g.accessors.push({
            bufferView: bufferViewId,
            componentType: gltfIndexType(mesh.indexType),
            count: mesh.indexBuffer.length / lc.indexSize(mesh.indexType),
            type: gl.SCALAR,
        })
    }

    const indexAccessorId = g.accessors.length - 1

    g.meshes = []
    g.meshes.push({
        name: assetName,
        primitives: [
            {
                mode: gltfTopology(mesh.topology),
                attributes: vertexAccessorIds,
                indices: indexAccessorId,
            }
        ]
    })

    const meshId = g.meshes.length - 1

    if (blendShapeAccessorIds.length > 0) {
        g.meshes[meshId].primitives[0].targets = blendShapeAccessorIds
        g.meshes[meshId].weights = blendShapeWeights
        g.meshes[meshId].extras = { targetNames: blendShapeNames }
    }

    g.nodes = []
    g.nodes.push({
        name: assetName,
        mesh: meshId,
    })

    const nodeIds = g.nodes.map((_, i) => i)

    g.scenes = []
    g.scenes.push({
        name: "Scene",
        nodes: nodeIds
    })

    g.scene = 0

    return g
}

/** concatenate gltf json with binary data into one combined file */
function serializeGlb(pojo: gl.GltfAsset, binary: Uint8Array): Uint8Array {
    const json = JSON.stringify(pojo)

    const jsonPadding = (4 - (json.length % 4)) % 4
    const binaryPadding = (4 - (binary.length % 4)) % 4
    const fileSize = 12 + 8 + json.length + jsonPadding + 8 + binary.length + binaryPadding

    const file = new Uint8Array(fileSize)
    const writer = new BinaryStream(file)

    // file header
    writer.writeUint32(0x46546C67) // 'glTF'
    writer.writeUint32(2) // version 2.0
    writer.writeUint32(fileSize) // total length

    // json header
    writer.writeUint32(json.length + jsonPadding) // text length
    writer.writeUint32(0x4E4F534A) // 'JSON'

    // copy string into buffer manually
    for (let i = 0; i < json.length; i++) {
        writer.writeUint8(json.charCodeAt(i))
    }
    for (let i = 0; i < jsonPadding; i++) {
        writer.writeUint8(" ".charCodeAt(0))
    }

    // binary header
    writer.writeUint32(binary.length + binaryPadding) // binary length
    writer.writeUint32(0x004E4942) // 'BIN'

    // binary data
    writer.writeBytes(binary)
    for (let i = 0; i < binaryPadding; i++) {
        writer.writeUint8(0)
    }

    // the entire file is now in the buffer
    assert(writer.eof)
    return file
}

/** entry point into file conversion routine */
export function convertMeshFile(assetName: string, inputPath: Editor.Path, outputPath: Editor.Path): void {
    const bytes = fs.readBytes(inputPath)
    const file = new BinaryStream(bytes)
    const [version, dom] = deserializeFile(file)
    //debugDump(dom)
    const asset = new MeshAsset(version, dom)
    const pojo = generateGltf(asset, assetName)
    //debugDump(pojo)
    const glb = serializeGlb(pojo, asset.outputBuffer)
    fs.writeFile(outputPath, glb)
}

/** install json serialization support then dump mesh data as json */
function debugDump(obj: any): void {
    Reflect.set(vec2.prototype, "toJSON", function (this: vec2) {
        return { x: this.x, y: this.y }
    })
    Reflect.set(vec3.prototype, "toJSON", function (this: vec3) {
        return { x: this.x, y: this.y, z: this.z }
    })
    Reflect.set(vec4.prototype, "toJSON", function (this: vec4) {
        return { x: this.x, y: this.y, z: this.z, w: this.w }
    })
    Reflect.set(quat.prototype, "toJSON", function (this: quat) {
        return { x: this.x, y: this.y, z: this.z, w: this.w }
    })
    Reflect.set(mat2.prototype, "toJSON", function (this: mat2) {
        return { c0: this.column0, c1: this.column1 }
    })
    Reflect.set(mat3.prototype, "toJSON", function (this: mat3) {
        return { c0: this.column0, c1: this.column1, c2: this.column2 }
    })
    Reflect.set(mat4.prototype, "toJSON", function (this: mat4) {
        return { c0: this.column0, c1: this.column1, c2: this.column2, c3: this.column3 }
    })
    Reflect.set(Map.prototype, "toJSON", function (this: Map<any, any>) {
        return Object.fromEntries(this.entries())
    })
    console.debug(JSON.stringify(obj, (_, val) => {
        if (ArrayBuffer.isView(val)) return `ArrayBufferView(${val.byteLength})`
        if (!(val instanceof Map)) return val
    }, 2))
}
