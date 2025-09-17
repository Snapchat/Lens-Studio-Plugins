import {createResourcePresetClass, PresetCreateMethod} from '../Utils/ResourcePresetFactory.js';

function createFontClass(name) {
    return createResourcePresetClass({
        name,
        id: `Com.Snap.FontPreset.${name}`,
        description: '',
        icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/Font.svg'))),
        section: 'Fonts',
        entityType: 'Asset',
        resourcePath: new Editor.Path(import.meta.resolve(`Resources/Fonts/${name}.ttf`)),
        createMethod: PresetCreateMethod.FindOrCreate
    });
}

// Unfortunately can't do for-in
export const AmaticScFontPreset = createFontClass('AmaticSC');
export const CaveatFontPreset = createFontClass('Caveat');
export const CutiveMonoFontPreset = createFontClass('Cutive Mono');
export const DancingScriptFontPreset = createFontClass('DancingScript');
export const IndieFlowerFontPreset = createFontClass('Indie Flower');
export const LibreBaskervilleFontPreset = createFontClass('Libre Baskerville');
export const MerriweatherFontPreset = createFontClass('Merriweather');
export const PacificoFontPreset = createFontClass('Pacifico');
export const VT323FontPreset = createFontClass('VT323');
