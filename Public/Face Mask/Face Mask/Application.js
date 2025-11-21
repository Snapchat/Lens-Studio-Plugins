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
        this.mName = 'Face Mask';
        this.mGenerator = null;
        this.mPlugin = null;
        this.mIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/GenAiFaceMask.svg')));
        this.mStorage = new Storage();
        this.mImporter = new Importer();
        this.mNotificationManager = new NotificationManager();
    }
    init(pluginSystem) {
        this.mPluginSystem = pluginSystem;
        this.mGui = this.findInterface(Ui.IGui);
        this.mAuthComponent = this.findInterface(Editor.IAuthorization);
        this.mGenerator = new Generator();
        this.mPlugin = new FaceMaskDialog(this.mGui.createDialog());
        this.mPlugin.setName(app.name);
        this.mConnections.push(this.mPlugin.dialog.onClose.connect(() => {
            this.close();
        }));
    }
    show() {
        var _a;
        if (this.mPlugin && !this.mPlugin.isActive) {
            this.mPlugin.init();
            (_a = this.mGenerator) === null || _a === void 0 ? void 0 : _a.init();
        }
        if (this.mPlugin) {
            this.mPlugin.isActive = true;
            this.mPlugin.show();
        }
    }
    close() {
        var _a;
        if (this.mPlugin) {
            this.mPlugin.isActive = false;
            this.mPlugin.close();
        }
        (_a = this.mGenerator) === null || _a === void 0 ? void 0 : _a.reset();
    }
    subscribeOnAuth(callback) {
        if (this.mAuthComponent) {
            this.mConnections.push(this.mAuthComponent.onAuthorizationChange.connect(callback));
        }
    }
    get authStatus() {
        var _a;
        return ((_a = this.mAuthComponent) === null || _a === void 0 ? void 0 : _a.isAuthorized) || false;
    }
    authorize() {
        var _a;
        (_a = this.mAuthComponent) === null || _a === void 0 ? void 0 : _a.authorize();
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
        var _a;
        return (_a = this.mPluginSystem) === null || _a === void 0 ? void 0 : _a.findInterface(interfaceID);
    }
}
const app = new Application();
export default app;
