import app from "../application/app.js";
import * as FileSystem from 'LensStudio:FileSystem';
import {ContentfulApi} from "../animation_library/ContentfulApi.js";
import * as App from "LensStudio:App"

let _this = null;

export class AssetExporter {
    constructor() {
        _this = this;

        _this.onPackageImportedCallback = () => {};

        this.tempDir = FileSystem.TempDir.create();
        this.entryId = "77pMkoqQPt5MSnQYdckogW";

        this.authorization = app.findInterface(Editor.IAuthorization);
        this.contentfulApi = new ContentfulApi(this.authorization);

        this.bitmoji3DAssetPath = null;
    }

    saveFbxFile(response) {
        const tempFilePath = this.tempDir.path.appended(new Editor.Path("AnimationAssets.fbx"));
        FileSystem.writeFile(tempFilePath, response.body.toBytes());
        return tempFilePath;
    }

    importToProject(fbxAssetPath, callback, needToImport) {
        _this.onPackageImportedCallback = callback;
        if (!this.bitmoji3DAssetPath) {
            this.fetchEntry(this.entryId).then((fetchResult) => {
                this.fetchBitmojiAsset(fbxAssetPath, needToImport, fetchResult, 1);
            })
        }
        else {
            this.start(fbxAssetPath, needToImport);
        }
    }

    fetchBitmojiAsset(fbxAssetPath, needToImport, fetchResult, i) {
        if (i > fetchResult.response.fields.resources.length) {
            i = 1;
        }
        let assetId = fetchResult.response.fields.resources[fetchResult.response.fields.resources.length - i].sys.id
        this.fetchAsset(assetId).then((assetResult) => {
            if (assetResult.success !== true){
                this.fetchBitmojiAsset(fbxAssetPath, needToImport, fetchResult, i + 1);
            }
            else {
                const versionRegex = /v(\d+\.\d+\.\d+)/;
                const match = assetResult.path.match(versionRegex);
                if (this.compareVersions(App.version, match[1]) === -1) {
                    this.fetchBitmojiAsset(fbxAssetPath, needToImport, fetchResult, i + 1);
                }
                else {
                    this.bitmoji3DAssetPath = assetResult.path;
                    this.start(fbxAssetPath, needToImport);
                }
            }
        })
    }

    compareVersions(version1, version2) {
        version1 = version1.replace(/^v/, '');
        version2 = version2.replace(/^v/, '');

        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);

        if (v2Parts[0] < 7) {
            return 1;
        }
        if (v1Parts[1] > v2Parts[0]) {
            return 1;
        }

        if (v1Parts[1] < v2Parts[0]) {
            return -1;
        }

        return 0;
    }

    start(fbxAssetPath, needToImport) {
        this.importPrefabAsync(fbxAssetPath).then((fbxPrefabImportResult) => {
            this.savePackage(fbxPrefabImportResult, needToImport);
        });
    }

     importPrefab(assetPath) {
        let fbxPrefabImportResult = app.findInterface(Editor.Model.IModel).project.assetManager.importExternalFile(assetPath, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);

        return new Promise((resolve) => {
            resolve(fbxPrefabImportResult);
        });
    }

    async importPrefabAsync(assetPath) {
        let fbxPrefabImportResult = app.findInterface(Editor.Model.IModel).project.assetManager.importExternalFileAsync(assetPath, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);

        return new Promise((resolve) => {
            resolve(fbxPrefabImportResult);
        });
    }

    importWithCallback(assetPath, callback, needToImport) {
        if (!this.bitmoji3DAssetPath) {
            this.fetchEntry(this.entryId).then((fetchResult) => {
                if (!fetchResult.success) {
                    app.animationDialog.changeState(app.animationDialog.States.ConnectionFailed);
                    return;
                }
                let assetId = fetchResult.response.fields.resources[fetchResult.response.fields.resources.length - 1].sys.id
                this.fetchAsset(assetId).then((assetResult) => {
                    if (!assetResult.success) {
                        app.animationDialog.changeState(app.animationDialog.States.ConnectionFailed);
                        return;
                    }
                    this.bitmoji3DAssetPath = assetResult.path;
                    this.importPrefabAsync(assetPath).then((fbxPrefabImportResult) => {
                        callback(fbxPrefabImportResult);
                        this.savePackage(fbxPrefabImportResult, needToImport);
                    })
                })
            })
        }
        else{
            this.importPrefabAsync(assetPath).then((fbxPrefabImportResult) => {
                callback(fbxPrefabImportResult);
                this.savePackage(fbxPrefabImportResult, needToImport);
            })
        }
    }

    savePackage(fbxPrefab, needToImport) {
        let assetManager = app.findInterface(Editor.Model.IModel).project.assetManager
        let bitmoji3DPrefab = assetManager.importExternalFile(this.bitmoji3DAssetPath, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        let bitmoji3DAsset = bitmoji3DPrefab.primary;
        let bitmojiPackage = assetManager.importExternalFile(import.meta.resolve("./BitmojiAnimation.lspkg"), new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        let pref = "";
        if (!FileSystem.exists(assetManager.assetsDirectory + "/" + fbxPrefab.path + "/BaseLayer.animationAsset")) {
            pref = "/Animations";
        }
        let animTrackMeta = assetManager.getFileMeta(fbxPrefab.path + pref + "/BaseLayer.animationAsset");
        let heavyAnimTrackMeta = assetManager.getFileMeta(fbxPrefab.path + "/BaseLayer_heavy.animationAsset");

        const scriptAsset = bitmojiPackage.files[0].primaryAsset;
        assetManager.move(scriptAsset.fileMeta, "");
        scriptAsset.animationAsset = animTrackMeta.primaryAsset;
        scriptAsset.heavyAnimationAsset = heavyAnimTrackMeta.primaryAsset;

        let scene = app.findInterface(Editor.Model.IModel).project.scene;
        let so = scene.createSceneObject("BitmojiAnimationController");

        let animPlayer = so.addComponent('AnimationPlayer');
        scriptAsset.animationPlayer = animPlayer;
        let clip = Editor.createAnimationClip(scene);
        clip.name = "Clip 0";
        clip.animation = animTrackMeta.primaryAsset;
        clip.begin = 0.0333;
        animPlayer.animationClips = [clip];

        let bitmoji3DObject = scene.addSceneObject(so);
        bitmoji3DObject.name = "Bitmoji 3D";
        let bitmojiScriptComponent = bitmoji3DObject.addComponent('ScriptComponent')
        bitmoji3DAsset.mixamoAnimation = true;
        bitmojiScriptComponent.scriptAsset = bitmoji3DAsset;
        scriptAsset.bitmoji3dComponent = bitmojiScriptComponent;

        const scriptComponent = so.addComponent('ScriptComponent');
        scriptComponent.scriptAsset = scriptAsset;
        scriptComponent.enabled = true;

        so.worldTransform = new Editor.Transform(new vec3(0, -80, -150),
        new vec3(0, 0, 0),
        new vec3(1, 1, 1));

        assetManager.saveAsPrefab(so, bitmojiPackage.path);

        const actionManager = app.findInterface(Editor.IPackageActions);
        actionManager.exportPackage(bitmojiPackage.files[1].primaryAsset, this.tempDir.path + "/BitmojiAnimation.lspkg", Editor.Assets.ScriptTypes.Visibility.Editable);

        so.destroy();
        assetManager.remove(scriptAsset.name + ".js");
        assetManager.remove(bitmojiPackage.path);
        assetManager.remove(bitmoji3DPrefab.path);

        if (needToImport) {
            assetManager.remove(fbxPrefab.path);
            _this.importPackage(true);
        }
    }

    importPackage(fromExporter) {
        let assetManager = app.findInterface(Editor.Model.IModel).project.assetManager;
        let packedBitmojiPackage = assetManager.importExternalFile(import.meta.resolve(this.tempDir.path + "/BitmojiAnimation.lspkg"), new Editor.Path('/'), Editor.Model.ResultType.Packed);
        let bitmojiAnimMeta = assetManager.getFileMeta(packedBitmojiPackage.path + "/" + "BitmojiAnimationController" + ".prefab");

        app.findInterface(Editor.Model.IModel).project.scene.instantiatePrefab(bitmojiAnimMeta.primaryAsset, null)

        if (fromExporter) {
            _this.onPackageImportedCallback();
        }
    }

    fetchEntry(id) {
        const fetchResult = this.contentfulApi.fetchEntry(id);
        return new Promise((resolve) => {
            resolve(fetchResult);
        });
    }

    async fetchAsset(assetId) {
        let assetResult = this.contentfulApi.fetchAsset(assetId);
        return new Promise((resolve) => {
            resolve(assetResult);
        });
    }
}
