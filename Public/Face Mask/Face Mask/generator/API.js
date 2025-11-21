import * as Network from 'LensStudio:Network';
// General API utility functions for authentication, terms, and guidelines
export function versions(callback) {
    const request = new Network.HttpRequest();
    const url = 'https://ml.snap.com/api/versions';
    request.url = url;
    request.method = Network.HttpRequest.Method.Get;
    Network.performAuthorizedHttpRequest(request, function (response) {
        if (response.statusCode === 200) {
            callback(JSON.parse(response.body.toString()).versions);
        }
        else {
            callback([-1]);
        }
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
export function acceptTerms(terms, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me/terms?terms=' + terms;
    request.method = Network.HttpRequest.Method.Put;
    Network.performAuthorizedHttpRequest(request, function (response) {
        callback(response);
    });
}
