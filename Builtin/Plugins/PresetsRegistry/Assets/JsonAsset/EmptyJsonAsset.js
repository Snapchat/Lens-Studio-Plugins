import {createResourcePresetClass, PresetCreateMethod} from '../Utils/ResourcePresetFactory.js';

export const EmptyJsonAssetPreset = createResourcePresetClass({
    name: 'Empty JSON',
    id: 'Com.Snap.JsonAssetPreset.EmptyJson',
    description: '',
    icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/JsonFile.svg')),
    section: 'General',
    entityType: "JsonAsset",
    resourcePath: import.meta.resolve('Resources/Empty JSON.json'),
    createMethod: PresetCreateMethod.AlwaysCreateNew
});
