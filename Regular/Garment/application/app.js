import { Logger } from './logger.js';
import * as Ui from 'LensStudio:Ui';
import { GarmentDialog } from '../dialog/GarmentDialog.js';
import { Generator } from '../generator/generator.js';
import { Storage } from './storage.js';
import { Importer } from '../importer/importer.js';

class Application {
    constructor() {
        this.mConnections = [];
        this.mApiVersion = 0;
        this.mSupportedApiVersions = null;

        this.mPluginSystem = null;
        this.mGui = null;
        this.mAuthComponent = null;

        this.mName = 'Garment';
        this.mIcon = Editor.Icon.fromFile(import.meta.resolve('resources/icon.svg'));

        this.mLogger = new Logger();
        this.mStorage = new Storage();
        this.mImporter = new Importer();
    }

    initialize(pluginSystem) {
        this.mPluginSystem = pluginSystem;
        this.mGui = this.findInterface(Ui.IGui);
        this.mAuthComponent = this.findInterface(Editor.IAuthorization);

        this.mGenerator = new Generator();

        this.mPlugin = new GarmentDialog(this.mGui.createDialog());
        this.mPlugin.setName(app.name);

        this.mConnections.push(this.mPlugin.dialog.onClose.connect(() => {
            this.close();
        }));

        this.mLogger.subscribe((text, options) => {
            this.mPlugin.onLog(text, options);
        });
    }

    show() {
        if (!this.mPlugin.isActive) {
            this.mPlugin.init();
            this.mGenerator.init();
        }

        this.mPlugin.isActive = true;
        this.mPlugin.show();
    }

    close() {
        this.mPlugin.isActive = false;
        this.mPlugin.close();
        this.mGenerator.reset();
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

    get generator() {
        return this.mGenerator;
    }

    get storage() {
        return this.mStorage;
    }

    get importer() {
        return this.mImporter;
    }

    // utils
    findInterface(interfaceID) {
        return this.mPluginSystem.findInterface(interfaceID);
    }
}

const app = new Application();

export default app;
