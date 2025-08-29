import * as LensBasedEditorView from 'LensStudio:LensBasedEditorView';
import * as Ui from 'LensStudio:Ui';

import { waitForLBE } from '../../../utils.js';
import { EventDispatcher } from '../../../EventDispatcher.js';

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

export class Preview extends EventDispatcher {
    constructor(parent, authorization = null) {
        super();
        const initOptions = new LensBasedEditorView.InitOptions();

        if (authorization) {
            initOptions.authorization = authorization;
        }

        this.widget = LensBasedEditorView.create(initOptions, parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.widget.load({
            lens: import.meta.resolve("./Resources/interactive_preview.zip"),
            input: input,
            ignoredTypes: ignoredTypes,
            useOverlayOutput: false
        });

        this.isAlive = true;

        this.data = null;
        this.bitmojiType = null;
        this.friendIndex = null;

        this.onBusyChangedConnection = this.widget.onMessage.connect((message) => {
            if (message.data.event_type === "onBusyChanged") {
                this.dispatchEvent({ type: Preview.BusyChanged, isBusy: message.data.event_value });
            }
        });
    }

    requestBitmojiData(cb) {
        if (!this.isAlive) {
            return cb(null);
        }

        waitForLBE(this.widget).then(() => {
            const bitmojiDataWaiter = this.widget.onMessage.connect((message) => {
                if (message.data.event_type === "bitmoji_data") {
                    cb(JSON.parse(message.data.event_value));
                    bitmojiDataWaiter.disconnect();
                }
            });

            this.widget.postMessage({
                "event_type": "request_bitmoji_data"
            });
        });
    }

    reload() {
        this.updateView(this.data, this.bitmojiType, this.friendIndex);
        this.changeCamera(this.spotName);
    }

    updateView(data, bitmojiType, friendIndex) {
        if (this.isAlive) {
            this.data = data;
            this.bitmojiType = bitmojiType;
            this.friendIndex = friendIndex;
            waitForLBE(this.widget).then(() => {
                this.widget.postMessage({
                    "event_type": "update",
                    "params": JSON.stringify(data),
                    "bitmojiType": bitmojiType,
                    "friendIndex": friendIndex
                });
            });
        }
    }

    changeCamera(spotName) {
        if (this.isAlive) {
            this.spotName = spotName;
            waitForLBE(this.widget).then(() => {
                this.widget.postMessage({
                    "event_type": "change_camera",
                    "spotName": spotName
                });
            });
        }
    }

    deinit() {
        if (this.onAuthChangedConnection) {
            this.onAuthChangedConnection.disconnect();
            this.onAuthChangedConnection = null;
        }

        if (this.onBusyChangedConnection) {
            this.onBusyChangedConnection.disconnect();
            this.onBusyChangedConnection = null;
        }

        if (this.widget && !this.widget && this.widget.isLoaded) {
            this.widget.unload();
        }
        this.isAlive = false;
    }
}

Preview.BusyChanged = "BusyChanged";
