import * as Ui from 'LensStudio:Ui';

import { tieWidgets, convertDate, createGuidelinesWidget } from '../utils.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SpinBox, createSpinBox } from '../Effects/Controls/SpinBox.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createAsset, copyAnimation, getAsset, addAnimationToAsset } from '../api.js';
import { buildAssetData, buildAnimationUpdateData } from '../Effects/EffectFactory.js';
import { logEventAssetCreation } from '../../application/analytics.js';

import app from '../../application/app.js';

export class ChangeAttachmentMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.resetParent = resetParent;
        this.isGenerationInProgress = false;
    }

    modifyAsset(controls) {
        this.editEffectButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });
        let inputFormat = controls["imageReferencePicker"].value.length > 0 ? "PROMPT_IMAGE" : "PROMPT_TEXT";

        createAsset(buildAssetData(controls), (response) => {
            if (!app.authStatus) return;
            // this.editEffectButton.enabled = true;

            if (response.statusCode == 200) {
                logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                const responseBody = JSON.parse(response.body.toString());
                this.draftMeshState = true;
                this.onStateChanged({
                    'controls': this.controls,
                    'assetData': responseBody,
                    // 'created_on': this.createdOnValue.text,
                    'screen': 'preview',
                    'sub_screen': 'draft_mesh',
                    'needsUpdate': false,
                    'updateOnlyAnimation': false,
                });

                app.log('', { 'enabled': false });

                this.updateEditButtonVisibility();
            } else if (response.statusCode == 400) {
                logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else {
                logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }
        });
    }

    copyAnimationFromAsset(controls) {
        this.editEffectButton.enabled = false;
        // app.log('Creating new asset...', { 'progressBar': true });

        let inputFormat = controls["imageReferencePicker"].value.length > 0 ? "PROMPT_IMAGE_ANIMATION" : "PROMPT_TEXT_ANIMATION";

        const settings = buildAnimationUpdateData(controls);

        copyAnimation(this.asset_id, settings, (response) => {
            if (!app.authStatus) return;
            // this.editEffectButton.enabled = true;

            if (response.statusCode == 200) {
                logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                const responseBody = JSON.parse(response.body.toString());

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
        this.editEffectButton.enabled = false;

        const settings = buildAnimationUpdateData(controls);

        addAnimationToAsset(this.asset_id, settings, (response) => {
            if (!app.authStatus) return;
            if (response.statusCode == 200) {
                //logEventAssetCreation("SUCCESS", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                getAsset(this.asset_id, (responseBody) => {
                    if (!app.authStatus) return;
                    // this.editEffectButton.enabled = true;

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
                this.editEffectButton.enabled = true;
                // logEventAssetCreation("GUIDELINES_VIOLATION", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('The result violates our community guidelines');
                this.updateEditButtonVisibility();
            } else if (response.statusCode == 429) {
                this.editEffectButton.enabled = true;
                // logEventAssetCreation("RATE_LIMITED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('You have reached the limit for attachment creation, please try again later.');
                this.updateEditButtonVisibility();
            } else {
                this.editEffectButton.enabled = true;
                //logEventAssetCreation("FAILED", "UPDATE_EXISTING", inputFormat, "GENERATE_PREVIEW");
                app.log('Something went wrong, please try again.');
                this.updateEditButtonVisibility();
            }
        });
    }

    onAnimationUpdateRequested(controls) {
        app.log('Preparing animations...', { 'progressBar': true });

        getAsset(this.asset_id, (responseBody) => {
            if (!app.authStatus) return;
            if (responseBody.selectedDrivingAnimationId != null) {
                this.copyAnimationFromAsset(this.controls);
            } else {
                this.modifyAnimation(this.controls);
            }
        });
    }

    fillSettings(settings) {
        // choose model type

        this.controls['promptPicker'].value = settings.prompt;
        this.controls['seedPicker'].value = settings.seed;
        this.controls['animationPromptPicker'].value = settings.promptAnimation;
        if (settings.style) {
            this.controls['stylePicker'].value = settings.style;
        }

        this.onNewGenerationStarted();
    }

    fillControls(controls) {
        // choose model type
        this.controls['promptPicker'].value = controls['promptPicker'].value;
        this.controls['animationPromptPicker'].value = controls['animationPromptPicker'].value;
        this.controls['seedPicker'].value = controls['seedPicker'].value;
        this.controls['stylePicker'].value = controls['stylePicker'].value;
        this.controls['stylePicker'].enabled = controls['stylePicker'].enabled;
    }

    reset() {

    }

    updatePreview(state) {
        // this.createdOnValue.text = convertDate(state.created_on);
        this.status = state.status;
        this.assetData = state.assetData;

        if (this.assetData.uploadUid) {
            this.controls['imageReferencePicker'].value = [{uid: this.assetData.uploadUid, url: this.assetData.uploadUrl }];
        } else {
            this.controls['imageReferencePicker'].value = [];
        }

        if (state.settings) {
            this.fillSettings(state.settings);
        }

        if (this.controls['imageReferencePicker'].value.length > 0) {
            this.controls['stylePicker'].value = 'Default';
            this.controls['stylePicker'].enabled = false;
        } else {
            this.controls['stylePicker'].enabled = true;
        }

        this.updateOnlyAnimation = state.updateOnlyAnimation;

        this.asset_id = state.assetData.id;

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

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = 'Attachment Settings';
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;
        this.headerTitle.foregroundRole = Ui.ColorRole.BrightText;

        headerLayout.addWidget(this.backButton);
        // headerLayout.addStretch(0);
        headerLayout.addWidget(this.headerTitle);
        headerLayout.addStretch(0);

        this.header.layout = headerLayout;
        return this.header;
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
        this.editEffectButton.text = 'Regenerate';
        const editImagePath = new Editor.Path(import.meta.resolve('../Resources/refresh.svg'));
        this.editEffectButton.setIconWithMode(Editor.Icon.fromFile(editImagePath), Ui.IconMode.MonoChrome);

        this.connections.push(this.editEffectButton.onClick.connect(() => {
            this.onNewGenerationStarted();

            if (this.updateOnlyAnimation) {
                this.onAnimationUpdateRequested(this.controls);
            } else {
                this.modifyAsset(this.controls);
            }
        }));

        // footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.editEffectButton, 0, Ui.Alignment.AlignLeft);
        // footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    onAllPreviewsGenerated() {
        this.isGenerationInProgress = false;
        this.editEffectButton.enabled = ((this.controls['promptPicker'].value.length > 0) || (this.controls['imageReferencePicker'].value.length > 0));
        this.controls['promptPicker'].show();
        this.controls['imageReferencePicker'].show();
        this.controls['stylePicker'].show();
        this.controls['animationPromptPicker'].show();
        this.controls['seedPicker'].show();
    }

    onNewGenerationStarted() {
        this.controls['promptPicker'].hide();
        this.controls['imageReferencePicker'].hide();
        this.controls['stylePicker'].hide();
        this.controls['animationPromptPicker'].hide();
        this.controls['seedPicker'].hide();
        this.editEffectButton.enabled = false;
        this.isGenerationInProgress = true;
    }

    updateEditButtonVisibility() {
        this.editEffectButton.enabled = ((this.controls['promptPicker'].value.length > 0) || (this.controls['imageReferencePicker'].value.length > 0)) && !this.isGenerationInProgress;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.menu.autoFillBackground = true;
        this.menu.backgroundRole = Ui.ColorRole.Base;

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        // Created on settings
        // const createdOnSettings = new Ui.Widget(this.menu);
        //
        // const createdOnLabel = new Ui.Label(createdOnSettings);
        // createdOnLabel.text = 'Created on';
        //
        // this.createdOnValue = new Ui.Label(createdOnSettings);
        // this.createdOnValue.text = '29/03/2023';
        // this.createdOnValue.autoFillBackground = true;
        // this.createdOnValue.backgroundRole = Ui.ColorRole.Light;
        // this.createdOnValue.setContentsMargins(8, 4, 8, 4);
        //
        // tieWidgets(createdOnLabel, this.createdOnValue, createdOnSettings);

        // Settings
        const guidelines = createGuidelinesWidget(this.menu);

        this.menuLayout.addWidget(guidelines);
        // this.menuLayout.addWidget(createdOnSettings);

        const createControl = (scheme) => {
            switch (scheme.class) {
                case PromptPicker:
                    this.controls[scheme.name] = createPromptPicker(scheme);
                    break;
                case SpinBox:
                    this.controls[scheme.name] = createSpinBox(scheme);
                    break;
                case ImageReferencePicker:
                    this.controls[scheme.name] = createImageReferencePicker(scheme);
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
        // const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        // separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        //
        // this.layout.addWidget(separator1);
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
