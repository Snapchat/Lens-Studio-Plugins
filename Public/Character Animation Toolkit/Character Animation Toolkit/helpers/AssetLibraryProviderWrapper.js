import * as FileSystem from "LensStudio:FileSystem"
import * as AssetLibrary from "LensStudio:AssetLibrary"
import * as Network from "LensStudio:Network"

const tempDir = FileSystem.TempDir.create()

export class AssetLibraryProviderWrapper {
    /**
     *
     * @param {Editor.PluginSystem} pluginSystem
     * @param {AssetLibrary.Space} space
     * @param {AssetLibrary.Environment} status
     */
    constructor(pluginSystem, space, status) {
        this.pluginSystem = pluginSystem
        this.assetLibService = pluginSystem.findInterface(AssetLibrary.IAssetLibraryProvider).service
        this.envSettings = new AssetLibrary.EnvironmentSetting()
        this.envSettings.environment = status
        this.envSettings.space = space
        this.assetManager = pluginSystem.findInterface(Editor.Model.IModel).project.assetManager;
        this.pageSize = 100
    }
    /**
     *
     * @param {string} id - Contentful id
     * @param {string} category - Contentful category
     * @returns
     */
    fetch(id, category, version) {
        return new Promise((resolve, reject) => {
            this._fetchAssets(id, category, version, 0, resolve, reject);
        })
    }
    /**
     *
     * @param {string} id - Contentful id of an entry
     * @param {string} category - Contentful category of an entry
     * @param {number} offset - pagination index, max = 100
     * @param {function} onSuccess - on success callback
     * @param {function} onFail - on fail callback
     */

    _fetchAssets(id, category, version, offset, onSuccess, onFail) {
        let assetFilter = new AssetLibrary.AssetFilter()
        assetFilter.categoryId = category
        assetFilter.pagination = AssetLibrary.Pagination.singleBatch(offset, 100)
        // keep this empty because name can change and it applies only within current page
        assetFilter.searchText = ""
        // request
        let request = new AssetLibrary.AssetListRequest(this.envSettings, assetFilter)
        try {
            this.assetLibService.fetch(request, (response) => this.onAssetsFetched(response, id, category, version, offset, onSuccess, onFail), onFail)
        } catch (e) {
            onFail(e);
        }
    }
    /**
     *
     * @param {object} response
     * @param {string} id
     * @param {string} category
     * @param {number} offset
     * @param {function} onSuccess
     * @param {function} onFail
     */
    onAssetsFetched(response, id, category, version, offset, onSuccess, onFail) {
        let self = this

        if (response.assets && response.assets.length > 0) {
            let assets = response.assets.filter(r => { return r.assetId == id })
            if (assets.length > 0) {
                // we just expect one asset and one resource, will keep this for more gßeneral case
                if (version != undefined) {
                    let v = this._getVersionFormatted(version);
                    try {
                        let resource = this._findClosestVersion(assets[0].resources, v);

                        if (resource != undefined) {
                            this.download(resource.uri, self.onAssetDownloaded.bind(this, onSuccess, onFail, resource.uri))
                        }
                        else {
                            onFail("Version not found");
                        }
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    assets[0].resources.forEach((resource) => {
                        self.download(resource.uri, self.onAssetDownloaded.bind(this, onSuccess, onFail, resource.uri))
                    })
                }
            } else {
                // If asset with the desired ID is not found in this batch, fetch the next batch
                this._fetchAssets(id, category, offset + 100, onSuccess, onFail);
            }
        } else {
            onFail("Couldn't fetch asset asset from the Asset Library. Check your internet connection and try again")
        }
    }
    /**
     *
     * @param {function} onSucess
     * @param {string} uri
     * @param {Network.RemoteServiceHttpResponse} response
     * @returns {Editor.Path}
     */
    onAssetDownloaded(onSuccess, onFail, uri, response) {
        let resourseName = uri.split('/').pop().split('_').join(' '); //replace all is undefined
        const parts = resourseName.split('.');
        resourseName = parts[0] + '.' + parts[parts.length - 1];

        if (response.statusCode !== 200) {
            onFail("Couldn't import " + resourseName + ". Check your internet connection and try again " + response.statusCode)
            return;
        }
        let resoursePath = tempDir.path;

        resoursePath = resoursePath.appended(new Editor.Path(resourseName))
        FileSystem.writeFile(resoursePath, response.body.toBytes())

        onSuccess(resoursePath);

    }
    /**
     * Download asset from remote
     * @param {string} url
     * @param {function(){}} onDownloaded
     */
    download(url, onDownloaded) {
        let request = new Network.HttpRequest();
        request.method = Network.HttpRequest.Method.Get
        request.url = url
        Network.performHttpRequest(request, onDownloaded)
    }
    /**
     *
     * @param {string} version
     * @returns {string} formatted version
     */
    _getVersionFormatted(version) {
        return version.split('.').slice(0, 3).join('.');
    }
    /**
     * Compare versions represented bt string [major.minor.patch]
     * @param {string} v1
     * @param {string} v2
     * @returns
     */
    _compareVersions(v1, v2) {

        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const num1 = i < parts1.length ? parts1[i] : 0;
            const num2 = i < parts2.length ? parts2[i] : 0;

            if (num1 > num2) return 1;
            if (num2 > num1) return -1;
        }
        return 0;
    }
    /**
     * Find appropriate resource version
     * @param {AssetLibrary.Resource[]} resources
     * @param {string} currentVersion
     * @returns {AssetLibrary.Resource[] || null}
     */
    _findClosestVersion(resources, currentVersion) {

        let resource = null;
        for (let i = 0; i < resources.length; i++) {
            if (this._compareVersions(resources[i].name, currentVersion) <= 0) {
                resource = resources[i];
            } else {
                break;
            }
        }
        return resource;
    }
}
