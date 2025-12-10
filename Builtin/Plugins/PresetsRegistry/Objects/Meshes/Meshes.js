import { Preset } from 'LensStudio:Preset';

import * as MeshAssets from '../../Assets/Meshes/Meshes.js';
import { PBRMaterialPreset } from '../../Assets/PBRMaterial/PBRMaterial.js';
import { MatteShadowMaterialPreset } from '../../Assets/MatteShadowMaterial/MatteShadowMaterial.js';

function createTransformUniformScale(scale) {
    return new Editor.Transform(new vec3(0, 0, 0), new vec3(0, 0, 0), new vec3(scale, scale, scale));
}

function createMeshObjectClass(name, iconPath, assetMeshPreset, assetMaterialPreset, defaultTransform, meshVisualModifier) {
    class MeshObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.MeshObjectPreset.${name}`,
                name: name,
                description: `Creates object with RenderMeshVisual component using ${assetMeshPreset.descriptor().name} mesh and ${assetMaterialPreset.descriptor().name} material.`,
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: '3D',
                entityType: 'SceneObject'
            };
        }
        async createAsync(destination) {
            try {
                // Create the required assets/settings
                const meshPreset = new assetMeshPreset(this.pluginSystem);
                const meshAsset = await meshPreset.createAsync();

                const materialPreset = new assetMaterialPreset(this.pluginSystem);
                const materialAsset = await materialPreset.createAsync();

                const transform = defaultTransform;

                // Create the RenderMeshVisual
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const scene = model.project.scene;
                destination = scene.addSceneObject(destination);
                const meshVisual = destination.addComponent('RenderMeshVisual');
                meshVisual.mesh = meshAsset;
                meshVisual.materials = [materialAsset];

                if (meshVisualModifier) {
                    meshVisualModifier(meshVisual);
                }

                destination.localTransform = transform;
                destination.name = name;

                return destination;
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }
    }

    return MeshObjectPreset;
}

function setShadowReceiver(meshVisual) {
    meshVisual.meshShadowMode = Editor.Components.MeshShadowMode.Receiver;
}

// Lens Studio 4.x classic presets
export const BoxMeshObjectPreset = createMeshObjectClass('Box', 'Resources/BoxMesh.svg', MeshAssets.BoxMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const SphereMeshObjectPreset = createMeshObjectClass('Sphere', 'Resources/SphereMesh.svg', MeshAssets.SphereMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const PlaneMeshObjectPreset = createMeshObjectClass('Plane', 'Resources/PlaneMesh.svg', MeshAssets.PlaneMeshPreset, PBRMaterialPreset, createTransformUniformScale(100));
export const ShadowPlaneMeshPreset = createMeshObjectClass('Shadow Plane', 'Resources/ShadowPlaneMesh.svg', MeshAssets.PlaneMeshPreset, MatteShadowMaterialPreset, createTransformUniformScale(100), setShadowReceiver);

// Lens Studio 5.0 additional presets
export const CapsuleMeshObjectPreset = createMeshObjectClass('Capsule', '../../Assets/Resources/Mesh.svg', MeshAssets.CapsuleMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const ConeMeshObjectPreset = createMeshObjectClass('Cone', '../../Assets/Resources/Mesh.svg', MeshAssets.ConeMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const CylinderMeshObjectPreset = createMeshObjectClass('Cylinder', '../../Assets/Resources/Mesh.svg', MeshAssets.CylinderMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const DiscMeshObjectPreset = createMeshObjectClass('Disc', '../../Assets/Resources/Mesh.svg', MeshAssets.DiscMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const HeadMeshObjectOnlyPreset = createMeshObjectClass('Head', '../../Assets/Resources/Mesh.svg', MeshAssets.HeadMeshPreset, PBRMaterialPreset, createTransformUniformScale(1));
export const PlatonicMeshObjectPreset = createMeshObjectClass('Platonic', '../../Assets/Resources/Mesh.svg', MeshAssets.PlatonicMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const PyramidMeshObjectPreset = createMeshObjectClass('Pyramid', '../../Assets/Resources/Mesh.svg', MeshAssets.PyramidMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const TorusMeshObjectPreset = createMeshObjectClass('Torus', '../../Assets/Resources/Mesh.svg', MeshAssets.TorusMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
export const TubeMeshObjectPreset = createMeshObjectClass('Tube', '../../Assets/Resources/Mesh.svg', MeshAssets.TubeMeshPreset, PBRMaterialPreset, createTransformUniformScale(10));
