import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { buildAssetData } from '../Effects/EffectFactory.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { TabSelection, createTabSelection } from '../Effects/Controls/TabSelection.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { Slider, createSlider } from '../Effects/Controls/Slider.js';
import { NegativePromptPicker, createNegativePromptPicker } from '../Effects/Controls/NegativePromptPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createAsset } from '../api.js';

import { logEventAssetCreation } from '../../application/analytics.js';

import app from '../../application/app.js';

export class CreationMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.resetParent = resetParent;
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.presetList = ['Emotions', 'Default', 'Beauty', 'Cartoon', 'Fun', 'Creepy'];
        this.draftMeshState = false;
        this.sideState = 'default';
        this.stopped = false;
        this.isDeinitialized = false;
    }

    init() {
        this.stopped = false;
        this.reset({
            'screen': 'default'
        });
    }

    stop() {
        this.stopped = true;
        this.reset({
            'screen': 'default'
        });
    }

    reset(state) {
        if (state.sub_screen == 'draft_mesh') {
            this.generateButton.text = 'Regenerate';
            this.generateButton.enabled = true;
            this.generateButton.primary = false;
            this.sideState = 'draft_mesh';
        } else {
            this.controls['promptPicker'].value = '';
            this.controls['imageReferencePicker'].value = [];
            this.generateButton.text = 'Generate Previews';
            this.generateButton.enabled = false;
            this.generateButton.primary = true;
            this.sideState = 'default';
        }
    }

    generateEffect(controls) {
        this.generateButton.enabled = false;
        app.log('Generating new previews...', { 'progressBar': true });

        const data = buildAssetData(controls, true);

        let inputFormat = controls["imageReferencePicker"].value.length > 0 ? "INPUT_IMAGE" : "INPUT_PROMPT";

        createAsset(data, (response) => {
            if (this.isDeinitialized) {
                return;
            }
            if (response.statusCode == 200) {
                logEventAssetCreation("SUCCESS", "NEW", inputFormat);
                const responseBody = JSON.parse(response.body.toString());
                this.draftMeshState = true;
                this.onStateChanged({
                    'assetData': responseBody,
                    'screen': 'default',
                    'sub_screen': 'draft_mesh'
                });
                app.log('', { 'enabled': false });
            } else if (response.statusCode == 400) {
                logEventAssetCreation("GUIDELINES_VIOLATION", "NEW", inputFormat);
                app.log('The result violates our community guidelines');
                this.generateButton.enabled = true;
            } else {
                logEventAssetCreation("FAILED", "NEW", inputFormat);
                app.log('Something went wrong during effect creation, please try again.');
                this.generateButton.enabled = true;
            }
        });
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        this.footer.setFixedHeight(65);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);
        footerLayout.spacing = 0;

        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate Previews';
        this.generateButton.enabled = true;
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

    checkInputs() {
        this.generateButton.enabled = (this.controls["promptPicker"].value.length > 0 || this.controls["imageReferencePicker"].value.length > 0) && !this.stopped;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);
        this.menu.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        this.menuLayout.addWidget(createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(createTermsWidget(this.menu));

        // Preset
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
            groupWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
            const layout = new Ui.BoxLayout();
            layout.setContentsMargins(0, Ui.Sizes.Spacing, 0, 0);

            layout.setDirection(Ui.Direction.TopToBottom);

            const collapsePanel = new Ui.CollapsiblePanel(Editor.Icon.fromFile(scheme.iconPath), scheme.label, scheme.parent);
            collapsePanel.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
            collapsePanel.overrideBackgroundRole = false;
            collapsePanel.setContentsMargins(0, 0, 0, 0);

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
            }
        });

        this.controls['promptPicker'].addOnValueChanged((value) => {
            this.checkInputs();
            app.log('', { 'enabled': false });
        });

        this.controls['imageReferencePicker'].addOnValueChanged((value) => {
            this.checkInputs();
            app.log('', { 'enabled': false });
        })

        this.menuLayout.addStretch(0);

        this.menuLayout.setContentsMargins(16, 8, 16, 8);
        this.menuLayout.spacing = Ui.Sizes.Padding;

        this.menu.layout = this.menuLayout;

        const scrollWidget = new Ui.Widget(this.menu);
        scrollWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        scrollWidget.layout = this.menuLayout;

        const verticalScrollArea = new Ui.VerticalScrollArea(this.menu);
        verticalScrollArea.setWidget(scrollWidget);
        verticalScrollArea.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const scrollLayout = new Ui.BoxLayout();
        scrollLayout.setDirection(Ui.Direction.TopToBottom);
        scrollLayout.setContentsMargins(0, 0, 0, 0);

        scrollLayout.addWidget(verticalScrollArea);

        this.menu.layout = scrollLayout;

        return this.menu;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Expanding);
        this.widget.setFixedWidth(320);

        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        const menu = this.createMenu(this.widget);
        const footer = this.createFooter(this.widget);

        this.layout.addWidget(menu);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);
        this.layout.addWidget(footer);

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }

    deinit() {
        this.isDeinitialized = true;
    }
};
