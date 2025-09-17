export const isValidComponentToEdit = (entity) => {
    return !!(entity.isOfType("JavaScriptAsset") 
        || entity.isOfType("TypeScriptAsset") 
        || entity.isOfType("MarkdownAsset"));
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