export interface FrameRuntime {
    sceneObject: Editor.Model.SceneObject;
    bitmojiSceneObjects: Editor.Model.SceneObject[];
    bubbleSceneObjects: Editor.Model.SceneObject[];
}

export class RuntimeMap {
    private frames = new Map<number, FrameRuntime>();

    setFrame(index: number, runtime: FrameRuntime): void {
        this.frames.set(index, runtime);
    }

    getFrame(index: number): FrameRuntime | undefined {
        return this.frames.get(index);
    }

    removeFrame(index: number): void {
        this.frames.delete(index);
    }

    reindex(removedIndex: number): void {
        const updated = new Map<number, FrameRuntime>();
        for (const [idx, runtime] of this.frames) {
            if (idx < removedIndex) {
                updated.set(idx, runtime);
            } else if (idx > removedIndex) {
                updated.set(idx - 1, runtime);
            }
        }
        this.frames = updated;
    }

    reindexInsert(insertedIndex: number): void {
        const updated = new Map<number, FrameRuntime>();
        for (const [idx, runtime] of this.frames) {
            if (idx < insertedIndex) {
                updated.set(idx, runtime);
            } else {
                updated.set(idx + 1, runtime);
            }
        }
        this.frames = updated;
    }

    clear(): void {
        this.frames.clear();
    }

    get size(): number {
        return this.frames.size;
    }
}
