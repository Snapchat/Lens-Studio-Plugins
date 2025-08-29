import { ComboBox } from './Controls/ComboBox.js';
import { PromptPicker } from './Controls/PromptPickerWithMedia.js';
import { CheckBox } from './Controls/CheckBox.js'
import { UserNotesPicker } from './Controls/UserNotesPicker.js';
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
                    'prompt_hint': {
                        'id': HintID.prompt
                    },
                    'image_hint': {
                        'id': HintID.image
                    }
                },
                {
                    'type': 'control',
                    'class': ComboBox,
                    'parent': parent,
                    'name': 'intensitySettings',
                    'label': 'Intensity',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'options': ['Low', 'Medium', 'High'],
                    'hint': {
                        'id': HintID.intensity
                    }
                },
                {
                    'type': 'control',
                    'class': CheckBox,
                    'parent': parent,
                    'name': 'headlessSettings',
                    'label': "Remove Head",
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'hint': {
                        'id': HintID.headless
                    }
                },
                {
                    'type': 'control',
                    'class': UserNotesPicker,
                    'parent': parent,
                    'name': 'userNotes',
                    'label': 'User notes',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'placeholder': "Enter user notes here..."
                },
            ]
        };
    }
}
