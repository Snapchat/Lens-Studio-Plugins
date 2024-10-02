import { findOrCreate, findOrCreateAsync, findOrCreateNativeAsset } from 'LensStudio:Utils@1.0.js';
import { findOrCreateScreenTexture } from 'LensStudio:Utils@1.0.js';
import { findOrCreateObjectTrackingTexture } from 'LensStudio:Utils@1.0.js';

function setupSamplerWrapMode(sampler, wrapMode) {
    const mode = ['ClampToEdge', 'MirroredRepeat', 'Repeat', 'ClampToBorderColor'];
    sampler.wrapModeU = Editor.Assets.WrapMode[mode[wrapMode]];
    sampler.wrapModeV = Editor.Assets.WrapMode[mode[wrapMode]];
    sampler.wrapModeW = Editor.Assets.WrapMode[mode[wrapMode]];
    return sampler;
}

export function setDropList(passInfo, scriptName) {
    const defines = passInfo.defines;
    defines.push(scriptName);
    passInfo.defines = defines;
}

export function enableMipmaps(sampler) {
    sampler.mipmapsEnabled = true;
    return sampler;
}

export function addDefine(passInfo, define) {
    const defines = passInfo.defines;
    defines.push(define);
    passInfo.defines = defines;
}

export function setupBaseTex(assetManager, passInfo, tex, isPath, wrapMode) {
    addDefine(passInfo, 'ENABLE_BASE_TEX');
    const baseTexImage =  (isPath) ? findOrCreate(assetManager, tex) : tex;
    const baseTexParam = new Editor.Assets.TextureParameter(baseTexImage.id);
    baseTexParam.sampler = setupSamplerWrapMode(baseTexParam.sampler, wrapMode);
    passInfo.baseTex = baseTexParam;
}

export function setupOpacityTex(assetManager, passInfo, absoluteTexPath, wrapMode) {
    addDefine(passInfo, 'ENABLE_OPACITY_TEX');
    const opacityTexImage = findOrCreate(assetManager, absoluteTexPath);
    const opacityTexParam = new Editor.Assets.TextureParameter(opacityTexImage.id);
    opacityTexParam.sampler = setupSamplerWrapMode(opacityTexParam.sampler, wrapMode);
    passInfo.opacityTex = opacityTexParam;
}

export async function setupNormalTex(assetManager, passInfo, absoluteTexPath, destinationPath) {
    addDefine(passInfo, 'ENABLE_NORMALMAP');
    const normalTexImage = await findOrCreateAsync(assetManager, absoluteTexPath, destinationPath);
    const normalTexParam = new Editor.Assets.TextureParameter(normalTexImage.id);
    passInfo.normalTex = normalTexParam;
}

export function setupMaterialParamsTex(assetManager, passInfo, absoluteTexPath) {
    addDefine(passInfo, 'ENABLE_LIGHTING');
    const materialParamsImage = findOrCreate(assetManager, absoluteTexPath);
    const materialParamsTexParam = new Editor.Assets.TextureParameter(materialParamsImage.id);
    passInfo.materialParamsTex = materialParamsTexParam;
}

export function setupScreenTex(assetManager, passInfo, destination) {
    const screenTexImage = findOrCreateScreenTexture(assetManager, destination);
    const screenTexParam = new Editor.Assets.TextureParameter(screenTexImage.id);
    screenTexParam.sampler = setupSamplerWrapMode(screenTexParam.sampler, 0);
    passInfo.screenTexture = screenTexParam;
}

export function setupMipmaps(assetManager, passInfo) {
    const screenTexImage = findOrCreateScreenTexture(assetManager);
    const screenTexParam = new Editor.Assets.TextureParameter(screenTexImage.id);
    screenTexParam.sampler = enableMipmaps(screenTexParam.sampler);
    passInfo.screenTexture = screenTexParam;

}

export function setOpacityTexUvToMeshUv1(passInfo) {
    // TODO: API should be simplified
    const defines = passInfo.defines;
    const removeIndex = defines.indexOf('NODE_69_DROPLIST_ITEM 0');
    if (removeIndex !== -1) {
        defines.splice(removeIndex, 1);
    }

    defines.push('NODE_69_DROPLIST_ITEM 1');
    passInfo.defines = defines;
}

/**
 * Below are used by the MaterialPresetFactory.
 */

export async function createTexture(texturePath) {
    const absTexPath = new Editor.Path(texturePath);
    const textureMeta = await findOrCreateAsync(this.assetManager, absTexPath, this.destination);
    const textureParam = new Editor.Assets.TextureParameter(textureMeta.id);
    return textureParam;
}

export async function createNormalTexture(texturePath) {
    addDefine(this.passInfo, 'ENABLE_NORMALMAP');
    return await createTexture.apply(this, [texturePath]);
}

export async function createBaseTex(texturePath, wrapMode) {
    addDefine(this.passInfo, 'ENABLE_BASE_TEX');
    const texParam = await createTexture.apply(this, [texturePath]);
    texParam.sampler = setupSamplerWrapMode(texParam.sampler, wrapMode);
    return texParam;
}

export async function createOpacityTex(texturePath, wrapMode) {
    addDefine(this.passInfo, 'ENABLE_OPACITY_TEX');
    const texParam = await createTexture.apply(this, [texturePath]);
    texParam.sampler = setupSamplerWrapMode(texParam.sampler, wrapMode);
    setOpacityTexUvToMeshUv1(this.passInfo);
    return texParam;
}

export async function createMaterialParamsTex(texturePath) {
    addDefine(this.passInfo, 'ENABLE_LIGHTING');
    return await createTexture.apply(this, [texturePath]);
}

export async function createScreenTexture(mipmapsEnabled) {
    const screenTexImage = findOrCreateScreenTexture(this.assetManager, this.destination);
    const screenTexParam = new Editor.Assets.TextureParameter(screenTexImage.id);
    screenTexParam.sampler = setupSamplerWrapMode(screenTexParam.sampler, 0);

    if (mipmapsEnabled) {
        screenTexParam.sampler = enableMipmaps(screenTexParam.sampler);
    }

    return screenTexParam;
}

export async function createDepthTexture() {
    const depthTexture = findOrCreateNativeAsset('DepthTexture', this.assetManager, this.destination);
    const depthTexParam = new Editor.Assets.TextureParameter(depthTexture.id);
    depthTexParam.sampler = setupSamplerWrapMode(depthTexParam.sampler, 2);
    return depthTexParam;
}

export async function createObjectTrackingTexture(trackingType) {
    const objectTrackingTexImage = findOrCreateObjectTrackingTexture(this.assetManager, this.destination, trackingType);
    const objectTrackingTexParam = new Editor.Assets.TextureParameter(objectTrackingTexImage.id);
    objectTrackingTexParam.sampler = setupSamplerWrapMode(objectTrackingTexParam.sampler, 0);
    return objectTrackingTexParam;
}
