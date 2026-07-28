import { EDITABLE_ASSET_TYPES } from './editableAssetTypes.js';

const editableTypeNames = new Set(EDITABLE_ASSET_TYPES.map((t) => t.entityType));

const isScriptAsset = (entity) => {
    return entity.getTypeName() === "JavaScriptAsset"
        || entity.getTypeName() === "TypeScriptAsset";
}

export const isValidScriptToEdit = (entity) => {
    // TODO: It might be better to have an allow list of expected script file extensions
    // Any studio asset could create internal script assets that may not be expected to be parsed
    const isVfxFile = (file) => {
        return file.toLowerCase().endsWith('.vfxgraph');
    }
    return !!(isScriptAsset(entity) && entity.fileMeta?.sourcePath && !isVfxFile(entity.fileMeta.sourcePath.toString()));
}

export const isValidEntityToEdit = (entity) => {
    return isValidScriptToEdit(entity) || editableTypeNames.has(entity.getTypeName());
}

export const getLanguageFromFilePath = (filePath) => {
    if (filePath.endsWith('.ts')) {
        return 'typescript';
    } else if (filePath.endsWith('.js')) {
        return 'javascript';
    }
    return EDITABLE_ASSET_TYPES.find((t) => filePath.endsWith(t.extension))?.language;
}

export const isCustomComponentFile = (filePath) => {
    return filePath.toLowerCase().endsWith('.lsc');
}
