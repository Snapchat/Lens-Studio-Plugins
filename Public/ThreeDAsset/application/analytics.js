import * as Analytics from "LensStudio:Analytics";
import { PluginID } from "./common.js";

// decorator function for enabling optional logging
function logEvent(eventData) {
    eventData.event_value = PluginID;
    Analytics.logEvent(eventData);
}

export function logEventLinkOpen(url) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_LINK_OPEN",
        "url": url
    };

    logEvent(eventData);
}

export function logEventOpen() {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_OPEN"
    };

    logEvent(eventData);
}

/**
 * @param {"SUCCESS" | "FAILED" | "GUIDELINES_VIOLATION"} status
 * @param {"NEW" | "CHANGE_GEOMETRY" | "CHANGE_TEXTURE"} origin
 * @param {"PROMPT_TEXT" | "PROMPT_IMAGE"} inputFormat
 */
export function logEventAssetCreation(status, origin, inputFormat) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": origin,
        "input_format": inputFormat,
        "preset": "",
        "settings": ""
    };

    logEvent(eventData);
}

/**
 * @param {"SUCCESS" | "FAILED" | "PREPARING"} status
 * @param {"STANDARD" | "HIGH" | "MAX"} settings
 */
export function logEventAssetImport(status, settings) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": status,
        "settings": settings
    };

    logEvent(eventData);
}
