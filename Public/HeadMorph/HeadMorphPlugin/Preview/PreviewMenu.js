import * as Ui from 'LensStudio:Ui';

import { tieWidgets, convertDate, createGuidelinesWidget } from '../utils.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SpinBox, createSpinBox } from '../Effects/Controls/SpinBox.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createAsset, getAsset } from '../api.js';
import { buildAssetData } from '../Effects/EffectFactory.js';

import app from '../../application/app.js';

import { logEventAssetCreation } from '../../application/analytics.js';

export class PreviewMenu {
    constructor(onStateChanged, resetParent, showImportButton, hideImportButton) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.resetParent = resetParent;
        this.showImportButton = showImportButton;
        this.hideImportButton = hideImportButton;
    }

    modifyAsset(controls) {
        this.editEffectButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });

        let settings = {};
        let inputFormat = "";

        if (this.promptPickerRadioButton.checked) {
            settings = {
                'prompt': controls['promptPicker'].value,
                'seed': 0,
                'uploadUid': null
            }

            inputFormat = "PROMPT_TEXT";
        } else {
            settings = {
                'prompt': null,
                'seed': 0,
                'uploadUid': controls['imageReferencePicker'].value[0].uid
            }

            inputFormat = "PROMPT_IMAGE";
        }

        createAsset(settings, (response) => {
            if (response.statusCode == 200) {
                logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                const responseBody = JSON.parse(response.body.toString());

                this.draftMeshState = true;
                this.onStateChanged({
                    'assetData': responseBody,
                    'settings': settings,
                    'screen': 'preview',
                    'sub_screen': 'draft_mesh'
                });

                app.log('', { 'enabled': false });
            } else if (response.statusCode == 400) {
                logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else if (response.statusCode == 429) {
                logEventAssetCreation("RATE_LIMITED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('You have reached the limit for Head Generator creation, please try again later.');
                this.updateEditButtonVisibility();
            } else {
                logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }
        });
    }

    fillSettings(settings) {
        // choose model type

        this.controls['promptPicker'].value = settings.prompt;
    }

    reset() {
    }

    onReturn() {
        this.updateEditButtonVisibility();
        this.controls['promptPicker'].hide();
        this.controls['imageReferencePicker'].hide();
        this.promptPickerRadioButton.enabled = false;
        this.imagePickerRadioButton.enabled = false;
        this.editEffectButton.visible = true;
        this.showImportButton();
    }

    updatePreview(state) {
        this.asset_id = state.asset_id;
        this.status = state.status;

        if (state.uploadUid) {
            this.promptPickerRadioButton.checked = false;
            this.imagePickerRadioButton.checked = true;
            this.controls['promptPicker'].hide();
            this.controls['imageReferencePicker'].show();

            this.controls['promptPicker'].value = '';
            this.controls['imageReferencePicker'].value = [{uid: state.uploadUid, url: state.uploadUrl}];
        }
        else {
            this.promptPickerRadioButton.checked = true;
            this.imagePickerRadioButton.checked = false;
            this.controls['promptPicker'].show();
            this.controls['imageReferencePicker'].hide();

            this.controls['promptPicker'].value = state.settings.prompt;
            this.controls['imageReferencePicker'].value = [];
        }

        this.promptPickerRadioButton.enabled = false;
        this.imagePickerRadioButton.enabled = false;
        this.controls['promptPicker'].hide();
        this.controls['imageReferencePicker'].hide();
        this.editEffectButton.visible = true;
        this.showImportButton();

        this.updateEditButtonVisibility();
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(33);

        this.header.autoFillBackground = true;
        this.header.backgroundRole = Ui.ColorRole.Base;

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
        this.headerTitle.text = 'Asset Settings';
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;
        this.headerTitle.foregroundRole = Ui.ColorRole.BrightText;

        headerLayout.addWidget(this.backButton);
        // headerLayout.addStretch(0);
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

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);

        this.footer.autoFillBackground = true;
        this.footer.backgroundRole = Ui.ColorRole.Base;

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(16, 0, 8, 0);

        this.editEffectButton = new Ui.PushButton(this.footer);
        this.editEffectButton.text = 'Copy settings';

        this.connections.push(this.editEffectButton.onClick.connect(() => {
            this.promptPickerRadioButton.enabled = true;
            this.imagePickerRadioButton.enabled = true;
            if (this.controls['imageReferencePicker'].value.length > 0) {
                this.promptPickerRadioButton.checked = false;
                this.imagePickerRadioButton.checked = true;
                this.controls['promptPicker'].hide();
                this.controls['imageReferencePicker'].show();
            }
            else {
                this.promptPickerRadioButton.checked = true;
                this.imagePickerRadioButton.checked = false;
                this.controls['promptPicker'].show();
                this.controls['imageReferencePicker'].hide();
            }
            this.promptPickerRadioButton.enabled = true;
            this.imagePickerRadioButton.enabled = true;
            this.editEffectButton.visible = false;
            // this.modifyAsset(this.controls);
            this.hideImportButton();
        }));

        footerLayout.addWidgetWithStretch(this.editEffectButton, 0, Ui.Alignment.AlignLeft);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    setGeneratePreviewsButton(button) {
        this.generatePreviewsButton = button;
        this.connections.push(this.generatePreviewsButton.onClick.connect(() => {
            this.promptPickerRadioButton.enabled = false;
            this.imagePickerRadioButton.enabled = false;
            this.controls['promptPicker'].hide();
            this.controls['imageReferencePicker'].hide();
            this.modifyAsset(this.controls);
        }))
    }

    updateEditButtonVisibility() {
        this.editEffectButton.enabled = ((this.controls['promptPicker'].value.length > 0) || (this.controls['imageReferencePicker'].value.length > 0));
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.menu.autoFillBackground = true;
        this.menu.backgroundRole = Ui.ColorRole.Base;

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        // Settings
        const guidelines = createGuidelinesWidget(this.menu);

        this.menuLayout.addWidget(guidelines);

        const createControl = (scheme) => {
            switch (scheme.class) {
                case PromptPicker:
                    this.controls[scheme.name] = createPromptPicker(scheme);
                    break;
                case ImageReferencePicker:
                    this.controls[scheme.name] = createImageReferencePicker(scheme);
                    break;
                case SpinBox:
                    this.controls[scheme.name] = createSpinBox(scheme);
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

        this.controls['imageReferencePicker'].addOnValueChanged((value) => {
            this.updateEditButtonVisibility();
        });

        this.promptPickerRadioButton = this.controls['promptPicker'].getRadioButton();
        this.imagePickerRadioButton = this.controls['imageReferencePicker'].getRadioButton();

        this.promptPickerRadioButton.onClick.connect(() => {
            this.promptPickerRadioButton.checked = true;
            this.imagePickerRadioButton.checked = false;
            this.controls['promptPicker'].show();
            this.controls['imageReferencePicker'].hide();
        })

        this.imagePickerRadioButton.onClick.connect(() => {
            this.imagePickerRadioButton.checked = true;
            this.promptPickerRadioButton.checked = false;
            this.controls['imageReferencePicker'].show();
            this.controls['promptPicker'].hide();
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

        this.widget.backgroundRole = Ui.ColorRole.Midlight;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
