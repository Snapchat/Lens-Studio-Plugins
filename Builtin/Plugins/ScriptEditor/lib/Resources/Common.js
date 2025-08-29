export const PluginSettings = {
    PluginID: 'Snap.Plugin.Gui.ScriptEditor',
    PluginName: 'Script Editor',
}

export const EDITOR_EVENTS = {
    EDITOR_READY: 'editorReady',
    GET_SCRIPT_CONTENT: 'getScriptContent',
    SHOW_SAVE_DIALOG: 'showSaveDialog',
    SAVE_SCRIPT_CONTENT: 'saveScriptContent',
    SAVE_ALL_FILES: 'saveAllFiles',
    GET_CONTENT_DECLARATIONS: 'getDeclarationsForContent',
    GET_FILE_METADATA: 'getFileMetadata',
    CREATE_DEF_FILES: 'createDefinitionFiles',
    PLATFORM_INFO: 'PLATFORM_INFO',
    UNSAVED_STATE_CHANGED: 'unsavedStateChanged',
    SHUTDOWN: 'shutdown',
};

export const FILE_EVENTS = {
    ACTIVE_CHANGED: 'activeFileChanged',
    LOAD_DEPENDENCY: 'loadDependency',
    CONTENT_CHANGED: 'fileContentChanged',
    RENAMED: 'fileRenamed',
    DELETED: 'fileDeleted',
    UPDATE_READONLY: 'updateFileReadOnlyStatus',
    SAVE_ALL_FILES: 'saveAllFiles',
    DISCARD_ALL_FILES: 'discardAllFiles',
};
