import { convertIntensityToAPIStyle, getRandomInt } from '../utils.js';

export function buildAssetData(controls, skipMorphing, parentId) {
    const request = {
        "settings": {
            'prompt': '',
            'intensity': '',
            'skipMorphing': false,
            'parentId': null,
            'pipeline': "headmorph",
            'speedQuality': false,
            'seed': getRandomInt(1, Math.pow(2, 31) - 1)
        },
        "userNotes": "",
        "uploadUid": null
    };

    if (controls['promptPicker'].mode == "Text") {
        request.settings.prompt = controls["promptPicker"].value;
    } else if (controls['promptPicker'].mode == "Image") {
        request.settings.prompt = controls["promptPicker"].value.textReference;
        request.uploadUid = controls["promptPicker"].value.imagesData[0].uid;
    }

    request.settings.intensity = convertIntensityToAPIStyle(controls['intensitySettings'].value);
    if (skipMorphing != null) {
        request.settings.skipMorphing = skipMorphing;
    }

    if (parentId != null) {
        request.settings.parentId = parentId;
    }

    request.userNotes = controls["userNotes"].value;

    return request;
}
