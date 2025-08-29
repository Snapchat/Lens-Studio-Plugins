import * as Ui from 'LensStudio:Ui';
import { AnimationDialog } from '../dialog/AnimationDialog.js';
import {Logger} from "./logger.js";

class Application {

    constructor() {
        this.mConnections = [];
        this.mPluginSystem = null;
        this.mGui = null;

        this.mApiVersion = 0;
        this.pluginStatus = false;

        this.mIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('Resources/GenAI Bitmoji Animation.svg')));

        this.mLogger = new Logger();
    }

    initialize(pluginSystem) {
        this.mPluginSystem = pluginSystem;
        this.mGui = this.findInterface(Ui.IGui);
        this.mAuthComponent = this.findInterface(Editor.IAuthorization);

        this.mPlugin = new AnimationDialog(this.mGui.createDialog());
        this.mPlugin.create();

        this.mConnections.push(this.mPlugin.dialog.onClose.connect(() => {
            this.mPlugin.close();
        }));

        this.mLogger.subscribe((text, options) => {
            this.mPlugin.onLog(text, options);
        });
    }

    show() {
        this.mPlugin.show();
    }

    log(text, options) {
        this.mLogger.log(text, options);
    }

    get authStatus() {
        return this.mAuthComponent.isAuthorized;
    }

    close() {
    }

    findInterface(_interface) {
        return this.mPluginSystem.findInterface(_interface);
    }

    getPluginStatus() {
        return this.pluginStatus;
    }

    setPluginStatus(status) {
        this.pluginStatus = status;
    }

    subscribeOnAuth(callback) {
        this.mConnections.push(this.mAuthComponent.onAuthorizationChange.connect(callback));
    }

    authorize() {
        this.mAuthComponent.authorize();
    }

    get apiVersion() {
        return this.mApiVersion;
    }

    get icon() {
        return this.mIcon;
    }

    get pluginSystem() {
        return this.mPluginSystem;
    }

    get animationDialog() {
        return this.mPlugin;
    }
}

const app = new Application();
export default app;
