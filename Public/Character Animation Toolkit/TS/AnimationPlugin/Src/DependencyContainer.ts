export enum DependencyKeys {
    PluginSystem = 'pluginSystem',
    AnimationLibrary = 'AnimationLibrary',
    Preview = 'Preview',
    LBEPreview = 'LBEPreview',
    IsActive = "IsActive"
}

class DependencyContainer {
    private instances: Map<string, any> = new Map();

    public register<T>(dependencyKey: DependencyKeys, instance: T): void {
        this.instances.set(dependencyKey, instance);
    }

    public get<T>(dependencyKey: DependencyKeys): T | undefined {
        return this.instances.get(dependencyKey);
    }

    public has(dependencyKey: DependencyKeys): boolean {
        return this.instances.has(dependencyKey);
    }

    public deinit(): void {
        this.instances.clear();
    }
}

export const dependencyContainer = new DependencyContainer();
