import {CoreService} from 'LensStudio:CoreService';
import * as FileSystem from 'LensStudio:FileSystem';

let _this;

export class OrganizeFolderStructureService extends CoreService {
    static descriptor() {
        return {
            id: "Com.Snap.OrganizeFolderStructure",
            name: "",
            description: "No details",
        }
    }

    constructor(pluginSystem) {
        super(pluginSystem)
        _this = this;
    }

    createAssetAction(context, id, caption, isFlat) {
        if(!context.isOfType("AssetContext"))
        {
            return new Editor.ContextAction();
        }

        let action = new Editor.ContextAction()
        action.id = id
        action.caption = caption
        action.description = ""
        action.group = ["Organize Folder Structure"]
        action.apply = () => {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            let project = model.project;
            let assetManager = project.assetManager;

            let folderPath = "";
            let selection = context.selection;
            if(selection.length !== 0) {
                if (FileSystem.isDirectory(assetManager.assetsDirectory + "/" + selection[0].path)) {
                    folderPath = selection[0].path;
                }
            }

            _this.moveAssetsInsideFolder(assetManager, folderPath, isFlat);
            _this.removeEmptyFolders(assetManager);
        }
        return action
    }

    moveAssetsInsideFolder(assetManager, folderPath, isFlatMode) {
        let files = FileSystem.readDir(assetManager.assetsDirectory + "/" + folderPath, {recursive: true});
        files.forEach((path) => {
            let fileMeta = assetManager.getFileMeta(folderPath + "/" + path);
            if (!fileMeta || !fileMeta.primaryAsset) {
                return;
            }
            let targetFolder = folderPath;
            let subFolder = "";

            if (!isFlatMode) {
                targetFolder = folderPath + "/" + _this.getFolderName(fileMeta.primaryAsset.type);
            }

            if (fileMeta.primaryAsset.type === "NativePackageDescriptor" && this.getType(path.toString()) === "native") {
                subFolder = this.getNativePackageFolder(path.toString());

                if (FileSystem.exists(assetManager.assetsDirectory + "/" + targetFolder + "/" + subFolder) &&
                    (folderPath + "/" + path) !== (targetFolder + "/" + subFolder + "/" + fileMeta.primaryAsset.name + "." + this.getType(path.toString()))) {

                    for (let i = 0; i <= files.length; i++) {
                        if (!FileSystem.exists(assetManager.assetsDirectory + "/" + targetFolder + "/" + subFolder + " " + i)) {
                            subFolder += " " + i;
                            break;
                        }
                    }
                }
            }

            assetManager.move(fileMeta, targetFolder + "/" + subFolder);
        })
    }

    removeEmptyFolders(assetManager) {
        let files = FileSystem.readDir(assetManager.assetsDirectory, {recursive: true});
        files.forEach((path) => {
            _this.removeFolderRecursive(assetManager, path);
        })
    }

    removeFolderRecursive(assetManager, path) {
        path = path.toString();
        let realPath = assetManager.assetsDirectory + "/" + path;
        if (FileSystem.isDirectory(realPath) && FileSystem.readDir(realPath, {recursive: false}).length === 0) {
            assetManager.remove(path);
            let lastIndex = path.lastIndexOf("/");
            if (lastIndex !== -1) {
                let parentPath = path.substring(0, lastIndex);
                this.removeFolderRecursive(assetManager, parentPath);
            }
        }
    }

    getFolderName(curType) {
        switch (curType) {
            case "JavaScriptAsset":
            case "TypeScriptAsset":
                return "Scripts";
            case "FileTexture":
                return "Textures";
            case "RenderTarget":
                return "Render Targets";
            case "Material":
            case "ShaderGraphPass":
                return "Materials";
            case "VFXAsset":
                return "VFX 2.0";
            case "FileMesh":
                return "Meshes";
            case "Font":
                return "Fonts";
            case "FileMLAsset":
                return "ML";
            default:
                if (curType.includes("Tracking")){
                    return "Tracking";
                }
                if (curType.includes("Animation")){
                    return "Animation";
                }
                if (curType.includes("Audio")){
                    return "Audio";
                }
                return "Other Resources";
        }
    }

    getType(path) {
        let curType = "";
        for (let i = path.length - 1; i >= 0; i--) {
            if (path[i] === '.') {
                break;
            }
            curType += path[i];
        }

        return curType.split("").reverse().join("");
    }

    getNativePackageFolder(path) {
        let folderName = "";
        let isSlashFound = false;
        for (let i = path.length - 1; i >= 0; i--) {
            if (path[i] === "/") {
                if (isSlashFound) {
                    break;
                }
                isSlashFound = true;
                continue;
            }
            if (isSlashFound) {
                folderName += path[i];
            }
        }

        return folderName.split("").reverse().join("");
    }

    start() {
        const actionsRegistry = this.pluginSystem.findInterface(Editor.IContextActionRegistry)

        this.guard = []
        this.guard.push(actionsRegistry.registerAction((context) => this.createAssetAction(context, "Action.DefaultStructure", "Default", false)))
        this.guard.push(actionsRegistry.registerAction((context) => this.createAssetAction(context, "Action.FlatStructure", "Flat", true)))
    }

    stop() {
        this.guard = []
    }
}
