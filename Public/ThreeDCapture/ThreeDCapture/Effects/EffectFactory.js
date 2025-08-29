export function buildCreateRequest(controls) {
    const request = {
        "uploadUid": ""
    }
    if (controls["imageReferencePicker"].value[0]) {
        request.uploadUid = controls["imageReferencePicker"].value[0].uid;
    }
    return request;
}

export function buildSelectRequest(controls) {
    const request = {
        "prompt": ""
    }

    request.prompt = controls["promptPicker"].value;

    return request;
}
