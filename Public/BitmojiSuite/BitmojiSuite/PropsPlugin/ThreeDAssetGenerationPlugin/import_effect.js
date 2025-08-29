import app from '../application/app.js';

export async function importEffect(filePath, tmp, file_format) {
    const model = findInterface(app.pluginSystem, Editor.Model.IModel);
    const assetManager = model.project.assetManager;
    const scene = model.project.scene;
    const selection = model.project.selection;

    if (file_format === "lsc") {
        let scriptAsset = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
        scriptAsset = scriptAsset.primary;

        const so = scene.addSceneObject(null);
        so.name = 'Props';
        so.localTransform = new Editor.Transform(new vec3(0, 0, -200), new vec3(0, 0, 0), new vec3(100, 100, 100));
        const scriptComponent = so.addComponent('ScriptComponent');
        scriptComponent.scriptAsset = scriptAsset;

        selection.clear();
        selection.add(so);
    } else if (file_format === "lspkg") {
        let packageRoot = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Unpacked);
        for (let i = 0; i < packageRoot.files.length; i++) {
            if (packageRoot.files[i].primaryAsset.type === "ObjectPrefab") {
                const so  = scene.instantiatePrefab(packageRoot.files[i].primaryAsset, null);
                so.localTransform = new Editor.Transform(new vec3(0, 0, -200), new vec3(0, 0, 0), new vec3(100, 100, 100));

                break;
            }
        }
    } else {
        console.error("Failed to import unexpected format of 3D asset.");
    }

    return new Promise((resolve) => {
        resolve();
    });
}

function findInterface(pluginSystem, interfaceID) {
    return pluginSystem.findInterface(interfaceID);
}
