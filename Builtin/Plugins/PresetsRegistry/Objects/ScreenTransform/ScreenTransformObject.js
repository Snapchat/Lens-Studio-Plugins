import { Preset } from 'LensStudio:Preset';
import { createScreenRegionComponent } from '../ScreenRegion/ScreenRegionObject.js';
import { findOrCreateOrthoCam } from '../OrthographicCamera/OrthographicCameraObject.js';

export function createScreenTransformComponent(model, sceneObject) {
    const screenTransform = sceneObject.addComponent('ScreenTransform');
    screenTransform.transform = new Editor.Transform(new vec3(0, 0, 0), new vec3(0, 0, 0), new vec3(1, 1, 1));
    sceneObject.name = 'Screen Transform';
    sceneObject.layer = sceneObject.getParent().layer;
    return screenTransform;
}

export function createScreenTransformObject(model, sceneObject, skipIntermediary) {
    const scene = model.project.scene;

    const parent = sceneObject.getParent();
    let shouldCreateHierarchy = false;

    // If object have parent, which has a Screen Transform OR Canvas
    // BUT NOT Canvas on NOT ortho cam,
    // then we just create a screen transform directly under it
    if (parent) {
        const cameraComponent = parent.getComponent('Camera');
        if (
            cameraComponent
            && cameraComponent.cameraType !== Editor.Components.CameraType.Orthographic
        ) {
            shouldCreateHierarchy = true;
        }

        const parentComponentsWithST = parent.components.filter(component => {
            return component.isOfType('ScreenTransform') || component.isOfType('Canvas');
        });

        // If parent does not have screen transform, we need to find the right parent for our ST.
        if (parentComponentsWithST.length < 1) {
            shouldCreateHierarchy = true;
        }
    } else {
        shouldCreateHierarchy = true;
    }

    // However, if parent object does not have a Screen transform,
    // then we need to figure out where to place it in the hierarchy.
    if (shouldCreateHierarchy) {
        // If an ortho camera already exist we want to use that,
        // otherwise, we need to create one.
        let parent = findOrCreateOrthoCam(model, sceneObject);

        // In some cases we might not want a Screen Region to surround a new object
        // For example: When creating a screen region, we do not need to wrap it
        // inside a screen region.
        if (!skipIntermediary) {
            parent = scene.addSceneObject(parent);
            createScreenTransformComponent(model, parent);
            createScreenRegionComponent(model, parent);
        }

        // Put our destination object under this new hierarchy
        sceneObject.setParent(parent, undefined);
    }

    // Add the Screen Transform component
    createScreenTransformComponent(model, sceneObject);

    return sceneObject;
}

export class ScreenTransformObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ScreenTransformObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Screen Transform',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/ScreenTransform.svg')),
            section: '2D',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);
        return createScreenTransformObject(model, destination);
    }
}
