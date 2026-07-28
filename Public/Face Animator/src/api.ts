import * as FileSystem from 'LensStudio:FileSystem';
import * as Network from 'LensStudio:Network';

const BASE_URL = 'https://ml.snap.com';

export function uploadVideo(assetPath: Editor.Path, name: string, callback: Function) {
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
            getAnimatorId(JSON.parse(response.body as unknown as string).uid, callback);
        }
        else {
            callback({statusCode: response.statusCode});
        }
    });
}

export function getAnimatorId(uploadUid: string, callback: Function) {
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

export function getAnimatorById(animator_id: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator/' + animator_id;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function generateAnimator(animator_id: string, callback?: Function) {
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

export function getMyAnimators(callback: Function, pageToken?: any) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator';
    request.method = Network.HttpRequest.Method.Get;

    if (pageToken) {
        request.url += '?&pageToken=' + pageToken;
    }

    Network.performAuthorizedHttpRequest(request, (response) => {
        const body = response.body as unknown as string;
        if (response.statusCode !== 200 || !body) {
            console.error('[Face Animator] getMyAnimators failed: statusCode=' + response.statusCode, console.None);
            // Signal failure with a non-200 status so consumers bail at their own
            // statusCode guard instead of re-parsing an empty/invalid body.
            callback({statusCode: response.statusCode === 200 ? 500 : response.statusCode});
            return;
        }

        let parsed: any;
        try {
            parsed = JSON.parse(body);
        } catch (e) {
            console.error('[Face Animator] Failed to parse animator list:', e, console.None);
            callback({statusCode: 500});
            return;
        }

        callback(response);
        if (parsed.nextPageToken) {
            getMyAnimators(callback, parsed.nextPageToken.toString());
        }
    });
}

export function deleteAnimatorById(animator_id: string, callback?: Function) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animator/' + animator_id;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, (response) => {
        if (callback) {
            callback(response);
        }
    });
}

export function downloadFile(url: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = url + "";
    request.method = Network.HttpRequest.Method.Get;

    Network.performHttpRequest(request, function(response) {
        callback(response);
    })
}
