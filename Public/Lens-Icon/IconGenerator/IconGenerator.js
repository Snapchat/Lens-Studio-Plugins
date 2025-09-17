import * as Ui from 'LensStudio:Ui';

import { SettingsDescriptor } from './Settings/SettingsDescriptor.js';

import { PromptPicker, createPromptPicker } from './Settings/PromptPicker.js';
import { ComboBox, createComboBox } from './Settings/ComboBox.js';
import { IconSelection, createIconSelection } from './Settings/IconSelection.js';

import { GeneratorState } from '../App/generator.js';
import { Storage } from '../utils/storage.js';

import { createGuidelinesWidget } from './utils.js';
import { GenAIIconName } from '../App/common.js';
import { logEventAssetCreation } from '../App/analytics.js';

export class IconGenerator {
    constructor(pluginSystem, generator, requestIconCropperCb, requestCancelationCb) {
        this.pluginSystem = pluginSystem;
        this.controls = {};
        this.generator = generator;
        this.generator.reset();

        this.requestIconCropperCb = requestIconCropperCb;
        this.requestCancelationCb = requestCancelationCb;

        this.storage = new Storage();

        this.regenerateFlag = false;
    };

    isConfigEmpty(config) {
        if (!config) {
            return true;
        }

        if (!config.prompt) {
            return true;
        }

        return false;
    }

    init(config) {
        if (this.isConfigEmpty(config)) {
            this.initDefault();
        } else {
            this.initFromConfig(config);
        }
    }

    initDefault() {
        Object.values(this.controls).forEach((control) => {
            control.reset();
        })
    }

    initFromConfig(config) {
        this.initDefault();

        this.controls["promptPicker"].value = config.prompt;

        this.requestGeneration();
    }

    requestGeneration(regenerateFlag = false) {
        this.applyButton.enabled = false;
        this.generateButton.visible = false;
        this.controls["iconSelection"].reset();

        this.regenerateFlag = regenerateFlag;
        this.presetValue = this.controls["stylePicker"].backendValue.analyticsKey;

        this.generate(
            this.controls["promptPicker"].value,
            this.controls["stylePicker"].backendValue.promptDecorator,
            4);
    }

    generate(prompt, promptDecorator, size) {
        this.generator.generate({
            "prompt": prompt,
            "promptDecorator": promptDecorator,
            "size": size
        });
    }

    createWidget(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.Spacing * 2;

        const createControl = (scheme) => {
            switch (scheme.class) {
                case PromptPicker:
                    this.controls[scheme.name] = createPromptPicker(scheme);
                    break;
                case ComboBox:
                    this.controls[scheme.name] = createComboBox(scheme);
                    break;
                case IconSelection:
                    this.controls[scheme.name] = createIconSelection(scheme);
                    break;
            }
            return this.controls[scheme.name];
        };

        this.settingsScheme = new SettingsDescriptor().getSettingsDescriptor(this.widget);

        const logo = new Ui.ImageView(this.widget);
        logo.setFixedWidth(86);
        logo.setFixedHeight(69);
        logo.scaledContents = true;
        logo.pixmap = new Ui.Pixmap(import.meta.resolve("./Resources/logo.svg"));

        layout.addWidget(logo);
        layout.setWidgetAlignment(logo, Ui.Alignment.AlignCenter);

        const guidelines = createGuidelinesWidget(this.widget);

        layout.addWidget(guidelines);

        this.settingsScheme.items.forEach((settingItem) => {
            switch (settingItem.type) {
                case 'control':
                    layout.addWidget(createControl(settingItem).widget);
                    break;
            }
        });

        this.generateButton = new Ui.PushButton(this.widget);
        this.generateButton.text = "Regenerate";
        this.generateButton.enabled = false;
        this.generateButton.visible = false;
        this.generateButton.setMinimumHeight(Ui.Sizes.ButtonHeight);
        this.generateButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.generateButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve("./Resources/regenerate.svg")), Ui.IconMode.MonoChrome);

        this.controls['promptPicker'].addOnValueChanged((value) => {
            this.generateButton.enabled = (value.length > 0);
        });

        this.generator.stateChanged.on(GeneratorState.Success, () => {
            for (let i = 0; i < this.generator.iconBytes.length; i++) {
                this.controls["iconSelection"].setImage(i, new Ui.Pixmap(this.storage.createFile("icon_preview_" + i + ".png", this.generator.iconBytes[i])), this.generator.iconBytes[i]);
            }
            this.generateButton.visible = true;
            logEventAssetCreation(
                "SUCCESS",
                this.regenerateFlag ? "REGENERATE" : "NEW",
                this.presetValue
            );
        });

        this.generator.stateChanged.on(GeneratorState.Failed, (error) => {
            this.controls["iconSelection"].throwError(error);
            this.generateButton.visible = true;

            logEventAssetCreation(
                (error && error.name == "AldError") ? "GUIDELINES_VIOLATION" : "FAILED",
                this.regenerateFlag ? "REGENERATE" : "NEW",
                this.presetValue
            );
        });

        this.generator.stateChanged.on(GeneratorState.ConnectionFailed, (error) => {
            this.controls["iconSelection"].throwError(error);
            this.generateButton.visible = true;
        })

        layout.addWidget(this.generateButton);

        this.footer = this.createFooter(this.widget);

        layout.addStretch(0);
        layout.addWidget(this.footer);

        this.widget.layout = layout;

        this.generateButton.onClick.connect(() => {
            this.requestGeneration(true);
        });

        return this.widget;
    }

    onApplyClicked() {
        this.requestIconCropperCb(Base64.encode(this.controls["iconSelection"].getBytes(this.controls["iconSelection"].value)), GenAIIconName);
    }

    createFooter(parent) {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.setDirection(Ui.Direction.LeftToRight);

        this.cancelButton = new Ui.PushButton(parent);
        this.cancelButton.text = "Cancel";

        this.cancelButton.onClick.connect(() => {
            this.requestCancelationCb();
        })

        this.applyButton = new Ui.PushButton(parent);
        this.applyButton.text = "Apply";
        this.applyButton.primary = true;

        this.applyButton.enabled = false;

        this.applyButton.onClick.connect(() => {
            this.onApplyClicked();
        });

        this.controls["iconSelection"].addOnValueChanged((value) => {
            this.applyButton.enabled = value !== -1;
            this.applyButton.primary = true;
        });

        layout.addStretch(0);
        layout.addWidget(this.cancelButton);
        layout.addWidget(this.applyButton);
        layout.addStretch(0);

        widget.layout = layout;

        return widget;
    }
}
