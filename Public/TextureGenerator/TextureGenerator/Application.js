// import { Logger } from './common/Logger.js';
import * as Ui from 'LensStudio:Ui';
import { FaceMaskDialog } from './dialog/FaceMaskDialog.js';
import { Generator } from './generator/Generator.js';
import { Storage } from './common/Storage.js';
import { Importer } from './importer/Importer.js';
import { NotificationManager } from './common/NotificationManager.js';
class Application {
    constructor() {
        this.mConnections = [];
        this.mPluginSystem = null;
        this.mGui = null;
        this.mAuthComponent = null;
        this.mName = 'Texture Generator';
        this.mGenerator = null;
        this.mPlugin = null;
        this.mIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/GenAiTexture.svg')));
        this.mStorage = new Storage();
        this.mImporter = new Importer();
        this.mNotificationManager = new NotificationManager();
    }
    init(pluginSystem) {
        this.mPluginSystem = pluginSystem;
        this.mGui = this.mPluginSystem.findInterface(Ui.IGui);
        this.mAuthComponent = this.mPluginSystem.findInterface(Editor.IAuthorization);
        this.mGenerator = new Generator();
        this.mPlugin = new FaceMaskDialog(this.mGui.createDialog());
        this.mPlugin.setName(app.name);
        this.mConnections.push(this.mPlugin.dialog.onClose.connect(() => {
            this.close();
        }));
    }
    show() {
        if (this.mPlugin && !this.mPlugin.isActive) {
            this.mPlugin.init();
            this.mGenerator?.init();
        }
        if (this.mPlugin) {
            this.mPlugin.isActive = true;
            this.mPlugin.show();
        }
    }
    close() {
        if (this.mPlugin) {
            this.mPlugin.isActive = false;
            this.mPlugin.close();
        }
        this.mGenerator?.reset();
    }
    subscribeOnAuth(callback) {
        if (this.mAuthComponent) {
            this.mConnections.push(this.mAuthComponent.onAuthorizationChange.connect(callback));
        }
    }
    get authStatus() {
        return this.mAuthComponent?.isAuthorized || false;
    }
    authorize() {
        this.mAuthComponent?.authorize();
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
    get notificationManager() {
        return this.mNotificationManager;
    }
    findInterface(interfaceID) {
        return this.mPluginSystem?.findInterface(interfaceID);
    }
}
const app = new Application();
export default app;
