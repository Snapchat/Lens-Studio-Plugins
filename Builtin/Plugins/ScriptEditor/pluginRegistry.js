import { createAssetEditMenuItem } from './utils/createEditAction.js';
import { editableAssetType } from './utils/editableAssetTypes.js';

// Each menu item below is generated from an EDITABLE_ASSET_TYPES entry (the source
// of truth for editable types). Lens Studio loads every export from this module as
// a plugin class, so each context-menu type needs its own named export — but the
// type/extension/language facts all live in editableAssetTypes.js.
export const MarkDownEditMenuItem        = createAssetEditMenuItem(editableAssetType("MarkdownAsset"));
export const CustomCodeNodeEditMenuItem  = createAssetEditMenuItem(editableAssetType("CustomCodeNodeAsset"));
export const VectorCompositeEditMenuItem = createAssetEditMenuItem(editableAssetType("VectorComposite"));

export { ScriptEditor } from './main.js';
export { ScriptEditorService } from './ScriptEditorService.js';
