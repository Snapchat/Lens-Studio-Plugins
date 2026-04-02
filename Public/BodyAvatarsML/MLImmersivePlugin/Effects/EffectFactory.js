export function buildEffectData(controls) {
    const request = {
        'userNotes': '',
        'effectTypeId': 'full-frame-body-avatars',
        'settings': {
            'seed': 42,
            'face_swap_mode': controls['faceSwap'].value ? 'cartoon-v2' : 'disabled',
            'enable_preprocessing': controls['humanoidAnatomy'].value ? false : true
        }
    };

    request.settings.image_prompts = controls['imageReferencePicker'].value;

    return request;
}
export function buildEffectDataFromResponse(response, controls) {
    const request = {
        'userNotes': '',
        'effectTypeId': 'full-frame-body-avatars',
        'settings': {
            'seed': 42,
            'face_swap_mode': controls['faceSwap'].value ? 'cartoon-v2' : 'disabled',
            'enable_preprocessing': controls['humanoidAnatomy'].value ? false : true
        }
    };

    request.settings.image_prompts = controls['imageReferencePicker'].value;

    return request;
}

export function buildPostProcessingData(effectId) {
    const request = {
        'effectId': effectId, // use this from effect post response
        'postprocessingSettings': {
        }
    };
    return request;
}

export function buildPostProcessingDataFromResponse(effectId) {
    const request = {
        'effectId': effectId, // use this from effect post response
        'postprocessingSettings': {
        }
    };

    return request;
}
