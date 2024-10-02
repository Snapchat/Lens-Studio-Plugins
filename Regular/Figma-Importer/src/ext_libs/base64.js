//@ts-nocheck
"use strict";


function eq(x, y) { return (((0 - (x ^ y)) >> 16) & 0xffff) ^ 0xffff; }
function gt(x, y) { return ((y - x) >> 8) & 0xffff; }
function lt(x, y) { return gt(y, x); }
function ge(x, y) { return gt(y, x) ^ 0xffff; }
function le(x, y) { return ge(y, x); }
function byteToCharOriginal(x) {
    const c = (lt(x, 26) & (x + 'A'.charCodeAt(0))) |
        (ge(x, 26) & lt(x, 52) & (x + ('a'.charCodeAt(0) - 26))) |
        (ge(x, 52) & lt(x, 62) & (x + ('0'.charCodeAt(0) - 52))) | (eq(x, 62) & '+'.charCodeAt(0)) |
        (eq(x, 63) & '/'.charCodeAt(0));
    return String.fromCharCode(c);
}
function charToByteOriginal(c) {
    const x = (ge(c, 'A'.charCodeAt(0)) & le(c, 'Z'.charCodeAt(0)) & (c - 'A'.charCodeAt(0))) |
        (ge(c, 'a'.charCodeAt(0)) & le(c, 'z'.charCodeAt(0)) & (c - ('a'.charCodeAt(0) - 26))) |
        (ge(c, '0'.charCodeAt(0)) & le(c, '9'.charCodeAt(0)) & (c - ('0'.charCodeAt(0) - 52))) | (eq(c, '+'.charCodeAt(0)) & 62) |
        (eq(c, '/'.charCodeAt(0)) & 63);
    return x | (eq(x, 0) & (eq(c, 'A'.charCodeAt(0)) ^ 0xffff));
}
function byteToCharUrlSafe(x) {
    const c = (lt(x, 26) & (x + 'A'.charCodeAt(0))) |
        (ge(x, 26) & lt(x, 52) & (x + ('a'.charCodeAt(0) - 26))) |
        (ge(x, 52) & lt(x, 62) & (x + ('0'.charCodeAt(0) - 52))) | (eq(x, 62) & '-'.charCodeAt(0)) |
        (eq(x, 63) & '_'.charCodeAt(0));
    return String.fromCharCode(c);
}
function charToByteUrlSafe(c) {
    const x = (ge(c, 'A'.charCodeAt(0)) & le(c, 'Z'.charCodeAt(0)) & (c - 'A'.charCodeAt(0))) |
        (ge(c, 'a'.charCodeAt(0)) & le(c, 'z'.charCodeAt(0)) & (c - ('a'.charCodeAt(0) - 26))) |
        (ge(c, '0'.charCodeAt(0)) & le(c, '9'.charCodeAt(0)) & (c - ('0'.charCodeAt(0) - 52))) | (eq(c, '-'.charCodeAt(0)) & 62) |
        (eq(c, '_'.charCodeAt(0)) & 63);
    return x | (eq(x, 0) & (eq(c, 'A'.charCodeAt(0)) ^ 0xffff));
}
function bin2Base64(bin, padding, byteToChar) {
    let bin_len = bin.length;
    let nibbles = Math.floor(bin_len / 3);
    let remainder = bin_len - 3 * nibbles;
    let b64_len = nibbles * 4;
    if (remainder) {
        if (padding) {
            b64_len += 4;
        }
        else {
            b64_len += 2 + (remainder >> 1);
        }
    }
    let b64 = "";
    let acc = 0, acc_len = 0, bin_pos = 0;
    while (bin_pos < bin_len) {
        acc = ((acc << 8) + bin[bin_pos++]) & 0xfff;
        acc_len += 8;
        while (acc_len >= 6) {
            acc_len -= 6;
            b64 += byteToChar((acc >> acc_len) & 0x3F);
        }
    }
    if (acc_len > 0) {
        b64 += byteToChar((acc << (6 - acc_len)) & 0x3F);
    }
    while (b64.length < b64_len) {
        b64 += '=';
    }
    return b64;
}
function skipPadding(b64, ignore, padding_len) {
    let i = 0;
    while (padding_len > 0) {
        let c = b64[i++];
        if (c == '=') {
            padding_len--;
        }
        else if (!ignore || ignore.indexOf(c) < 0) {
            throw new Error("Invalid base64 padding");
        }
    }
    if (i !== b64.length) {
        throw new Error("Invalid base64 padding length");
    }
}
function base642Bin(b64, padding, ignore, charToByte) {
    let b64_len = b64.length;
    let bin = new Uint8Array(Math.ceil(b64_len * 3 / 4));
    let acc = 0, acc_len = 0, bin_len = 0, b64_pos = 0;
    while (b64_pos < b64_len) {
        const c = b64[b64_pos];
        const d = charToByte(c.charCodeAt(0));
        if (d == 0xffff) {
            if (ignore && ignore.indexOf(c) >= 0) {
                b64_pos++;
                continue;
            }
            break;
        }
        acc = ((acc << 6) + d) & 0xfff;
        acc_len += 6;
        if (acc_len >= 8) {
            acc_len -= 8;
            bin[bin_len++] = (acc >> acc_len) & 0xff;
        }
        b64_pos++;
    }
    if (acc_len > 4 || (acc & ((1 << acc_len) - 1)) != 0) {
        throw new Error("Non-canonical base64 encoding");
    }
    if (padding) {
        skipPadding(b64.slice(b64_pos), ignore, acc_len / 2);
    }
    return new Uint8Array(bin.buffer, 0, bin_len);
}
/**
 * Custom Base64 encoding/decoding, with support for arbitrary char<->maps.
 */
export class Base64Codec {
    /**
     * Custom Base64 encoding/decoding.
     *
     * @param padding - whether padding is used.
     * @param ignore - string of characters to ignore.
     * @param charToByte - function to convert Base64 char to a byte.
     * @param byteToChar - function to convert byte to a Base64 char.
     */
    constructor(padding = false, ignore = null, charToByte, byteToChar) {
        this._ignore = null;
        this._padding = false;
        this._padding = padding;
        this._ignore = ignore;
        this._charToByte = charToByte;
        this._byteToChar = byteToChar;
    }
    /**
     * Encode a buffer to Base64.
     *
     * @param data - a buffer to encode.
     * @returns a Base64 encoded string.
     */
    encode(data) {
        return bin2Base64(data, this._padding, this._byteToChar);
    }
    /**
     * Decode a Base64 string to a buffer.
     *
     * @param data - a Base64 string to decode.
     * @returns a buffer.
     * @throws an error if the string is not a valid Base64 string.
     */
    decode(data) {
        return base642Bin(data, this._padding, this._ignore, this._charToByte);
    }
}
/**
 * Traditional Base64 encoding/decoding.
 */
export class Base64 extends Base64Codec {
    /**
     * Traditional Base64 encoding/decoding.
     *
     * @param padding - whether padding is used.
     * @param ignore - string of characters to ignore.
     */
    constructor(padding = true, ignore = null) {
        super(padding, ignore, charToByteOriginal, byteToCharOriginal);
    }
}
/**
 * URL-safe Base64 encoding/decoding.
 */
export class Base64UrlSafe extends Base64Codec {
    /**
     * URL-safe Base64 encoding/decoding.
     *
     * @param padding - whether padding is used.
     * @param ignore - string of characters to ignore.
     */
    constructor(padding = false, ignore = null) {
        super(padding, ignore, charToByteUrlSafe, byteToCharUrlSafe);
    }
}
