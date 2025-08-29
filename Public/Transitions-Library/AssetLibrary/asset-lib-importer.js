import * as FileSystem from "LensStudio:FileSystem";
import * as AssetLibrary from "LensStudio:AssetLibrary";
import * as Network from "LensStudio:Network";
import { anyPromise, getDeviceCameraTexture, getSceneObject } from "../Utils/utils.js";

import { PluginResources } from "./ResourcesConfig.js";
import { findBestMatchingStudioVersion, StudioVersion } from "../Utils/studioVer.js";

const tempDir = FileSystem.TempDir.create();

export class AssetLibImporter {
    constructor(pluginSystem) {
        this.pluginSystem = pluginSystem;
        this.assetLibService = this.findInterface(AssetLibrary.IAssetLibraryProvider).service;
        this.model = this.findInterface(Editor.Model.IModel);
        this.scene = this.model.project.scene;
        this.asserManager = this.model.project.assetManager;

        this.envSettings = new AssetLibrary.EnvironmentSetting();
        this.envSettings.environment = AssetLibrary.Environment.Production;
        this.envSettings.space = AssetLibrary.Space.Public;
        this.fetchItemsCount = 10;

        this.transitonPath = new Editor.Path("");
        this.deviceCameraTextures = getDeviceCameraTexture(this.asserManager.assets);
        this.scriptSO = null;
        this.assetName = "";

        this.jsonDataPromise = this.fetchJSONAsset()
            .catch(e => {
                console.error(e + ":\n" + e.stack);
                return this.jsonFallback();
            });
        this.previewsAssetPromise = this.fetchAssetAsync(PluginResources.previewAssetId)
            .catch(e => Promise.reject("While trying to download previews asset: " + e + "\n" + e.stack));
    }

    async getJsonData() {
        return this.jsonDataPromise;
    }

    async getPreview(name) {
        const previewAsset = await this.previewsAssetPromise;
        const targetPreviewResource = previewAsset.resources.find(resource => resource.name === name);
        if (targetPreviewResource) {
            return this.downloadResource(targetPreviewResource)
                .catch(e => Promise.reject(`Error trying to download preview: "${name}": ` + e));
        } else {
            return Promise.reject("Preview not found: " + name);
        }
    }

    async installLSOAsset(transition) {
        this.updateModel();
        const resources = await this.downloadAssetResources(transition.lsoID);
        if (resources.length == 0) {
            return Promise.reject("No resources found for LSO asset.");
        }
        await Promise.all(resources.map(async path => this.instantiateAssets(await path)));
        return this.fetchControllerScript(transition);
    }

    async fetchControllerScript() {
        const resources = await this.downloadAssetResources(PluginResources.controllerScriptId);
        if (resources.length == 0) {
            return Promise.reject("No resources found for controller script asset.");
        }
        // expected one, just in case
        await anyPromise(resources.map(async path => {
            this.scriptAsset = this.asserManager.importExternalFile(await path, this.transitonPath, Editor.Model.ResultType.Auto).primary;
        }));
        this.setupControllerScript();
    }

    /**
     * @param {number} fetchStartIdx pagination offset
     * @param {string} assetId
     * @param {(asset: AssetLibrary.Asset)=>void} onSuccess
     * @param {(error: string)=>void} onFailed
     */
    fetchAsset(fetchStartIdx, assetId, onSuccess, onFailed) {
        const assetFilter = new AssetLibrary.AssetFilter();
        assetFilter.categoryId = PluginResources.categoryId;
        assetFilter.searchText = "";
        assetFilter.pagination = AssetLibrary.Pagination.singleBatch(fetchStartIdx, this.fetchItemsCount);
        const request = new AssetLibrary.AssetListRequest(this.envSettings, assetFilter);
        this.assetLibService.fetch(request, (response) => {
            if (response.assets.length == 0) {
                onFailed("No assets found.");
                return;
            }
            const found = response.assets.find(asset => asset.assetId === assetId);
            if (found != undefined) {
                onSuccess(found);
            } else {
                this.fetchAsset(fetchStartIdx + response.assets.length, assetId, onSuccess, onFailed);
            }
        }, (error) => {
            if (onFailed) {
                onFailed(error.description);
            }
        });
    }

    /**
     * @param {string} assetId
     * @param {number} fetchStartIdx pagination offset
     * @returns {Promise<AssetLibrary.Asset>}
     */
    fetchAssetAsync(assetId, fetchStartIdx = 0) {
        return new Promise((resolve, reject) => this.fetchAsset(fetchStartIdx, assetId, resolve, reject));
    }

    /**
     * Downloads all resources of the asset, if resource name is a studio version it will download the best matching variant.
     * @template T
     * @param {number} fetchStartIdx pagination offset
     * @param {string} assetId
     * @returns {Promise<Promise<Editor.Path>[]>}
     */
    downloadAssetResources(assetId, fetchStartIdx = 0) {
        return this.fetchAssetAsync(assetId, fetchStartIdx)
            .then(asset => this.filterResources(asset.resources)
                .map(resource => this.downloadResource(resource)));
    }

    /**
     * @param {AssetLibrary.Resource} resource
     * @returns {Promise<Editor.Path>}
     */
    downloadResource(resource) {
        const fileName = decodeURI(resource.uri).split("/").map(p => p.trim()).reverse().find(n => n !== "");
        return new Promise((resolve, reject) => this.downloadResourceByUri(resource.uri, resolve, reject))
            .then(body => this.writeTempFile(fileName, body));
    }

    /**
     * @param {string} uri
     * @param {(body: Buffer)=>void} onSuccess
     * @param {(error: string)=>void} onFailed
     */
    downloadResourceByUri(uri, onSuccess, onFailed) {
        const request = new Network.HttpRequest();
        request.url = uri;
        request.method = Network.HttpRequest.Method.Get;

        Network.performHttpRequest(request, (response) => {
            if (response.statusCode === 200) {
                onSuccess(response.body);
            } else {
                onFailed(
                    typeof response.error === "string"
                        ? response.error
                        : "Error: unexpected response status " + response.statusCode + ".",
                );
            }
        });
    }

    instantiateAssets(absLsoPath) {
        let prefabAsset;
        const importedLso = this.asserManager.importExternalFile(absLsoPath, new Editor.Path(""), Editor.Model.ResultType.Auto);
        importedLso.files.forEach((file) => {
            if (file.primaryAsset && file.primaryAsset.type == "ObjectPrefab") {
                prefabAsset = file;
            }
            if (file.primaryAsset && file.primaryAsset.name == "Render Target" && file.primaryAsset.type == "RenderTarget") {
                this.asserManager.remove(file.sourcePath);
            }
        });
        this.transitonPath = importedLso.path + PluginResources.transitionPath;
        this.instantiatedLso = this.scene.instantiatePrefab(prefabAsset.primaryAsset, null);

        this.sceneObjectsSetup();

        this.model.project.selection.set([]);
        this.model.project.selection.add(this.scriptSO);
    }

    sceneObjectsSetup() {
        this.findControllerScript();
        this.setupCameraRenderTarget();
        this.setupPostEffectTextures();

    }

    setupPostEffectTextures() {
        const so = getSceneObject(this.instantiatedLso, PluginResources.postEffectName, "PostEffectVisual");
        const postEffect = so.getComponent("PostEffectVisual");
        const liveTargetParam = new Editor.Assets.TextureParameter(this.scene.renderPreviewOutput.id);

        if (this.deviceCameraTextures.length > 0) {
            const deviceCamTexParam = new Editor.Assets.TextureParameter(this.deviceCameraTextures[0].id);
            postEffect.mainMaterial.passInfos[0].fromTexture = deviceCamTexParam;
        } else {
            postEffect.mainMaterial.passInfos[0].fromTexture = liveTargetParam;
        }
        postEffect.mainMaterial.passInfos[0].toTexture = liveTargetParam;
    }

    setupCameraRenderTarget() {
        const so = getSceneObject(this.instantiatedLso, PluginResources.transitionCameraName, "Camera");
        so.getComponent("Camera").renderTarget = this.scene.renderPreviewOutput;
    }

    findControllerScript() {
        this.scriptSO = getSceneObject(this.instantiatedLso, PluginResources.controllerScriptName);
        this.scriptSO.name = "Transition Executor";
        this.scriptC = this.scriptSO.addComponent("ScriptComponent");
    }

    setupControllerScript() {
        if (this.scriptC && this.scriptAsset) {
            this.scriptC.scriptAsset = this.scriptAsset;
            if (this.deviceCameraTextures.length > 0) {
                this.scriptC.fromTexture = this.deviceCameraTextures[0];
            } else {
                this.scriptC.fromTexture = this.scene.renderPreviewOutput;
            }
            this.scriptC.toTexture = this.scene.renderPreviewOutput;
        }
    }

    async fetchJSONAsset() {
        const resources = await this.downloadAssetResources(PluginResources.jsonFileId);
        if (resources.length == 0) {
            return Promise.reject("No remote resources found for JSON data asset.");
        }
        return anyPromise(resources.map(async path => this.parseTransitionsData(FileSystem.readFile(await path))));
    }

    jsonFallback() {
        const absPath = new Editor.Path(import.meta.resolve(PluginResources.jsonFallbackFileName));
        const buffer = FileSystem.readFile(absPath);
        return this.parseTransitionsData(buffer);
    }

    parseTransitionsData(buffer) {
        try {
            return JSON.parse(buffer).categories;
        } catch (e) {
            throw Error("Invalid JSON Data!");
        }
    }

    /**
     * @param {string} fileName
     * @param {{toBytes(): Uint8Array}} body
     * @returns {Editor.Path}
     */
    writeTempFile(fileName, body) {
        const tempFilePath = tempDir.path.appended(new Editor.Path(fileName));
        const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());
        const resolvedFilePath = import.meta.resolve(tempFilePath.toString());

        if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
            FileSystem.writeFile(tempFilePath, body.toBytes());
            return tempFilePath;
        } else {
            throw new Error(`Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
        }
    }


    /**
     * If resource name is a studio version, it will leave only the best matching variant, otherwise will be kept.
     * @param {AssetLibrary.Resource[]} resources
     * @returns {AssetLibrary.Resource[]}
     */
    filterResources(resources) {
        const generalResources = [];
        const versionedResources = [];
        resources.forEach(resource => {
            try {
                const version = StudioVersion.tryParse(resource.name);
                versionedResources.push({ version, resource });
            } catch (ignore) {
                generalResources.push(resource);
            }
        });
        const forThisStudio = findBestMatchingStudioVersion(versionedResources, e => e.version);
        return forThisStudio ? [forThisStudio.resource, ...generalResources] : generalResources;
    }


    findInterface(interfaceID) {
        return this.pluginSystem.findInterface(interfaceID);
    }

    updateModel() {
        this.model = this.findInterface(Editor.Model.IModel);
        this.scene = this.model.project.scene;
        this.asserManager = this.model.project.assetManager;
        this.deviceCameraTextures = getDeviceCameraTexture(this.asserManager.assets);
    }

}
