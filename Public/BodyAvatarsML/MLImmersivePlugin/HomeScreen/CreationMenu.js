import * as Ui from 'LensStudio:Ui';

import { createGuidelinesWidget, createTermsWidget } from '../utils.js';
import { buildEffectData, buildPostProcessingData } from '../Effects/EffectFactory.js';
import { CheckBox, createCheckBox } from '../Effects/Controls/CheckBox.js';
import { TabSelection, createTabSelection } from '../Effects/Controls/TabSelection.js';
import { ComboBox, createComboBox } from '../Effects/Controls/ComboBox.js';
import { PromptPicker, createPromptPicker } from '../Effects/Controls/PromptPicker.js';
import { Slider, createSlider } from '../Effects/Controls/Slider.js';
import { UserNotesPicker, createUserNotesPicker } from '../Effects/Controls/UserNotesPicker.js';
import { ImageReferencePicker, createImageReferencePicker } from '../Effects/Controls/ImageReferencePicker.js';
import { SettingsDescriptor } from '../Effects/SettingsDescriptor.js';
import { createEffect, createPostProcessing } from '../api.js';

import app from '../../application/app.js';

import { logEventAssetCreation } from '../../application/analytics.js';

export class CreationMenu {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.resetParent = resetParent;
        this.onStateChanged = onStateChanged;
        this.controls = {};
        this.stopped = false;
    }

    init() {
        this.stopped = false;
        this.reset();
    }

    stop() {
        this.stopped = true;
        if (this.popup) this.popup.visible = false;
        this.reset();
    }

    reset() {
        if (this.popup) this.popup.visible = false;
        this.controls['imageReferencePicker'].value = [];
        this.controls['faceSwap'].value = false;
    }

    generateEffect(controls) {
        this.generateButton.enabled = false;
        this.popup.visible = false;
        app.log('Creating new effect...', { 'progressBar': true });

        let effectData = buildEffectData(controls);
        let inputFormat = "PROMPT_IMAGE";

        createEffect(effectData, (effectResponse) => {
            if (effectResponse.statusCode == 201) {
                const effectBody = JSON.parse(effectResponse.body.toString());
                const effectId = effectBody.id;

                const postProcessingData = buildPostProcessingData(effectId);

                createPostProcessing(postProcessingData, (postProcessingResponse) => {
                    if (postProcessingResponse.statusCode == 201) {
                        logEventAssetCreation("SUCCESS", "NEW", inputFormat);
                        this.resetParent({
                            'needsUpdate': true
                        });

                        app.log(`${app.name} is queued. ${app.name} creation is estimated to take 5 minutes, please check back later.`, {'progressBar': true});
                    } else if (postProcessingResponse.statusCode == 400) {
                        try {
                            const errorBody = JSON.parse(postProcessingResponse.body.toString());
                            if (errorBody.detail && errorBody.detail.toLowerCase().includes('limit')) {
                                logEventAssetCreation("RATE_LIMITED", "NEW", inputFormat);
                                this.showLimitReachedPopup();
                            } else {
                                logEventAssetCreation("GUIDELINES_VIOLATION", "NEW", inputFormat);
                                this.showGuidelinesPopup();
                            }
                        } catch (e) {
                            logEventAssetCreation("FAILED", "NEW", inputFormat);
                            app.log('Something went wrong during post-processing creation, please try again.');
                        }
                    } else {
                        logEventAssetCreation("FAILED", "NEW", inputFormat);
                        app.log('Something went wrong during post-processing creation, please try again.');
                    }
                });
            } else if (effectResponse.statusCode == 400) {
                try {
                    const errorBody = JSON.parse(effectResponse.body.toString());
                    if (errorBody.detail && errorBody.detail.toLowerCase().includes('limit')) {
                        logEventAssetCreation("RATE_LIMITED", "NEW", inputFormat);
                        this.showLimitReachedPopup();
                    } else {
                        logEventAssetCreation("GUIDELINES_VIOLATION", "NEW", inputFormat);
                        this.showGuidelinesPopup();
                    }
                } catch (e) {
                    logEventAssetCreation("GUIDELINES_VIOLATION", "NEW", inputFormat);
                    this.showGuidelinesPopup();
                }
            } else {
                logEventAssetCreation("FAILED", "NEW", inputFormat);
                app.log(`Something went wrong during ${app.name} creation, please try again.`);
            }
        });
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(33);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = "New Effect";
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;
        this.headerTitle.foregroundRole = Ui.ColorRole.BrightText;

        headerLayout.addStretch(0);
        headerLayout.addWidget(this.headerTitle);
        headerLayout.addStretch(0);

        this.header.layout = headerLayout;
        return this.header;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);
        footerLayout.spacing = 0;

        this.footer.layout = footerLayout;
        return this.footer;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.menu);

        this.menuLayout = new Ui.BoxLayout();

        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        this.menuLayout.addWidget(createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(createTermsWidget(this.menu));

        const label = new Ui.Label(this.menu);
        label.text = `
            <p style="margin-bottom: 4px;">For best results, upload a photo with:</p>
            <ul style="margin-top: 0;">
                <li>Full body visible (head to toe)</li>
                <li>Plain white background</li>
                <li>Natural, human-like proportions</li>
                <li>High-quality image (at least 720px tall)</li>
            </ul>
        `;
        this.menuLayout.addWidget(label);

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
                case ComboBox:
                    this.controls[scheme.name] = createComboBox(scheme);
                    break;
                case Slider:
                    this.controls[scheme.name] = createSlider(scheme);
                    break;
                case ImageReferencePicker:
                    this.controls[scheme.name] = createImageReferencePicker(scheme);
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
            collapsePanel.backgroundRole = Ui.ColorRole.Base;
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

        this.controls['imageReferencePicker'].addOnValueChanged((value) => {
            this.generateButton.enabled = !this.stopped && (value.length > 0);
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

        this.reset();

        return this.menu;
    }

    setGenerateButton(button) {
        this.generateButton = button;
        this.connections.push(this.generateButton.onClick.connect(function() {
            this.generateEffect(this.controls);
        }.bind(this)));
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setFixedWidth(378);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);
        const menu = this.createMenu(this.widget);

        this.layout.addWidget(header);

        this.layout.addWidget(menu);

        const separator2 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator2.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator2);

        this.layout.addWidget(footer);

        this.widget.backgroundRole = Ui.ColorRole.Base;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        this.createPopup(app.mainWidget);

        return this.widget;
    }

    createPopup(widget) {
        this.popup = new Ui.CalloutFrame(widget);
        this.popup.setForegroundColor(this.createColor(234, 85, 99, 255));
        this.popup.setBackgroundColor(this.createColor(234, 85, 99, 255));

        const popupLayout = new Ui.BoxLayout();
        this.popup.layout = popupLayout;
        popupLayout.setContentsMargins(8, 0, 8, 0);

        const infoImage = new Ui.ImageView(this.popup);
        infoImage.scaledContents = true;
        infoImage.pixmap = new Ui.Pixmap(import.meta.resolve('../Resources/warning.svg'));
        infoImage.setFixedWidth(16);
        infoImage.setFixedHeight(16);

        popupLayout.addWidgetWithStretch(infoImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);

        this.popupLabel = new Ui.Label(this.popup);
        this.popupLabel.foregroundRole = Ui.ColorRole.BrightText;

        this.popup.visible = false;
        this.popup.setFixedHeight(32);

        popupLayout.addWidgetWithStretch(this.popupLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
    }

    showLimitReachedPopup() {
        app.log('', { 'enabled': false });
        this.popupLabel.text = "Limit reached - A maximum of 5 effects can be generated at once";
        this.popup.setFixedWidth(368);
        this.popup.move(216, 4);
        this.popup.visible = true;
        this.popup.raise();
    }

    showGuidelinesPopup() {
        app.log('', { 'enabled': false });
        this.popupLabel.text = "Prompt does not comply with community guidelines";
        this.popup.setFixedWidth(340);
        this.popup.move(216, 4);
        this.popup.visible = true;
        this.popup.raise();
    }

    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }
};
