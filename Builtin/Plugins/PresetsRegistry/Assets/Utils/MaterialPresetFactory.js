import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import * as MaterialUtils from './Material.js';

export const CUSTOM_PARAMS_TYPE = {
    'texture': 'texture',
    'baseTexture': 'baseTexture',
    'normalTexture': 'normalTexture',
    'opacityTexture': 'opacityTexture',
    'materialParamsTexture': 'materialParamsTexture',
    'screenTexture': 'screenTexture',
    'depthTexture': 'depthTexture',
    'objectTrackingTexture': 'objectTrackingTexture',
};

const customParamsTypeToFactory = {
    'texture': MaterialUtils.createTexture,
    'baseTexture': MaterialUtils.createBaseTex,
    'normalTexture': MaterialUtils.createNormalTexture,
    'opacityTexture': MaterialUtils.createOpacityTex,
    'materialParamsTexture': MaterialUtils.createMaterialParamsTex,
    'screenTexture': MaterialUtils.createScreenTexture,
    'depthTexture': MaterialUtils.createDepthTexture,
    'objectTrackingTexture': MaterialUtils.createObjectTrackingTexture,
};

export function createMaterialPreset(params, section = 'Materials') {
    class MaterialPreset extends Preset {
        static descriptor() {
            return {
                id: params.descriptor.id,
                name: params.descriptor.name,
                description: params.descriptor.description,
                icon: Editor.Icon.fromFile(params.descriptor.icon),
                section: section,
                entityType: 'Material'
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);

        }
        async createAsync(d) {
            const destination = d ? d : new Editor.Path('');

            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                this.assetManager = model.project.assetManager;
                this.destination = destination;

                const absGraphPath = new Editor.Path(params.graph_path);
                const pass = await Utils.findOrCreateAsync(this.assetManager, absGraphPath, destination);
                const material = this.assetManager.createNativeAsset('Material', params.descriptor.name, destination);
                this.passInfo = material.addPass(pass);

                if (params.custom_defines) {
                    params.custom_defines.forEach(define => {
                        MaterialUtils.addDefine(this.passInfo, define);
                    });
                }

                for (const k in params.pass_info) {
                    this.passInfo[k] = params.pass_info[k];
                }

                for (const k in params.custom_pass_info) {
                    const currentCustomPassInfo = params.custom_pass_info[k];
                    const typeFactory = customParamsTypeToFactory[currentCustomPassInfo.type];
                    this.passInfo[k] = await typeFactory.apply(this, currentCustomPassInfo.params);
                }

                return material;
            } catch (e) {
                console.error(e);
            }

        }
    }

    return MaterialPreset;
}
