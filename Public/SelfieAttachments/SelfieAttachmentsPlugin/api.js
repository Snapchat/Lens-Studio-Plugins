import * as Network from 'LensStudio:Network';

const base_url = 'https://ml.snap.com/api/gen-accessories';

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

export function createAsset(data, callback) {
    const request = new Network.HttpRequest();
    request.url = base_url;
    request.method = Network.HttpRequest.Method.Post;
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';


    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function listAssets(maxPageSize, callback, searchQuery, pageToken) {
    const request = new Network.HttpRequest();
    let url = base_url + '?maxPageSize=' + maxPageSize;

    if (pageToken) {
        url += '&pageToken=' + pageToken;
    }

    if (searchQuery) {
        url += searchQuery;
    }

    request.url = url;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function getAsset(id, callback) {
    const request = new Network.HttpRequest();
    request.url = base_url + '/' + id;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        if (response.statusCode == 200) {
            callback(JSON.parse(response.body.toString()));
        } else {
            callback(null);
        }
    });
}

export function getDraftAsset(id, callback) {
    const request = new Network.HttpRequest();
    request.url = base_url + '/' + id + '/driving_images:stream';
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        if (response.statusCode == 200) {
            callback(JSON.parse(response.body.toString()));
        } else {
            callback(null);
        }
    });
}

export function continueGeneration(asset_id, draft_mesh_id, callback) {
    const request = new Network.HttpRequest();
    request.url = base_url + '/' + asset_id + '/driving_images/' + draft_mesh_id + ':continue';
    request.method = Network.HttpRequest.Method.Put;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function deleteAsset(id, callback) {
    const request = new Network.HttpRequest();
    request.url = base_url + '/' + id;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}
