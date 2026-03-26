// @ts-nocheck
class Application {
    constructor() {
        this.curName = "AI Clips";
        this.mPluginSystem = null;
    }
    initialize(pluginSystem) {
        this.mPluginSystem = pluginSystem;
    }
    findInterface(_interface) {
        return this.mPluginSystem?.findInterface(_interface);
    }
    get name() {
        return this.curName;
    }
    get pluginSystem() {
        return this.mPluginSystem;
    }
}
const app = new Application();
export default app;
