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
 * @param {"SUCCESS" | "FAILED"} status
 * @param {"HOODIE" | "SWEATER" | "T_SHIRT" | "DRESS_SUIT" | "BOMBER"} preset
 * @param {"NEW" | "REGENERATE"} origin
 */
export function logEventAssetCreation(status, preset, origin) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "preset": preset,
        "settings": "",
        "origin": origin,
        "inputFormat": "PROMPT_TEXT"
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
