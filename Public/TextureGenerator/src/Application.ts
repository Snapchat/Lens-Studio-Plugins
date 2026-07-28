// import { Logger } from './common/Logger.js';
import * as Ui from 'LensStudio:Ui';
import { FaceMaskDialog } from './dialog/FaceMaskDialog.js';
import { Generator } from './generator/Generator.js';
import { Storage } from './common/Storage.js';
import { Importer } from './importer/Importer.js';
import { NotificationManager } from './common/NotificationManager.js';

class Application {
    private mConnections: any[] = [];
    private mPluginSystem: Editor.PluginSystem | null = null;
    private mGui: any = null;
    private mAuthComponent: any = null;
    private mName: string = 'Texture Generator';
    private mIcon: Editor.Icon;
    private mStorage: Storage;
    private mImporter: Importer;
    private mGenerator: Generator | null = null;
    private mPlugin: FaceMaskDialog | null = null;
    private mNotificationManager: NotificationManager;

    constructor() {
        this.mIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/GenAiTexture.svg')));
        this.mStorage = new Storage();
        this.mImporter = new Importer();
        this.mNotificationManager = new NotificationManager();
    }

    init(pluginSystem: Editor.PluginSystem) {
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

    subscribeOnAuth(callback: Function) {
        if (this.mAuthComponent) {
            this.mConnections.push(this.mAuthComponent.onAuthorizationChange.connect(callback));
        }
    }

    get authStatus(): boolean {
        return this.mAuthComponent?.isAuthorized || false;
    }

    authorize() {
        this.mAuthComponent?.authorize();
    }

    get pluginSystem(): Editor.PluginSystem | null {
        return this.mPluginSystem;
    }

    get gui() {
        return this.mGui;
    }

    get plugin(): FaceMaskDialog | null {
        return this.mPlugin;
    }

    get name(): string {
        return this.mName;
    }

    get icon(): Editor.Icon {
        return this.mIcon;
    }

    get generator(): Generator | null {
        return this.mGenerator;
    }

    get storage(): Storage {
        return this.mStorage;
    }

    get importer(): Importer {
        return this.mImporter;
    }

    get notificationManager(): NotificationManager {
        return this.mNotificationManager;
    }

    findInterface(interfaceID: any) {
        return this.mPluginSystem?.findInterface(interfaceID);
    }
}

const app = new Application();

export default app;
