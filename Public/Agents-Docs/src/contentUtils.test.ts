import { PluginVerifier, Descriptor } from 'LensStudio:PluginVerifier';
import {
    AGENTS_MD_HEADER,
    AGENTS_MD_DISCLAIMER,
    GIT_FILE_HEADER,
    AGENTS_GITIGNORE_DISCLAIMER,
    VERSION_PLACEHOLDER,
    STUDIOLIB_PLACEHOLDER,
    PLATFORM_LINE_PLACEHOLDER,
    STUDIOLIB_PUBLIC,
    STUDIOLIB_INTERNAL,
    FLAVOR_PUBLIC,
    FLAVOR_INTERNAL,
    extractUserContent,
    buildPatchedAgentsMd,
    buildDefaultAgentsGitignore,
    getStudioLibPath,
    buildPlatformLine,
    processTemplate,
    parseFlavorFromProjectFile,
    UserContent
} from "./contentUtils.js";

const TEST_CATEGORY_NAME = 'AgentsDocsContentUtils';

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertEqual(actual: string, expected: string, message: string): void {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message}\nExpected:\n${expected}\n\nActual:\n${actual}`);
    }
}

function createDescriptor(testName: string): Descriptor {
    const d = new Descriptor();
    d.id = `com.snap.AgentsDocs.${TEST_CATEGORY_NAME}.${testName}.verifier`;
    d.name = `AgentsDocs Content Utils - ${testName}`;
    d.description = `Unit test for AgentsDocs content utilities - ${testName}`;
    d.dependencies = [];
    d.canVerify = (pluginDescriptor: IPluginDescriptor): boolean => {
        return pluginDescriptor.id === 'com.snap.AgentsDocs.Service';
    };
    return d;
}

// ============================================================================
// extractUserContent Tests
// ============================================================================

/**
 * Test: extractUserContent returns content after closing marker when markers exist
 */
export class extractUserContent_withMarkers_returnsContentAfterClosingMarker_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_withMarkers');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const existingContent = `${AGENTS_MD_HEADER}
${AGENTS_MD_DISCLAIMER}

# Auto-generated content
Some template stuff here.

${AGENTS_MD_HEADER}

## My Custom Section
This is user content that should be preserved.

### Another User Section
More user content here.
`;

        const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);

        assert(userContent.after.includes('## My Custom Section'), 'Should contain user heading in after');
        assert(userContent.after.includes('This is user content that should be preserved'), 'Should contain user content in after');
        assert(userContent.after.includes('### Another User Section'), 'Should contain nested user section in after');
        assert(!userContent.after.includes(AGENTS_MD_HEADER), 'After should not include the marker itself');
        assert(!userContent.after.includes('Auto-generated content'), 'After should not include auto-generated content');
        assertEqual(userContent.before, '', 'Before should be empty when no content before markers');

        console.log('[extractUserContent_withMarkers] PASSED');
    }
}

/**
 * Test: extractUserContent returns entire content as "before" when no markers exist
 */
export class extractUserContent_noMarkers_returnsEntireContent_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_noMarkers');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const existingContent = `# My Custom AGENTS.md
This is a user-created file without any Lens Studio markers.

## Custom Documentation
User's own documentation here.
`;

        const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);

        assertEqual(userContent.before, existingContent.trim(), 'Should return entire content trimmed as before');
        assertEqual(userContent.after, '', 'After should be empty when no markers');

        console.log('[extractUserContent_noMarkers] PASSED');
    }
}

/**
 * Test: extractUserContent returns empty before/after when only single marker exists
 */
export class extractUserContent_singleMarker_returnsEmpty_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_singleMarker');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const existingContent = `${AGENTS_MD_HEADER}
Some content after a single marker but no closing marker.
`;

        const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);

        assertEqual(userContent.before, '', 'Before should be empty for single marker at start');
        assertEqual(userContent.after, '', 'After should be empty for single marker');

        console.log('[extractUserContent_singleMarker] PASSED');
    }
}

/**
 * Test: extractUserContent returns empty before/after for empty file
 */
export class extractUserContent_emptyFile_returnsEmpty_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_emptyFile');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        let result = extractUserContent('', AGENTS_MD_HEADER);
        assertEqual(result.before, '', 'Empty string should return empty before');
        assertEqual(result.after, '', 'Empty string should return empty after');

        // Whitespace-only content gets trimmed to empty (no markers = treat as user content, then trim)
        result = extractUserContent('   ', AGENTS_MD_HEADER);
        assertEqual(result.before, '', 'Whitespace only content gets trimmed to empty before');
        assertEqual(result.after, '', 'Whitespace only content gets trimmed to empty after');

        console.log('[extractUserContent_emptyFile] PASSED');
    }
}

/**
 * Test: extractUserContent handles markers with empty user content
 */
export class extractUserContent_emptyUserContent_returnsEmpty_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_emptyUserContent');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const existingContent = `${AGENTS_MD_HEADER}
${AGENTS_MD_DISCLAIMER}

# Auto-generated content

${AGENTS_MD_HEADER}
`;

        const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);

        assertEqual(userContent.before, '', 'Should return empty before when no content before marker');
        assertEqual(userContent.after, '', 'Should return empty after when no user content after marker');

        console.log('[extractUserContent_emptyUserContent] PASSED');
    }
}

/**
 * Test: extractUserContent handles whitespace-only user content
 */
export class extractUserContent_whitespaceUserContent_returnsTrimmed_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_whitespaceUserContent');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const existingContent = `${AGENTS_MD_HEADER}
Some auto content
${AGENTS_MD_HEADER}


`;

        const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);

        assertEqual(userContent.before, '', 'Should return empty before for whitespace-only before content');
        assertEqual(userContent.after, '', 'Should return empty after for whitespace-only after content');

        console.log('[extractUserContent_whitespaceUserContent] PASSED');
    }
}

/**
 * Test: extractUserContent extracts content BEFORE the opening marker
 */
export class extractUserContent_contentBeforeMarker_extractsBefore_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_contentBeforeMarker');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const existingContent = `# User's Custom Header
Some user content before the managed region.

${AGENTS_MD_HEADER}
${AGENTS_MD_DISCLAIMER}

# Auto-generated content

${AGENTS_MD_HEADER}
`;

        const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);

        assert(userContent.before.includes("User's Custom Header"), 'Should extract content before opening marker');
        assert(userContent.before.includes('Some user content before the managed region'), 'Should include all before content');
        assert(!userContent.before.includes(AGENTS_MD_HEADER), 'Before should not include marker');
        assert(!userContent.before.includes('Auto-generated'), 'Before should not include auto-generated content');
        assertEqual(userContent.after, '', 'After should be empty when no content after closing marker');

        console.log('[extractUserContent_contentBeforeMarker] PASSED');
    }
}

/**
 * Test: extractUserContent extracts content BOTH before and after markers
 */
export class extractUserContent_contentBeforeAndAfter_extractsBoth_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('extractUserContent_contentBeforeAndAfter');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const existingContent = `# Before Content
Line 1
Line 2

${AGENTS_MD_HEADER}
${AGENTS_MD_DISCLAIMER}

# Auto-generated content

${AGENTS_MD_HEADER}

# After Content
Line A
Line B
`;

        const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);

        // Check before content
        assert(userContent.before.includes('# Before Content'), 'Should extract before heading');
        assert(userContent.before.includes('Line 1'), 'Should extract before Line 1');
        assert(userContent.before.includes('Line 2'), 'Should extract before Line 2');
        assert(!userContent.before.includes('Auto-generated'), 'Before should not include auto-generated');
        assert(!userContent.before.includes('After Content'), 'Before should not include after content');

        // Check after content
        assert(userContent.after.includes('# After Content'), 'Should extract after heading');
        assert(userContent.after.includes('Line A'), 'Should extract after Line A');
        assert(userContent.after.includes('Line B'), 'Should extract after Line B');
        assert(!userContent.after.includes('Auto-generated'), 'After should not include auto-generated');
        assert(!userContent.after.includes('Before Content'), 'After should not include before content');

        console.log('[extractUserContent_contentBeforeAndAfter] PASSED');
    }
}

// ============================================================================
// buildPatchedAgentsMd Tests
// ============================================================================

/**
 * Test: buildPatchedAgentsMd correctly builds content with user content before marker
 */
export class buildPatchedAgentsMd_withBeforeContent_prependsBeforeMarker_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPatchedAgentsMd_withBeforeContent');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const templateContent = '# Lens Studio Documentation\n\nSome template content here.';
        const userContent: UserContent = { before: '# My Custom Header\n\nBefore content.', after: '' };

        const result = buildPatchedAgentsMd(templateContent, userContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Check structure - should start with user's before content, not the header
        assert(result.startsWith(userContent.before), 'Should start with before content');
        assert(result.includes(AGENTS_MD_HEADER), 'Should include header');
        assert(result.includes(AGENTS_MD_DISCLAIMER), 'Should include disclaimer');
        assert(result.includes(templateContent), 'Should include template content');

        // Check order: before content -> header -> disclaimer -> template -> header
        const beforeIdx = result.indexOf(userContent.before);
        const headerFirstIdx = result.indexOf(AGENTS_MD_HEADER);
        const templateIdx = result.indexOf(templateContent);

        assert(beforeIdx < headerFirstIdx, 'Before content should come before first header');
        assert(headerFirstIdx < templateIdx, 'Header should come before template');

        console.log('[buildPatchedAgentsMd_withBeforeContent] PASSED');
    }
}

/**
 * Test: buildPatchedAgentsMd correctly builds content with user content both before and after
 */
export class buildPatchedAgentsMd_withBeforeAndAfterContent_placesCorrectly_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPatchedAgentsMd_withBeforeAndAfterContent');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const templateContent = '# Lens Studio Documentation\n\nTemplate content.';
        const userContent: UserContent = {
            before: '# Before Section\n\nUser content before.',
            after: '# After Section\n\nUser content after.'
        };

        const result = buildPatchedAgentsMd(templateContent, userContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Check all content is present
        assert(result.includes(userContent.before), 'Should include before content');
        assert(result.includes(userContent.after), 'Should include after content');
        assert(result.includes(templateContent), 'Should include template content');
        assert(result.includes(AGENTS_MD_HEADER), 'Should include header');

        // Check order: before -> header -> template -> header -> after
        const beforeIdx = result.indexOf(userContent.before);
        const headerFirstIdx = result.indexOf(AGENTS_MD_HEADER);
        const templateIdx = result.indexOf(templateContent);
        const headerSecondIdx = result.lastIndexOf(AGENTS_MD_HEADER);
        const afterIdx = result.indexOf(userContent.after);

        assert(beforeIdx < headerFirstIdx, 'Before content should come before first header');
        assert(headerFirstIdx < templateIdx, 'First header should come before template');
        assert(templateIdx < headerSecondIdx, 'Template should come before second header');
        assert(headerSecondIdx < afterIdx, 'Second header should come before after content');

        console.log('[buildPatchedAgentsMd_withBeforeAndAfterContent] PASSED');
    }
}

/**
 * Test: buildPatchedAgentsMd correctly builds content with user content after marker
 */
export class buildPatchedAgentsMd_withUserContent_appendsAfterMarker_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPatchedAgentsMd_withUserContent');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const templateContent = '# Lens Studio Documentation\n\nSome template content here.';
        const userContent: UserContent = { before: '', after: '## My Custom Section\n\nUser content preserved.' };

        const result = buildPatchedAgentsMd(templateContent, userContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Check structure
        assert(result.startsWith(AGENTS_MD_HEADER), 'Should start with header when no before content');
        assert(result.includes(AGENTS_MD_DISCLAIMER), 'Should include disclaimer');
        assert(result.includes(templateContent), 'Should include template content');
        assert(result.includes(userContent.after), 'Should include user content after');

        // Check order: header -> disclaimer -> template -> header -> user content
        const headerFirstIdx = result.indexOf(AGENTS_MD_HEADER);
        const disclaimerIdx = result.indexOf(AGENTS_MD_DISCLAIMER);
        const templateIdx = result.indexOf(templateContent);
        const headerSecondIdx = result.lastIndexOf(AGENTS_MD_HEADER);
        const userContentIdx = result.indexOf(userContent.after);

        assert(headerFirstIdx < disclaimerIdx, 'Header should come before disclaimer');
        assert(disclaimerIdx < templateIdx, 'Disclaimer should come before template');
        assert(templateIdx < headerSecondIdx, 'Template should come before closing header');
        assert(headerSecondIdx < userContentIdx, 'Closing header should come before user content');

        console.log('[buildPatchedAgentsMd_withUserContent] PASSED');
    }
}

/**
 * Test: buildPatchedAgentsMd correctly builds content without user content
 */
export class buildPatchedAgentsMd_noUserContent_omitsTrailingContent_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPatchedAgentsMd_noUserContent');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const templateContent = '# Lens Studio Documentation\n\nSome template content here.';
        const userContent: UserContent = { before: '', after: '' };

        const result = buildPatchedAgentsMd(templateContent, userContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Check structure
        assert(result.startsWith(AGENTS_MD_HEADER), 'Should start with header');
        assert(result.includes(AGENTS_MD_DISCLAIMER), 'Should include disclaimer');
        assert(result.includes(templateContent), 'Should include template content');

        // Should end with the closing header and newline, no extra content
        assert(result.endsWith(AGENTS_MD_HEADER + '\n'), 'Should end with closing header');

        // Count markers - should be exactly 2
        const markerCount = (result.match(new RegExp(AGENTS_MD_HEADER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        assertEqual(markerCount.toString(), '2', 'Should have exactly 2 markers');

        console.log('[buildPatchedAgentsMd_noUserContent] PASSED');
    }
}

/**
 * Test: buildPatchedAgentsMd handles empty template content
 */
export class buildPatchedAgentsMd_emptyTemplate_validStructure_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPatchedAgentsMd_emptyTemplate');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const userContent: UserContent = { before: '', after: 'User content' };
        const result = buildPatchedAgentsMd('', userContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        assert(result.startsWith(AGENTS_MD_HEADER), 'Should start with header even with empty template');
        assert(result.includes(AGENTS_MD_DISCLAIMER), 'Should include disclaimer');
        assert(result.includes('User content'), 'Should include user content');

        console.log('[buildPatchedAgentsMd_emptyTemplate] PASSED');
    }
}

// ============================================================================
// buildDefaultAgentsGitignore Tests
// ============================================================================

/**
 * Test: buildDefaultAgentsGitignore creates correct structure
 */
export class buildDefaultAgentsGitignore_correctStructure_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildDefaultAgentsGitignore_correctStructure');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const result = buildDefaultAgentsGitignore();

        assert(result.startsWith(GIT_FILE_HEADER), 'Should start with git file header');
        assert(result.includes(AGENTS_GITIGNORE_DISCLAIMER), 'Should include disclaimer');
        assert(result.includes('*'), 'Should include wildcard to ignore all files');
        assert(result.endsWith(GIT_FILE_HEADER + '\n'), 'Should end with git file header');

        // Count headers - should be exactly 2
        const headerCount = (result.match(new RegExp(GIT_FILE_HEADER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        assertEqual(headerCount.toString(), '2', 'Should have exactly 2 headers');

        console.log('[buildDefaultAgentsGitignore_correctStructure] PASSED');
    }
}

// ============================================================================
// Round-trip Tests
// ============================================================================

/**
 * Test: Full round-trip - extract user content and rebuild preserves user content after marker
 */
export class roundTrip_preservesUserContent_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('roundTrip_preservesUserContent');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const originalUserContentAfter = '## My Custom Rules\n\n- Rule 1\n- Rule 2\n\n### Subsection\nMore content.';
        const templateContent = '# Lens Studio Docs\n\nTemplate content.';

        // Build initial file with user content after the managed region
        const initialUserContent: UserContent = { before: '', after: originalUserContentAfter };
        const initialFile = buildPatchedAgentsMd(templateContent, initialUserContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Simulate re-injection: extract user content and rebuild
        const extractedUserContent = extractUserContent(initialFile, AGENTS_MD_HEADER);
        const newTemplateContent = '# Updated Lens Studio Docs\n\nNew template content.';
        const rebuiltFile = buildPatchedAgentsMd(newTemplateContent, extractedUserContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Verify user content is preserved
        assert(rebuiltFile.includes(originalUserContentAfter), 'User content should be preserved after round-trip');
        assert(!rebuiltFile.includes(templateContent), 'Old template should be replaced');
        assert(rebuiltFile.includes(newTemplateContent), 'New template should be present');

        console.log('[roundTrip_preservesUserContent] PASSED');
    }
}

/**
 * Test: Round-trip with file that had no markers initially
 */
export class roundTrip_userFileWithoutMarkers_preservesContent_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('roundTrip_userFileWithoutMarkers');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        // User's existing AGENTS.md without Lens Studio markers
        const userOriginalFile = '# My Project Rules\n\nCustom rules for this project.\n\n## Guidelines\n1. Do this\n2. Don\'t do that';

        // Extract user content (should be entire file as "before")
        const extractedUserContent = extractUserContent(userOriginalFile, AGENTS_MD_HEADER);

        // Verify entire content is extracted as "before"
        assertEqual(extractedUserContent.before, userOriginalFile.trim(), 'Should extract entire file as before content');
        assertEqual(extractedUserContent.after, '', 'After should be empty when no markers');

        // Build patched file with Lens Studio content
        const templateContent = '# Lens Studio Docs\n\nAuto-generated content.';
        const patchedFile = buildPatchedAgentsMd(templateContent, extractedUserContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Verify both are present - user's original content should appear BEFORE the managed region
        assert(patchedFile.includes(templateContent), 'Template content should be present');
        assert(patchedFile.includes(userOriginalFile.trim()), 'Original user content should be preserved');

        // Verify order: user content before template
        const userContentIdx = patchedFile.indexOf(userOriginalFile.trim());
        const templateIdx = patchedFile.indexOf(templateContent);
        assert(userContentIdx < templateIdx, 'User content should appear before template (before the managed region)');

        console.log('[roundTrip_userFileWithoutMarkers] PASSED');
    }
}

/**
 * Test: Multiple round-trips maintain user content
 */
export class roundTrip_multipleInjections_maintainsUserContent_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('roundTrip_multipleInjections');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const userContentAfter = '## Project-Specific Notes\n\nImportant info here.';
        let currentFile = '';

        // Simulate 5 re-injections with different templates
        for (let i = 1; i <= 5; i++) {
            const templateContent = `# Lens Studio Docs v${i}\n\nVersion ${i} content.`;
            const extracted = extractUserContent(currentFile, AGENTS_MD_HEADER);

            // On first iteration, there's no user content yet
            const contentToUse: UserContent = i === 1
                ? { before: '', after: userContentAfter }
                : extracted;
            currentFile = buildPatchedAgentsMd(templateContent, contentToUse, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);
        }

        // After 5 iterations, user content should still be there
        assert(currentFile.includes(userContentAfter), 'User content should survive multiple re-injections');
        assert(currentFile.includes('v5'), 'Latest template version should be present');
        assert(!currentFile.includes('v1'), 'Old template versions should be replaced');

        console.log('[roundTrip_multipleInjections] PASSED');
    }
}

/**
 * Test: Round-trip preserves content BOTH before and after the managed region
 * This is the main bug fix test - previously only "after" content was preserved.
 */
export class roundTrip_preservesBothBeforeAndAfter_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('roundTrip_preservesBothBeforeAndAfter');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const beforeContent = '# My Project Header\n\nThis content appears BEFORE the managed region.';
        const afterContent = '# My Custom Rules\n\nThis content appears AFTER the managed region.';
        const templateContent = '# Lens Studio Docs\n\nTemplate content.';

        // Build initial file with content both before and after
        const initialUserContent: UserContent = { before: beforeContent, after: afterContent };
        const initialFile = buildPatchedAgentsMd(templateContent, initialUserContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Verify initial structure
        assert(initialFile.includes(beforeContent), 'Initial file should include before content');
        assert(initialFile.includes(afterContent), 'Initial file should include after content');

        // Simulate re-injection: extract user content and rebuild with new template
        const extractedUserContent = extractUserContent(initialFile, AGENTS_MD_HEADER);
        const newTemplateContent = '# Updated Lens Studio Docs\n\nNew template content.';
        const rebuiltFile = buildPatchedAgentsMd(newTemplateContent, extractedUserContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

        // Verify BOTH before and after content are preserved
        assert(rebuiltFile.includes(beforeContent), 'Before content should be preserved after round-trip');
        assert(rebuiltFile.includes(afterContent), 'After content should be preserved after round-trip');
        assert(!rebuiltFile.includes(templateContent), 'Old template should be replaced');
        assert(rebuiltFile.includes(newTemplateContent), 'New template should be present');

        // Verify order is maintained
        const beforeIdx = rebuiltFile.indexOf(beforeContent);
        const newTemplateIdx = rebuiltFile.indexOf(newTemplateContent);
        const afterIdx = rebuiltFile.indexOf(afterContent);
        assert(beforeIdx < newTemplateIdx, 'Before content should remain before template');
        assert(newTemplateIdx < afterIdx, 'After content should remain after template');

        console.log('[roundTrip_preservesBothBeforeAndAfter] PASSED');
    }
}

/**
 * Test: Multiple round-trips preserve content both before and after
 */
export class roundTrip_multipleInjections_preservesBothBeforeAndAfter_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('roundTrip_multipleInjections_preservesBothBeforeAndAfter');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const beforeContent = '# Header Before Region\n\nStays at the top.';
        const afterContent = '# Footer After Region\n\nStays at the bottom.';
        let currentFile = '';

        // Simulate 5 re-injections with different templates
        for (let i = 1; i <= 5; i++) {
            const templateContent = `# Lens Studio Docs v${i}\n\nVersion ${i} content.`;
            const extracted = extractUserContent(currentFile, AGENTS_MD_HEADER);

            // On first iteration, set up initial content
            const contentToUse: UserContent = i === 1
                ? { before: beforeContent, after: afterContent }
                : extracted;
            currentFile = buildPatchedAgentsMd(templateContent, contentToUse, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);
        }

        // After 5 iterations, BOTH before and after content should still be there
        assert(currentFile.includes(beforeContent), 'Before content should survive multiple re-injections');
        assert(currentFile.includes(afterContent), 'After content should survive multiple re-injections');
        assert(currentFile.includes('v5'), 'Latest template version should be present');
        assert(!currentFile.includes('v1'), 'Old template versions should be replaced');

        // Verify order is maintained
        const beforeIdx = currentFile.indexOf(beforeContent);
        const templateIdx = currentFile.indexOf('v5');
        const afterIdx = currentFile.indexOf(afterContent);
        assert(beforeIdx < templateIdx, 'Before content should remain before template');
        assert(templateIdx < afterIdx, 'After content should remain after template');

        console.log('[roundTrip_multipleInjections_preservesBothBeforeAndAfter] PASSED');
    }
}

// ============================================================================
// getStudioLibPath Tests
// ============================================================================

/**
 * Test: getStudioLibPath returns internal path for Internal flavor
 */
export class getStudioLibPath_internal_returnsInternalPath_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('getStudioLibPath_internal');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const result = getStudioLibPath(FLAVOR_INTERNAL);
        assertEqual(result, STUDIOLIB_INTERNAL, 'Should return internal StudioLib path for Internal flavor');
        console.log('[getStudioLibPath_internal] PASSED');
    }
}

/**
 * Test: getStudioLibPath returns public path for Public flavor
 */
export class getStudioLibPath_public_returnsPublicPath_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('getStudioLibPath_public');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const result = getStudioLibPath(FLAVOR_PUBLIC);
        assertEqual(result, STUDIOLIB_PUBLIC, 'Should return public StudioLib path for Public flavor');
        console.log('[getStudioLibPath_public] PASSED');
    }
}

/**
 * Test: getStudioLibPath returns public path for unknown flavor
 */
export class getStudioLibPath_unknown_returnsPublicPath_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('getStudioLibPath_unknown');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        assertEqual(getStudioLibPath('Unset'), STUDIOLIB_PUBLIC, 'Should return public path for Unset');
        assertEqual(getStudioLibPath(''), STUDIOLIB_PUBLIC, 'Should return public path for empty string');
        assertEqual(getStudioLibPath('SomethingElse'), STUDIOLIB_PUBLIC, 'Should return public path for unknown');
        console.log('[getStudioLibPath_unknown] PASSED');
    }
}

// ============================================================================
// processTemplate Tests
// ============================================================================

/**
 * Test: processTemplate replaces version placeholder
 */
export class processTemplate_version_replacesPlaceholder_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('processTemplate_version');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const template = `# Lens Studio ${VERSION_PLACEHOLDER}\n\nContent here.`;
        const result = processTemplate(template, '5.17.0.12345', FLAVOR_PUBLIC);

        assert(result.includes('5.17.0.12345'), 'Should contain version');
        assert(!result.includes(VERSION_PLACEHOLDER), 'Should not contain placeholder');
        console.log('[processTemplate_version] PASSED');
    }
}

/**
 * Test: processTemplate replaces StudioLib placeholder with public path
 */
export class processTemplate_publicFlavor_replacesWithPublicPath_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('processTemplate_publicFlavor');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const template = `API Reference: ${STUDIOLIB_PLACEHOLDER}`;
        const result = processTemplate(template, '5.17.0', FLAVOR_PUBLIC);

        assert(result.includes(STUDIOLIB_PUBLIC), 'Should contain public StudioLib path');
        assert(!result.includes(STUDIOLIB_PLACEHOLDER), 'Should not contain placeholder');
        console.log('[processTemplate_publicFlavor] PASSED');
    }
}

/**
 * Test: processTemplate replaces StudioLib placeholder with internal path
 */
export class processTemplate_internalFlavor_replacesWithInternalPath_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('processTemplate_internalFlavor');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const template = `API Reference: ${STUDIOLIB_PLACEHOLDER}`;
        const result = processTemplate(template, '5.17.0', FLAVOR_INTERNAL);

        assert(result.includes(STUDIOLIB_INTERNAL), 'Should contain internal StudioLib path');
        assert(!result.includes(STUDIOLIB_PLACEHOLDER), 'Should not contain placeholder');
        console.log('[processTemplate_internalFlavor] PASSED');
    }
}

/**
 * Test: processTemplate handles full template correctly
 */
export class processTemplate_fullTemplate_replacesAllPlaceholders_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('processTemplate_fullTemplate');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const template = `# Lens Studio ${VERSION_PLACEHOLDER} Project Reference

- [API Reference](Support/${STUDIOLIB_PLACEHOLDER}): Complete TypeScript definitions.`;

        const result = processTemplate(template, '5.17.0.99999', FLAVOR_INTERNAL);

        assert(result.includes('# Lens Studio 5.17.0.99999 Project Reference'), 'Should have version in title');
        assert(result.includes(`Support/${STUDIOLIB_INTERNAL}`), 'Should have internal StudioLib path');
        assert(!result.includes(VERSION_PLACEHOLDER), 'Should not contain version placeholder');
        assert(!result.includes(STUDIOLIB_PLACEHOLDER), 'Should not contain StudioLib placeholder');
        console.log('[processTemplate_fullTemplate] PASSED');
    }
}

// ============================================================================
// buildPlatformLine Tests
// ============================================================================

/**
 * Test: buildPlatformLine returns empty string for no platforms
 */
export class buildPlatformLine_noPlatforms_returnsEmpty_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPlatformLine_noPlatforms');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const result = buildPlatformLine([]);
        assertEqual(result, '', 'Should return empty string for no platforms');
        console.log('[buildPlatformLine_noPlatforms] PASSED');
    }
}

/**
 * Test: buildPlatformLine with single platform includes preference sentence
 */
export class buildPlatformLine_singlePlatform_includesPreferenceSentence_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPlatformLine_singlePlatform');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const result = buildPlatformLine(['Spectacles']);
        assert(result.includes('**Spectacles**'), 'Should bold the platform name');
        assert(result.includes('This lens runs on **Spectacles**'), 'Should include runs-on sentence');
        assert(result.includes('prefer **Spectacles**'), 'Should include preference sentence for single platform');
        assert(result.endsWith('\n\n'), 'Should end with two newlines for template spacing');
        console.log('[buildPlatformLine_singlePlatform] PASSED');
    }
}

/**
 * Test: buildPlatformLine with multiple platforms omits preference sentence
 */
export class buildPlatformLine_multiplePlatforms_omitsPreferenceSentence_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('buildPlatformLine_multiplePlatforms');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const result = buildPlatformLine(['Mobile', 'Spectacles']);
        assert(result.includes('**Mobile**'), 'Should bold Mobile');
        assert(result.includes('**Spectacles**'), 'Should bold Spectacles');
        assert(result.includes('This lens runs on **Mobile** and **Spectacles**'), 'Should list all platforms with and');
        assert(!result.includes('prefer'), 'Should not include preference sentence for multiple platforms');
        assert(result.endsWith('\n\n'), 'Should end with two newlines for template spacing');
        console.log('[buildPlatformLine_multiplePlatforms] PASSED');
    }
}

/**
 * Test: processTemplate with platform replaces PLATFORM_LINE_PLACEHOLDER
 */
export class processTemplate_withPlatform_replacesPlatformPlaceholder_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('processTemplate_withPlatform');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const template = `# Lens Studio ${VERSION_PLACEHOLDER}\n\n${PLATFORM_LINE_PLACEHOLDER}This project uses Lens Studio.`;
        const result = processTemplate(template, '5.17.0', FLAVOR_PUBLIC, ['Spectacles']);

        assert(result.includes('This lens runs on **Spectacles**'), 'Should include platform line');
        assert(result.includes('prefer **Spectacles**'), 'Should include preference sentence');
        assert(!result.includes(PLATFORM_LINE_PLACEHOLDER), 'Should not contain placeholder');
        console.log('[processTemplate_withPlatform] PASSED');
    }
}

/**
 * Test: processTemplate without platforms removes PLATFORM_LINE_PLACEHOLDER
 */
export class processTemplate_withoutPlatforms_removesPlatformPlaceholder_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('processTemplate_withoutPlatforms');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const template = `# Lens Studio ${VERSION_PLACEHOLDER}\n\n${PLATFORM_LINE_PLACEHOLDER}This project uses Lens Studio.`;
        const result = processTemplate(template, '5.17.0', FLAVOR_PUBLIC, []);

        assert(!result.includes(PLATFORM_LINE_PLACEHOLDER), 'Should not contain placeholder');
        assert(!result.includes('This lens runs on'), 'Should not include platform line when no platforms');
        assert(result.includes('This project uses Lens Studio'), 'Content after placeholder should be preserved');
        console.log('[processTemplate_withoutPlatforms] PASSED');
    }
}

// ============================================================================
// parseFlavorFromProjectFile Tests
// ============================================================================

/**
 * Test: parseFlavorFromProjectFile extracts Public flavor
 */
export class parseFlavorFromProjectFile_public_returnsPublic_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('parseFlavorFromProjectFile_public');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const projectContent = `name: MyProject
studioVersion:
  major: 5
  minor: 17
  patch: 0
  build: 12345
  type: Public
scenes:
  - main.scene`;

        const result = parseFlavorFromProjectFile(projectContent);
        assertEqual(result!, FLAVOR_PUBLIC, 'Should extract Public flavor');
        console.log('[parseFlavorFromProjectFile_public] PASSED');
    }
}

/**
 * Test: parseFlavorFromProjectFile extracts Internal flavor
 */
export class parseFlavorFromProjectFile_internal_returnsInternal_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('parseFlavorFromProjectFile_internal');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const projectContent = `name: MyProject
studioVersion:
  major: 5
  minor: 17
  patch: 0
  build: 12345
  type: Internal
  buildFlavor: daily
  timestamp: 1234567890
  commit: abc123def`;

        const result = parseFlavorFromProjectFile(projectContent);
        assertEqual(result!, FLAVOR_INTERNAL, 'Should extract Internal flavor');
        console.log('[parseFlavorFromProjectFile_internal] PASSED');
    }
}

/**
 * Test: parseFlavorFromProjectFile returns null when studioVersion block missing
 */
export class parseFlavorFromProjectFile_missingBlock_returnsNull_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('parseFlavorFromProjectFile_missingBlock');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const projectContent = `name: MyProject
scenes:
  - main.scene`;

        const result = parseFlavorFromProjectFile(projectContent);
        assert(result === null, 'Should return null when studioVersion block is missing');
        console.log('[parseFlavorFromProjectFile_missingBlock] PASSED');
    }
}

/**
 * Test: parseFlavorFromProjectFile returns null when type field missing
 */
export class parseFlavorFromProjectFile_missingType_returnsNull_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('parseFlavorFromProjectFile_missingType');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const projectContent = `name: MyProject
studioVersion:
  major: 5
  minor: 17
  patch: 0
scenes:
  - main.scene`;

        const result = parseFlavorFromProjectFile(projectContent);
        assert(result === null, 'Should return null when type field is missing');
        console.log('[parseFlavorFromProjectFile_missingType] PASSED');
    }
}

/**
 * Test: parseFlavorFromProjectFile handles Unset type
 */
export class parseFlavorFromProjectFile_unset_returnsUnset_verifier extends PluginVerifier {
    static descriptor(): Descriptor {
        return createDescriptor('parseFlavorFromProjectFile_unset');
    }

    override async verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void> {
        const projectContent = `name: MyProject
studioVersion:
  major: 5
  minor: 17
  patch: 0
  type: Unset`;

        const result = parseFlavorFromProjectFile(projectContent);
        assertEqual(result!, 'Unset', 'Should extract Unset flavor');
        console.log('[parseFlavorFromProjectFile_unset] PASSED');
    }
}
