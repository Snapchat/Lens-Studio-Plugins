const presets = {
    'Default': {
        'diversity_preserve_weight': 0.1,
        'eye_pupil_location_preserve_weight': 0.003,
        'skintone_preserve_weight': 0.0,
        'id_preserve_weight': 0,
        'eye_pupil_location_preserve': true
    },
    'Beauty': {
        'diversity_preserve_weight': 0.1,
        'eye_pupil_location_preserve_weight': 0.03,
        'skintone_preserve_weight': 0.1,
        'id_preserve_weight': 0,
        'eye_pupil_location_preserve': true
    },
    'Cartoon': {
        'diversity_preserve_weight': 0.05,
        'eye_pupil_location_preserve_weight': 0.003,
        'skintone_preserve_weight': 0.0,
        'id_preserve_weight': 0.3,
        'eye_pupil_location_preserve': false
    },
    'Fun': {
        'diversity_preserve_weight': 0.1,
        'eye_pupil_location_preserve_weight': 0.003,
        'skintone_preserve_weight': 0.0,
        'id_preserve_weight': 0.3,
        'eye_pupil_location_preserve': false
    },
    'Emotions' : {
        'diversity_preserve_weight': 0.05,
        'eye_pupil_location_preserve_weight': 0.003,
        'skintone_preserve_weight': 0.0,
        'id_preserve_weight': 0.3,
        'eye_pupil_location_preserve': false
    },
    'Creepy': {
        'diversity_preserve_weight': 0.1,
        'eye_pupil_location_preserve_weight': 0.003,
        'skintone_preserve_weight': 0.0,
        'id_preserve_weight': 0.2,
        'eye_pupil_location_preserve': false
    }
};

const postProcessingPresets = {
    'Beauty': {
    },
    'Cartoon': {
    },
    'Fun': {
    },
    'Emotions': {
    },
    'Creepy': {
    },
    'Default': {
    }
};

export function buildEffectDataFromPreset(preset, controls) {
    const request = {
        'userNotes': '',
        'settings': {
        }
    };

    if (controls['promptPicker'].mode == 'Text') {
        request.effectTypeId = 'face-text';
        request.settings.target_class = controls['promptPicker'].value;
    } else if (controls['promptPicker'].mode = 'Image') {
        request.effectTypeId = 'face-image';
        request.settings.target_images = controls['promptPicker'].value;
    }

    request.settings.num_steps = controls['effectIntensitySettings'].backendValue;

    for (const key in presets[preset]) {
        request.settings[key] = presets[preset][key];
    }

    request.userNotes = controls["userNotes"].value;

    return request;
}

export function buildEffectDataFromResponse(response, controls) {
    const request = {
        'userNotes': response.userNotes,
        'settings': {
            'eye_pupil_location_preserve': response.settings.eye_pupil_location_preserve
        }
    };

    if (controls['promptPicker'].mode == 'Text') {
        request.effectTypeId = 'face-text';
        request.settings.target_class = controls['promptPicker'].value;
    } else if (controls['promptPicker'].mode = 'Image') {
        request.effectTypeId = 'face-image';
        request.settings.target_images = controls['promptPicker'].value;
    }

    request.settings.num_steps = controls['effectIntensitySettings'].backendValue;

    for (const key in presets['Default']) {
        request.settings[key] = response.settings[key];
    }

    request.userNotes = controls["userNotes"].value;

    return request;
}

export function buildPostProcessingDataFromPreset(preset, controls, effectId) {
    const request = {
        'effectId': effectId,
        'postprocessingSettings': {
            'user_settings': {
                'retouch': false,
                'face_parts': {
                    'eyes': {
                        'geometry_source': 'effect',
                        'fix_closing': 'no'
                    },
                    'mouth': {
                    },
                    'nose': {
                    },
                    'ears': {
                    },
                    'brows': {
                    },
                    'face_shape': {
                    },
                    'hair': {
                    }
                }
            }
        }
    };

    request.postprocessingSettings.user_settings.stylization_strength = controls['userIdentitySettings'].backendValue;

    request.postprocessingSettings.user_settings.human_like_texture = controls['userSkinTextureSettings'].backendValue;
    request.postprocessingSettings.user_settings.copy_skin_tone = controls['userSkinToneSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.eyes.preserve_content = controls['eyesPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.mouth.preserve_content = controls['mouthPreservationSettings'].backendValue;

    if (request.postprocessingSettings.user_settings.face_parts.mouth.preserve_content == 'max') {
        request.postprocessingSettings.user_settings.face_parts.mouth.geometry_source = 'original';
    } else {
        request.postprocessingSettings.user_settings.face_parts.mouth.geometry_source = 'effect';
    }

    request.postprocessingSettings.user_settings.face_parts.nose.geometry_source = controls['nosePreservationSettings'].backendValue;

    if (request.postprocessingSettings.user_settings.face_parts.nose.geometry_source == 'effect') {
        request.postprocessingSettings.user_settings.face_parts.nose.preserve_content = 'no';
    } else {
        request.postprocessingSettings.user_settings.face_parts.nose.preserve_content = 'max';
    }

    request.postprocessingSettings.user_settings.face_parts.ears.preserve_content = controls['earsPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.brows.geometry_source = controls['browsPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.face_shape.geometry_source = controls['faceContourPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.hair.preserve_content = controls['hairPreservationSettings'].backendValue;

    return request;
}

export function buildPostProcessingDataFromResponse(response, controls, effectId) {
    const request = {
        'effectId': effectId,
        'postprocessingSettings': {
            'user_settings': {
                'retouch': response.postprocessingSettings.user_settings.retouch,
                'face_parts': {
                    'eyes': {
                        'geometry_source': response.postprocessingSettings.user_settings.face_parts.eyes.geometry_source,
                        'fix_closing': response.postprocessingSettings.user_settings.face_parts.eyes.fix_closing
                    },
                    'mouth': {
                    },
                    'nose': {
                    },
                    'ears': {
                    },
                    'brows': {
                    },
                    'face_shape': {
                    },
                    'hair': {
                    }
                }
            },
        }
    };

    request.postprocessingSettings.dataset = response.postprocessingSettings.dataset;
    request.postprocessingSettings.user_settings.stylization_strength = controls['userIdentitySettings'].backendValue;

    request.postprocessingSettings.user_settings.image_restoration = response.postprocessingSettings.user_settings.image_restoration;
    request.postprocessingSettings.user_settings.human_like_texture = controls['userSkinTextureSettings'].backendValue;
    request.postprocessingSettings.user_settings.copy_skin_tone = controls['userSkinToneSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.eyes.preserve_content = controls['eyesPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.mouth.preserve_content = controls['mouthPreservationSettings'].backendValue;

    if (request.postprocessingSettings.user_settings.face_parts.mouth.preserve_content == 'max') {
        request.postprocessingSettings.user_settings.face_parts.mouth.geometry_source = 'original';
    } else {
        request.postprocessingSettings.user_settings.face_parts.mouth.geometry_source = 'effect';
    }

    request.postprocessingSettings.user_settings.face_parts.nose.geometry_source = controls['nosePreservationSettings'].backendValue;

    if (request.postprocessingSettings.user_settings.face_parts.nose.geometry_source == 'effect') {
        request.postprocessingSettings.user_settings.face_parts.nose.preserve_content = 'no';
    } else {
        request.postprocessingSettings.user_settings.face_parts.nose.preserve_content = 'max';
    }

    request.postprocessingSettings.user_settings.face_parts.ears.preserve_content = controls['earsPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.brows.geometry_source = controls['browsPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.face_shape.geometry_source = controls['faceContourPreservationSettings'].backendValue;
    request.postprocessingSettings.user_settings.face_parts.hair.preserve_content = controls['hairPreservationSettings'].backendValue;

    return request;
}
