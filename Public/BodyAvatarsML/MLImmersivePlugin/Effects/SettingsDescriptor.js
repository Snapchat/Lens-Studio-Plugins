import { PromptPicker } from './Controls/PromptPicker.js';
import { UserNotesPicker } from './Controls/UserNotesPicker.js';

import { HintID } from '../Hints/HintFactory.js';
import { ImageReferencePicker } from './Controls/ImageReferencePicker.js';
import { CheckBox } from './Controls/CheckBox.js';

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
                    'label': 'Image Reference',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'hint': {
                        'id': HintID.imagePrompt
                    }
                },
                {
                    'type': 'control',
                    'class': CheckBox,
                    'parent': parent,
                    'name': 'humanoidAnatomy',
                    'label': 'Non-humanoid anatomy',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'hint': {
                        'id': HintID.humanoidAnatomy
                    }
                }
            ]
        };
    }
}
