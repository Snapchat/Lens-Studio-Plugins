import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { buildEffectDataFromPreset, buildPostProcessingDataFromPreset } from '../Effects/EffectFactory.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { TabSelection, createTabSelection } from '../Effects/Controls/TabSelection.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import {createEnhancedPromptPicker, EnhancedPromptPicker} from "../Effects/Controls/EnhancedPromptPicker.js";
import { Slider, createSlider } from '../Effects/Controls/Slider.js';
import { UserNotesPicker, createUserNotesPicker } from '../Effects/Controls/UserNotesPicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createEffect, createPostProcessing } from '../api.js';

import app from '../../application/app.js';
import { logEventAssetCreation } from '../../application/analytics.js';
import {EnhancedSettingsDescriptor} from "../Effects/EnhancedSettingsDescriptor";
import {createSeed, Seed} from "../Effects/Controls/Seed";
import {createModelType} from "../Effects/Controls/ModelType";
import {HintID} from "../Hints/HintFactory";

export class CreationMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.resetParent = resetParent;
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.presetList = ['Default', 'Emotions', 'Beauty', 'Cartoon', 'Fun', 'Creepy'];
        this.stopped = false;
        this.presetCustomizedFlag = false;
        this.enhancedSettingsCustomizedFlag = false;
    }

    init() {
        this.stopped = false;
        this.reset(true);
    }

    stop() {
        this.stopped = true;
        this.reset(true);
    }

    reset(hard) {
        if (hard) {
            this.presetControl.value = 'Default';
        } else {
            this.presetControl.value = this.presetControl.value;
        }

        this.presetCustomizedFlag = false;
        this.controls['promptPicker'].mode = 'Text';
        this.controls['promptPicker'].value = '';
        this.controls['promptPicker'].mode = 'Image';
        this.controls['promptPicker'].value = [];

        this.controls['userNotes'].value = '';

        this.controls['enhancedPromptPicker'].textValue = '';
        this.controls['enhancedPromptPicker'].imageValue = [];
        this.controls['referenceStrength'].value = 5.5;
        this.controls['attributesPreservation'].value = 5.5;
        this.controls['seed'].value = 56;

        this.enhancedSettingsCustomizedFlag = false;
    }

    generateEffect(controls) {
        this.generateButton.enabled = false;

        app.log(`Creating new ${app.name}...`, { 'progressBar': true });

        let effectData = buildEffectDataFromPreset(this.presetControl.value, controls);
        let inputFormat = controls['promptPicker'].mode == "Image" ? "PROMPT_IMAGE" : "PROMPT_TEXT";
        let preset = this.presetControl.value.toUpperCase();
        let settings = this.presetCustomizedFlag ? "CUSTOM" : "DEFAULT";

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
            preset = "";
            settings = this.enhancedSettingsCustomizedFlag ? "CUSTOM" : "DEFAULT";
        }

        createEffect(effectData, (effectResponse) => {
            if (effectResponse.statusCode == 201) {
                const effectBody = JSON.parse(effectResponse.body.toString());
                const effectId = effectBody.id;

                const postProcessingData = buildPostProcessingDataFromPreset(this.presetControl.value, controls, effectId);

                createPostProcessing(postProcessingData, (postProcessingResponse) => {
                    if (postProcessingResponse.statusCode == 201) {
                        this.resetParent({
                            'needsUpdate': true
                        });

                        logEventAssetCreation("SUCCESS", "NEW", inputFormat, preset, settings);
                        if (effectBody.effectTypeId === 'face-enhanced') {
                            app.log(`${app.name} is queued. ${app.name} creation is estimated to take up to 5 minutes, please check back later.`, {'progressBar': true});
                        }
                        else {
                            app.log(`${app.name} is queued. ${app.name} creation is estimated to take 10-15 min, please check back later.`, {'progressBar': true});
                        }
                    } else {
                        logEventAssetCreation("FAILED", "NEW", inputFormat, preset, settings);
                        app.log('Something went wrong during post-processing creation, please try again.');
                    }
                });
            } else if (effectResponse.statusCode == 400) {
                logEventAssetCreation("GUIDELINES_VIOLATION", "NEW", inputFormat, preset, settings);
                app.log('The result violates our community guidelines');
            } else {
                logEventAssetCreation("FAILED", "NEW", inputFormat, preset, settings);
                app.log('Something went wrong during effect creation, please try again.');
            }
        });
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(33);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

        this.headerTitle = new Ui.Label(this.header);
        // this.headerTitle.text = app.name;
        this.headerTitle.text = "New Effect";
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;
        this.headerTitle.foregroundRole = Ui.ColorRole.BrightText;

        headerLayout.addStretch(0);
        headerLayout.addWidget(this.headerTitle);
        headerLayout.addStretch(0);

        this.header.layout = headerLayout;
        return this.header;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);
        footerLayout.spacing = 0;

        this.footer.layout = footerLayout;
        return this.footer;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        this.menuLayout.addWidget(createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(createTermsWidget(this.menu));

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

        this.settingsWidget.currentIndex = 0;

        this.controls['modelType'].addOnValueChanged((value) => {
            this.settingsWidget.currentIndex = value;
        });

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.standardSettingsWidget);
        this.enhancedSettingsScheme = new EnhancedSettingsDescriptor().getSettingsDescriptor(this.enhancedSettingsWidget);

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

        this.presetControl.value = 'Default';

        this.controls['referenceStrength'].value = 5.5;
        this.controls['attributesPreservation'].value = 5.5;
        this.controls['seed'].value = 56;

        this.controls['referenceStrength'].addOnValueChanged(() => {
            this.enhancedSettingsCustomizedFlag = true;
        })

        this.controls['attributesPreservation'].addOnValueChanged(() => {
            this.enhancedSettingsCustomizedFlag = true;
        })

        this.controls['promptPicker'].addOnValueChanged((value) => {
            this.generateButton.enabled = !this.stopped && (value.length > 0);
        });

        this.controls['enhancedPromptPicker'].addOnValueChanged((value) => {
            this.generateButton.enabled = !this.stopped && this.controls['enhancedPromptPicker'].valueExists;
            this.controls['referenceStrength'].widget.enabled = this.controls['enhancedPromptPicker'].imagePickerValue.length > 0;
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

        this.reset();

        return this.menu;
    }

    convertSliderValue(sliderValue, xMin, xMax, yMin, yMax) {
        const scale = (sliderValue - xMin) / (xMax - xMin);
        return yMin + scale * (yMax - yMin);
    }

    setGenerateButton(button) {
        this.generateButton = button;
        this.connections.push(this.generateButton.onClick.connect(function() {
            this.generateEffect(this.controls);
        }.bind(this)));
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setFixedWidth(378);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);
        const menu = this.createMenu(this.widget);

        this.layout.addWidget(header);
        // const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        // separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        // this.layout.addWidget(separator1);
        this.layout.addWidget(menu);

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
};
