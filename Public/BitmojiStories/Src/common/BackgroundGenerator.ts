import * as Network from "LensStudio:Network";

export class BackgroundGenerator {
    async generateBackground(prompt: string): Promise<string> {
        const job = await this.createJob(prompt);
        const result = await this.waitForJob(job.id);
        const resource = JSON.parse(await this.getResource(result));
        return resource.image;
    }

    private async createJob(prompt: string, retriesLeft = 3): Promise<{ id: string }> {
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = "https://ml.snap.com/api/genai-assets/background";
            request.method = Network.HttpRequest.Method.Post;
            request.body = JSON.stringify({
                positive_prompt: "Background of " + prompt,
                output_file_type: "PNG",
            });

            Network.performAuthorizedHttpRequest(request, (response) => {
                if (response.statusCode === 200) {
                    resolve(JSON.parse(response.body.toString()));
                } else if (retriesLeft > 0) {
                    this.createJob(prompt, retriesLeft - 1).then(resolve).catch(reject);
                } else {
                    reject(new Error("Failed to generate background"));
                }
            });
        });
    }

    private async waitForJob(jobId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const request = new Network.HttpRequest();
                request.url = `https://ml.snap.com/api/genai-assets/background/${jobId}`;
                request.method = Network.HttpRequest.Method.Get;

                Network.performAuthorizedHttpRequest(request, (response) => {
                    const jobStatus = JSON.parse(response.body.toString());
                    if (jobStatus.status === "SUCCESS") {
                        clearInterval(interval);
                        resolve(jobStatus.result);
                    } else if (jobStatus.status === "FAILED") {
                        clearInterval(interval);
                        reject(new Error("Failed to generate background"));
                    }
                });
            }, 500);
        });
    }

    private async getResource(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = url;
            request.method = Network.HttpRequest.Method.Get;

            Network.performHttpRequest(request, (response) => {
                if (response.statusCode === 200) {
                    resolve(response.body.toString());
                } else if (response.statusCode === 302) {
                    const location = (response.headers as Record<string, string>).location;
                    this.getResource(location).then(resolve).catch(reject);
                } else {
                    reject(new Error(`HTTP ${response.statusCode}`));
                }
            });
        });
    }
}
