import { CheckBox } from './Controls/CheckBox.js';
import { PromptPicker } from './Controls/PromptPicker.js';
import { TabSelection } from './Controls/TabSelection.js';
import { Slider } from './Controls/Slider.js';
import { UserNotesPicker } from './Controls/UserNotesPicker.js';

import { HintID } from '../Hints/HintFactory.js';

export class SettingsDescriptor {
    constructor() {
    }

    getSettingsDescriptor(parent) {
        const preservationTabSelectionImporter = (backendValue) => {
            const importMap = {
                // ["no", "weak", "average", "max"]
                'no': 'Off',
                'weak': 'Low',
                'average': 'Mid',
                'max': 'Max'
            };

            return importMap[backendValue];
        };

        const preservationTabSelectionExporter = (tabValue) => {
            const exportMap = {
                'Off': 'no',
                'Low': 'weak',
                'Mid': 'average',
                'Max': 'max'
            };

            return exportMap[tabValue];
        };

        const identityTabToStylizationStrengthImporter = (backendValue) => {
            const importMap = {
                // ["no", "weak", "average", "max"]
                'weak': 'Max',
                'average': 'Mid',
                'strong': 'Low',
                'max': 'Off'
            };

            return importMap[backendValue];
        };

        const identityTabToStylizationStrengthExporter = (tabValue) => {
            const exportMap = {
                'Off': 'max',
                'Low': 'strong',
                'Mid': 'average',
                'Max': 'weak'
            };

            return exportMap[tabValue];
        };

        const preservationTypeToTab = function(value) {
            const importMap = {
                'original': 'Max',
                'effect': 'Off'
            };
            return importMap[value];
        };

        const TabToPreservationType = function(value) {
            const exportMap = {
                'Max': 'original',
                'Off': 'effect'
            };
            return exportMap[value];
        };

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
                    'type': 'separator',
                    'parent': parent,
                },
                {
                    'type': 'presetPicker'
                },
                {
                    'type': 'group',
                    'parent': parent,
                    'iconPath': new Editor.Path(import.meta.resolve('../Resources/settings.svg')),
                    'label': 'Settings',
                    'expanded': true,
                    'items': [
                        {
                            'type': 'control',
                            'class': Slider,
                            'parent': parent,
                            'name': 'effectIntensitySettings',
                            'label': 'Effect Intensity',
                            'importer': function(value) {
                                return value / 1000;
                            },
                            'exporter': function(value) {
                                return Math.round(value * 1000);
                            },
                            'min': 0,
                            'max': 1,
                            'step': 0.01,
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 0.3,
                                'Cartoon': 0.75,
                                'Emotions': 1,
                                'Fun': 0.75,
                                'Creepy': 1,
                                'Default': 1
                            },
                            'hint': {
                                'id': HintID.intensity
                            }
                        },
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'userIdentitySettings',
                            'label': 'User Identity',
                            'importer': identityTabToStylizationStrengthImporter,
                            'exporter': identityTabToStylizationStrengthExporter,
                            'tabs': ['Off', 'Low', 'Mid', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Max',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.user_identity
                            }
                        },
                        {
                            'type': 'control',
                            'class': CheckBox,
                            'parent': parent,
                            'name': 'userSkinToneSettings',
                            'label': 'User Skin Tone',
                            'importer': function(value) {
                                return Boolean(value);
                            },
                            'exporter': function(value) {
                                return Boolean(value);
                            },
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': true,
                                'Cartoon': false,
                                'Emotions': false,
                                'Fun': false,
                                'Creepy': false,
                                'Default': true
                            },
                            'hint': {
                                'id': HintID.user_skin_tone
                            }
                        },
                        {
                            'type': 'control',
                            'class': CheckBox,
                            'parent': parent,
                            'name': 'userSkinTextureSettings',
                            'label': 'User Skin Texture',
                            'importer': null,
                            'exporter': null,
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': false,
                                'Cartoon': false,
                                'Emotions': true,
                                'Fun': true,
                                'Creepy': false,
                                'Default': false
                            },
                            'hint': {
                                'id': HintID.user_skin_texture
                            }
                        }
                    ]
                },
                {
                    'type': 'group',
                    'parent': parent,
                    'iconPath': new Editor.Path(import.meta.resolve('../Resources/segmentation.svg')),
                    'label': 'Advanced User Identity Preservation',
                    'expanded': false,
                    'items': [
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'eyesPreservationSettings',
                            'label': 'Eyes',
                            'importer': preservationTabSelectionImporter,
                            'exporter': preservationTabSelectionExporter,
                            'tabs': ['Off', 'Low', 'Mid', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Mid',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.eyes_preservation
                            }
                        },
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'mouthPreservationSettings',
                            'label': 'Mouth',
                            'importer': preservationTabSelectionImporter,
                            'exporter': preservationTabSelectionExporter,
                            'tabs': ['Off', 'Low', 'Mid', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Max',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.mouth_preservation
                            }
                        },
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'nosePreservationSettings',
                            'label': 'Nose',
                            'importer': (backendValue) => {
                                const importMap = {
                                    'effect': 'Off',
                                    'original': 'Max',
                                };

                                return importMap[backendValue];
                            },
                            'exporter': (backendValue) => {
                                const exportMap = {
                                    'Off': 'effect',
                                    'Max': 'original',
                                };

                                return exportMap[backendValue];
                            },
                            'tabs': ['Off', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Max',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.nose_preservation
                            }
                        },
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'earsPreservationSettings',
                            'label': 'Ears',
                            'importer': preservationTabSelectionImporter,
                            'exporter': preservationTabSelectionExporter,
                            'tabs': ['Off', 'Low', 'Mid', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Max',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.ears_preservation
                            }
                        },
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'browsPreservationSettings',
                            'label': 'Brows',
                            'importer': preservationTypeToTab,
                            'exporter': TabToPreservationType,
                            'tabs': ['Off', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Off',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.brows_preservation
                            }
                        },
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'faceContourPreservationSettings',
                            'label': 'Face Contour',
                            'importer': preservationTypeToTab,
                            'exporter': TabToPreservationType,
                            'tabs': ['Off', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Off',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.face_contour_preservation
                            }
                        },
                        {
                            'type': 'control',
                            'class': TabSelection,
                            'parent': parent,
                            'name': 'hairPreservationSettings',
                            'label': 'Hair',
                            'importer': preservationTabSelectionImporter,
                            'exporter': preservationTabSelectionExporter,
                            'tabs': ['Off', 'Low', 'Mid', 'Max'],
                            'preset_based': true,
                            'preset_values': {
                                'Beauty': 'Mid',
                                'Cartoon': 'Off',
                                'Emotions': 'Off',
                                'Fun': 'Off',
                                'Creepy': 'Off',
                                'Default': 'Off'
                            },
                            'hint': {
                                'id': HintID.hair_preservation
                            }
                        }
                    ]
                },
                {
                    'type': 'separator',
                    'parent': parent,
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
                }
            ]
        };
    }
}
