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
import { buildEffectDataFromResponse, buildPostProcessingDataFromResponse } from '../Effects/EffectFactory.js';

import app from '../../application/app.js';

import { logEventAssetCreation } from '../../application/analytics.js';

export class PreviewMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.resetParent = resetParent;
    }

    createEffect(controls) {
        this.editEffectButton.enabled = false;

        app.log(`Creating new ${app.name}...`, { 'progressBar': true });

        const effectData = buildEffectDataFromResponse(this.effectSettings, controls);
        const inputFormat = controls['promptPicker'].mode == "Image" ? "PROMPT_IMAGE" : "PROMPT_TEXT";

        createEffect(effectData, (effectResponse) => {
            if (effectResponse.statusCode == 201) {
                const effectBody = JSON.parse(effectResponse.body.toString());
                const effectId = effectBody.id;

                const postProcessingData = buildPostProcessingDataFromResponse(this.postProcessingSettings, controls, effectId);

                createPostProcessing(postProcessingData, (postProcessingResponse) => {
                    if (postProcessingResponse.statusCode == 201) {
                        this.onStateChanged({
                            'screen': 'default',
                            'needsUpdate': true,
                            'creation': true,
                        });
                        logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat);
                        app.log(`${app.name} is queued. ${app.name} creation is estimated to take 10-15 min, please check back later.`);
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

            this.controls['userSkinTextureSettings'].widget.enabled = true;
            this.controls['userSkinToneSettings'].widget.enabled = true;
            this.controls['userIdentitySettings'].widget.enabled = true;
            this.controls['eyesPreservationSettings'].widget.enabled = true;
            this.controls['mouthPreservationSettings'].widget.enabled = true;
            this.controls['nosePreservationSettings'].widget.enabled = true;
            this.controls['earsPreservationSettings'].widget.enabled = true;
            this.controls['browsPreservationSettings'].widget.enabled = true;
            this.controls['faceContourPreservationSettings'].widget.enabled = true;
            this.controls['hairPreservationSettings'].widget.enabled = true;
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

            this.controls['userSkinTextureSettings'].widget.enabled = false;
            this.controls['userSkinToneSettings'].widget.enabled = false;
            this.controls['userIdentitySettings'].widget.enabled = false;
            this.controls['eyesPreservationSettings'].widget.enabled = false;
            this.controls['mouthPreservationSettings'].widget.enabled = false;
            this.controls['nosePreservationSettings'].widget.enabled = false;
            this.controls['earsPreservationSettings'].widget.enabled = false;
            this.controls['browsPreservationSettings'].widget.enabled = false;
            this.controls['faceContourPreservationSettings'].widget.enabled = false;
            this.controls['hairPreservationSettings'].widget.enabled = false;
        }
    }

    reset() {
        this.controls['userNotes'].value = "";
        this.fillSettings(this.effectSettings, this.postProcessingSettings);
    }

    updatePreview(state) {
        this.createdOnValue.text = convertDate(state.created_on);
        if (state.userNotes) {
            this.controls['userNotes'].value = state.userNotes;
        } else {
            this.controls['userNotes'].value = "";
        }

        this.fillSettings(state.effect_get_response, state.post_processing_get_response);
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(33);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

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
        this.headerTitle.text = app.name;
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addWidget(this.backButton);
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

        this.editEffectButton = new Ui.PushButton(this.footer);
        this.editEffectButton.text = `Update ${app.name}`;
        const editImagePath = new Editor.Path(import.meta.resolve('../Resources/edit.svg'));
        this.editEffectButton.setIconWithMode(Editor.Icon.fromFile(editImagePath), Ui.IconMode.MonoChrome);

        this.connections.push(this.editEffectButton.onClick.connect(() => {
            this.createEffect(this.controls);
        }));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.editEffectButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

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

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

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
            }
        });

        this.controls['promptPicker'].addOnValueChanged((value) => {
            this.editEffectButton.enabled = value.length > 0 && this.status == 'SUCCESS';
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

        return this.menu;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(320);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);
        const menu = this.createMenu(this.widget);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.layout.addWidget(header);
        const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        this.layout.addWidget(separator1);
        this.layout.addWidget(menu);
        this.layout.addStretch(0);

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
}
