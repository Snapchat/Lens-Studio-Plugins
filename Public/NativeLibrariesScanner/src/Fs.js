export class Fs {
    constructor(impl) {
        this.impl = impl;
    }

    isDirectory(path) {
        if (!(path instanceof Editor.Path))
            throw new TypeError('path must be an Editor.Path');

        return this.impl.isDirectory(path);
    }

    readDir(path, options) {
        if (!(path instanceof Editor.Path))
            throw new TypeError('path must be an Editor.Path');

        return this.impl.readDir(path, options);
    }

    exists(path) {
        if (!(path instanceof Editor.Path))
            throw new TypeError('path must be an Editor.Path');

        return this.impl.exists(path);
    }

    readFile(path) {
        if (!(path instanceof Editor.Path))
            throw new TypeError('path must be an Editor.Path');

        return this.impl.readFile(path);
    }

    writeFile(path, content) {
        if (!(path instanceof Editor.Path))
            throw new TypeError('path must be an Editor.Path');

        return this.impl.writeFile(path, content);
    }

    getCachedFile(cacheKey) {
        if (typeof cacheKey !== 'string')
            throw new TypeError('cacheKey must be a string');

        return this.impl.getCachedFile(cacheKey);
    }
}
