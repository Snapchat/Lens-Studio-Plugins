import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { SettingsDescriptor } from './SettingsDescriptor.js';
import { PromptPicker, createPromptPicker } from './Controls/PromptPicker.js';
import { ClothSelection, createClothSelection } from './Controls/ClothSelection.js';

import { GeneratorState } from '../../generator/generator.js';

import app from '../../application/app.js';
import { logEventAssetCreation } from '../../application/analytics.js';

const editImagePath = import.meta.resolve('../Resources/lens_studio_ai.svg');

export class CreationMenu {
    constructor() {
        this.connections = [];
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
        Object.values(this.controls).forEach((control) => { control.reset(); });
    }

    updateGenerateButton() {
        let enabled = this.controls["promptPicker"].value.length > 0;
        enabled = enabled && !this.stopped;

        const suitableStates = [GeneratorState.Idle, GeneratorState.Success, GeneratorState.Failed];
        enabled = enabled && suitableStates.includes(app.generator.state);

        this.generateButton.enabled = enabled;

        if (app.generator.state === GeneratorState.Success) {
            this.generateButton.text = "Regenerate";
            this.generateButton.primary = false;
        } else {
            this.generateButton.text = "Generate";
            this.generateButton.primary = true;
        }
    }

    createHeader(parent) {
        this.header = Ui.Widget.create(parent);
        this.header.setFixedHeight(33);

        const headerLayout = Ui.BoxLayout.create();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

        this.headerTitle = Ui.Label.create(this.header);
        this.headerTitle.text = "Garment";
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addStretch(0);
        headerLayout.addWidget(this.headerTitle);
        headerLayout.addStretch(0);

        this.header.layout = headerLayout;
        return this.header;
    }

    async onGenerationRequested() {
        let origin = "";
        if (app.generator.state == GeneratorState.Idle) {
            origin = "NEW";
        } else {
            origin = "REGENERATE";
        }

        await app.generator.generate({
            "prompt": this.controls["promptPicker"].value + " " + this.controls["garmentType"].value.toLowerCase(),
            "garmentType": this.controls["garmentType"].backendValue
        });

        let garmnetTypeToLog = "";

        switch (this.controls["garmentType"].backendValue) {
            case 'hoodie':
                garmnetTypeToLog = "HOODIE";
                break;
            case 'sweater':
                garmnetTypeToLog = "SWEATER";
                break;
            case 't-shirt':
                garmnetTypeToLog = "T_SHIRT";
                break;
            case 'dress-suit':
                garmnetTypeToLog = "DRESS_SUIT";
                break;
            case 'bomber-jacket':
                garmnetTypeToLog = "BOMBER";
                break;
        }

        if (app.generator.state == GeneratorState.Success) {
            logEventAssetCreation("SUCCESS", garmnetTypeToLog, origin);
        } else {
            logEventAssetCreation("FAILED", garmnetTypeToLog, origin);
        }
    }

    createFooter(parent) {
        this.footer = Ui.Widget.create(parent);
        this.footer.setFixedHeight(65);

        const footerLayout = Ui.BoxLayout.create();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);
        footerLayout.spacing = 0;

        this.generateButton = Ui.PushButton.create(this.footer);
        this.generateButton.text = 'Generate';
        this.generateButton.enabled = false;
        this.generateButton.primary = true;
        this.generateButton.setIconWithMode(Editor.Icon.fromFile(editImagePath), Ui.IconMode.MonoChrome);

        this.connections.push(this.generateButton.onClick.connect(function() {
            this.onGenerationRequested();
        }.bind(this)));

        app.generator.stateChanged.on(GeneratorState.Any, () => {
            this.updateGenerateButton();
        });

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.generateButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    createMenu(parent) {
        this.menu = Ui.Widget.create(parent);
        this.menu.setSizePolicy(Ui.SizePolicy.Policy.Minimum, Ui.SizePolicy.Policy.Minimum);
        this.menuLayout = Ui.BoxLayout.create();

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        // Title
        const titleWidget = Ui.Widget.create(this.menu);
        const titleLayout = Ui.BoxLayout.create();
        titleLayout.setDirection(Ui.Direction.LeftToRight);

        const titleLabel = Ui.Label.create(titleWidget);
        titleLabel.text = 'Create new Garment';
        titleLabel.fontRole = Ui.FontRole.LargeTitleBold;

        titleLayout.addStretch(0);
        titleLayout.addWidget(titleLabel);
        titleLayout.addStretch(0);

        titleWidget.layout = titleLayout;

        this.menuLayout.addWidget(titleWidget);

        this.menuLayout.addWidget(createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(createTermsWidget(this.menu));

        const createControl = (scheme) => {
            switch (scheme.class) {
                case PromptPicker:
                    this.controls[scheme.name] = createPromptPicker(scheme);
                    break;
                case ClothSelection:
                    this.controls[scheme.name] = createClothSelection(scheme);
                    break;
            }
            return this.controls[scheme.name];
        };

        const createGroup = (scheme) => {
            const groupWidget = Ui.Widget.create(scheme.parent);
            groupWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
            const layout = Ui.BoxLayout.create();
            layout.setContentsMargins(0, Ui.Sizes.Spacing, 0, 0);

            layout.setDirection(Ui.Direction.TopToBottom);

            const collapsePanel = Ui.CollapsiblePanel.create(Editor.Icon.fromFile(scheme.iconPath), scheme.label, scheme.parent);
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
            const separator = Ui.Separator.create(Ui.Orientation.Horizontal, Ui.Shadow.Plain, scheme.parent);
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
            this.updateGenerateButton();
            app.log('', { 'enabled': false });
        });

        this.menuLayout.addStretch(0);

        this.menuLayout.setContentsMargins(16, 8, 16, 8);
        this.menuLayout.spacing = Ui.Sizes.Spacing;
        this.menu.layout = this.menuLayout;

        this.reset();

        return this.menu;
    }

    create(parent) {
        this.widget = Ui.Widget.create(parent);

        this.widget.setFixedWidth(320);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);
        const menu = this.createMenu(this.widget);

        this.layout = Ui.BoxLayout.create();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.layout.addWidget(header);
        const separator1 = Ui.Separator.create(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        this.layout.addWidget(separator1);
        this.layout.addWidget(menu);
        this.layout.addStretch(0);

        const separator2 = Ui.Separator.create(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
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
