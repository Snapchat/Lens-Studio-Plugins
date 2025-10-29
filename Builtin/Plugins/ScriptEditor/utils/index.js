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
    return isValidScriptToEdit(entity) || entity.getTypeName() === "MarkdownAsset" || entity.getTypeName() === "JsonAsset" || entity.getTypeName() === "CustomCodeNodeAsset";
}

export const getLanguageFromFilePath = (filePath) => {
    if (filePath.endsWith('.ts')) {
        return 'typescript';
    } else if (filePath.endsWith('.js')) {
        return 'javascript';
    } else if (filePath.endsWith('.md')) {
        return 'markdown';
    } else if (filePath.endsWith('.json')) {
        return 'json';
    } else if (filePath.endsWith('.customCode')) {
        return 'CustomCodeNodeGlsl';
    }
}

export const isCustomComponentFile = (filePath) => {
    return filePath.toLowerCase().endsWith('.lsc');
}
