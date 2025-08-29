import * as Ui from 'LensStudio:Ui';
import * as LensBasedEditorView from 'LensStudio:LensBasedEditorView';
import app from "../application/app.js";

let _this = null;

export class AssetPreview {

    constructor() {
        this.connections = [];
        this.onMessageCallback = null;
        this.messageQueueId = 1;
        this.messageQueue = {};
        this.interval = null;
        this.view = null;
        this.previewAssetId = null;
        this.shown = false;
        _this = this;
    }

    loadView() {
        const ignoredTypes = [
            "ScriptComponent",
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
            "ConstraintComponent"
        ]

        const input = new LensBasedEditorView.ImageInput();
        input.file = import.meta.resolve("./Resources/background.png");
        input.fps = 30;
        input.paused = false;

        this.view.load({
            lens: import.meta.resolve("LensCommunication.zip"),
            input: input,
            ignoredTypes: ignoredTypes,
            useOverlayOutput: false
        })
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(480);

        this.view = LensBasedEditorView.create(this.pluginSystem, this.widget);
        this.view.setFixedHeight(484);

        this.model = app.findInterface(Editor.Model.IModel);
        this.connections.push(this.model.onProjectChanged.connect(() => {
            if (this.shown) {
                this.view.unload();
                this.loadView();

                if (this.previewAssetId) {
                    app.animationDialog.setLbeStatus(true);
                    app.animationDialog.animationImport.showPreviousAnimation(this.previewAssetId);
                }
            }
        }))

        app.animationDialog.addOnShownCallback(() => {
            this.shown = true;
            this.view.unload();
            this.loadView();
            if (this.previewAssetId) {
                app.animationDialog.setLbeStatus(true);
                app.animationDialog.animationImport.showPreviousAnimation(this.previewAssetId);
            }
        })

        this.connections.push(this.widget.onHide.connect(() => {
            this.view.unload();
        }))

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = 0;
        layout.setContentsMargins(0, 0, 0, 0);
        layout.addWidget(this.view);
        layout.addStretch(0);

        this.widget.layout = layout;

        this.onMessage = this.view.onMessage.connect((message) => {
            const data = message.data;
            if (data.event_type === "remove") {
                if (this.onMessageCallback) {
                    this.onMessageCallback(data.name);
                }
                return;
            }

            if (data.event_type === "transition_texture") {
                const data = message.data;
                app.animationDialog.addIconToTransitionMenu(data.id, data.encoded_texture);

                return;
            }

            if (data.event_type === "start") {
                if (Object.keys(_this.messageQueue).length > 0) {
                    this.startInterval();
                }
                return;
            }

            if (data.event_type === "remove_from_queue") {
                const data = message.data;
                delete _this.messageQueue[Number(data.queueId)];
                if (Object.keys(_this.messageQueue).length === 0) {
                    clearInterval(_this.interval);
                }
                return;
            }

            if (data.event_type === "loading") {

            }
        })

        return this.widget;
    }

    startInterval() {
        _this.interval = setInterval(() => {
            if (app.animationDialog.isEnabled) {
                _this.view.postMessage(_this.messageQueue[Object.keys(_this.messageQueue)[0]]);
            }
        }, 30)
    }

    setPreviewAssetId(assetId) {
        _this.previewAssetId = assetId;
    }

    sendMessage(message, callback, waitForStart) {

        if (callback) {
            this.onMessageCallback = callback;
        }
        if (waitForStart) {
            message = JSON.parse(message)
            message.queueId = this.messageQueueId;
            message = JSON.stringify(message);
            this.messageQueue[this.messageQueueId] = message;
            this.messageQueueId++;
        }
        else {
            this.view.postMessage(message);
        }
    }

    deinit() {
        this.view.unload();
    }
}
