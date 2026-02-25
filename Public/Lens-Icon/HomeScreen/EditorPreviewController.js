const PreviewID = 'Snap.Plugin.Gui.PreviewPanel';

export class EditorPreviewController {
    constructor(pluginSystem) {
        this.pluginSystem = pluginSystem;
        this.dockManager = pluginSystem.findInterface(Editor.Dock.IDockManager);
    }

    isPreview(panel) {
        return panel.id === PreviewID;
    }

    getAllPreviewPanels(pluginSystem) {
        return this.dockManager.panels.filter((panel) => this.isPreview(panel));
    }
}
