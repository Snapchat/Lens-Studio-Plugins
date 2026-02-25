import { PromptPicker } from './Controls/PromptPicker.js';
import { HintID } from '../Hints/HintFactory.js';
import { SpinBox } from './Controls/SpinBox.js';
import { ImageReferencePicker } from './Controls/ImageReferencePicker.js';
import { ComboBox } from './Controls/ComboBox.js';

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
                    },
                    'placeholder': 'Describe the Attachment...',
                    'surpriseMeList': [
                        'Make me wear a vibrant unicorn wig with a horn and large ears',
                        'A person wearing a purple wig, a floral unicorn headband, unicorn ears, and a glowing unicorn horn',
                        'Put a large colorful butterfly on my nose',
                        'Create a beautiful floral headband made of sunflowers',
                        'I want to wear an ancient Roman helmet',
                        'Make me wear a large clown nose',
                        'A person with an octopus sitting on their head'
                    ]
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
                    'class': ComboBox,
                    'parent': parent,
                    'name': 'stylePicker',
                    'label': 'Style',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'options': ['Default', 'Cartoon', 'Realistic'],
                    'hint': {
                        'id': HintID.style
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
                },
                {
                    'type': 'control',
                    'class': PromptPicker,
                    'parent': parent,
                    'name': 'animationPromptPicker',
                    'label': 'Animation Prompt (Optional)',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'preset_based': false,
                    'hint': null,
                    'placeholder': 'Describe the Animation...',
                    'surpriseMeList': [
                        'Bouncing happily',
                        'Spinning around in a quick joyful twirl',
                        'Floating gently up and down like in zero gravity',
                        'Doing a little dance with rhythmic movement',
                        'Waving or flapping as if greeting the viewer',
                        'Stretching, yawning, and then striking a cute pose',
                        'Zooming forward excitedly, then returning to place',
                        'Tilting side to side with a fun, curious look',
                        'Jumping excitedly',
                        'Waving goodbye'
                    ]
                },
            ]
        };
    }
}
