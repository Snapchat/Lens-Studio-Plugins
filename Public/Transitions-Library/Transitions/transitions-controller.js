import { AssetLibImporter } from "../AssetLibrary/asset-lib-importer.js";
import { Movie, Pixmap } from "LensStudio:Ui";

export class TransitionController {
    constructor(parentWidget, parentLayout, pluginSystem) {
        this.pluginSystem = pluginSystem;
        this.findInterface(Editor.Model.IModel);
        this.assetLibService = new AssetLibImporter(pluginSystem);
    }

    categories() {
        return this.assetLibService.getJsonData();
    }

    async downloadIcon(name) {
        return Pixmap.create(await this.assetLibService.getPreview(name));
    }

    async downloadPreview(name) {
        return Movie.create(await this.assetLibService.getPreview(name));
    }

    onInstall(transition) {
        console.log(`Installing transition "${transition.name}"`);
        return this.assetLibService.installLSOAsset(transition)
            .catch(e => console.error(`Failed to install transition "${transition.name}": ${e}`));
    }

    findInterface(interfaceID) {
        return this.pluginSystem.findInterface(interfaceID);
    }
}
