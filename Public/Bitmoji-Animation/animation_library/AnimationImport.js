import {ContentfulApi} from "./ContentfulApi.js";
import * as fs from 'LensStudio:FileSystem';
import app from "../application/app.js";
import { logEventAssetCreation } from "../application/analytics.js";

export class AnimationImport {
    constructor(animationDialog, creationMenu) {

        this.assetPathMap = {};
        this.animationAssetData = {};
        this.isMovieInstalled = {};

        this.shown = false;

        this.animationDialog = animationDialog;
        this.creationMenu = creationMenu;

        this.tempDir = fs.TempDir.create();

        this.idNameMap = JSON.parse(fs.readFile(import.meta.resolve("./IdNameMap.json")));
        this.authorization = app.findInterface(Editor.IAuthorization);
        this.contentfulApi = new ContentfulApi(this.authorization);

        this.fetchEntries();
    }

    show() {
        if (!this.shown) {
            if (!app.getPluginStatus()) {
                return;
            }
            this.shown = true;
        }

        this.addMovies(this, this.idNameMap);
    }

    fetchEntries() {
        let _this = this;

        this.addAnimations(_this, this.idNameMap);
    }

    async fetchEntry(_this, id) {
        const fetchResult = _this.contentfulApi.fetchEntry(id);
        return new Promise((resolve) => {
            resolve(fetchResult);
        });
    }

    addAnimations(_this, fetchResults) {

        fetchResults.forEach(function (fetchResult) {

            const animName = JSON.parse(fetchResult.name).name;
            const animDescription = _this.getCorrectDescription(JSON.parse(fetchResult.name).description);

            const assetId = fetchResult.assetId;

            _this.creationMenu.addAnimationToLibrary(animName, animDescription, fetchResult.entryId, ()  => {
                _this.animationDialog.setLbeStatus(true);
                if (_this.animationAssetData[assetId]) {
                    _this.importAndShow(_this, _this.animationAssetData[assetId].path, assetId, () => logEventAssetCreation("SUCCESS"));
                }
                else {
                    _this.fetchFbxAsset(_this, assetId, fetchResult);
                }
            });
        })
    }

    fetchFbxAsset(_this, assetId, fetchResult) {
        _this.fetchAsset(_this, assetId).then((assetResult) => {
            if (!assetResult.success) {
                _this.fetchFbxAsset(_this, assetId, fetchResult);
                return;
            }
            if (!assetResult.success || !app.animationDialog.isEnabled) {
                _this.animationDialog.setPreviewAssetId(null);
                app.animationDialog.sendMessage(JSON.stringify({status: "hide"}), false, false);
                _this.animationDialog.setLbeStatus(false);
                app.animationDialog.changeState(app.animationDialog.States.ConnectionFailed);
                return;
            }
            _this.assetPathMap[fetchResult.entryId] = assetResult.path;
            _this.importAndShow(_this, assetResult.path, assetId, () => logEventAssetCreation("SUCCESS"));
        });
    }

    importLocalFile(path, assetId, callback) {
        this.animationDialog.setLbeStatus(true);
        this.animationAssetData[assetId] = null;
        this.assetPathMap[assetId] = path;
        this.importAndShow(this, path, assetId, () => {
            callback();
        });
    }

    showLocalFile(assetId) {
        this.animationDialog.setLbeStatus(true);
        if (this.animationAssetData[assetId]) {
            this.importAndShow(this, this.animationAssetData[assetId].path, assetId);
        }
        else {
            this.importAndShow(this, this.assetPathMap[assetId], assetId);
        }
    }

    addMovies(_this, fetchResults) {
        fetchResults.forEach(function (fetchResult, i) {
            if (_this.isMovieInstalled[i]) {
                return;
            }
            _this.fetchMovie(_this, fetchResult, i);
        });
    }


    fetchMovie(_this, fetchResult, i) {
        const previewId = fetchResult.previewId;
        _this.contentfulApi.fetchAsset(previewId).then((resolve) => {
            if (resolve.success) {
                _this.creationMenu.addMovie(fetchResult.entryId, resolve.path);
                _this.isMovieInstalled[i] = true;
            }
            else{
                _this.fetchMovie(_this, fetchResult, i);
            }
        });
    }

    showBlendedAnimation(path, callback) {
            app.animationDialog.getAssetExporter().importWithCallback(path, (objectPrefab) => {
                let animData = this.getAnimationAssetData(this, objectPrefab, "BlendedAnimation");
                let animTrackMeta = animData.meta;
                let endTime = animData.endTime;
                let prefabObj = this.instantiateAnimation(this, objectPrefab, animTrackMeta.primaryAsset, endTime);
                this.animationDialog.setPreviewAssetId("BlendedAnimation");
                this.animationDialog.sendMessage(JSON.stringify({status : "show", id : prefabObj.id.toString(), name : objectPrefab.path.toString(), endTime : endTime}), (name) => {
                    this.removeAsset(this, name);
                    callback();
                }, true);
            })
    }

     async fetchAsset(_this, assetId) {
        let assetResult = _this.contentfulApi.fetchAsset(assetId);
         return new Promise((resolve) => {
             resolve(assetResult);
         });
    }

    async importToProject(_this, path) {
        let objectPrefab = app.findInterface(Editor.Model.IModel).project.assetManager.importExternalFileAsync(path, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);

        return new Promise((resolve) => {
            resolve(objectPrefab);
        });
    }

    showPreviousAnimation(assetId) {
        this.importAndShow(this, this.animationAssetData[assetId].path, assetId);
    }

    async importAndShow(_this, path, assetId, callback) {
        _this.importToProject(_this, path).then((objectPrefab) => {
            if (!app.animationDialog.isEnabled) {
                _this.removeAsset(_this, objectPrefab.path.toString());
                _this.animationDialog.setPreviewAssetId(null);
                app.animationDialog.sendMessage(JSON.stringify({status: "hide"}), false, false);
                _this.animationDialog.setLbeStatus(false);
                app.animationDialog.changeState(app.animationDialog.States.ConnectionFailed);
                return;
            }

            let assetManager = app.findInterface(Editor.Model.IModel).project.assetManager;
            let animTrackMeta;
            let endTime;

            if (!this.animationAssetData[assetId]) {
                let animData = _this.getAnimationAssetData(_this, objectPrefab, assetId);
                animTrackMeta = animData.meta;
                endTime = animData.endTime;
            }
            else {
                animTrackMeta = assetManager.getFileMeta(assetId + ".animationAsset");
                endTime = this.animationAssetData[assetId].endTime;
            }

            let prefabObj = _this.instantiateAnimation(_this, objectPrefab, animTrackMeta.primaryAsset, endTime);
            _this.animationDialog.setPreviewAssetId(assetId);
            _this.animationDialog.sendMessage(JSON.stringify({
                status: "show",
                id: prefabObj.id.toString(),
                name: objectPrefab.path.toString(),
                endTime: endTime,
                assetId: assetId
            }), (name) => {
                _this.animationDialog.setLbeStatus(false);
                _this.removeAsset(_this, name);
                app.animationDialog.getTransitionTexture();
                if (callback) {
                    callback();
                }
            }, true);
        });
    }

    getAnimationAssetData(_this, objectPrefab, assetId) {
        let assetManager = app.findInterface(Editor.Model.IModel).project.assetManager;
        let animFileNames = ["/BaseLayer.animationAsset", "/Animations/BaseLayer.animationAsset", "/Layer0.animationAsset", "/Animations/Layer0.animationAsset"];
        let animFileName = animFileNames[0];
        for (let i = 0; i < animFileNames.length; i++) {
            if (fs.exists(assetManager.assetsDirectory + "/" + objectPrefab.path + animFileNames[i])) {
                animFileName = animFileNames[i];
                break;
            }
        }

        let animAssetPath = assetManager.assetsDirectory + "/" + objectPrefab.path + animFileName;
        let animTrackMeta = assetManager.getFileMeta(objectPrefab.path + animFileName);
        let animFile = fs.readFile(animAssetPath);
        let endTime = _this.getEndTime(animFile);

        fs.copyFile(assetManager.assetsDirectory + "/" + objectPrefab.path + animFileName, this.tempDir.path + "/" + assetId + ".animationAsset")
        this.animationAssetData[assetId] = {
            "endTime": endTime,
            "path": this.tempDir.path + "/" + assetId + ".animationAsset"
        };

        return {"meta" : animTrackMeta, "endTime" : endTime};
    }

    instantiateAnimation(_this, objectPrefab, animAsset, endTime) {
        let scene = app.findInterface(Editor.Model.IModel).project.scene;
        let so = scene.createSceneObject("AnimationPlayer");

        let animPlayer = so.addComponent('AnimationPlayer');
        let clip = Editor.createAnimationClip(scene);
        clip.name = "Clip 0";
        clip.animation = animAsset;
        clip.begin = 0.0333;
        clip.end = Number(endTime);
        animPlayer.animationClips = [clip];

        return so;
    }

    removeAsset(_this, name) {
        app.findInterface(Editor.Model.IModel).project.assetManager.remove(name);
    }

    getAssetPath(entryId) {
        return this.assetPathMap[entryId];
    }

    getEndTime(text) {
        let tIdx = 0;
        let startIdx = text.indexOf("scale:");
        let endTime = "";
        for (let i = startIdx; i >= 0; i--) {
            if (text[i] === 't') {
                tIdx = i;
                break;
            }
        }

        for (let i = tIdx; i < text.length; i++) {
            if ((text[i] >= '0' && text[i] <= '9') || text[i] === '.') {
                endTime += text[i];
            } else {
                if (endTime.length > 0) {
                    break;
                }
            }
        }

        return endTime;
    }

    getCorrectDescription(text) {
        text = text.toLowerCase();
        let newDescription = "";
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ' || (text[i] >= 'a' && text[i] <= 'z')) {
                newDescription += text[i];
            }
        }

        return newDescription;
    }
}
