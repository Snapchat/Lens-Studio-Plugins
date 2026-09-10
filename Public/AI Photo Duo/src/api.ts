import * as Network from 'LensStudio:Network';

const BASE_URL = 'https://ml.snap.com';
const DREAM_TYPE = 'TWO_PERSON';

/**
 * Preview URLs come from the authenticated dreams API, but their bytes are fed
 * straight to FileSystem.writeFile and the native media decoders. Restrict
 * downloads to plain https URLs with no credentials in the authority, then
 * allowlist Snap / GCS hosts so a compromised API response cannot point
 * performHttpRequest at an arbitrary origin.
 */
const HTTPS_URL_PATTERN = /^https:\/\/[^\/?#@\s]+(?:[\/?#]|$)/;
const ALLOWED_DOWNLOAD_HOSTS = [
    'ml.snap.com',
    'storage.googleapis.com',
];
const ALLOWED_DOWNLOAD_HOST_SUFFIXES = [
    '.snap.com',
    '.sc-cdn.net',
    '.snapchat.com',
    '.storage.googleapis.com',
];

function hostIsAllowed(host: string): boolean {
    if (ALLOWED_DOWNLOAD_HOSTS.indexOf(host) !== -1) {
        return true;
    }
    for (let i = 0; i < ALLOWED_DOWNLOAD_HOST_SUFFIXES.length; i++) {
        const suffix = ALLOWED_DOWNLOAD_HOST_SUFFIXES[i];
        if (host.length > suffix.length && host.endsWith(suffix)) {
            return true;
        }
    }
    return false;
}

function isAllowedDownloadUrl(url: string): boolean {
    if (typeof url !== 'string' || !HTTPS_URL_PATTERN.test(url)) {
        return false;
    }
    const authority = url.substring('https://'.length).split(/[\/?#]/)[0].toLowerCase();
    if (!authority || authority.indexOf('..') !== -1) {
        return false;
    }
    let host = authority;
    if (authority.indexOf(':') !== -1) {
        const parts = authority.split(':');
        if (parts.length !== 2 || parts[1] !== '443') {
            return false;
        }
        host = parts[0];
    }
    return hostIsAllowed(host);
}

/**
 * Parses a response body as JSON, returning null (and logging) instead of
 * throwing if the body isn't valid JSON - e.g. when a request gets rejected
 * client-side (unauthorized URL, blocked by the Editor's network layer) and
 * the callback still fires with a non-JSON (HTML/empty) body.
 *
 */
export function tryParseJson(body: string, context: string): any {
    try {
        return JSON.parse(body);
    } catch (e) {
        const length = typeof body === 'string' ? body.length : -1;
        console.error(`[AI Photo Duo] Failed to parse JSON response in ${context}: ${e} | body length: ${length}`);
        return null;
    }
}

export function listDreams(maxPageSize: number, callback: Function, searchQuery?: string, pageToken?: string) {
    const request = new Network.HttpRequest();
    let url = BASE_URL + '/api/dreams?maxPageSize=' + maxPageSize;
    url += '&filter[]=dream_type%3D' + encodeURIComponent(DREAM_TYPE);

    if (pageToken) {
        url += '&pageToken=' + pageToken;
    }

    if (searchQuery) {
        url += searchQuery;
    }

    request.url = url;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function createDream(prompt: string, seed: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams';
    request.method = Network.HttpRequest.Method.Post;

    const data = {
        "prompt": prompt,
        "seed": seed,
        "dreamType": DREAM_TYPE
    };

    request.body = JSON.stringify(data);
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function getDreamByID(id: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams/' + id;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function createPack(id: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + `/api/dreams/${id}:pack`;
    request.method = Network.HttpRequest.Method.Post;

    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function deleteById(animationId: string, callback?: Function): any {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams' + "/" + animationId;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, (response) => {
        if (callback) {
            callback(response);
        }
    });
}

export function favoriteDream(dreamId: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams/' + dreamId + ':favorite';
    request.method = Network.HttpRequest.Method.Put;

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function unfavoriteDream(dreamId: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams/' + dreamId + ':unfavorite';
    request.method = Network.HttpRequest.Method.Put;

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function downloadFile(url: string, callback: Function) {
    if (!isAllowedDownloadUrl(url)) {
        console.error('[AI Photo Duo] Refusing to download from a URL that is not https on an allowed host.');
        callback({
            statusCode: 0,
            error: 'blocked: not an allowed https URL',
            contentType: '',
            body: {toBytes: () => new Uint8Array(0), toString: () => ''}
        });
        return;
    }

    const request = new Network.HttpRequest();
    request.url = url + "";
    request.method = Network.HttpRequest.Method.Get;

    Network.performHttpRequest(request, function(response) {
        callback(response);
    })
}
