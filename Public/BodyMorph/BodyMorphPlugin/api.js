import * as Network from 'LensStudio:Network';

export const MorphState = {
    'QUEUED': 0,
    'MORPHING': 1,
    'TEXTURING': 2,
    'SUCCESS': 3,
    'FAILED': 4
};

const BASE_URL = 'https://ml.snap.com';

export function versions(callback) {
    const request = new Network.HttpRequest();
    const url = BASE_URL + '/api/versions';

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
    request.url = BASE_URL + '/api/me';
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function acceptTerms(terms, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/me/terms?terms=' + terms;
    request.method = Network.HttpRequest.Method.Put;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function createMorph(settings, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/morphs';
    request.method = Network.HttpRequest.Method.Post;
    request.body = JSON.stringify(settings);
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function listMorphs(maxPageSize, callback, searchString, pageToken) {
    const request = new Network.HttpRequest();
    let url = BASE_URL + '/api/morphs?maxPageSize=' + maxPageSize;

    if (pageToken) {
        url += '&pageToken=' + pageToken;
    }

    url += "&filter[]=pipeline%3Dbodymorph";

    if (searchString) {
        url += '&filter[]=search%3D' + searchString;
    }

    request.url = url;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function getMorph(id, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/morphs/' + id;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function deleteMorph(id, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/morphs/' + id;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function createAttachment(data, contentType, filename, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/uploads';

    request.method = Network.HttpRequest.Method.Post;

    const headers = {
        'Content-Disposition': `form-data; name="media"; filename="${filename}"`,
        'Content-Type': contentType
    };

    const formData = new Network.FormData();

    formData.append(data, headers);

    request.body = formData;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}
