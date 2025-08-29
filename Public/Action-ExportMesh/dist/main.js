var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AssetMenuItem_guards;
import GuiService from "LensStudio:GuiService";
import * as Ui from "LensStudio:Ui";
import { isAssetContext, isFileMesh } from "./guards.js";
import { convertMeshFile } from "./mesh.js";
export class AssetMenuItem extends GuiService {
    constructor() {
        super(...arguments);
        _AssetMenuItem_guards.set(this, []);
    }
    static descriptor() {
        return {
            id: "Com.Snap.ExportMesh.Gltf",
            name: "Export Mesh to GLB",
            description: "Adds a context menu action for native .mesh files to convert to glTF 2.0 format.",
            dependencies: [Editor.Model.IModel, Editor.IContextActionRegistry],
        };
    }
    exportMesh(selection) {
        // get absolute path of input file
        const pluginModel = this.pluginSystem.findInterface(Editor.Model.IModel);
        const assetsDirectory = pluginModel.project.assetManager.assetsDirectory;
        const inputPath = assetsDirectory.appended(selection.path);
        // ask user where to save the file
        const defaultPath = assetsDirectory.replaceFileNameBase(selection.asset.name);
        const gui = this.pluginSystem.findInterface(Ui.IGui);
        const outputPath = gui.dialogs.selectFileToSave({
            caption: "Export Mesh as glTF 2.0 (.glb)",
            filter: "*.glb",
            options: Ui.Dialogs.Options.Usual
        }, defaultPath);
        if (outputPath.isEmpty)
            return;
        // perform conversion
        convertMeshFile(selection.asset.name, inputPath, outputPath);
        console.info(`Exported mesh ${selection.asset.name} to ${outputPath}`);
    }
    start() {
        const registry = this.pluginSystem.findInterface(Editor.IContextActionRegistry);
        __classPrivateFieldGet(this, _AssetMenuItem_guards, "f").push(registry.registerAction((context) => {
            const action = new Editor.ContextAction();
            // only provide an action when selecting a single mesh asset
            if (!isAssetContext(context))
                return action;
            if (context.selection.length !== 1)
                return action;
            if (!context.selection.every(i => isFileMesh(i.asset)))
                return action;
            const selection = context.selection[0];
            action.id = "Action.ExportMesh.Gltf";
            action.caption = "Export Mesh to GLB";
            action.description = "Save a copy of the mesh to disk as glTF 2.0 (.glb)";
            action.group = [];
            action.apply = () => this.exportMesh(selection);
            return action;
        }));
    }
    stop() {
        __classPrivateFieldGet(this, _AssetMenuItem_guards, "f").length = 0;
    }
}
_AssetMenuItem_guards = new WeakMap();
