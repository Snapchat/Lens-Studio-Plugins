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
 * @param {"NEW" | "UPDATE_EXISTING"} origin
 * @param {"PROMPT_TEXT" | "PROMPT_IMAGE" | "TEXT_AND_IMAGE"} inputFormat
 * @param {"DEFAULT" | "EMOTIONS" | "BEAUTY" | "CARTOON" | "FUN" | "CREEPY" | ""} preset
 * @param {"DEFAULT" | "CUSTOM"} settings
 */
export function logEventAssetCreation(status, origin, inputFormat, preset = "", settings = "") {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": origin,
        "input_format": inputFormat,
        "preset": preset,
        "settings": settings,
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

/**
 * @param {"SUCCESS" | "FAILED" | "RATE_LIMITED"} status
 */
export function logEventEffectTraining(status) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_EFFECT_TRAINING",
        "status": status,
    };

    logEvent(eventData);
}
