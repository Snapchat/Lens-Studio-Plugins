import * as Network from 'LensStudio:Network';

const DEFAULT_RESULTS = {
    'results':[
        {
            'polycount':7500,
            'textureSize':512
        },
        {
            'polycount':15000,
            'textureSize':1024
        },
        {
            'polycount':30000,
            'textureSize':2048
        }

    ]
};

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
    request.url = 'https://ml.snap.com/api/three-d-assets';
    request.method = Network.HttpRequest.Method.Post;
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function listAssets(maxPageSize, callback, searchQuery, pageToken) {
    const request = new Network.HttpRequest();
    let url = 'https://ml.snap.com/api/three-d-assets?maxPageSize=' + maxPageSize;

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
    request.url = 'https://ml.snap.com/api/three-d-assets/' + id;
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
    request.url = 'https://ml.snap.com/api/three-d-assets/' + id + '/draft_meshes:stream';
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        if (response.statusCode == 200) {
            callback(JSON.parse(response.body.toString()));
        } else {
            callback(null);
        }
    });
}

export function retextureAsset(asset_id, data, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/three-d-assets/' + asset_id + ':retexture';
    request.method = Network.HttpRequest.Method.Post;
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function continueGeneration(asset_id, draft_mesh_id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/three-d-assets/' + asset_id + '/draft_meshes/' + draft_mesh_id + ':continue';
    request.method = Network.HttpRequest.Method.Put;
    request.body = JSON.stringify(DEFAULT_RESULTS);

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function deleteAsset(id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/three-d-assets/' + id;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function createAttachment(data, contentType, filename, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/three-d-assets-attachments';

    request.method = Network.HttpRequest.Method.Post;

    const headers = {
        'Content-Disposition': `form-data; name="file"; filename="${filename}"`,
        'Content-Type': contentType
    };

    const formData = new Network.FormData();

    formData.append(data, headers);

    request.body = formData;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}
