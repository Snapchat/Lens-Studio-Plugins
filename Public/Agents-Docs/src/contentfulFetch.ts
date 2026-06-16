import * as AssetLibrary from "LensStudio:AssetLibrary";
import * as Network from "LensStudio:Network";
import * as App from "LensStudio:App";
import * as FileSystem from "LensStudio:FileSystem";

export interface ContentfulFetchOptions {
    entryId: string;
    space: AssetLibrary.Space;
    environment?: AssetLibrary.Environment;
}

/**
 * Fetch a Contentful entry's resource as a string.
 *
 * - Picks the resource whose version best matches `App.version` (highest
 *   resource version <= LS version; lowest if all are newer; first one if
 *   no resource has a parseable `vMAJOR.MINOR[.PATCH]` tag).
 * - Auto-unzips the response body if it's a zip archive.
 *
 * Throws on any failure. Requires `asset_library` and `network` permissions.
 */
export async function fetchContentfulEntry(
    pluginSystem: Editor.PluginSystem,
    options: ContentfulFetchOptions
): Promise<string> {
    const envSettings = new AssetLibrary.EnvironmentSetting();
    envSettings.environment = options.environment ?? AssetLibrary.Environment.Production;
    envSettings.space = options.space;

    const provider = pluginSystem.findInterface(
        AssetLibrary.IAssetLibraryProvider
    ) as AssetLibrary.IAssetLibraryProvider;
    const request = new AssetLibrary.GetAssetsByIdsRequest(envSettings, [options.entryId]);
    const response = await provider.assetsByIdsService.fetchAsync(request);

    if (!response.ok) {
        throw new Error("AssetLibrary fetch failed: " + (response.error?.description ?? "unknown error"));
    }

    const assets = response.data;
    if (!assets || assets.length === 0) {
        throw new Error("No asset found for entry ID: " + options.entryId);
    }

    const resources = assets[0].resources;
    if (!resources || resources.length === 0) {
        throw new Error("Asset has no downloadable resources");
    }

    return downloadString(pickResourceForVersion(resources, parseVersion(App.version)).uri);
}

function downloadString(uri: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const httpRequest = new Network.HttpRequest();
        httpRequest.method = Network.HttpRequest.Method.Get;
        httpRequest.url = uri;
        Network.performHttpRequest(httpRequest, (httpResponse: Network.HttpResponse) => {
            if (httpResponse.statusCode !== 200) {
                reject(new Error("Download failed with status " + httpResponse.statusCode));
                return;
            }
            try {
                const bytes = httpResponse.body.toBytes();
                resolve(isZip(bytes) ? unzipFirstFile(bytes) : httpResponse.body.toString());
            } catch (e) {
                reject(e);
            }
        });
    });
}

function isZip(bytes: Uint8Array): boolean {
    // Local file header signature: PK\x03\x04. A 2-byte check would
    // misidentify text files that happen to start with "PK".
    return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;
}

function unzipFirstFile(bytes: Uint8Array): string {
    // TempDir is GC-cleaned the moment the last reference disappears, so keep it in scope.
    const tempDir = FileSystem.TempDir.create();
    const archivePath = tempDir.path.appended(new Editor.Path("download.zip"));
    const extractDir = tempDir.path.appended(new Editor.Path("extracted"));
    FileSystem.writeFile(archivePath, bytes);
    Editor.Compression.Zip.unpack(archivePath, extractDir);

    for (const relative of FileSystem.readDir(extractDir, { recursive: true } as unknown as FileSystem.ReadDirOptions)) {
        const fullPath = extractDir.appended(relative);
        if (FileSystem.isFile(fullPath)) {
            return FileSystem.readFile(fullPath);
        }
    }
    throw new Error("Zip archive contained no readable files");
}

export interface VersionTriple { major: number; minor: number; patch: number; }

const VERSION_PATTERN = /(^|[^A-Za-z0-9])v?(\d+)\.(\d+)(?:\.(\d+))?(?:\.\d+)?(?=$|[^A-Za-z0-9])/i;

/**
 * Parse Lens Studio/resource version strings.
 *
 * Asset Library resource names have historically used both `5.22` and
 * `5.22.0`; Lens Studio builds can look like `5.22.0.123`. For doc
 * selection, normalize all of those to a major/minor/patch triple and ignore
 * any fourth build component.
 */
export function parseVersion(version: string | null | undefined): VersionTriple | null {
    if (!version) {
        return null;
    }

    const m = version.match(VERSION_PATTERN);
    return m ? { major: +m[2], minor: +m[3], patch: m[4] === undefined ? 0 : +m[4] } : null;
}

function compareVersions(a: VersionTriple, b: VersionTriple): number {
    return (a.major - b.major) || (a.minor - b.minor) || (a.patch - b.patch);
}

function getResourceVersion(r: AssetLibrary.Resource): VersionTriple | null {
    return parseVersion(r.name) ?? parseVersion(r.uri);
}

function describeResource(resource: AssetLibrary.Resource, index: number): string {
    const label = resource.name || resource.uri || "<unnamed>";
    return `#${index + 1} "${label}"`;
}

/** Highest version `<= target`; lowest if all newer; first if no versions parseable or target is unknown. */
export function pickResourceForVersion(
    resources: AssetLibrary.Resource[],
    target: VersionTriple | null
): AssetLibrary.Resource {
    const parsedResources = resources
        .map((res, index) => ({ res, index, v: getResourceVersion(res) }));
    const versioned = parsedResources
        .filter((x): x is { res: AssetLibrary.Resource; index: number; v: VersionTriple } => x.v !== null)
        .sort((a, b) => compareVersions(a.v, b.v));

    const unversioned = parsedResources.filter(x => x.v === null);
    if (unversioned.length > 0) {
        console.log(
            `[AgentsDocs] Could not read version from ${unversioned.length}/${resources.length} Asset Library resource(s): ` +
            unversioned.map(x => describeResource(x.res, x.index)).join(", ")
        );
    }

    if (versioned.length === 0) {
        console.log("[AgentsDocs] No Asset Library resource versions could be read; using the first resource.");
        return resources[0];
    }

    if (target === null) {
        console.log("[AgentsDocs] Could not read Lens Studio version; using the first Asset Library resource.");
        return resources[0];
    }
    let best = versioned[0].res;
    for (const { res, v } of versioned) {
        if (compareVersions(v, target) <= 0) {
            best = res;
        } else {
            break;
        }
    }
    return best;
}
