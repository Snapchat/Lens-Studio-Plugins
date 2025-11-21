import { Preset } from 'LensStudio:Preset';
import { createScreenTransformObject } from '../ScreenTransform/ScreenTransformObject.js';
import { createImageComponent } from '../../Components/Image/ImageComponent.js';

function createObjectTrackingPreset(id, niceName) {
    class ObjectTrackingPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.ObjectTrackingPreset.${id}`,
                name: niceName,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve('Resources/ObjectTracking.svg')),
                section: 'Tracking',
                entityType: 'SceneObject'
            };
        }
        async createAsync(destination) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const scene = model.project.scene;

                const parentScreenTransform = scene.addSceneObject(destination);
                const screenTransform = createScreenTransformObject(model, parentScreenTransform);
                screenTransform.name = `Object Tracking - ${niceName}`;

                const objectTrackingComponent = screenTransform.addComponent('ObjectTracking');
                objectTrackingComponent.trackingType = Editor.Components.ObjectTrackingType[id];

                const screenimageObject = scene.addSceneObject(screenTransform);
                const screenImage = createScreenTransformObject(model, screenimageObject);
                screenImage.name = 'Screen Image';
                await createImageComponent.call(this, model, screenImage);

                return screenImage;
            } catch (e) {
                console.error(e);
            }
        }
    }
    return ObjectTrackingPreset;
}

export const catTrackingPreset = createObjectTrackingPreset('Cat', 'Cat Tracking 2D');
export const DogTrackingPreset = createObjectTrackingPreset('Dog', 'Dog Tracking 2D');
export const FullBodyTrackingPreset = createObjectTrackingPreset('FullBody', 'Full Body Tracking 2D');
export const HandTrackingPreset = createObjectTrackingPreset('Hand', 'Hand Tracking 2D');
export const NailsTrackingPreset = createObjectTrackingPreset('Nails', 'Nails Tracking 2D');
export const PetTrackingPreset = createObjectTrackingPreset('Pet', 'Pet Tracking 2D');
export const ShoulderTrackingPreset = createObjectTrackingPreset('Shoulder', 'Shoulder Tracking 2D');
export const UpperBodyTrackingPreset = createObjectTrackingPreset('UpperBody', 'Upper Body Tracking 2D');
