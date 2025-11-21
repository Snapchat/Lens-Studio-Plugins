import { Preset } from 'LensStudio:Preset';
import { ImageMarkerAssetPreset } from '../../Assets/MarkerAsset/MarkerAsset.js';
import * as Utils from 'LensStudio:Utils@1.0.js';
import * as Ui from 'LensStudio:Ui';

function createMarkerObjectPreset(name) {
    return class MarkerObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${name}MarkerObjectPreset`,
                name: `${name} Marker`,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve(`Resources/${name} Marker.svg`)),
                section: 'Tracking',
                entityType: 'SceneObject',
                dependencies: [Ui.IGui]
            };
        }

        async createAsync(destination) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const project = model.project;
                const scene = project.scene;

                // Get the Marker Asset to use
                let markerAsset;
                if (name === 'Image') {
                    const imageMarkerAssetPreset = new ImageMarkerAssetPreset(this.pluginSystem);
                    markerAsset = await imageMarkerAssetPreset.createAsync();
                } else if (name === 'Snapcode') {
                    markerAsset = project.assetManager.createNativeAsset('SnapcodeMarker', 'Snapcode Marker', new Editor.Path(''));
                }

                // Set up Marker Tracking
                const rootObject = Utils.findOrCreateCameraObject(scene, destination);
                const markerObject = scene.addSceneObject(rootObject);
                markerObject.name = `${name} Tracking`;
                const markerComponent = markerObject.addComponent('MarkerTrackingComponent');
                markerComponent.marker = markerAsset;

                return markerObject;
            } catch (e) {
                console.error(e);
            }
        }
    };
}

export const ImageMarkerObjectPreset = createMarkerObjectPreset('Image');
export const SnapcodeMarkerObjectPreset = createMarkerObjectPreset('Snapcode');
