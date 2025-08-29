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
 */
export function logEventAssetCreation(status) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": "NEW",
        "input_format": "ANIMATION_FROM_LIBRARY",
        "preset": "",
        "settings": "",
    };

    logEvent(eventData);
}

/**
 * @param {"SUCCESS" | "FAILED"} status
 * @param {"BLENDED_NONE" | "BLENDED_2" | "BLENDED_3" | "BLENDED_4" | "BLENDED_5"} settings
 */
export function logEventAssetImport(status, settings) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": status,
        "settings": settings
    };

    logEvent(eventData);
}
