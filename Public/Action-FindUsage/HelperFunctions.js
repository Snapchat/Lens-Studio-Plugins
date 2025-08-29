export function getModel(pluginSystem) {
    return pluginSystem.findInterface(Editor.Model.IModel);
}
