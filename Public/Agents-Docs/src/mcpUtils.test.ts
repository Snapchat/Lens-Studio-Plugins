import { PluginVerifier, Descriptor } from 'LensStudio:PluginVerifier';
import {
    extractProjectName,
    buildServerName,
    extractServerConfig,
    mergeMcpJson,
    serializeMcpJson,
    McpServerConfig,
    McpJsonContent
} from "./mcpUtils.js";

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEqual(actual: any, expected: any, message: string): void {
    if (actual !== expected) throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
}

function createDescriptor(testName: string): Descriptor {
    const d = new Descriptor();
    d.id = `com.snap.AgentsDocs.McpUtils.${testName}.verifier`;
    d.name = `MCP Utils - ${testName}`;
    d.description = `Unit test: ${testName}`;
    d.dependencies = [];
    d.canVerify = (pluginDescriptor: IPluginDescriptor): boolean => {
        return pluginDescriptor.id === 'com.snap.AgentsDocs.Service';
    };
    return d;
}

// ============================================================================
// extractProjectName
// ============================================================================

export class extractProjectName_validPaths_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('extractProjectName_validPaths'); }
    override async verify(): Promise<void> {
        assertEqual(extractProjectName(new Editor.Path("/Users/name/MyProject.lsproj")), "MyProject", "Unix .lsproj");
        assertEqual(extractProjectName(new Editor.Path("C:\\Users\\Name\\TestProject.lsproj")), "TestProject", "Windows .lsproj");
        assertEqual(extractProjectName(new Editor.Path("/path/to/My Cool Project.lsproj")), "My Cool Project", "Spaces in name");
        assertEqual(extractProjectName(new Editor.Path("/path/to/MyProject.esproj")), "MyProject", ".esproj extension");
        assertEqual(extractProjectName(new Editor.Path("SimpleProject.lsproj")), "SimpleProject", "Filename only (no directory)");
    }
}

export class extractProjectName_invalidPaths_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('extractProjectName_invalidPaths'); }
    override async verify(): Promise<void> {
        assertEqual(extractProjectName(new Editor.Path("/path/to/Project.txt")), null, "Wrong extension");
        assertEqual(extractProjectName(new Editor.Path("/path/to/.lsproj")), null, "Empty filename");
    }
}

// ============================================================================
// buildServerName
// ============================================================================

export class buildServerName_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('buildServerName'); }
    override async verify(): Promise<void> {
        assertEqual(buildServerName("MyProject"), "lens-studio-MyProject", "Standard");
        assertEqual(buildServerName("My Cool Project"), "lens-studio-My Cool Project", "With spaces");
    }
}

// ============================================================================
// extractServerConfig
// ============================================================================

export class extractServerConfig_valid_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('extractServerConfig_valid'); }
    override async verify(): Promise<void> {
        const full = extractServerConfig({
            mcpServers: { "lens-studio": { type: "http", url: "http://localhost:50049/mcp", headers: { Authorization: "Bearer abc" } } }
        });
        assert(full !== null, "Should extract full config");
        assertEqual(full!.url, "http://localhost:50049/mcp", "URL");
        assertEqual(full!.headers.Authorization, "Bearer abc", "Authorization");

        const noHeaders = extractServerConfig({
            mcpServers: { "lens-studio": { type: "http", url: "http://localhost:50049/mcp" } }
        });
        assert(noHeaders !== null, "Should extract even without headers");
        assertEqual(noHeaders!.headers.Authorization, "", "Defaults to empty auth");
    }
}

export class extractServerConfig_invalid_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('extractServerConfig_invalid'); }
    override async verify(): Promise<void> {
        assertEqual(extractServerConfig({ mcpServers: { "lens-studio": { type: "http" } } }), null, "Missing URL");
        assertEqual(extractServerConfig({ something: "unexpected" }), null, "Unrecognized structure");
        assertEqual(extractServerConfig(null), null, "Null");
        assertEqual(extractServerConfig(undefined), null, "Undefined");
    }
}

// ============================================================================
// mergeMcpJson
// ============================================================================

export class mergeMcpJson_freshContent_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('mergeMcpJson_freshContent'); }
    override async verify(): Promise<void> {
        const config: McpServerConfig = { type: "http", url: "http://localhost:50049/mcp", headers: { Authorization: "Bearer token" } };

        const fromNull = mergeMcpJson(null, "lens-studio-MyProject", config);
        assertEqual(Object.keys(fromNull.mcpServers).length, 1, "One server from null");
        assertEqual(fromNull.mcpServers["lens-studio-MyProject"].url, config.url, "URL matches");

        const fromInvalid = mergeMcpJson("{ invalid json }", "lens-studio-MyProject", config);
        assertEqual(Object.keys(fromInvalid.mcpServers).length, 1, "Fresh start on invalid JSON");
    }
}

export class mergeMcpJson_existingContent_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('mergeMcpJson_existingContent'); }
    override async verify(): Promise<void> {
        const config: McpServerConfig = { type: "http", url: "http://localhost:50049/mcp", headers: { Authorization: "Bearer new" } };

        // Preserves non-lens-studio servers, removes old lens-studio-* entries
        const existing = JSON.stringify({
            mcpServers: {
                "other-server": { type: "http", url: "http://localhost:8080/mcp", headers: { Authorization: "Bearer other" } },
                "lens-other-server": { type: "http", url: "http://localhost:9090/mcp", headers: { Authorization: "Bearer lens-other" } },
                "lens-studio-OldProject": { type: "http", url: "http://localhost:50049/mcp", headers: { Authorization: "Bearer old" } }
            }
        });
        const result = mergeMcpJson(existing, "lens-studio-NewProject", config);

        assertEqual(Object.keys(result.mcpServers).length, 3, "other + lens-other + new (old removed)");
        assert(result.mcpServers["other-server"] !== undefined, "Preserved other-server");
        assert(result.mcpServers["lens-other-server"] !== undefined, "Preserved lens-other (not lens-studio-)");
        assert(result.mcpServers["lens-studio-OldProject"] === undefined, "Removed old lens-studio entry");
        assert(result.mcpServers["lens-studio-NewProject"] !== undefined, "Added new entry");
    }
}

// ============================================================================
// Round-trip
// ============================================================================

export class roundTrip_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('roundTrip'); }
    override async verify(): Promise<void> {
        // Serialize → parse round-trip
        const content: McpJsonContent = {
            mcpServers: { "lens-studio-MyProject": { type: "http", url: "http://localhost:50049/mcp", headers: { Authorization: "Bearer token" } } }
        };
        const serialized = serializeMcpJson(content);
        assert(serialized.includes('  "mcpServers"'), "2-space indent");
        const parsed = JSON.parse(serialized);
        assertEqual(parsed.mcpServers["lens-studio-MyProject"].url, content.mcpServers["lens-studio-MyProject"].url, "Round-trip preserves URL");

        // Multiple renames: only latest project survives
        let current: string | null = null;
        for (const name of ["Project1", "Project2", "Project3"]) {
            const config: McpServerConfig = { type: "http", url: "http://localhost:50049/mcp", headers: { Authorization: `Bearer token-${name}` } };
            current = serializeMcpJson(mergeMcpJson(current, buildServerName(name), config));
        }
        const final = JSON.parse(current!);
        assertEqual(Object.keys(final.mcpServers).length, 1, "Only latest project after renames");
        assert(final.mcpServers["lens-studio-Project3"] !== undefined, "Latest project present");
    }
}
