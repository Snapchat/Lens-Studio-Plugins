import * as Network from 'LensStudio:Network';
export class TextureGenAPI {
    static async generate(pluginSystem, prompt) {
        try {
            const authorization = pluginSystem.findInterface(Editor.IAuthorization);
            if (!authorization || !authorization.isAuthorized) {
                throw new Error('Please log into your Snapchat account in Lens Studio to use this tool. You can log in from the Menu Bar: Go to My Lenses > Login');
            }
            const job = await TextureGenAPI.createJob(prompt);
            const resultUrl = await TextureGenAPI.waitForJob(job.id);
            const resource = JSON.parse(await TextureGenAPI.getResource(resultUrl));
            const base64Data = resource.image;
            if (base64Data) {
                return TextureGenAPI.base64ToArrayBuffer(base64Data);
            }
            else {
                console.error('[GenerateTexture] No image data in response');
                return null;
            }
        }
        catch (e) {
            console.error('[GenerateTexture] Generation error:', e);
            return null;
        }
    }
    static createJob(prompt, retriesLeft = 3) {
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = TextureGenAPI.BASE_URL;
            request.method = Network.HttpRequest.Method.Post;
            request.body = JSON.stringify({ positive_prompt: prompt, output_file_type: "PNG" });
            Network.performAuthorizedHttpRequest(request, (response) => {
                if (response.statusCode === 200) {
                    try {
                        resolve(JSON.parse(response.body.toString()));
                    }
                    catch (e) {
                        reject(new Error('Failed to create generation job: invalid response'));
                    }
                }
                else if (retriesLeft > 0) {
                    TextureGenAPI.createJob(prompt, retriesLeft - 1).then(resolve).catch(reject);
                }
                else {
                    reject(new Error(`Failed to create generation job: HTTP ${response.statusCode}`));
                }
            });
        });
    }
    static waitForJob(jobId) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const request = new Network.HttpRequest();
                request.url = `${TextureGenAPI.BASE_URL}/${jobId}`;
                request.method = Network.HttpRequest.Method.Get;
                Network.performAuthorizedHttpRequest(request, (response) => {
                    try {
                        const jobStatus = JSON.parse(response.body.toString());
                        if (jobStatus.status === "SUCCESS") {
                            clearInterval(interval);
                            resolve(jobStatus.result);
                        }
                        else if (jobStatus.status === "FAILED") {
                            clearInterval(interval);
                            reject(new Error("Texture generation job failed"));
                        }
                    }
                    catch (e) {
                        clearInterval(interval);
                        reject(new Error('Failed to check generation status: invalid response'));
                    }
                });
            }, TextureGenAPI.POLL_INTERVAL_MS);
        });
    }
    static getResource(url) {
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = url;
            request.method = Network.HttpRequest.Method.Get;
            Network.performHttpRequest(request, (response) => {
                if (response.statusCode === 200) {
                    resolve(response.body.toString());
                }
                else if (response.statusCode === 302) {
                    TextureGenAPI.getResource(response.headers.location).then(resolve).catch(reject);
                }
                else {
                    reject(new Error(`Failed to fetch resource: HTTP ${response.statusCode}`));
                }
            });
        });
    }
    static base64ToArrayBuffer(base64) {
        return Base64.decode(base64);
    }
}
TextureGenAPI.BASE_URL = "https://ml.snap.com/api/genai-assets/background";
TextureGenAPI.POLL_INTERVAL_MS = 500;
