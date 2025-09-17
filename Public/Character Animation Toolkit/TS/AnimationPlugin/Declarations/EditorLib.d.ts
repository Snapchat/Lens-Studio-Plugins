// @ts-nocheck
/**
 * @module Editor Scripting
 * @version 5.0.12
 * For Snapchat Version: 12.86
 */

declare function setInterval(callback: () => void, delayMs: number): Timeout

declare function clearInterval(timeout: Timeout): void

declare function setTimeout(callback: () => void, delayMs: number): Timeout

declare function clearTimeout(timeout: Timeout): void

declare namespace global {
    let secureLocalStorage: SecureLocalStorage

}

interface Base64 {
}
declare namespace Base64 {
    export function encode(data: Uint8Array): string

    export function decode(value: string): Uint8Array


}

interface Editor {
}
declare namespace Editor {
    /**
     * @unreleased
     */
    export function isNull(object: unknown): boolean
}

declare namespace Editor {
    namespace Alignment {
        /**
         * @unreleased
         */
        enum Horizontal {
            /**
             * @unreleased
             */
            Left,
            /**
             * @unreleased
             */
            Center,
            /**
             * @unreleased
             */
            Right
        }

    }

}

declare namespace Editor {
    namespace Alignment {
        /**
         * @unreleased
         */
        enum Vertical {
            /**
             * @unreleased
             */
            Bottom,
            /**
             * @unreleased
             */
            Center,
            /**
             * @unreleased
             */
            Top
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum AntialiasingMode {
            /**
             * @unreleased
             */
            Disabled,
            /**
             * @unreleased
             */
            MSAA
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Asset extends Editor.Model.Entity {
            /**
             * @unreleased

             * @readonly
             */
            name: string

            /**
             * @unreleased

             * @readonly
             */
            fileMeta: Editor.Model.AssetImportMetadata

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum BlendMode {
            /**
             * @unreleased
             */
            Disabled,
            /**
             * @unreleased
             */
            Normal,
            /**
             * @unreleased
             */
            Multiply,
            /**
             * @unreleased
             */
            MultiplyLegacy,
            /**
             * @unreleased
             */
            Add,
            /**
             * @unreleased
             */
            AddLegacy,
            /**
             * @unreleased
             */
            PremultipliedAlpha,
            /**
             * @unreleased
             */
            Glass,
            /**
             * @unreleased
             */
            ColoredGlass,
            /**
             * @unreleased
             */
            AlphaTest,
            /**
             * @unreleased
             */
            AlphaToCoverage,
            /**
             * @unreleased
             */
            Screen,
            /**
             * @unreleased
             */
            Min,
            /**
             * @unreleased
             */
            Max,
            /**
             * @unreleased
             */
            PremultipliedAlphaAuto,
            /**
             * @unreleased
             */
            Custom,
            /**
             * @unreleased
             */
            Darken,
            /**
             * @unreleased
             */
            ColorBurn,
            /**
             * @unreleased
             */
            Lighten,
            /**
             * @unreleased
             */
            ColorDodge,
            /**
             * @unreleased
             */
            Overlay,
            /**
             * @unreleased
             */
            SoftLight,
            /**
             * @unreleased
             */
            HardLight,
            /**
             * @unreleased
             */
            VividLight,
            /**
             * @unreleased
             */
            LinearLight,
            /**
             * @unreleased
             */
            PinLight,
            /**
             * @unreleased
             */
            HardMix,
            /**
             * @unreleased
             */
            Diff,
            /**
             * @unreleased
             */
            Exclusion,
            /**
             * @unreleased
             */
            Subtract,
            /**
             * @unreleased
             */
            Hue,
            /**
             * @unreleased
             */
            Saturation,
            /**
             * @unreleased
             */
            Color,
            /**
             * @unreleased
             */
            Luminosity,
            /**
             * @unreleased
             */
            Average,
            /**
             * @unreleased
             */
            Negation,
            /**
             * @unreleased
             */
            HardReflect,
            /**
             * @unreleased
             */
            HardGlow,
            /**
             * @unreleased
             */
            HardPhoenix,
            /**
             * @unreleased
             */
            Realistic,
            /**
             * @unreleased
             */
            Division,
            /**
             * @unreleased
             */
            Bright,
            /**
             * @unreleased
             */
            Forgray,
            /**
             * @unreleased
             */
            NotBright,
            /**
             * @unreleased
             */
            Intense
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum ClearColorOption {
            /**
             * @unreleased
             */
            None,
            /**
             * @unreleased
             */
            BackgroundTexture,
            /**
             * @unreleased
             */
            CustomColor,
            /**
             * @unreleased
             */
            CustomTexture,
            /**
             * @unreleased
             */
            LegacyClearColorEnable
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum CullMode {
            /**
             * @unreleased
             */
            Front,
            /**
             * @unreleased
             */
            Back,
            /**
             * @unreleased
             */
            FrontAndBack
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum DepthBufferStrategy {
            /**
             * @unreleased
             */
            Auto,
            /**
             * @unreleased
             */
            ForceOff,
            /**
             * @unreleased
             */
            ForceOn
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum DepthFunction {
            /**
             * @unreleased
             */
            Never,
            /**
             * @unreleased
             */
            Less,
            /**
             * @unreleased
             */
            Equal,
            /**
             * @unreleased
             */
            LessEqual,
            /**
             * @unreleased
             */
            Greater,
            /**
             * @unreleased
             */
            NotEqual,
            /**
             * @unreleased
             */
            GreaterEqual,
            /**
             * @unreleased
             */
            Always
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface DeviceCameraTexture extends Editor.Assets.Texture {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface FaceCropTexture extends Editor.Assets.Texture {
            /**
             * @unreleased
             */
            faceCenterMouthWeight: number

            /**
             * @unreleased
             */
            faceIndex: number

            /**
             * @unreleased
             */
            scale: vec2

            /**
             * @unreleased
             */
            inputTexture: Editor.Assets.Texture

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface FaceMesh extends Editor.Assets.RenderMesh {
            /**
             * @unreleased
             */
            faceIndex: number

            /**
             * @unreleased
             */
            faceGeometryEnabled: boolean

            /**
             * @unreleased
             */
            eyeGeometryEnabled: boolean

            /**
             * @unreleased
             */
            eyeCornerGeometryEnabled: boolean

            /**
             * @unreleased
             */
            mouthGeometryEnabled: boolean

            /**
             * @unreleased
             */
            skullGeometryEnabled: boolean

            /**
             * @unreleased
             */
            earGeometryEnabled: boolean

            /**
             * @unreleased
             */
            externalMesh: Editor.Assets.FileMesh

            /**
             * @unreleased
             */
            externalScale: number

            /**
             * @unreleased
             */
            expressionMultiplier: number

            /**
             * @unreleased
             */
            externalMeshMapUV: Editor.Assets.VertexAttribute

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface FileMesh extends Editor.Assets.RenderMesh {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface FileTexture extends Editor.Assets.Texture {
            /**
             * @unreleased

             * @readonly
             */
            width: number

            /**
             * @unreleased

             * @readonly
             */
            height: number

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum FilteringMode {
            /**
             * @unreleased
             */
            Nearest,
            /**
             * @unreleased
             */
            Bilinear,
            /**
             * @unreleased
             */
            Trilinear
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Font extends Editor.Assets.Asset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum FrustumCullMode {
            /**
             * @unreleased
             */
            Auto,
            /**
             * @unreleased
             */
            Extend
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface HairDataAsset extends Editor.Assets.Asset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface HandTracking3DAsset extends Editor.Assets.Object3DAsset {
            /**
             * @unreleased
             */
            handType: Editor.Assets.HandTracking3DHandType

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum HandTracking3DHandType {
            /**
             * @unreleased
             */
            Right,
            /**
             * @unreleased
             */
            Left
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface ImageMarker extends Editor.Assets.MarkerAsset {
            /**
             * @unreleased
             */
            texture: Editor.Assets.FileTexture

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface JavaScriptAsset extends Editor.Assets.ScriptAsset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        interface Location extends Editor.Assets.Asset {
            /**
             * @unreleased
             */
            displayName: string

            /**
             * @unreleased
             */
            locationType: Editor.Assets.LocationType

            /**
             * @unreleased
             */
            locationId: string

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface LocationMesh extends Editor.Assets.RenderMesh {
            /**
             * @unreleased
             */
            location: Editor.Assets.Location

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum LocationType {
            /**
             * @unreleased
             */
            Snap,
            /**
             * @unreleased
             */
            Custom,
            /**
             * @unreleased
             */
            World,
            /**
             * @unreleased
             */
            Tile,
            /**
             * @unreleased
             */
            RelativeTile,
            /**
             * @unreleased
             */
            Proxy,
            /**
             * @unreleased
             */
            NativeAR
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface MarkerAsset extends Editor.Assets.Asset {
            /**
             * @unreleased
             */
            height: number

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Material extends Editor.Assets.Asset {
            /**
             * @unreleased
             */
            addPass(pass: Editor.Assets.Pass): Editor.Assets.PassInfo

            /**
             * @unreleased
             */
            passInfos: Editor.Assets.PassInfo[]

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface MLAsset extends Editor.Assets.Asset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum MSAAStrategy {
            /**
             * @unreleased
             */
            Default,
            /**
             * @unreleased
             */
            OnlyWhenRequired
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Object3DAsset extends Editor.Assets.Asset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface ObjectOwner extends Editor.Assets.Asset {
            /**
             * @unreleased
             */
            addSceneObject(parent: Editor.Model.SceneObject | null): Editor.Model.SceneObject

            /**
             * @unreleased
             */
            createSceneObject(name: string): Editor.Model.SceneObject

            /**
             * @unreleased
             */
            reparentSceneObject(object: Editor.Model.SceneObject, newParent: Editor.Model.SceneObject, position: number): void

            /**
             * @unreleased
             */
            getRootObjectIndex(object: Editor.Model.SceneObject): number

            /**
             * @unreleased
             */
            findComponents(entityType: string): Editor.Components.Component[]

            /**
             * @unreleased

             * @readonly
             */
            sceneObjects: Editor.Model.SceneObject[]

            /**
             * @unreleased

             * @readonly
             */
            rootSceneObjects: Editor.Model.SceneObject[]

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface ObjectPrefab extends Editor.Assets.ObjectOwner {
            /**
             * @unreleased

             * @readonly
             */
            prefabInstances: Editor.Model.SceneObject[]

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface ObjectTrackingTexture extends Editor.Assets.Texture {
            /**
             * @unreleased
             */
            trackingType: Editor.Assets.ObjectTrackingTextureType

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum ObjectTrackingTextureType {
            /**
             * @unreleased
             */
            Hand,
            /**
             * @unreleased
             */
            Nails
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Pass extends Editor.Assets.Asset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface PassInfo extends Editor.Model.Entity {
            /**
             * @unreleased
             */
            getPropertyNames(): string[]

            /**
             * @unreleased
             */
            defines: string[]

            /**
             * @unreleased
             */
            depthWrite: boolean

            /**
             * @unreleased
             */
            depthTest: boolean

            /**
             * @unreleased
             */
            depthFunction: Editor.Assets.DepthFunction

            /**
             * @unreleased
             */
            twoSided: boolean

            /**
             * @unreleased
             */
            cullMode: Editor.Assets.CullMode

            /**
             * @unreleased
             */
            blendMode: Editor.Assets.BlendMode

            /**
             * @unreleased
             */
            polygonOffset: vec2

            /**
             * @unreleased
             */
            frustumCulling: Editor.Assets.FrustumCullMode

            /**
             * @unreleased
             */
            instanceCount: number

            /**
             * @unreleased
             */
            colorMask: vec4

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface RemoteMLAsset extends Editor.Assets.MLAsset {
            /**
             * @unreleased
             */
            deviceDependentAssetId: string

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface RenderMesh extends Editor.Assets.Asset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface RenderTarget extends Editor.Assets.Texture {
            /**
             * @unreleased
             */
            useScreenResolution: boolean

            /**
             * @unreleased
             */
            resolution: Editor.Size

            /**
             * @unreleased
             */
            antialiasingMode: Editor.Assets.AntialiasingMode

            /**
             * @unreleased
             */
            msaaStrategy: Editor.Assets.MSAAStrategy

            /**
             * @unreleased
             */
            depthBuffer: Editor.Assets.DepthBufferStrategy

            /**
             * @unreleased
             */
            clearColorOption: Editor.Assets.ClearColorOption

            /**
             * @unreleased
             */
            inputTexture: Editor.Assets.Texture

            /**
             * @unreleased
             */
            clearColor: vec4

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Sampler {
            /**
             * @unreleased
             */
            filteringMode: Editor.Assets.FilteringMode

            /**
             * @unreleased
             */
            wrapModeU: Editor.Assets.WrapMode

            /**
             * @unreleased
             */
            wrapModeV: Editor.Assets.WrapMode

            /**
             * @unreleased
             */
            wrapModeW: Editor.Assets.WrapMode

            /**
             * @unreleased
             */
            mipmapsEnabled: boolean

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Scene extends Editor.Assets.ObjectOwner {
            /**
             * @unreleased
             */
            instantiatePrefab(prefab: Editor.Assets.ObjectPrefab, parent: Editor.Model.SceneObject): Editor.Model.SceneObject

            /**
             * @unreleased
             */
            renderOutput: Editor.Assets.RenderTarget

            /**
             * @unreleased
             */
            renderPreviewOutput: Editor.Assets.RenderTarget

            /**
             * @unreleased
             */
            renderOverlayOutput: Editor.Assets.RenderTarget

            /**
             * @unreleased

             * @readonly
             */
            mainCamera: Editor.Components.Camera

            /**
             * @unreleased

             * @readonly
             */
            layers: Editor.Model.Layers

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface ScriptAsset extends Editor.Assets.Asset {
            /**
             * @unreleased
             */
            isScriptInputHidden(inputName: string): boolean

            /**
             * @unreleased
             */
            setScriptInputHidden(inputName: string, hidden: boolean): void

            /**
             * @unreleased

             * @readonly
             */
            exportId: Editor.Uuid

            /**
             * @unreleased

             * @readonly
             */
            componentId: Editor.Uuid

            /**
             * @unreleased
             */
            version: Editor.Assets.Version

            /**
             * @unreleased
             */
            description: string

            /**
             * @unreleased
             */
            icon: Editor.Icon

        }

    }

}

declare namespace Editor {
    namespace Assets {
        namespace ScriptTypes {
            /**
             * @unreleased
             */
            enum Visibility {
                /**
                 * @unreleased
                 */
                Locked,
                /**
                 * @unreleased
                 */
                Editable
            }

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface SegmentationTexture extends Editor.Assets.Texture {
            /**
             * @unreleased
             */
            segmentationType: Editor.Assets.SegmentationType

            /**
             * @unreleased
             */
            invertMask: boolean

            /**
             * @unreleased
             */
            feathering: number

            /**
             * @unreleased
             */
            refineEdge: boolean

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum SegmentationType {
            /**
             * @unreleased
             */
            PortraitSegmentation,
            /**
             * @unreleased
             */
            PortraitHair,
            /**
             * @unreleased
             */
            PortraitSkin,
            /**
             * @unreleased
             */
            PortraitShoulder,
            /**
             * @unreleased
             */
            PortraitFace,
            /**
             * @unreleased
             */
            PortraitHead,
            /**
             * @unreleased
             */
            Sky,
            /**
             * @unreleased
             */
            Body,
            /**
             * @unreleased
             */
            UpperGarment,
            /**
             * @unreleased
             */
            LowerGarment,
            /**
             * @unreleased
             */
            FullGarment,
            /**
             * @unreleased
             */
            Footwear
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface SnapcodeMarker extends Editor.Assets.MarkerAsset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        interface Texture extends Editor.Assets.Asset {
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        class TextureParameter {
            /**
             * @unreleased
             */
            constructor(id: Editor.Uuid)

            /**
             * @unreleased
             */
            id: Editor.Uuid

            /**
             * @unreleased
             */
            sampler: Editor.Assets.Sampler

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        class Version {
            /**
             * @unreleased
             */
            constructor(major: number, minor: number, patch: number)

            /**
             * @unreleased
             */
            major: number

            /**
             * @unreleased
             */
            minor: number

            /**
             * @unreleased
             */
            patch: number

        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased
         */
        enum VertexAttribute {
            /**
             * @unreleased
             */
            Position,
            /**
             * @unreleased
             */
            Normal,
            /**
             * @unreleased
             */
            Tangent,
            /**
             * @unreleased
             */
            Color,
            /**
             * @unreleased
             */
            Texcoord0,
            /**
             * @unreleased
             */
            Texcoord1,
            /**
             * @unreleased
             */
            Texcoord2,
            /**
             * @unreleased
             */
            Texcoord3,
            /**
             * @unreleased
             */
            BoneData
        }

    }

}

declare namespace Editor {
    namespace Assets {
        /**
         * @unreleased

         * @description Options for what value is returned when a fetch falls outside the bounds of a texture.

         */
        enum WrapMode {
            /**
             * @unreleased

             * @description Texture coordinates will be clamped between 0 and 1.

             */
            ClampToEdge,
            /**
             * @unreleased

             * @description Between -1 and 1, the texture is mirrored across the 0 axis. The image is repeated outside of that range.

             */
            MirroredRepeat,
            /**
             * @unreleased

             * @description Wrap to the other side of the texture, effectively ignoring the integer part of the number to keep only the fractional part of the texture coordinate.

             */
            Repeat,
            /**
             * @unreleased

             * @description Outside the range of 0 to 1, texture coordinates return the value specified by the borderColor property.

             */
            ClampToBorderColor
        }

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface Buffer {
        /**
         * @unreleased
         */
        toString(): string

        /**
         * @unreleased
         */
        toBytes(): Uint8Array

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface BackgroundSettings extends Editor.Components.EntityStructure {
            /**
             * @unreleased
             */
            enabled: boolean

            /**
             * @unreleased
             */
            fill: Editor.Components.TextFill

            /**
             * @unreleased
             */
            margins: Editor.Rect

            /**
             * @unreleased
             */
            cornerRadius: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        class BarycentricVertex {
            constructor()

            /**
             * @unreleased
             */
            indices: number[]

            /**
             * @unreleased
             */
            weights: number[]

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface BaseMeshVisual extends Editor.Components.Visual {
            /**
             * @unreleased
             */
            stretchMode: Editor.Components.StretchMode

            /**
             * @unreleased
             */
            verticalAlignment: Editor.Alignment.Vertical

            /**
             * @unreleased
             */
            horizontalAlignment: Editor.Alignment.Horizontal

            /**
             * @unreleased
             */
            meshShadowMode: Editor.Components.MeshShadowMode

            /**
             * @unreleased
             */
            shadowColor: vec4

            /**
             * @unreleased
             */
            shadowDensity: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Camera extends Editor.Components.RenderLayerOwner {
            /**
             * @unreleased
             */
            mipmapLevel: number

            /**
             * @unreleased
             */
            renderOrder: number

            /**
             * @unreleased
             */
            size: number

            /**
             * @unreleased
             */
            near: number

            /**
             * @unreleased
             */
            far: number

            /**
             * @unreleased
             */
            fov: number

            /**
             * @unreleased
             */
            clearColor: Editor.Components.CameraClearColor

            /**
             * @unreleased
             */
            clearDepth: Editor.Components.CameraClearDepth

            /**
             * @unreleased
             */
            aspect: number

            /**
             * @unreleased
             */
            cameraType: Editor.Components.CameraType

            /**
             * @unreleased
             */
            depthMode: Editor.Components.CameraDepthBufferMode

            /**
             * @unreleased
             */
            deviceProperty: Editor.Components.CameraDeviceProperty

            /**
             * @unreleased
             */
            aspectPreset: Editor.Components.CameraAspectPreset

            /**
             * @unreleased
             */
            oitLayers: Editor.Components.CameraOitLayers

            /**
             * @unreleased
             */
            renderTarget: Editor.Assets.RenderTarget

            /**
             * @unreleased
             */
            maskTexture: Editor.Assets.Texture

            /**
             * @unreleased
             */
            inputTexture: Editor.Assets.Texture

            /**
             * @unreleased

             * @readonly
             */
            orthographicSize: vec2

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum CameraAspectPreset {
            /**
             * @unreleased
             */
            Specific,
            /**
             * @unreleased
             */
            Custom
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        class CameraClearColor {
            /**
             * @unreleased
             */
            constructor()

            /**
             * @unreleased
             */
            mode: Editor.Components.CameraClearColor.Mode

            /**
             * @unreleased
             */
            color: vec4

        }

    }

}

declare namespace Editor {
    namespace Components {
        namespace CameraClearColor {
            /**
             * @unreleased
             */
            enum Mode {
                /**
                 * @unreleased
                 */
                None,
                /**
                 * @unreleased
                 */
                Background,
                /**
                 * @unreleased
                 */
                Color,
                /**
                 * @unreleased
                 */
                Texture
            }

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        class CameraClearDepth {
            /**
             * @unreleased
             */
            constructor()

            /**
             * @unreleased
             */
            mode: Editor.Components.CameraClearDepth.Mode

            /**
             * @unreleased
             */
            value: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        namespace CameraClearDepth {
            /**
             * @unreleased
             */
            enum Mode {
                /**
                 * @unreleased
                 */
                None,
                /**
                 * @unreleased
                 */
                Custom
            }

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum CameraDepthBufferMode {
            /**
             * @unreleased
             */
            Regular,
            /**
             * @unreleased
             */
            Logarithmic
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum CameraDeviceProperty {
            /**
             * @unreleased
             */
            None,
            /**
             * @unreleased
             */
            Aspect,
            /**
             * @unreleased
             */
            Fov,
            /**
             * @unreleased
             */
            All
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum CameraOitLayers {
            /**
             * @unreleased
             */
            NoOit,
            /**
             * @unreleased
             */
            Layers4,
            /**
             * @unreleased
             */
            Layers4Plus1,
            /**
             * @unreleased
             */
            Layers8
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum CameraType {
            /**
             * @unreleased
             */
            Perspective,
            /**
             * @unreleased
             */
            Orthographic
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Canvas extends Editor.Components.Component {
            /**
             * @unreleased
             */
            unitType: Editor.Components.UnitType

            /**
             * @unreleased
             */
            sortingType: Editor.Components.SortingType

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum CapitalizationOverride {
            /**
             * @unreleased
             */
            None,
            /**
             * @unreleased
             */
            AllUpper,
            /**
             * @unreleased
             */
            AllLower
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface ClothVisual extends Editor.Components.MaterialMeshVisual {
            /**
             * @unreleased
             */
            getVertexBindingsCount(): number

            /**
             * @unreleased
             */
            getVertexBindingAt(pos: number): Editor.Components.ClothVisual.VertexBinding

            /**
             * @unreleased
             */
            setVertexBindingAt(pos: number, value: Editor.Components.ClothVisual.VertexBinding): void

            /**
             * @unreleased
             */
            addVertexBindingAt(value: Editor.Components.ClothVisual.VertexBinding, pos: number): void

            /**
             * @unreleased
             */
            removeVertexBindingAt(pos: number): void

            /**
             * @unreleased
             */
            clearVertexBindings(): void

            /**
             * @unreleased
             */
            moveVertexBinding(origin: number, destination: number): void

            /**
             * @unreleased
             */
            indexOfVertexBinding(value: Editor.Components.ClothVisual.VertexBinding): number

            /**
             * @unreleased
             */
            mesh: Editor.Assets.RenderMesh

            /**
             * @unreleased
             */
            debugModeEnabled: boolean

            /**
             * @unreleased
             */
            frameRate: number

            /**
             * @unreleased
             */
            iterations: number

            /**
             * @unreleased
             */
            updateNormalsEnabled: boolean

            /**
             * @unreleased
             */
            bendMode: Editor.Components.ClothVisual.BendMode

            /**
             * @unreleased
             */
            gravity: vec3

            /**
             * @unreleased
             */
            mass: number

            /**
             * @unreleased
             */
            stretchStiffness: number

            /**
             * @unreleased
             */
            bendStiffness: number

            /**
             * @unreleased
             */
            friction: number

            /**
             * @unreleased
             */
            maxAcceleration: number

            /**
             * @unreleased
             */
            collisionEnabled: boolean

            /**
             * @unreleased
             */
            collisionStiffness: number

            /**
             * @unreleased
             */
            collisionOffset: number

            /**
             * @unreleased
             */
            collisionFriction: number

            /**
             * @unreleased
             */
            vertexBindings: Editor.Components.ClothVisual.VertexBinding[]

        }

    }

}

declare namespace Editor {
    namespace Components {
        namespace ClothVisual {
            /**
             * @unreleased
             */
            enum BendMode {
                /**
                 * @unreleased
                 */
                Isometric,
                /**
                 * @unreleased
                 */
                Linear
            }

        }

    }

}

declare namespace Editor {
    namespace Components {
        namespace ClothVisual {
            /**
             * @unreleased
             */
            interface VertexBinding extends Editor.Model.Entity {
                /**
                 * @unreleased
                 */
                colorMask: vec4

                /**
                 * @unreleased
                 */
                color: vec4

                /**
                 * @unreleased
                 */
                followObject: Editor.Model.SceneObject

            }

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Component extends Editor.Model.Prefabable {
            /**
             * @unreleased
             */
            name: string

            /**
             * @unreleased
             */
            enabled: boolean

            /**
             * @unreleased

             * @readonly
             */
            sceneObject: Editor.Model.SceneObject

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum DecayType {
            /**
             * @unreleased
             */
            None,
            /**
             * @unreleased
             */
            Linear,
            /**
             * @unreleased
             */
            Quadratic
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface DeviceTracking extends Editor.Components.Component {
            /**
             * @unreleased
             */
            deviceTrackingMode: Editor.Components.DeviceTrackingMode

            /**
             * @unreleased
             */
            rotationOptions: Editor.Components.RotationOptions

            /**
             * @unreleased
             */
            surfaceOptions: Editor.Components.SurfaceOptions

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum DeviceTrackingMode {
            /**
             * @unreleased
             */
            Rotation,
            /**
             * @unreleased
             */
            Surface,
            /**
             * @unreleased
             */
            World
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface DropshadowSettings extends Editor.Components.EntityStructure {
            /**
             * @unreleased
             */
            enabled: boolean

            /**
             * @unreleased
             */
            fill: Editor.Components.TextFill

            /**
             * @unreleased
             */
            offset: vec2

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface EntityStructure {
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum EnvmapFromCameraMode {
            /**
             * @unreleased
             */
            Auto,
            /**
             * @unreleased
             */
            Face,
            /**
             * @unreleased
             */
            Surface
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum ExtrudeDirection {
            /**
             * @unreleased
             */
            Forwards,
            /**
             * @unreleased
             */
            Backwards,
            /**
             * @unreleased
             */
            Both
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface EyeColorVisual extends Editor.Components.Visual {
            /**
             * @unreleased
             */
            mainMaterial: Editor.Assets.Material

            /**
             * @unreleased
             */
            faceIndex: number

            /**
             * @unreleased
             */
            rotationEnabled: boolean

            /**
             * @unreleased
             */
            eyeToRender: Editor.Components.EyeToRender

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum EyeToRender {
            /**
             * @unreleased
             */
            Both,
            /**
             * @unreleased
             */
            Left,
            /**
             * @unreleased
             */
            Right
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum FaceInsetRegion {
            /**
             * @unreleased
             */
            LeftEye,
            /**
             * @unreleased
             */
            RightEye,
            /**
             * @unreleased
             */
            Mouth,
            /**
             * @unreleased
             */
            Nose,
            /**
             * @unreleased
             */
            Face,
            /**
             * @unreleased
             */
            Custom
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface FaceInsetVisual extends Editor.Components.Visual {
            /**
             * @unreleased
             */
            mainMaterial: Editor.Assets.Material

            /**
             * @unreleased
             */
            faceIndex: number

            /**
             * @unreleased
             */
            faceRegion: Editor.Components.FaceInsetRegion

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface FaceMaskVisual extends Editor.Components.Visual {
            /**
             * @unreleased
             */
            mainMaterial: Editor.Assets.Material

            /**
             * @unreleased
             */
            textureCoordinates: vec2[]

            /**
             * @unreleased
             */
            maskCoordinates: vec2[]

            /**
             * @unreleased
             */
            faceIndex: number

            /**
             * @unreleased
             */
            originalFaceIndex: number

            /**
             * @unreleased
             */
            useTextureFacePosition: boolean

            /**
             * @unreleased
             */
            useOriginalTexCoords: boolean

            /**
             * @unreleased
             */
            drawMouth: boolean

            /**
             * @unreleased
             */
            enabledLipsFix: boolean

            /**
             * @unreleased
             */
            enabledTeethFix: boolean

            /**
             * @unreleased
             */
            teethFixAlpha: number

            /**
             * @unreleased
             */
            maskOnMouthClosed: Editor.Assets.Texture

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface FaceStretchVisual extends Editor.Components.Visual {
            /**
             * @unreleased
             */
            setFeatureWeight(name: string, weight: number): void

            /**
             * @unreleased
             */
            getFeatureWeight(name: string): number

            /**
             * @unreleased
             */
            getFeatureNames(): string[]

            /**
             * @unreleased
             */
            removeFeature(name: string): void

            /**
             * @unreleased
             */
            updateFeaturePoints(name: string, points: Editor.Components.StretchPoint[]): void

            /**
             * @unreleased
             */
            getFeaturePoints(name: string): Editor.Components.StretchPoint[]

            /**
             * @unreleased
             */
            clearFeatures(): void

            /**
             * @unreleased
             */
            addFeature(name: string): void

            /**
             * @unreleased
             */
            faceIndex: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface HairVisual extends Editor.Components.BaseMeshVisual {
            /**
             * @unreleased
             */
            hairMaterial: Editor.Assets.Material

            /**
             * @unreleased
             */
            fallbackModeEnabled: boolean

            /**
             * @unreleased
             */
            hairData: Editor.Assets.HairDataAsset

            /**
             * @unreleased
             */
            strandNeighborRadius: number

            /**
             * @unreleased
             */
            strandNeighborCosThreshold: number

            /**
             * @unreleased
             */
            strandNeighborLengthThreshold: number

            /**
             * @unreleased
             */
            hairResolution: number

            /**
             * @unreleased
             */
            steppedCutEnabled: boolean

            /**
             * @unreleased
             */
            strandCut: number

            /**
             * @unreleased
             */
            strandWidth: number

            /**
             * @unreleased
             */
            strandTaper: number

            /**
             * @unreleased
             */
            density: number

            /**
             * @unreleased
             */
            noise: number

            /**
             * @unreleased
             */
            clumpDensity: number

            /**
             * @unreleased
             */
            clumpRadius: number

            /**
             * @unreleased
             */
            clumpTipScale: number

            /**
             * @unreleased
             */
            frameRate: number

            /**
             * @unreleased
             */
            stretchLimitEnabled: boolean

            /**
             * @unreleased
             */
            damp: number

            /**
             * @unreleased
             */
            friction: number

            /**
             * @unreleased
             */
            gravity: vec3

            /**
             * @unreleased
             */
            stretchStiffness: number

            /**
             * @unreleased
             */
            bendStiffness: number

            /**
             * @unreleased
             */
            twistStiffness: number

            /**
             * @unreleased
             */
            collapseStiffness: number

            /**
             * @unreleased
             */
            stiffness: number

            /**
             * @unreleased
             */
            collisionEnabled: boolean

            /**
             * @unreleased
             */
            collisionStiffness: number

            /**
             * @unreleased
             */
            collisionOffset: number

            /**
             * @unreleased
             */
            collisionFriction: number

            /**
             * @unreleased
             */
            selfCollisionEnabled: boolean

            /**
             * @unreleased
             */
            selfCollisionStiffness: number

            /**
             * @unreleased
             */
            selfCollisionOffset: number

            /**
             * @unreleased
             */
            selfCollisionFriction: number

            /**
             * @unreleased
             */
            windEnabled: boolean

            /**
             * @unreleased
             */
            windForce: vec3

            /**
             * @unreleased
             */
            debugDrawLoadedStrands: boolean

            /**
             * @unreleased
             */
            debugDrawSimulatedStrands: boolean

            /**
             * @unreleased
             */
            debugModeEnabled: boolean

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Head extends Editor.Components.Component {
            /**
             * @unreleased
             */
            faceIndex: number

            /**
             * @unreleased
             */
            attachmentPoint: Editor.Components.HeadAttachmentPointType

            /**
             * @unreleased
             */
            attachedBarycentricVertex: Editor.Components.BarycentricVertex

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum HeadAttachmentPointType {
            /**
             * @unreleased
             */
            HeadCenter,
            /**
             * @unreleased
             */
            CandideCenter,
            /**
             * @unreleased
             */
            TriangleBarycentric,
            /**
             * @unreleased
             */
            FaceMeshCenter,
            /**
             * @unreleased
             */
            LeftEyeballCenter,
            /**
             * @unreleased
             */
            RightEyeballCenter,
            /**
             * @unreleased
             */
            MouthCenter,
            /**
             * @unreleased
             */
            Chin,
            /**
             * @unreleased
             */
            Forehead,
            /**
             * @unreleased
             */
            LeftForehead,
            /**
             * @unreleased
             */
            RightForehead,
            /**
             * @unreleased
             */
            LeftCheek,
            /**
             * @unreleased
             */
            RightCheek
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum HorizontalOverflow {
            /**
             * @unreleased
             */
            Overflow,
            /**
             * @unreleased
             */
            Truncate,
            /**
             * @unreleased
             */
            Wrap,
            /**
             * @unreleased
             */
            Shrink
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Image extends Editor.Components.MaterialMeshVisual {
            /**
             * @unreleased
             */
            flipX: boolean

            /**
             * @unreleased
             */
            flipY: boolean

            /**
             * @unreleased
             */
            pivot: vec2

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface InteractionComponent extends Editor.Components.Component {
            /**
             * @unreleased
             */
            camera: Editor.Components.Camera

            /**
             * @unreleased
             */
            minimumTouchSize: number

            /**
             * @unreleased
             */
            meshVisuals: Editor.Components.BaseMeshVisual[]

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface LightSource extends Editor.Components.RenderLayerOwner {
            /**
             * @unreleased
             */
            lightType: Editor.Components.LightType

            /**
             * @unreleased
             */
            intensity: number

            /**
             * @unreleased
             */
            innerConeAngle: number

            /**
             * @unreleased
             */
            outerConeAngle: number

            /**
             * @unreleased
             */
            decayType: Editor.Components.DecayType

            /**
             * @unreleased
             */
            decayLimit: boolean

            /**
             * @unreleased
             */
            decayRange: number

            /**
             * @unreleased
             */
            castsShadows: boolean

            /**
             * @unreleased
             */
            shadowDensity: number

            /**
             * @unreleased
             */
            shadowBlurRadius: number

            /**
             * @unreleased
             */
            shadowTextureSize: number

            /**
             * @unreleased
             */
            autoLightSourcePosition: boolean

            /**
             * @unreleased
             */
            autoShadowFrustumSize: boolean

            /**
             * @unreleased
             */
            autoShadowFrustumSizeExtend: number

            /**
             * @unreleased
             */
            shadowFrustumSize: number

            /**
             * @unreleased
             */
            shadowFrustumNearClipPlane: number

            /**
             * @unreleased
             */
            shadowFrustumFarClipPlane: number

            /**
             * @unreleased
             */
            useEnvmapFromCamera: boolean

            /**
             * @unreleased
             */
            envmapFromCameraMode: Editor.Components.EnvmapFromCameraMode

            /**
             * @unreleased
             */
            useEstimation: boolean

            /**
             * @unreleased
             */
            estimationIntensity: number

            /**
             * @unreleased
             */
            estimationSharpness: number

            /**
             * @unreleased
             */
            envmapExposure: number

            /**
             * @unreleased
             */
            envmapRotation: number

            /**
             * @unreleased
             */
            diffuseEnvmapTexture: Editor.Assets.Texture

            /**
             * @unreleased
             */
            specularEnvmapTexture: Editor.Assets.Texture

            /**
             * @unreleased
             */
            color: vec4

            /**
             * @unreleased
             */
            shadowColor: vec4

            /**
             * @unreleased
             */
            dynamicEnvInputTexture: Editor.Assets.Texture

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum LightType {
            /**
             * @unreleased
             */
            Point,
            /**
             * @unreleased
             */
            Directional,
            /**
             * @unreleased
             */
            Spot,
            /**
             * @unreleased
             */
            Ambient,
            /**
             * @unreleased
             */
            EnvMap,
            /**
             * @unreleased
             */
            Estimation
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface LiquifyVisual extends Editor.Components.Visual {
            /**
             * @unreleased
             */
            radius: number

            /**
             * @unreleased
             */
            intensity: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        interface LocatedAtComponent extends Editor.Components.Component {
            /**
             * @unreleased
             */
            position: vec3

            /**
             * @unreleased
             */
            location: Editor.Assets.Location

        }

    }

}

declare namespace Editor {
    namespace Components {
        interface LookAtComponent extends Editor.Components.Component {
            /**
             * @unreleased
             */
            lookAtMode: Editor.Components.LookAtComponent.LookAtMode

            /**
             * @unreleased
             */
            aimVectors: Editor.Components.LookAtComponent.AimVectors

            /**
             * @unreleased
             */
            worldUpVector: Editor.Components.LookAtComponent.WorldUpVector

            /**
             * @unreleased
             */
            target: Editor.Model.SceneObject

            /**
             * @unreleased
             */
            offsetRotation: quat

        }

    }

}

declare namespace Editor {
    namespace Components {
        namespace LookAtComponent {
            /**
             * @unreleased
             */
            enum AimVectors {
                /**
                 * @unreleased
                 */
                XAimYUp,
                /**
                 * @unreleased
                 */
                XAimZUp,
                /**
                 * @unreleased
                 */
                YAimXUp,
                /**
                 * @unreleased
                 */
                YAimZUp,
                /**
                 * @unreleased
                 */
                ZAimXUp,
                /**
                 * @unreleased
                 */
                ZAimYUp,
                /**
                 * @unreleased
                 */
                XAimNegativeYUp,
                /**
                 * @unreleased
                 */
                XAimNegativeZUp,
                /**
                 * @unreleased
                 */
                YAimNegativeXUp,
                /**
                 * @unreleased
                 */
                YAimNegativeZUp,
                /**
                 * @unreleased
                 */
                ZAimNegativeXUp,
                /**
                 * @unreleased
                 */
                ZAimNegativeYUp,
                /**
                 * @unreleased
                 */
                NegativeXAimYUp,
                /**
                 * @unreleased
                 */
                NegativeXAimZUp,
                /**
                 * @unreleased
                 */
                NegativeYAimXUp,
                /**
                 * @unreleased
                 */
                NegativeYAimZUp,
                /**
                 * @unreleased
                 */
                NegativeZAimXUp,
                /**
                 * @unreleased
                 */
                NegativeZAimYUp,
                /**
                 * @unreleased
                 */
                NegativeXAimNegativeYUp,
                /**
                 * @unreleased
                 */
                NegativeXAimNegativeZUp,
                /**
                 * @unreleased
                 */
                NegativeYAimNegativeXUp,
                /**
                 * @unreleased
                 */
                NegativeYAimNegativeZUp,
                /**
                 * @unreleased
                 */
                NegativeZAimNegativeXUp,
                /**
                 * @unreleased
                 */
                NegativeZAimNegativeYUp
            }

        }

    }

}

declare namespace Editor {
    namespace Components {
        namespace LookAtComponent {
            /**
             * @unreleased
             */
            enum LookAtMode {
                /**
                 * @unreleased
                 */
                LookAtPoint,
                /**
                 * @unreleased
                 */
                LookAtDirection
            }

        }

    }

}

declare namespace Editor {
    namespace Components {
        namespace LookAtComponent {
            /**
             * @unreleased
             */
            enum WorldUpVector {
                /**
                 * @unreleased
                 */
                SceneX,
                /**
                 * @unreleased
                 */
                SceneY,
                /**
                 * @unreleased
                 */
                SceneZ,
                /**
                 * @unreleased
                 */
                TargetX,
                /**
                 * @unreleased
                 */
                TargetY,
                /**
                 * @unreleased
                 */
                TargetZ,
                /**
                 * @unreleased
                 */
                ObjectX,
                /**
                 * @unreleased
                 */
                ObjectY,
                /**
                 * @unreleased
                 */
                ObjectZ
            }

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface ManipulateComponent extends Editor.Components.Component {
            /**
             * @unreleased
             */
            scale: boolean

            /**
             * @unreleased
             */
            drag: boolean

            /**
             * @unreleased
             */
            rotate: boolean

            /**
             * @unreleased
             */
            minDistance: number

            /**
             * @unreleased
             */
            maxDistance: number

            /**
             * @unreleased
             */
            minScale: number

            /**
             * @unreleased
             */
            maxScale: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface MarkerTrackingComponent extends Editor.Components.Component {
            /**
             * @unreleased
             */
            marker: Editor.Assets.MarkerAsset

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface MaterialMeshVisual extends Editor.Components.BaseMeshVisual {
            /**
             * @unreleased
             */
            getMaterialsCount(): number

            /**
             * @unreleased
             */
            getMaterialAt(pos: number): Editor.Assets.Material

            /**
             * @unreleased
             */
            setMaterialAt(pos: number, value: Editor.Assets.Material): void

            /**
             * @unreleased
             */
            addMaterialAt(value: Editor.Assets.Material, pos: number): void

            /**
             * @unreleased
             */
            removeMaterialAt(pos: number): void

            /**
             * @unreleased
             */
            clearMaterials(): void

            /**
             * @unreleased
             */
            moveMaterial(origin: number, destination: number): void

            /**
             * @unreleased
             */
            indexOfMaterial(value: Editor.Assets.Material): number

            /**
             * @unreleased
             */
            materials: Editor.Assets.Material[]

            /**
             * @unreleased
             */
            mainMaterial: Editor.Assets.Material

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum MeshShadowMode {
            /**
             * @unreleased
             */
            None,
            /**
             * @unreleased
             */
            Caster,
            /**
             * @unreleased
             */
            Receiver
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface ObjectTracking extends Editor.Components.Component {
            /**
             * @unreleased
             */
            trackingType: Editor.Components.ObjectTrackingType

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface ObjectTracking3D extends Editor.Components.Component {
            /**
             * @unreleased
             */
            trackingAsset: Editor.Assets.Object3DAsset

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum ObjectTrackingType {
            /**
             * @unreleased
             */
            Cat,
            /**
             * @unreleased
             */
            Dog,
            /**
             * @unreleased
             */
            Pet,
            /**
             * @unreleased
             */
            Hand,
            /**
             * @unreleased
             */
            Nails,
            /**
             * @unreleased
             */
            Shoulder,
            /**
             * @unreleased
             */
            UpperBody,
            /**
             * @unreleased
             */
            FullBody
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface OutlineSettings extends Editor.Components.EntityStructure {
            /**
             * @unreleased
             */
            enabled: boolean

            /**
             * @unreleased
             */
            fill: Editor.Components.TextFill

            /**
             * @unreleased
             */
            size: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        interface PostEffectVisual extends Editor.Components.Visual {
            mainMaterial: Editor.Assets.Material

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface RectangleSetter extends Editor.Components.Component {
            /**
             * @unreleased
             */
            cropTexture: Editor.Assets.Texture

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface RenderLayerOwner extends Editor.Components.Component {
            /**
             * @unreleased
             */
            renderLayer: Editor.Model.LayerSet

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface RenderMeshVisual extends Editor.Components.MaterialMeshVisual {
            /**
             * @unreleased
             */
            mesh: Editor.Assets.RenderMesh

            /**
             * @unreleased
             */
            blendShapesEnabled: boolean

            /**
             * @unreleased
             */
            blendNormals: boolean

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface RetouchVisual extends Editor.Components.Visual {
            /**
             * @unreleased
             */
            faceIndex: number

            /**
             * @unreleased
             */
            softSkinIntensity: number

            /**
             * @unreleased
             */
            teethWhiteningIntensity: number

            /**
             * @unreleased
             */
            sharpenEyeIntensity: number

            /**
             * @unreleased
             */
            eyeWhiteningIntensity: number

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        class RotationOptions {
            constructor()

            /**
             * @unreleased
             */
            invertRotation: boolean

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface ScreenRegionComponent extends Editor.Components.Component {
            /**
             * @unreleased
             */
            region: Editor.Components.ScreenRegionType

            /**
             * @unreleased
             */
            resizeWithKeyboard: boolean

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum ScreenRegionType {
            /**
             * @unreleased
             */
            FullFrame,
            /**
             * @unreleased
             */
            Capture,
            /**
             * @unreleased
             */
            Preview,
            /**
             * @unreleased
             */
            SafeRender,
            /**
             * @unreleased
             */
            RoundButton
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface ScreenTransform extends Editor.Components.Component {
            /**
             * @unreleased
             */
            constraints: Editor.Components.ScreenTransformConstraints

            /**
             * @unreleased
             */
            anchor: Editor.Rect

            /**
             * @unreleased
             */
            offset: Editor.Rect

            /**
             * @unreleased
             */
            pivot: vec2

            /**
             * @unreleased
             */
            transform: Editor.Transform

            /**
             * @unreleased
             */
            advanced: boolean

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        class ScreenTransformConstraints {
            /**
             * @unreleased
             */
            constructor()

            /**
             * @unreleased
             */
            fixedHeight: boolean

            /**
             * @unreleased
             */
            fixedWidth: boolean

            /**
             * @unreleased
             */
            pinToBottom: boolean

            /**
             * @unreleased
             */
            pinToLeft: boolean

            /**
             * @unreleased
             */
            pinToRight: boolean

            /**
             * @unreleased
             */
            pinToTop: boolean

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface ScriptComponent extends Editor.Components.Component {
            /**
             * @unreleased
             */
            scriptAsset: Editor.Assets.ScriptAsset

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum SortingType {
            /**
             * @unreleased
             */
            Hierarchy,
            /**
             * @unreleased
             */
            Depth
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum StretchMode {
            /**
             * @unreleased
             */
            Fill,
            /**
             * @unreleased
             */
            Fit,
            /**
             * @unreleased
             */
            Stretch,
            /**
             * @unreleased
             */
            FitWidth,
            /**
             * @unreleased
             */
            FitHeight,
            /**
             * @unreleased
             */
            FillAndCut
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        class StretchPoint {
            /**
             * @unreleased
             */
            constructor()

            /**
             * @unreleased
             */
            index: number

            /**
             * @unreleased
             */
            weight: number

            /**
             * @unreleased
             */
            delta: vec3

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        class SurfaceOptions {
            constructor()

            /**
             * @unreleased
             */
            enhanceWithNativeAR: boolean

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Text extends Editor.Components.BaseMeshVisual {
            /**
             * @unreleased
             */
            text: string

            /**
             * @unreleased
             */
            font: Editor.Assets.Font

            /**
             * @unreleased
             */
            size: number

            /**
             * @unreleased
             */
            verticalOverflow: Editor.Components.VerticalOverflow

            /**
             * @unreleased
             */
            horizontalOverflow: Editor.Components.HorizontalOverflow

            /**
             * @unreleased
             */
            textFill: Editor.Components.TextFill

            /**
             * @unreleased
             */
            dropshadowSettings: Editor.Components.DropshadowSettings

            /**
             * @unreleased
             */
            outlineSettings: Editor.Components.OutlineSettings

            /**
             * @unreleased
             */
            backgroundSettings: Editor.Components.BackgroundSettings

            /**
             * @unreleased
             */
            advancedLayout: Editor.Components.TextAdvancedLayout

            /**
             * @unreleased
             */
            sizeToFit: boolean

            /**
             * @unreleased
             */
            letterSpacing: number

            /**
             * @unreleased
             */
            lineSpacing: number

            /**
             * @unreleased
             */
            depthTest: boolean

            /**
             * @unreleased
             */
            worldSpaceRect: Editor.Rect

            /**
             * @unreleased
             */
            capitalizationOverride: Editor.Components.CapitalizationOverride

            /**
             * @unreleased
             */
            editable: boolean

            /**
             * @unreleased
             */
            showEditingPreview: boolean

            /**
             * @unreleased
             */
            touchHandler: Editor.Components.InteractionComponent

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Text3D extends Editor.Components.MaterialMeshVisual {
            /**
             * @unreleased
             */
            text: string

            /**
             * @unreleased
             */
            font: Editor.Assets.Font

            /**
             * @unreleased
             */
            size: number

            /**
             * @unreleased
             */
            extrusionDepth: number

            /**
             * @unreleased
             */
            extrudeDirection: Editor.Components.ExtrudeDirection

            /**
             * @unreleased
             */
            verticalOverflow: Editor.Components.VerticalOverflow

            /**
             * @unreleased
             */
            horizontalOverflow: Editor.Components.HorizontalOverflow

            /**
             * @unreleased
             */
            sizeToFit: boolean

            /**
             * @unreleased
             */
            letterSpacing: number

            /**
             * @unreleased
             */
            lineSpacing: number

            /**
             * @unreleased
             */
            worldSpaceRect: Editor.Rect

            /**
             * @unreleased
             */
            capitalizationOverride: Editor.Components.CapitalizationOverride

            /**
             * @unreleased
             */
            editable: boolean

            /**
             * @unreleased
             */
            showEditingPreview: boolean

            /**
             * @unreleased
             */
            touchHandler: Editor.Components.InteractionComponent

            /**
             * @unreleased
             */
            advancedLayout: Editor.Components.TextAdvancedLayout

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface TextAdvancedLayout extends Editor.Components.EntityStructure {
            /**
             * @unreleased
             */
            extentsTarget: Editor.Components.ScreenTransform

            /**
             * @unreleased
             */
            letterSpacing: number

            /**
             * @unreleased
             */
            lineSpacing: number

            /**
             * @unreleased
             */
            capitalizationOverride: Editor.Components.CapitalizationOverride

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface TextFill extends Editor.Components.EntityStructure {
            /**
             * @unreleased
             */
            mode: Editor.Components.TextFillMode

            /**
             * @unreleased
             */
            color: vec4

            /**
             * @unreleased
             */
            texture: Editor.Assets.Texture

        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum TextFillMode {
            /**
             * @unreleased
             */
            Solid,
            /**
             * @unreleased
             */
            Texture
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum UnitType {
            /**
             * @unreleased
             */
            World,
            /**
             * @unreleased
             */
            Pixels,
            /**
             * @unreleased
             */
            Points
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        enum VerticalOverflow {
            /**
             * @unreleased
             */
            Overflow,
            /**
             * @unreleased
             */
            Truncate,
            /**
             * @unreleased
             */
            Shrink
        }

    }

}

declare namespace Editor {
    namespace Components {
        /**
         * @unreleased
         */
        interface Visual extends Editor.Components.Component {
            /**
             * @unreleased
             */
            renderOrder: number

        }

    }

}

declare namespace Editor {
    interface Compression {
    }

}

declare namespace Editor {
    namespace Compression {
        interface Zip {
        }

    }

}
declare namespace Editor {
    namespace Compression {
        namespace Zip {
            /**
             * @unreleased
             */
            export function unpack(src: Editor.Path, destDir: Editor.Path): void

            /**
             * @unreleased
             */
            export function pack(src: Editor.Path, destFile: Editor.Path): void


        }

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface Connection {
        /**
         * @unreleased
         */
        disconnect(): void

        /**
         * @unreleased

         * @readonly
         */
        isConnected: boolean

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    class ContextAction {
        /**
         * @unreleased
         */
        constructor()

        /**
         * @unreleased
         */
        id: string

        /**
         * @unreleased
         */
        caption: string

        /**
         * @unreleased
         */
        apply: () => void

        /**
         * @unreleased
         */
        description: string

        /**
         * @unreleased
         */
        group: string[]

    }

}

declare namespace Editor {
    interface Dock {
    }

}

declare namespace Editor {
    namespace Dock {
        /**
         * @unreleased
         */
        interface IDockManager extends ScriptObject {
            /**
             * @unreleased
             */
            read(reader: import('LensStudio:Serialization').IReader): void

            /**
             * @unreleased
             */
            write(writer: import('LensStudio:Serialization').IWriter): void

        }

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface IAuthorization extends ScriptObject {
        /**
         * @unreleased
         */
        authorize(): void

        /**
         * @unreleased

         * @readonly
         */
        isAuthorized: boolean

        /**
         * @unreleased

         * @readonly
         */
        onAuthorizationChange: any

    }

}
declare namespace Editor {
    namespace IAuthorization {
        let interfaceID: string


    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface Icon {
    }

}
declare namespace Editor {
    namespace Icon {
        /**
         * @unreleased
         */
        export function fromSvgData(buffer: string): Editor.Icon

        /**
         * @unreleased
         */
        export function fromFile(absoluteFilePath: Editor.Path): Editor.Icon


    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface IContext extends ScriptObject {
    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface IContextActionRegistry extends ScriptObject {
        /**
         * @unreleased
         */
        registerAction(action: (arg1: Editor.IContext) => Editor): Editor.ScopeGuard

    }

}
declare namespace Editor {
    namespace IContextActionRegistry {
        /**
         * @unreleased
         */
        let interfaceID: string


    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface IEntityPicker extends ScriptObject {
        /**
         * @unreleased
         */
        requestPicker(entityType: string, callback: (arg1: Editor.Model.Entity) => void): void

    }

}
declare namespace Editor {
    namespace IEntityPicker {
        /**
         * @unreleased
         */
        let interfaceID: string


    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface InstallableContentActionsComponent extends ScriptObject {
        /**
         * @unreleased
         */
        exportScript(scriptAsset: Editor.Assets.ScriptAsset, path: Editor.Path, visibility: Editor.Assets.ScriptTypes.Visibility, exportDependency: Editor.Model.ExportDependency): void

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface InstallableContentRegistryComponent extends ScriptObject {
        /**
         * @unreleased
         */
        getTypeById(uid: Editor.Uuid, entityBaseType: Editor.Model.EntityBaseType): string

        /**
         * @unreleased
         */
        getTypeByVersion(uid: Editor.Uuid, version: Editor.Assets.Version, entityBaseType: Editor.Model.EntityBaseType): string

        /**
         * @unreleased
         */
        getTypeByName(name: string, entityBaseType: Editor.Model.EntityBaseType): string

    }

}

declare namespace Editor {
    interface Model {
    }

}

declare namespace Editor {
    namespace Model {
        interface AssetContext extends Editor.IContext {
            /**
             * @readonly
             */
            selection: Editor.Model.AssetContext.Item[]

        }

    }

}

declare namespace Editor {
    namespace Model {
        namespace AssetContext {
            interface Item {
                /**
                 * @readonly
                 */
                path: Editor.Path

                /**
                 * @readonly
                 */
                asset: Editor.Assets.Asset

            }

        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface AssetImportMetadata extends Editor.Model.Entity {
            /**
             * @unreleased

             * @readonly
             */
            primaryAsset: Editor.Assets.Asset

            /**
             * @unreleased

             * @readonly
             */
            assets: Editor.Assets.Asset[]

            /**
             * @unreleased

             * @readonly
             */
            sourcePath: Editor.Path

        }

    }

}

declare namespace Editor {
    namespace Model {
        interface AssetManager extends ScriptObject {
            importExternalFileAsync(absoluteSourcePath: Editor.Path, relativeDestinationDir: Editor.Path, resultType: Editor.Model.ResultType): Promise<Editor.Model.ImportResult>

            importExternalFile(absoluteSourcePath: Editor.Path, relativeDestinationDir: Editor.Path, resultType: Editor.Model.ResultType): Editor.Model.ImportResult

            findImportedCopy(absoluteSourcePath: Editor.Path): Editor.Model.AssetImportMetadata

            getFileMeta(relativeFilePath: Editor.Path): Editor.Model.AssetImportMetadata

            remove(relativeFilePath: Editor.Path): void

            createNativeAsset(assetType: string, baseName: string, relativeDestinationDir: Editor.Path): Editor.Assets.Asset

            saveAsPrefab(sceneObject: Editor.Model.SceneObject, relativeDestinationDir: Editor.Path): Editor.Assets.ObjectPrefab

            move(fileMeta: Editor.Model.AssetImportMetadata, relativeDestinationDir: Editor.Path): void

            /**
             * @readonly
             */
            assets: Editor.Assets.Asset[]

            /**
             * @readonly
             */
            assetsDirectory: Editor.Path

            /**
             * @readonly
             */
            cacheDirectory: Editor.Path

        }

    }

}

declare namespace Editor {
    namespace Model {
        interface BaseChangesStream extends ScriptObject {
            executeAsGroup(name: string, change: () => void): void

        }

    }

}

declare namespace Editor {
    namespace Model {
        interface ChangesStream extends Editor.Model.BaseChangesStream {
        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface Entity extends ScriptObject {
            /**
             * @unreleased
             */
            remapReferences(referenceMapping: Object): void

            /**
             * @unreleased
             */
            getOwnedEntities(): Editor.Model.Entity[]

            /**
             * @unreleased
             */
            getDirectlyReferencedEntities(): Editor.Model.Entity[]

            /**
             * @unreleased

             * @readonly
             */
            id: Editor.Uuid

            /**
             * @unreleased

             * @readonly
             */
            type: string

        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        enum EntityBaseType {
            /**
             * @unreleased
             */
            Asset,
            /**
             * @unreleased
             */
            Component
        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        class EntityPrototypeData {
            /**
             * @unreleased
             */
            constructor()

            /**
             * @unreleased
             */
            entityType: string

            /**
             * @unreleased
             */
            caption: string

            /**
             * @unreleased
             */
            section: string

            /**
             * @unreleased
             */
            baseEntityType: string

            /**
             * @unreleased
             */
            creator: (any | any)

            /**
             * @unreleased
             */
            icon: Editor.Icon

        }

    }

}

declare namespace Editor {
    namespace Model {
        enum ExportDependency {
            WithoutDependencies,
            WithDependencies
        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface IEntityPrototypeRegistry extends ScriptObject {
            /**
             * @unreleased
             */
            registerEntityPrototype(prototypeData: Editor.Model.EntityPrototypeData): Editor.ScopeGuard

            /**
             * @unreleased
             */
            getEntityTypes(baseType: string, filter: (arg1: string) => any): string[]

            /**
             * @unreleased
             */
            createEntity(entityType: string, arg: (Editor.Path | Editor.Model.Entity)): Editor.Model.Entity

            /**
             * @unreleased
             */
            getIconForType(type: string): Editor.Icon

            /**
             * @unreleased
             */
            getCaptionForType(type: string): string

        }

    }

}
declare namespace Editor {
    namespace Model {
        namespace IEntityPrototypeRegistry {
            /**
             * @unreleased
             */
            let interfaceID: string


        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface IEntityRegistry extends ScriptObject {
            /**
             * @unreleased
             */
            getMeta(entityType: string): Editor.Model.Meta

        }

    }

}
declare namespace Editor {
    namespace Model {
        namespace IEntityRegistry {
            /**
             * @unreleased
             */
            let interfaceID: string


        }

    }

}

declare namespace Editor {
    namespace Model {
        interface IModel extends ScriptObject {
            setEmptyProject(): void

            setDefaultProject(): void

            openProject(path: Editor.Path): void

            /**
             * @readonly
             */
            project: Editor.Model.Project

        }

    }

}
declare namespace Editor {
    namespace Model {
        namespace IModel {
            let interfaceID: string


        }

    }

}

declare namespace Editor {
    namespace Model {
        interface ImportResult {
            /**
             * @readonly
             */
            files: Editor.Model.AssetImportMetadata[]

            /**
             * @readonly
             */
            path: Editor.Path

            /**
             * @readonly
             */
            primary: Editor.Assets.Asset

        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface Layer {
            /**
             * @unreleased
             */
            id: Editor.Model.LayerId

            /**
             * @unreleased
             */
            name: string

        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        class LayerId {
            /**
             * @unreleased
             */
            constructor(value: number)

        }

    }

}
declare namespace Editor {
    namespace Model {
        namespace LayerId {
            /**
             * @unreleased
             */
            export function forEach(predicate: (arg1: Editor.Model.LayerId) => void): void

            /**
             * @unreleased
             */
            export function forEachUser(predicate: (arg1: Editor.Model.LayerId) => void): void

            /**
             * @unreleased
             */
            let Default: Editor.Model.LayerId

            /**
             * @unreleased
             */
            let Ortho: Editor.Model.LayerId

            /**
             * @unreleased
             */
            let MinUser: Editor.Model.LayerId

            /**
             * @unreleased
             */
            let MaxUser: Editor.Model.LayerId


        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface Layers extends Editor.Model.Entity {
            /**
             * @unreleased
             */
            contains(layerId: Editor.Model.LayerId): boolean

            /**
             * @unreleased
             */
            add(layerId: Editor.Model.LayerId): Editor.Model.Layer

            /**
             * @unreleased
             */
            remove(layerId: Editor.Model.LayerId): void

            /**
             * @unreleased
             */
            find(layerId: Editor.Model.LayerId): Editor.Model.Layer

            /**
             * @unreleased

             * @readonly
             */
            canAdd: boolean

            /**
             * @unreleased

             * @readonly
             */
            combinedIds: Editor.Model.LayerSet

        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface LayerSet {
            /**
             * @unreleased
             */
            contains(other: Editor.Model.LayerSet): boolean

            /**
             * @unreleased
             */
            isEmpty(): boolean

            /**
             * @unreleased
             */
            union(other: Editor.Model.LayerSet): Editor.Model.LayerSet

            /**
             * @unreleased
             */
            intersect(other: Editor.Model.LayerSet): Editor.Model.LayerSet

            /**
             * @unreleased
             */
            except(other: Editor.Model.LayerSet): Editor.Model.LayerSet

            /**
             * @unreleased
             */
            toArray(): Editor.Model.LayerId[]

        }

    }

}
declare namespace Editor {
    namespace Model {
        namespace LayerSet {
            /**
             * @unreleased
             */
            export function PredefinedIds(): Editor.Model.LayerSet

            /**
             * @unreleased
             */
            export function fromBit(bit: number): Editor.Model.LayerSet

            /**
             * @unreleased
             */
            export function fromId(layerId: Editor.Model.LayerId): Editor.Model.LayerSet

            /**
             * @unreleased
             */
            export function fromMask(mask: number): Editor.Model.LayerSet


        }

    }

}

declare namespace Editor {
    namespace Model {
        enum LensActivationCamera {
            Front,
            Rear
        }

    }

}

declare namespace Editor {
    namespace Model {
        enum LensApplicability {
            Front,
            Back,
            SpectaclesV3,
            SpectaclesV4
        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface Meta extends ScriptObject {
            /**
             * @unreleased

             * @readonly
             */
            isAbstract: boolean

        }

    }

}

declare namespace Editor {
    namespace Model {
        interface MetaInfo {
            setIcon(externalPath: Editor.Path): void

            lensName: string

            /**
             * @readonly
             */
            isIconSet: boolean

            /**
             * @readonly
             */
            iconPath: Editor.Path

            lensApplicability: Editor.Model.LensApplicability[]

            activationCamera: Editor.Model.LensActivationCamera

        }

    }

}
declare namespace Editor {
    namespace Model {
        namespace MetaInfo {
            export function isLensNameValid(lensName: string): boolean


        }

    }

}

declare namespace Editor {
    namespace Model {
        interface ObjectContext extends Editor.IContext {
            /**
             * @readonly
             */
            selection: Editor.Model.SceneObject[]

        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface Prefabable extends Editor.Model.Entity {
        }

    }

}

declare namespace Editor {
    namespace Model {
        interface Project extends ScriptObject {
            saveTo(absoluteFilePath: Editor.Path): void

            save(): void

            /**
             * @readonly
             */
            scene: Editor.Assets.Scene

            /**
             * @readonly
             */
            assetManager: Editor.Model.AssetManager

            /**
             * @readonly
             */
            history: Editor.Model.ChangesStream

            /**
             * @readonly
             */
            projectFile: Editor.Path

            /**
             * @readonly
             */
            projectDirectory: Editor.Path

            /**
             * @readonly
             */
            cacheDirectory: Editor.Path

            /**
             * @readonly
             */
            assetsDirectory: Editor.Path

            metaInfo: Editor.Model.MetaInfo

        }

    }

}

declare namespace Editor {
    namespace Model {
        enum ResultType {
            Packed,
            Unpacked,
            Auto
        }

    }

}

declare namespace Editor {
    namespace Model {
        /**
         * @unreleased
         */
        interface SceneObject extends Editor.Model.Prefabable {
            /**
             * @unreleased
             */
            getParent(): Editor.Model.SceneObject

            /**
             * @unreleased
             */
            setParent(newParent: Editor.Model.SceneObject, position: number): void

            /**
             * @unreleased
             */
            destroy(): void

            /**
             * @unreleased
             */
            removeChild(child: Editor.Model.SceneObject): void

            /**
             * @unreleased
             */
            moveChild(child: Editor.Model.SceneObject, destination: number): void

            /**
             * @unreleased
             */
            addComponent(entityType: string): Editor.Components.Component

            /**
             * @unreleased
             */
            getComponent<K extends keyof ComponentNameMap>(entityType: string): ComponentNameMap[K]

            /**
             * @unreleased
             */
            getComponents<K extends keyof ComponentNameMap>(entityType: string): ComponentNameMap[K][]

            /**
             * @unreleased
             */
            removeComponent(entityType: string): boolean

            /**
             * @unreleased
             */
            getChildrenCount(): number

            /**
             * @unreleased
             */
            getChildAt(pos: number): Editor.Model.SceneObject

            /**
             * @unreleased
             */
            setChildAt(pos: number, value: Editor.Model.SceneObject): void

            /**
             * @unreleased
             */
            addChildAt(value: Editor.Model.SceneObject, pos: number): void

            /**
             * @unreleased
             */
            removeChildAt(pos: number): void

            /**
             * @unreleased
             */
            clearChildren(): void

            /**
             * @unreleased
             */
            indexOfChild(value: Editor.Model.SceneObject): number

            /**
             * @unreleased
             */
            getComponentsCount(): number

            /**
             * @unreleased
             */
            getComponentAt(pos: number): Editor.Components.Component

            /**
             * @unreleased
             */
            setComponentAt(pos: number, value: Editor.Components.Component): void

            /**
             * @unreleased
             */
            addComponentAt(value: Editor.Components.Component, pos: number): void

            /**
             * @unreleased
             */
            removeComponentAt(pos: number): void

            /**
             * @unreleased
             */
            clearComponents(): void

            /**
             * @unreleased
             */
            moveComponent(origin: number, destination: number): void

            /**
             * @unreleased
             */
            indexOfComponent(value: Editor.Components.Component): number

            /**
             * @unreleased
             */
            name: string

            /**
             * @unreleased
             */
            enabled: boolean

            /**
             * @unreleased
             */
            layer: Editor.Model.LayerId

            /**
             * @unreleased
             */
            layers: Editor.Model.LayerSet

            /**
             * @unreleased
             */
            localTransform: Editor.Transform

            /**
             * @unreleased
             */
            worldTransform: Editor.Transform

            /**
             * @unreleased

             * @readonly
             */
            topOwner: Editor.Assets.ObjectOwner

            /**
             * @unreleased

             * @readonly
             */
            hasVisuals: boolean

            /**
             * @unreleased
             */
            children: Editor.Model.SceneObject[]

            /**
             * @unreleased
             */
            components: Editor.Components.Component[]

        }

    }

}
declare namespace Editor {
    namespace Model {
        namespace SceneObject {
            /**
             * @unreleased
             */
            export function topLevel(sceneObjects: Editor.Model.SceneObject[]): Editor.Model.SceneObject[]

            /**
             * @unreleased
             */
            export function commonParent(sceneObjects: Editor.Model.SceneObject[]): Editor.Model.SceneObject


        }

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    class Path {
        /**
         * @unreleased
         */
        constructor(str: string)

        /**
         * @unreleased
         */
        hasExtension(extension: string): boolean

        /**
         * @unreleased
         */
        relative(rootPath: Editor.Path): Editor.Path

        /**
         * @unreleased
         */
        isInside(directory: Editor.Path): boolean

        /**
         * @unreleased
         */
        renameFileBase(name: string): Editor.Path

        /**
         * @unreleased
         */
        replaceExtension(newExtension: string): Editor.Path

        /**
         * @unreleased
         */
        appended(path: Editor.Path): Editor.Path

        /**
         * @unreleased
         */
        append(path: Editor.Path): void

        /**
         * @unreleased
         */
        toString(): string

        /**
         * @unreleased

         * @readonly
         */
        fileName: Editor.Path

        /**
         * @unreleased

         * @readonly
         */
        parent: Editor.Path

        /**
         * @unreleased

         * @readonly
         */
        directory: Editor.Path

        /**
         * @unreleased

         * @readonly
         */
        fileNameBase: string

        /**
         * @unreleased

         * @readonly
         */
        extension: string

        /**
         * @unreleased

         * @readonly
         */
        isExtensionText: boolean

        /**
         * @unreleased

         * @readonly
         */
        isExtensionImage: boolean

        /**
         * @unreleased

         * @readonly
         */
        isExtensionVideo: boolean

        /**
         * @unreleased

         * @readonly
         */
        empty: boolean

    }

}

declare namespace Editor {
    interface PluginRefManager extends ScriptObject {
    }

}

declare namespace Editor {
    interface PluginSystem extends ScriptObject {
        findInterface(object: unknown): ScriptObject

        /**
         * @readonly
         */
        refManager: Editor.PluginRefManager

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    class Point {
        /**
         * @unreleased
         */
        constructor()

        /**
         * @unreleased
         */
        x: number

        /**
         * @unreleased
         */
        y: number

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    class Rect {
        /**
         * @unreleased
         */
        constructor()

        /**
         * @unreleased
         */
        getSize(): vec2

        /**
         * @unreleased
         */
        setSize(size: vec2): void

        /**
         * @unreleased
         */
        getCenter(): vec2

        /**
         * @unreleased
         */
        setCenter(center: vec2): void

        /**
         * @unreleased
         */
        toVec4(): vec4

        /**
         * @unreleased
         */
        leftBottom: vec2

        /**
         * @unreleased
         */
        rightTop: vec2

        /**
         * @unreleased
         */
        left: number

        /**
         * @unreleased
         */
        right: number

        /**
         * @unreleased
         */
        top: number

        /**
         * @unreleased
         */
        bottom: number

    }

}
declare namespace Editor {
    namespace Rect {
        /**
         * @unreleased
         */
        export function fromMinMax(min: vec2, max: vec2): Editor.Rect

        /**
         * @unreleased
         */
        export function create(left: number, right: number, bottom: number, top: number): Editor.Rect


    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface ScopeGuard extends ScriptObject {
        /**
         * @unreleased
         */
        dispose(): void

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    class Size {
        /**
         * @unreleased
         */
        constructor(x: number, y: number)

        /**
         * @unreleased
         */
        equal(value: Editor.Size): boolean

        /**
         * @unreleased
         */
        isEmpty(): boolean

        /**
         * @unreleased
         */
        toVec2(): vec2

        /**
         * @unreleased
         */
        x: number

        /**
         * @unreleased
         */
        y: number

    }

}
declare namespace Editor {
    namespace Size {
        /**
         * @unreleased
         */
        export function fromVec2(value: vec2): Editor.Size


    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    class Transform {
        /**
         * @unreleased
         */
        constructor(position: vec3, rotation: vec3, scale: vec3)

        /**
         * @unreleased
         */
        position: vec3

        /**
         * @unreleased
         */
        rotation: vec3

        /**
         * @unreleased
         */
        scale: vec3

    }

}

declare namespace Editor {
    /**
     * @unreleased
     */
    interface Uuid {
        /**
         * @unreleased
         */
        isValid(): boolean

        /**
         * @unreleased
         */
        toString(): string

    }

}

/**
 * @module LensStudio:App

 * @description Before using anything in this namespace, make sure to import `LensStudio:App`.

 * @example
 * ```js
 * import * as app from "LensStudio:App"
 * const version = app.version;
 * ```
 */
declare module "LensStudio:App" {
}
declare module "LensStudio:App" {
    let version: string

    let env: Object


}

/**
 * @module LensStudio:AssetLibrary

 * @description Before using anything in this namespace, make sure to import `LensStudio:AssetLibrary`.
 */
declare module "LensStudio:AssetLibrary" {
}

declare module "LensStudio:AssetLibrary" {
    interface Asset {
        assetId: string

        assetName: string

        resources: Resource[]

        assetType: AssetType

    }

}

declare module "LensStudio:AssetLibrary" {
    class AssetFilter {
        constructor()

        categoryId: string

        searchText: string

        pagination: Pagination

    }

}

declare module "LensStudio:AssetLibrary" {
    class AssetListRequest {
        constructor(environmentSetting: EnvironmentSetting, assetFilter: AssetFilter)

        /**
         * @readonly
         */
        environmentSetting: EnvironmentSetting

        /**
         * @readonly
         */
        assetFilter: AssetFilter

    }

}

declare module "LensStudio:AssetLibrary" {
    interface AssetListResponse {
    }

}

declare module "LensStudio:AssetLibrary" {
    interface AssetListService extends ScriptObject {
        fetch(request: AssetListRequest, onSuccess: (arg1: AssetListSuccess) => void, onFailure: (arg1: ServiceError) => void): void

    }

}

declare module "LensStudio:AssetLibrary" {
    interface AssetListSuccess {
        assets: Asset[]

    }

}

declare module "LensStudio:AssetLibrary" {
    enum AssetType {
        Invalid,
        Texture,
        AnimatedTexture,
        Material,
        Mesh3D,
        Script,
        ObjectPreset,
        ObjectPrefab,
        Audio,
        MLModel,
        ProjectTemplate,
        Music,
        RemoteApi,
        CustomComponent,
        Video,
        Guide,
        Plugin
    }

}

declare module "LensStudio:AssetLibrary" {
    enum Environment {
        Invalid,
        Production,
        Staging
    }

}

declare module "LensStudio:AssetLibrary" {
    class EnvironmentSetting {
        constructor()

        environment: Environment

        space: Space

    }

}

declare module "LensStudio:AssetLibrary" {
    interface IAssetLibraryProvider extends ScriptObject {
        /**
         * @readonly
         */
        service: AssetListService

    }

}
declare module "LensStudio:AssetLibrary" {
    namespace IAssetLibraryProvider {
        let interfaceID: string


    }

}

declare module "LensStudio:AssetLibrary" {
    interface Pagination {
        /**
         * @readonly
         */
        limit: number

        /**
         * @readonly
         */
        offset: number

    }

}
declare module "LensStudio:AssetLibrary" {
    namespace Pagination {
        export function singleBatch(offset: number, limit: number): Pagination


    }

}

declare module "LensStudio:AssetLibrary" {
    interface Resource {
        uri: string

        name: string

    }

}

declare module "LensStudio:AssetLibrary" {
    interface ServiceError {
        description: string

    }

}

declare module "LensStudio:AssetLibrary" {
    enum Space {
        Invalid,
        Internal,
        Public
    }

}

/**
 * @module LensStudio:Engine
 */
declare module "LensStudio:Engine" {
}

/**
 * @module LensStudio:FileSystem

 * @description Before using anything in this namespace, make sure to import `LensStudio:FileSystem` and add `filesystem` in your plugin's `module.json`.

 * @example
 * ```js
 * // module.json
 * {
 *     "main": "main.js",
 *     "permissions": ["filesystem"]
 * }
 * ```

 * ```js
 * // main.js
 * import * as fs from 'LensStudio:FileSystem';
 * let s = fs.readFile(new Editor.Path(import.meta.resolve('ellipsis.txt')));
 * ```
 */
declare module "LensStudio:FileSystem" {
}
declare module "LensStudio:FileSystem" {
    export function createDir(path: Editor.Path, options: CreateDirOptions): void

    export function exists(path: Editor.Path): boolean

    export function copyFile(src: Editor.Path, dest: Editor.Path): void

    export function copyDir(src: Editor.Path, dest: Editor.Path, options: CopyDirOptions): void

    export function readDir(path: Editor.Path, options: ReadDirOptions): Editor.Path[]

    export function remove(path: Editor.Path): void

    export function rename(oldPath: Editor.Path, newPath: Editor.Path): void

    export function realPath(path: Editor.Path): Editor.Path

    export function writeFile(path: Editor.Path, data: (Uint8Array | string)): void

    export function readFile(path: Editor.Path): string

    export function readBytes(path: Editor.Path): Uint8Array

    export function isFile(path: Editor.Path): boolean

    export function isDirectory(path: Editor.Path): boolean

    export function size(path: Editor.Path): number


}

declare module "LensStudio:FileSystem" {
    interface CopyDirOptions {
        force: boolean

        recursive: boolean

    }

}

declare module "LensStudio:FileSystem" {
    interface CreateDirOptions {
        recursive: boolean

    }

}

declare module "LensStudio:FileSystem" {
    interface ReadDirOptions {
        recursive: boolean

    }

}

declare module "LensStudio:FileSystem" {
    interface TempDir extends ScriptObject {
        /**
         * @readonly
         */
        path: Editor.Path

    }

}
declare module "LensStudio:FileSystem" {
    namespace TempDir {
        export function create(): TempDir


    }

}

/**
 * @module LensStudio:ModelUi

 * @description Before using anything in this namespace, make sure to import `LensStudio:ModelUI`.
 */
declare module "LensStudio:ModelUi" {
}

declare module "LensStudio:ModelUi" {
    import { LineEdit } from "LensStudio:Ui"

    interface EntityReferencePickerLine extends LineEdit {
        /**
         * @readonly
         */
        onEntityDrop: any

        /**
         * @readonly
         */
        onEntityClear: any

        /**
         * @readonly
         */
        onAssetHighlight: any

        /**
         * @readonly
         */
        onEntitySelect: any

    }

}
declare module "LensStudio:ModelUi" {
    namespace EntityReferencePickerLine {
        export function create(assetManager: Editor.Model.AssetManager, entityPrototypeRegistry: Editor.Model.IEntityPrototypeRegistry, entityType: string, widget: import('LensStudio:Ui').Widget): EntityReferencePickerLine


    }

}

/**
 * @module LensStudio:Network

 * @description Before using anything in this namespace, make sure to import `LensStudio:Network` and add `network` in your plugin's `module.json`.

 * @example
 * ```js
 * // module.json
 * {
 *     "main": "main.js",
 *     "permissions": ["network"]
 * }
 * ```

 * ```js
 * // main.js
 * import * as network from 'LensStudio:Network';
 * ```
 */
declare module "LensStudio:Network" {
}
declare module "LensStudio:Network" {
    export function performHttpRequest(request: HttpRequest, callback: (arg1: HttpResponse) => void): void

    export function performAuthorizedHttpRequest(request: HttpRequest, callback: (arg1: HttpResponse) => void): void


}

declare module "LensStudio:Network" {
    class Address {
        constructor()

        address: string

        port: number

    }

}

declare module "LensStudio:Network" {
    class FormData {
        constructor()

        append(body: (Uint8Array | string), headers: Object): void

    }

}

declare module "LensStudio:Network" {
    class HttpRequest {
        constructor()

        url: string

        method: HttpRequest.Method

        contentType: string

        headers: Object

        body: (Uint8Array | import('LensStudio:Network').FormData | string)

    }

}

declare module "LensStudio:Network" {
    namespace HttpRequest {
        enum Method {
            Get,
            Post,
            Put,
            Delete
        }

    }

}

declare module "LensStudio:Network" {
    interface HttpResponse {
        /**
         * @readonly
         */
        statusCode: number

        /**
         * @readonly
         */
        contentType: string

        /**
         * @readonly
         */
        headers: Object

        /**
         * @readonly
         */
        body: Editor.Buffer

        /**
         * @readonly
         */
        error: string

    }

}

declare module "LensStudio:Network" {
    interface TcpServer extends ScriptObject {
        listen(address: Address): boolean

        close(): void

        /**
         * @readonly
         */
        address: string

        /**
         * @readonly
         */
        port: number

        /**
         * @readonly
         */
        onConnect: any

        /**
         * @readonly
         */
        onError: any

    }

}
declare module "LensStudio:Network" {
    namespace TcpServer {
        export function create(): TcpServer


    }

}

declare module "LensStudio:Network" {
    interface TcpSocket extends ScriptObject {
        write(data: (Uint8Array | string)): number

        end(): void

        destroy(): void

        /**
         * @readonly
         */
        onData: any

        /**
         * @readonly
         */
        onError: any

        /**
         * @readonly
         */
        onEnd: any

        /**
         * @readonly
         */
        localAddress: Address

        /**
         * @readonly
         */
        remoteAddress: Address

    }

}

/**
 * @module LensStudio:RemoteServiceModule
 */
declare module "LensStudio:RemoteServiceModule" {
}
declare module "LensStudio:RemoteServiceModule" {
    export function performApiRequest(request: RemoteApiRequest, callback: (arg1: import('LensStudio:Network').HttpResponse) => void): void


}

declare module "LensStudio:RemoteServiceModule" {
    interface RemoteApiRequest {
        endpoint: string

        body: (Uint8Array | string)

        specId: string

    }

}
declare module "LensStudio:RemoteServiceModule" {
    namespace RemoteApiRequest {
        export function create(): RemoteApiRequest


    }

}

/**
 * @module LensStudio:Serialization

 * @description Before using anything in this namespace, make sure to import `LensStudio:Serialization`.
 */
declare module "LensStudio:Serialization" {
}

declare module "LensStudio:Serialization" {
    /**
     * @unreleased
     */
    interface IReader extends ScriptObject {
    }

}

declare module "LensStudio:Serialization" {
    /**
     * @unreleased
     */
    interface IWriter extends ScriptObject {
        /**
         * @unreleased
         */
        getString(): string

    }

}

declare module "LensStudio:Serialization" {
    interface Yaml {
    }

}
declare module "LensStudio:Serialization" {
    namespace Yaml {
        /**
         * @unreleased
         */
        export function createReader(data: string): IReader

        /**
         * @unreleased
         */
        export function createWriter(): IWriter


    }

}

/**
 * @module LensStudio:Shell

 * @description Before using anything in this namespace, make sure to import `LensStudio:Shell`.
 */
declare module "LensStudio:Shell" {
}
declare module "LensStudio:Shell" {
    export function openUrl(baseUrl: string, queryData: Object): boolean


}

/**
 * @module LensStudio:Subprocess

 * @description Before using anything in this namespace, make sure to import `LensStudio:Subprocess` and add `subprocess` in your plugin's `module.json`.

 * @example
 * ```js
 * // module.json
 * {
 *     "main": "main.js",
 *     "permissions": ["subprocess"]
 * }
 * ```

 * ```js
 * // main.js

 * import { CoreService } from 'LensStudio:CoreService';
 * import * as sb from 'LensStudio:Subprocess';

 * ////////////////////////////////////////////////////////////////////////////////////////////////////
 * // Helpers that print out some passed in text with some prefix
 * // that will be included with every print out.
 * ////////////////////////////////////////////////////////////////////////////////////////////////////

 * function createStartedCallback(text) {
 *     return function () {
 *         console.log('Process: ' + text + ' started');
 *     };
 * }

 * function createStateChangedCallback(text) {
 *     return function (state) {
 *         console.log('Process: ' + text + ' state changed to: ' + state);
 *     };
 * }

 * function createErrorCallback(text) {
 *     return function (errorType) {
 *         console.log('Process: ' + text + ' encountered process error of type: ' + errorType);
 *     };
 * }

 * function createExitCallback(text) {
 *     return function (exitCode) {
 *         console.log('Process: ' + text + ' exited with code ' + exitCode);
 *     };
 * }

 * function createStdOutCallback(text) {
 *     return function (data) {
 *         console.log('Process: ' + text + ' stdout: ' + data);
 *     };
 * }

 * function createStdErrCallback(text) {
 *     return function (data) {
 *         console.log('Process: ' + text + ' stderr: ' + data);
 *     }
 * }

 * ////////////////////////////////////////////////////////////////////////////////////////////////////
 * // Core Plugin that gets Python3 Version and Git Status on this plugin's folder.
 * ////////////////////////////////////////////////////////////////////////////////////////////////////
 * export class ProcessTest extends CoreService {
 *     static descriptor() {
 *         return {
 *             id: 'snap.test.SubprocessExample',
 *             interfaces: CoreService. descriptor().interfaces,
 *             name: 'Subprocess Example',
 *             description: 'Run some sync and async subprocess.',
 *             dependencies: []
 *         };
 *     }

 *     constructor(pluginSystem) {
 *         super(pluginSystem);
 *     }

 *     _subprocessPythonVersion() {
 *         // Store subprocess in `this` so we can kill it when the plugin closes
 *         this.pythonVersionSubprocess = sb.Subprocess.create('python3', ['--version'], {});
 *
 *         // Hook into subprocess
 *         const myCommand = this.pythonVersionSubprocess.command;
 *         this.pythonVersionSubprocess.started.connect(createStartedCallback(myCommand));
 *         this.pythonVersionSubprocess.stateChanged.connect(createStateChangedCallback(myCommand));
 *         this.pythonVersionSubprocess.errored.connect(createErrorCallback(myCommand));
 *         this.pythonVersionSubprocess.exited.connect(createExitCallback(myCommand));
 *         this.pythonVersionSubprocess.stdout.connect(createStdOutCallback(myCommand));
 *         this.pythonVersionSubprocess.stderr.connect(createStdErrCallback(myCommand));

 *         // Start the process
 *         this.pythonVersionSubprocess.start();

 *         // Write to stdin
 *         for (let i = 0; i < 5; i++) {
 *             this.pythonVersionSubprocess.stdin.writeString('Hello, world: ' + i + '\n');
 *             sb.spawnSync('sleep', ['1'], {});
 *         }
 *     }

 *     _subprocessSyncGitStatus() {
 *         const pluginFolder = import.meta.resolve(".");
 *         const options = {
 *             cwd: new Editor.Path(pluginFolder)
 *         }

 *         const result = sb.spawnSync('git', ['status'], options);

 *         console.log('success: ' + result.success);
 *         console.log('stdout: ' + result.stdout);
 *         console.log('stderr: ' + result.stderr);
 *         console.log('exitCode: ' + result.exitCode);
 *     }

 *     start() {
 *         console.log("Start: subprocess for Git Status ------------------------------");
 *         this._subprocessSyncGitStatus();
 *         console.log("Done: subprocess for Git Status -------------------------------");
 *
 *         console.log("Start: subprocess for Python3 Version -------------------------");
 *         this._subprocessPythonVersion();
 *     }

 *     stop() {
 *         // Need to kill the asynchronus process we started in `subprocessPythonVersion`.
 *         // For example when the app closes, or user disables the plugin.
 *         this.pythonVersionSubprocess.kill();
 *         console.log("Done: subprocess for Python3 Version --------------------------");
 *     }
 * }
 * ```
 */
declare module "LensStudio:Subprocess" {
}
declare module "LensStudio:Subprocess" {
    export function spawn(command: string, args: string[], options: SpawnOptions): Subprocess

    export function spawnSync(command: string, args: string[], options: SpawnOptions): SpawnSyncResult


}

declare module "LensStudio:Subprocess" {
    enum ExitStatus {
        NormalExit,
        CrashExit
    }

}

declare module "LensStudio:Subprocess" {
    enum ProcessError {
        FailedToStart,
        Crashed,
        Timedout,
        ReadError,
        WriteError,
        UnknownError
    }

}

declare module "LensStudio:Subprocess" {
    enum ProcessState {
        Idle,
        Starting,
        Running
    }

}

declare module "LensStudio:Subprocess" {
    interface SpawnOptions {
        cwd: Editor.Path

        timeout: number

        env: Object

    }

}

declare module "LensStudio:Subprocess" {
    interface SpawnSyncResult {
        /**
         * @readonly
         */
        exitCode: number

        /**
         * @readonly
         */
        stdout: Editor.Buffer

        /**
         * @readonly
         */
        stderr: Editor.Buffer

    }

}

declare module "LensStudio:Subprocess" {
    interface Subprocess extends ScriptObject {
        start(): void

        kill(): void

        /**
         * @readonly
         */
        command: string

        /**
         * @readonly
         */
        onStart: any

        /**
         * @readonly
         */
        onStateChange: any

        /**
         * @readonly
         */
        onError: any

        /**
         * @readonly
         */
        onExit: any

        /**
         * @readonly
         */
        stdout: any

        /**
         * @readonly
         */
        stderr: any

        /**
         * @readonly
         */
        stdin: Writable

    }

}
declare module "LensStudio:Subprocess" {
    namespace Subprocess {
        export function create(command: string, args: string[], options: SpawnOptions): Subprocess


    }

}

declare module "LensStudio:Subprocess" {
    interface Writable extends ScriptObject {
        write(data: (Uint8Array | string)): number

    }

}

/**
 * @module LensStudio:Ui

 * @description Before using anything in this namespace, make sure to import `LensStudio:Ui`.
 */
declare module "LensStudio:Ui" {
}
declare module "LensStudio:Ui" {
    export function getUrlString(displayText: string, url: string): string


}

declare module "LensStudio:Ui" {
    interface AbstractButton extends Widget {
        setIcon(icon: Editor.Icon): void

        setIconSize(w: number, h: number): void

        text: string

    }

}

declare module "LensStudio:Ui" {
    interface Action extends ScriptObject {
        blockSignals(blocked: boolean): void

        text: string

        checkable: boolean

        checked: boolean

        /**
         * @readonly
         */
        onToggle: any

    }

}
declare module "LensStudio:Ui" {
    namespace Action {
        export function create(caption: Widget): Action


    }

}

declare module "LensStudio:Ui" {
    enum Alignment {
        Default,
        AlignLeft,
        AlignLeading,
        AlignRight,
        AlignTrailing,
        AlignHCenter,
        AlignJustify,
        AlignAbsolute,
        AlignHorizontal_Mask,
        AlignTop,
        AlignBottom,
        AlignVCenter,
        AlignBaseline,
        AlignVertical_Mask,
        AlignCenter
    }

}

declare module "LensStudio:Ui" {
    enum ArrowPosition {
        Top,
        Bottom
    }

}

declare module "LensStudio:Ui" {
    enum AspectRatioMode {
        IgnoreAspectRatio,
        KeepAspectRatio,
        KeepAspectRatioByExpanding
    }

}

declare module "LensStudio:Ui" {
    enum BackgroundRole {
        WindowBackground,
        PanelBackground,
        ComponentBackground,
        PopupBackground,
        ButtonBackground,
        InputBackground,
        CtaBackground
    }

}

declare module "LensStudio:Ui" {
    interface BoxLayout extends Layout {
        setDirection(direction: Direction): void

        addStretch(stretch: number): void

        addLayout(layout: Layout): void

        addWidgetWithStretch(widget: Widget, stretch: number, alignment: Alignment): void

    }

}
declare module "LensStudio:Ui" {
    namespace BoxLayout {
        export function create(): BoxLayout


    }

}

declare module "LensStudio:Ui" {
    interface CalloutFrame extends Widget {
    }

}
declare module "LensStudio:Ui" {
    namespace CalloutFrame {
        export function create(widget: Widget): CalloutFrame


    }

}

declare module "LensStudio:Ui" {
    interface CheckBox extends AbstractButton {
        checked: boolean

        checkState: CheckState

        /**
         * @readonly
         */
        onToggle: any

    }

}
declare module "LensStudio:Ui" {
    namespace CheckBox {
        export function create(widget: Widget): CheckBox


    }

}

declare module "LensStudio:Ui" {
    enum CheckState {
        Unchecked,
        PartiallyChecked,
        Checked
    }

}

declare module "LensStudio:Ui" {
    interface ClickableLabel extends Label {
        /**
         * @readonly
         */
        onClick: any

    }

}
declare module "LensStudio:Ui" {
    namespace ClickableLabel {
        export function create(widget: Widget): ClickableLabel


    }

}

declare module "LensStudio:Ui" {
    interface CollapsiblePanel extends Widget {
        setContentWidget(widget: Widget): void

        clearContent(): void

        expand(value: boolean): void

        customBackgroundRole: BackgroundRole

        overrideBackgroundRole: boolean

        expandable: boolean

        /**
         * @readonly
         */
        onExpand: any

    }

}
declare module "LensStudio:Ui" {
    namespace CollapsiblePanel {
        export function create(icon: Editor.Icon, text: string, widget: Widget): CollapsiblePanel


    }

}

declare module "LensStudio:Ui" {
    enum ColorRole {
        WindowText,
        Button,
        Light,
        Midlight,
        Dark,
        Mid,
        Text,
        BrightText,
        ButtonText,
        Base,
        Window,
        Shadow,
        Highlight,
        HighlightedText,
        Link,
        LinkVisited,
        AlternateBase,
        NoRole,
        ToolTipBase,
        ToolTipText,
        PlaceholderText
    }

}

declare module "LensStudio:Ui" {
    interface ComboBox extends Widget {
        addItem(text: string): void

        addIconItem(icon: Editor.Icon, text: string): void

        setItemIcon(index: number, icon: Editor.Icon): void

        currentText: string

        /**
         * @readonly
         */
        onCurrentTextChange: any

    }

}
declare module "LensStudio:Ui" {
    namespace ComboBox {
        export function create(widget: Widget): ComboBox


    }

}

declare module "LensStudio:Ui" {
    interface Dialog extends Widget {
        close(): void

        show(): void

        /**
         * @readonly
         */
        onClose: any

    }

}
declare module "LensStudio:Ui" {
    namespace Dialog {
        export function create(widget: Widget): Dialog


    }

}

declare module "LensStudio:Ui" {
    namespace Dialogs {
        enum Options {
            Usual,
            DirectoriesOnly
        }

    }

}

declare module "LensStudio:Ui" {
    namespace Dialogs {
        interface Params {
            caption: string

            filter: string

            options: Dialogs.Options

        }

    }

}

declare module "LensStudio:Ui" {
    enum Direction {
        LeftToRight,
        RightToLeft,
        TopToBottom,
        BottomToTop
    }

}

declare module "LensStudio:Ui" {
    interface DoubleSpinBox extends Widget {
        setRange(min: number, max: number): void

        value: number

        singleStep: number

        /**
         * @readonly
         */
        onValueChange: any

    }

}
declare module "LensStudio:Ui" {
    namespace DoubleSpinBox {
        export function create(widget: Widget): DoubleSpinBox


    }

}

declare module "LensStudio:Ui" {
    enum FontRole {
        Default,
        First,
        DefaultUnderlined,
        DefaultBold,
        DefaultItalic,
        Small,
        Monospace,
        SmallTitle,
        Title,
        TitleBold,
        MediumTitle,
        MediumTitleBold,
        LargeTitle,
        LargeTitleBold
    }

}

declare module "LensStudio:Ui" {
    interface GridLayout extends Layout {
        addWidgetAt(widget: Widget, row: number, column: number, alignment: Alignment): void

        addWidgetWithSpan(widget: Widget, fromRow: number, fromColumn: number, rowSpan: number, columnSpan: number, alignment: Alignment): void

        addLayout(layout: Layout, row: number, column: number, alignment: Alignment): void

        getColumnMinimumWidth(column: number): number

        setColumnMinimumWidth(column: number, minSize: number): void

        getRowMinimumHeight(row: number): number

        setRowMinimumHeight(row: number, minSize: number): void

    }

}
declare module "LensStudio:Ui" {
    namespace GridLayout {
        export function create(): GridLayout


    }

}

declare module "LensStudio:Ui" {
    interface Gui extends IGui {
    }

}

declare module "LensStudio:Ui" {
    enum IconMode {
        MonoChrome,
        Regular
    }

}

declare module "LensStudio:Ui" {
    interface IDialogs extends ScriptObject {
        selectFileToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path

        selectFilesToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path[]

        selectFileToSave(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path

        selectFolderToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path

        selectFolderToSave(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path

    }

}

declare module "LensStudio:Ui" {
    interface IGui extends ScriptObject {
        createDialog(): Dialog

        /**
         * @readonly
         */
        dialogs: IDialogs

    }

}
declare module "LensStudio:Ui" {
    namespace IGui {
        let interfaceID: string


    }

}

declare module "LensStudio:Ui" {
    interface ImageView extends Widget {
        pixmap: Pixmap

        scaledContents: boolean

        responseHover: boolean

        radius: number

        /**
         * @readonly
         */
        onClick: any

        /**
         * @readonly
         */
        onHover: any

    }

}
declare module "LensStudio:Ui" {
    namespace ImageView {
        export function create(widget: Widget): ImageView


    }

}

declare module "LensStudio:Ui" {
    interface Label extends Widget {
        text: string

        wordWrap: boolean

        openExternalLinks: boolean

    }

}
declare module "LensStudio:Ui" {
    namespace Label {
        export function create(widget: Widget): Label


    }

}

declare module "LensStudio:Ui" {
    interface Layout extends ScriptObject {
        deleteLater(): void

        addWidget(widget: Widget): void

        setContentsMargins(left: number, top: number, right: number, bottom: number): void

        setWidgetAlignment(widget: Widget, alignment: Alignment): boolean

        setLayoutAlignment(layout: Layout, alignment: Alignment): boolean

        enabled: boolean

        spacing: number

        /**
         * @readonly
         */
        isNull: boolean

    }

}

declare module "LensStudio:Ui" {
    interface LineEdit extends Widget {
        text: string

        placeholderText: string

        icon: Editor.Icon

        /**
         * @readonly
         */
        onTextChange: any

    }

}
declare module "LensStudio:Ui" {
    namespace LineEdit {
        export function create(widget: Widget): LineEdit


    }

}

declare module "LensStudio:Ui" {
    interface Menu extends Widget {
        addMenu(caption: string): Menu

        addAction(action: Action): void

        addSeparator(): void

        popup(target: Widget): void

    }

}
declare module "LensStudio:Ui" {
    namespace Menu {
        export function create(parent: Widget): Menu


    }

}

declare module "LensStudio:Ui" {
    interface Movie extends ScriptObject {
        resize(width: number, height: number): void

        width: number

        height: number

        speed: number

    }

}
declare module "LensStudio:Ui" {
    namespace Movie {
        export function create(filename: Editor.Path): Movie


    }

}

declare module "LensStudio:Ui" {
    interface MovieView extends Widget {
        animated: boolean

        movie: Movie

        scaledContents: boolean

        responseHover: boolean

        /**
         * @readonly
         */
        onClick: any

        /**
         * @readonly
         */
        onHover: any

    }

}
declare module "LensStudio:Ui" {
    namespace MovieView {
        export function create(widget: Widget): MovieView


    }

}

declare module "LensStudio:Ui" {
    enum Orientation {
        Horizontal,
        Vertical
    }

}

declare module "LensStudio:Ui" {
    interface Pixmap extends ScriptObject {
        load(filename: Editor.Path): void

        resize(width: number, height: number): void

        crop(rect: Rect): void

        width: number

        height: number

        aspectRatioMode: AspectRatioMode

        transformationMode: TransformationMode

    }

}

declare module "LensStudio:Ui" {
    namespace Pixmap {
        export function create(filename: Editor.Path): Pixmap


    }

}

declare module "LensStudio:Ui" {
    interface PopupWithArrow extends Widget {
        popup(target: Widget): void

        setMainWidget(widget: Widget): void

        close(): void

    }

}
declare module "LensStudio:Ui" {
    namespace PopupWithArrow {
        export function create(widget: Widget, arrowPosition: ArrowPosition): PopupWithArrow


    }

}

declare module "LensStudio:Ui" {
    interface ProgressBar extends Widget {
        setRange(minimum: number, maximum: number): void

        minimum: number

        maximum: number

        value: number

    }

}
declare module "LensStudio:Ui" {
    namespace ProgressBar {
        export function create(widget: Widget): ProgressBar


    }

}

declare module "LensStudio:Ui" {
    interface ProgressIndicator extends Widget {
        start(): void

        stop(): void

    }

}
declare module "LensStudio:Ui" {
    namespace ProgressIndicator {
        export function create(widget: Widget): ProgressIndicator


    }

}

declare module "LensStudio:Ui" {
    interface PushButton extends AbstractButton {
        setIconWithMode(icon: Editor.Icon, iconMode: IconMode): void

        setIconMode(iconMode: IconMode): void

        /**
         * @readonly
         */
        onClick: any

        primary: boolean

    }

}
declare module "LensStudio:Ui" {
    namespace PushButton {
        export function create(widget: Widget): PushButton


    }

}

declare module "LensStudio:Ui" {
    interface RadioButton extends AbstractButton {
        /**
         * @readonly
         */
        onClick: any

    }

}
declare module "LensStudio:Ui" {
    namespace RadioButton {
        export function create(widget: Widget): RadioButton


    }

}

declare module "LensStudio:Ui" {
    interface RadioButtonGroup extends Widget {
        addButton(button: AbstractButton, id: number): void

        clearSelection(): void

        currentIndex: number

        /**
         * @readonly
         */
        currentItem: AbstractButton

        spacing: number

    }

}
declare module "LensStudio:Ui" {
    namespace RadioButtonGroup {
        export function create(widget: Widget): RadioButtonGroup


    }

}

declare module "LensStudio:Ui" {
    class Rect {
        constructor(x: number, y: number, width: number, height: number)

    }

}

declare module "LensStudio:Ui" {
    interface SearchLineEdit extends LineEdit {
    }

}
declare module "LensStudio:Ui" {
    namespace SearchLineEdit {
        export function create(widget: Widget): SearchLineEdit


    }

}

declare module "LensStudio:Ui" {
    interface Separator extends Widget {
    }

}
declare module "LensStudio:Ui" {
    namespace Separator {
        export function create(orientation: Orientation, shadow: Shadow, widget: Widget): Separator


    }

}

declare module "LensStudio:Ui" {
    enum Shadow {
        Plain,
        Raised,
        Sunken
    }

}

declare module "LensStudio:Ui" {
    namespace SizePolicy {
        enum Policy {
            Fixed,
            Minimum,
            Maximum,
            Preferred,
            MinimumExpanding,
            Expanding,
            Ignored
        }

    }

}

declare module "LensStudio:Ui" {
    interface Sizes {
    }

}
declare module "LensStudio:Ui" {
    namespace Sizes {
        let Spacing: number

        let Padding: number

        let HalfPadding: number

        let DoublePadding: number

        let PaddingLarge: number

        let ToolButtonPadding: number

        let IconSide: number

        let DragIconSizeWidth: number

        let DragIconSizeHeight: number

        let SizeGripSizeWidth: number

        let SizeGripSizeHeight: number

        let MessageBoxIconSide: number

        let ExtentIconSide: number

        let InputHeight: number

        let ButtonHeight: number

        let TextEditHeight: number

        let SpinboxDefaultWidth: number

        let ButtonRadius: number

        let CheckboxRadius: number

        let InputRadius: number

        let CheckBoxDrawedDiameter: number

        let CheckBoxOutlineWidth: number

        let CheckboxPadding: number

        let CheckboxFocusPadding: number

        let SpinboxButtonWidth: number

        let SpinboxButtonHeight: number

        let MenuItemHeight: number

        let ViewSectionHeight: number

        let ButtonDelegateSide: number

        let ViewIndentation: number

        let ViewElidingGradientWidth: number

        let SeparatorLineWidth: number

        let SeparatorContentsMargin: number

        let RoundedPixmapRadius: number

        let DialogContentMargin: number

        let SplitterHandleWidth: number

        let ProgressBarHeight: number


    }

}

declare module "LensStudio:Ui" {
    interface Slider extends Widget {
        setRange(min: number, max: number): void

        value: number

        singleStep: number

        /**
         * @readonly
         */
        onValueChange: any

    }

}
declare module "LensStudio:Ui" {
    namespace Slider {
        export function create(widget: Widget): Slider


    }

}

declare module "LensStudio:Ui" {
    interface SpinBox extends Widget {
        setRange(min: number, max: number): void

        value: number

        step: number

        /**
         * @readonly
         */
        onValueChange: any

    }

}
declare module "LensStudio:Ui" {
    namespace SpinBox {
        export function create(widget: Widget): SpinBox


    }

}

declare module "LensStudio:Ui" {
    interface StackedWidget extends Widget {
        addWidget(widget: Widget): number

        currentIndex: number

        currentWidget: Widget

    }

}
declare module "LensStudio:Ui" {
    namespace StackedWidget {
        export function create(widget: Widget): StackedWidget


    }

}

declare module "LensStudio:Ui" {
    interface StatusIndicator extends Widget {
        start(): void

        stop(): void

        text: string

    }

}
declare module "LensStudio:Ui" {
    namespace StatusIndicator {
        export function create(text: string, widget: Widget): StatusIndicator


    }

}

declare module "LensStudio:Ui" {
    interface TabBar extends Widget {
        addTab(text: string): void

        setTabIcon(index: number, icon: Editor.Icon): void

        currentIndex: number

        /**
         * @readonly
         */
        onCurrentChange: any

    }

}
declare module "LensStudio:Ui" {
    namespace TabBar {
        export function create(widget: Widget): TabBar


    }

}

declare module "LensStudio:Ui" {
    interface TextEdit extends Widget {
        plainText: string

        placeholderText: string

        /**
         * @readonly
         */
        onTextChange: any

    }

}
declare module "LensStudio:Ui" {
    namespace TextEdit {
        export function create(widget: Widget): TextEdit


    }

}

declare module "LensStudio:Ui" {
    interface ToolButton extends AbstractButton {
        checkable: boolean

        /**
         * @readonly
         */
        onClick: any

    }

}
declare module "LensStudio:Ui" {
    namespace ToolButton {
        export function create(parent: Widget): ToolButton


    }

}

declare module "LensStudio:Ui" {
    enum TransformationMode {
        FastTransformation,
        SmoothTransformation
    }

}

declare module "LensStudio:Ui" {
    interface VerticalScrollArea extends Widget {
        setWidget(widget: Widget): void

        /**
         * @readonly
         */
        onValueChange: any

        /**
         * @readonly
         */
        minimum: number

        /**
         * @readonly
         */
        maximum: number

        value: number

    }

}
declare module "LensStudio:Ui" {
    namespace VerticalScrollArea {
        export function create(widget: Widget): VerticalScrollArea


    }

}

declare module "LensStudio:Ui" {
    interface WebEngineView extends Widget {
        load(url: string): void

    }

}
declare module "LensStudio:Ui" {
    namespace WebEngineView {
        export function create(parent: Widget): WebEngineView


    }

}

declare module "LensStudio:Ui" {
    interface Widget extends ScriptObject {
        deleteLater(): void

        setSizePolicy(horizontal: SizePolicy.Policy, vertical: SizePolicy.Policy): void

        setFixedWidth(width: number): void

        setFixedHeight(height: number): void

        setMinimumWidth(width: number): void

        setMinimumHeight(height: number): void

        setMaximumWidth(width: number): void

        setMaximumHeight(height: number): void

        resize(width: number, height: number): void

        blockSignals(blocked: boolean): void

        adjustSize(): void

        setContentsMargins(left: number, top: number, right: number, bottom: number): void

        move(ax: number, ay: number): void

        raise(): void

        activateWindow(): void

        windowTitle: string

        layout: Layout

        foregroundRole: ColorRole

        backgroundRole: ColorRole

        fontRole: FontRole

        autoFillBackground: boolean

        visible: boolean

        hidden: boolean

        enabled: boolean

        toolTip: string

        /**
         * @readonly
         */
        devicePixelRatio: number

        /**
         * @readonly
         */
        isNull: boolean

    }

}
declare module "LensStudio:Ui" {
    namespace Widget {
        export function create(widget: Widget): Widget


    }

}

interface ScriptObject {
    getTypeName(): string

    isOfType(type: string): boolean

    isSame(other: ScriptObject): boolean

}

interface SecureLocalStorage extends ScriptObject {
    length(): number

    getItem(keyName: string): string

    setItem(keyName: string, keyValue: string): void

    removeItem(keyName: string): void

    clear(): void

}
declare var secureLocalStorage: SecureLocalStorage
interface Timeout {
}
