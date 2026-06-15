// @ts-nocheck
import * as Network from 'LensStudio:Network';
const BASE_URL = 'https://ml.snap.com';
export function listDreams(maxPageSize, callback, searchQuery, pageToken) {
    const request = new Network.HttpRequest();
    let url = BASE_URL + '/api/dreams?maxPageSize=' + maxPageSize;
    url += '&filter[]=dream_type%3DCLIPS';
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
export function favoriteDream(dreamId, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams/' + dreamId + ':favorite';
    request.method = Network.HttpRequest.Method.Put;
    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}
export function unfavoriteDream(dreamId, callback) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/dreams/' + dreamId + ':unfavorite';
    request.method = Network.HttpRequest.Method.Put;
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
