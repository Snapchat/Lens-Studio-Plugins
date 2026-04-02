
import {HintID} from "../Hints/HintFactory.js";
import {EnhancedPromptPicker} from "./Controls/EnhancedPromptPicker.js";
import {getRandomAdvancedPrompt} from "../utils.js";

export class AdvancedSettingsDescriptor {

    constructor() {}

    getSettingsDescriptor(parent) {
        return {
            'items': [
                {
                    'type': 'control',
                    'class': EnhancedPromptPicker,
                    'parent': parent,
                    'name': 'advancedPromptPicker',
                    'textLabel': 'Effect Prompt',
                    'imageLabel': 'Image Reference',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'prompt_hint': {
                        'id': HintID.effect_prompt
                    },
                    'image_hint': {
                        'id': HintID.image_reference
                    },
                    'randomPromptFn': getRandomAdvancedPrompt
                },
            ]
        }
    }
}
