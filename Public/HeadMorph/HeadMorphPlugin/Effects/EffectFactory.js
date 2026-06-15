export function buildAssetData(controls) {
    const request = {
        'prompt': null,
        'seed': 2147483647,
        'uploadUid': null
    };

    const prompt = controls['promptPicker'].value;

    if (prompt.length > 0) {
        request.prompt = prompt;
    }

    const images = controls['imageReferencePicker'].value;

    if (images.length > 0) {
        request.uploadUid = images[0].uid;
    }
    return request;
}
