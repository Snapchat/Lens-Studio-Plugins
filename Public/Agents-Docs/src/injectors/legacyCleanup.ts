import * as FileSystem from "LensStudio:FileSystem";

/**
 * Remove the legacy .agents/ directory left behind by earlier plugin versions.
 * This runs on every project load so existing projects are cleaned up automatically.
 */
function removeLegacyAgentsDir(projectDir: Editor.Path): void {
    const legacyDir = projectDir.appended(new Editor.Path(".agents"));
    if (FileSystem.exists(legacyDir)) {
        try {
            FileSystem.remove(legacyDir);
            console.log("[AgentsDocs] Removed legacy .agents/ directory", console.None);
        } catch (e) {
            console.warn("[AgentsDocs] Could not remove legacy .agents/ dir:", e, console.None);
        }
    }
}

function removeIfExists(path: Editor.Path): void {
    if (FileSystem.exists(path)) {
        try {
            FileSystem.remove(path);
        } catch (e) {
            console.warn("[AgentsDocs] Could not remove " + path.toString() + ":", e, console.None);
        }
    }
}

/**
 * Clean up files previously injected by older versions of this plugin.
 * All removals are safe because the old plugin always wipe-and-recreated
 * these paths — they are not user-created content.
 */
export function cleanupLegacyInjections(projectDir: Editor.Path): void {
    // Remove legacy .agents/ directory (from even older plugin version)
    removeLegacyAgentsDir(projectDir);

    // Remove .claude/docs/ (was wipe-and-recreated every project load)
    const docsDir = projectDir.appended(new Editor.Path(".claude/docs"));
    removeIfExists(docsDir);

    // Remove injected skills (was wipe-and-recreated every project load)
    const editorApiSkill = projectDir.appended(new Editor.Path(".claude/skills/editor-api-execute"));
    removeIfExists(editorApiSkill);
    const logsSkill = projectDir.appended(new Editor.Path(".claude/skills/lens-studio-logs"));
    removeIfExists(logsSkill);

    // Remove injected agent (was wipe-and-recreated every project load)
    const agentFile = projectDir.appended(new Editor.Path(".claude/agents/editor-api-agent.md"));
    if (FileSystem.exists(agentFile)) {
        try {
            FileSystem.remove(agentFile);
            console.log("[AgentsDocs] Removed legacy injected agent", console.None);
        } catch (e) {
            console.warn("[AgentsDocs] Could not remove legacy agent:", e, console.None);
        }
    }
}
