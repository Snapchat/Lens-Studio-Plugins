import * as Ui from 'LensStudio:Ui';

import { tieWidgets, convertDate, createGuidelinesWidget } from '../utils.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { TabSelection, createTabSelection } from '../Effects/Controls/TabSelection.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { Slider, createSlider } from '../Effects/Controls/Slider.js';
import { NegativePromptPicker, createNegativePromptPicker } from '../Effects/Controls/NegativePromptPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createAsset } from '../api.js';
import { buildAssetData } from '../Effects/EffectFactory.js';

import app from '../../application/app.js';

export class ChangeGeometryMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.resetParent = resetParent;
    }

    modifyAsset(controls) {
        this.editEffectButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });

        createAsset(buildAssetData(controls, true), (response) => {
            if (response.statusCode == 200) {
                const responseBody = JSON.parse(response.body.toString());
                this.draftMeshState = true;
                this.onStateChanged({
                    'controls': this.controls,
                    'assetData': responseBody,
                    'created_on': this.createdOnValue.text,
                    'screen': 'preview',
                    'sub_screen': 'draft_mesh',
                    'needsUpdate': false
                });
                app.log('', { 'enabled': false });

                this.updateEditButtonVisibility();
            } else if (retextureResponse.statusCode == 400) {
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else {
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }
        });
    }

    fillSettings(settings) {
        // choose model type

        this.controls['promptPicker'].value = settings.prompt;
        if (settings.negativePrompt) {
            this.controls['negativePromptPicker'].value = settings.negativePrompt;
        } else {
            this.controls['negativePromptPicker'].value = '';
        }
    }

    fillControls(controls) {
        // choose model type
        this.controls['promptPicker'].value = controls['promptPicker'].value;
        this.controls['negativePromptPicker'].value = controls['negativePromptPicker'].value;
    }

    reset() {

    }

    updatePreview(state) {
        this.createdOnValue.text = convertDate(state.created_on);
        this.asset_id = state.asset_id;
        this.status = state.status;

        if (state.assetData.attachment) {
            this.controls['imageReferencePicker'].value = [state.assetData.attachment];
        } else {
            this.controls['imageReferencePicker'].value = [];
        }

        if (state.settings) {
            this.fillSettings(state.settings);
        }
        this.updateEditButtonVisibility();
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

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = 'Change Geometry';
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
        this.editEffectButton.text = 'Regenerate';
        const editImagePath = new Editor.Path(import.meta.resolve('../Resources/edit.svg'));
        this.editEffectButton.setIconWithMode(Editor.Icon.fromFile(editImagePath), Ui.IconMode.MonoChrome);

        this.connections.push(this.editEffectButton.onClick.connect(() => {
            this.modifyAsset(this.controls);
        }));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.editEffectButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    updateEditButtonVisibility() {
        if (this.controls['promptPicker'].value.length > 0) {
            this.editEffectButton.enabled = true;
        } else {
            this.editEffectButton.enabled = false;
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
                case NegativePromptPicker:
                    this.controls[scheme.name] = createNegativePromptPicker(scheme);
                    break;
                case ImageReferencePicker:
                    this.controls[scheme.name] = createImageReferencePicker(scheme);
                    break;
                case ComboBox:
                    this.controls[scheme.name] = createComboBox(scheme);
                    break;
                case Slider:
                    this.controls[scheme.name] = createSlider(scheme);
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
