import { Logger } from './logger.js';
import * as Ui from 'LensStudio:Ui';
import { ImmersiveMLEffect } from '../MLImmersivePlugin/ImmersiveMLEffect.js';

class Application {
    constructor() {
        this.mConnections = [];
        this.mApiVersion = 0;
        this.mSupportedApiVersions = null;

        this.mPluginSystem = null;
        this.mGui = null;
        this.mAuthComponent = null;
        this.mMainWidget = null;

        this.mName = 'Style Generator';
        this.mIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('resources/icon.svg')));

        this.mLogger = new Logger();
    }

    initialize(pluginSystem) {
        this.mPluginSystem = pluginSystem;
        this.mGui = this.findInterface(Ui.IGui);
        this.mAuthComponent = this.findInterface(Editor.IAuthorization);

        this.mPlugin = new ImmersiveMLEffect(this.mGui.createDialog());
        this.mPlugin.setName(app.name);

        this.mConnections.push(this.mPlugin.dialog.onClose.connect(() => {
            this.mPlugin.close();
        }));

        this.mLogger.subscribe((text, options) => {
            this.mPlugin.onLog(text, options);
        });
    }

    show() {
        if (!this.mPlugin.isActive) {
            this.mPlugin.init();
        }

        this.mPlugin.isActive = true;
        this.mPlugin.show();
    }

    close() {
        this.mPlugin.isActive = false;
        this.mPlugin.close();
    }

    log(text, options) {
        this.mLogger.log(text, options);
    }

    subscribeOnLogs(callback) {
        this.mLogger.subscribe(callback);
    }

    subscribeOnAuth(callback) {
        this.mConnections.push(this.mAuthComponent.onAuthorizationChange.connect(callback));
    }

    get authStatus() {
        return this.mAuthComponent.isAuthorized;
    }

    authorize() {
        this.mAuthComponent.authorize();
    }

    // Getters
    get apiVersion() {
        return this.mApiVersion;
    }

    get pluginSystem() {
        return this.mPluginSystem;
    }

    get gui() {
        return this.mGui;
    }

    get plugin() {
        return this.mPlugin;
    }

    get name() {
        return this.mName;
    }

    get icon() {
        return this.mIcon;
    }

    get dialog() {
        return this.mPlugin.dialog;
    }

    set mainWidget(mainWidget) {
        this.mMainWidget = mainWidget
    }

    get mainWidget() {
        return this.mMainWidget;
    }

    // utils
    findInterface(interfaceID) {
        return this.mPluginSystem.findInterface(interfaceID);
    }
}

const app = new Application();

export default app;
