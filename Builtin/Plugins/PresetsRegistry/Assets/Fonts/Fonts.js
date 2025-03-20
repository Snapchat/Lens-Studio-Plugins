import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

function createFontClass(name) {
    class FontPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.FontPreset.${name}`,
                name: name,
                description: '',
                icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/Font.svg'))),
                section: 'Fonts',
                entityType: 'Asset'
            };
        }
        async createAsync(d) {
            try {
                const destination = d ? d : new Editor.Path('');

                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const assetManager = model.project.assetManager;

                const resourceLoc = import.meta.resolve(`Resources/Fonts/${name}.ttf`);
                const absGraphPath = new Editor.Path(resourceLoc);

                return await Utils.findOrCreateAsync(assetManager, absGraphPath, destination);
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }
    }
    return FontPreset;
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
