import * as FileSystem from 'LensStudio:FileSystem';
import * as Network from 'LensStudio:Network';
const BASE_URL = 'https://ml.snap.com';
export function uploadVideo(assetPath, name, callback) {
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
            getAnimatorId(JSON.parse(response.body).uid, callback);
        }
        else {
            callback({ statusCode: response.statusCode });
        }
    });
}
export function getAnimatorId(uploadUid, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator';
    request.method = Network.HttpRequest.Method.Post;
    const data = {
        "uploadUid": uploadUid
    };
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function getAnimatorById(animator_id, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator/' + animator_id;
    request.method = Network.HttpRequest.Method.Get;
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function generateAnimator(animator_id, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator/generate?animator_id=' + animator_id;
    request.method = Network.HttpRequest.Method.Post;
    request.contentType = 'application/json';
    Network.performAuthorizedHttpRequest(request, (response) => {
        if (callback) {
            callback(response);
        }
    });
}
export function getMyAnimators(callback, pageToken) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator';
    request.method = Network.HttpRequest.Method.Get;
    if (pageToken) {
        request.url += '?&pageToken=' + pageToken;
    }
    Network.performAuthorizedHttpRequest(request, (response) => {
        //@ts-ignore
        if (JSON.parse(response.body).nextPageToken) {
            callback(response);
            //@ts-ignore
            getMyAnimators(callback, JSON.parse(response.body).nextPageToken.toString());
        }
        else {
            callback(response);
        }
    });
}
export function deleteAnimatorById(animator_id, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator/' + animator_id;
    request.method = Network.HttpRequest.Method.Delete;
    Network.performAuthorizedHttpRequest(request, (response) => {
        if (callback) {
            callback(response);
        }
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
