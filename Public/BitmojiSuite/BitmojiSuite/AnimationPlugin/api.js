import * as Network from 'LensStudio:Network';
import * as FileSystem from 'LensStudio:FileSystem';
const BASE_URL = 'https://ml.snap.com';
export function getMyAnimations(callback, pageToken) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations';
    request.method = Network.HttpRequest.Method.Get;
    if (pageToken) {
        request.url += '?&pageToken=' + pageToken;
    }
    Network.performAuthorizedHttpRequest(request, (response) => {
        //@ts-ignore
        if (JSON.parse(response.body).nextPageToken) {
            callback(response, true);
            //@ts-ignore
            getMyAnimations(callback, JSON.parse(response.body).nextPageToken.toString());
        }
        else {
            callback(response, false);
        }
    });
}
export function promptToAnimation(prompt, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations/:with-prompt';
    request.method = Network.HttpRequest.Method.Post;
    const data = {
        "prompt": prompt,
        "animationType": "bitmoji"
    };
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function getAnimationById(animationId, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations' + "/" + animationId;
    request.method = Network.HttpRequest.Method.Get;
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function deleteAnimationById(animationId, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations' + "/" + animationId;
    request.method = Network.HttpRequest.Method.Delete;
    Network.performAuthorizedHttpRequest(request, (response) => {
        if (callback) {
            callback(response);
        }
    });
}
export function uploadAnimation(assetPath, name, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/uploads';
    request.method = Network.HttpRequest.Method.Post;
    const formData = new Network.FormData();
    const headers = {
        'Content-Disposition': `form-data; name="media"; filename="${name + ""}"`
    };
    const data = FileSystem.readBytes(assetPath);
    formData.append(data, headers);
    request.body = formData;
    request.contentType = 'multipart/form-data';
    Network.performAuthorizedHttpRequest(request, (response) => {
        if (response.statusCode === 201) {
            getAnimationId(JSON.parse(response.body).uid, callback);
        }
        else {
            callback({ statusCode: 400 });
        }
    });
}
export function getAnimationId(attachmentId, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations/:with-video';
    request.method = Network.HttpRequest.Method.Post;
    const data = {
        "prompt": "",
        "negativePrompt": "",
        "attachmentId": attachmentId
    };
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function proceedWithSelectedTrack(animation_id, trackIndex, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + `/api/animations/${animation_id}:proceed-with-selected-track`;
    request.method = Network.HttpRequest.Method.Put;
    const data = {
        "track_index": trackIndex
    };
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function downloadFile(url, callback) {
    const request = new Network.HttpRequest();
    request.url = url + "";
    request.method = Network.HttpRequest.Method.Get;
    Network.performHttpRequest(request, function (response) {
        callback(response);
    });
}
export function me(callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me';
    request.method = Network.HttpRequest.Method.Get;
    Network.performAuthorizedHttpRequest(request, function (response) {
        callback(response);
    });
}
