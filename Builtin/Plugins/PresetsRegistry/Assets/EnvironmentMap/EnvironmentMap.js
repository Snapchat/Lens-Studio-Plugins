import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

function createEnvironmentMapClass(name, niceName) {
    class MeshPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.EnvironmentMap.${name}`,
                interfaces: Preset.descriptor().interfaces,
                name: niceName,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve('Resources/HDRTexture.svg')),
                section: 'Textures',
                entityType: 'Texture'
            };
        }
        async createAsync(d) {
            try {
                const destination = d ? d : new Editor.Path('');

                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const assetManager = model.project.assetManager;

                const resourceLoc = import.meta.resolve(`Resources/${name}`);
                const absResourcePath = new Editor.Path(resourceLoc);

                return await Utils.findOrCreateAsync(assetManager, absResourcePath, destination);
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }
    }
    return MeshPreset;
}

// Unfortunately can't do for-in
export const EchoparkEnvironmentMap = createEnvironmentMapClass('Echopark.hdr', 'Echopark');
export const MarVistaEnvironmentMap = createEnvironmentMapClass('Mar Vista.exr', 'Mar Vista');
export const PasadenaEnvironmentMap = createEnvironmentMapClass('Pasadena.hdr', 'Pasadena');
export const PierEnvironmentMap = createEnvironmentMapClass('Pier.hdr', 'Pier');
export const SpeakeasyEnvironmentMap = createEnvironmentMapClass('Speakeasy.hdr', 'Speakeasy');
