class Application {
    constructor() {
        this.curName = "AI Portraits";
        this.mPluginSystem = null;
    }
    initialize(pluginSystem) {
        this.mPluginSystem = pluginSystem;
    }
    findInterface(_interface) {
        var _a;
        return (_a = this.mPluginSystem) === null || _a === void 0 ? void 0 : _a.findInterface(_interface);
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
