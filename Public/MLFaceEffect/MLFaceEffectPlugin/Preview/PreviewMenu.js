import * as Ui from 'LensStudio:Ui';

import { tieWidgets, convertDate, createGuidelinesWidget } from '../utils.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { TabSelection, createTabSelection } from '../Effects/Controls/TabSelection.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { Slider, createSlider } from '../Effects/Controls/Slider.js';
import { UserNotesPicker, createUserNotesPicker } from '../Effects/Controls/UserNotesPicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createEffect, createPostProcessing } from '../api.js';
import {
    buildEffectDataFromPreset,
    buildEffectDataFromResponse, buildPostProcessingDataFromPreset,
    buildPostProcessingDataFromResponse
} from '../Effects/EffectFactory.js';

import app from '../../application/app.js';

import { logEventAssetCreation } from '../../application/analytics.js';
import {createModelType} from "../Effects/Controls/ModelType";
import {EnhancedSettingsDescriptor} from "../Effects/EnhancedSettingsDescriptor";
import {createEnhancedPromptPicker, EnhancedPromptPicker} from "../Effects/Controls/EnhancedPromptPicker";
import {createSeed, Seed} from "../Effects/Controls/Seed";
import {HintID} from "../Hints/HintFactory";

export class PreviewMenu {
    constructor(onStateChanged, resetParent, setDefaultState, setPreviewState) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.presetList = ['Default', 'Emotions', 'Beauty', 'Cartoon', 'Fun', 'Creepy'];
        this.resetParent = resetParent;
        this.setDefaultState = setDefaultState;
        this.setPreviewState = setPreviewState;
        this.presetCustomizedFlag = false;
        this.wasPresetTapped = false;
    }

    createEffect(controls) {
        this.editEffectButton.enabled = false;

        app.log(`Creating new ${app.name}...`, { 'progressBar': true });

        let effectData;
        if (this.wasPresetTapped) {
            effectData = buildEffectDataFromPreset(this.presetControl.value, controls);
        }
        else {
            effectData = buildEffectDataFromResponse(this.effectSettings, controls);
        }

        let inputFormat = controls['promptPicker'].mode == "Image" ? "PROMPT_IMAGE" : "PROMPT_TEXT";

        if (this.settingsWidget.currentIndex === 0) {
            effectData = {
                "userNotes": "",
                "effectTypeId": "face-enhanced",
                "settings": {
                    "image_prompts": controls['enhancedPromptPicker'].imageValue,
                    "text_prompt": controls['enhancedPromptPicker'].textValue,
                    "image_reference_strength": this.convertSliderValue(controls['referenceStrength'].value, 1.0, 10.0, 0.5, 2.5),
                    "attributes_preservation": this.convertSliderValue(controls['attributesPreservation'].value, 1.0, 10.0, 1.0, 2.0),
                    "seed": this.controls['seed'].value
                }
            }

            inputFormat = "TEXT_AND_IMAGE";
        }

        createEffect(effectData, (effectResponse) => {
            if (effectResponse.statusCode == 201) {
                const effectBody = JSON.parse(effectResponse.body.toString());
                const effectId = effectBody.id;

                let postProcessingData;
                if (this.wasPresetTapped) {
                    postProcessingData = buildPostProcessingDataFromPreset(this.presetControl.value, controls, effectId);
                }
                else {
                    postProcessingData = buildPostProcessingDataFromResponse(this.postProcessingSettings, controls, effectId);
                }

                createPostProcessing(postProcessingData, (postProcessingResponse) => {
                    if (postProcessingResponse.statusCode == 201) {
                        this.onStateChanged({
                            'screen': 'default',
                            'needsUpdate': true,
                            'creation': true,
                        });
                        logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat);
                        if (effectBody.effectTypeId === 'face-enhanced') {
                            app.log(`${app.name} is queued. ${app.name} creation is estimated to take up to 5 minutes, please check back later.`, {'progressBar': true});
                        }
                        else {
                            app.log(`${app.name} is queued. ${app.name} creation is estimated to take 10-15 min, please check back later.`, {'progressBar': true});
                        }
                    } else {
                        app.log('Something went wrong, please try again.');
                        logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat);
                    }
                    this.editEffectButton.enabled = true;
                });
            } else if (effectResponse.statusCode == 400) {
                app.log('The result violates our community guidelines');
                logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat);
                this.editEffectButton.enabled = true;
            } else {
                app.log('Something went wrong, please try again.');
                logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat);
                this.editEffectButton.enabled = true;
            }
        });
    }

    fillSettings(effect_settings, post_processing_settings) {
        this.effectSettings = effect_settings;
        this.postProcessingSettings = post_processing_settings;
        this.status = 'SUCCESS';

        if (effect_settings) {
            // choose model type
            if (effect_settings.effectTypeId == 'face-enhanced') {
                this.settingsWidget.currentIndex = 0;
                this.controls['modelType'].showEnhancedButton();
                this.controls['enhancedPromptPicker'].textValue = effect_settings.settings.text_prompt;
                this.controls['enhancedPromptPicker'].imageValue = JSON.parse(JSON.stringify(effect_settings.settings.image_prompts));

                this.controls['referenceStrength'].value = this.convertSliderValue(effect_settings.settings.image_reference_strength, 0.5, 2.5, 1.0, 10.0);
                this.controls['attributesPreservation'].value = this.convertSliderValue(effect_settings.settings.attributes_preservation, 1.0, 2.0, 1.0, 10.0);
                this.controls['seed'].value = effect_settings.settings.seed;

                this.lockEnhanced();
            }
            else {
                this.settingsWidget.currentIndex = 1;
                this.controls['modelType'].showStandardButton();
                if (effect_settings.effectTypeId == 'face-text') {
                    this.controls['promptPicker'].mode = 'Image';
                    this.controls['promptPicker'].value = [];
                    this.controls['promptPicker'].mode = 'Text';
                    this.controls['promptPicker'].value = effect_settings.settings.target_class;

                } else if (effect_settings.effectTypeId == 'face-image') {
                    this.controls['promptPicker'].mode = 'Text';
                    this.controls['promptPicker'].value = '';
                    this.controls['promptPicker'].mode = 'Image';
                    this.controls['promptPicker'].value = JSON.parse(JSON.stringify(effect_settings.settings.target_images));
                }

                this.controls['promptPicker'].widget.enabled = true;

                this.controls['effectIntensitySettings'].backendValue = effect_settings.settings.num_steps;
                this.controls['effectIntensitySettings'].widget.enabled = true;

                this.lockStandard();
            }
        } else {
            this.status = 'FAILED';
            this.editEffectButton.enabled = false;

            this.controls['promptPicker'].mode = 'Text';
            this.controls['promptPicker'].value = '';
            this.controls['promptPicker'].widget.enabled = false;

            this.controls['effectIntensitySettings'].reset();
            this.controls['effectIntensitySettings'].widget.enabled = false;
        }

        if (post_processing_settings) {
            this.controls['userSkinTextureSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.human_like_texture;
            this.controls['userSkinToneSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.copy_skin_tone;
            this.controls['userIdentitySettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.stylization_strength;
            this.controls['eyesPreservationSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.face_parts.eyes.preserve_content;
            this.controls['mouthPreservationSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.face_parts.mouth.preserve_content;
            this.controls['nosePreservationSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.face_parts.nose.geometry_source;
            this.controls['earsPreservationSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.face_parts.ears.preserve_content;
            this.controls['browsPreservationSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.face_parts.brows.geometry_source;
            this.controls['faceContourPreservationSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.face_parts.face_shape.geometry_source;
            this.controls['hairPreservationSettings'].backendValue = post_processing_settings.postprocessingSettings.user_settings.face_parts.hair.preserve_content;

            // this.setStandardSettingsState(true);
        } else {
            this.status = 'FAILED';
            this.editEffectButton.enabled = false;

            this.controls['userSkinTextureSettings'].reset();
            this.controls['userSkinToneSettings'].reset();
            this.controls['userIdentitySettings'].reset();
            this.controls['eyesPreservationSettings'].reset();
            this.controls['mouthPreservationSettings'].reset();
            this.controls['nosePreservationSettings'].reset();
            this.controls['earsPreservationSettings'].reset();
            this.controls['browsPreservationSettings'].reset();
            this.controls['faceContourPreservationSettings'].reset();
            this.controls['hairPreservationSettings'].reset();

            this.setStandardSettingsState(false);
        }
    }

    lockEnhanced() {
        this.generateButton.visible = false;
        this.controls['enhancedPromptPicker'].lock();
        this.controls['referenceStrength'].widget.enabled = false;
        this.controls['attributesPreservation'].widget.enabled = false;
        this.controls['seed'].widget.enabled = false;
    }

    unlockEnhanced() {
        this.generateButton.visible = true;
        this.controls['enhancedPromptPicker'].unlock();
        this.controls['referenceStrength'].widget.enabled = this.controls['enhancedPromptPicker'].imagePickerValue.length > 0 && !this.controls['enhancedPromptPicker'].locked;
        this.controls['attributesPreservation'].widget.enabled = true;
        this.controls['seed'].widget.enabled = true;
    }

    lockStandard() {
        this.generateButton.visible = false;
        this.controls['promptPicker'].widget.enabled = false;
        this.controls['effectIntensitySettings'].widget.enabled = false;
        this.presetControl.widget.enabled = false;
        this.setStandardSettingsState(false);
    }

    unlockStandard() {
        this.generateButton.visible = true;
        this.controls['promptPicker'].widget.enabled = true;
        this.controls['effectIntensitySettings'].widget.enabled = true;
        this.presetControl.widget.enabled = true;
        this.setStandardSettingsState(true);
    }

    setStandardSettingsState(state) {
        this.controls['userSkinTextureSettings'].widget.enabled = state;
        this.controls['userSkinToneSettings'].widget.enabled = state;
        this.controls['userIdentitySettings'].widget.enabled = state;
        this.controls['eyesPreservationSettings'].widget.enabled = state;
        this.controls['mouthPreservationSettings'].widget.enabled = state;
        this.controls['nosePreservationSettings'].widget.enabled = state;
        this.controls['earsPreservationSettings'].widget.enabled = state;
        this.controls['browsPreservationSettings'].widget.enabled = state;
        this.controls['faceContourPreservationSettings'].widget.enabled = state;
        this.controls['hairPreservationSettings'].widget.enabled = state;
    }

    convertSliderValue(sliderValue, xMin, xMax, yMin, yMax) {
        const scale = (sliderValue - xMin) / (xMax - xMin);
        return yMin + scale * (yMax - yMin);
    }

    reset() {
        this.presetControl.value = 'Default';
        this.controls['userNotes'].value = "";
        this.fillSettings(this.effectSettings, this.postProcessingSettings);
        this.presetCustomizedFlag = false;
        this.wasPresetTapped = false;
    }

    updatePreview(state) {
        this.presetControl.value = 'Default';
        this.editEffectButton.visible = true;
        this.setPreviewState();
        this.createdOnValue.text = convertDate(state.created_on);
        if (state.userNotes) {
            this.controls['userNotes'].value = state.userNotes;
        } else {
            this.controls['userNotes'].value = "";
        }

        this.fillSettings(state.effect_get_response, state.post_processing_get_response);
        this.presetCustomizedFlag = false;
        this.wasPresetTapped = false;
    }

    isLocked() {
        return !this.generateButton.visible;
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(33);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 16, 8);

        const arrowImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/arrow.svg')));

        this.backButton = new Ui.ImageView(this.header);
        this.backButton.pixmap = arrowImage;
        this.backButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.backButton.setFixedHeight(Ui.Sizes.IconSide);
        this.backButton.setFixedWidth(Ui.Sizes.IconSide);
        this.backButton.scaledContents = true;

        this.connections.push(this.backButton.onClick.connect(function() {
            this.resetParent();
            this.onStateChanged({
                'screen': 'default',
                'needsUpdate': false,
            });
        }.bind(this)));

        app.log('', { 'enabled': false });

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = "Effect Settings";
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;
        this.headerTitle.foregroundRole = Ui.ColorRole.BrightText;

        headerLayout.addWidget(this.backButton);

        const spacer = new Ui.Widget(this.header);
        spacer.setFixedWidth(8);
        headerLayout.addWidget(spacer);
        headerLayout.addWidget(this.headerTitle);
        headerLayout.addStretch(0);

        this.deleteButton = new Ui.PushButton(this.header);
        this.deleteButton.setFixedHeight(20);
        this.deleteButton.text = '';
        const deleteImagePath = new Editor.Path(import.meta.resolve('../Resources/delete.svg'));
        this.deleteButton.setIconWithMode(Editor.Icon.fromFile(deleteImagePath), Ui.IconMode.MonoChrome);

        headerLayout.addWidgetWithStretch(this.deleteButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        this.header.layout = headerLayout;
        return this.header;
    }

    getDeleteButton() {
        return this.deleteButton;
    }

    setGenerateButton(button) {
        this.generateButton = button;
        this.connections.push(this.generateButton.onClick.connect(() => {
            this.generateButton.enabled = false;
            this.createEffect(this.controls);
        }));
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(16, 0, 16, 0);

        this.editEffectButton = new Ui.PushButton(this.footer);
        this.editEffectButton.text = `Copy Settings`;

        this.connections.push(this.editEffectButton.onClick.connect(() => {
            // this.createEffect(this.controls);
            this.editEffectButton.visible = false;
            this.unlockEnhanced();
            this.unlockStandard();
            this.setDefaultState();
        }));

        // footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.editEffectButton, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        // footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        // Created on settings
        const createdOnSettings = new Ui.Widget(this.menu);

        const createdOnLabel = new Ui.Label(createdOnSettings);
        createdOnLabel.text = 'Created on';

        this.createdOnValue = new Ui.Label(createdOnSettings);
        this.createdOnValue.text = '29/03/2023';
        this.createdOnValue.autoFillBackground = true;
        this.createdOnValue.backgroundRole = Ui.ColorRole.Light;
        this.createdOnValue.setContentsMargins(8, 4, 8, 4);

        tieWidgets(createdOnLabel, this.createdOnValue, createdOnSettings);

        // Settings
        const guidelines = createGuidelinesWidget(this.menu);

        this.menuLayout.addWidget(guidelines);
        this.menuLayout.addWidget(createdOnSettings);

        // Preset
        this.presetControl = new ComboBox(this.menu, 'Preset', null, null, this.presetList);

        const createControl = (scheme) => {
            switch (scheme.class) {
                case TabSelection:
                    this.controls[scheme.name] = createTabSelection(scheme);
                    break;
                case CheckBox:
                    this.controls[scheme.name] = createCheckBox(scheme);
                    break;
                case PromptPicker:
                    this.controls[scheme.name] = createPromptPicker(scheme);
                    break;
                case EnhancedPromptPicker:
                    this.controls[scheme.name] = createEnhancedPromptPicker(scheme);
                    break;
                case ComboBox:
                    this.controls[scheme.name] = createComboBox(scheme);
                    break;
                case Slider:
                    this.controls[scheme.name] = createSlider(scheme);
                    break;
                case UserNotesPicker:
                    this.controls[scheme.name] = createUserNotesPicker(scheme);
                    break;
                case Seed:
                    this.controls[scheme.name] = createSeed(scheme);
                    break;
            }

            if (scheme.preset_based) {
                this.presetControl.addOnValueChanged((preset) => {
                    const control = this.controls[scheme.name];
                    control.value = scheme.preset_values[preset];
                    this.presetCustomizedFlag = false;
                    this.wasPresetTapped = true;
                });

                this.controls[scheme.name].addOnValueChanged((value) => {
                    this.presetCustomizedFlag = true;
                });
            }

            return this.controls[scheme.name];
        };

        const createGroup = (scheme) => {
            const groupWidget = new Ui.Widget(scheme.parent);
            groupWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
            const layout = new Ui.BoxLayout();
            layout.setContentsMargins(0, Ui.Sizes.Spacing, 0, 0);

            layout.setDirection(Ui.Direction.TopToBottom);

            const collapsePanel = new Ui.CollapsiblePanel(Editor.Icon.fromFile(scheme.iconPath), scheme.label, scheme.parent);
            collapsePanel.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
            collapsePanel.overrideBackgroundRole = false;
            collapsePanel.setContentsMargins(0, 0, 0, 0);
            collapsePanel.autoFillBackground = true;
            collapsePanel.backgroundRole = Ui.ColorRole.Base;
            collapsePanel.expand(scheme.expanded);

            scheme.items.forEach((item) => {
                if (item.type == 'control') {
                    layout.addWidget(createControl(item).widget);
                }
            });

            groupWidget.layout = layout;

            collapsePanel.setContentWidget(groupWidget);

            return collapsePanel;
        };

        const createSeparator = (scheme) => {
            const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Raised, scheme.parent);
            separator.foregroundRole = Ui.ColorRole.BrightText;
            separator.setContentsMargins(0, 0, 0, 0);
            return separator;
        };

        this.controls['modelType'] = createModelType(this.menu, "Model Type", HintID.standard_mode, HintID.enhanced_mode);
        this.menuLayout.addWidget(this.controls['modelType'].widget);

        this.settingsWidget = new Ui.StackedWidget(this.menu);

        this.standardSettingsWidget = new Ui.Widget(this.settingsWidget);
        this.standardSettingsLayout = new Ui.BoxLayout();
        this.standardSettingsLayout.setDirection(Ui.Direction.TopToBottom);
        this.standardSettingsLayout.setContentsMargins(0, 0, 0, 0);
        this.standardSettingsWidget.layout = this.standardSettingsLayout;

        this.enhancedSettingsWidget = new Ui.Widget(this.settingsWidget);
        this.enhancedSettingsLayout = new Ui.BoxLayout();
        this.enhancedSettingsLayout.setDirection(Ui.Direction.TopToBottom);
        this.enhancedSettingsLayout.setContentsMargins(0, 0, 0, 0);
        this.enhancedSettingsWidget.layout = this.enhancedSettingsLayout;

        this.settingsWidget.addWidget(this.enhancedSettingsWidget);
        this.settingsWidget.addWidget(this.standardSettingsWidget);

        this.settingsWidget.currentIndex = 1;

        this.controls['modelType'].addOnValueChanged((value) => {
            this.settingsWidget.currentIndex = value;
        });

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);
        this.enhancedSettingsScheme = new EnhancedSettingsDescriptor().getSettingsDescriptor(this.enhancedSettingsWidget);

        this.settingsScheme.items.forEach((settingItem) => {
            switch (settingItem.type) {
                case 'control':
                    this.standardSettingsLayout.addWidget(createControl(settingItem).widget);
                    break;
                case 'group':
                    this.standardSettingsLayout.addWidget(createGroup(settingItem));
                    break;
                case 'separator':
                    this.standardSettingsLayout.addWidget(createSeparator(settingItem));
                    break;
                case 'presetPicker':
                    this.standardSettingsLayout.addWidget(this.presetControl.widget);
                    break;
            }
        });

        this.enhancedSettingsScheme.items.forEach((settingItem) => {
            switch (settingItem.type) {
                case 'control':
                    this.enhancedSettingsLayout.addWidget(createControl(settingItem).widget);
                    break;
                case 'separator':
                    this.enhancedSettingsLayout.addWidget(createSeparator(settingItem));
                    break;
            }
        })

        this.controls['promptPicker'].addOnValueChanged((value) => {
            this.editEffectButton.enabled = value.length > 0 && this.status == 'SUCCESS';
            if (this.generateButton) {
                this.generateButton.enabled = value.length > 0 && this.status == 'SUCCESS';
            }
        });

        this.controls['enhancedPromptPicker'].addOnValueChanged((value) => {
            this.editEffectButton.enabled = this.controls['enhancedPromptPicker'].valueExists && this.status == 'SUCCESS';
            this.controls['referenceStrength'].widget.enabled = this.controls['enhancedPromptPicker'].imagePickerValue.length > 0 && !this.controls['enhancedPromptPicker'].locked;
            if (this.generateButton) {
                this.generateButton.enabled = this.controls['enhancedPromptPicker'].valueExists && this.status == 'SUCCESS';
            }
        });

        this.standardSettingsLayout.addStretch(0);
        this.enhancedSettingsLayout.addStretch(0);

        this.menuLayout.addWidget(this.settingsWidget);
        this.menuLayout.addStretch(0);

        this.menuLayout.setContentsMargins(16, 8, 16, 8);
        this.menuLayout.spacing = Ui.Sizes.Padding;
        this.menu.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        this.menu.layout = this.menuLayout;

        const scrollWidget = new Ui.Widget(this.menu);
        scrollWidget.layout = this.menuLayout;
        const verticalScrollArea = new Ui.VerticalScrollArea(this.menu);
        verticalScrollArea.setWidget(scrollWidget);
        verticalScrollArea.setFixedHeight(520);
        verticalScrollArea.setFixedWidth(378);
        const scrollLayout = new Ui.BoxLayout();
        scrollLayout.setDirection(Ui.Direction.TopToBottom);
        scrollLayout.setContentsMargins(0, 0, 0, 0);
        const scrollPositionLabel = new Ui.Label(this.menu);

        scrollLayout.addWidget(verticalScrollArea);
        scrollLayout.addWidget(scrollPositionLabel);

        this.menu.layout = scrollLayout;

        return this.menu;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(378);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);
        const menu = this.createMenu(this.widget);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.layout.addWidget(header);
        // const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        // separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        // this.layout.addWidget(separator1);
        this.layout.addWidget(menu);
        this.layout.addStretch(0);

        const separator2 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator2.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator2);

        this.layout.addWidget(footer);

        this.widget.backgroundRole = Ui.ColorRole.Base;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
