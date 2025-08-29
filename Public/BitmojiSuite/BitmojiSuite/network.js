import * as Network from "LensStudio:Network";

export class NetworkingManager {
    constructor(/* auth */) {

    }

    async getResource(url) {
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = url;
            request.method = Network.HttpRequest.Method.Get;

            Network.performHttpRequest(request, (response) => {
                if (response.statusCode == 200) {
                    resolve(response.body.toBytes());
                } else if (response.statusCode == 302) {
                    this.getResource(response.headers.location).then(resolve).catch(reject);
                } else {
                    reject(response.statusCode);
                }
            })
        });
    }
}
