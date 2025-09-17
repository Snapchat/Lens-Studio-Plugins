// @ts-nocheck
import * as Network from 'LensStudio:Network';
import * as FileSystem from 'LensStudio:FileSystem';

const BASE_URL = 'https://ml.snap.com';

export function getMyAnimations(callback: Function, pageToken?: any, filter?: any) {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations';
    request.method = Network.HttpRequest.Method.Get;

    if (filter) {
        request.url += "?filter[]=type%3D" + filter;
    }

    if (pageToken) {
        if (!filter) {
            request.url += '?';
        }
        request.url += '&pageToken=' + pageToken;
    }

    Network.performAuthorizedHttpRequest(request, (response) => {
        //@ts-ignore
        if (JSON.parse(response.body).nextPageToken) {
            callback(response, true);
            //@ts-ignore
            getMyAnimations(callback, JSON.parse(response.body).nextPageToken.toString(), filter);
        }
        else{
            callback(response, false);
        }
    });
}

export function promptToAnimation(prompt: string, callback: Function): any {
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

export function uploadFile(assetPath: string, callback: Function): any {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations/:with-existing-animation';
    request.method = Network.HttpRequest.Method.Post;

    const formData = new Network.FormData();
    const fileName: string = assetPath.toString().split('/').pop() as string;

    const headers = {
        'Content-Disposition': `form-data; name="media"; filename=${fileName + ""}`
    };

    const data = FileSystem.readBytes(assetPath);
    formData.append(data, headers);

    request.body = formData;
    request.contentType = 'multipart/form-data';

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function blendAnimations(animations: string[], callback: Function): any {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations/:with-stitching';
    request.method = Network.HttpRequest.Method.Post;

    const data = {
        "animation_ids": animations
    };

    request.body = JSON.stringify(data);
    request.contentType = 'application/json';

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export async function blendAnimationsPromise(animations: string[]): Promise<any> {
    return new Promise((resolve) => {
        blendAnimations(animations, (response) => {
            resolve(response);
        });
    });
}

export function getAnimationById(animationId: string, callback: Function): any {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations' + "/" + animationId;
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, (response) => {
        callback(response);
    });
}

export function deleteAnimationById(animationId: string, callback?: Function): any {
    const request = new Network.HttpRequest();
    request.url = BASE_URL + '/api/animations' + "/" + animationId;
    request.method = Network.HttpRequest.Method.Delete;

    Network.performAuthorizedHttpRequest(request, (response) => {
        if (callback) {
            callback(response);
        }
    });
}

export function uploadAnimation(assetPath: Editor.Path, name: string, callback: Function): any {
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
            getAnimationId(JSON.parse(response.body as unknown as string).uid, callback);
        }
        else {
            callback({statusCode: 400});
        }
    });
}

export function getAnimationId(attachmentId: string, callback: Function) {
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

export function proceedWithSelectedTrack(animation_id: string, trackIndex: number, callback: Function) {
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

export function downloadFile(url: string, callback: Function) {
    const request = new Network.HttpRequest();
    request.url = url + "";
    request.method = Network.HttpRequest.Method.Get;

    Network.performHttpRequest(request, function(response) {
        callback(response);
    })
}

export function me(callback: Function) {
    const request = new Network.HttpRequest();
    request.url = 'https://ml.snap.com/api/me';
    request.method = Network.HttpRequest.Method.Get;

    Network.performAuthorizedHttpRequest(request, function(response) {
        callback(response);
    });
}
