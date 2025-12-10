import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

import { AllYellowMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { BeautyMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { BlownWhiteMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { BlueOrangeMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { BrighteningMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { BWMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { CinematicMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { CleanMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { ContrastMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { CrispWarmMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { CurveMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { DefaultMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { EmptyMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { FadedMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { FlowerMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { FrostMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { HeatMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { InstantPhotoMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { InvertMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { MonocromeMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { NightMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { NightVisionMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { OldPaperMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { PaleMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { PurpleHillsMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { RainbowMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { ReddishMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { RedLipsMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { RetroGameMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { RoyDarkMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { SepiaMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { SharpWarmMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { SpectrumMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { SunglassMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { TexasMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { TwoStripeMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { VintageBlueMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { VintageRedMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { VintageWarmMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { WarmMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';
import { WarmOldMaterialPreset } from '../../Assets/ColorCorrectionMaterial/ColorCorrectionMaterial.js';


function createColorCorrectionClass(name, assetMaterialPreset) {
    class ColorCorrectionObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.ColorCorrectionObjectPreset.${name}`,
                name: name,
                description: `PostEffectVisual with ${name} LUT`,
                icon: Editor.Icon.fromFile(import.meta.resolve('Resources/PostEffect.svg')),
                section: 'Color Correction',
                entityType: 'SceneObject'
            };
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
            const rootObject = Utils.findOrCreateCameraObject(scene, destination);
            const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);
            const PostEffectObject = scene.addSceneObject(effectsObject);
            const posteffectVisual = PostEffectObject.addComponent('PostEffectVisual');

            posteffectVisual.mainMaterial = materialAsset;
            PostEffectObject.name = name;

            return posteffectVisual;
        }
    }

    return ColorCorrectionObjectPreset;
}

export const AllYellowPreset = createColorCorrectionClass('All Yellow', AllYellowMaterialPreset);
export const BeautyPreset = createColorCorrectionClass('Beauty', BeautyMaterialPreset);
export const BlownWhitePreset = createColorCorrectionClass('Blown White', BlownWhiteMaterialPreset);
export const BlueOrangePreset = createColorCorrectionClass('Blue Orange', BlueOrangeMaterialPreset);
export const BrighteningPreset = createColorCorrectionClass('Brightening', BrighteningMaterialPreset);
export const BWPreset = createColorCorrectionClass('BW', BWMaterialPreset);
export const CinematicPreset = createColorCorrectionClass('Cinematic', CinematicMaterialPreset);
export const CleanPreset = createColorCorrectionClass('Clean', CleanMaterialPreset);
export const ContrastPreset = createColorCorrectionClass('Contrast', ContrastMaterialPreset);
export const CrispWarmPreset = createColorCorrectionClass('Crisp Warm', CrispWarmMaterialPreset);
export const CurvePreset = createColorCorrectionClass('Curve', CurveMaterialPreset);
export const DefaultPreset = createColorCorrectionClass('Default', DefaultMaterialPreset);
export const EmptyPreset = createColorCorrectionClass('Empty', EmptyMaterialPreset);
export const FadedPreset = createColorCorrectionClass('Fade', FadedMaterialPreset);
export const FlowerPreset = createColorCorrectionClass('Flower', FlowerMaterialPreset);
export const FrostPreset = createColorCorrectionClass('Frost', FrostMaterialPreset);
export const HeatPreset = createColorCorrectionClass('Heat', HeatMaterialPreset);
export const InstantPhotoPreset = createColorCorrectionClass('Instant Photo', InstantPhotoMaterialPreset);
export const InvertPreset = createColorCorrectionClass('Invert', InvertMaterialPreset);
export const MonocromePreset = createColorCorrectionClass('Monocrome', MonocromeMaterialPreset);
export const NightPreset = createColorCorrectionClass('Night', NightMaterialPreset);
export const NightVisionPreset = createColorCorrectionClass('Night Vision', NightVisionMaterialPreset);
export const OldPaperPreset = createColorCorrectionClass('Old Paper', OldPaperMaterialPreset);
export const PalePreset = createColorCorrectionClass('Pale', PaleMaterialPreset);
export const PurpleHillsPreset = createColorCorrectionClass('Purple Hills', PurpleHillsMaterialPreset);
export const RainbowPreset = createColorCorrectionClass('Rainbow', RainbowMaterialPreset);
export const ReddishPreset = createColorCorrectionClass('Reddish', ReddishMaterialPreset);
export const RedLipsPreset = createColorCorrectionClass('RedLips', RedLipsMaterialPreset);
export const RetroGamePreset = createColorCorrectionClass('Retro Game', RetroGameMaterialPreset);
export const RoyDarkPreset = createColorCorrectionClass('Roy Dark', RoyDarkMaterialPreset);
export const SepiaPreset = createColorCorrectionClass('Sepia', SepiaMaterialPreset);
export const SharpWarmPreset = createColorCorrectionClass('Sharp Warm', SharpWarmMaterialPreset);
export const SpectrumPreset = createColorCorrectionClass('Spectrum', SpectrumMaterialPreset);
export const SunglassPreset = createColorCorrectionClass('Sunglass', SunglassMaterialPreset);
export const TexasPreset = createColorCorrectionClass('Texas', TexasMaterialPreset);
export const TwoStripePreset = createColorCorrectionClass('Two Stripe', TwoStripeMaterialPreset);
export const VintageBluePreset = createColorCorrectionClass('Vintage Blue', VintageBlueMaterialPreset);
export const VintageRedPreset = createColorCorrectionClass('Vintage Red', VintageRedMaterialPreset);
export const VintageWarmPreset = createColorCorrectionClass('Vintage Warm', VintageWarmMaterialPreset);
export const WarmPreset = createColorCorrectionClass('Warm', WarmMaterialPreset);
export const WarmOldPreset = createColorCorrectionClass('Warm Old', WarmOldMaterialPreset);
