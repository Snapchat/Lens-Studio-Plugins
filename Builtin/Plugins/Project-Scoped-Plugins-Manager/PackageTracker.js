export class PackageTracker {
    constructor(options = {}) {
        // Track packages: Map<id, { id, name, sourcePath, absolutePath, isPacked, pluginId, descriptorId, internalFileIds, isUnpacking, isBeingUpdated, newEntityId }>
        this.trackedPackages = new Map();

        // Callback for lifecycle events (for testing/extensibility)
        this.onEvent = options.onEvent || ((event, data) => {
            console.log("[PackageTracker] " + event + ": " + data.name, console.None);
        });

        // Function to compute absolute path (injected for testing)
        this.getAbsolutePath = options.getAbsolutePath || ((sourcePath) => sourcePath);

        // Function to get project directory (injected)
        this.getProjectDir = options.getProjectDir || (() => "");

        // Functions to load/unload plugins (injected)
        this.loadPlugins = options.loadPlugins || ((pluginDir) => {
            console.log("[PackageTracker] Loading plugins from: " + pluginDir, console.None);
        });
        this.unloadPlugins = options.unloadPlugins || ((pluginDir) => {
            console.log("[PackageTracker] Unloading plugins from: " + pluginDir, console.None);
        });
    }

    handleEntityAdded(entityInfo) {
        const { id, sourcePath, extension, hasNativePackageDescriptor, pluginId, descriptorId } = entityInfo;
        const isLspkg = extension === "lspkg";
        if (!isLspkg && !hasNativePackageDescriptor) {
            return;
        }

        const idStr = id.toString();
        const isPacked = extension === "lspkg";
        const name = this.getFileNameBase(sourcePath);
        const absolutePath = this.getAbsolutePath(sourcePath);
        const pluginUuid = pluginId || idStr;

        // Check if this is an update (same pluginId already tracked)
        const existingByPluginId = this.findPackageByPluginId(pluginUuid);
        if (existingByPluginId) {
            existingByPluginId.pkg.isBeingUpdated = true;
            existingByPluginId.pkg.newEntityId = idStr;
        }

        this.onEvent("ADDED", { id: idStr, name, sourcePath, absolutePath, isPacked });

        // Only load plugins if this is not an update - handleDescriptorRemoved handles update case
        if (!existingByPluginId) {
            const pluginDir = this.getProjectDir() + "/Plugins/" + pluginUuid;
            this.loadPlugins(pluginDir);
        }

        this.trackedPackages.set(idStr, {
            id: idStr,
            name: name,
            sourcePath: sourcePath,
            absolutePath: absolutePath,
            isPacked: isPacked,
            pluginId: pluginUuid,
            descriptorId: descriptorId,
            internalFileIds: new Set()
        });
    }

    handleEntityRemoved(uuid) {
        const uuidStr = uuid.toString();
        const tracked = this.trackedPackages.get(uuidStr);

        if (tracked) {
            if (tracked.isBeingUpdated) {
                this.trackedPackages.delete(uuidStr);
                return;
            }
            if (tracked.isUnpacking) {
                this.onEvent("UNPACKED", { id: uuidStr, name: tracked.name });
                tracked.isPacked = false;
                tracked.isUnpacking = false;
            } else {
                const pluginDir = this.getProjectDir() + "/Plugins/" + tracked.pluginId;
                this.unloadPlugins(pluginDir);
                this.onEvent("DELETED", { id: uuidStr, name: tracked.name, wasPacked: tracked.isPacked });
                this.trackedPackages.delete(uuidStr);
            }
        } else {
            const packageInfo = this.findPackageByInternalFileId(uuidStr);
            if (packageInfo) {
                const { packageId, tracked } = packageInfo;
                tracked.internalFileIds.delete(uuidStr);

                if (tracked.internalFileIds.size === 0) {
                    const pluginDir = this.getProjectDir() + "/Plugins/" + tracked.pluginId;
                    this.unloadPlugins(pluginDir);
                    this.onEvent("DELETED", { id: packageId, name: tracked.name, wasPacked: false });
                    this.trackedPackages.delete(packageId);
                }
            }
        }
    }

    handleEntityUpdated(entityInfo) {
        const { id, sourcePath, extension, isPackedPackageItem, hasNativePackageDescriptor, pluginId, descriptorId } = entityInfo;
        const entityId = id.toString();

        const tracked = this.trackedPackages.get(entityId);
        if (tracked && tracked.isPacked) {
            const newName = this.getFileNameBase(sourcePath);
            if (tracked.name !== newName) {
                this.onEvent("RENAMED", { id: entityId, oldName: tracked.name, newName: newName });
                tracked.name = newName;
                tracked.sourcePath = sourcePath;
                tracked.absolutePath = this.getAbsolutePath(sourcePath);
            }
            // Package content may have changed (in-place update) - unload and reload plugin
            const pluginDir = this.getProjectDir() + "/Plugins/" + tracked.pluginId;
            this.unloadPlugins(pluginDir);
            this.loadPlugins(pluginDir);
            if (hasNativePackageDescriptor && descriptorId !== undefined) {
                tracked.descriptorId = descriptorId;
            }
            tracked.sourcePath = sourcePath;
            tracked.absolutePath = this.getAbsolutePath(sourcePath);
            return;
        }

        const packageInfo = this.findPackageByInternalFileId(entityId);
        if (packageInfo) {
            const { packageId, tracked } = packageInfo;
            const firstSlash = sourcePath.indexOf('/');
            if (firstSlash > 0) {
                let newName = sourcePath.substring(0, firstSlash);
                if (newName.endsWith('.lspkg')) {
                    newName = newName.slice(0, -6);
                }
                if (tracked.name !== newName) {
                    this.onEvent("RENAMED", { id: packageId, oldName: tracked.name, newName: newName });
                    tracked.name = newName;
                    tracked.sourcePath = sourcePath.substring(0, firstSlash);
                    tracked.absolutePath = this.getAbsolutePath(tracked.sourcePath);
                }
            }
            return;
        }

        for (const [pkgId, pkg] of this.trackedPackages) {
            if (pkg.isPacked && sourcePath.startsWith(pkg.name + '.lspkg/')) {
                const isUnpackedPath = !sourcePath.startsWith("../Cache/") &&
                                       isPackedPackageItem === false;

                if (isUnpackedPath) {
                    pkg.isUnpacking = true;
                    pkg.internalFileIds.add(entityId);
                    break;
                }
            }
        }
    }

    findPackageByInternalFileId(fileId) {
        for (const [packageId, tracked] of this.trackedPackages) {
            if (tracked.internalFileIds.has(fileId)) {
                return { packageId, tracked };
            }
        }
        return null;
    }

    findPackageByPluginId(pluginId) {
        for (const [id, pkg] of this.trackedPackages) {
            if (pkg.pluginId === pluginId) {
                return { id, pkg };
            }
        }
        return null;
    }

    findPackageByDescriptorId(descriptorId) {
        for (const [id, pkg] of this.trackedPackages) {
            if (pkg.descriptorId === descriptorId) {
                return { id, pkg };
            }
        }
        return null;
    }

    handleDescriptorRemoved(uuid) {
        const uuidStr = uuid.toString();
        const match = this.findPackageByDescriptorId(uuidStr);

        if (match) {
            const { id, pkg } = match;

            if (pkg.isBeingUpdated && pkg.newEntityId) {
                // Update: componentId is unchanged, so same plugin dir for unload and load
                const pluginDir = this.getProjectDir() + "/Plugins/" + pkg.pluginId;
                console.log("[PackageTracker] UPDATED - Unloading plugins from: " + pluginDir, console.None);
                this.unloadPlugins(pluginDir);
                console.log("[PackageTracker] UPDATED - Loading plugins from: " + pluginDir, console.None);
                this.loadPlugins(pluginDir);

                const newPkg = this.trackedPackages.get(pkg.newEntityId);
                if (newPkg) {
                    this.onEvent("UPDATED", {
                        id: pkg.newEntityId,
                        name: newPkg.name,
                        oldName: pkg.name,
                        pluginId: pkg.pluginId
                    });
                }
                this.trackedPackages.delete(id);
            }
        }
    }

    getFileNameBase(sourcePath) {
        const pathStr = sourcePath.toString();
        const lastSlash = pathStr.lastIndexOf('/');
        const fileName = lastSlash >= 0 ? pathStr.substring(lastSlash + 1) : pathStr;
        const lastDot = fileName.lastIndexOf('.');
        return lastDot >= 0 ? fileName.substring(0, lastDot) : fileName;
    }

    getTrackedPackages() {
        return new Map(this.trackedPackages);
    }

    getPackageById(id) {
        return this.trackedPackages.get(id.toString());
    }

    clear() {
        if (this.trackedPackages.size > 0) {
            const names = Array.from(this.trackedPackages.values()).map(pkg => pkg.name);
            console.log("[PackageTracker] Removing plugins: " + names.join(", "), console.None);

            for (const [id, pkg] of this.trackedPackages) {
                const pluginDir = this.getProjectDir() + "/Plugins/" + pkg.pluginId;
                this.unloadPlugins(pluginDir);
            }
        }
        this.trackedPackages.clear();
    }
}
