export var DependencyKeys;
(function (DependencyKeys) {
    DependencyKeys["Main"] = "Main";
    DependencyKeys["PluginSystem"] = "pluginSystem";
    DependencyKeys["AnimationLibrary"] = "AnimationLibrary";
    DependencyKeys["Preview"] = "Preview";
    DependencyKeys["LBEPreview"] = "LBEPreview";
    DependencyKeys["IsActive"] = "IsActive";
    DependencyKeys["BitmojiComponent"] = "BitmojiComponent";
})(DependencyKeys || (DependencyKeys = {}));
class DependencyContainer {
    constructor() {
        this.instances = new Map();
    }
    register(dependencyKey, instance) {
        this.instances.set(dependencyKey, instance);
    }
    get(dependencyKey) {
        return this.instances.get(dependencyKey);
    }
    has(dependencyKey) {
        return this.instances.has(dependencyKey);
    }
    deinit() {
        this.instances.clear();
    }
}
export const dependencyContainer = new DependencyContainer();
