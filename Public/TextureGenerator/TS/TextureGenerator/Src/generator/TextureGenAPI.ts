import * as Network from 'LensStudio:Network';

export class TextureGenAPI {
    static readonly BASE_URL = "https://ml.snap.com/api/genai-assets/background";
    static readonly POLL_INTERVAL_MS = 500;

    static async generate(
        pluginSystem: Editor.PluginSystem,
        prompt: string,
        shouldAbort?: () => boolean
    ): Promise<Uint8Array | null> {
        const isAborted = shouldAbort ?? (() => false);
        try {
            const authorization = pluginSystem.findInterface(Editor.IAuthorization) as Editor.IAuthorization;

            if (!authorization || !authorization.isAuthorized) {
                throw new Error('Please log into your Snapchat account in Lens Studio to use this tool. You can log in from the Menu Bar: Go to My Lenses > Login');
            }

            if (isAborted()) {
                return null;
            }

            const job = await TextureGenAPI.createJob(prompt, isAborted);
            if (isAborted()) {
                return null;
            }

            const resultUrl = await TextureGenAPI.waitForJob(job.id, isAborted);
            if (isAborted()) {
                return null;
            }

            const resource = JSON.parse(await TextureGenAPI.getResource(resultUrl));
            const base64Data = resource.image;

            if (isAborted()) {
                return null;
            }

            if (base64Data) {
                return TextureGenAPI.base64ToArrayBuffer(base64Data);
            } else {
                console.error('[GenerateTexture] No image data in response');
                return null;
            }
        } catch (e: any) {
            if (e?.message !== 'aborted') {
                console.error('[GenerateTexture] Generation error:', e);
            }
            return null;
        }
    }

    private static createJob(
        prompt: string,
        shouldAbort: () => boolean,
        retriesLeft: number = 3
    ): Promise<{ id: string }> {
        if (shouldAbort()) {
            return Promise.reject(new Error('aborted'));
        }
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = TextureGenAPI.BASE_URL;
            request.method = Network.HttpRequest.Method.Post;
            request.body = JSON.stringify({ positive_prompt: prompt, output_file_type: "PNG" });

            Network.performAuthorizedHttpRequest(request, (response) => {
                if (shouldAbort()) {
                    reject(new Error('aborted'));
                    return;
                }
                if (response.statusCode === 200) {
                    try {
                        resolve(JSON.parse(response.body.toString()));
                    } catch (e) {
                        reject(new Error('Failed to create generation job: invalid response'));
                    }
                } else if (retriesLeft > 0) {
                    TextureGenAPI.createJob(prompt, shouldAbort, retriesLeft - 1).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Failed to create generation job: HTTP ${response.statusCode}`));
                }
            });
        });
    }

    private static waitForJob(jobId: string, shouldAbort: () => boolean): Promise<string> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (shouldAbort()) {
                    clearInterval(interval);
                    reject(new Error('aborted'));
                    return;
                }
                const request = new Network.HttpRequest();
                request.url = `${TextureGenAPI.BASE_URL}/${jobId}`;
                request.method = Network.HttpRequest.Method.Get;

                Network.performAuthorizedHttpRequest(request, (response) => {
                    if (shouldAbort()) {
                        clearInterval(interval);
                        reject(new Error('aborted'));
                        return;
                    }
                    try {
                        const jobStatus = JSON.parse(response.body.toString());

                        if (jobStatus.status === "SUCCESS") {
                            clearInterval(interval);
                            if (shouldAbort()) {
                                reject(new Error('aborted'));
                            } else {
                                resolve(jobStatus.result);
                            }
                        } else if (jobStatus.status === "FAILED") {
                            clearInterval(interval);
                            reject(new Error("Texture generation job failed"));
                        }
                    } catch (e) {
                        clearInterval(interval);
                        reject(new Error('Failed to check generation status: invalid response'));
                    }
                });
            }, TextureGenAPI.POLL_INTERVAL_MS);
        });
    }

    private static getResource(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = url;
            request.method = Network.HttpRequest.Method.Get;

            Network.performHttpRequest(request, (response) => {
                if (response.statusCode === 200) {
                    resolve(response.body.toString());
                } else if (response.statusCode === 302) {
                    TextureGenAPI.getResource((response.headers as any).location).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Failed to fetch resource: HTTP ${response.statusCode}`));
                }
            });
        });
    }

    static base64ToArrayBuffer(base64: string): Uint8Array {
        return Base64.decode(base64);
    }
}
