import * as FileSystem from 'LensStudio:FileSystem';
import * as AssetLibrary from "LensStudio:AssetLibrary";
import * as Network from "LensStudio:Network";
export class AssetLibImporter {
    constructor(pluginSystem) {
        this.pluginSystem = pluginSystem;
        this.assetLibService = this.findInterface(AssetLibrary.IAssetLibraryProvider).service;
        this.envSettings = new AssetLibrary.EnvironmentSetting();
        this.envSettings.environment = AssetLibrary.Environment["Production"];
        this.envSettings.space = AssetLibrary.Space["Public"];
        this.fetchItemsCount = 100;
        this.neededItemsCount = 0;
        this.tempDir = FileSystem.TempDir.create();
    }
    fetchAssets(fetchStartIdx, ids, callback, onFinished) {
        let assetFilter = new AssetLibrary.AssetFilter();
        assetFilter.categoryId = "PLUGIN_CONTENT";
        assetFilter.searchText = "";
        assetFilter.pagination = AssetLibrary.Pagination.singleBatch(fetchStartIdx, this.fetchItemsCount);
        let rec = new AssetLibrary.AssetListRequest(this.envSettings, assetFilter);
        this.assetLibService.fetch(rec, (response) => {
            response.assets.forEach((asset) => {
                if (ids.includes(asset.assetId)) {
                    this.neededItemsCount++;
                    const assetData = { id: asset.assetId, animation_preview: "", bitmoji_animation: "", body_morph_animation: "" };
                    let resources = asset.resources;
                    resources.forEach((resource) => {
                        if (resource.name === "animation_preview") {
                            assetData.animation_preview = resource.uri;
                        }
                        else if (resource.name === "bitmoji_animation") {
                            assetData.bitmoji_animation = resource.uri;
                        }
                        else if (resource.name === "body_morph_animation") {
                            assetData.body_morph_animation = resource.uri;
                        }
                    });
                    callback(assetData);
                }
            });
            if (this.neededItemsCount < ids.length) {
                this.fetchAssets(fetchStartIdx + this.fetchItemsCount, ids, callback, onFinished);
            }
            else {
                onFinished();
            }
        }, () => {
        });
    }
    downloadAsset(url, filename, callback) {
        const request = new Network.HttpRequest();
        request.url = url + "";
        request.method = Network.HttpRequest.Method.Get;
        const tempDir = this.tempDir;
        Network.performHttpRequest(request, function (response) {
            const path = tempDir.path.appended(filename);
            FileSystem.writeFile(path, response.body.toBytes());
            callback({
                success: true,
                path: path.toString()
            });
        });
    }
    findInterface(interfaceID) {
        return this.pluginSystem.findInterface(interfaceID);
    }
}
export default AssetLibImporter;
