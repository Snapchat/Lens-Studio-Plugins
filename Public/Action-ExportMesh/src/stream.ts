/**
 * A stream reader and writer for binary data backed by an ArrayBuffer.
 */
export class BinaryStream {
    private readonly data: DataView
    private pos: number = 0

    constructor(array: Uint8Array) {
        this.data = new DataView(array.buffer, array.byteOffset, array.byteLength)
    }

    /** current stream position in bytes from start of stream */
    get position(): number {
        return this.pos
    }

    set position(value: number) {
        if (value < 0 || value > this.length) throw new RangeError()
        this.pos = value
    }

    /** length of stream in bytes */
    get length(): number {
        return this.data.byteLength
    }

    /** returns true if the stream position is at the end of the buffer */
    get eof(): boolean {
        return this.position === this.length
    }

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: Uint8Array, offset?: number): void {
        new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength).set(array, offset)
    }

    /**
     * Gets a new Uint8Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Uint8Array {
        begin ??= 0
        end ??= this.length
        if (end < 0) end += this.length
        if (begin < 0 || begin > this.length) throw new RangeError()
        if (end < begin || end > this.length) throw new RangeError()
        return new Uint8Array(this.data.buffer, this.data.byteOffset + begin, end - begin)
    }

    /** read byte array from stream */
    readBytes(length: number): Uint8Array {
        const value = this.subarray(this.pos, this.pos + length)
        this.pos += length
        return value
    }

    /** read next 1 byte as unsigned int */
    readUint8(): number {
        const value = this.data.getUint8(this.pos)
        this.pos++
        return value
    }

    /** read next 1 byte as signed int */
    readInt8(): number {
        const value = this.data.getInt8(this.pos)
        this.pos++
        return value
    }

    /** read next 2 bytes as unsigned int */
    readUint16(): number {
        const value = this.data.getUint16(this.pos, true)
        this.pos += 2
        return value
    }

    /** read next 2 bytes as signed int */
    readInt16(): number {
        const value = this.data.getInt16(this.pos, true)
        this.pos += 2
        return value
    }

    /** read next 4 bytes as unsigned int */
    readUint32(): number {
        const value = this.data.getUint32(this.pos, true)
        this.pos += 4
        return value
    }

    /** read next 4 bytes as signed int */
    readInt32(): number {
        const value = this.data.getInt32(this.pos, true)
        this.pos += 4
        return value
    }

    /** read next 2 bytes as half */
    readFloat16(): number {
        const value = this.data.getUint16(this.pos, true)
        this.pos += 2
        return halfToFloat(value)
    }

    /** read next 4 bytes as float */
    readFloat32(): number {
        const value = this.data.getFloat32(this.pos, true)
        this.pos += 4
        return value
    }

    /** read next 8 bytes as double */
    readFloat64(): number {
        const value = this.data.getFloat64(this.pos, true)
        this.pos += 8
        return value
    }

    /** read next 1 byte as bool */
    readBool(): boolean {
        return this.readUint8() !== 0
    }

    /** read next 8 bytes as vec2 */
    readVec2(): vec2 {
        return new vec2(this.readFloat32(), this.readFloat32())
    }

    /** read next 12 bytes as vec3 */
    readVec3(): vec3 {
        return new vec3(this.readFloat32(), this.readFloat32(), this.readFloat32())
    }

    /** read next 6 bytes as half3 and expand to vec3 */
    readVec3_xyz16f(): vec3 {
        return new vec3(this.readFloat16(), this.readFloat16(), this.readFloat16())
    }

    /** read next 3 bytes as x11y11z1 and unpack as unit vector */
    readVec3_x11y11z1(): vec3 {
        const packed = this.readUint8() | (this.readUint8() << 8) | (this.readUint8() << 16)
        const nx = (packed & 0x7FF) / 2047 * 2 - 1
        const ny = ((packed >> 11) & 0x7FF) / 2047 * 2 - 1
        const dot = nx * nx + ny * ny
        if (dot >= 1) {
            const mag = Math.sqrt(dot)
            return new vec3(nx / mag, ny / mag, 0)
        } else {
            const sign = (packed >> 22) & 0x1
            const nz = Math.sqrt(1 - dot) * (sign ? -1 : 1)
            return new vec3(nx, ny, nz)
        }
    }

    /** read next 16 bytes as vec4 */
    readVec4(): vec4 {
        return new vec4(this.readFloat32(), this.readFloat32(), this.readFloat32(), this.readFloat32())
    }

    /** read next 16 bytes as quat in xyzw order */
    readQuat(): quat {
        const v = this.readVec4()
        return new quat(v.w, v.x, v.y, v.z)
    }

    /** read next 16 bytes as 2x2 matrix in column-major order */
    readMat2(): mat2 {
        const m = new mat2()
        m.column0 = this.readVec2()
        m.column1 = this.readVec2()
        return m
    }

    /** read next 36 bytes as 3x3 matrix in column-major order */
    readMat3(): mat3 {
        const m = new mat3()
        m.column0 = this.readVec3()
        m.column1 = this.readVec3()
        m.column2 = this.readVec3()
        return m
    }

    /** read next 64 bytes as 4x4 matrix in column-major order */
    readMat4(): mat4 {
        return mat4.fromColumns(this.readVec4(), this.readVec4(), this.readVec4(), this.readVec4())
    }

    /** read size-prefixed byte array as ascii string */
    readString(): string {
        const size = this.readUint32()
        let str = ""
        for (let i = 0; i < size; i++) {
            str += String.fromCharCode(this.readUint8())
        }
        return str
    }

    /** write byte array into stream and return a buffer view of the written data */
    writeBytes(value: Uint8Array): Uint8Array {
        const offset = this.pos
        this.set(value, this.pos)
        this.pos += value.length
        return new Uint8Array(this.data.buffer, this.data.byteOffset + offset, value.length)
    }

    /** write value as unsigned byte to next 1 byte */
    writeUint8(value: number): void {
        this.data.setUint8(this.pos, value)
        this.pos++
    }

    /** write value as signed byte to next 1 byte */
    writeInt8(value: number): void {
        this.data.setInt8(this.pos, value)
        this.pos++
    }

    /** write value as unsigned short to next 2 bytes */
    writeUint16(value: number): void {
        this.data.setUint16(this.pos, value, true)
        this.pos += 2
    }

    /** write value as signed short to next 2 bytes */
    writeInt16(value: number): void {
        this.data.setInt16(this.pos, value, true)
        this.pos += 2
    }

    /** write value as unsigned int to next 4 bytes */
    writeUint32(value: number): void {
        this.data.setUint32(this.pos, value, true)
        this.pos += 4
    }

    /** write value as signed int to next 4 bytes */
    writeInt32(value: number): void {
        this.data.setInt32(this.pos, value, true)
        this.pos += 4
    }

    /** write value as float to nexzt 4 bytes */
    writeFloat32(value: number): void {
        this.data.setFloat32(this.pos, value, true)
        this.pos += 4
    }

    /** write value as double to next 8 bytes */
    writeFloat64(value: number): void {
        this.data.setFloat64(this.pos, value, true)
        this.pos += 8
    }

    /** write bool to next 1 byte */
    writeBool(value: boolean): void {
        this.writeUint8(value ? 1 : 0)
    }

    /** write vec2 to next 8 bytes */
    writeVec2(value: vec2): void {
        this.writeFloat32(value.x)
        this.writeFloat32(value.y)
    }

    /** write vec3 to next 12 bytes */
    writeVec3(value: vec3): void {
        this.writeFloat32(value.x)
        this.writeFloat32(value.y)
        this.writeFloat32(value.z)
    }

    /** write vec4 to next 16 bytes */
    writeVec4(value: vec4): void {
        this.writeFloat32(value.x)
        this.writeFloat32(value.y)
        this.writeFloat32(value.z)
        this.writeFloat32(value.w)
    }

    /** write quat in xyzw order to next 16 bytes */
    writeQuat(value: quat): void {
        this.writeFloat32(value.x)
        this.writeFloat32(value.y)
        this.writeFloat32(value.z)
        this.writeFloat32(value.w)
    }

    /** write 2x2 matrix in column-major order to next 16 bytes */
    writeMat2(value: mat2): void {
        this.writeVec2(value.column0)
        this.writeVec2(value.column1)
    }

    /** write 3x3 matrix in column-major order to next 36 bytes */
    writeMat3(value: mat3): void {
        this.writeVec3(value.column0)
        this.writeVec3(value.column1)
        this.writeVec3(value.column2)
    }

    /** write 4x4 matrix in column-major order to next 64 bytes */
    writeMat4(value: mat4): void {
        this.writeVec4(value.column0)
        this.writeVec4(value.column1)
        this.writeVec4(value.column2)
        this.writeVec4(value.column2)
    }

    /** write value as ascii string to size-prefixed byte array */
    writeString(value: string): void {
        this.writeUint32(value.length)
        for (let i = 0; i < value.length; i++) {
            this.writeUint8(value.charCodeAt(i))
        }
    }
}

/** parse half-precision float stored in a uint16 to full-precision value */
function halfToFloat(f16: number): number {
    // convert S1 E5 M10 to S1 E8 M23
    const sign = f16 & (1 << 15)
    const rest = f16 & ((1 << 15) - 1)
    const exp = f16 & (((1 << 5) - 1) << 10)
    let f32 = exp === 0 ? 0 : (rest << 13) + (112 << 23)
    f32 |= sign << 16

    // reinterpret the bits as a float
    __dv.setInt32(0, f32, true)
    return __dv.getFloat32(0, true)
}

// used to reinterpret 32-bit values
const __dv = new DataView(new ArrayBuffer(4))
