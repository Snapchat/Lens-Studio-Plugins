import * as Ui from 'LensStudio:Ui';
import { CreationMenu } from './CreationMenu/CreationMenu.js';
import {AnimationImport} from "../animation_library/AnimationImport.js";
import {Preview} from "../Preview/Preview.js";
import app from "../application/app.js";
import {acceptTerms, me, versions} from "../application/api.js";
import EventEmitter from "../Preview/eventEmitter.js";
import { logEventOpen } from '../application/analytics.js';

export const DIALOG_WIDTH = 800;
export const DIALOG_HEIGHT = 620;

const autoAcceptedTerms = ['ls_terms_1'];

export class AnimationDialog {

    constructor(dialog) {

        this.States = {
            "Uninitialized": 0,
            "Unauthorized": 1,
            "UnsupportedApiVersion": 2,
            "RequestedTermsAndConditions": 3,
            "Preview": 5,
            "Loading": 6,
            "Running": 7,
            "Success": 8,
            "Failed": 9,
            "ConnectionFailed": 10,
            "Any": 11
        }

        this.lbeStatus = false;
        this.isEnabled = false;
        this.lbeStatusCnt = 0;

        this.width = DIALOG_WIDTH;
        this.height = DIALOG_HEIGHT;

        this.onShownCallbacks = [];

        this.dialog = dialog;

        this.dialog.setFixedWidth(this.width);
        this.dialog.setFixedHeight(this.height);
        this.dialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.stateChanged = new EventEmitter();
        this.mState = this.States.Unauthorized;

        this.isFirstLaunch = true;

        this.onLbeStartedCallback = [];
        this.onLbeFinishedCallback = [];
    }

    create() {
        this.creationMenu = new CreationMenu();
        this.preview = new Preview();

        this.configureDialog();
        this.animationImport = new AnimationImport(this, this.creationMenu)
    }

    show() {
        this.isEnabled = true;
        this.dialog.show();
        this.dialog.raise();
        this.dialog.activateWindow();

        if (this.isFirstLaunch) {

            app.subscribeOnAuth((authorized) => {
                if (authorized) {
                    if (this.mState === this.States.Unauthorized) {
                        app.setPluginStatus(false);
                        this.verificationFlow();
                    }
                } else {
                    app.setPluginStatus(false);
                    this.changeState(this.States.Unauthorized);
                }
            });

            this.verificationFlow();

            this.isFirstLaunch = false;
            this.animationImport.show();
        }

        this.onShownCallbacks.forEach((callback) => {
            callback();
        })

        logEventOpen();
    }

    changeState(state, payload) {

        if (state !== this.States.Preview) {
            app.setPluginStatus(false);
        }
        this.mState = state;

        this.stateChanged.emit(this.mState, payload);
    }

    close() {
        this.isEnabled = false;
    }

    addOnShownCallback(callback) {
        this.onShownCallbacks.push(callback)
    }

    configureErrorScreen() {
        this.errorScreen = new Ui.StatusIndicator('Error happend', this.dialog);

        this.errorScreen.setFixedWidth(DIALOG_WIDTH);
        const positionX = 0;
        const positionY = DIALOG_HEIGHT - 20;
        this.errorScreen.move(positionX, positionY);

        this.hideError();
    }

    configureDialog() {
        this.widget = new Ui.Widget(this.dialog);
        this.widget.setContentsMargins(0, 0, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.configureErrorScreen();

        this.menuWidget = this.creationMenu.create(this.widget);
        layout.addWidget(this.menuWidget);

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, this.widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        layout.addWidget(separator);

        this.previewWidget = this.preview.create(this.widget);

        layout.addWidget(this.previewWidget);

        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.widget.layout = layout;

        return this.dialog;
    }

    init() {
        this.verificationFlow();
    }

    verificationFlow() {
        if (app.authStatus) {
            me((user) => {
                if (user.statusCode !== 200) {
                    app.setPluginStatus(false);
                    this.changeState(this.States.ConnectionFailed);
                    return;
                }

                user = JSON.parse(user.body.toString());

                for (const terms of autoAcceptedTerms) {
                    if (!user.termsAccepted.includes(terms)) {
                        acceptTerms(terms, (response) => {
                            this.verificationFlow();
                        });

                        return;
                    }
                }

                versions((version_list) => {
                    if (version_list.includes(app.apiVersion)) {
                        app.log('Something went wrong, please try again.', { 'enabled': false, 'progressBar': false });
                        app.setPluginStatus(true);
                        this.animationImport.show();
                        this.changeState(this.States.Preview);
                    } else if (version_list.includes(-1)) {
                        app.setPluginStatus(false);
                        this.changeState(this.States.ConnectionFailed);
                    } else {
                        app.setPluginStatus(false);
                        this.changeState(this.States.UnsupportedApiVersion);
                    }
                });
            });
        } else {
            app.setPluginStatus(false);
            this.changeState(this.States.Unauthorized);
        }
    }

    onLog(text, options) {
        if (options.type && options.type == 'logger') {
            if (options.enabled) {
                if (this.showError) {
                    this.showError(text, options.progressBar);
                }
            } else {
                if (this.hideError) {
                    this.hideError();
                }
            }
        }
    }

    showError(text, progressBar) {
        if (this.errorScreen) {
            this.errorScreen.text = text;

            this.errorScreen.visible = true;

            if (progressBar) {
                this.errorScreen.start();
            } else {
                this.errorScreen.stop();
            }
        }
    }

    hideError() {
        if (this.errorScreen) {
            this.errorScreen.visible = false;
        }
    }

    setSelectedStatus(status, id) {
        this.preview.setSelectedStatus(status, id);
    }

    getTransitionTexture() {
        this.preview.getTransitionTexture();
    }

    addIconToTransitionMenu(id, content) {
        this.preview.addIconToTransitionMenu(id, content);
    }

    setSelectedLibraryItem(id, isBlended) {
        this.creationMenu.setSelectedLibraryItem(id, isBlended);
    }

    setSelectedTransitionItem(id) {
        this.preview.setSelectedTransitionItem(id);
    }

    sendMessage(message, callback, waitForStart) {
        this.preview.sendMessage(message, callback, waitForStart);
    }

    deinit() {
        this.preview.deinit();
    }

    setLbeStatus(isBusy) {
        this.lbeStatusCnt += isBusy ? 1 : -1;
        this.lbeStatusCnt = Math.max(this.lbeStatusCnt, 0);

        if (isBusy && this.lbeStatusCnt === 1) {
            this.lbeStatus = isBusy;
            this.onLbeStartedCallback.forEach((callback) => {
                callback();
            })

            return;
        }

        if (!isBusy && this.lbeStatusCnt === 0){
            this.lbeStatus = isBusy;
            this.onLbeFinishedCallback.forEach((callback) => {
                callback();
            })
        }
    }

    getAssetPath(libraryId) {
        return this.animationImport.getAssetPath(this.creationMenu.getEntryId(libraryId));
    }

    addOnLbeStartedCallback(callback) {
        this.onLbeStartedCallback.push(callback);
    }

    addOnLbeFinishedCallback(callback) {
        this.onLbeFinishedCallback.push(callback);
    }

    getAnimationImport() {
        return this.animationImport;
    }

    getAssetExporter() {
        return this.preview.getAssetExporter();
    }

    setPreviewAssetId(assetId) {
        this.preview.setPreviewAssetId(assetId);
    }

    changeTitleText(newText) {
        this.creationMenu.changeTitleText(newText);
    }

    get lbeIsBusy() {
        return this.lbeStatus;
    }
}
