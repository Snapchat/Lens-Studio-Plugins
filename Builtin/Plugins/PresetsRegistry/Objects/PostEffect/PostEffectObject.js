import { Preset } from 'LensStudio:Preset';

import { AnalogTVMaterialPreset } from '../../Assets/AnalogTVMaterial/AnalogTVMaterial.js';
import { ColorGradientMaterialPreset } from '../../Assets/ColorGradientMaterial/ColorGradientMaterial.js';
import { ColorRemapMaterialPreset } from '../../Assets/ColorRemapMaterial/ColorRemapMaterial.js';
import { DistortionMaterialPreset } from '../../Assets/DistortionMaterial/DistortionMaterial.js';
import { DitheringMaterialPreset } from '../../Assets/DitheringMaterial/DitheringMaterial.js';
import { GaussianBlurMaterialPreset } from '../../Assets/GaussianBlurMaterial/GaussianBlurMaterial.js';
import { HalfToneMaterialPreset } from '../../Assets/HalfToneMaterial/HalfToneMaterial.js';
import { OilPaintMaterialPreset } from '../../Assets/OilPaintMaterial/OilPaintMaterial.js';
import { PixelizationMaterialPreset } from '../../Assets/PixelizationMaterial/PixelizationMaterial.js';
import { ShakeMaterialPreset } from '../../Assets/ShakeMaterial/ShakeMaterial.js';
import { SmoothingMaterialPreset } from '../../Assets/SmoothingMaterial/SmoothingMaterial.js';
import { ZoomBlurMaterialPreset } from '../../Assets/ZoomBlurMaterial/ZoomBlurMaterial.js';
import { VHSMaterialPreset } from '../../Assets/VHSMaterial/VHSMaterial.js';
import { EdgeDetectionMaterialPreset } from '../../Assets/EdgeDetectionMaterial/EdgeDetectionMaterial.js';

function createPostEffectClass(name, assetMaterialPreset) {
    class PostEffectObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.PostEffectObjectPreset.${name}`,
                interfaces: Preset.descriptor().interfaces,
                name: name,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve('Resources/PostEffect.svg')),
                section: 'Visual Effects',
                entityType: 'SceneObject'
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);
        }
        async createAsync(destination) {

            const materialPreset = new assetMaterialPreset(this.pluginSystem);

            let materialAsset;
            if (materialPreset.createAsync) {
                materialAsset = await materialPreset.createAsync.call(this);
            } else {
                materialAsset = materialPreset.create.call(this);
            }

            // Create the PostEffectVisual
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            const scene = model.project.scene;
            destination = scene.addSceneObject(destination);
            const posteffectVisual = destination.addComponent('PostEffectVisual');
            posteffectVisual.mainMaterial = materialAsset;
            destination.name = name;

            return posteffectVisual;
        }
    }

    return PostEffectObjectPreset;
}

export const AnalogTVPreset = createPostEffectClass('Analog TV', AnalogTVMaterialPreset);
export const ColorGradientPreset = createPostEffectClass('Color Gradient', ColorGradientMaterialPreset);
export const ColorRemapPreset = createPostEffectClass('Color Remap', ColorRemapMaterialPreset);
export const DistortionPreset = createPostEffectClass('Distortion', DistortionMaterialPreset);
export const DitheringPreset = createPostEffectClass('Dithering', DitheringMaterialPreset);
export const GaussianBlurPreset = createPostEffectClass('Gaussian Blur', GaussianBlurMaterialPreset);
export const HalfTonePreset = createPostEffectClass('Half Tone', HalfToneMaterialPreset);
export const OilPaintPreset = createPostEffectClass('Oil Paint', OilPaintMaterialPreset);
export const PixelizationPreset = createPostEffectClass('Pixelization', PixelizationMaterialPreset);
export const Shake = createPostEffectClass('Shake', ShakeMaterialPreset);
export const SmoothingPreset = createPostEffectClass('Smoothing', SmoothingMaterialPreset);
export const ZoomBlurPreset = createPostEffectClass('Zoom Blur', ZoomBlurMaterialPreset);
export const VHSPreset = createPostEffectClass('VHS', VHSMaterialPreset);
export const EdgeDetectionPreset = createPostEffectClass('Edge Detection', EdgeDetectionMaterialPreset);
