/**
 * @typedef Resources
 * @prop {string} controllerScriptId
 * @prop {string} controllerScriptName
 * @prop {string} transitionCameraName
 * @prop {string} postEffectName
 * @prop {string} categoryId
 * @prop {string} jsonFileId
 * @prop {string} jsonFallbackFileName
 * @prop {string} transitionPath
 * @prop {string} previewAssetId
 */

/**
 * @typedef ResourceSpec
 * @prop {StudioVersion} minStudioVer
 */

/**
 * @typedef ResourceConfigEntry
 * @prop {ResourceSpec} spec
 * @prop {PluginResources} resources
 */

import { findBestMatchingStudioVersion, StudioVersion } from "../Utils/studioVer.js";

/** @type {PluginResources} */
const DEFAULT = {
    controllerScriptId: "CFhYiknhE4MDI3tuAfQTj",
    controllerScriptName: "Logic",
    transitionCameraName: "Transition",
    postEffectName: "Transition",
    categoryId: "PLUGIN_CONTENT",
    jsonFileId: "7nEcgksZGobUQ60dkdC2ZN",
    jsonFallbackFileName: "transitions-data.v1.json",
    transitionPath: "/VFX Resources/Scripts/",
    previewAssetId: "xwiyPwF3w0tRcleAmf7Ok"
};

/** @type {ResourceConfigEntry[]}*/
const resourceConfig = [
    {
        spec: { minStudioVer: new StudioVersion("5.4.0") },
        resources: { ...DEFAULT },
    },
    {
        spec: { minStudioVer: new StudioVersion("5.7.0") },
        resources: {
            ...DEFAULT,
            jsonFallbackFileName: "transitions-data.v2.json",
            controllerScriptId: "7Dt6Z9uKdMsdE31GUPHgxf",
        },
    },
];

export const PluginResources = findBestMatchingStudioVersion(resourceConfig, entry => entry.spec.minStudioVer).resources;
