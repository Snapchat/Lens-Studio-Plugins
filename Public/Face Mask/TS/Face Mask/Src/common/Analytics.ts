import * as Analytics from "LensStudio:Analytics";

export const PLUGIN_ID = "Com.Snap.FaceMask";

function logEvent(eventData: any): void {
    eventData.event_value = PLUGIN_ID;
    Analytics.logEvent(eventData);
}

export const EVENT_STATUS = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    GUIDELINES_VIOLATION: "GUIDELINES_VIOLATED",
}

export const EVENT_CREATE_ASSET = {
    ORIGIN: {
        NEW: "NEW",
        REGENERATE: "REGENERATE",
    },
    INPUT_FORMAT: {
        TEXT: "TEXT",
    },
}

export function logEventOpen(): void {
    const eventData: any = {
        event_name: "LENSSTUDIO_PLUGIN_EVENT_OPEN",
    };

    logEvent(eventData);
}

export function logEventLinkOpen(url: string): void {
    const eventData: any = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_LINK_OPEN",
        "url": url
    };
    logEvent(eventData);
}

export function logEventCreateAsset(status: string, origin: string, inputFormat: string): void {
    const eventData: any = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": origin,
        "input_format": inputFormat,
    };

    logEvent(eventData);
}

export function logEventAssetImport(status: string): void {
    const eventData: any = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": status
    };

    logEvent(eventData);
}
