import {getDreamByID, tryParseJson} from "./api.js";
import {DreamSettings} from "./dreamTypes.js";

export interface DreamPollerCallbacks {
    isRemoved(id: string): boolean;
    isStaleState(id: string, incomingState: string): boolean;
    onStateUpdated(settings: DreamSettings): void;
    onSuccess(settings: DreamSettings, isFirstSuccess: boolean): void;
    onFailed(settings: DreamSettings): void;
    onPackSuccess(settings: DreamSettings): void;
    onPackFailed(settings: DreamSettings): void;
}

/**
 * Polls dream state until a terminal pack outcome (or a SUCCESS that never
 * auto-packs within MAX_POLLS_AFTER_SUCCESS).
 */
export class DreamPoller {

    private static readonly MAX_POLLS_AFTER_SUCCESS = 24;

    private activePolls: Record<string, boolean> = {};
    private intervals: Timeout[] = [];

    start(id: string, intervalVal: number, callbacks: DreamPollerCallbacks): void {
        if (this.activePolls[id]) {
            return;
        }
        this.activePolls[id] = true;

        let pollsSinceSuccess = 0;

        const stopPolling = () => {
            clearInterval(interval);
            delete this.activePolls[id];
        };

        const checkState = (dreamId: string) => {
            if (callbacks.isRemoved(dreamId)) {
                stopPolling();
                return;
            }
            getDreamByID(dreamId, (response: any) => {
                if (response.statusCode !== 200) {
                    console.error(`[AI Photo Duo] checkDreamState/getDreamByID failed, status code: ${response.statusCode}`);
                    return;
                }
                const curSettings = tryParseJson(response.body, "checkDreamState") as DreamSettings | null;
                if (!curSettings) {
                    return;
                }
                if (callbacks.isStaleState(curSettings.id!, curSettings.state)) {
                    // We already know about a more advanced state for this dream
                    // (from another poll or a direct user action) - ignore this
                    // stale response rather than regressing the UI.
                    return;
                }
                if (curSettings.state == "SUCCESS") {
                    callbacks.onStateUpdated(curSettings);
                    const isFirstSuccess = pollsSinceSuccess === 0;
                    callbacks.onSuccess(curSettings, isFirstSuccess);
                    pollsSinceSuccess++;
                    if (pollsSinceSuccess >= DreamPoller.MAX_POLLS_AFTER_SUCCESS) {
                        // Never auto-packed within the window - stop polling and
                        // fall back to requiring the manual "Train the model" click.
                        stopPolling();
                    }
                }
                else if (curSettings.state == "FAILED") {
                    stopPolling();
                    callbacks.onStateUpdated(curSettings);
                    callbacks.onFailed(curSettings);
                }
                else if (curSettings.state == "PACK_SUCCESS") {
                    stopPolling();
                    callbacks.onStateUpdated(curSettings);
                    callbacks.onPackSuccess(curSettings);
                }
                else if (curSettings.state == "PACK_FAILED") {
                    stopPolling();
                    callbacks.onStateUpdated(curSettings);
                    callbacks.onPackFailed(curSettings);
                }
                else {
                    // Still an intermediate state (e.g. RUNNING/PACK_RUNNING) -
                    // keep the cache in sync so isStaleState() has an up-to-date
                    // baseline for future polls.
                    callbacks.onStateUpdated(curSettings);
                }
            })
        }

        const interval = setInterval(() => {
            checkState(id);
        }, intervalVal);

        this.intervals.push(interval);
    }

    stopAll(): void {
        this.intervals.forEach((interval) => clearInterval(interval));
        this.intervals = [];
        this.activePolls = {};
    }
}
