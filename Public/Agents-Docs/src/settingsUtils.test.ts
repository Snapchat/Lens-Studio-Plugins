import { PluginVerifier, Descriptor } from 'LensStudio:PluginVerifier';
import {
    parseSettings,
    mergeMarketplace,
    serializeSettings,
    MARKETPLACE_NAME,
    MARKETPLACE_CONFIG,
    ClaudeSettings
} from "./settingsUtils.js";

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEqual(actual: any, expected: any, message: string): void {
    if (actual !== expected) throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
}

function createDescriptor(testName: string): Descriptor {
    const d = new Descriptor();
    d.id = `com.snap.AgentsDocs.SettingsUtils.${testName}.verifier`;
    d.name = `Settings Utils - ${testName}`;
    d.description = `Unit test: ${testName}`;
    d.dependencies = [];
    d.canVerify = (pluginDescriptor: IPluginDescriptor): boolean => {
        return pluginDescriptor.id === 'com.snap.AgentsDocs.Service';
    };
    return d;
}

// ============================================================================
// parseSettings
// ============================================================================

export class parseSettings_valid_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('parseSettings_valid'); }
    override async verify(): Promise<void> {
        const result = parseSettings('{"someKey": "someValue"}');
        assertEqual(result.someKey, "someValue", "Parses valid JSON");

        const withMarketplaces = parseSettings('{"extraKnownMarketplaces": {"other": {"source": {"source": "github", "repo": "other/repo"}}}}');
        assert(withMarketplaces.extraKnownMarketplaces !== undefined, "Preserves extraKnownMarketplaces");
        assert((withMarketplaces.extraKnownMarketplaces as any).other !== undefined, "Preserves existing marketplace");
    }
}

export class parseSettings_invalid_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('parseSettings_invalid'); }
    override async verify(): Promise<void> {
        const fromNull = parseSettings(null);
        assertEqual(Object.keys(fromNull).length, 0, "Null returns empty object");

        const fromEmpty = parseSettings("");
        assertEqual(Object.keys(fromEmpty).length, 0, "Empty string returns empty object");

        const fromInvalid = parseSettings("{ not valid json }");
        assertEqual(Object.keys(fromInvalid).length, 0, "Invalid JSON returns empty object");
    }
}

// ============================================================================
// mergeMarketplace
// ============================================================================

export class mergeMarketplace_empty_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('mergeMarketplace_empty'); }
    override async verify(): Promise<void> {
        const result = mergeMarketplace({});
        assert(result.extraKnownMarketplaces !== undefined, "Creates extraKnownMarketplaces");
        assert(result.extraKnownMarketplaces![MARKETPLACE_NAME] !== undefined, "Adds marketplace entry");

        const entry = result.extraKnownMarketplaces![MARKETPLACE_NAME] as any;
        assertEqual(entry.source.source, "github", "Source type is github");
        assertEqual(entry.source.repo, "Snapchat/Lens-Studio-Plugins", "Repo is correct");
    }
}

export class mergeMarketplace_preservesExisting_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('mergeMarketplace_preservesExisting'); }
    override async verify(): Promise<void> {
        const existing: ClaudeSettings = {
            someUserSetting: true,
            extraKnownMarketplaces: {
                "other-marketplace": { source: { source: "github", repo: "other/repo" } }
            }
        };
        const result = mergeMarketplace(existing);

        // Preserves user settings
        assertEqual(result.someUserSetting, true, "Preserves top-level user settings");

        // Preserves other marketplaces
        assert(result.extraKnownMarketplaces!["other-marketplace"] !== undefined, "Preserves other marketplace");

        // Adds ours
        assert(result.extraKnownMarketplaces![MARKETPLACE_NAME] !== undefined, "Adds our marketplace");

        // Two marketplaces total
        assertEqual(Object.keys(result.extraKnownMarketplaces!).length, 2, "Two marketplaces total");
    }
}

export class mergeMarketplace_overwritesStale_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('mergeMarketplace_overwritesStale'); }
    override async verify(): Promise<void> {
        // If our marketplace key already exists with old config, it gets overwritten
        const existing: ClaudeSettings = {
            extraKnownMarketplaces: {
                [MARKETPLACE_NAME]: { source: { source: "github", repo: "OldOrg/OldRepo" } }
            }
        };
        const result = mergeMarketplace(existing);

        const entry = result.extraKnownMarketplaces![MARKETPLACE_NAME] as any;
        assertEqual(entry.source.repo, "Snapchat/Lens-Studio-Plugins", "Overwrites stale repo");
    }
}

// ============================================================================
// Round-trip
// ============================================================================

export class settingsRoundTrip_verifier extends PluginVerifier {
    static descriptor(): Descriptor { return createDescriptor('settingsRoundTrip'); }
    override async verify(): Promise<void> {
        const original: ClaudeSettings = {
            someKey: "value",
            extraKnownMarketplaces: {
                "other": { source: { source: "git", url: "https://example.com" } }
            }
        };
        const merged = mergeMarketplace(original);
        const serialized = serializeSettings(merged);
        const parsed = parseSettings(serialized);

        assertEqual(parsed.someKey, "value", "Round-trip preserves user settings");
        assert(parsed.extraKnownMarketplaces!["other"] !== undefined, "Round-trip preserves other marketplace");
        assert(parsed.extraKnownMarketplaces![MARKETPLACE_NAME] !== undefined, "Round-trip preserves our marketplace");
        assert(serialized.includes('  "extraKnownMarketplaces"'), "Uses 2-space indent");
    }
}
