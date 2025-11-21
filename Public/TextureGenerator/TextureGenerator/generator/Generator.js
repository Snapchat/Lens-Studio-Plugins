import EventEmitter from "../common/EventEmitter";
import { TextureGenAPI } from "./TextureGenAPI";
import app from "../Application";
import { Storage } from "../common/Storage";
import { ErrorCode, ErrorWithCode } from "../common/ErrorWithCode";
import { NotificationKey } from "../common/NotificationManager";
import { EVENT_STATUS } from "../common/Analytics";
import { EVENT_CREATE_ASSET } from "../common/Analytics";
import { logEventCreateAsset } from "../common/Analytics";
export var GeneratorState;
(function (GeneratorState) {
    GeneratorState[GeneratorState["Uninitialized"] = 0] = "Uninitialized";
    GeneratorState[GeneratorState["Unauthorized"] = 1] = "Unauthorized";
    GeneratorState[GeneratorState["UnsupportedApiVersion"] = 2] = "UnsupportedApiVersion";
    GeneratorState[GeneratorState["RequestedTermsAndConditions"] = 3] = "RequestedTermsAndConditions";
    GeneratorState[GeneratorState["Idle"] = 5] = "Idle";
    GeneratorState[GeneratorState["Loading"] = 6] = "Loading";
    GeneratorState[GeneratorState["Running"] = 7] = "Running";
    GeneratorState[GeneratorState["Success"] = 8] = "Success";
    GeneratorState[GeneratorState["Failed"] = 9] = "Failed";
    GeneratorState[GeneratorState["ConnectionFailed"] = 10] = "ConnectionFailed";
    GeneratorState[GeneratorState["Any"] = 11] = "Any";
})(GeneratorState || (GeneratorState = {}));
export class Generator {
    constructor() {
        this.textureBytes = null;
        this.maskBytes = null;
        this.mState = GeneratorState.Uninitialized;
        this.stateChanged = new EventEmitter();
        this.stopper = { stop: false };
        app.subscribeOnAuth((authorized) => {
            var _a;
            if ((_a = app.plugin) === null || _a === void 0 ? void 0 : _a.isActive) {
                if (authorized) {
                    if (this.mState === GeneratorState.Unauthorized) {
                        this.verificationFlow();
                    }
                }
                else {
                    this.changeState(GeneratorState.Unauthorized);
                }
            }
        });
    }
    init() {
        this.verificationFlow();
    }
    reset() {
        this.changeState(GeneratorState.Uninitialized);
    }
    verificationFlow() {
        this.changeState(GeneratorState.Loading);
        if (app.authStatus) {
            this.changeState(GeneratorState.Idle);
        }
        else {
            this.changeState(GeneratorState.Unauthorized);
        }
    }
    changeState(state, payload) {
        this.mState = state;
        this.stateChanged.emit(GeneratorState.Any, payload);
        this.stateChanged.emit(this.mState, payload);
    }
    async generate(params, origin) {
        try {
            this.changeState(GeneratorState.Running);
            this.stopper.stop = false;
            const pluginSystem = app.pluginSystem;
            if (!pluginSystem) {
                throw new Error('Texture generator: plugin system not found');
            }
            const imageBytes = await TextureGenAPI.generate(pluginSystem, params.prompt, params.negativePrompt, params.seed, params.genSteps, params.guidanceScale);
            if (!imageBytes) {
                throw new Error('Texture generator: failed to generate image');
            }
            this.retrieveTexturesFromBytes(imageBytes);
        }
        catch (error) {
            if (error instanceof ErrorWithCode) {
                this.changeState(GeneratorState.Failed, error.message);
                if (error.code === ErrorCode.ViolatesCommunityGuidelines) {
                    app.notificationManager.showNotification(NotificationKey.ErrorViolatesCommunityGuidelines);
                    logEventCreateAsset(EVENT_STATUS.GUIDELINES_VIOLATION, origin, EVENT_CREATE_ASSET.INPUT_FORMAT.TEXT);
                }
                else if (error.code === ErrorCode.ReachedLimit) {
                    app.notificationManager.showNotification(NotificationKey.ErrorReachedLimit);
                    logEventCreateAsset(EVENT_STATUS.FAILED, origin, EVENT_CREATE_ASSET.INPUT_FORMAT.TEXT);
                }
                else {
                    app.notificationManager.showNotification(NotificationKey.ErrorUnknown);
                    logEventCreateAsset(EVENT_STATUS.FAILED, origin, EVENT_CREATE_ASSET.INPUT_FORMAT.TEXT);
                }
            }
            else {
                this.changeState(GeneratorState.Failed, error);
                app.notificationManager.showNotification(NotificationKey.ErrorUnknown);
                logEventCreateAsset(EVENT_STATUS.FAILED, origin, EVENT_CREATE_ASSET.INPUT_FORMAT.TEXT);
            }
            return;
        }
        logEventCreateAsset(EVENT_STATUS.SUCCESS, origin, EVENT_CREATE_ASSET.INPUT_FORMAT.TEXT);
        this.changeState(GeneratorState.Success);
    }
    cancel() {
        this.stopper.stop = true;
    }
    retrieveTexturesFromBytes(bytes) {
        const storage = new Storage();
        const archivePath = storage.createFile("TextureGen.jpg", bytes);
        this.textureBytes = storage.readBytes(archivePath);
    }
    get state() {
        return this.mState;
    }
}
