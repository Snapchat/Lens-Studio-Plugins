import { CheckBox } from './Controls/CheckBox.js';
import { PromptPicker } from './Controls/PromptPicker.js';
import { NegativePromptPicker } from './Controls/NegativePromptPicker.js';
import { ImageReferencePicker } from './Controls/ImageReferencePicker.js';
import { HintID } from '../Hints/HintFactory.js';

export class SettingsDescriptor {
    constructor() {
    }

    getSettingsDescriptor(parent) {
        return {
            'items': [
                {
                    'type': 'control',
                    'class': PromptPicker,
                    'parent': parent,
                    'name': 'promptPicker',
                    'label': 'Prompt',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'preset_based': false,
                    'hint': {
                        'id': HintID.prompt
                    }
                },
                {
                    'type': 'control',
                    'class': ImageReferencePicker,
                    'parent': parent,
                    'name': 'imageReferencePicker',
                    'label': 'Image Reference',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false
                },
                {
                    'type': 'control',
                    'class': NegativePromptPicker,
                    'parent': parent,
                    'name': 'negativePromptPicker',
                    'label': 'Negative Prompt',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'hint': {
                        'id': HintID.negative_prompt
                    }
                }
            ]
        };
    }
}
