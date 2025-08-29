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
 */
export function logEventAssetCreation(status) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "preset": "",
        "settings": "",
        "origin": "NEW",
        "input_format": "PROMPT_VIDEO"
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
