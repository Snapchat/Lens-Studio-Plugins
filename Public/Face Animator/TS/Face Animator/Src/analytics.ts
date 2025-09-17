// @ts-nocheck
//@ts-ignore
import * as Analytics from "LensStudio:Analytics";

export const PLUGIN_ID = "Com.Snap.FaceAnimator";

/**
 * decorator function for enabling optional logging
 */
function logEvent(eventData: any): void {
    eventData.event_value = PLUGIN_ID;
    Analytics.logEvent(eventData);
    // console.log(JSON.stringify(eventData));
}

export function logEventOpen(): void {
    const eventData: any = {
        event_name: "LENSSTUDIO_PLUGIN_EVENT_OPEN",
    };

    logEvent(eventData);
}

export function logEventImport(status: string, settings: string): void {
    const eventData: any = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": status,
        "settings": settings
    };

    logEvent(eventData);
}

export function logEventCreate(status: string, origin: string, inputFormat: string): void {
    const eventData: any = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": origin,
        "input_format": inputFormat,
        "preset": "",
        "settings": "",
    };

    logEvent(eventData);
}

export function logEventEffectTraining(status: string): void {
    const eventData: any = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_EFFECT_TRAINING",
        "status": status
    };

    logEvent(eventData);
}
