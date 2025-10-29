import { PromptPicker } from './Controls/PromptPicker.js';
import { ClothSelection } from './Controls/ClothSelection.js';
import { HintID } from '../Hints/HintFactory.js';


export class SettingsDescriptor {
    constructor() {
    }

    getSettingsDescriptor(parent) {
        return {
            'items': [
                {
                    'type': 'control',
                    'class': ClothSelection,
                    'parent': parent,
                    'name': 'garmentType',
                    'label': 'Select Type',
                    'importer': null,
                    'exporter': (option) => {
                        switch (option) {
                            case 'Hoodie':
                                return "hoodie";
                            case 'Sweater':
                                return "sweater";
                            case 'T-shirt':
                                return "t-shirt";
                            case 'Dress suit':
                                return "dress-suit";
                            case 'Bomber Jacket':
                                return "bomber-jacket";
                        }
                    },
                    'hint': null,
                    'default_value': 'Hoodie',
                    'options': [
                        {
                            "name": "Hoodie",
                            "preview_label": "Hoodie",
                            "preview_image": "hoodie.png",
                        },
                        {
                            "name": "Sweater",
                            "preview_label": "Sweater",
                            "preview_image": "sweater.png",
                        },
                        {
                            "name": "T-shirt",
                            "preview_label": "T-shirt",
                            "preview_image": "tshirt.png",
                        },
                        {
                            "name": "Dress suit",
                            "preview_label": "Dress Suit",
                            "preview_image": "suit.png"
                        },
                        {
                            "name": "Bomber Jacket",
                            "preview_label": "Bomber",
                            "preview_image": "bomber.png"
                        }
                    ]
                },
                {
                    'type': 'control',
                    'class': PromptPicker,
                    'parent': parent,
                    'name': 'promptPicker',
                    'label': 'Prompt',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'hint': {
                        'id': HintID.prompt
                    },
                    'default_value': ""
                }
            ]
        };
    }
}
