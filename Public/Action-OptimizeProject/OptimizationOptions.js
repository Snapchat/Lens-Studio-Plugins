export class OptimizationOption {
    constructor(optimizationOptionType, enabled, filter) {
        this.optimizationOptionType = optimizationOptionType;
        this.enabled = enabled;
        this.filter = filter;
        // Right now filter is not used, but in future we will add an ability to, for example,
        // remove only assets of some directory. In this case we will add a filter for source path
    }
}

export const OptimizationOptionType = {
    SceneObject: 0,
    LightSource: 1,
    RenderLayer: 2,
    Asset: 3,
    Directory: 4
}
