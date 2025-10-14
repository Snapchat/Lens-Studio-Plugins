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
    return isScriptAsset(entity) || entity.getTypeName() === "MarkdownAsset";
}

export const getLanguageFromFilePath = (filePath) => {
    if (filePath.endsWith('.ts')) {
        return 'typescript';
    } else if (filePath.endsWith('.js')) {
        return 'javascript';
    } else if (filePath.endsWith('.md')) {
        return 'markdown';
    }
}

export const isCustomComponentFile = (filePath) => {
    return filePath.toLowerCase().endsWith('.lsc');
}
