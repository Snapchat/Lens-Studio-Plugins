export function buildAssetData(controls, includeAttachment) {
    const request = {
        'prompt': '',
        'negativePrompt': '',
        'attachmentId': null,
        'shadowless': false
    };

    request.prompt = controls['promptPicker'].value;

    if (request.prompt.length === 0) {
        request.prompt = null;
    }

    request.negativePrompt = controls['negativePromptPicker'].value;

    const images = controls['imageReferencePicker'].value;

    if (includeAttachment && images.length > 0) {
        request.attachmentId = images[0].id;
    }

    return request;
}
