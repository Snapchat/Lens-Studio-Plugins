import * as Ui from 'LensStudio:Ui';
import * as LensBasedEditorView from 'LensStudio:LensBasedEditorView';
import { Storage } from '../utils/storage.js';

export class IconCropper {
    constructor(pluginSystem, requestIconSet, requestCancelationCb) {
        this.pluginSystem = pluginSystem;
        this.requestIconSet = requestIconSet;
        this.requestCancelationCb = requestCancelationCb;

        this.gui = this.pluginSystem.findInterface(Ui.IGui);

        this.storage = new Storage();
    };

    isConfigEmpty(config) {
        if (!config) {
            return true;
        }

        if (!config.image_buffer) {
            return true;
        }

        return false;
    }

    init(config) {
        if (!this.isConfigEmpty(config)) {
            this.initFromConfig(config);
        } else {
            this.initDefault();
        }
    }

    initDefault() {
        this.iconPath = "icon.png";

        const defaultColor = new Ui.Color();
        defaultColor.red = 255;
        defaultColor.green = 255;
        defaultColor.blue = 255;

        this.backgroundColor.currentColor = defaultColor;

        this.backgroundEnabled.checked = false;

        this.iconCropperLBE.postMessage({
            event_type: "setBackground",
            color: JSON.stringify({
                "r": defaultColor.red,
                "g": defaultColor.green,
                "b": defaultColor.blue
            })
        });

        this.iconCropperLBE.postMessage({
            event_type: "enableBackground",
            enabled: this.backgroundEnabled.checked
        });

        this.applyButton.primary = true;
    }

    initFromConfig(config) {
        this.initDefault();

        this.iconPath = config.iconPath;

        this.iconCropperLBE.postMessage({
            event_type: "init",
            image_buffer: config.image_buffer
        });
    }

    handleMessage(data) {
        const type = data.event_type;
        if (type == "apply_texture") {
            const decodedTexture = Base64.decode(data.encoded_texture);
            const iconPath = this.storage.createFile(this.iconPath, decodedTexture);

            this.iconCropperLBE.postMessage({
                event_type: "reset",
                callback_event_type: "setIcon",
                callback_event_data: JSON.stringify({
                    "iconPath": iconPath.toString()
                })
            });

        } else if (type == "setIcon") {
            this.requestIconSet(data.iconPath);
        } else if (type == "cancelation") {
            this.requestCancelationCb();
        }
    }

    createFooter(parent) {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.setDirection(Ui.Direction.LeftToRight);

        this.cancelButton = new Ui.PushButton(parent);
        this.cancelButton.text = "Discard Changes";

        this.cancelButton.onClick.connect(() => {
            this.iconCropperLBE.postMessage({
                event_type: "reset",
                callback_event_type: "cancelation",
                callback_event_data: "{}"
            });
        })

        this.applyButton = new Ui.PushButton(this.widget);
        this.applyButton.primary = true;
        this.applyButton.text = "Save Changes";
        this.applyButton.onClick.connect(() => {
            this.iconCropperLBE.postMessage({
                event_type: "apply"
            });
        });

        layout.addStretch(0);
        layout.addWidget(this.cancelButton);
        layout.addWidget(this.applyButton);
        layout.addStretch(0);

        widget.layout = layout;

        return widget;
    }

    createWidget(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.widget.setContentsMargins(0, Ui.Sizes.DoublePadding, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.settings = new Ui.Widget(this.widget);
        this.settings.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.settings.setMinimumWidth(400);

        const settingsLayout = new Ui.BoxLayout();
        settingsLayout.setDirection(Ui.Direction.LeftToRight);

        this.autoCropButton = new Ui.PushButton(this.settings);
        this.autoCropButton.text = "Auto Crop";
        this.autoCropButton.setIcon(Editor.Icon.fromFile(import.meta.resolve("./Resources/crop_icon.svg")));

        this.autoCropButton.onClick.connect(() => {
            this.iconCropperLBE.postMessage({
                event_type: "auto_crop"
            });
        });

        this.backgroundEnabled = new Ui.CheckBox(this.settings);
        this.backgroundLabel = new Ui.Label(this.settings);
        this.backgroundLabel.text = "Background";
        this.backgroundColor = new Ui.ColorButton(this.settings);

        this.backgroundColor.alphaEnabled = false;
        this.backgroundColor.setAutoUpdateToolTip(true);

        this.backgroundColor.colorAccepted.connect((color) => {
            this.iconCropperLBE.postMessage({
                "event_type": "setBackground",
                "color": JSON.stringify({
                    "r": color.red,
                    "g": color.green,
                    "b": color.blue
                })
            });
        });

        this.backgroundEnabled.onToggle.connect((enabled) => {
            this.iconCropperLBE.postMessage({
                "event_type": "enableBackground",
                "enabled": enabled
            });
        });

        settingsLayout.addStretch(0);
        settingsLayout.addWidget(this.autoCropButton);
        settingsLayout.addStretch(0);
        settingsLayout.addWidget(this.backgroundEnabled);
        settingsLayout.addWidget(this.backgroundLabel);
        settingsLayout.addWidget(this.backgroundColor);
        settingsLayout.addStretch(0);

        this.settings.layout = settingsLayout

        layout.addWidget(this.settings);
        layout.setWidgetAlignment(this.settings, Ui.Alignment.AlignCenter);

        this.iconCropperLBE = LensBasedEditorView.create(this.pluginSystem, this.widget);

        this.iconCropperLBE.setFixedWidth(400);
        this.iconCropperLBE.setFixedHeight(400);

        /// project binding is null therefore this has no effect
        /// keeping it here to support previous LS versions
        const ignoredTypes = [
            "ScriptComponent",
            "AnimationPlayer",
            "AnimationMixer",
            "Animation",
            "AudioComponent",
            "AudioListenerComponent",
            "ColocatedTrackingComponent",
            "DeviceLocationTrackingComponent",
            "DeviceTracking",
            "LocatedAtComponent",
            "ManipulateComponent",
            "MarkerTrackingComponent",
            "ObjectTracking",
            "ObjectTracking3D",
            "VFXComponent",
            "MLComponent",
            "InteractionComponent",
            "MaskingComponent",
            "BodyComponent",
            "ColliderComponent",
            "ConstraintComponent",
        ];

        const input = new LensBasedEditorView.ImageInput();
        input.file = import.meta.resolve("./Resources/background.png")
        input.fps = 30;
        input.paused = false;

        this.iconCropperLBE.load({
            lens: import.meta.resolve("./Resources/lbe-archive.zip"),
            input: input,
            binding: { project: null },
            ignoredTypes: ignoredTypes,
            useOverlayOutput: false
        });
        layout.addStretch(0);
        layout.addWidget(this.iconCropperLBE);
        layout.setWidgetAlignment(this.iconCropperLBE, Ui.Alignment.AlignCenter);
        layout.addStretch(0);

        this.footer = this.createFooter(this.widget);
        layout.addWidget(this.footer);

        this.iconCropperLBE.onMessage.connect((message) => {
            this.handleMessage(message.data);
        });

        this.widget.layout = layout;

        return this.widget;
    }

    deinit() {
        this.iconCropperLBE.unload();
    }
}
