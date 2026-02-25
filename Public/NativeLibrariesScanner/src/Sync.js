import { Fs } from './Fs.js';
import { Console } from './Console.js';
import { AssetManager } from './AssetManager.js';

export class Sync {
    constructor(fs, console, assetManager, supportedExtension = 'so') {
        if (!(fs instanceof Fs))
            throw new TypeError('Fs required');

        if (!(console instanceof Console))
            throw new TypeError('Console required');

        if (!(assetManager instanceof AssetManager))
            throw new TypeError('AssetManager required');

        this.fs = fs;
        this.console = console;
        this.assetManager = assetManager;
        this.supportedExtension = supportedExtension;
    }

    sync(rootDirectoryPath, relativeToAssetsSourcePath) {
        if (!(rootDirectoryPath instanceof Editor.Path))
            throw new TypeError('Editor.Path is required');

        if (!(relativeToAssetsSourcePath instanceof Editor.Model.SourcePath))
            throw new TypeError('Editor.Model.SourcePath is required');

        if (!this.fs.isDirectory(rootDirectoryPath))
            throw new Error(`Library scan failed: "${rootDirectoryPath.toString()}" is not a directory.`);

        const paths = this.fs.readDir(rootDirectoryPath, { recursive: false });
        const fileNameToLib = new Map();
        for (const path of paths) {
            if (!(path instanceof Editor.Path))
                throw new TypeError('Editor.Path is required');

            if (!path.hasExtension(this.supportedExtension))
                continue;

            const absolutePathToImport = rootDirectoryPath.appended(path);
            if (!(absolutePathToImport instanceof Editor.Path))
                throw new TypeError('absolutePathToImport must be an Editor.Path');

            const existingLibFileMeta = this.assetManager.findImportedCopy(absolutePathToImport, relativeToAssetsSourcePath);
            if (existingLibFileMeta !== null)
            {
                const existingLib = existingLibFileMeta.primaryAsset;
                fileNameToLib.set(existingLibFileMeta.sourcePath.fileName.toString(), existingLib);
            }
            else
            {
                const result = this.assetManager.importExternalFile(absolutePathToImport, relativeToAssetsSourcePath);
                fileNameToLib.set(path.toString(), result.primary);
            }
        }

        let missingDependenciesMessage = 'Missing dependencies:\n';
        for (const [_, lib] of fileNameToLib) {
            const info = lib.info;
            const requiredNames = info.dependentLibraryNames;
            const dependencies = [];

            for (const dependency of info.dependentLibraries)
            {
                if (dependency === null)
                    continue;

                dependencies.push(dependency);
            }

            for (const name of requiredNames) {
                const dependency = fileNameToLib.get(name);
                if (dependency === undefined)
                {
                    missingDependenciesMessage += ` - ${name}\n`;
                    continue;
                }

                if (!dependency.fileMeta || !dependency.fileMeta.sourcePath)
                    continue;

                const fileName = dependency.fileMeta.sourcePath.fileName.toString();
                if (name === fileName)
                {
                    const found = dependencies.find((dep) => { return dependency.isSame(dep); });
                    if (found === undefined)
                    {
                        dependencies.push(dependency);
                    }
                }
            }
            info.dependentLibraries = dependencies;
        }
        this.console.warn(missingDependenciesMessage);
    }
}
