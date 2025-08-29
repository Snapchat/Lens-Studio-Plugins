import * as Network from 'LensStudio:Network';
import app from '../application/app.js';

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

export function updateFavorites(effect_id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me/favorites/' + effect_id;
    request.method = Network.HttpRequest.Method.Put;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function deleteFavorites(effect_id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me/favorites/' + effect_id;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function createEffect(data, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/effects';
    request.method = Network.HttpRequest.Method.Post;
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function createPostProcessing(data, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snapchat.com/api/postprocessing-previews';
    request.method = Network.HttpRequest.Method.Post;
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function listEffects(maxPageSize, callback, searchQuery, pageToken) {
    const request = new Network.HttpRequest();
    let url = 'https://ml.snap.com/api/effects?maxPageSize=' + maxPageSize;

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

export function getEffect(id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/effects/' + id;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        try {
            callback(JSON.parse(response.body.toString()));
        } catch(error) {
            console.log(`[${app.name}]`, "Failed to load effect.");
        }
    });
}

export function getPostProcessing(id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/postprocessing-previews?effectId=' + id;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        try {
            callback(JSON.parse(response.body.toString()));
        } catch(error) {
            console.log(`[${app.name}]`, "Failed to load effect.");
        }
    });
}

export function deleteEffect(id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/effects/' + id;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}

export function createAttachment(data, contentType, filename, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/attachments';

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

export function getModels(id, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/effects/' + id + '/models';
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        try {
            callback(JSON.parse(response.body.toString()));
        } catch(error) {
            console.log(`${app.name}`, "Failed to aquire models.");
            return [];
        }
    });
}

export function createModel(id, postProcessingSettings, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/effects/' + id + '/models';
    request.method = Network.HttpRequest.Method.Post;

    request.body = JSON.stringify({
        'settings': {
            'modelSize': 'base',
            'steps': 10000,
            'learningRate': 0.0002,
            'datasetSizeLimit': 10000,
            'useFastTraining': true
        },
        'postprocessingSettings': postProcessingSettings
    });
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}
