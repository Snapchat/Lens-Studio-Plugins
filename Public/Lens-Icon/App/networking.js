import * as Network from 'LensStudio:Network';

export class NetworkingManager {
    constructor() {
        this.timers = [];
    }

    createHttpRequest(obj) {
        const result = new Network.HttpRequest();

        result.url = obj.url;
        if (obj.headers) {
            result.headers = obj.headers;
        }
        if (obj.body) {
            result.body = obj.body;
        }
        if (obj.contentType) {
            result.contentType = obj.contentType;
        }

        switch(obj.method) {
            case "GET":
                result.method = Network.HttpRequest.Method.Get;
            break;
            case "PUT":
                result.method = Network.HttpRequest.Method.Put;
            break;
            case "POST":
                result.method = Network.HttpRequest.Method.Post;
            break;
            case "DELETE":
                result.method = Network.HttpRequest.Method.Delete;
            break;
        }

        return result;
    }

    performHttpRequest(request, callback) {
        Network.performHttpRequest(request, callback);
    }

    performAuthorizedHttpRequest(request, callback) {
        Network.performAuthorizedHttpRequest(request, callback);
    }

    async performHttpRequestAsync(request) {
        return new Promise((resolve, reject) => {
            try {
                this.performHttpRequest(request, (response) => {
                    resolve(response);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async performAuthorizedHttpRequestAsync(request) {
        return new Promise((resolve, reject) => {
            try {
                this.performAuthorizedHttpRequest(request, (response) => {
                    resolve(response);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async fetch(url, options = {}) {
        const {
            type = "bytes",
            retries = 3,
            delay = 500,
            authorized = false
        } = options;

        return new Promise((resolve, reject) => {
            if (!url) {
                resolve(new Uint8Array());
                return;
            }

            const attemptFetch = (remainingRetries) => {
                const request = new Network.HttpRequest();
                request.url = url;
                request.method = Network.HttpRequest.Method.Get;

                const onResponse = (response) => {
                    if (response.statusCode === 200) {
                        switch (type) {
                            case "bytes":
                                resolve(response.body.toBytes());
                                break;
                            case "string":
                                resolve(response.body.toString());
                                break;
                            default:
                                resolve(response.body.toBytes());
                                break;
                        }
                    } else if (remainingRetries > 0) {
                        this.timers.push(setTimeout(() => {
                            attemptFetch(remainingRetries - 1);
                        }, delay));
                    } else {
                        switch (type) {
                            case "bytes":
                                resolve(new Uint8Array());
                                break;
                            case "string":
                                resolve('');
                                break;
                            default:
                                resolve(new Uint8Array());
                                break;
                        }
                    }
                };

                if (authorized) {
                    this.performAuthorizedHttpRequest(request, onResponse);
                } else {
                    this.performHttpRequest(request, onResponse);
                }
            };

            attemptFetch(retries);
        });
    }

    async fetchJson(url, { authorized = false }) {
        const response = await this.fetch(url, { type: "string", authorized });

        if (response.length == 0) {
            return null;
        }

        try {
            return JSON.parse(response);
        } catch {
            return null;
        }

    }
}
