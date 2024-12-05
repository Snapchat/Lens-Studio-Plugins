import * as MaterialPresetFactory from '../Utils/MaterialPresetFactory.js';

function createColorCorrection(tex){
    const params = {
        'descriptor': {
            'id': 'Com.Snap.ColorCorrectionMaterial',
            'name': 'Color Correction',
            'description': 'Applies a LUT (Look Up Table).',
            'icon': import.meta.resolve('../Resources/Material.svg')
        },
        graph_path: import.meta.resolve('Resources/color_correction.ss_graph'),
        pass_info: {
            'depthTest': false,
            'depthWrite': false,
        },
        custom_pass_info: {
            baseTex: {
                type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.baseTexture,
                params: [
                    import.meta.resolve(tex),
                    0
                ]
            },
            screenTexture: {
                type: MaterialPresetFactory.CUSTOM_PARAMS_TYPE.screenTexture,
                params: [],
            },
        }
    };
    return params;
}

export const AllYellowMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/AllYellow.png'));
export const BeautyMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Beauty.png'));
export const BlownWhiteMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/BlownWhite.png'));
export const BlueOrangeMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/BlueOrange.png'));
export const BrighteningMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Brightening.png'));
export const BWMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/BW.png'));
export const CinematicMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Cinematic.png'));
export const CleanMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Clean.png'));
export const ContrastMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Contrast.png'));
export const CrispWarmMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/CrispWarm.png'));
export const CurveMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Curve.png'));
export const DefaultMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Default.png'));
export const EmptyMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Empty.png'));
export const FadedMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Faded.png'));
export const FlowerMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Flower.png'));
export const FrostMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Frost.png'));
export const HeatMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Heat.png'));
export const InstantPhotoMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/InstantPhoto.png'));
export const InvertMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Invert.png'));
export const MonocromeMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Monocrome.png'));
export const NightMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Night.png'));
export const NightVisionMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/NightVision.png'));
export const OldPaperMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/OldPaper.png'));
export const PaleMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Pale.png'));
export const PurpleHillsMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/PurpleHills.png'));
export const RainbowMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Rainbow.png'));
export const ReddishMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Reddish.png'));
export const RedLipsMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/RedLips.png'));
export const RetroGameMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/RetroGame.png'));
export const RoyDarkMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/RoyDark.png'));
export const SepiaMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Sepia.png'));
export const SharpWarmMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/SharpWarm.png'));
export const SpectrumMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Spectrum.png'));
export const SunglassMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Sunglass.png'));
export const TexasMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Texas.png'));
export const TwoStripeMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/TwoStripe.png'));
export const VintageBlueMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/VintageBlue.png'));
export const VintageRedMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/VintageRed.png'));
export const VintageWarmMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/VintageWarm.png'));
export const WarmMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/Warm.png'));
export const WarmOldMaterialPreset = MaterialPresetFactory.createMaterialPreset(createColorCorrection('Resources/WarmOld.png'));