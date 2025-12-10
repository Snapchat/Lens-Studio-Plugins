import { Preset } from 'LensStudio:Preset';

export function createScreenRegionComponent(sceneObject) {
    const screenRegion = sceneObject.addComponent('ScreenRegionComponent');
    screenRegion.region = Editor.Components.ScreenRegionType.FullFrame;
    return screenRegion;
}
export class ScreenRegionComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ScreenRegionComponentPreset',
            name: 'Screen Region',
            description: 'ScreenRegion component (defaults to Full Frame)',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/ScreenRegion.svg')),
            section: '2D',
            entityType: 'ScreenRegionComponent'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    async createAsync(destination) {
        const screenRegion = createScreenRegionComponent(destination);
        return screenRegion;
    }
}
