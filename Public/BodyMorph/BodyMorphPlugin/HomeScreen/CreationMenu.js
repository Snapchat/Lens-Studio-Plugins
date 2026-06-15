import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPickerWithMedia.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { UserNotesPicker, createUserNotesPicker } from '../Effects/Controls/UserNotesPicker.js';

import app from '../../application/app.js';

export class CreationMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.resetParent = resetParent;
        this.onStateChanged = onStateChanged;
        this.controls = {};
    }

    init() {
        this.stopped = false;
        this.reset();
    }

    stop() {
        this.stopped = true;
        this.reset();
    }

    reset() {
        this.controls['promptPicker'].mode = 'Image';
        this.controls['promptPicker'].value = { "imagesData": [], "textReference": "" };

        this.controls['promptPicker'].mode = 'Text';
        this.controls['promptPicker'].value = '';

        this.controls['intensitySettings'].value = 'Medium';
        this.controls['headlessSettings'].value = false;

        if (this.generateButton) {
            this.generateButton.visible = true;
            this.generateButton.enabled = false;
        }
        if (this.refineButton) {
            this.refineButton.visible = false;
            this.refineButton.enabled = false;
        }
    }

    generatePreview(controls) {
        this.generateButton.enabled = false;

        const prompt = controls['promptPicker'].value;

        this.onStateChanged({
            'screen': 'refine',
            'uploadUid': null,
            'uploadUrl': null,
            'useCase': 'default',
            'intensity': controls['intensitySettings'].value,
            'headless': controls['headlessSettings'].value,
            'prompt': prompt,
        });

        this.generateButton.enabled = true;
    }

    refineImage(controls) {
        this.refineButton.enabled = false;

        const imageData = controls['promptPicker'].value;
        const uploadUid = imageData.imagesData[0].uid;
        const uploadUrl = imageData.imagesData[0].url;
        const textReference = imageData.textReference || '';

        this.onStateChanged({
            'screen': 'refine',
            'uploadUid': uploadUid,
            'uploadUrl': uploadUrl,
            'useCase': 'bodymorph',
            'intensity': controls['intensitySettings'].value,
            'headless': controls['headlessSettings'].value,
            'prompt': textReference,
        });

        this.refineButton.enabled = true;
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(33);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = `${app.name}`;
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

        const aiIconPath = new Editor.Path(import.meta.resolve('../Resources/lens_studio_ai.svg'));

        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate';
        this.generateButton.enabled = false;
        this.generateButton.primary = true;
        this.generateButton.setIconWithMode(Editor.Icon.fromFile(aiIconPath), Ui.IconMode.MonoChrome);
        this.connections.push(this.generateButton.onClick.connect(function() {
            this.generateButton.enabled = false;
            this.generatePreview(this.controls);
        }.bind(this)));

        this.refineButton = new Ui.PushButton(this.footer);
        this.refineButton.text = 'Refine Image';
        this.refineButton.enabled = false;
        this.refineButton.primary = true;
        this.refineButton.setIconWithMode(Editor.Icon.fromFile(aiIconPath), Ui.IconMode.MonoChrome);
        this.refineButton.visible = false;
        this.connections.push(this.refineButton.onClick.connect(function() {
            this.refineImage(this.controls);
        }.bind(this)));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.generateButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addWidgetWithStretch(this.refineButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);
        this.menu.setSizePolicy(Ui.SizePolicy.Policy.Minimum, Ui.SizePolicy.Policy.Minimum);
        this.menuLayout = new Ui.BoxLayout();

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        this.menuLayout.addWidget(createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(createTermsWidget(this.menu))

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
            if (this.controls['promptPicker'].mode == "Text") {
                this.generateButton.enabled = (value.length > 0) && !this.stopped;
            } else if (this.controls['promptPicker'].mode == "Image") {
                this.refineButton.enabled = (value.imagesData.length > 0) && !this.stopped;
            }
            app.log('', { 'enabled': false });
        });

        this.controls['promptPicker'].addOnModeChanged((mode) => {
            this.generateButton.visible = (mode === 'Text');
            this.refineButton.visible = (mode === 'Image');
        });

        this.menuLayout.addStretch(0);

        this.menuLayout.setContentsMargins(16, 8, 16, 8);
        this.menuLayout.spacing = Ui.Sizes.Spacing;
        this.menu.layout = this.menuLayout;

        this.reset();

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
};
