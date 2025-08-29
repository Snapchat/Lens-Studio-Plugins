import * as FileSystem from 'LensStudio:FileSystem';
import * as AssetLibrary from "LensStudio:AssetLibrary"
import * as Network from "LensStudio:Network"

export class AssetLibImporter {

    private pluginSystem: Editor.PluginSystem;
    private assetLibService: AssetLibrary.AssetListService;
    private envSettings: AssetLibrary.EnvironmentSetting;
    private fetchItemsCount: number;
    private neededItemsCount: number;
    private tempDir: FileSystem.TempDir;

    constructor(pluginSystem: Editor.PluginSystem) {
        this.pluginSystem = pluginSystem;
        this.assetLibService = (this.findInterface(AssetLibrary.IAssetLibraryProvider) as AssetLibrary.IAssetLibraryProvider).service;
        this.envSettings = new AssetLibrary.EnvironmentSetting();
        this.envSettings.environment = AssetLibrary.Environment["Production"];
        this.envSettings.space = AssetLibrary.Space["Public"];
        this.fetchItemsCount = 100;
        this.neededItemsCount = 0;
        this.tempDir = FileSystem.TempDir.create();
    }

    fetchAssets(fetchStartIdx: number, ids: string[], callback: Function, onFinished: Function) {
        let assetFilter = new AssetLibrary.AssetFilter()
        assetFilter.categoryId = "PLUGIN_CONTENT"
        assetFilter.searchText = ""
        assetFilter.pagination = AssetLibrary.Pagination.singleBatch(fetchStartIdx, this.fetchItemsCount);

        let rec = new AssetLibrary.AssetListRequest(this.envSettings, assetFilter);
        this.assetLibService.fetch(rec, (response: any) => {
            response.assets.forEach((asset: AssetLibrary.Asset) => {
                if (ids.includes(asset.assetId)) {
                    this.neededItemsCount++;
                    const assetData = {id : asset.assetId, animation_preview : "", bitmoji_animation : ""};

                    let resources = asset.resources
                    resources.forEach((resource) => {
                        if (resource.name === "animation_preview") {
                            assetData.animation_preview = resource.uri;
                        }
                        else if (resource.name === "bitmoji_animation") {
                            assetData.bitmoji_animation = resource.uri;
                        }
                    })

                    callback(assetData);
                }
            })

            if(this.neededItemsCount < ids.length) {
                this.fetchAssets(fetchStartIdx + this.fetchItemsCount, ids, callback, onFinished);
            }
            else {
                onFinished();
            }
        }, () => {

        })
    }

    downloadAsset(url: string, filename: string, callback: Function) {
        const request = new Network.HttpRequest();
        request.url = url + "";
        request.method = Network.HttpRequest.Method.Get;

        const tempDir = this.tempDir;
        Network.performHttpRequest(request, function(response) {
                const path = tempDir.path.appended(new Editor.Path(filename));
                FileSystem.writeFile(path, response.body.toBytes());
                callback({
                    success: true,
                    path: path.toString()
                });
        });
    }

    findInterface(interfaceID: any): Editor.IInterface {
        return this.pluginSystem.findInterface(interfaceID)
    }
}

export default AssetLibImporter;
