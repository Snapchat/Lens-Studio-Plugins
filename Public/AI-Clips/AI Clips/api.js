// @ts-nocheck
import * as Network from 'LensStudio:Network';
const BASE_URL = 'https://ml.snap.com';
export function getMyDreams(callback, pageToken = null) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams';
    request.method = Network.HttpRequest.Method.Get;
    if (pageToken) {
        request.url += '?pageToken=' + pageToken;
        request.url += '&';
    }
    else {
        request.url += '?';
    }
    request.url += 'filter[]=dream_type%3DCLIPS';
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
        //@ts-ignore
        if (JSON.parse(response.body).nextPageToken) {
            //@ts-ignore
            getMyDreams(callback, JSON.parse(response.body).nextPageToken.toString());
        }
    });
}
export function createDream(prompt, seed, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams';
    request.method = Network.HttpRequest.Method.Post;
    const data = {
        "prompt": prompt,
        "seed": seed,
        "dreamType": "CLIPS"
    };
    request.body = JSON.stringify(data);
    request.contentType = 'application/json';
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function getDreamByID(id, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams/' + id;
    request.method = Network.HttpRequest.Method.Get;
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function createPack(id, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + `/api/dreams/${id}:pack`;
    request.method = Network.HttpRequest.Method.Post;
    request.contentType = 'application/json';
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function deleteById(animationId, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams' + "/" + animationId;
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
