import { Preset } from 'LensStudio:Preset';
import * as Ui from 'LensStudio:Ui';

export class ImageMarkerAssetPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ImageMarkerAssetPreset',
            name: 'Image Marker From Texture',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/MarkerAsset.svg')),
            section: 'Tracking',
            entityType: 'Texture',
            dependencies: [Ui.IGui]
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
    }

    async createAsync(d) {
        try {
            const destination = d ? d : new Editor.Path('');

            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            const assetManager = model.project.assetManager;

            const imageMarker = assetManager.createNativeAsset('ImageMarker', 'Image Marker [EDIT_ME]', destination);

            const gui = this.pluginSystem.findInterface(Ui.IGui);
            const filename = gui.dialogs.selectFileToOpen({ 'caption': 'Select image for the marker', 'filter': '*.png *.jpeg *.jpg' }, '');

            if (filename != '') {
                const importedTextureMeta = await assetManager.importExternalFileAsync(filename, destination, Editor.Model.ResultType.Auto);
                imageMarker.texture = importedTextureMeta.primary;
            }

            return imageMarker;
        } catch (e) {
            console.error(e);
        }
    }
}
