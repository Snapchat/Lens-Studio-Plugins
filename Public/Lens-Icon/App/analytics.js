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
 * @param {"NEW" | "REGENERATE"} origin
 * @param {"NONE" | "VECTOR_ART" | "CYBERPUNK" | "HYPER_REALISTIC" | "STEAMPUNK" | "CARTOON" | "WATERCOLORS" | "OIL_PAINTING" | "PIXEL_ART" | "ART_DECO" | "MOSAIC"} preset
 */
export function logEventAssetCreation(status, origin, preset) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": origin,
        "input_format": "PROMPT_TEXT",
        "preset": preset,
        "settings": "",
    };

    logEvent(eventData);
}

/**
 * @param {"SUCCESS" | "FAILED"} status
 * @param {"FROM_FILE" | "GEN_AI"} settings
 */
export function logEventAssetImport(status, settings) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": status,
        "settings": settings
    };

    logEvent(eventData);
}
