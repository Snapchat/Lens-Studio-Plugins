import { Preset } from 'LensStudio:Preset';

export function createCanvasComponent(destination) {
    const component = destination.addComponent('Canvas');

    // Set unit to pixels, if adding to object with ortho cam.
    let onOrthoCam = false;
    const cameraComponents = destination.getComponents('Camera');
    cameraComponents.forEach(c => {
        if (c.cameraType === Editor.Components.CameraType.Orthographic) {
            onOrthoCam = true;
        }
    });
    if (onOrthoCam) {
        component.unitType = Editor.Components.UnitType.Points;
    }

    return component;
}

export class CanvasComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.CanvasComponentPreset',
            name: 'Canvas',
            description: 'Canvas component',
            icon: Editor.Icon.fromFile(import.meta.resolve('../../Objects/ComponentOnly/Resources/Canvas.svg')),
            section: '2D',
            entityType: 'Canvas'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    async createAsync(destination) {
        return createCanvasComponent(destination);
    }
}
