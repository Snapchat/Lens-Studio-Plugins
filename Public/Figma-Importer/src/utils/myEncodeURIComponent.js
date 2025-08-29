export function myEncodeURIComponent(str) {
  // Adjusted the set of characters that native encodeURIComponent does not escape.
  const unescaped = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~!*'()";
  let result = "";

  for (let i = 0; i < str.length; i++) {
    let codePoint = str.codePointAt(i);
    if (codePoint === undefined) {
      throw new Error("High surrogate without a low surrogate");
    }

    if (codePoint > 0xffff) {
      i++;
    }

    let char = String.fromCodePoint(codePoint);

    if (unescaped.indexOf(char) !== -1) {
      result += char;
    } else {
      if (codePoint < 0x80) {
        result += "%" + codePoint.toString(16).toUpperCase().padStart(2, "0");
      } else if (codePoint < 0x800) {
        const byte1 = 0xc0 | (codePoint >> 6);
        const byte2 = 0x80 | (codePoint & 0x3f);
        result += "%" + byte1.toString(16).toUpperCase().padStart(2, "0");
        result += "%" + byte2.toString(16).toUpperCase().padStart(2, "0");
      } else if (codePoint < 0x10000) {
        const byte1 = 0xe0 | (codePoint >> 12);
        const byte2 = 0x80 | ((codePoint >> 6) & 0x3f);
        const byte3 = 0x80 | (codePoint & 0x3f);
        result += "%" + byte1.toString(16).toUpperCase().padStart(2, "0");
        result += "%" + byte2.toString(16).toUpperCase().padStart(2, "0");
        result += "%" + byte3.toString(16).toUpperCase().padStart(2, "0");
      } else {
        const byte1 = 0xf0 | (codePoint >> 18);
        const byte2 = 0x80 | ((codePoint >> 12) & 0x3f);
        const byte3 = 0x80 | ((codePoint >> 6) & 0x3f);
        const byte4 = 0x80 | (codePoint & 0x3f);
        result += "%" + byte1.toString(16).toUpperCase().padStart(2, "0");
        result += "%" + byte2.toString(16).toUpperCase().padStart(2, "0");
        result += "%" + byte3.toString(16).toUpperCase().padStart(2, "0");
        result += "%" + byte4.toString(16).toUpperCase().padStart(2, "0");
      }
    }
  }

  return result;
}
