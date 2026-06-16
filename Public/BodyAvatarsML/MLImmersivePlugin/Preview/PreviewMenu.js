import * as Ui from 'LensStudio:Ui';

import { tieWidgets, convertDate, createGuidelinesWidget } from '../utils.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { TabSelection, createTabSelection } from '../Effects/Controls/TabSelection.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { Slider, createSlider } from '../Effects/Controls/Slider.js';
import { UserNotesPicker, createUserNotesPicker } from '../Effects/Controls/UserNotesPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createEffect, createPostProcessing } from '../api.js';
import { buildEffectDataFromResponse, buildPostProcessingDataFromResponse } from '../Effects/EffectFactory.js';


import app from '../../application/app.js';
import { logEventAssetCreation } from '../../application/analytics.js';

export class PreviewMenu {
    constructor(onStateChanged, resetParent, setDefaultState, setPreviewState) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.resetParent = resetParent;
        this.setDefaultState = setDefaultState;
        this.setPreviewState = setPreviewState;
    }

    createEffect(controls) {
        app.log('Creating new effect...', { 'progressBar': true });

        let effectData = buildEffectDataFromResponse(this.effectSettings, controls);
        let inputFormat = "PROMPT_IMAGE";

        createEffect(effectData, (effectResponse) => {
            if (effectResponse.statusCode == 201) {
                const effectBody = JSON.parse(effectResponse.body.toString());
                const effectId = effectBody.id;

                const postProcessingData = buildPostProcessingDataFromResponse(effectId);

                createPostProcessing(postProcessingData, (postProcessingResponse) => {
                    if (postProcessingResponse.statusCode == 201) {
                        this.onStateChanged({
                            'screen': 'default',
                            'needsUpdate': true,
                            'creation': true,
                        });
                        logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat);
                        app.log(`${app.name} is queued. ${app.name} creation is estimated to take 5 minutes, please check back later.`, {'progressBar': true});
                    } else if (postProcessingResponse.statusCode == 400) {
                        try {
                            const errorBody = JSON.parse(postProcessingResponse.body.toString());
                            if (errorBody.detail && errorBody.detail.toLowerCase().includes('limit')) {
                                logEventAssetCreation("RATE_LIMITED", "UPDATE_EXISTING", inputFormat);
                                app.log('Limit reached — A maximum of 5 effects can be generated at once.');
                            } else {
                                logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat);
                                app.log('The result violates our community guidelines');
                            }
                        } catch (e) {
                            logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat);
                            app.log('The result violates our community guidelines');
                        }
                    } else {
                        logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat);
                        app.log('Something went wrong, please try again.');
                    }
                });
            } else if (effectResponse.statusCode == 400) {
                try {
                    const errorBody = JSON.parse(effectResponse.body.toString());
                    if (errorBody.detail && errorBody.detail.toLowerCase().includes('limit')) {
                        logEventAssetCreation("RATE_LIMITED", "UPDATE_EXISTING", inputFormat);
                        app.log('Limit reached — A maximum of 5 effects can be generated at once.');
                    } else {
                        logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat);
                        app.log('The result violates our community guidelines');
                    }
                } catch (e) {
                    logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat);
                    app.log('The result violates our community guidelines');
                }
            } else {
                logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat);
                app.log('Something went wrong, please try again.');
            }
        });
    }

    fillSettings(effect_settings, post_processing_settings) {
        // choose model type
        this.effectSettings = effect_settings;
        this.postProcessingSettings = post_processing_settings;

        this.lockSettings();
        this.controls['imageReferencePicker'].value = JSON.parse(JSON.stringify(effect_settings.settings.image_prompts));
        this.controls['faceSwap'].value = effect_settings.settings.face_swap_mode === 'cartoon-v2';
    }

    reset() {
        this.fillSettings(this.effectSettings, this.postProcessingSettings);
    }

    updatePreview(state) {
        this.createdOnValue.text = convertDate(state.created_on);
        this.setPreviewState();

        this.fillSettings(state.effect_get_response, state.post_processing_get_response);
    }

    lockSettings() {
        this.generateButton.visible = false;
        this.controls['imageReferencePicker'].widget.enabled = false;
        this.controls['faceSwap'].widget.enabled = false;
        this.label.visible = false;
    }

    unlockSettings() {
        this.generateButton.enabled = true;
        this.generateButton.visible = true;
        this.controls['imageReferencePicker'].widget.enabled = true;
        this.controls['faceSwap'].widget.enabled = true;
        this.label.visible = true;
    }

    isLocked() {
        return !this.generateButton.visible;
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
                'needsUpdate': false
            });

            app.log('', { 'enabled': false });
        }.bind(this)));

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

        this.label = new Ui.Label(this.menu);
        this.label.text = `
            <p style="margin-bottom: 4px;">For best results, upload a photo with:</p>
            <ul style="margin-top: 0;">
                <li>Full body visible (head to toe)</li>
                <li>Plain white background</li>
                <li>Natural, human-like proportions</li>
                <li>High-quality image (at least 720px tall)</li>
            </ul>
        `;

        this.menuLayout.addWidget(this.label);
        this.label.visible = false;

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
                case ImageReferencePicker:
                    this.controls[scheme.name] = createImageReferencePicker(scheme);
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

        this.controls['imageReferencePicker'].addOnValueChanged((value) => {
            this.generateButton.enabled = this.controls['imageReferencePicker'].valueExists;
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
