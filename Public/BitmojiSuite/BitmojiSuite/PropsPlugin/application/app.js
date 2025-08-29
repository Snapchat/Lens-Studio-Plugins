import { Logger } from './logger.js';
import * as Ui from 'LensStudio:Ui';

class Application {
    constructor() {
        this.mConnections = [];
        this.mApiVersion = 0;
        this.mSupportedApiVersions = null;

        this.mPluginSystem = null;
        this.mGui = null;
        this.mAuthComponent = null;

        this.mName = 'Props Generation';
        this.mIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('resources/icon.svg')));

        this.mLogger = new Logger();
    }

    initialize(plugin, pluginSystem) {
        this.mPluginSystem = pluginSystem;
        this.mGui = this.mPluginSystem.findInterface(Ui.IGui);
        this.mAuthComponent = this.mPluginSystem.findInterface(Editor.IAuthorization);

        this.mPlugin = plugin;

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

    // utils
    findInterface(interfaceID) {
        return this.mPluginSystem.findInterface(interfaceID);
    }
}

const app = new Application();

export default app;
