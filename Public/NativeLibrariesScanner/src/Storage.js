import { Fs } from './Fs.js';

export class PersistenceStorage {
    constructor(fs, cacheFilePath) {
        if (!(fs instanceof Fs))
            throw new TypeError('fs must be an Fs instance');

        if (!(cacheFilePath instanceof Editor.Path))
            throw new TypeError('cacheFilePath must be an Editor.Path');

        this.fs = fs;
        this.cacheFilePath = cacheFilePath;
    }

    readConfig() {
        if (!this.fs.exists(this.cacheFilePath)) {
            return { paths: [] };
        }

        const content = this.fs.readFile(this.cacheFilePath);
        try {
            return JSON.parse(content);
        } catch (e) {
            throw new Error(`Failed to parse config: ${e.message}`);
        }
    }

    writeConfig(config) {
        const content = JSON.stringify(config);
        this.fs.writeFile(this.cacheFilePath, content);
    }
}

export class InMemoryStorage {
    constructor() {
        this.storage = new Map();
    }

    readConfig() {
        const config = this.storage.get('config');
        if (!config) {
            return { paths: [] };
        }
        return config;
    }

    writeConfig(config) {
        this.storage.set('config', config);
    }
}
