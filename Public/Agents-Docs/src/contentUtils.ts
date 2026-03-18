/**
 * Content utilities for AGENTS.md manipulation.
 * These pure functions handle the extraction and building of content
 * with marker-based section preservation and template variable substitution.
 */

// Template placeholders
export const VERSION_PLACEHOLDER = "{{VERSION}}";
export const STUDIOLIB_PLACEHOLDER = "{{STUDIOLIB_PATH}}";

// StudioLib paths based on flavor
export const STUDIOLIB_PUBLIC = "StudioLib.d.ts";
export const STUDIOLIB_INTERNAL = "StudioLib_Internal.d.ts";

// Flavor detection constants (matching C++ FeatureSet enum serialization)
export const FLAVOR_PUBLIC = "Public";
export const FLAVOR_INTERNAL = "Internal";

// Marker comments used to identify auto-generated content
export const AGENTS_MD_HEADER = "<!-- Shipped by Lens Studio -->";
export const AGENTS_MD_DISCLAIMER = "<!-- Auto-generated. Do not modify - changes overwritten. Add custom content outside this section. -->";

/**
 * Represents user content extracted from an AGENTS.md file.
 * Content can exist both before and after the managed region.
 */
export interface UserContent {
    /** User content that appears before the opening marker */
    before: string;
    /** User content that appears after the closing marker */
    after: string;
}

export const GIT_FILE_HEADER = "# Shipped by Lens Studio";
export const AGENTS_GITIGNORE_DISCLAIMER = `# This .gitignore is generated automatically by Lens Studio.
#
# IMPORTANT: This folder's contents are WIPED and recreated every time the project loads.
# Only this .gitignore file is preserved - any other files you add will be deleted!
#
# If you want to track the Lens Studio documentation files in git, replace the "*" below with "".
# Do NOT add your own files to this folder - they will be lost on next project load.`;

/**
 * Extract user content from an existing AGENTS.md file.
 * User content is everything outside the managed region markers (both before and after).
 *
 * If no markers are found, the entire content is treated as user content
 * (handles the case where user had their own AGENTS.md before Lens Studio injection).
 *
 * @param existingContent - The current content of the AGENTS.md file
 * @param header - The marker header to look for (default: AGENTS_MD_HEADER)
 * @returns Object containing user content before and after the managed region
 */
export function extractUserContent(existingContent: string, header: string = AGENTS_MD_HEADER): UserContent {
    if (!existingContent || existingContent.length === 0) {
        return { before: "", after: "" };
    }

    const startIdx = existingContent.indexOf(header);
    if (startIdx === -1) {
        // No markers found - treat entire existing content as "before" content
        // This handles the case where user had their own AGENTS.md before
        return { before: existingContent.trim(), after: "" };
    }

    // Extract content BEFORE the first marker
    const beforeContent = existingContent.substring(0, startIdx).trim();

    const endIdx = existingContent.lastIndexOf(header);

    // Extract content AFTER the closing marker (if two markers exist)
    let afterContent = "";
    if (endIdx > startIdx) {
        afterContent = existingContent.substring(endIdx + header.length).trim();
    }

    return { before: beforeContent, after: afterContent };
}

/**
 * Build the final patched AGENTS.md content.
 *
 * File format:
 * [user content before - preserved across updates]
 * <!-- Shipped by Lens Studio -->
 * <!-- Auto-generated disclaimer -->
 * [template content]
 * <!-- Shipped by Lens Studio -->
 * [user content after - preserved across updates]
 *
 * @param templateContent - The template content from bundled resources
 * @param userContent - User content to preserve (before and after the managed region)
 * @param header - The marker header (default: AGENTS_MD_HEADER)
 * @param disclaimer - The disclaimer text (default: AGENTS_MD_DISCLAIMER)
 * @returns The complete patched file content
 */
export function buildPatchedAgentsMd(
    templateContent: string,
    userContent: UserContent,
    header: string = AGENTS_MD_HEADER,
    disclaimer: string = AGENTS_MD_DISCLAIMER
): string {
    let result = "";

    // Add user content BEFORE the managed region
    if (userContent.before && userContent.before.length > 0) {
        result += userContent.before + "\n";
    }

    // Add managed region
    result += header + "\n";
    result += disclaimer + "\n\n";
    result += templateContent + "\n";
    result += header + "\n";

    // Add user content AFTER the managed region
    if (userContent.after && userContent.after.length > 0) {
        result += userContent.after + "\n";
    }

    return result;
}

/**
 * Build the default .gitignore content for the .agents/LensStudio/ folder.
 *
 * @returns The complete .gitignore file content
 */
export function buildDefaultAgentsGitignore(): string {
    return GIT_FILE_HEADER + "\n\n" +
        AGENTS_GITIGNORE_DISCLAIMER + "\n\n" +
        "*\n\n" +
        GIT_FILE_HEADER + "\n";
}

/**
 * Determine the StudioLib filename based on flavor.
 *
 * @param flavor - The FeatureSet flavor ("Public", "Internal", or other)
 * @returns The appropriate StudioLib.d.ts filename
 */
export function getStudioLibPath(flavor: string): string {
    return flavor === FLAVOR_INTERNAL ? STUDIOLIB_INTERNAL : STUDIOLIB_PUBLIC;
}

/**
 * Process template content by replacing placeholders with actual values.
 *
 * @param templateContent - The template content with {{VERSION}} and {{STUDIOLIB_PATH}} placeholders
 * @param version - The Lens Studio version string (e.g., "5.17.0.12345")
 * @param flavor - The FeatureSet flavor ("Public", "Internal", or other)
 * @returns The processed content with placeholders replaced
 */
export function processTemplate(templateContent: string, version: string, flavor: string): string {
    const studioLibPath = getStudioLibPath(flavor);

    return templateContent
        .replace(VERSION_PLACEHOLDER, version)
        .replace(STUDIOLIB_PLACEHOLDER, studioLibPath);
}

/**
 * Parse the studioVersion.type field from project file YAML content.
 * The project file is in YAML format with a studioVersion object that contains a type field.
 *
 * @param projectFileContent - The raw YAML content of the project file
 * @returns The flavor string ("Public", "Internal", "Unset") or null if not found
 */
export function parseFlavorFromProjectFile(projectFileContent: string): string | null {
    // Look for the type field within studioVersion block
    // YAML format: studioVersion:\n  type: Public (or Internal)
    // We use a simple regex approach to avoid external YAML parser dependency

    // First find the studioVersion block
    const studioVersionMatch = projectFileContent.match(/studioVersion:\s*\n((?:\s+[^\n]+\n?)*)/);
    if (!studioVersionMatch) {
        return null;
    }

    const studioVersionBlock = studioVersionMatch[1];

    // Look for type: within that block
    const typeMatch = studioVersionBlock.match(/type:\s*(\w+)/);
    if (!typeMatch) {
        return null;
    }

    return typeMatch[1];
}
