import { Preset } from 'LensStudio:Preset';

export class ObjectPrefabPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ObjectPrefabPreset',
            dependencies: [Editor.Model.IModel],
            name: 'Object Prefab',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/ObjectPrefab.svg')),
            section: 'General',
            entityType: 'ObjectPrefab'
        };
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const assetManager = model.project.assetManager;

        const prefab = assetManager.createNativeAsset('ObjectPrefab', 'ObjectPrefab', destination);

        const object = prefab.addSceneObject(null);
        object.name = 'Object Prefab';

        return prefab;
    }
}
