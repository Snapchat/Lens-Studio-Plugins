import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { buildSelectRequest } from '../Effects/EffectFactory.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { getAsset, selectSplat } from '../api.js';

import app from '../../application/app.js';

export class CreationMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.resetParent = resetParent;
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.draftMeshState = false;
        this.sideState = 'default';
        this.stopped = false;
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
            this.titleWidget.visible = false;
            this.sideState = 'draft_mesh';
            this.controls["imageReferencePicker"].editable = false;
        } else {
            this.controls['promptPicker'].value = '';
            this.controls['imageReferencePicker'].value = [];
            this.generateButton.text = 'Generate';
            this.generateButton.enabled = false;
            this.generateButton.primary = true;
            this.titleWidget.visible = true;
            this.sideState = 'default';
            this.controls["imageReferencePicker"].editable = true;
        }
    }

    generateEffect(controls) {
        this.generateButton.enabled = false;
        app.log('Generating the preview...', { 'progressBar': true });

        const selectData = buildSelectRequest(controls);
        const id = controls["imageReferencePicker"].value[0].id
        selectSplat(id, selectData, (selectionResponse) => {
            if (selectionResponse.statusCode == 200) {
                getAsset(id, (asset) => {
                    if (asset) {
                        this.draftMeshState = true;
                        this.onStateChanged({
                            'assetData': asset,
                            'screen': 'default',
                            'sub_screen': 'draft_mesh'
                        });
                        app.log('', { 'enabled': false });

                    } else {
                        app.log("Something went wront processing the asset. Please, try again.")
                    }
                });

            } else {
                app.log('Failed to select the object. Please try again.');
                this.generateButton.enabled = true;
            }
        });
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
        this.backButton.visible = false;

        this.connections.push(this.backButton.onClick.connect(() => {
            if (this.draftMeshState) {
                this.draftMeshState = false;
                this.onStateChanged({
                    'screen': 'default'
                });
            } else {
                this.onClose();
            }
        }));

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = '3D Capture';
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
        footerLayout.spacing = 0;

        this.generateButton = new Ui.PushButton(this.footer);
        this.generateButton.text = 'Generate Capture';
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
        this.generateButton.enabled = (this.controls["promptPicker"].value.length > 0 && this.controls["imageReferencePicker"].value.length > 0) && !this.stopped;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        // Title

        this.titleWidget = new Ui.Widget(this.menu);
        const titleLayout = new Ui.BoxLayout();
        titleLayout.setDirection(Ui.Direction.LeftToRight);

        const titleLabel = new Ui.Label(this.titleWidget);
        titleLabel.text = 'Create new Asset';
        titleLabel.fontRole = Ui.FontRole.LargeTitleBold;

        titleLayout.addStretch(0);
        titleLayout.addWidget(titleLabel);
        titleLayout.addStretch(0);

        this.titleWidget.layout = titleLayout;

        this.menuLayout.addWidget(this.titleWidget);
        this.menuLayout.addWidget(createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(createTermsWidget(this.menu));

        // Preset
        const createControl = (scheme) => {
            switch (scheme.class) {
                case PromptPicker:
                    this.controls[scheme.name] = createPromptPicker(scheme);
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
