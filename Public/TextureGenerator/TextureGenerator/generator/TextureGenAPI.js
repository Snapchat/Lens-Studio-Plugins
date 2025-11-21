import * as Network from 'LensStudio:Network';
export class TextureGenAPI {
    /**
     * Generate texture using sync API (single request, immediate response)
     */
    static async generate(pluginSystem, prompt, negativePrompt, seed = -1, steps = 50, guidanceScale = 7.5) {
        try {
            const authorization = pluginSystem.findInterface(Editor.IAuthorization);
            if (!authorization || !authorization.isAuthorized) {
                throw new Error('Authorization required for texture generation. Please sign into Lens Studio.');
            }
            const request = new Network.HttpRequest();
            request.url = TextureGenAPI.BASE_URL;
            request.method = Network.HttpRequest.Method.Post;
            request.headers = {
                'X-API-Key': TextureGenAPI.X_API_KEY,
                'Content-Type': 'application/json'
            };
            const requestBody = {
                prompt: prompt,
                negative_prompt: [negativePrompt, TextureGenAPI.DEFAULT_NEGATIVE_PROMPT].filter(Boolean).join(" "),
                steps: steps.toString(),
                seed: seed.toString(),
                guidance_scale: guidanceScale.toString(),
                return_type: "base64"
            };
            request.body = JSON.stringify(requestBody);
            return new Promise((resolve, reject) => {
                Network.performAuthorizedHttpRequest(request, (response) => {
                    if (response.statusCode === 200) {
                        try {
                            const responseData = JSON.parse(response.body.toString());
                            const base64Data = responseData.image;
                            if (base64Data) {
                                const imageBuffer = TextureGenAPI.base64ToArrayBuffer(base64Data);
                                resolve(imageBuffer);
                            }
                            else {
                                console.error('[GenerateTexture] No image data in response');
                                resolve(null);
                            }
                        }
                        catch (e) {
                            console.error('[GenerateTexture] Failed to parse response:', e);
                            resolve(null);
                        }
                    }
                    else {
                        console.error(`[GenerateTexture] Generation failed: ${response.statusCode}`);
                        reject(new Error(`HTTP ${response.statusCode}: ${response.body.toString()}`));
                    }
                });
            });
        }
        catch (e) {
            console.error('[GenerateTexture] Generation error:', e);
            return null;
        }
    }
    /**
     * Convert base64 string to Uint8Array using Lens Studio's built-in Base64 class
     */
    static base64ToArrayBuffer(base64) {
        return Base64.decode(base64);
    }
}
// API Constants from C++ implementation
TextureGenAPI.BASE_URL = "https://aws.api.snapchat.com/snapml.api.maui/stable-diffusion/txt2img/with-validation";
TextureGenAPI.X_API_KEY = "7Kp3x9Yz";
TextureGenAPI.DEFAULT_NEGATIVE_PROMPT = "EasyNegative, nsfw, oversaturated, harsh lighting, ugly, deformed, bad anatomy, signature, watermark, username, error, watermark, text, out of frame, lowres, low quality, jpeg artifacts, watermark, signature, blurry, blurry image, human, person, woman, man, girl, boy, face";
