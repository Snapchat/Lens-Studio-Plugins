import * as Ui from 'LensStudio:Ui';

import { tieWidgets, convertDate, createGuidelinesWidget } from '../utils.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SpinBox, createSpinBox } from '../Effects/Controls/SpinBox.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createAsset, getAsset, addAnimationToAsset, copyAnimation } from '../api.js';
import { buildAssetData, buildAnimationUpdateData } from '../Effects/EffectFactory.js';

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
        this.wasEditEffectClicked = false;
        this.wasUpdateAnimationClicked = false;
    }

    modifyAsset(controls) {
        this.editEffectButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });

        let inputFormat = controls["imageReferencePicker"].value.length > 0 ? "PROMPT_IMAGE" : "PROMPT_TEXT";

        const settings = buildAssetData(controls);

        createAsset(settings, (response) => {
            this.editEffectButton.enabled = true;
            if (response.statusCode == 200) {
                logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                const responseBody = JSON.parse(response.body.toString());

                this.draftMeshState = true;
                this.onStateChanged({
                    'assetData': responseBody,
                    'settings': settings,
                    // 'created_on': this.createdOnValue.text,
                    'screen': 'preview',
                    'sub_screen': 'draft_mesh',
                    'updateOnlyAnimation': false
                });

                app.log('', { 'enabled': false });
            } else if (response.statusCode == 400) {
                logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else if (response.statusCode == 429) {
                logEventAssetCreation("RATE_LIMITED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('You have reached the limit for attachment creation, please try again later.');
                this.updateEditButtonVisibility();
            } else {
                logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }
        });
    }

    modifyAnimation(controls) {
        this.updateAnimationButton.enabled = false;

        const settings = buildAnimationUpdateData(controls);

        addAnimationToAsset(this.asset_id, settings, (response) => {
            if (response.statusCode == 200) {
                //logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                getAsset(this.asset_id, (responseBody) => {
                    this.updateAnimationButton.enabled = true;

                    this.draftMeshState = true;

                    this.onStateChanged({
                        'assetData': responseBody,
                        'settings': buildAssetData(controls),
                        // 'created_on': this.createdOnValue.text,
                        'screen': 'preview',
                        'sub_screen': 'draft_mesh',
                        'updateOnlyAnimation': true,
                    });

                    app.log('', { 'enabled': false });
                });
            } else if (response.statusCode == 400) {
                this.updateAnimationButton.enabled = true;
                // logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else if (response.statusCode == 429) {
                this.updateAnimationButton.enabled = true;
                // logEventAssetCreation("RATE_LIMITED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('You have reached the limit for attachment creation, please try again later.');
                this.updateEditButtonVisibility();
            } else {
                this.updateAnimationButton.enabled = true;
                //logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }
        });
    }

    copyAnimationFromAsset(controls) {
        this.editEffectButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });

        let inputFormat = controls["imageReferencePicker"].value.length > 0 ? "PROMPT_IMAGE_ANIMATION" : "PROMPT_TEXT_ANIMATION";

        const settings = buildAnimationUpdateData(controls);

        copyAnimation(this.asset_id, settings, (response) => {
            this.updateAnimationButton.enabled = true;

            if (response.statusCode == 200) {
                logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                const responseBody = JSON.parse(response.body.toString());

                this.draftMeshState = true;
                this.onStateChanged({
                    'assetData': responseBody,
                    'settings': buildAssetData(controls),
                    'screen': 'preview',
                    'sub_screen': 'draft_mesh',
                    'updateOnlyAnimation': true,
                });

                app.log('', { 'enabled': false });
            } else if (response.statusCode == 400) {
                logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else if (response.statusCode == 429) {
                logEventAssetCreation("RATE_LIMITED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('You have reached the limit for attachment creation, please try again later.');
                this.updateEditButtonVisibility();
            } else {
                logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }
        });
    }

    onChangeAnimationClicked(controls) {
        app.log('Changing animation...', { 'progressBar': true });
        getAsset(this.asset_id, (asset) => {
            if (asset.selectedDrivingAnimationId != null) {
                this.copyAnimationFromAsset(controls);
            } else {
                this.modifyAnimation(controls);
            }
        });
    }

    onReturn() {
        this.controls['promptPicker'].show();
        this.controls['imageReferencePicker'].show();
        this.controls['stylePicker'].show();
        this.controls['animationPromptPicker'].show();
        this.controls['seedPicker'].show();
        this.controls['stylePicker'].show();
        this.editEffectButton.visible = true;
        this.updateAnimationButton.visible = true;
        this.showImportButton();
    }

    fillSettings(settings) {
        // choose model type

        this.controls['promptPicker'].value = settings.prompt;
        this.controls['seedPicker'].value = settings.seed;
        this.controls['animationPromptPicker'].value = settings.promptAnimation;
        if (settings.style) {
            this.controls['stylePicker'].value = settings.style;
        }
        if (settings.promptAnimation != null) {
            this.updateAnimationButton.text = "Change animation";
        }
        else {
            this.updateAnimationButton.text = "Add animation";
        }

        this.controls['stylePicker'].value = settings.style;

        this.editEffectButton.visible = true;
        this.updateAnimationButton.visible = true;
        this.wasEditEffectClicked = false;
        this.wasUpdateAnimationClicked = false;
        this.showImportButton();
    }

    reset() {
    }

    updatePreview(state) {
        this.asset_id = state.asset_id;
        this.status = state.status;

        if (state.settings) {
            this.fillSettings(state.settings);
        }

        this.controls['imageReferencePicker'].value = [];

        getAsset(state.asset_id, (asset) => {
            if (asset && asset.uploadUid) {
                this.controls['imageReferencePicker'].value = [{uid: asset.uploadUid, url: asset.uploadUrl }];
                this.updateEditButtonVisibility();
            }
        });

        this.updateEditButtonVisibility();

        this.controls['promptPicker'].hide();
        this.controls['imageReferencePicker'].hide();
        this.controls['stylePicker'].hide();
        this.controls['animationPromptPicker'].hide();
        this.controls['seedPicker'].hide();
        this.controls['stylePicker'].hide();

        this.updateAnimationButton.enabled = state.object_url != null;
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
        this.headerTitle.text = 'Attachment Settings';
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;
        this.headerTitle.foregroundRole = Ui.ColorRole.BrightText;

        headerLayout.addWidget(this.backButton);
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
        this.editEffectButton.text = 'Change attachment';

        this.updateAnimationButton = new Ui.PushButton(this.footer);
        this.updateAnimationButton.text = 'Change animation';

        this.connections.push(this.editEffectButton.onClick.connect(() => {
            this.wasEditEffectClicked = true;
            this.controls['promptPicker'].show();
            this.controls['imageReferencePicker'].show();
            this.controls['stylePicker'].show();
            this.controls['animationPromptPicker'].show();
            this.controls['seedPicker'].show();
            this.controls['stylePicker'].show();

            this.editEffectButton.visible = false;
            this.updateAnimationButton.visible = false;
            this.previewAnimationsButton.text = "Generate previews"
            this.hideImportButton();
        }));

        this.connections.push(this.updateAnimationButton.onClick.connect(() => {
            this.wasUpdateAnimationClicked = true;
            this.controls['animationPromptPicker'].show();
            this.editEffectButton.visible = false;
            this.updateAnimationButton.visible = false;
            this.previewAnimationsButton.text = "Preview animations"
            this.hideImportButton();
        }));

        // footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.editEffectButton, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        footerLayout.addWidgetWithStretch(this.updateAnimationButton, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    setPreviewAnimationsButton(button) {
        this.previewAnimationsButton = button;
        this.connections.push(this.previewAnimationsButton.onClick.connect(() => {
            this.controls['promptPicker'].hide();
            this.controls['imageReferencePicker'].hide();
            this.controls['stylePicker'].hide();
            this.controls['animationPromptPicker'].hide();
            this.controls['seedPicker'].hide();
            this.controls['stylePicker'].hide();

            if (this.wasEditEffectClicked) {
                this.modifyAsset(this.controls);
            }
            else if (this.wasUpdateAnimationClicked) {
                this.onChangeAnimationClicked(this.controls);
            }
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
                case ComboBox:
                    this.controls[scheme.name] = createComboBox(scheme);
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

            // When an image is uploaded, disable the style picker and set to Default
            // When the image is cleared, enable the style picker
            if (value.length > 0) {
                this.controls['stylePicker'].value = 'Default';
                this.controls['stylePicker'].enabled = false;
            } else {
                this.controls['stylePicker'].enabled = true;
            }
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

        this.widget.backgroundRole = Ui.ColorRole.Midlight;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
