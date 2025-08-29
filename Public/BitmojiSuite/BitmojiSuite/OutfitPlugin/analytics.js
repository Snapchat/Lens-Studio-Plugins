import * as Analytics from "LensStudio:Analytics";
import { PLUGIN_ID } from "./constants.js";

// decorator function for enabling optional logging
function logEvent(eventData) {
    eventData.event_value = PLUGIN_ID;
    Analytics.logEvent(eventData);
    // console.log(JSON.stringify(eventData));
}

export function logEventOpen() {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_OPEN"
    };

    logEvent(eventData);
}

/**
 * @param {"SUCCESS"} status
 * @param {"OUTFIT" | "TOP" | "BOTTOM" | "DRESS" | "FOOTWEAR" | "BAG" | "OUTERWEAR" | "GLASSES"} preset
 */
export function logEventAssetCreation(status, preset) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": "LIBRARY",
        "input_format": "LIBRARY",
        "preset": preset,
        "settings": "",
    };

    logEvent(eventData);
}

/**
 * @param {"SUCCESS" | "FAILED"} status
 * @param {"APPLY_LIBRARY" | "RESET_LIBRARY" } settings
 */
export function logEventAssetImport(status, settings) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": status,
        "settings": settings
    };

    logEvent(eventData);
}
