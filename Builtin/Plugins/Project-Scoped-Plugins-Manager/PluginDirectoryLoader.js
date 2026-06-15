// TODO: Replace error-message matching with PluginSystem error codes once loadDirectory/unloadDirectory expose them.
const alreadyLoadedErrorMessage = "has already been loaded";
const loadingUnloadErrorMessage = "Cannot remove user directories when loading";
const unloadingDirectoryErrorMessage = "The directory is unloading";
const maxUnloadRetries = 50;

function errorMessage(error) {
    if (error && error.message) {
        return error.message.toString();
    }
    return error ? error.toString() : "";
}

function isAlreadyLoaded(error) {
    return errorMessage(error).includes(alreadyLoadedErrorMessage);
}

function isLoadingUnload(error) {
    return errorMessage(error) === loadingUnloadErrorMessage;
}

function isUnloadingDirectory(error) {
    return errorMessage(error) === unloadingDirectoryErrorMessage;
}

export class PluginDirectoryLoader {
    constructor(pluginSystem) {
        this.pluginSystem = pluginSystem;
        this.pendingUnloads = new Map();
        this.retryTimer = null;
    }

    load(directory) {
        try {
            this.pluginSystem.loadDirectory(directory);
        } catch (error) {
            if (!isAlreadyLoaded(error)) {
                throw error;
            }
        }

        this.pendingUnloads.delete(directory.toString());
        if (this.pendingUnloads.size === 0 && this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
    }

    unload(directory, retryWhileLoading = true) {
        const result = this.tryUnload(directory);
        if (result === "loading" && retryWhileLoading) {
            this.queueUnload(directory, 0);
        }
    }

    dispose() {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
        this.pendingUnloads.clear();
    }

    tryUnload(directory) {
        try {
            this.pluginSystem.unloadDirectory(directory);
            return "done";
        } catch (error) {
            if (isLoadingUnload(error)) {
                return "loading";
            }
            if (isUnloadingDirectory(error)) {
                return "done";
            }
            throw error;
        }
    }

    queueUnload(directory, attempts) {
        this.pendingUnloads.set(directory.toString(), {
            directory: directory,
            attempts: attempts
        });

        if (!this.retryTimer) {
            this.retryTimer = setTimeout(() => this.flushPendingUnloads(), 0);
        }
    }

    flushPendingUnloads() {
        this.retryTimer = null;
        const entries = Array.from(this.pendingUnloads.entries());
        this.pendingUnloads.clear();

        let firstError = null;
        for (const [key, entry] of entries) {
            try {
                const result = this.tryUnload(entry.directory);
                if (result === "loading") {
                    if (entry.attempts >= maxUnloadRetries) {
                        throw new Error(loadingUnloadErrorMessage);
                    }
                    this.pendingUnloads.set(key, {
                        directory: entry.directory,
                        attempts: entry.attempts + 1
                    });
                }
            } catch (error) {
                firstError = firstError || error;
            }
        }

        if (this.pendingUnloads.size > 0) {
            this.retryTimer = setTimeout(() => this.flushPendingUnloads(), 0);
        }

        if (firstError) {
            throw firstError;
        }
    }
}
