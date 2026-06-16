import { GuiService } from 'LensStudio:GuiService';
import * as Ui from "LensStudio:Ui";
import { copyFile, exists, remove, TempDir } from "LensStudio:FileSystem";

const BUNDLE_EXTENSION = "prfb";

const ID = "ExportRuntimeBundle"

export class ExportRuntimeBundleContextMenuItemService extends GuiService {
    static descriptor() {
        return {
            id: "Com.Snap." + ID + "ContextMenuItemService",
            name: "Service Managing Export Runtime Bundle Action",
            description: "Allow export of runtime bundles",
            dependencies: [Editor.IContextActionRegistry]
        }
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor)
        this.guard = []
        this.lastPath = null
    }

    start() {
        const actionsRegistry = this.findInterface(Editor.IContextActionRegistry)
        this.guard.push(actionsRegistry.registerAction((context) => this.createExportAction(context)))
    }

    stop() {
        this.guard.forEach((g) => g.dispose())
        this.guard = []
    }

    createExportAction(context) {
        // Only show on assets — directories and other selections carry no `asset`.
        if (Editor.isNull(context) || !context.isOfType("AssetContext")) {
            return new Editor.ContextAction()
        }

        const selection = context.selection.filter((s) => !Editor.isNull(s.asset))
        if (selection.length < 1) return new Editor.ContextAction()

        return selection.length === 1
            ? this.createExportSingle(selection[0].asset)
            : this.createExportMultiple(selection.map((s) => s.asset))
    }

    createExportSingle(asset) {
        const action = new Editor.ContextAction()
        action.id = "Action." + ID
        action.caption = "Export as Runtime Bundle"
        action.description = `Export asset as a Runtime Bundle (.${BUNDLE_EXTENSION})`
        action.group = []
        action.apply = () => {
            const defaultName = new Editor.Path(`${asset.name}.${BUNDLE_EXTENSION}`)
            const path = this.findInterface(Ui.IGui).dialogs.selectFileToSave(
                {
                    caption: `Select path to export "${asset.name}"`,
                    filter: `Runtime Bundle (*.${BUNDLE_EXTENSION})`
                },
                this.lastPath ? this.lastPath.appended(defaultName) : defaultName
            )

            if (path.isEmpty) return // cancelled
            this.lastPath = path.parent

            const result = this.exportToPath(asset, path)
            console.info(formatResult(result))
        }
        return action
    }

    createExportMultiple(assets) {
        const action = new Editor.ContextAction()
        action.id = "Action." + ID
        action.caption = `Export ${assets.length} Assets as Runtime Bundles`
        action.description = `Export assets as Runtime Bundles (.${BUNDLE_EXTENSION})`
        action.group = []
        action.apply = () => {
            const dir = this.findInterface(Ui.IGui).dialogs.selectFolderToOpen(
                { caption: "Select folder to export multiple assets to", filter: "" },
                this.lastPath ? this.lastPath : new Editor.Path("")
            )

            if (dir.isEmpty) return // cancelled
            this.lastPath = dir

            const results = assets.map((asset) => {
                // Assets from the context menu have no fileMeta, so two assets sharing
                // a name (different types) would collide — disambiguate with the type name.
                const name = `${asset.name}.${asset.type}.${BUNDLE_EXTENSION}`
                return this.exportToPath(asset, dir.appended(new Editor.Path(name)))
            })

            console.info(`Exporting ${assets.length} assets:\n` + results.map(formatResult).join("\n"))
        }
        return action
    }

    // exportRuntimeBundle writes using the asset's own name into a directory, so to honor
    // the user-chosen file path we export into a temp dir, then copy to the destination.
    exportToPath(asset, destination) {
        const tempDir = TempDir.create()
        try {
            const exporter = this.findInterface(Editor.IRuntimeBundleExporter)
            const exportedToTemp = exporter.exportRuntimeBundle(asset, tempDir.path)
            if (exportedToTemp == null || exportedToTemp.isEmpty) {
                return { asset, error: "Lens Studio returned an empty path" }
            }

            if (exists(destination)) {
                console.warn(`Overwriting ${destination} by ${asset.name}(${asset.type}, ${asset.id})`)
                remove(destination)
            }
            copyFile(exportedToTemp, destination)
            return { asset, path: destination }
        } catch (e) {
            console.error("[ExportRuntimeBundle] Failed to export:", e, console.None)
            return { asset, error: e }
        } finally {
            // Keep tempDir referenced until the copy completes so it isn't collected early.
            void tempDir
        }
    }

    findInterface(interfaceID) {
        return this.pluginSystem.findInterface(interfaceID)
    }
}

function formatResult(result) {
    return result.error == null
        ? `Exported "${result.asset.name}" to "${result.path.toString()}"`
        : `Failed to export "${result.asset.name}": ${result.error}`
}
