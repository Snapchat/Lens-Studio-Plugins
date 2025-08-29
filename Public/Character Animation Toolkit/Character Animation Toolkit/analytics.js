//@ts-ignore
import * as Analytics from "LensStudio:Analytics";
//@ts-ignore
import { PLUGIN_ID } from "./constants.js";
/**
 * decorator function for enabling optional logging
 */
function logEvent(eventData) {
    eventData.event_value = PLUGIN_ID;
    Analytics.logEvent(eventData);
    // console.log(JSON.stringify(eventData));
}
export function logEventOpen() {
    const eventData = {
        event_name: "LENSSTUDIO_PLUGIN_EVENT_OPEN",
    };
    logEvent(eventData);
}
export function logEventImport(settings) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_ASSET_IMPORT",
        "status": "SUCCESS",
        "settings": settings
    };
    logEvent(eventData);
}
export function logEventCreate(status, inputFormat) {
    const eventData = {
        "event_name": "LENSSTUDIO_PLUGIN_EVENT_CREATE_ASSET",
        "status": status,
        "origin": "",
        "input_format": inputFormat,
        "preset": "",
        "settings": "",
    };
    logEvent(eventData);
}
