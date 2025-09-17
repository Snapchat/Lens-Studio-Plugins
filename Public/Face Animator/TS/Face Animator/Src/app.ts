// @ts-nocheck
class Application {

    private mPluginSystem: Editor.PluginSystem | null;
    private curName = "Face Animator";

    constructor() {
        this.mPluginSystem = null;
    }

    initialize(pluginSystem: Editor.PluginSystem) {
        this.mPluginSystem = pluginSystem;
    }

    findInterface(_interface: any) {
        return this.mPluginSystem?.findInterface(_interface);
    }

    get name(): string {
        return this.curName;
    }

    get pluginSystem() {
        return this.mPluginSystem;
    }
}

const app = new Application();
export default app;
