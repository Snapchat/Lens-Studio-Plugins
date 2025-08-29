import * as Network from 'LensStudio:Network';
import * as FileSystem from 'LensStudio:FileSystem';

export function getBlendedAnimation(fbxAssetsPath, callback) {
    const formData = new Network.FormData();

    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/skeletal-animations:retarget';

    request.method = Network.HttpRequest.Method.Post;

    fbxAssetsPath.forEach(function (fbxAssetPath) {
        const data = FileSystem.readBytes(fbxAssetPath);

        const headers = {
            'Content-Disposition': `form-data; name="animations"; filename="${fbxAssetPath}"`,
            'Content-Type': "application/octet-stream"
        };

        formData.append(data, headers);
    })

    request.body = formData;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
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

export function acceptTerms(terms, callback) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me/terms?terms=' + terms;
    request.method = Network.HttpRequest.Method.Put;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}
