import {createResourcePresetClass, PresetCreateMethod} from '../Utils/ResourcePresetFactory.js';

export const TsConfigPreset = createResourcePresetClass({
    name: 'TS Config',
    id: 'Com.Snap.JsonAssetPreset.TsConfig',
    description: 'TypeScript configuration file asset',
    icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/JsonFile.svg')),
    section: 'Scripting',
    entityType: "JsonAsset",
    resourcePath: import.meta.resolve('Resources/tsconfig.json'),
    createMethod: PresetCreateMethod.AlwaysCreateNew
});
