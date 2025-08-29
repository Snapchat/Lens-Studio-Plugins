import * as Ui from 'LensStudio:Ui';

import { tieWidgets, convertDate, convertIntensityToString, createBackButton, createGuidelinesWidget } from '../utils.js';
import { buildAssetData } from '../Effects/EffectFactory.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPickerWithMedia.js';
import { UserNotesPicker, createUserNotesPicker } from '../Effects/Controls/UserNotesPicker.js';
import { RadioButtonGroup } from '../Effects/Controls/RadioButtonGroup.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { createMorph } from '../api.js';

import app from '../../application/app.js';
import { logEventAssetCreation } from '../../application/analytics.js';

export class PreviewMenu {
    constructor(onStateChanged) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.controls = {};
    }

    createBodymorph(controls) {
        this.editEffectButton.enabled = false;
        app.log(`Creating new ${app.name}...`, { 'progressBar': true });

        let status;
        let preset;
        let settings;
        let origin;
        let inputFormat;

        let data;
        if (this.updateAssetOption.value == 'Change Texture') {
            data = buildAssetData({
                'promptPicker': { 'mode': controls['promptPicker'].mode, 'value': controls['promptPicker'].value },
                'intensitySettings': { 'value': this.original_intensity },
                'headlessSettings': { 'value': controls['headlessSettings'].value },
                'userNotes': { 'value': controls["userNotes"].value }
            }, true, this.bodymorph_id);
            origin = "CHANGE_TEXTURE";
        } else {
            data = buildAssetData(controls, false, this.bodymorph_id);
            origin = "CHANGE_GEOMETRY";
        }

        preset = data.settings.costumeOnly ? "WITHOUT_HEAD" : "WITH_HEAD";
        inputFormat = data.uploadUid == null ? "PROMPT_TEXT" : "PROMPT_IMAGE";

        createMorph(data, function(response) {
            if (response.statusCode == 201) {
                status = "SUCCESS";
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'creation': true,
                });
                app.log(`${app.name} is queued. ${app.name} creation is estimated to take 15-20 min, please check back later.`, { 'progressBar': true });
            } else if (response.statusCode == 400) {
                status = "GUIDELINES_VIOLATION";
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else {
                status = "FAILED";
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }

            switch(data.settings.intensity) {
                case "low":
                    settings = "INTENSITY_LOW"
                    break;
                case "med":
                    settings = "INTENSITY_MEDIUM"
                    break;
                case "high":
                    settings = "INTENSITY_HIGH";
                    break;
            }

            logEventAssetCreation(status, preset, settings, origin, inputFormat);
        }.bind(this));
    }

    updatePreview(state) {
        this.createdOnValue.text = convertDate(state.created_on);
        this.bodymorph_id = state.bodymorph_id;
        this.status = state.status;

        if (state.uploadUid) {
            this.controls['promptPicker'].mode = 'Text';
            this.controls['promptPicker'].value = "";

            this.controls['promptPicker'].mode = 'Image';
            this.controls['promptPicker'].value = { "imagesData": [{ "uid": state.uploadUid, "url": state.uploadUrl }], "textReference": state.prompt };
        } else {
            this.controls['promptPicker'].mode = 'Image';
            this.controls['promptPicker'].value = { "imagesData": [], "textReference": "" };

            this.controls['promptPicker'].mode = 'Text';
            if (state.prompt) {
                this.controls['promptPicker'].value = state.prompt;
            } else {
                this.controls['promptPicker'].value = '';
            }
        }

        if (state.intensity) {
            this.original_intensity = convertIntensityToString(state.intensity);
            this.controls['intensitySettings'].value = convertIntensityToString(state.intensity);
        } else {
            this.original_intensity = 'Medium';
            this.controls['intensitySettings'].value = 'Medium';
        }

        this.controls['headlessSettings'].value = state.costume_only;

        this.original_headless = state.headless;

        if (state.userNotes) {
            this.controls['userNotes'].value = state.userNotes;
        } else {
            this.controls['userNotes'].value = "";
        }

        this.updateEditButtonVisibility();
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(33);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

        this.backButton = createBackButton(this.header);

        this.connections.push(this.backButton.onClick.connect(function() {
            this.onStateChanged({
                'screen': 'default',
                'needsUpdate': false,
            });
            app.log('', { 'enabled': false });
        }.bind(this)));

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = app.mName + ' Preview';
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
        this.editEffectButton.text = 'Update Asset';
        const editImagePath = new Editor.Path(import.meta.resolve('../Resources/edit.svg'));
        this.editEffectButton.setIconWithMode(Editor.Icon.fromFile(editImagePath), Ui.IconMode.MonoChrome);

        this.connections.push(this.editEffectButton.onClick.connect(() => {
            this.createBodymorph(this.controls);
        }));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.editEffectButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    updateEditButtonVisibility() {
        const value = this.controls['promptPicker'].value;

        this.controls['intensitySettings'].widget.visible = this.updateAssetOption.value !== 'Change Texture';

        if (this.controls['promptPicker'].mode == "Text") {
            this.editEffectButton.enabled = (value.length > 0) && !this.stopped && (this.status == 'SUCCESS');
        } else if (this.controls['promptPicker'].mode == "Image") {
            this.editEffectButton.enabled = (value.imagesData.length > 0) && !this.stopped && (this.status == 'SUCCESS');
        }
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

        const guidelines = createGuidelinesWidget(this.menu);

        this.menuLayout.addWidget(guidelines);
        this.menuLayout.addWidget(createdOnSettings);

        this.updateAssetOption = new RadioButtonGroup(this.menu, 'Update the Asset', null, null, ['Change Geometry', 'Change Texture'], null);

        this.updateAssetOption.addOnValueChanged((value) => {
            this.updateEditButtonVisibility();
        });

        this.menuLayout.addWidget(this.updateAssetOption.widget);

        const createControl = (scheme) => {
            switch (scheme.class) {
                case PromptPicker:
                    this.controls[scheme.name] = createPromptPicker(scheme);
                    break;
                case ComboBox:
                    this.controls[scheme.name] = createComboBox(scheme);
                    break;
                case CheckBox:
                    this.controls[scheme.name] = createCheckBox(scheme);
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
            this.updateEditButtonVisibility();
        });

        this.controls['headlessSettings'].widget.visible = false;

        this.menuLayout.setContentsMargins(16, 8, 16, 8);
        this.menu.layout = this.menuLayout;
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

        this.layout.addWidget(this.createHeader(this.widget));
        const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        this.layout.addWidget(separator1);
        this.layout.addWidget(this.createMenu(this.widget));
        this.layout.addStretch(0);

        const separator2 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator2.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator2);

        this.layout.addWidget(this.createFooter(this.widget));

        this.widget.backgroundRole = Ui.ColorRole.Midlight;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
