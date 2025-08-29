import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { buildEffectDataFromPreset, buildPostProcessingDataFromPreset } from '../Effects/EffectFactory.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { TabSelection, createTabSelection } from '../Effects/Controls/TabSelection.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { Slider, createSlider } from '../Effects/Controls/Slider.js';
import { UserNotesPicker, createUserNotesPicker } from '../Effects/Controls/UserNotesPicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createEffect, createPostProcessing } from '../api.js';

import app from '../../application/app.js';
import { logEventAssetCreation } from '../../application/analytics.js';

export class CreationMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.resetParent = resetParent;
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.presetList = ['Default', 'Emotions', 'Beauty', 'Cartoon', 'Fun', 'Creepy'];
        this.stopped = false;
        this.presetCustomizedFlag = false;
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
    }

    generateEffect(controls) {
        this.generateButton.enabled = false;

        app.log(`Creating new ${app.name}...`, { 'progressBar': true });

        const effectData = buildEffectDataFromPreset(this.presetControl.value, controls);
        const inputFormat = controls['promptPicker'].mode == "Image" ? "PROMPT_IMAGE" : "PROMPT_TEXT";
        const preset = this.presetControl.value.toUpperCase();
        const settings = this.presetCustomizedFlag ? "CUSTOM" : "DEFAULT";

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
                        app.log(`${app.name} is queued. ${app.name} creation is estimated to take 10-15 min, please check back later.`, { 'progressBar': true });
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
        this.headerTitle.text = app.name;
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addStretch(0);
        headerLayout.addWidget(this.headerTitle);
        headerLayout.addStretch(0);

        this.header.layout = headerLayout;
        return this.header;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(65);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);
        footerLayout.spacing = 0;

        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate';
        this.generateButton.enabled = false;
        this.generateButton.primary = true;
        const editImagePath = new Editor.Path(import.meta.resolve('../Resources/lens_studio_ai.svg'));
        this.generateButton.setIconWithMode(Editor.Icon.fromFile(editImagePath), Ui.IconMode.MonoChrome);
        this.connections.push(this.generateButton.onClick.connect(function() {
            this.generateEffect(this.controls);
        }.bind(this)));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.generateButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        this.menuLayout.addWidget(createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(createTermsWidget(this.menu));

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
                case ComboBox:
                    this.controls[scheme.name] = createComboBox(scheme);
                    break;
                case Slider:
                    this.controls[scheme.name] = createSlider(scheme);
                    break;
                case UserNotesPicker:
                    this.controls[scheme.name] = createUserNotesPicker(scheme);
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
            collapsePanel.backgroundRole = Ui.ColorRole.Midlight;
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
            const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, scheme.parent);
            separator.foregroundRole = Ui.ColorRole.BrightText;
            separator.setContentsMargins(0, 0, 0, 0);
            return separator;
        };

        this.settingsScheme.items.forEach((settingItem) => {
            switch (settingItem.type) {
                case 'control':
                    this.menuLayout.addWidget(createControl(settingItem).widget);
                    break;
                case 'group':
                    this.menuLayout.addWidget(createGroup(settingItem));
                    break;
                case 'separator':
                    this.menuLayout.addWidget(createSeparator(settingItem));
                    break;
                case 'presetPicker':
                    this.menuLayout.addWidget(this.presetControl.widget);
                    break;
            }
        });

        this.presetControl.value = 'Default';

        this.controls['promptPicker'].addOnValueChanged((value) => {
            this.generateButton.enabled = !this.stopped && (value.length > 0);
        });

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
        verticalScrollArea.setFixedWidth(320);
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

    create(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setFixedWidth(320);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);
        const menu = this.createMenu(this.widget);

        this.layout.addWidget(header);
        const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        this.layout.addWidget(separator1);
        this.layout.addWidget(menu);

        const separator2 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator2.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator2);

        this.layout.addWidget(footer);

        this.widget.backgroundRole = Ui.ColorRole.Midlight;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
};
