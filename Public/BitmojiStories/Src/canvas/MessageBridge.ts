import * as LensBasedEditorView from "LensStudio:LensBasedEditorView";
import { Event } from "LensStudio:Event.js";

interface PendingRequest {
    resolve: (data: unknown) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
}

export class MessageBridge {
    readonly onEvent = new Event<{ type: string; payload: unknown }>();

    private pendingRequests = new Map<string, PendingRequest>();
    private requestId = 0;
    private connection: Editor.ScopedConnection;

    constructor(private lensView: LensBasedEditorView.LensBasedEditorView) {
        this.connection = this.lensView.onMessage.connect((event: { data: Record<string, unknown> }) =>
            this.handleMessage(event.data),
        );
    }

    async waitUntilReady(): Promise<void> {
        if (this.lensView.isLoaded) return;

        return new Promise<void>((resolve) => {
            const conn = this.lensView.onStateChanged.connect((state: LensBasedEditorView.State) => {
                if (state === LensBasedEditorView.State.Running) {
                    conn.disconnect();
                    resolve();
                }
            });
        });
    }

    async request(type: string, payload: unknown, timeoutMs = 5000): Promise<unknown> {
        if (!this.lensView.isLoaded) {
            await this.waitUntilReady();
        }

        const id = `req_${++this.requestId}`;

        return new Promise<unknown>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`Request '${type}' timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            this.pendingRequests.set(id, { resolve, reject, timeout });
            this.lensView.postMessage({ type, id, payload });
        });
    }

    private handleMessage(data: Record<string, unknown>): void {
        const type = data.type as string;
        const id = data.id != null ? String(data.id) : undefined;
        const payload = data.payload;
        const error = data.error as string | undefined;

        if (type === "response" && id != null && this.pendingRequests.has(id)) {
            const pending = this.pendingRequests.get(id)!;
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(id);

            if (error) {
                pending.reject(new Error(error));
            } else {
                pending.resolve(payload);
            }
        } else if (type !== "response") {
            console.log("Triggering event:", type, payload);
            this.onEvent.trigger({ type, payload });
        }
    }

    cleanup(): void {
        this.connection?.disconnect();
        for (const [, { timeout, reject }] of this.pendingRequests) {
            clearTimeout(timeout);
            reject(new Error("Bridge closed"));
        }
        this.pendingRequests.clear();
        this.onEvent.clear();
    }
}
