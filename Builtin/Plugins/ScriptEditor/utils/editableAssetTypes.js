// Single source of truth for the non-script asset types the Text Editor can open.
//
// To support a new editable asset type, add ONE entry here:
//   entityType  - the asset's getTypeName() / asset.type value
//   extension   - the source file extension (drives the Monaco language)
//   language    - the Monaco language id used for syntax highlighting
//   contextMenu - when true, an "Edit <type>" item is added to the Asset Browser
//                 context menu (see pluginRegistry.js). Omit for types that are
//                 only opened indirectly (e.g. JsonAsset).
//
// Note: JS/TS script assets are handled separately by isValidScriptToEdit (they
// carry extra VFX/sourcePath logic) and are intentionally not listed here.
export const EDITABLE_ASSET_TYPES = [
    { entityType: "MarkdownAsset",       extension: ".md",         language: "markdown",          contextMenu: true },
    { entityType: "JsonAsset",           extension: ".json",       language: "json" },
    { entityType: "CustomCodeNodeAsset", extension: ".customCode", language: "CustomCodeNodeGlsl", contextMenu: true },
    { entityType: "VectorComposite",     extension: ".svg",        language: "xml",               contextMenu: true },
];

/**
 * Look up the registry entry for a given asset type name.
 * @param {string} entityType
 * @returns {{entityType: string, extension: string, language: string, contextMenu?: boolean} | undefined}
 */
export const editableAssetType = (entityType) =>
    EDITABLE_ASSET_TYPES.find((t) => t.entityType === entityType);
