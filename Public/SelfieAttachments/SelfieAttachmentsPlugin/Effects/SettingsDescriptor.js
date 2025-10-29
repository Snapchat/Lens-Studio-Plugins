import { PromptPicker } from './Controls/PromptPicker.js';
import { HintID } from '../Hints/HintFactory.js';
import { SpinBox } from './Controls/SpinBox.js';
import { ImageReferencePicker } from './Controls/ImageReferencePicker.js';

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
                    'label': 'Attachments Prompt',
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
                    'preset_based': false,
                    'hint': {
                        'id': HintID.image_reference
                    }
                },
                {
                    'type': 'control',
                    'class': SpinBox,
                    'parent': parent,
                    'name': "seedPicker",
                    'label': 'Seed',
                    'importer': null,
                    'exporter': null,
                    'min': 1,
                    'max': 2147483646,
                    'randomizer': true,
                    'hint': {
                        'id': HintID.seed
                    }
                }
            ]
        };
    }
}
