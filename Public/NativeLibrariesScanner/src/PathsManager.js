export class PathsManager {
    constructor() {
        this.paths = [];
    }

    add(fromPath, toPath) {
        if (!(fromPath instanceof Editor.Path))
            throw new TypeError('fromPath must be an Editor.Path');

        if (!(toPath instanceof Editor.Path))
            throw new TypeError('toPath must be an Editor.Path');

        this.paths.push({ from: fromPath, to: toPath });
    }

    findIndex(path) {
        if (!(path instanceof Editor.Path))
            throw new TypeError('path must be an Editor.Path');

        return this.paths.findIndex(item => Editor.Path.equals(item.from, path));
    }

    get(index) {
        return this.paths[index];
    }

    updateDestination(fromPath, newToPath) {
        if (!(fromPath instanceof Editor.Path))
            throw new TypeError('fromPath must be an Editor.Path');

        if (!(newToPath instanceof Editor.Path))
            throw new TypeError('newToPath must be an Editor.Path');

        const index = this.findIndex(fromPath);
        if (index !== -1) {
            this.paths[index].to = newToPath;
            return true;
        }
        return false;
    }

    remove(path) {
        if (!(path instanceof Editor.Path))
            throw new TypeError('path must be an Editor.Path');

        const index = this.findIndex(path);
        if (index !== -1) {
            this.paths.splice(index, 1);
            return true;
        }
        return false;
    }

    count() {
        return this.paths.length;
    }

    loadFrom(pathsArray) {
        this.paths = [];
        for (const item of pathsArray) {
            const from = new Editor.Path(item.from);
            const to = new Editor.Path(item.to);
            if (!from.isEmpty && !to.isEmpty) {
                this.paths.push({ from, to });
            }
        }
    }

    toPlainArray() {
        return this.paths.map(item => ({
            from: item.from.toString(),
            to: item.to.toString()
        }));
    }

    forEach(callback) {
        this.paths.forEach(callback);
    }
}
