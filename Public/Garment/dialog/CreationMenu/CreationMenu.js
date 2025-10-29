import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { SettingsDescriptor } from './SettingsDescriptor.js';
import { PromptPicker, createPromptPicker } from './Controls/PromptPicker.js';
import { ClothSelection, createClothSelection } from './Controls/ClothSelection.js';

import {UIConfig} from "../UIConfig";

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

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);
        this.menu.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.menu.setContentsMargins(0, 0, 0, 0);
        this.menu.spacing = 0;
        this.menuLayout = new Ui.BoxLayout();

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        const titleWidget = new Ui.Widget(this.menu);
        const titleLayout = new Ui.BoxLayout();
        titleLayout.setDirection(Ui.Direction.LeftToRight);

        const titleLabel = new Ui.Label(titleWidget);
        titleLabel.text = 'New Garment';
        titleLabel.fontRole = Ui.FontRole.MediumTitleBold;

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
            const groupWidget = new Ui.Widget(scheme.parent);
            groupWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
            const layout = new Ui.BoxLayout();
            layout.setContentsMargins(0, 0, 0, 0);

            layout.setDirection(Ui.Direction.TopToBottom);

            const collapsePanel = new Ui.CollapsiblePanel(Editor.Icon.fromFile(scheme.iconPath), scheme.label, scheme.parent);
            collapsePanel.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
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

        this.menuLayout.addStretch(0);
        this.menuLayout.spacing = Ui.Sizes.Spacing;
        this.menu.layout = this.menuLayout;

        this.reset();

        return this.menu;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setFixedWidth(UIConfig.CREATION_MENU.WIDTH);
        this.widget.setFixedHeight(UIConfig.CREATION_MENU.HEIGHT);
        this.widget.setContentsMargins(8, 0, 8, 0);

        const menu = this.createMenu(this.widget);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);
        this.layout.spacing = 0;

        this.layout.addWidget(menu);
        this.layout.addStretch(0);

        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
};
