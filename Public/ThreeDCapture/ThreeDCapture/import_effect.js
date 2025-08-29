import app from '../application/app.js';

export async function importEffect(filePath, tmp) {
    const model = findInterface(app.pluginSystem, Editor.Model.IModel);
    const assetManager = model.project.assetManager;
    const scene = model.project.scene;
    const selection = model.project.selection;

    let packageRoot = await assetManager.importExternalFileAsync(import.meta.resolve("./Resources/3D Capture Package.lspkg"), new Editor.Path('/'), Editor.Model.ResultType.Unpacked);

    let splatAsset = await assetManager.importExternalFileAsync(filePath, packageRoot.path, Editor.Model.ResultType.Auto);
    splatAsset = splatAsset.primary;
    splatAsset.recenter = true;
    splatAsset.scale = 20;

    // empty packages isn't available in 5.6 anymore, need at least one empty script asset inside
    assetManager.remove(packageRoot.path + "/dummy.js");

    const so = scene.addSceneObject(null);
    so.name = 'Generative Splat';
    const splatComponent = so.addComponent('GaussianSplattingVisual');
    splatComponent.asset = splatAsset;

    selection.clear();
    selection.add(so);

    return new Promise((resolve) => {
        resolve();
    });
}

function findInterface(pluginSystem, interfaceID) {
    return pluginSystem.findInterface(interfaceID);
}
