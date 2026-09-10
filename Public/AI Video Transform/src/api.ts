import * as Network from 'LensStudio:Network';

const BASE_URL = 'https://ml.snap.com';
const DREAM_TYPE = 'CLIPS_V2V_PE';

/**
 * Preview URLs come from the authenticated dreams API, but their bytes are fed
 * straight to FileSystem.writeFile and the native media decoders - restrict
 * downloads to plain https URLs (no other scheme, no credentials in the
 * authority) as a second line of defense.
 */
const HTTPS_URL_PATTERN = /^https:\/\/[^\/?#@\s]+(?:[\/?#]|$)/;

/**
 * Parses a response body as JSON, returning null (and logging) instead of
 * throwing if the body isn't valid JSON - e.g. when a request gets rejected
 * client-side (unauthorized URL, blocked by the Editor's network layer) and
 * the callback still fires with a non-JSON (HTML/empty) body.
 */
export function tryParseJson(body: string, context: string): any {
    try {
        return JSON.parse(body);
    } catch (e) {
        const length = typeof body === 'string' ? body.length : -1;
        console.error(`[AI Video Transform] Failed to parse JSON response in ${context}: ${e} | body length: ${length}`);
        return null;
    }
}

export interface DreamListFilters {
    search?: string;
    favoritesOnly?: boolean;
}

export function listDreams(maxPageSize: number, callback: Function, filters?: DreamListFilters, pageToken?: string) {
    const request = new Network.HttpRequest();
    let url = BASE_URL + '/api/dreams?maxPageSize=' + encodeURIComponent(String(maxPageSize));
    url += '&filter[]=dream_type%3D' + encodeURIComponent(DREAM_TYPE);

    if (pageToken) {
        url += '&pageToken=' + encodeURIComponent(pageToken);
    }

    if (filters && filters.search) {
        url += '&filter[]=' + encodeURIComponent('search=' + filters.search);
    }

    if (filters && filters.favoritesOnly) {
        url += '&filter[]=' + encodeURIComponent('is_favorite=true');
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
    if (typeof url !== 'string' || !HTTPS_URL_PATTERN.test(url)) {
        console.error('[AI Video Transform] Refusing to download from a URL that is not a plain https URL.');
        callback({
            statusCode: 0,
            error: 'blocked: not a plain https URL',
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
