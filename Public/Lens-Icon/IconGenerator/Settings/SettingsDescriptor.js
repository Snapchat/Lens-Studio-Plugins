import { PromptPicker } from './PromptPicker.js';
import { ComboBox } from './ComboBox.js';
import { IconSelection } from './IconSelection.js';
import { HintID } from './Hints/HintFactory.js';

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
                    'hint': {
                        'id': HintID.prompt
                    },
                    'default_value': ""
                },
                {
                    'type': 'control',
                    'class': ComboBox,
                    'parent': parent,
                    'name': 'stylePicker',
                    'label': 'Style',
                    'importer': null,
                    'exporter': function(style) {
                        switch(style) {
                            case 'Vector art':
                                return {
                                    "promptDecorator": "vector art, 2d",
                                    "analyticsKey": "VECTOR_ART"
                                }
                            case 'Cyberpunk':
                                return {
                                    "promptDecorator": "futuristic, cyberpunk",
                                    "analyticsKey": "CYBERPUNK"
                                }
                            case 'Hyper-realistic':
                                return {
                                    "promptDecorator": "hyper-realistic, realism",
                                    "analyticsKey": "HYPER_REALISTIC"
                                }
                            case 'Steampunk':
                                return {
                                    "promptDecorator": "highly detailed, steampunk",
                                    "analyticsKey": "STEAMPUNK"
                                }
                            case 'Cartoon':
                                return {
                                    "promptDecorator": "cartoon, cute",
                                    "analyticsKey": "CARTOON"
                                }
                            case 'Watercolors':
                                return {
                                    "promptDecorator": "watercolors, drawing",
                                    "analyticsKey": "WATERCOLORS"
                                }
                            case 'Oil painting':
                                return {
                                    "promptDecorator": "oil painting, art",
                                    "analyticsKey": "OIL_PAINTING"
                                }
                            case 'Pixel art':
                                return {
                                    "promptDecorator": "pixel art, 8 bit, low resolution, pixelated",
                                    "analyticsKey": "PIXEL_ART"
                                }
                            case 'Art deco':
                                return {
                                    "promptDecorator": "art deco",
                                    "analyticsKey": "ART_DECO"
                                }
                            case 'Mosaic':
                                return {
                                    "promptDecorator": "mosaic",
                                    "analyticsKey": "MOSAIC"
                                }
                            case 'None':
                                return {
                                    "promptDecorator": "",
                                    "analyticsKey": "NONE"
                                }
                        }
                    },
                    'hint': null,
                    'default_value': 'Vector art',
                    'options': ['Vector art', 'Cyberpunk', 'Hyper-realistic', 'Steampunk', 'Cartoon', 'Watercolors', 'Oil painting', 'Pixel art', 'Art deco', 'Mosaic', 'None'],
                },
                {
                    'type': 'control',
                    'class': IconSelection,
                    'parent': parent,
                    'name': 'iconSelection',
                    'importer': null,
                    'exporter': null,
                    'hint': null,
                    'default_value': -1,
                    'size': 4
                },
            ]
        };
    }
}
