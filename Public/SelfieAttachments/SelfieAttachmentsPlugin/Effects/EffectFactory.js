export function buildAssetData(controls) {
    const request = {
        'prompt': null,
        'seed': controls['seedPicker'].value,
        'uploadUid': null,
        'promptAnimation': null,
        'style': controls['stylePicker'].value.toUpperCase()
    };

    const prompt = controls['promptPicker'].value;

    if (prompt.length > 0) {
        request.prompt = prompt;
    }

    const images = controls['imageReferencePicker'].value;

    if (images.length > 0) {
        request.uploadUid = images[0].uid;
    }

    const animationPrompt = controls['animationPromptPicker'].value;

    if (animationPrompt.length > 0) {
        request.promptAnimation = animationPrompt;
    }

    return request;
}

export function buildAnimationUpdateData(controls) {
    const request = {
        'promptAnimation': controls['animationPromptPicker'].value,
    };

    return request;
}
