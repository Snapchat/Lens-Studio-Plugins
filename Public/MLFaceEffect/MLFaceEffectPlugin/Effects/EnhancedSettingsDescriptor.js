
import {HintID} from "../Hints/HintFactory.js";
import {EnhancedPromptPicker} from "./Controls/EnhancedPromptPicker.js";
import {Slider} from "./Controls/Slider";
import {Seed} from "./Controls/Seed";

export class EnhancedSettingsDescriptor {

    constructor() {}

    getSettingsDescriptor(parent) {
        return {
            'items': [
                {
                    'type': 'control',
                    'class': EnhancedPromptPicker,
                    'parent': parent,
                    'name': 'enhancedPromptPicker',
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
                    }
                },
                {
                    'type': 'control',
                    'class': Slider,
                    'parent': parent,
                    'name': 'referenceStrength',
                    'label': 'Reference Strength',
                    'importer': function(value) {
                        return value / 1000;
                    },
                    'exporter': function(value) {
                        return Math.round(value * 1000);
                    },
                    'min': 1,
                    'max': 10,
                    'step': 0.01,
                    'hint': {
                        'id': HintID.reference_strength
                    }
                },
                {
                    'type': 'control',
                    'class': Slider,
                    'parent': parent,
                    'name': 'attributesPreservation',
                    'label': 'Attributes Preservation',
                    'importer': function(value) {
                        return value / 1000;
                    },
                    'exporter': function(value) {
                        return Math.round(value * 1000);
                    },
                    'min': 1,
                    'max': 10,
                    'step': 0.01,
                    'hint': {
                        'id': HintID.attributes_preservation
                    }
                },
                {
                    'type': 'separator',
                    'parent': parent,
                },
                {
                    'type': 'control',
                    'class': Seed,
                    'parent': parent,
                    'name': 'seed',
                    'label': 'Seed',
                    'importer': null,
                    'exporter': null,
                    'preset_based': false,
                    'prompt_hint': {
                        'id': HintID.seed
                    },
                    'min': 0,
                    'max': 2147483647,
                    'step': 1,
                },
            ]
        }
    }
}
