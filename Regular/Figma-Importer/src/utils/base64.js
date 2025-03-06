/**
 * This does not work with Unicode characters!
 */
export function stringToBase64(input) {
    // Check if input is a valid string
    if (typeof input !== 'string') {
        console.error('Invalid input type. Expected a string.');
        return null;
    }

    // Create a string that contains all base64 characters
    const base64Chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let output = '';
    let i = 0;

    try {
        // Convert each character to its ASCII value and process in blocks of 3 bytes
        while (i < input.length) {
            // Collect up to 3 bytes into a single number
            const byte1 = input.charCodeAt(i++) || 0;
            const byte2 = input.charCodeAt(i++) || 0;
            const byte3 = input.charCodeAt(i++) || 0;

            // Convert the 3 bytes into four 6-bit sections
            const bits = (byte1 << 16) | (byte2 << 8) | byte3;

            // Extract and map the 6-bit sections to base64 characters
            const index1 = (bits >> 18) & 0x3f;
            const index2 = (bits >> 12) & 0x3f;
            const index3 = (bits >> 6) & 0x3f;
            const index4 = bits & 0x3f;

            // Append the base64 characters to the output string
            output +=
                base64Chars.charAt(index1) +
                base64Chars.charAt(index2) +
                base64Chars.charAt(index3) +
                base64Chars.charAt(index4);
        }

        // Add padding '=' characters as required
        const paddingLength = (3 - (input.length % 3)) % 3;
        if (paddingLength > 0) {
            output = output.slice(0, -paddingLength) + '='.repeat(paddingLength);
        }
    } catch (error) {
        console.error('An error occurred during base64 encoding:', error);
        return null;
    }

    // Return the base64-encoded string
    return output;
}