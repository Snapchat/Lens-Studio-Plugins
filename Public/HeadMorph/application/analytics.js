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
 * @param {"INTENSITY_LOW" | "INTENSITY_MEDIUM" | "INTENSITY_HIGH"} settings
 * @param {"NEW" | "CHANGE_GEOMETRY" | "CHANGE_TEXTURE"} origin
 * @param {"PROMPT_TEXT" | "PROMPT_IMAGE"} inputFormat
 */
export function logEventAssetCreation(status, settings, origin, inputFormat) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "preset": "",
        "settings": settings,
        "origin": origin,
        "input_format": inputFormat
    };

    logEvent(eventData);
}

/**
 * @param {"SUCCESS" | "FAILED"} status
 */
export function logEventAssetImport(status) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": status,
        "settings": ""
    };

    logEvent(eventData);
}
