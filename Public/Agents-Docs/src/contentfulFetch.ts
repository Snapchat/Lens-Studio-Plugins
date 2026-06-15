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
 *   no resource has a parseable `vMAJOR.MINOR.PATCH` tag).
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

interface VersionTriple { major: number; minor: number; patch: number; }

function parseVersion(version: string): VersionTriple {
    const m = version?.match(/v?(\d+)\.(\d+)\.(\d+)/);
    return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : { major: 0, minor: 0, patch: 0 };
}

function compareVersions(a: VersionTriple, b: VersionTriple): number {
    return (a.major - b.major) || (a.minor - b.minor) || (a.patch - b.patch);
}

function getResourceVersion(r: AssetLibrary.Resource): VersionTriple | null {
    const m = r.uri.match(/v(\d+)\.(\d+)\.(\d+)/) ?? r.name.match(/v?(\d+)\.(\d+)\.(\d+)/);
    return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null;
}

/** Highest version `<= target`; lowest if all newer; first if no versions parseable. */
function pickResourceForVersion(
    resources: AssetLibrary.Resource[],
    target: VersionTriple
): AssetLibrary.Resource {
    const versioned = resources
        .map(res => ({ res, v: getResourceVersion(res) }))
        .filter((x): x is { res: AssetLibrary.Resource; v: VersionTriple } => x.v !== null)
        .sort((a, b) => compareVersions(a.v, b.v));

    if (versioned.length === 0) {
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
