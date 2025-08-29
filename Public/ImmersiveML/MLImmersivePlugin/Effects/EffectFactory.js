export function buildEffectData(controls) {
    const request = {
        'userNotes': '',
        'settings': {
            'num_steps': 0
        }
    };

    if (controls['promptPicker'].mode == 'Text') {
        if (controls['promptPicker'].effectType == 'Realistic') {
            request.effectTypeId = 'full-frame-realistic-text';
        }
        else {
            request.effectTypeId = 'full-frame-text';
        }
        request.settings.text_prompt = controls['promptPicker'].value;
    } else if (controls['promptPicker'].mode = 'Image') {
        request.effectTypeId = 'full-frame-image';
        request.settings.image_prompts = controls['promptPicker'].value;
    }

    request.userNotes = controls["userNotes"].value;

    return request;
}

export function buildEffectDataFromResponse(response, controls) {
    const request = {
        'userNotes': '',
        'settings': {
            'num_steps': response.settings.num_steps
        }
    };

    if (controls['promptPicker'].mode == 'Text') {
        if (controls['promptPicker'].effectType == 'Realistic') {
            request.effectTypeId = 'full-frame-realistic-text';
        }
        else {
            request.effectTypeId = 'full-frame-text';
        }
        request.settings.text_prompt = controls['promptPicker'].value;
    } else if (controls['promptPicker'].mode = 'Image') {
        request.effectTypeId = 'full-frame-image';
        request.settings.image_prompts = controls['promptPicker'].value;
    }

    request.userNotes = controls["userNotes"].value;

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
