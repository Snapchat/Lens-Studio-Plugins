import {createResourcePresetClass, PresetCreateMethod} from '../Utils/ResourcePresetFactory.js';

function createFontClass(name, description) {
    return createResourcePresetClass({
        name,
        id: `Com.Snap.FontPreset.${name}`,
        description: description || '',
        icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/Font.svg'))),
        section: 'Fonts',
        entityType: 'Font',
        resourcePath: new Editor.Path(import.meta.resolve(`Resources/Fonts/${name}.ttf`)),
        createMethod: PresetCreateMethod.FindOrCreate
    });
}

// Unfortunately can't do for-in
export const AmaticScFontPreset = createFontClass('AmaticSC', 'Casual handwritten font with bold, playful letterforms');
export const CaveatFontPreset = createFontClass('Caveat', 'Natural handwritten font with authentic pen-stroke style');
export const CutiveMonoFontPreset = createFontClass('Cutive Mono', 'Classic monospace font inspired by typewriter aesthetics');
export const DancingScriptFontPreset = createFontClass('DancingScript', 'Elegant script font with flowing, cursive letterforms');
export const IndieFlowerFontPreset = createFontClass('Indie Flower', 'Friendly handwritten font with informal, relaxed character');
export const LibreBaskervilleFontPreset = createFontClass('Libre Baskerville', 'Traditional serif font with classic book typography style');
export const MerriweatherFontPreset = createFontClass('Merriweather', 'Readable serif font designed for comfortable screen reading');
export const PacificoFontPreset = createFontClass('Pacifico', 'Retro surf-style script font with vintage 1950s feel');
export const VT323FontPreset = createFontClass('VT323', 'Retro monospace font mimicking old terminal displays');
