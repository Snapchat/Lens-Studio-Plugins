import { PromptPicker } from './Controls/PromptPicker.js';
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
                        'id': HintID.image_hint
                    }
                },
                // {
                //     'type': 'control',
                //     'class': UserNotesPicker,
                //     'parent': parent,
                //     'name': 'userNotes',
                //     'label': 'User notes',
                //     'importer': null,
                //     'exporter': null,
                //     'preset_based': false,
                //     'placeholder': "Enter user notes here..."
                // },
            ]
        };
    }
}
