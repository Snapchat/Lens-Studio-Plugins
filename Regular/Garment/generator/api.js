import * as Network from 'LensStudio:Network';
import * as Subprocess from 'LensStudio:Subprocess';

export function versions(callback) {
    const request = new Network.HttpRequest();
    const url = 'https://ml.snap.com/api/versions';

    request.url = url;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        if (response.statusCode === 200) {
            callback(JSON.parse(response.body.toString()).versions);
        } else {
            callback([-1]);
        }
    });
}

export function me(callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me';
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function acceptTerms(terms, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me/terms?terms=' + terms;
    request.method = Network.HttpRequest.Method.Put;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

const globalTimers = [];

async function retry(fn, retries = 3, delay = 0) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1 || error instanceof TimeoutError) throw error;

            await new Promise(res => {
                globalTimers.push(setTimeout(res, delay));
            });
        }
    }
}

class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = "TimeoutError";
    }
}

function timeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new TimeoutError('Timeout has been reached. Please, try again.'));
        }, ms);

        globalTimers.push(timer);

        promise
            .then(value => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(error => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

const GARMENT_CREATION_URL = 'https://ml.snap.com/api/garments'

export function generateGarment(prompt, seed, garment_type) {
    return retry(() => timeout(tryGenerateGarment(prompt, seed, garment_type), 20000), 3);
}

async function tryGenerateGarment(prompt, seed, garment_type) {
    return new Promise((resolve, reject) => {
        const request = new Network.HttpRequest();
        request.url = GARMENT_CREATION_URL;
        request.method = Network.HttpRequest.Method.Post;

        request.headers = {
            "Content-Type": "application/json"
        }

        request.body = JSON.stringify(
            {
                "prompt": prompt,
                "seed": seed,
                "garmentType": garment_type
            }
        );

        Network.performAuthorizedHttpRequest(request, function(response) {
            if (response.statusCode == 201) {
                try {
                    resolve(response.body.toBytes())
                } catch (error) {
                    reject(new Error("Failed to download garment. Please, try again"));
                }
            } else if (response.statusCode == 400) {
                reject(new Error("The result violates our community guidelines"));
            } else if (response.statusCode == 429) {
                reject(new Error("You've reached the limit. Please, try again later"));
            } else {
                reject(new Error("Generation has been failed. Please, try again."));
            }
        });
    });
}
