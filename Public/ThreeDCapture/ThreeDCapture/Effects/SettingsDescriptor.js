import { PromptPicker } from './Controls/PromptPicker.js';
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
                    'class': ImageReferencePicker,
                    'parent': parent,
                    'name': 'imageReferencePicker',
                    'label': 'Video Reference',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false
                },
                {
                    'type': 'control',
                    'class': PromptPicker,
                    'parent': parent,
                    'name': 'promptPicker',
                    'label': 'Object to select',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'preset_based': false,
                    'hint': {
                        'id': HintID.prompt
                    }
                }
            ]
        };
    }
}
