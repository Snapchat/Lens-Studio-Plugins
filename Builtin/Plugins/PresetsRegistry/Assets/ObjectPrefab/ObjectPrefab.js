import { Preset } from 'LensStudio:Preset';

export class ObjectPrefabPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ObjectPrefabPreset',
            interfaces: Preset.descriptor().interfaces,
            dependencies: [Editor.ModelComponentID],
            name: 'Object Prefab',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/ObjectPrefab.svg')),
            section: 'General',
            entityType: 'ObjectPrefab'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    create(destination) {
        const model = super.findInterface(Editor.ModelComponentID);
        const assetManager = model.project.assetManager;

        const prefab = assetManager.createNativeAsset('ObjectPrefab', 'ObjectPrefab', destination);

        const object = prefab.addSceneObject(null);
        object.name = 'Object Prefab';

        return prefab;
    }
}
