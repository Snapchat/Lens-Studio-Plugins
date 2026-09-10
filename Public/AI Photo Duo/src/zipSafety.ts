/**
 * Editor.Compression.Zip.unpack writes each entry to the path stored in the
 * archive, so an entry named "../../evil" lands outside the destination
 * directory ("zip slip"). The archives here come off the network, so their
 * entry names are inspected before anything is unpacked.
 */

const EOCD_SIGNATURE = [0x50, 0x4b, 0x05, 0x06];
const CENTRAL_DIRECTORY_SIGNATURE = [0x50, 0x4b, 0x01, 0x02];
const EOCD_SIZE = 22;
const CENTRAL_DIRECTORY_HEADER_SIZE = 46;
// The trailing comment length is 16 bit, so the record starts at most
// 65535 + EOCD_SIZE bytes from the end of the archive.
const MAX_EOCD_SEARCH = 65535 + EOCD_SIZE;

export interface ZipEntryCheck {
    contained: boolean;
    reason?: string;
}

function matchesSignature(bytes: Uint8Array, offset: number, signature: number[]): boolean {
    if (offset < 0 || offset + signature.length > bytes.length) {
        return false;
    }
    for (let i = 0; i < signature.length; i++) {
        if (bytes[offset + i] !== signature[i]) {
            return false;
        }
    }
    return true;
}

function readUint16(bytes: Uint8Array, offset: number): number {
    return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint32(bytes: Uint8Array, offset: number): number {
    return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

/**
 * Entry names are stored as raw bytes; mapping each byte to a code unit keeps
 * the separators and ".." segments (all ASCII) intact regardless of encoding.
 */
function decodeEntryName(bytes: Uint8Array, start: number, length: number): string {
    let name = '';
    for (let i = 0; i < length; i++) {
        name += String.fromCharCode(bytes[start + i]);
    }
    return name;
}

/**
 * True only for relative paths that cannot climb out of the directory they are
 * appended to.
 */
export function isContainedRelativePath(name: string): boolean {
    if (!name) {
        return false;
    }
    // Archives written on Windows may use backslashes as separators.
    const normalized = name.replace(/\\/g, '/');
    if (normalized.charAt(0) === '/' || /^[A-Za-z]:/.test(normalized)) {
        return false;
    }
    return normalized.split('/').every(segment => segment !== '..');
}

/**
 * Walks the archive's central directory and reports whether every entry would
 * be unpacked inside the destination directory. Archives whose directory
 * cannot be parsed (including zip64) are reported as not contained, since an
 * unverified archive must not be handed to the native unpacker.
 */
export function zipEntriesAreContained(bytes: Uint8Array): ZipEntryCheck {
    if (bytes.length < EOCD_SIZE) {
        return {contained: false, reason: 'archive is too small to be a zip'};
    }

    let eocdOffset = -1;
    const searchLimit = Math.max(0, bytes.length - MAX_EOCD_SEARCH);
    for (let offset = bytes.length - EOCD_SIZE; offset >= searchLimit; offset--) {
        if (matchesSignature(bytes, offset, EOCD_SIGNATURE)) {
            eocdOffset = offset;
            break;
        }
    }
    if (eocdOffset < 0) {
        return {contained: false, reason: 'no end-of-central-directory record'};
    }

    const entryCount = readUint16(bytes, eocdOffset + 10);
    const directoryOffset = readUint32(bytes, eocdOffset + 16);
    if (entryCount === 0xffff || directoryOffset === 0xffffffff) {
        return {contained: false, reason: 'zip64 archive - entry names cannot be verified'};
    }

    let offset = directoryOffset;
    for (let entry = 0; entry < entryCount; entry++) {
        if (!matchesSignature(bytes, offset, CENTRAL_DIRECTORY_SIGNATURE) ||
            offset + CENTRAL_DIRECTORY_HEADER_SIZE > bytes.length) {
            return {contained: false, reason: `malformed central directory at entry ${entry}`};
        }
        const nameLength = readUint16(bytes, offset + 28);
        const extraLength = readUint16(bytes, offset + 30);
        const commentLength = readUint16(bytes, offset + 32);
        const nameStart = offset + CENTRAL_DIRECTORY_HEADER_SIZE;
        if (nameStart + nameLength > bytes.length) {
            return {contained: false, reason: `entry ${entry} name runs past the end of the archive`};
        }
        if (!isContainedRelativePath(decodeEntryName(bytes, nameStart, nameLength))) {
            return {contained: false, reason: `entry ${entry} would be unpacked outside the destination directory`};
        }
        offset = nameStart + nameLength + extraLength + commentLength;
    }

    return {contained: true};
}
