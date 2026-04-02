/**
 * @module Editor Scripting
 * @version 5.21.0
 * For Snapchat Version: 13.88
*/
interface ComponentNameMap {
    "AnimationPlayer": Editor.Components.AnimationPlayer;
    "AudioComponent": Editor.Components.AudioComponent;
    "BaseMeshVisual": Editor.Components.BaseMeshVisual;
    "BodyComponent": Editor.Components.Physics.BodyComponent;
    "Camera": Editor.Components.Camera;
    "Canvas": Editor.Components.Canvas;
    "ClothVisual": Editor.Components.ClothVisual;
    "ColliderComponent": Editor.Components.Physics.ColliderComponent;
    "Component": Editor.Components.Component;
    "ConstraintComponent": Editor.Components.Physics.ConstraintComponent;
    "DeviceTracking": Editor.Components.DeviceTracking;
    "EyeColorVisual": Editor.Components.EyeColorVisual;
    "FaceInsetVisual": Editor.Components.FaceInsetVisual;
    "FaceMaskVisual": Editor.Components.FaceMaskVisual;
    "FaceStretchVisual": Editor.Components.FaceStretchVisual;
    "GaussianSplattingVisual": Editor.Components.GaussianSplattingVisual;
    "HairVisual": Editor.Components.HairVisual;
    "Head": Editor.Components.Head;
    "Image": Editor.Components.Image;
    "InteractionComponent": Editor.Components.InteractionComponent;
    "LightSource": Editor.Components.LightSource;
    "LiquifyVisual": Editor.Components.LiquifyVisual;
    "LocatedAtComponent": Editor.Components.LocatedAtComponent;
    "LookAtComponent": Editor.Components.LookAtComponent;
    "ManipulateComponent": Editor.Components.ManipulateComponent;
    "MarkerTrackingComponent": Editor.Components.MarkerTrackingComponent;
    "MaskingComponent": Editor.Components.MaskingComponent;
    "MaterialMeshVisual": Editor.Components.MaterialMeshVisual;
    "ObjectTracking": Editor.Components.ObjectTracking;
    "ObjectTracking3D": Editor.Components.ObjectTracking3D;
    "PinToMeshComponent": Editor.Components.PinToMeshComponent;
    "PostEffectVisual": Editor.Components.PostEffectVisual;
    "RectangleSetter": Editor.Components.RectangleSetter;
    "RenderLayerOwner": Editor.Components.RenderLayerOwner;
    "RenderMeshVisual": Editor.Components.RenderMeshVisual;
    "RetouchVisual": Editor.Components.RetouchVisual;
    "ScreenRegionComponent": Editor.Components.ScreenRegionComponent;
    "ScreenTransform": Editor.Components.ScreenTransform;
    "ScriptComponent": Editor.Components.ScriptComponent;
    "Skin": Editor.Components.Skin;
    "Text": Editor.Components.Text;
    "Text3D": Editor.Components.Text3D;
    "Visual": Editor.Components.Visual;
    "WorldComponent": Editor.Components.Physics.WorldComponent;
}

/**
* Remove the interval calls.
*/
declare function clearInterval(timeout: Timeout): void

/**
* Cancels the timeout.
*/
declare function clearTimeout(timeout: Timeout): void

/**
* Dynamically creates a function object from a string of JavaScript code. This allows you to generate and execute functions at runtime.
*/
declare function createFunctionObject(code: string, funcName: string): any

/**
* Repeatedly call `callback` every `delayMs` milliseconds.
*/
declare function setInterval(callback: () => void, delayMs: number): Timeout

/**
* Call `callback` after `delayMs` milliseconds.
*/
declare function setTimeout(callback: () => void, delayMs: number): Timeout

declare namespace global {
    /**
    * Provides access to the plugin's {@link SecureLocalStorage}.
    */
    let secureLocalStorage: SecureLocalStorage
    
}

declare class Base64 {
    
    /** @hidden */
    protected constructor()
    
    static decode(value: string): Uint8Array
    
    static encode(data: Uint8Array): string
    
    static encodeString(str: string): string
    
}

declare class BaseDescriptor extends IPluginDescriptor {
    
    /** @hidden */
    protected constructor()
    
    dependencies: Editor.InterfaceId[]
    
    description: string
    
    id: string
    
    interfaces: Editor.InterfaceId[]
    
    name: string
    
}

declare class console {
    
    /** @hidden */
    protected constructor()
    
    static debug(...data: any[]): void
    
    static error(...data: any[]): void
    
    static info(...data: any[]): void
    
    static log(...data: any[]): void
    
    static trace(...data: any[]): void
    
    static warn(...data: any[]): void
    
    static None: console.Category
    
    static User: console.Category
    
}

declare namespace console {
    class Category {
        
        /** @hidden */
        protected constructor()
        
    }

}

/**
* Namespace that provides access to the components of Lens Studio.
*/
declare class Editor {
    
    /** @hidden */
    protected constructor()
    
    static createAnimationClip(scene: Editor.Assets.Scene): Editor.AnimationClip
    
    static isNull(object: any): boolean
    
}

declare namespace Editor {
    class Ai {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Ai {
        class Storage {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Alignment {
        /**
        * The options for horizontal alignment, for example when using {@link Editor.Components.BaseMeshVisual}
        */
        enum Horizontal {
            Left,
            Center,
            Right
        }
    
    }

}

declare namespace Editor {
    namespace Alignment {
        /**
        * The options for vertical alignment, for example when using {@link Editor.Components.BaseMeshVisual}
        */
        enum Vertical {
            Bottom,
            Center,
            Top
        }
    
    }

}

declare namespace Editor {
    class AnimationClip extends Editor.Model.EntityStructure {
        
        /** @hidden */
        protected constructor()
        
        animation: Editor.Assets.AnimationAsset
        
        begin: number
        
        blendMode: Editor.AnimationLayerBlendMode
        
        disabled: boolean
        
        end: number
        
        name: string
        
        playbackMode: Editor.PlaybackMode
        
        playbackSpeed: number
        
        reversed: boolean
        
        scaleMode: Editor.AnimationLayerScaleMode
        
        weight: number
        
        static getMeta(): Editor.Model.Meta
        
        static getTypeName(): string
        
    }

}

declare namespace Editor {
    enum AnimationLayerBlendMode {
        Default,
        Additive
    }

}

declare namespace Editor {
    enum AnimationLayerScaleMode {
        Multiply,
        Additive
    }

}

declare namespace Editor {
    class Assets {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Assets {
        class AnimationAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            duration: number
            
            /**
            * @readonly
            */
            fps: number
            
            /**
            * @readonly
            */
            frames: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The aliasing mode of {@link Editor.Assets.RenderTarget}.
        */
        enum AntialiasingMode {
            /**
            * Whether no aliasing should happen. 
            */
            Disabled,
            /**
            * Whether MSAA should be used.
            */
            MSAA,
            TAA
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        enum AntialiasingQuality {
            Low,
            Medium,
            High,
            Default,
            Ultra
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * An asset in Lens Studio.
        */
        class Asset extends Editor.Model.Entity {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            cacheFile: Editor.Path
            
            /**
            * @readonly
            */
            fileMeta: Editor.Model.AssetImportMetadata
            
            /**
            * The name of the asset.
            
            * @readonly
            */
            name: string
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class AssetCompressionSettings extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class AudioTrackAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The blendmode of a {@link Editor.Assets.PassInfo}.
        */
        enum BlendMode {
            Disabled,
            Normal,
            Multiply,
            MultiplyLegacy,
            Add,
            AddLegacy,
            PremultipliedAlpha,
            Glass,
            ColoredGlass,
            AlphaTest,
            AlphaToCoverage,
            Screen,
            Min,
            Max,
            PremultipliedAlphaAuto,
            Custom,
            Darken,
            ColorBurn,
            Lighten,
            ColorDodge,
            Overlay,
            SoftLight,
            HardLight,
            VividLight,
            LinearLight,
            PinLight,
            HardMix,
            Diff,
            Exclusion,
            Subtract,
            Hue,
            Saturation,
            Color,
            Luminosity,
            Average,
            Negation,
            HardReflect,
            HardGlow,
            HardPhoenix,
            Realistic,
            Division,
            Bright,
            Forgray,
            NotBright,
            Intense
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class BodyTracking3DAsset extends Editor.Assets.Object3DAsset {
            
            /** @hidden */
            protected constructor()
            
            handTrackingEnabled: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * How a Render Target should be cleared every frame {@link Editor.Assets.RenderTarget}.
        */
        enum ClearColorOption {
            /**
            * The Render Target is not cleared at all.
            */
            None,
            /**
            * The last texture in the render pipeline will be used. 
            */
            BackgroundTexture,
            /**
            * The specified color will be used for every pixel at the beginning of the frame.
            */
            CustomColor,
            /**
            * The specified texture will replace the Render Target at the beginning of the frame. For example, the texture might be the {@link Editor.Assets.DeviceCameraTexture}.
            */
            CustomTexture,
            LegacyClearColorEnable
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        enum CullMode {
            /**
            * Cull the front face of a mesh.
            */
            Front,
            /**
            * Cull the back face of a mesh.
            */
            Back,
            /**
            * Cull both the fron and back face of a mesh.
            */
            FrontAndBack
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class CustomCodeNodeAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The depth buffer strategy of a {@link Editor.Assets.RenderTarget}.
        */
        enum DepthBufferStrategy {
            Auto,
            ForceOff,
            ForceOn
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * How a {@link Editor.Assets.PassInfo} should determine its depth compared to others.
        */
        enum DepthFunction {
            Never,
            Less,
            Equal,
            LessEqual,
            Greater,
            NotEqual,
            GreaterEqual,
            Always
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides the texture from the camera feed. Import with {@link Editor.Model.AssetManager#createNativeAsset}.
        */
        class DeviceCameraTexture extends Editor.Assets.Texture {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class DracoCompressionSettings extends Editor.Assets.FileCompressionSettings {
            
            /** @hidden */
            protected constructor()
            
            colorBits: number
            
            compressionLevel: number
            
            normalBits: number
            
            positionBits: number
            
            texcoordBits: number
            
            static create(scene: Editor.Assets.Scene): Editor.Assets.DracoCompressionSettings
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides a cropped region of the input texture, calculated based on face position. Import with {@link Editor.Model.AssetManager#createNativeAsset}.   Learn more in {@link LensScripting.FaceCropTextureProvider}
        
        */
        class FaceCropTexture extends Editor.Assets.Texture {
            
            /** @hidden */
            protected constructor()
            
            faceCenterMouthWeight: number
            
            faceIndex: number
            
            inputTexture: Editor.Assets.Texture
            
            scale: vec2
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides a 3D mesh of the user's face. Import with {@link Editor.Model.AssetManager#createNativeAsset}.   Learn more in the Face Mesh guide.
        */
        class FaceMesh extends Editor.Assets.RenderMesh {
            
            /** @hidden */
            protected constructor()
            
            earGeometryEnabled: boolean
            
            expressionMultiplier: number
            
            externalMesh: Editor.Assets.FileMesh
            
            externalMeshMapUV: Editor.Assets.VertexAttribute
            
            externalScale: number
            
            eyeCornerGeometryEnabled: boolean
            
            eyeGeometryEnabled: boolean
            
            faceGeometryEnabled: boolean
            
            faceIndex: number
            
            mouthGeometryEnabled: boolean
            
            skullGeometryEnabled: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileCompressionSettings extends Editor.Assets.AssetCompressionSettings {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * An asset for 3D meshes.
        */
        class FileMesh extends Editor.Assets.RenderMesh {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            info: Editor.Assets.MeshInfo
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * An asset for textures.
        */
        class FileTexture extends Editor.Assets.Texture {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTexture2DArray extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo3D
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTexture3D extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo3D
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTextureCubemap extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo3D
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTextureInfo extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            height: number
            
            /**
            * @readonly
            */
            width: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTextureInfo3D extends Editor.Assets.FileTextureInfo {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            depth: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * How a texture should be sampled. 
        */
        enum FilteringMode {
            Nearest,
            Bilinear,
            Trilinear
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Settings used with {@link Editor.Components.Text} and {@link Editor.Components.Text3D}.
        */
        class Font extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FontCollection extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FontFamily extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The same entity as in Lens Scripting.  @see {link Editor.Assets.PassInfo}. 
        */
        enum FrustumCullMode {
            Auto,
            Extend
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * An asset that contains Gaussian Splats and is used in conjunction with the GaussianSplattingVisual component. It is part of a system that renders Gaussian Splats.
        */
        class GaussianSplattingAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Flips X and Y axis of the asset.
            */
            flipXY: boolean
            
            pivot: vec3
            
            /**
            * Places pivot of the asset to the center of its bounding box.
            */
            recenter: boolean
            
            /**
            * Applies a scale multiplier to the asset's transform.
            */
            scale: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides data for {@link LensScripting.HairVisual}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class HairDataAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides data for {@link LensScripting.HandTracking3DAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class HandTracking3DAsset extends Editor.Assets.Object3DAsset {
            
            /** @hidden */
            protected constructor()
            
            handType: Editor.Assets.HandTracking3DHandType
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Used with {Editor.Assets.HandTracking3DAsset}.
        */
        enum HandTracking3DHandType {
            Right,
            Left
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A {@link LensScripting.MarkerAsset} for use with {@link Editor.Components.MarkerTrackingComponent}
        */
        class ImageMarker extends Editor.Assets.MarkerAsset {
            
            /** @hidden */
            protected constructor()
            
            texture: Editor.Assets.FileTexture
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A script asset that is written in JavaScript. 
        */
        class JavaScriptAsset extends Editor.Assets.ScriptAsset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            scriptInputInfo: any
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class JsonAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class LicensedAudioTrack extends Editor.Assets.AudioTrackAsset {
            
            /** @hidden */
            protected constructor()
            
            artistName: string
            
            bundled: boolean
            
            /**
            * @readonly
            */
            runtimeSourceBeatsPath: Editor.Path
            
            /**
            * @readonly
            */
            runtimeSourceLyricsPath: Editor.Path
            
            /**
            * @readonly
            */
            runtimeSourcePath: Editor.Path
            
            trackId: string
            
            trackName: string
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class LocationAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            displayName: string
            
            locationId: string
            
            locationType: Editor.Assets.LocationType
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides data for {@link LensScripting.LocationAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class LocationMesh extends Editor.Assets.RenderMesh {
            
            /** @hidden */
            protected constructor()
            
            location: Editor.Assets.LocationAsset
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Used with {Editor.Assets.Location}.
        */
        enum LocationType {
            Snap,
            Custom,
            World,
            Tile,
            RelativeTile,
            Proxy,
            NativeAR
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class MarkdownAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for Marker tracking. Learn more at {@link LensScripting.MarkerAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class MarkerAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            height: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Material}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class Material extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            addPass(pass: Editor.Assets.Pass): Editor.Assets.PassInfo
            
            passInfos: Editor.Assets.PassInfo[]
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class MeshInfo extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            aabbSize: vec3
            
            /**
            * @readonly
            */
            blendshapes: string[]
            
            /**
            * @readonly
            */
            joints: number
            
            /**
            * @readonly
            */
            triangles: number
            
            /**
            * @readonly
            */
            vertices: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.MLAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        * @beta
        */
        class MLAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        enum MSAAStrategy {
            Default,
            OnlyWhenRequired
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class NativePackageDescriptor extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            attachments: Editor.Assets.Asset[]
            
            /**
            * @readonly
            */
            componentId: import('LensStudio:Uuid').Uuid
            
            description: string
            
            /**
            * @readonly
            */
            exportId: import('LensStudio:Uuid').Uuid
            
            icon: Editor.Icon
            
            /**
            * @readonly
            */
            packageName: string
            
            readMe: Editor.Assets.MarkdownAsset
            
            setupScript: Editor.Assets.SetupScript
            
            tags: string[]
            
            version: Editor.Assets.Version
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Object3DAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class Object3DAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Base class for entities which has object and component relationship such as {@link Editor.Assets.Scene} and {@link Editor.Assets.ObjectPrefab}.
        */
        class ObjectOwner extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Adds a scene object to the entity.
            */
            addSceneObject(parent: Editor.Model.SceneObject): Editor.Model.SceneObject
            
            /**
            * Creates a scene object to the entity.
            */
            createSceneObject(name: string): Editor.Model.SceneObject
            
            /**
            * Find components on the entity.
            */
            findComponents(entityType: string): Editor.Components.Component[]
            
            /**
            * Get the index of `object` within the list of all the root objects.
            */
            getRootObjectIndex(object: Editor.Model.SceneObject): number
            
            /**
            * Reparent the scene object to another scene object. You can use this to reparent objects to the root (i.e. pass in `null`).
            */
            reparentSceneObject(object: Editor.Model.SceneObject, newParent: Editor.Model.SceneObject, position?: number): void
            
            /**
            * A list of scene objects which is a direct child of this entity.
            
            * @readonly
            */
            rootSceneObjects: Editor.Model.SceneObject[]
            
            /**
            * A list of scene objects which is a child of this entity.
            
            * @readonly
            */
            sceneObjects: Editor.Model.SceneObject[]
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.ObjectPrefab}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class ObjectPrefab extends Editor.Assets.ObjectOwner {
            
            /** @hidden */
            protected constructor()
            
            lazyLoading: boolean
            
            /**
            * @readonly
            */
            prefabInstances: Editor.Model.SceneObject[]
            
            retainAssets: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for object tracking texture. Learn more at {@link LensScripting.ObjectTrackingTextureProvider}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class ObjectTrackingTexture extends Editor.Assets.Texture {
            
            /** @hidden */
            protected constructor()
            
            trackingType: Editor.Assets.ObjectTrackingTextureType
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Used with {@link Editor.Assets.ObjectTrackingTexture}.
        */
        enum ObjectTrackingTextureType {
            Hand,
            Nails
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        enum PackagePolicy {
            CannotBeUnpacked,
            CanBeUnpacked,
            CannotBeUnpackedTransparent,
            CanBeUnpackedTransparent
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Pass}. 
        */
        class Pass extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class PassBinding {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            defaultValue?: number
            
            /**
            * @readonly
            */
            hint: string
            
            /**
            * @readonly
            */
            label: string
            
            /**
            * @readonly
            */
            max?: number
            
            /**
            * @readonly
            */
            min?: number
            
            /**
            * @readonly
            */
            name: string
            
            /**
            * @readonly
            */
            step?: number
            
            /**
            * @readonly
            */
            type: Editor.Assets.PassBindingType
            
            /**
            * @readonly
            */
            values: Editor.Assets.PassBinding[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        enum PassBindingType {
            Invalid,
            Property,
            Define,
            DefineSelect,
            DefineSelectValue,
            GroupEnd
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The {@link Editor.Assets.Pass} on a {@link Editor.Assets.Material}.
        */
        class PassInfo extends Editor.Model.Entity {
            
            /** @hidden */
            protected constructor()
            
            getPropertyNames(): string[]
            
            blendMode: Editor.Assets.BlendMode
            
            colorMask: vec4b
            
            cullMode: Editor.Assets.CullMode
            
            defines: string[]
            
            depthFunction: Editor.Assets.DepthFunction
            
            depthTest: boolean
            
            depthWrite: boolean
            
            frustumCulling: Editor.Assets.FrustumCullMode
            
            instanceCount: number
            
            polygonOffset: vec2
            
            twoSided: boolean
            
            /**
            * @readonly
            */
            uiData: Editor.Assets.PassUiData
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class PassUiData extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            extraDefines: string[]
            
            /**
            * @readonly
            */
            passBindings: Editor.Assets.PassBinding[]
            
            /**
            * @readonly
            */
            shaderType: Editor.Assets.ShaderType
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class PerformanceCompressionSettings extends Editor.Assets.SizeCompressionSettings {
            
            /** @hidden */
            protected constructor()
            
            mipmap: boolean
            
            static create(scene: Editor.Assets.Scene): Editor.Assets.PerformanceCompressionSettings
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class Physics {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class Filter extends Editor.Assets.Asset {
                
                /** @hidden */
                protected constructor()
                
                includeDynamic: boolean
                
                includeIntangible: boolean
                
                includeStatic: boolean
                
                onlyLayers: Editor.Model.LayerSet
                
                skipLayers: Editor.Model.LayerSet
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class LevelsetColliderAsset extends Editor.Assets.Asset {
                
                /** @hidden */
                protected constructor()
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class Matter extends Editor.Assets.Asset {
                
                /** @hidden */
                protected constructor()
                
                dynamicBounciness: number
                
                friction: number
                
                rollingFriction: number
                
                spinningFriction: number
                
                staticBounciness: number
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class WorldSettingsAsset extends Editor.Assets.Asset {
                
                /** @hidden */
                protected constructor()
                
                getLayersCollidable(layerNumberA: number, layerNumberB: number): boolean
                
                absoluteSpeedLimit: number
                
                defaultFilter: Editor.Assets.Physics.Filter
                
                defaultMatter: Editor.Assets.Physics.Matter
                
                gravity: vec3
                
                relativeSpeedLimit: number
                
                simulationRate: number
                
                slowDownStep: number
                
                slowDownTime: number
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * @beta
        */
        class RemoteMLAsset extends Editor.Assets.MLAsset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @beta
            */
            deviceDependentAssetId: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class RemoteReferenceAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            assetId: string
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A mesh asset to be used with a {@link LensScripting.RenderMeshVisual}
        */
        class RenderMesh extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides the target for a camera to provide its output to. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class RenderTarget extends Editor.Assets.Texture {
            
            /** @hidden */
            protected constructor()
            
            allocateMips: boolean
            
            antialiasingMode: Editor.Assets.AntialiasingMode
            
            clearColor: vec4
            
            clearColorOption: Editor.Assets.ClearColorOption
            
            depthBuffer: Editor.Assets.DepthBufferStrategy
            
            inputTexture: Editor.Assets.Texture
            
            msaaStrategy: Editor.Assets.MSAAStrategy
            
            resolution: Editor.Size
            
            useScreenResolution: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class Sampler {
            
            /** @hidden */
            protected constructor()
            
            filteringMode: Editor.Assets.FilteringMode
            
            mipmapsEnabled: boolean
            
            wrapModeU: Editor.Assets.WrapMode
            
            wrapModeV: Editor.Assets.WrapMode
            
            wrapModeW: Editor.Assets.WrapMode
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The entity which will be coverted into the Lens scene during project export. This scene will contan and own all objects and components in the Lens. This entity can be accessed via the current project’s `model.project.scene`.
        */
        class Scene extends Editor.Assets.ObjectOwner {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Instantiate a prefab as a child of `parent` under this entity.
            */
            instantiatePrefab(prefab: Editor.Assets.ObjectPrefab, parent: Editor.Model.SceneObject): Editor.Model.SceneObject
            
            captureTarget: Editor.Assets.RenderTarget
            
            /**
            * This list of layers that exists within this scene.
            
            * @readonly
            */
            layers: Editor.Model.Layers
            
            liveOverlayTarget: Editor.Assets.RenderTarget
            
            liveTarget: Editor.Assets.RenderTarget
            
            /**
            * The camera that renders `renderOutput`.
            
            * @readonly
            */
            mainCamera: Editor.Components.Camera
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Script Assets are text files that contain the code you write for your Lens. Scripts are written in Javascript or TypeScript. 
        */
        class ScriptAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Returns true if the script inpput is hidden from the scene.
            */
            isScriptInputHidden(inputName: string): boolean
            
            /**
            * Used when you'd like to hide inputs from users in the scene. 
            */
            setScriptInputHidden(inputName: string, hidden: boolean): void
            
            attachments: Editor.Assets.Asset[]
            
            /**
            * Id associated with the script asset. 
            
            * @readonly
            */
            componentId: import('LensStudio:Uuid').Uuid
            
            declarationFile: Editor.Assets.ScriptAsset
            
            /**
            * Description associated with the script asset 
            */
            description: string
            
            /**
            * Export id associated with the script asset. 
            
            * @readonly
            */
            exportId: import('LensStudio:Uuid').Uuid
            
            /**
            * Icon associated with the script asset. 
            */
            icon: Editor.Icon
            
            readMe: Editor.Assets.MarkdownAsset
            
            tags: string[]
            
            /**
            * Version associated with the script asset.
            */
            version: Editor.Assets.Version
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class ScriptInputInfo {
            
            /** @hidden */
            protected constructor()
            
            customTypePropertiesInfo: any
            
            defaultValue: string
            
            isCustomTypeInput: boolean
            
            type: string
            
            uiInfo: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for segmentation texture. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class SegmentationTexture extends Editor.Assets.Texture {
            
            /** @hidden */
            protected constructor()
            
            feathering: number
            
            invertMask: boolean
            
            refineEdge: boolean
            
            segmentationType: Editor.Assets.SegmentationType
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Built in segmentation textures to be used with {@link Editor.Assets.SegmentationTexture}.
        */
        enum SegmentationType {
            PortraitSegmentation,
            PortraitHair,
            PortraitSkin,
            PortraitShoulder,
            PortraitFace,
            PortraitHead,
            Sky,
            Body,
            UpperGarment,
            LowerGarment,
            FullGarment,
            Footwear
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class SetupScript {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            code: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        enum ShaderType {
            Mesh3d,
            PostEffect,
            Hair,
            GaussianSplatting
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class SizeCompressionSettings extends Editor.Assets.FileCompressionSettings {
            
            /** @hidden */
            protected constructor()
            
            level: Editor.Assets.TextureCompressionLevel
            
            static create(scene: Editor.Assets.Scene): Editor.Assets.SizeCompressionSettings
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that can be used with {@link LensScripting.MarkerTrackingComponent} Learn more at {@link LensScripting.SnapcodeMarkerProvider}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class SnapcodeMarker extends Editor.Assets.MarkerAsset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class SubgraphAsset extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class SupabaseProject extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            projectId: string
            
            projectName: string
            
            projectUrl: string
            
            publicToken: string
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A 2D texture asset.
        */
        class Texture extends Editor.Assets.Asset {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        enum TextureCompressionLevel {
            Low,
            Medium,
            High
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class TextureParameter {
            constructor(id: import('LensStudio:Uuid').Uuid)
            
            id: import('LensStudio:Uuid').Uuid
            
            sampler: Editor.Assets.Sampler
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class TypeScriptAsset extends Editor.Assets.ScriptAsset {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            scriptInputInfo: any
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Used to set the version of script assets.
        */
        class Version {
            /**
            * scriptAsset.version = new Editor.Assets.Version(1,2,3);
            */
            constructor(major: number, minor: number, patch: number, prerelease?: string)
            
            /**
            * Major version number.
            */
            major: number
            
            /**
            * Minor version number.
            */
            minor: number
            
            /**
            * Patch version number. 
            */
            patch: number
            
            prerelease: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Used witih {@link Editor.Assets.FaceMesh}
        */
        enum VertexAttribute {
            Position,
            Normal,
            Tangent,
            Color,
            Texcoord0,
            Texcoord1,
            Texcoord2,
            Texcoord3,
            BoneData
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Options for what value is returned when a fetch falls outside the bounds of a texture.
        
        */
        enum WrapMode {
            /**
            * Texture coordinates will be clamped between 0 and 1.
            
            */
            ClampToEdge,
            /**
            * Between -1 and 1, the texture is mirrored across the 0 axis. The image is repeated outside of that range.
            
            */
            MirroredRepeat,
            /**
            * Wrap to the other side of the texture, effectively ignoring the integer part of the number to keep only the fractional part of the texture coordinate.
            
            */
            Repeat,
            /**
            * Outside the range of 0 to 1, texture coordinates return the value specified by the borderColor property.
            
            */
            ClampToBorderColor
        }
    
    }

}

declare namespace Editor {
    enum Axis {
        X,
        Y,
        Z
    }

}

declare namespace Editor {
    class Buffer {
        constructor(bytes: Uint8Array)
        
        toBytes(): Uint8Array
        
        toString(): string
        
    }

}

declare namespace Editor {
    class Components {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Components {
        class AnimationPlayer extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            animationClips: Editor.AnimationClip[]
            
            autoplay: boolean
            
            clipRangeType: Editor.Components.ClipRangeType
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        class AudioComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            audioTrack: Editor.Assets.AudioTrackAsset
            
            curveType: Editor.Components.DistanceEffectCurveType
            
            enableAutoplayLoop: boolean
            
            enableDirectivityEffect: boolean
            
            enableDistanceEffect: boolean
            
            enableMixToSnap: boolean
            
            enablePositionEffect: boolean
            
            enableSpatialAudio: boolean
            
            maxDistance: number
            
            minDistance: number
            
            recordVolume: number
            
            volume: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link LensScripting.Text}.
        */
        class BackgroundSettings extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            cornerRadius: number
            
            enabled: boolean
            
            fill: Editor.Components.TextFill
            
            margins: Editor.Rect
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Head} to set position on the face.
        */
        class BarycentricVertex {
            constructor()
            
            indices: number[]
            
            weights: number[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.BaseMeshVisual}.
        */
        class BaseMeshVisual extends Editor.Components.Visual {
            
            /** @hidden */
            protected constructor()
            
            horizontalAlignment: Editor.Alignment.Horizontal
            
            meshShadowMode: Editor.Components.MeshShadowMode
            
            shadowColor: vec4
            
            shadowDensity: number
            
            stretchMode: Editor.Components.StretchMode
            
            verticalAlignment: Editor.Alignment.Vertical
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Camera}.
        */
        class Camera extends Editor.Components.RenderLayerOwner {
            
            /** @hidden */
            protected constructor()
            
            aspect: number
            
            aspectPreset: Editor.Components.CameraAspectPreset
            
            cameraType: Editor.Components.CameraType
            
            clearColor: Editor.Components.CameraClearColor
            
            clearDepth: Editor.Components.CameraClearDepth
            
            depthMode: Editor.Components.CameraDepthBufferMode
            
            deviceProperty: Editor.Components.CameraDeviceProperty
            
            far: number
            
            fov: number
            
            inputTexture: Editor.Assets.Texture
            
            maskTexture: Editor.Assets.Texture
            
            mipmapLevel: number
            
            near: number
            
            oitLayers: Editor.Components.CameraOitLayers
            
            /**
            * @readonly
            */
            orthographicSize: vec2
            
            renderOrder: number
            
            renderTarget: Editor.Assets.RenderTarget
            
            size: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        */
        enum CameraAspectPreset {
            Specific,
            Custom
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        */
        class CameraClearColor extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            color: vec4
            
            input: Editor.Assets.Texture
            
            mode: Editor.Components.CameraClearColor.Mode
            
            static staticMeta(): Editor.Model.Meta
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace CameraClearColor {
            /**
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
            */
            enum Mode {
                None,
                Background,
                Color,
                Texture
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        */
        class CameraClearDepth extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            input: Editor.Assets.Texture
            
            mode: Editor.Components.CameraClearDepth.Mode
            
            value: number
            
            static staticMeta(): Editor.Model.Meta
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace CameraClearDepth {
            /**
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
            */
            enum Mode {
                None,
                Value,
                Texture
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        */
        enum CameraDepthBufferMode {
            Regular,
            Logarithmic
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        */
        enum CameraDeviceProperty {
            None,
            Aspect,
            Fov,
            All
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        */
        enum CameraOitLayers {
            NoOit,
            Layers4,
            Layers4Plus1,
            Layers8
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        */
        enum CameraType {
            Perspective,
            Orthographic
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link LensScripting.Canvas}.
        */
        class Canvas extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            pivot: vec2
            
            sortingType: Editor.Components.SortingType
            
            unitType: Editor.Components.UnitType
            
            worldSpaceRect: Editor.Rect
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        enum CapitalizationOverride {
            None,
            AllUpper,
            AllLower
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        enum ClipRangeType {
            Frames,
            Seconds
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ClothVisual}.
        */
        class ClothVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            bendMode: Editor.Components.ClothVisual.BendMode
            
            bendStiffness: number
            
            colliders: Editor.Components.Physics.ColliderComponent[]
            
            collisionEnabled: boolean
            
            collisionFriction: number
            
            collisionOffset: number
            
            collisionStiffness: number
            
            debugModeEnabled: boolean
            
            frameRate: number
            
            friction: number
            
            gravity: vec3
            
            iterations: number
            
            mass: number
            
            maxAcceleration: number
            
            mesh: Editor.Assets.RenderMesh
            
            stretchStiffness: number
            
            updateNormalsEnabled: boolean
            
            vertexBindings: Editor.Components.ClothVisual.VertexBinding[]
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace ClothVisual {
            /**
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
            */
            enum BendMode {
                Isometric,
                Linear
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace ClothVisual {
            /**
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
            */
            class VertexBinding extends Editor.Model.Entity {
                
                /** @hidden */
                protected constructor()
                
                color: vec4
                
                colorMask: vec4b
                
                followObject: Editor.Model.SceneObject
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
        */
        class Component extends Editor.Model.Prefabable {
            
            /** @hidden */
            protected constructor()
            
            enabled: boolean
            
            name: string
            
            /**
            * @readonly
            */
            sceneObject: Editor.Model.SceneObject
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.DeviceTracking}.
        */
        class DeviceTracking extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            deviceTrackingMode: Editor.Components.DeviceTrackingMode
            
            rotationOptions: Editor.Components.RotationOptions
            
            surfaceOptions: Editor.Components.SurfaceOptions
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.DeviceTracking}.
        */
        enum DeviceTrackingMode {
            Rotation,
            Surface,
            World
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        enum DistanceEffectCurveType {
            Linear,
            Inverse,
            Logarithm,
            InverseLogarithm
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.
        */
        class DropshadowSettings extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            enabled: boolean
            
            fill: Editor.Components.TextFill
            
            offset: vec2
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.LightSource}.
        */
        enum EnvmapFromCameraMode {
            Auto,
            Face,
            Surface
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text3D}.
        */
        enum ExtrudeDirection {
            Forwards,
            Backwards,
            Both
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.EyeColorVisual}.
        */
        class EyeColorVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            eyeToRender: Editor.Components.EyeToRender
            
            faceIndex: number
            
            rotationEnabled: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.EyeColorVisual}.
        */
        enum EyeToRender {
            Both,
            Left,
            Right
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceInsetRegion}. Use with {@link Editor.Components.FaceInsetVisual}.
        */
        enum FaceInsetRegion {
            LeftEye,
            RightEye,
            Mouth,
            Nose,
            Face,
            Custom
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceInsetVisual}.
        */
        class FaceInsetVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            faceIndex: number
            
            faceRegion: Editor.Components.FaceInsetRegion
            
            flipX: boolean
            
            flipY: boolean
            
            innerBorderRadius: number
            
            offset: vec2
            
            outerBorderRadius: number
            
            pivot: vec2
            
            sourceScale: vec2
            
            subDivisionCount: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceMaskVisual}.
        */
        class FaceMaskVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            drawMouth: boolean
            
            enabledLipsFix: boolean
            
            enabledTeethFix: boolean
            
            faceIndex: number
            
            maskCoordinates: vec2[]
            
            maskOnMouthClosed: Editor.Assets.Texture
            
            originalFaceIndex: number
            
            teethFixAlpha: number
            
            textureCoordinates: vec2[]
            
            useOriginalTexCoords: boolean
            
            useTextureFacePosition: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceStretchVisual}.
        */
        class FaceStretchVisual extends Editor.Components.BaseMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            addFeature(name: string): void
            
            clearFeatures(): void
            
            getFeatureNames(): string[]
            
            getFeaturePoints(name: string): Editor.Components.StretchPoint[]
            
            getFeatureWeight(name: string): number
            
            removeFeature(name: string): void
            
            setFeatureWeight(name: string, weight: number): void
            
            updateFeaturePoints(name: string, points: Editor.Components.StretchPoint[]): void
            
            faceIndex: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        enum FalloffType {
            None,
            Quadratic
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * A component used to render GaussianSplattingAsset.
        */
        class GaussianSplattingVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Specify which frame to display (for animated Gaussian Splattings `.gsaf`).
            */
            activeFrame: number
            
            /**
            * A GaussianSplattingAsset to render.
            */
            asset: Editor.Assets.GaussianSplattingAsset
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.HairVisual}.
        */
        class HairVisual extends Editor.Components.BaseMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            bendStiffness: number
            
            clumpDensity: number
            
            clumpRadius: number
            
            clumpTipScale: number
            
            collapseStiffness: number
            
            colliders: Editor.Components.Physics.ColliderComponent[]
            
            collisionEnabled: boolean
            
            collisionFriction: number
            
            collisionOffset: number
            
            collisionStiffness: number
            
            damp: number
            
            debugDrawLoadedStrands: boolean
            
            debugDrawSimulatedStrands: boolean
            
            debugModeEnabled: boolean
            
            density: number
            
            fallbackModeEnabled: boolean
            
            frameRate: number
            
            friction: number
            
            gravity: vec3
            
            hairData: Editor.Assets.HairDataAsset
            
            hairMaterial: Editor.Assets.Material
            
            hairResolution: number
            
            noise: number
            
            selfCollisionEnabled: boolean
            
            selfCollisionFriction: number
            
            selfCollisionOffset: number
            
            selfCollisionStiffness: number
            
            steppedCutEnabled: boolean
            
            stiffness: number
            
            strandCut: number
            
            strandNeighborCosThreshold: number
            
            strandNeighborLengthThreshold: number
            
            strandNeighborRadius: number
            
            strandTaper: number
            
            strandWidth: number
            
            stretchLimitEnabled: boolean
            
            stretchStiffness: number
            
            twistStiffness: number
            
            windEnabled: boolean
            
            windForce: vec3
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Head}.
        */
        class Head extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            attachedBarycentricVertex: Editor.Components.BarycentricVertex
            
            attachmentPoint: Editor.Components.HeadAttachmentPointType
            
            faceIndex: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Head}.
        */
        enum HeadAttachmentPointType {
            HeadCenter,
            CandideCenter,
            TriangleBarycentric,
            LeftEyeballCenter,
            RightEyeballCenter,
            MouthCenter,
            Chin,
            Forehead,
            LeftForehead,
            RightForehead,
            LeftCheek,
            RightCheek
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text} and {@link Editor.Components.Text3D}.
        */
        enum HorizontalOverflow {
            Overflow,
            Truncate,
            TruncateFront,
            Wrap,
            Ellipsis,
            EllipsisFront,
            Shrink
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Image}.
        */
        class Image extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            flipX: boolean
            
            flipY: boolean
            
            pivot: vec2
            
            rotationAngle: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.InteractionComponent}.
        */
        class InteractionComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            camera: Editor.Components.Camera
            
            depthFilter: boolean
            
            meshVisuals: Editor.Components.BaseMeshVisual[]
            
            minimumTouchSize: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LightSource}.
        */
        class LightSource extends Editor.Components.RenderLayerOwner {
            
            /** @hidden */
            protected constructor()
            
            autoLightSourcePosition: boolean
            
            autoShadowFrustumSize: boolean
            
            autoShadowFrustumSizeExtend: number
            
            color: vec4
            
            diffuseEnvmapTexture: Editor.Assets.Texture
            
            dynamicEnvInputTexture: Editor.Assets.Texture
            
            envmapExposure: number
            
            envmapFromCameraMode: Editor.Components.EnvmapFromCameraMode
            
            envmapRotation: number
            
            estimationSharpness: number
            
            falloffRange: number
            
            falloffType: Editor.Components.FalloffType
            
            innerConeAngle: number
            
            intensity: number
            
            lightType: Editor.Components.LightType
            
            outerConeAngle: number
            
            shadowBlurRadius: number
            
            shadowColor: vec4
            
            shadowDensity: number
            
            shadowFrustumFarClipPlane: number
            
            shadowFrustumNearClipPlane: number
            
            shadowFrustumSize: number
            
            shadowTextureSize: number
            
            shadowType: Editor.Components.ShadowType
            
            specularEnvmapTexture: Editor.Assets.Texture
            
            useEnvmapFromCamera: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.LightSource}.
        */
        enum LightType {
            Point,
            Directional,
            Spot,
            Ambient,
            EnvMap,
            Estimation
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LiquifyVisual}.
        */
        class LiquifyVisual extends Editor.Components.BaseMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            intensity: number
            
            radius: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LocatedAtComponent}.
        */
        class LocatedAtComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            location: Editor.Assets.LocationAsset
            
            position: vec3
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LookAtComponent}.
        */
        class LookAtComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            aimVectors: Editor.Components.LookAtComponent.AimVectors
            
            lookAtMode: Editor.Components.LookAtComponent.LookAtMode
            
            offsetRotation: quat
            
            target: Editor.Model.SceneObject
            
            worldUpVector: Editor.Components.LookAtComponent.WorldUpVector
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace LookAtComponent {
            /**
            * Settings used with {@link Editor.Components.LookAtComponent}.
            */
            enum AimVectors {
                XAimYUp,
                XAimZUp,
                YAimXUp,
                YAimZUp,
                ZAimXUp,
                ZAimYUp,
                XAimNegativeYUp,
                XAimNegativeZUp,
                YAimNegativeXUp,
                YAimNegativeZUp,
                ZAimNegativeXUp,
                ZAimNegativeYUp,
                NegativeXAimYUp,
                NegativeXAimZUp,
                NegativeYAimXUp,
                NegativeYAimZUp,
                NegativeZAimXUp,
                NegativeZAimYUp,
                NegativeXAimNegativeYUp,
                NegativeXAimNegativeZUp,
                NegativeYAimNegativeXUp,
                NegativeYAimNegativeZUp,
                NegativeZAimNegativeXUp,
                NegativeZAimNegativeYUp
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace LookAtComponent {
            /**
            * Settings used with {@link Editor.Components.LookAtComponent}.
            */
            enum LookAtMode {
                LookAtPoint,
                LookAtDirection
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace LookAtComponent {
            /**
            * Settings used with {@link Editor.Components.LookAtComponent}.
            */
            enum WorldUpVector {
                SceneX,
                SceneY,
                SceneZ,
                TargetX,
                TargetY,
                TargetZ,
                ObjectX,
                ObjectY,
                ObjectZ
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ManipulateComponent}.
        */
        class ManipulateComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            drag: boolean
            
            maxDistance: number
            
            maxScale: number
            
            minDistance: number
            
            minScale: number
            
            rotate: boolean
            
            scale: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.MarkerTrackingComponent}.
        */
        class MarkerTrackingComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            marker: Editor.Assets.MarkerAsset
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        class MaskingComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            cornerRadius: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.MaterialMeshVisual}.
        */
        class MaterialMeshVisual extends Editor.Components.BaseMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            addMaterialAt(value: Editor.Assets.Material, pos?: number): void
            
            clearMaterials(): void
            
            getMaterialAt(pos: number): Editor.Assets.Material
            
            getMaterialsCount(): number
            
            indexOfMaterial(value: Editor.Assets.Material): number | undefined
            
            moveMaterial(origin: number, destination: number): void
            
            removeMaterialAt(pos: number): void
            
            setMaterialAt(pos: number, value: Editor.Assets.Material): void
            
            mainMaterial: Editor.Assets.Material
            
            materials: Editor.Assets.Material[]
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.BaseMeshVisual}.
        */
        enum MeshShadowMode {
            None,
            Caster,
            Receiver
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        class ObjectTracking extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @beta
            */
            trackingType: Editor.Components.ObjectTrackingType
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ObjectTracking3D}.
        */
        class ObjectTracking3D extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            matchingRootObject: Editor.Model.SceneObject
            
            objectIndex: number
            
            trackPosition: boolean
            
            trackingAsset: Editor.Assets.Object3DAsset
            
            trackingMode: Editor.Components.ObjectTracking3D.TrackingMode
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace ObjectTracking3D {
            enum TrackingMode {
                ProportionsAndPose,
                PoseOnly,
                Attachment
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.ObjectTracking}.
        */
        enum ObjectTrackingType {
            Cat,
            Dog,
            Pet,
            Hand,
            Nails,
            Shoulder,
            UpperBody,
            FullBody
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.
        */
        class OutlineSettings extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            enabled: boolean
            
            fill: Editor.Components.TextFill
            
            size: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        class Physics {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class BodyComponent extends Editor.Components.Physics.ColliderComponent {
                
                /** @hidden */
                protected constructor()
                
                angularDamping: number
                
                bodySetting: Editor.Components.Physics.BodySetting
                
                bodySettingValue: number
                
                damping: number
                
                dynamic: boolean
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            enum BodySetting {
                Mass,
                Density
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Box extends Editor.Components.Physics.Shape {
                
                /** @hidden */
                protected constructor()
                
                size: vec3
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Capsule extends Editor.Components.Physics.Shape {
                
                /** @hidden */
                protected constructor()
                
                axis: Editor.Axis
                
                length: number
                
                radius: number
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class ColliderComponent extends Editor.Components.Component {
                
                /** @hidden */
                protected constructor()
                
                debugDrawEnabled: boolean
                
                filter: Editor.Assets.Physics.Filter
                
                fitVisual: boolean
                
                forceCompound: boolean
                
                intangible: boolean
                
                matter: Editor.Assets.Physics.Matter
                
                overlapFilter: Editor.Assets.Physics.Filter
                
                rotateSmoothFactor: number
                
                shape: Editor.Components.Physics.Shape
                
                smooth: boolean
                
                translateSmoothFactor: number
                
                worldSettings: Editor.Assets.Physics.WorldSettingsAsset
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Cone extends Editor.Components.Physics.Shape {
                
                /** @hidden */
                protected constructor()
                
                axis: Editor.Axis
                
                length: number
                
                radius: number
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            enum Constraint {
                Fixed,
                Point,
                Hinge
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class ConstraintComponent extends Editor.Components.Component {
                
                /** @hidden */
                protected constructor()
                
                constraint: Editor.Components.Physics.Constraint
                
                debugDrawEnabled: boolean
                
                target: Editor.Components.Physics.ColliderComponent
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Cylinder extends Editor.Components.Physics.Shape {
                
                /** @hidden */
                protected constructor()
                
                axis: Editor.Axis
                
                length: number
                
                radius: number
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class LevelSet extends Editor.Components.Physics.Shape {
                
                /** @hidden */
                protected constructor()
                
                asset: Editor.Assets.Physics.LevelsetColliderAsset
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Mesh extends Editor.Components.Physics.Shape {
                
                /** @hidden */
                protected constructor()
                
                convex: boolean
                
                mesh: Editor.Assets.RenderMesh
                
                skin: Editor.Components.Skin
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Shape extends Editor.Model.EntityStructure {
                
                /** @hidden */
                protected constructor()
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Sphere extends Editor.Components.Physics.Shape {
                
                /** @hidden */
                protected constructor()
                
                radius: number
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class WorldComponent extends Editor.Components.Component {
                
                /** @hidden */
                protected constructor()
                
                updateOrder: number
                
                worldSettings: Editor.Assets.Physics.WorldSettingsAsset
                
                static getMeta(): Editor.Model.Meta
                
                static getTypeName(): string
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace PinToMesh {
            enum Orientation {
                OnlyPosition,
                PositionAndDirection
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        class PinToMeshComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            offsetPosition: vec3
            
            offsetRotation: vec3
            
            orientation: Editor.Components.PinToMesh.Orientation
            
            pinUV: vec2
            
            target: Editor.Components.BaseMeshVisual
            
            useVertexNormal: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.PostEffectVisual}.
        */
        class PostEffectVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.RectangleSetter}.
        */
        class RectangleSetter extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            cropTexture: Editor.Assets.Texture
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The render layer which the component will be on. 
        */
        class RenderLayerOwner extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            renderLayer: Editor.Model.LayerSet
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.RenderMeshVisual}.
        */
        class RenderMeshVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            blendNormals: boolean
            
            blendShapesEnabled: boolean
            
            mesh: Editor.Assets.RenderMesh
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.RetouchVisual}.
        */
        class RetouchVisual extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            eyeWhiteningIntensity: number
            
            faceIndex: number
            
            sharpenEyeIntensity: number
            
            softSkinIntensity: number
            
            teethWhiteningIntensity: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.DeviceTracking}.  @see {@link LensScripting.RotationOptions}.
        */
        class RotationOptions extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            invertRotation: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ScreenRegionComponent}.
        */
        class ScreenRegionComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            region: Editor.Components.ScreenRegionType
            
            resizeWithKeyboard: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.ScreenRegionComponent}.
        */
        enum ScreenRegionType {
            FullFrame,
            Capture,
            Preview,
            SafeRender,
            RoundButton
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ScreenTransform}.
        */
        class ScreenTransform extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            advanced: boolean
            
            anchor: Editor.Rect
            
            constraints: Editor.Components.ScreenTransformConstraints
            
            offset: Editor.Rect
            
            pivot: vec2
            
            transform: Editor.Transform
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.ScreenTransformConstraints}.
        */
        class ScreenTransformConstraints {
            constructor()
            
            fixedHeight: boolean
            
            fixedWidth: boolean
            
            pinToBottom: boolean
            
            pinToLeft: boolean
            
            pinToRight: boolean
            
            pinToTop: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ScriptComponent}.
        */
        class ScriptComponent extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            inputNames: string[]
            
            /**
            * Script asset associated with the script component. 
            */
            scriptAsset: Editor.Assets.ScriptAsset
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        enum ShadowType {
            None,
            Projective,
            ShadowMap
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        class Skin extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            skinBones: any
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.Canvas}.
        */
        enum SortingType {
            Hierarchy,
            Depth
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.BaseMeshVisual}.
        */
        enum StretchMode {
            Fill,
            Fit,
            Stretch,
            FitHeight,
            FitWidth,
            FillAndCut
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.FaceStretchVisual}.
        */
        class StretchPoint {
            constructor()
            
            delta: vec3
            
            index: number
            
            weight: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.DeviceTracking}.
        */
        class SurfaceOptions extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            enhanceWithNativeAR: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Text}.
        */
        class Text extends Editor.Components.BaseMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            advancedLayout: Editor.Components.TextAdvancedLayout
            
            backgroundSettings: Editor.Components.BackgroundSettings
            
            capitalizationOverride: Editor.Components.CapitalizationOverride
            
            depthTest: boolean
            
            dropshadowSettings: Editor.Components.DropshadowSettings
            
            editable: boolean
            
            enableRichText: boolean
            
            font: Editor.Assets.Font
            
            fontSource: (Editor.Assets.FontCollection|Editor.Assets.FontFamily|Editor.Assets.Font)
            
            horizontalOverflow: Editor.Components.HorizontalOverflow
            
            italic: boolean
            
            letterSpacing: number
            
            lineSpacing: number
            
            outlineSettings: Editor.Components.OutlineSettings
            
            showEditingPreview: boolean
            
            size: number
            
            sizeToFit: boolean
            
            text: string
            
            textFill: Editor.Components.TextFill
            
            touchHandler: Editor.Components.InteractionComponent
            
            twoSided: boolean
            
            verticalOverflow: Editor.Components.VerticalOverflow
            
            weight: number
            
            worldSpaceRect: Editor.Rect
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Text3D}.
        */
        class Text3D extends Editor.Components.MaterialMeshVisual {
            
            /** @hidden */
            protected constructor()
            
            advancedLayout: Editor.Components.TextAdvancedLayout
            
            capitalizationOverride: Editor.Components.CapitalizationOverride
            
            editable: boolean
            
            enableBatching: boolean
            
            enableRichText: boolean
            
            extrudeDirection: Editor.Components.ExtrudeDirection
            
            extrusionDepth: number
            
            font: Editor.Assets.Font
            
            fontSource: (Editor.Assets.FontCollection|Editor.Assets.FontFamily|Editor.Assets.Font)
            
            horizontalOverflow: Editor.Components.HorizontalOverflow
            
            italic: boolean
            
            letterSpacing: number
            
            lineSpacing: number
            
            showEditingPreview: boolean
            
            size: number
            
            sizeToFit: boolean
            
            text: string
            
            touchHandler: Editor.Components.InteractionComponent
            
            verticalOverflow: Editor.Components.VerticalOverflow
            
            weight: number
            
            worldSpaceRect: Editor.Rect
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        class TextAdvancedLayout extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            capitalizationOverride: Editor.Components.CapitalizationOverride
            
            extentsTarget: Editor.Components.ScreenTransform
            
            letterSpacing: number
            
            lineSpacing: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
        */
        class TextFill extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            color: vec4
            
            mode: Editor.Components.TextFillMode
            
            texture: Editor.Assets.Texture
            
            textureStretch: Editor.Components.StretchMode
            
            tileCount: number
            
            tileZone: Editor.Components.TextFillTileZone
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
        */
        enum TextFillMode {
            Solid,
            Texture
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        enum TextFillTileZone {
            Rect,
            Extents,
            Character,
            Screen
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Canvas}.  @see {@link LensScripting.Canvas}.
        */
        enum UnitType {
            World,
            Pixels,
            Points
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
        */
        enum VerticalOverflow {
            Overflow,
            Truncate,
            Shrink
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Visual}.
        */
        class Visual extends Editor.Components.Component {
            
            /** @hidden */
            protected constructor()
            
            renderOrder: number
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    class Compression {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Compression {
        class GZip {
            
            /** @hidden */
            protected constructor()
            
            static pack(srcFile: Editor.Path, destFile: Editor.Path): void
            
            /**
            * @beta
            */
            static unpack(srcFile: Editor.Path, dstFile: Editor.Path): void
            
        }
    
    }

}

declare namespace Editor {
    namespace Compression {
        /**
        * Module to zip and unzip files. 
        */
        class Zip {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Pack files into a zip. 
            */
            static pack(src: Editor.Path, destFile: Editor.Path): void
            
            /**
            * Unpack the zip file.
            
            * @beta
            */
            static unpack(src: Editor.Path, destDir: Editor.Path): void
            
        }
    
    }

}

declare namespace Editor {
    /**
    * An action in a {@link Editor.IContextActionRegistry}.
    */
    class ContextAction {
        constructor()
        
        /**
        * Callback for when the action is executed.
        */
        apply: () => void
        
        /**
        * Caption for the action.
        */
        caption: string
        
        /**
        * Description for the action.
        */
        description: string
        
        /**
        * Section for the action to be in. 
        */
        group: string[]
        
        /**
        * Identifier for the caption. 
        */
        id: string
        
    }

}

declare namespace Editor {
    class Dock {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Dock {
        /**
        * Manages the states of Lens Studio panels.
        */
        class IDockManager extends Editor.IPluginComponent {
            
            /** @hidden */
            protected constructor()
            
            activate(panel: IPanelPlugin): void
            
            activatePanels(id: string): void
            
            add(panel: IPanelPlugin): void
            
            containsPanels(id: string): boolean
            
            findPanel(id: string): IPanelPlugin
            
            highlight(panel: IPanelPlugin): void
            
            highlightPanels(id: string): void
            
            /**
            * Reads the current state of the DockManager.
            
            * @beta
            */
            read(reader: import('LensStudio:Serialization').IReader): void
            
            remove(panel: IPanelPlugin): void
            
            removePanels(id: string): void
            
            /**
            * Writes to the Dock Manager.
            
            * @beta
            */
            write(writer: import('LensStudio:Serialization').IWriter): void
            
            /**
            * @readonly
            */
            panels: IPanelPlugin[]
            
            static interfaceId: Editor.InterfaceId
            
        }
    
    }

}

declare namespace Editor {
    class GaussianSplatting {
        
        /** @hidden */
        protected constructor()
        
        static createGsafFromPlyFiles(inputFiles: Editor.Path[], outputPath: Editor.Path, settings: Editor.GaussianSplatting.GsafImporterSettings): Promise<Editor.GaussianSplatting.GsafCreationInfo>
        
        static createGsafImporterSettings(scene: Editor.Assets.Scene): Editor.GaussianSplatting.GsafImporterSettings
        
    }

}

declare namespace Editor {
    namespace GaussianSplatting {
        class GsafCreationInfo {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            bps: number
            
            /**
            * @readonly
            */
            errorMetrics: string
            
            /**
            * @readonly
            */
            qpmInfo: string
            
        }
    
    }

}

declare namespace Editor {
    namespace GaussianSplatting {
        class GsafImporterSettings extends Editor.Model.Entity {
            
            /** @hidden */
            protected constructor()
            
            bitsDeltaPos: number
            
            bitsDeltaRot: number
            
            calculateErrorMetrics: boolean
            
            groupOfPictures: boolean
            
            keyFrameInterval: number
            
            minimumOpacity: number
            
            /**
            * @readonly
            */
            numFrames: number
            
            preserveOrder: boolean
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    class Graph {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    /**
    * Component that allows you to check whether Lens Studio is authorized, as well as get authorization. Requires `snap_auth_token` in the `module.json` of your plugin.
    */
    class IAuthorization extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Initiate the authorization flow.
        */
        authorize(): void
        
        /**
        * @readonly
        */
        idToken: string
        
        /**
        * Current authorization state.
        
        * @readonly
        */
        isAuthorized: boolean
        
        /**
        * Signal that responds to changes in authorization state.
        
        * @readonly
        */
        onAuthorizationChange: signal1<boolean, void>
        
        static interfaceId: Editor.InterfaceId
        
    }

}

declare namespace Editor {
    /**
    * An icon to be used in the Editor UI.
    */
    class Icon {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Creates an icon from an SVG file.
        */
        static fromFile(absoluteFilePath: Editor.Path): Editor.Icon
        
        /**
        * Creates an icon from a buffer containing SVG data.
        */
        static fromSvgData(buffer: string): Editor.Icon
        
    }

}

declare namespace Editor {
    class IContext extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    /**
    * A registry of {@link Editor.ContextAction} which will be shown in a contextual menu (i.e. right click).
    */
    class IContextActionRegistry extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Adds the `action` to the registry.
        */
        registerAction(action: (arg1: Editor.IContext) => Editor): Editor.IGuard
        
        static interfaceId: Editor.InterfaceId
        
    }

}

declare namespace Editor {
    /**
    * Popup window that allows the user to choose specific objects in the Scene hierarchy, or assets in the Asset Browser.
    */
    class IEntityPicker extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * @beta
        */
        requestPicker(entityType: string, callback: (arg1: Editor.Model.Entity) => void): void
        
        static interfaceId: Editor.InterfaceId
        
    }

}

declare namespace Editor {
    /**
    * Represents ownership of a resource. 
    * If this object is garbage collected, or `dispose()` method is called – the associated resource is freed.
    
    */
    class IGuard extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        dispose(): void
        
    }

}

declare namespace Editor {
    class IInterface extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    class InterfaceId {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    class IOverlayManager extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * @beta
        */
        requestShow(overlayID: string): void
        
        static interfaceId: Editor.InterfaceId
        
    }

}

declare namespace Editor {
    class IPackageActions extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        exportAsZip(exportPath: Editor.Path, exportOptions: Editor.Model.ExportOptions, includeCache: boolean): void
        
        exportPackage(nativePackageDescriptor: Editor.Assets.NativePackageDescriptor, path: Editor.Path, exportOptions: Editor.Model.ExportOptions): void
        
        exportScript(scriptAsset: Editor.Assets.ScriptAsset, path: Editor.Path, exportOptions: Editor.Model.ExportOptions): void
        
        static interfaceId: Editor.InterfaceId
        
    }

}

declare namespace Editor {
    class IPackageRegistry extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        canPullUpdate(asset: Editor.Assets.Asset): boolean
        
        canPushUpdate(asset: Editor.Assets.Asset): boolean
        
        canRegisterToLibrary(asset: Editor.Assets.Asset): boolean
        
        getLibraryPaths(): Editor.Path[]
        
        getTypeById(uid: import('LensStudio:Uuid').Uuid, entityBaseType: Editor.Model.EntityBaseType): string
        
        getTypeByName(name: string, entityBaseType: Editor.Model.EntityBaseType): string
        
        getTypeByVersion(uid: import('LensStudio:Uuid').Uuid, version: Editor.Assets.Version, entityBaseType: Editor.Model.EntityBaseType): string
        
        isInLibrary(componentId: import('LensStudio:Uuid').Uuid): boolean
        
        isInProject(componentId: import('LensStudio:Uuid').Uuid): boolean
        
        packageMetadata(sourcePath: Editor.Path): Editor.PackageMetadata
        
        pullUpdate(asset: Editor.Assets.Asset): void
        
        pushUpdate(asset: Editor.Assets.Asset, locked: boolean): void
        
        registerToLibrary(asset: Editor.Assets.Asset): void
        
        selectVersionFromAssetLibrary(descriptor: Editor.Assets.NativePackageDescriptor, asset: import('LensStudio:AssetLibrary').Asset, resource: import('LensStudio:AssetLibrary').Resource): void
        
        static interfaceId: Editor.InterfaceId
        
    }

}

declare namespace Editor {
    class IPlugin extends Editor.IInterface {
        
        /** @hidden */
        protected constructor()
        
        /**
        * @readonly
        */
        id: string
        
    }

}

declare namespace Editor {
    class IPluginComponent extends Editor.IInterface {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    /**
    * The model object is a core concept in the plugin development environment. It serves as a central point for accessing key elements such as the scene, project, and {@link Editor.Model.AssetManager}.  The model object encapsulates the data model representing a Lens Studio project. It brings together environment entities and functionalities that are essential for developing plugins. It plays a role analogous to the "Model" component found in Model-View-Controller architectural patterns, containing both data and business logic.  In order to get the model object, which many key objects are stored within, you need the pluginSystem object which is being passed into the constructor of the plugin class, along with the ID of the model component (which can be accessed through the `Editor` namespace) 
    */
    class Model {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Model {
        class AssetContext extends Editor.IContext {
            
            /** @hidden */
            protected constructor()
            
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
            class Item {
                
                /** @hidden */
                protected constructor()
                
                /**
                * @readonly
                */
                asset: Editor.Assets.Asset
                
                /**
                * @readonly
                */
                path: Editor.Path
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * A handle for the metadata of an asset. 
        */
        class AssetImportMetadata extends Editor.Model.Entity {
            
            /** @hidden */
            protected constructor()
            
            getExtraDataItem(key: string): string
            
            getNativePackageItems(iterateOption: Editor.Model.AssetImportMetadata.PackageIterate): Editor.Model.AssetImportMetadata[]
            
            setExtraDataItem(key: string, value: string): void
            
            /**
            * @readonly
            */
            assetTreePath: Editor.Model.SourcePath
            
            /**
            * A list of all the available assets this handle contains.
            
            * @readonly
            */
            assets: Editor.Assets.Asset[]
            
            compressionSettings: Editor.Assets.AssetCompressionSettings
            
            /**
            * @readonly
            */
            isPackedPackageItem: boolean
            
            /**
            * @readonly
            */
            nativePackageDescriptor: Editor.Assets.NativePackageDescriptor
            
            /**
            * @readonly
            */
            nativePackageRoot: Editor.Model.AssetImportMetadata
            
            /**
            * The primary asset of this handle. Usually, this is the asset you will assign after accessing an asset.
            
            * @readonly
            */
            primaryAsset: Editor.Assets.Asset
            
            /**
            * The source file where the asset was imported from.
            
            * @readonly
            */
            sourcePath: Editor.Path
            
            /**
            * @readonly
            */
            topmostNativePackageRoot: Editor.Model.AssetImportMetadata
            
            static staticMeta(): Editor.Model.Meta
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        namespace AssetImportMetadata {
            enum PackageIterate {
                Shallow,
                Deep
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class AssetManager extends ScriptObject {
            
            /** @hidden */
            protected constructor()
            
            createNativeAsset(assetType: string, baseName: string, relativeDestinationDir: Editor.Model.SourcePath): Editor.Assets.Asset
            
            createPackage(requestedAssets: Editor.Model.AssetImportMetadata[], relativeDestinationDir: Editor.Model.SourcePath, packageName: string, packageOption: Editor.Model.PackageOption): Editor.Model.AssetImportMetadata
            
            exportAssets(requestedAssets: Editor.Model.AssetImportMetadata[], absoluteDestination: Editor.Path): Editor.Model.AssetImportMetadata[]
            
            exportSceneObjects(topLevelSceneObjects: Editor.Model.SceneObject[], absoluteDestination: Editor.Path): Editor.Model.AssetImportMetadata[]
            
            findCopyOrImport(absoluteSourcePath: Editor.Path, relativeDestinationDir?: Editor.Model.SourcePath, options?: any): Editor.Model.AssetImportMetadata
            
            /**
            * Find a copy, if it exists, of a file. 
            */
            findImportedCopy(absoluteSourcePath: Editor.Path, relativeDestinationDir?: Editor.Model.SourcePath, options?: any): Editor.Model.AssetImportMetadata
            
            getFileMeta(relativeFilePath: Editor.Model.SourcePath): Editor.Model.AssetImportMetadata
            
            importExternalFile(absoluteSourcePath: Editor.Path, relativeDestinationDir?: Editor.Model.SourcePath, resultType?: Editor.Model.ResultType, importSettings?: Editor.Model.ImportSettings): Editor.Model.ImportResult
            
            importExternalFileAsync(absoluteSourcePath: Editor.Path, relativeDestinationDir?: Editor.Model.SourcePath, resultType?: Editor.Model.ResultType, importSettings?: Editor.Model.ImportSettings): Promise<Editor.Model.ImportResult>
            
            instantiate(assets: Editor.Assets.Asset[], params?: Editor.Model.InstantiationParams): Promise<Editor.Model.Prefabable[]>
            
            move(fileMeta: Editor.Model.AssetImportMetadata, relativeDestinationDir: Editor.Model.SourcePath): void
            
            remove(relativeFilePath: Editor.Model.SourcePath): void
            
            rename(fileMeta: Editor.Model.AssetImportMetadata, newName: string): void
            
            saveAsPrefab(sceneObject: Editor.Model.SceneObject, relativeDestinationDir: Editor.Model.SourcePath, preferredName?: string): Editor.Assets.ObjectPrefab
            
            saveAsPrefabVariant(sceneObject: Editor.Model.SceneObject, relativeDestinationDir: Editor.Model.SourcePath, preferredName?: string): Editor.Assets.ObjectPrefab
            
            unpack(nativePackageRoot: Editor.Model.AssetImportMetadata): Promise<Editor.Model.ImportResult>
            
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
        class AssetMeta extends Editor.Model.InspectableMeta {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            isNative: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class BaseChangesStream extends ScriptObject {
            
            /** @hidden */
            protected constructor()
            
            executeAsGroup(name: string, change: () => void): void
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        enum DeviceType {
            Unknown,
            Mobile,
            Spectacles,
            Desktop
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * An object in the scene, or asset in the {@link Editor.Model.AssetManager}
        */
        class Entity extends ScriptObject {
            
            /** @hidden */
            protected constructor()
            
            /**
            * A list of entities which this entity has a reference to.
            */
            getDirectlyReferencedEntities(): Editor.Model.Entity[]
            
            /**
            * A list of entities which has a reference to this entity.
            */
            getOwnedEntities(): Editor.Model.Entity[]
            
            /**
            * The unique id of the entity.
            
            * @readonly
            */
            id: import('LensStudio:Uuid').Uuid
            
            /**
            * @readonly
            */
            meta: Editor.Model.Meta
            
            /**
            * The entity's type. 
            
            * @readonly
            */
            type: string
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * @beta
        */
        enum EntityBaseType {
            /**
            * @beta
            */
            Component,
            /**
            * @beta
            */
            Asset
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class EntityPrototypeData {
            constructor()
            
            baseEntityType: string
            
            caption: string
            
            creator: (any|any)
            
            entityType: string
            
            icon: Editor.Icon
            
            section: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class EntityStructure extends Editor.Model.Entity {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class ExportOptions {
            constructor()
            
            externalDependencies: Editor.Model.ExternalPackageDependency[]
            
            packagePolicy: Editor.Assets.PackagePolicy
            
            pluginsToInclude: Editor.Path[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class ExternalPackageDependency {
            constructor()
            
            fileMeta: Editor.Model.AssetImportMetadata
            
            includeInPackage: boolean
            
            versionOverride: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        enum FindOption {
            AcceptModified
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class IEntityPrototypeRegistry extends Editor.IPluginComponent {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @beta
            */
            createEntity(entityType: string, context: (Editor.Path|Editor.Model.Entity), callback: (arg1: Editor.Model.Entity) => void): void
            
            /**
            * @beta
            */
            getCaptionForType(type: string): string
            
            getEntityTypes(baseType: string, acceptsType: (arg1: string) => any): string[]
            
            /**
            * @beta
            */
            getIconForType(type: string): Editor.Icon
            
            registerEntityPrototype(prototypeData: Editor.Model.EntityPrototypeData): Editor.IGuard
            
            static interfaceId: Editor.InterfaceId
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * A registry of various entities. 
        */
        class IEntityRegistry extends Editor.IPluginComponent {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Get the metadata of an entity.
            */
            getMeta(entityType: string): Editor.Model.Meta
            
            static interfaceId: Editor.InterfaceId
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class IModel extends Editor.IPluginComponent {
            
            /** @hidden */
            protected constructor()
            
            openProject(path: Editor.Path): void
            
            setDefaultProject(): void
            
            setEmptyProject(): void
            
            /**
            * @readonly
            */
            onMetaInfoChanged: signal0<void>
            
            /**
            * @readonly
            */
            onProjectAboutToBeChanged: signal0<void>
            
            /**
            * @readonly
            */
            onProjectChanged: signal0<void>
            
            /**
            * @readonly
            */
            onProjectSaving: signal2<Editor.Model.ProjectSaveMode, Editor.Path, void>
            
            /**
            * @readonly
            */
            project: Editor.Model.Project
            
            static interfaceId: Editor.InterfaceId
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The result of {@link Editor.Model.AssetManager.importExternalFile} and {@link Editor.Model.AssetManager.importExternalFileAsync}.
        */
        class ImportResult {
            
            /** @hidden */
            protected constructor()
            
            /**
            * The metadata of the files imported.
            
            * @readonly
            */
            files: Editor.Model.AssetImportMetadata[]
            
            /**
            * A path to the imported file.
            
            * @readonly
            */
            path: Editor.Path
            
            /**
            * The asset which is usually referenced after the asset has been imported.
            
            * @readonly
            */
            primary: Editor.Assets.Asset
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * @beta
        */
        class ImportSettings {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            
            * @beta
            */
            aborted: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class InspectableMeta extends Editor.Model.Meta {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            caption: string
            
            /**
            * @readonly
            */
            icon: Editor.Icon
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class InstantiationParams {
            
            /** @hidden */
            protected constructor()
            
            parents: Editor.Model.SceneObject[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The layers within a {@link Editor.Model.LayerSet}.
        */
        class Layer {
            
            /** @hidden */
            protected constructor()
            
            /**
            * The id of this layer.
            */
            id: Editor.Model.LayerId
            
            /**
            * The name of the layer.
            */
            name: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The id of a {@link Editor.Model.Layer}.
        */
        class LayerId {
            constructor(value: number)
            
            static forEach(predicate: (arg1: Editor.Model.LayerId) => void): void
            
            static forEachUser(predicate: (arg1: Editor.Model.LayerId) => void): void
            
            /**
            * The default layer in a Lens.
            */
            static Default: Editor.Model.LayerId
            
            /**
            * The maximum user of a layer.
            */
            static MaxUser: Editor.Model.LayerId
            
            /**
            * The minimum user of a layer.
            */
            static MinUser: Editor.Model.LayerId
            
            /**
            * The layer which is used by the Orthographic camera by default.
            */
            static Ortho: Editor.Model.LayerId
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The layers of a {@Editor.Assets.Scene}.
        */
        class Layers extends Editor.Model.Entity {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Add `layerId` to this entity.
            */
            add(layerId: Editor.Model.LayerId): Editor.Model.Layer
            
            /**
            * Whether the layers contain `layerId`.
            */
            contains(layerId: Editor.Model.LayerId): boolean
            
            /**
            * Get the layer with `layerId` if possible.
            */
            find(layerId: Editor.Model.LayerId): Editor.Model.Layer | undefined
            
            /**
            * Remove `layerId` from this entity.
            */
            remove(layerId: Editor.Model.LayerId): void
            
            /**
            * Check if another layer can be added to this entity.
            
            * @readonly
            */
            canAdd: boolean
            
            /**
            * The LayerSet which represents this entity.
            
            * @readonly
            */
            combinedIds: Editor.Model.LayerSet
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LayerSet}.
        */
        class LayerSet {
            
            /** @hidden */
            protected constructor()
            
            contains(other: Editor.Model.LayerSet): boolean
            
            except(other: Editor.Model.LayerSet): Editor.Model.LayerSet
            
            intersect(other: Editor.Model.LayerSet): Editor.Model.LayerSet
            
            isEmpty(): boolean
            
            toArray(): Editor.Model.LayerId[]
            
            union(other: Editor.Model.LayerSet): Editor.Model.LayerSet
            
            /**
            * @readonly
            */
            mask: number
            
            static PredefinedIds(): Editor.Model.LayerSet
            
            static fromBit(bit: number): Editor.Model.LayerSet
            
            static fromId(layerId: Editor.Model.LayerId): Editor.Model.LayerSet
            
            static fromMask(mask: number): Editor.Model.LayerSet
            
            static All: Editor.Model.LayerSet
            
            static None: Editor.Model.LayerSet
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The various cameras which will be activated when this project's Lens turns on.
        */
        enum LensActivationCamera {
            /**
            * Opens the front camera by default.
            */
            Front,
            /**
            * Opens the back camera by default.
            */
            Rear
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The various contexts in which this Lens can be used.
        */
        enum LensApplicability {
            /**
            * Lens is usable on the front camera.
            */
            Front,
            /**
            * Lens is usable on the back camera.
            */
            Back
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        enum LensClientCompatibility {
            Mobile,
            Web,
            Spectacles,
            CameraKit
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The metadata of an entity.
        */
        class Meta extends ScriptObject {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Whether the entity can be created.
            
            * @readonly
            */
            isAbstract: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * Metadata of the current project's Lens.
        */
        class MetaInfo {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Sets the `icon` as the Lens' icon.
            */
            setIcon(externalPath: Editor.Path): void
            
            setVideoPreview(externalPath: Editor.Path): void
            
            /**
            * The camera which will be activated when this Lens is turned on. 
            */
            activationCamera: Editor.Model.LensActivationCamera
            
            /**
            * The absolute path to the Lens Icon.
            
            * @readonly
            */
            iconPath: Editor.Path
            
            /**
            * Whether an Lens icon has been set.
            
            * @readonly
            */
            isIconSet: boolean
            
            /**
            * Where the Lens can be used.
            */
            lensApplicability: Editor.Model.LensApplicability[]
            
            lensClientCompatibilities: Editor.Model.LensClientCompatibility[]
            
            /**
            * The publicly visible name of the Lens.
            */
            lensName: string
            
            /**
            * @readonly
            */
            videoPreviewPath: Editor.Path
            
            /**
            * Checks whether the Lens Name is valid. See Project Info guide to learn more.
            */
            static isLensNameValid(lensName: string): boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class ObjectContext extends Editor.IContext {
            
            /** @hidden */
            protected constructor()
            
            /**
            * @readonly
            */
            selection: Editor.Model.SceneObject[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        enum PackageOption {
            Packed,
            Unpacked
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * An entity which can be turned into a prefab, such as {@link Editor.Model.SceneObject}. 
        */
        class Prefabable extends Editor.Model.Entity {
            
            /** @hidden */
            protected constructor()
            
            static getMeta(): Editor.Model.Meta
            
            static getTypeName(): string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class Project extends ScriptObject {
            
            /** @hidden */
            protected constructor()
            
            onEntityAdded(typeName: string): signal1<Editor.Model.Entity, void>
            
            onEntityAdding(typeName: string): signal1<Editor.Model.Entity, void>
            
            onEntityRemoved(typeName: string): signal1<import('LensStudio:Uuid').Uuid, void>
            
            onEntityUpdated(typeName: string): signal1<Editor.Model.Entity, void>
            
            onEntityUpdating(typeName: string): signal1<Editor.Model.Entity, void>
            
            save(): void
            
            saveTo(absoluteFilePath: Editor.Path): void
            
            /**
            * @readonly
            */
            assetManager: Editor.Model.AssetManager
            
            /**
            * @readonly
            */
            assetsDirectory: Editor.Path
            
            /**
            * @readonly
            */
            cacheDirectory: Editor.Path
            
            /**
            * @readonly
            */
            history: any
            
            metaInfo: Editor.Model.MetaInfo
            
            /**
            * @readonly
            */
            projectDirectory: Editor.Path
            
            /**
            * @readonly
            */
            projectFile: Editor.Path
            
            /**
            * @readonly
            */
            scene: Editor.Assets.Scene
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        enum ProjectSaveMode {
            Default,
            Autosave
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * How a file should be imported into the project.
        */
        enum ResultType {
            /**
            * Lens Studio will decide how the file will be imported. 
            */
            Auto,
            /**
            * The imported entities will be readonly. However, the entity cann also be updated from source file.
            */
            Packed,
            /**
            * The entity is unpacked and the entities within exists as if it was imported individually.
            */
            Unpacked
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The same entity as in Lens Scripting.   Can contain one or more {@link Editor.Components.Component}. Additionally, it can have zero or more scene objects which is a child of it.  @see {@link LensScripting.SceneObject}.
        */
        class SceneObject extends Editor.Model.Prefabable {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Add a scene object as a child of this object at a specified `pos`.
            */
            addChildAt(value: Editor.Model.SceneObject, pos?: number): void
            
            /**
            * Add a new {@link Editor.Components.Component} by componentType to this object.
            */
            addComponent<K extends keyof ComponentNameMap>(componentType: K): ComponentNameMap[K]
            
            /**
            * Add the component `value` at the specified `pos`.
            */
            addComponentAt(value: Editor.Components.Component, pos?: number): void
            
            /**
            * Remove all children from this object.
            */
            clearChildren(): void
            
            /**
            * Remove all components from this scene object.
            */
            clearComponents(): void
            
            copy(): Editor.Model.SceneObject
            
            /**
            * Destroy this scene object. All references to it becomes invalid.
            */
            destroy(): void
            
            /**
            * Get a specific object at the specified `pos`.
            */
            getChildAt(pos: number): Editor.Model.SceneObject
            
            /**
            * Get the number of children on this object.
            */
            getChildrenCount(): number
            
            /**
            * Get the first component of `componentType`.
            */
            getComponent<K extends keyof ComponentNameMap>(componentType: K): ComponentNameMap[K]
            
            /**
            * Get the component at the specified `pos`.
            */
            getComponentAt(pos: number): Editor.Components.Component
            
            /**
            * Get all the components of `componentType` on this object.
            */
            getComponents<K extends keyof ComponentNameMap>(componentType: K): ComponentNameMap[K][]
            
            /**
            * Get the number of components on this object.
            */
            getComponentsCount(): number
            
            /**
            * Get the parent of this scene object.
            */
            getParent(): Editor.Model.SceneObject
            
            /**
            * Get the position of a specific object, if the object is a child of this object.
            */
            indexOfChild(value: Editor.Model.SceneObject): number | undefined
            
            /**
            * Get the position of a specific component `value` on this object. 
            */
            indexOfComponent(value: Editor.Components.Component): number | undefined
            
            /**
            * Move `child` in the order of children on this object.
            */
            moveChild(child: Editor.Model.SceneObject, destination: number): void
            
            /**
            * Move the component `value` to a specified `pos`.
            */
            moveComponent(origin: number, destination: number): void
            
            /**
            * Remove a child from this from this scene object.
            */
            removeChild(child: Editor.Model.SceneObject): void
            
            /**
            * Remove a child at the specified `pos`.
            */
            removeChildAt(pos: number): void
            
            /**
            * Remove the first component of `componentType` from this object.
            */
            removeComponent(componentType: string): boolean
            
            /**
            * Remove the components at the specified `pos`.
            */
            removeComponentAt(pos: number): void
            
            /**
            * Set the child scene object `value` to be at the specified `pos`.
            */
            setChildAt(pos: number, value: Editor.Model.SceneObject): void
            
            /**
            * Set the component `value` to be at the specified `pos`.
            */
            setComponentAt(pos: number, value: Editor.Components.Component): void
            
            /**
            * Set the parent of this scene object.
            */
            setParent(newParent: Editor.Model.SceneObject, position?: number): void
            
            /**
            * A list of scene objects that is a child of this scene object.
            */
            children: Editor.Model.SceneObject[]
            
            /**
            * A list of components that is a child of this scene object.
            */
            components: Editor.Components.Component[]
            
            /**
            * Whether this scene object is enabled or disabled.
            */
            enabled: boolean
            
            /**
            * Whether this scene object contains any component which is of type `Editor.Components.Visual`.
            
            * @readonly
            */
            hasVisuals: boolean
            
            /**
            * The layerSet this scene object is on.
            */
            layers: Editor.Model.LayerSet
            
            /**
            * The transform of this scene object relative to its parent.
            */
            localTransform: Editor.Model.TransformEntity
            
            /**
            * The name of the scene object.
            */
            name: string
            
            /**
            * @readonly
            */
            topOwner: Editor.Assets.ObjectOwner
            
            /**
            * The transform of this scene object relative to the scene its in.
            */
            worldTransform: Editor.Model.WorldTransformAccessor
            
            static commonParent(sceneObjects: Editor.Model.SceneObject[]): Editor.Model.SceneObject
            
            static staticMeta(): Editor.Model.Meta
            
            static topLevel(sceneObjects: Editor.Model.SceneObject[]): Editor.Model.SceneObject[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class SourcePath {
            constructor(relativeToRoot: Editor.Path, rootDirectory: Editor.Model.SourceRootDirectory)
            
            hasExtension(extension: string): boolean
            
            replaceFileNameBase(newBaseName: string): Editor.Model.SourcePath
            
            toString(): string
            
            /**
            * @readonly
            */
            extension: string
            
            /**
            * @readonly
            */
            fileName: Editor.Path
            
            /**
            * @readonly
            */
            fileNameBase: string
            
            /**
            * @readonly
            */
            isEmpty: boolean
            
            /**
            * @readonly
            */
            parent: Editor.Model.SourcePath
            
            /**
            * @readonly
            */
            relativeToProject: Editor.Path
            
            /**
            * @readonly
            */
            relativeToRoot: Editor.Path
            
            /**
            * @readonly
            */
            rootDirectory: Editor.Path
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        enum SourceRootDirectory {
            Assets,
            Packages
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class TransformEntity extends Editor.Model.EntityStructure {
            
            /** @hidden */
            protected constructor()
            
            position: vec3
            
            rotation: vec3
            
            scale: vec3
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class WorldTransformAccessor extends ScriptObject {
            
            /** @hidden */
            protected constructor()
            
            position: vec3
            
            rotation: vec3
            
            scale: vec3
            
        }
    
    }

}

declare namespace Editor {
    class PackageMetadata {
        
        /** @hidden */
        protected constructor()
        
        assetId: string
        
        filePaths: string[]
        
        name: string
        
        tags: string[]
        
        uid: import('LensStudio:Uuid').Uuid
        
        versionMajor: number
        
        versionMinor: number
        
        versionPatch: number
        
    }

}

declare namespace Editor {
    /**
    * A path in the filesystem, or Asset Manager. Useful for things like importing files into Lens Studio through the {@link Editor.Model.AssetManager}. 
    */
    class Path {
        /**
        * Construct a new path object.
        */
        constructor(str: string)
        
        /**
        * Returns a new path object relative to the `rootPath`.
        */
        appended(path: Editor.Path): Editor.Path
        
        /**
        * Whether the path object has a file extension in the end.
        */
        hasExtension(extension: string): boolean
        
        /**
        * Whether the current path is inside `directory`. 
        */
        isInside(directory: Editor.Path): boolean
        
        /**
        * Returns a new path object relative to the `rootPath`.
        */
        relative(rootPath: Editor.Path): Editor.Path
        
        /**
        * Rename the extension of the file. 
        */
        replaceExtension(newExtension: string): Editor.Path
        
        replaceFileNameBase(name: string): Editor.Path
        
        /**
        * Returns the current path as a string.
        */
        toString(): string
        
        /**
        * The extension of the file of the current path object (without dot).
        
        
        * @readonly
        */
        extension: string
        
        /**
        * The name of the file, including its extension, in the current path object.
        
        * @readonly
        */
        fileName: Editor.Path
        
        /**
        * The name of the file, without its extension, in the current path object.
        
        * @readonly
        */
        fileNameBase: string
        
        /**
        * @readonly
        */
        isEmpty: boolean
        
        /**
        * A path to the parent folder of the current path object.
        
        * @readonly
        */
        parent: Editor.Path
        
        static equals(lhs: Editor.Path, rhs: Editor.Path): boolean
        
    }

}

declare namespace Editor {
    enum PlaybackMode {
        Single,
        Loop,
        PingPong
    }

}

declare namespace Editor {
    /**
    * Provides access to the Lens Studio editor plugins, components, and interfaces
    */
    class PluginSystem extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        create(descriptor: IPluginDescriptor): Editor.IPlugin
        
        /**
        * Get various interfaces to the Lens Studio editor, such as its {@link Editor.Model} and {@link Editor.Model.AssetManager}. 
        */
        findInterface(id: any): Editor.IInterface
        
        loadDirectory(directory: Editor.Path): void
        
        unloadDirectory(directory: Editor.Path): void
        
        /**
        * @readonly
        */
        descriptors: IPluginDescriptor[]
        
    }

}

declare namespace Editor {
    class Point {
        constructor()
        
        x: number
        
        y: number
        
    }

}

declare namespace Editor {
    /**
    * Used with {@link Editor.Components.ScreenTransform}.
    */
    class Rect {
        constructor()
        
        getCenter(): vec2
        
        getSize(): vec2
        
        setCenter(center: vec2): void
        
        setSize(size: vec2): void
        
        toVec4(): vec4
        
        bottom: number
        
        left: number
        
        leftBottom: vec2
        
        right: number
        
        rightTop: vec2
        
        top: number
        
        static create(left: number, right: number, bottom: number, top: number): Editor.Rect
        
        static fromMinMax(min: vec2, max: vec2): Editor.Rect
        
    }

}

declare namespace Editor {
    class ScopedConnection extends Editor.IGuard {
        
        /** @hidden */
        protected constructor()
        
        disconnect(): boolean
        
        /**
        * @readonly
        */
        isConnected: boolean
        
    }

}

declare namespace Editor {
    class Shape {
        
        /** @hidden */
        protected constructor()
        
        static createBoxShape(scene: Editor.Assets.Scene): Editor.Components.Physics.Box
        
        static createCapsuleShape(scene: Editor.Assets.Scene): Editor.Components.Physics.Capsule
        
        static createConeShape(scene: Editor.Assets.Scene): Editor.Components.Physics.Cone
        
        static createCylinderShape(scene: Editor.Assets.Scene): Editor.Components.Physics.Cylinder
        
        static createLevelSetShape(scene: Editor.Assets.Scene): Editor.Components.Physics.LevelSet
        
        static createMeshShape(scene: Editor.Assets.Scene): Editor.Components.Physics.Mesh
        
        static createSphereShape(scene: Editor.Assets.Scene): Editor.Components.Physics.Sphere
        
    }

}

declare namespace Editor {
    /**
    * Used with {@link Editor.Assets.RenderTarget}.
    */
    class Size {
        constructor(x: number, y: number)
        
        equal(value: Editor.Size): boolean
        
        isEmpty(): boolean
        
        toVec2(): vec2
        
        x: number
        
        y: number
        
        static fromVec2(value: vec2): Editor.Size
        
    }

}

declare namespace Editor {
    /**
    * Used with {@link Editor.Model.SceneObject}.
    */
    class Transform {
        constructor(position: vec3, rotation: vec3, scale: vec3)
        
        position: vec3
        
        rotation: vec3
        
        scale: vec3
        
    }

}

declare namespace Editor {
    class Version {
        
        /** @hidden */
        protected constructor()
        
        /**
        * @readonly
        */
        major: number
        
        /**
        * @readonly
        */
        minor: number
        
        /**
        * @readonly
        */
        patch: number
        
    }

}

declare class IPanelPlugin extends Editor.IPlugin {
    
    /** @hidden */
    protected constructor()
    
    /**
    * @readonly
    */
    title: string
    
    /**
    * @readonly
    */
    widget: import('LensStudio:Ui').Widget
    
}

declare class IPluginDescriptor extends ScriptObject {
    
    /** @hidden */
    protected constructor()
    
    /**
    * @readonly
    */
    dependencies: Editor.InterfaceId[]
    
    /**
    * Human-readable description of the plugin.
    
    * @readonly
    */
    description: string
    
    /**
    * Unique identifier string for the plugin.
    
    * @readonly
    */
    id: string
    
    /**
    * List of interface IDs that this plugin implements or exposes.
    
    * @readonly
    */
    interfaces: Editor.InterfaceId[]
    
    /**
    * Display name of the plugin.
    
    * @readonly
    */
    name: string
    
}

/**
* Module for sending analytics events from a Lens to Snap's analytics pipeline.

* @module LensStudio:Analytics
*/
declare module "LensStudio:Analytics" {
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:App`.

* @module LensStudio:App
*/
declare module "LensStudio:App" {
    /**
    * A map containing the PATH and PWD environment variables of the current Lens Studio process.
    */
    let env: any
    
    /**
    * The Lens Studio version.
    */
    let version: string
    
}

/**
* Plugin module that handles instantiation of assets within the Lens Studio Editor environment.

* @module LensStudio:AssetInstantiator
*/
declare module "LensStudio:AssetInstantiator" {
}

declare module "LensStudio:AssetInstantiator" {
    /**
    * Plugin that instantiates assets into a scene by placing them as scene objects.
    */
    class AssetInstantiator extends Editor.IPlugin {
        /**
        * Constructs an AssetInstantiator plugin instance with the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Instantiates an asset into a scene under the given target scene object, returning the created prefabable objects.
        */
        instantiate(asset: Editor.Assets.Asset, scene: Editor.Assets.ObjectOwner, target: Editor.Model.SceneObject): Editor.Model.Prefabable[]
        
        /**
        * Resolves and prepares all asset dependencies required before instantiation, returning them as a promise.
        */
        prepareDependencies(asset: Editor.Assets.Asset, manager: Editor.Model.AssetManager): Promise<Editor.Assets.Asset[]>
        
        /**
        * The plugin system instance this instantiator is registered with.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

declare module "LensStudio:AssetInstantiator" {
    /**
    * Descriptor for an asset instantiator plugin, providing metadata and a predicate to control which assets can be instantiated.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new Descriptor instance for configuring the AssetInstantiator plugin.
        */
        constructor()
        
        /**
        * Function that takes an asset and returns whether it can be instantiated by this descriptor.
        */
        canInstantiate: (arg1: Editor.Assets.Asset) => any
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:AssetLibrary`.

* @module LensStudio:AssetLibrary
*/
declare module "LensStudio:AssetLibrary" {
}

declare module "LensStudio:AssetLibrary" {
    /**
    * A handle for an asset from the Asset Library.
    */
    class Asset {
        
        /** @hidden */
        protected constructor()
        
        /**
        * The id of the asset.
        
        * @readonly
        */
        assetId: string
        
        /**
        * The name of the asset.
        
        * @readonly
        */
        assetName: string
        
        /**
        * The type of the asset.
        
        * @readonly
        */
        assetType: AssetType
        
        /**
        * Complexity rating of the asset.
        
        * @readonly
        */
        complexity: number
        
        /**
        * Name or identifier of the asset's creator.
        
        * @readonly
        */
        creator?: Creator
        
        /**
        * Short description of the asset.
        
        * @readonly
        */
        description: string
        
        /**
        * URL pointing to the asset's documentation page.
        
        * @readonly
        */
        documentationUrl: string
        
        /**
        * Full-length description of the asset.
        
        * @readonly
        */
        fullDescription: string
        
        /**
        * Maximum Lens Studio version compatible with this asset.
        
        * @readonly
        */
        maxLsVersion: Editor.Version
        
        /**
        * List of platforms the asset supports.
        
        * @readonly
        */
        platforms: Platform[]
        
        /**
        * Preview images or media associated with the asset.
        
        * @readonly
        */
        previews: Resource[]
        
        /**
        * A handle for the resources contained in the asset that can be downloaded.
        
        * @readonly
        */
        resources: Resource[]
        
        /**
        * Subcategory tags assigned to the asset.
        
        * @readonly
        */
        subcategories: Subcategory[]
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A filter used to narrow down an AssetListRequest.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetFilter {
        /**
        * Constructs a new AssetFilter for narrowing down an AssetListRequest.
        */
        constructor()
        
        /**
        * Array of category ID strings used to filter assets by category.
        */
        categoryIds: string[]
        
        /**
        * Pagination settings controlling page size and offset for asset query results.
        */
        pagination: Pagination
        
        /**
        * Text string used to filter assets by name or keyword.
        */
        searchText: string
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A request object for finding assets in the Asset Library.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetListRequest {
        /**
        * Creates a new AssetListRequest for querying the Asset Library.
        */
        constructor(environmentSetting: EnvironmentSetting, assetFilter: AssetFilter)
        
        /**
        * Filter criteria used to narrow down the list of assets to retrieve.
        
        * @readonly
        */
        assetFilter: AssetFilter
        
        /**
        * Environment setting that determines which asset environment context to query.
        
        * @readonly
        */
        environmentSetting: EnvironmentSetting
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A handle returned by the  {@link "LensStudio:AssetLibrary".AssetListService}.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetListResponse {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Indicates whether the asset list request was cancelled before completion.
        
        * @readonly
        */
        cancelled: boolean
        
        /**
        * The successful result payload of the asset list request, present when the request succeeded.
        
        * @readonly
        */
        data?: AssetListSuccess
        
        /**
        * The error details from the asset list request, present when the request failed.
        
        * @readonly
        */
        error?: ServiceError
        
        /**
        * Indicates whether the asset list request completed successfully without errors.
        
        * @readonly
        */
        ok: boolean
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A handle to the  {@link "LensStudio:AssetLibrary".AssetListService} which can provide a list of assets based on the passed in parameters.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetListService extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Fetches a list of assets from the Asset Library matching the given request, returning a promise that resolves to an AssetListResponse.
        */
        fetchAsync(request: AssetListRequest): Promise<AssetListResponse>
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The result of a `fetch` call by the {@link "LensStudio:AssetLibrary".AssetListService}, which provides you a list of matching assets in the Asset Library.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetListSuccess {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Array of assets returned from a successful asset list request.
        
        * @readonly
        */
        assets: Asset[]
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The types of assets that might be provided by the {@link "LensStudio:AssetLibrary"}.
    */
    enum AssetType {
        /**
        * Represents an unrecognized or unset asset type.
        */
        Invalid,
        /**
        * Represents a static texture asset.
        */
        Texture,
        /**
        * Represents an animated texture asset.
        */
        AnimatedTexture,
        /**
        * Represents a material asset.
        */
        Material,
        /**
        * Represents a 3D mesh asset.
        */
        Mesh3D,
        /**
        * Represents a script asset.
        */
        Script,
        /**
        * Represents a predefined scene object preset.
        */
        ObjectPreset,
        /**
        * Represents a reusable scene object prefab.
        */
        ObjectPrefab,
        /**
        * Represents an audio asset.
        */
        Audio,
        /**
        * Represents a machine learning model asset.
        */
        MLModel,
        /**
        * Represents a project template asset.
        */
        ProjectTemplate,
        /**
        * Represents a music asset.
        */
        Music,
        /**
        * Represents a remote API asset.
        */
        RemoteApi,
        /**
        * Represents a custom component asset.
        */
        CustomComponent,
        /**
        * Represents a video asset.
        */
        Video,
        /**
        * Represents a guide or tutorial asset.
        */
        Guide,
        /**
        * Represents a plugin asset.
        */
        Plugin,
        /**
        * Represents a packaged bundle of assets.
        */
        AssetPackage,
        /**
        * Default asset type used when no specific type is specified.
        */
        Default
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Represents metadata about the creator of an Asset Library asset.
    */
    class Creator {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Display name of the creator.
        
        * @readonly
        */
        displayName: string
        
        /**
        * Whether the creator is an official Lens creator.
        
        * @readonly
        */
        officialLensCreator: boolean
        
        /**
        * URL to the creator's profile page.
        
        * @readonly
        */
        profileUrl: string
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The Asset Library environment which assets should be searched within. In most cases `Production` should be used. Used with {@link "LensStudio:AssetLibrary".EnvironmentSetting}.   @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    enum Environment {
        /**
        * Represents an invalid or unset environment state.
        */
        Invalid,
        /**
        * Targets the live production Asset Library environment.
        */
        Production,
        /**
        * Targets the staging Asset Library environment for pre-release testing.
        */
        Staging
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A configuration object that describes what Asset Library environment should be accessed.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class EnvironmentSetting {
        /**
        * Constructs a new EnvironmentSetting instance for configuring the Asset Library environment.
        */
        constructor()
        
        /**
        * The target environment for the asset library request.
        */
        environment: Environment
        
        /**
        * The space context associated with the environment setting.
        */
        space: Space
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Request object for fetching multiple assets by their IDs from the Asset Library.
    */
    class GetAssetsByIdsRequest {
        /**
        * Constructs a new GetAssetsByIdsRequest for fetching assets by their IDs from the Asset Library.
        */
        constructor(environmentSetting: EnvironmentSetting, assetIds: string[])
        
        /**
        * Array of asset ID strings to retrieve.
        
        * @readonly
        */
        assetIds: string[]
        
        /**
        * Environment setting that determines which backend environment to query.
        
        * @readonly
        */
        environmentSetting: EnvironmentSetting
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Response object returned from a bulk asset lookup by IDs.
    */
    class GetAssetsByIdsResponse {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Indicates whether the request was cancelled before completing.
        
        * @readonly
        */
        cancelled: boolean
        
        /**
        * Asset data returned by the request, if successful.
        
        * @readonly
        */
        data?: any
        
        /**
        * Service error details if the request failed.
        
        * @readonly
        */
        error?: ServiceError
        
        /**
        * True if the request completed successfully without errors.
        
        * @readonly
        */
        ok: boolean
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Service for fetching assets from the Asset Library by their IDs.
    */
    class GetAssetsByIdsService extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Fetches assets matching the given IDs request and returns a promise resolving to the response.
        */
        fetchAsync(request: GetAssetsByIdsRequest): Promise<GetAssetsByIdsResponse>
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A handle that provides access to the AssetLibraryListService.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class IAssetLibraryProvider extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Service for listing assets from the asset library.
        
        * @readonly
        */
        assetService: AssetListService
        
        /**
        * Service for fetching assets by their IDs.
        
        * @readonly
        */
        assetsByIdsService: GetAssetsByIdsService
        
        /**
        * Service for listing music assets from the asset library.
        
        * @readonly
        */
        musicService: MusicListService
        
        /**
        * Unique identifier for the IAssetLibraryProvider plugin component interface.
        */
        static interfaceId: Editor.InterfaceId
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Provides access to licensed music import functionality for adding music assets to a project.
    */
    class LicensedMusic {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Imports a licensed music asset into the specified project, returning true on success.
        */
        static importMusic(musicAsset: MusicAsset, project: Editor.Model.Project): boolean
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Represents a music asset from the Asset Library, containing metadata and resources for a licensed music track.
    */
    class MusicAsset {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Name of the artist who created the music track.
        
        * @readonly
        */
        artistName: string
        
        /**
        * Unique identifier for this asset in the Asset Library.
        
        * @readonly
        */
        assetId: string
        
        /**
        * Display name of the music asset.
        
        * @readonly
        */
        assetName: string
        
        /**
        * Type category of the asset, as an AssetType enum value.
        
        * @readonly
        */
        assetType: AssetType
        
        /**
        * Complexity rating or level associated with this asset.
        
        * @readonly
        */
        complexity: number
        
        /**
        * Creator or rights holder of the asset.
        
        * @readonly
        */
        creator?: Creator
        
        /**
        * Short description of the music asset.
        
        * @readonly
        */
        description: string
        
        /**
        * URL pointing to documentation or more information about this asset.
        
        * @readonly
        */
        documentationUrl: string
        
        /**
        * Extended description of the music asset with additional detail.
        
        * @readonly
        */
        fullDescription: string
        
        /**
        * Indicates whether the track contains explicit content.
        
        * @readonly
        */
        isExplicit: boolean
        
        /**
        * Maximum Lens Studio version this asset is compatible with.
        
        * @readonly
        */
        maxLsVersion: Editor.Version
        
        /**
        * List of platforms on which this asset is available.
        
        * @readonly
        */
        platforms: Platform[]
        
        /**
        * Preview resources available for this music asset.
        
        * @readonly
        */
        previews: Resource[]
        
        /**
        * Downloadable or importable resources associated with this asset.
        
        * @readonly
        */
        resources: Resource[]
        
        /**
        * Subcategory tags used to classify this asset within the library.
        
        * @readonly
        */
        subcategories: Subcategory[]
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Response returned from a music list query, containing either a success result or a service error.
    */
    class MusicListResponse {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Indicates whether the request was cancelled before completion.
        
        * @readonly
        */
        cancelled: boolean
        
        /**
        * Holds the successful result of the music list request, if available.
        
        * @readonly
        */
        data?: MusicListSuccess
        
        /**
        * Contains the service error if the request failed.
        
        * @readonly
        */
        error?: ServiceError
        
        /**
        * Indicates whether the request completed successfully without errors.
        
        * @readonly
        */
        ok: boolean
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Service for fetching lists of music assets from the Asset Library.
    */
    class MusicListService extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Fetches a list of music assets matching the given request and returns a promise resolving to a MusicListResponse.
        */
        fetchAsync(request: AssetListRequest): Promise<MusicListResponse>
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Successful result of a music list query, containing the retrieved music assets.
    */
    class MusicListSuccess {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Array of music assets returned from a successful music list request.
        
        * @readonly
        */
        musicAssets: MusicAsset[]
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Configuration for the page to be accessed in a {@link "LensStudio:AssetLibrary".AssetFilter}.
    */
    class Pagination {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Maximum number of items to return in a single page.
        
        * @readonly
        */
        limit: number
        
        /**
        * Starting index for the current page of results.
        
        * @readonly
        */
        offset: number
        
        /**
        * Creates a Pagination instance with the given offset and limit for a single batch request.
        */
        static singleBatch(offset: number, limit: number): Pagination
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Enum representing the target platform for an asset in the Asset Library.
    */
    enum Platform {
        /**
        * No specific platform target.
        */
        None,
        /**
        * Targets the Snapchat platform.
        */
        Snapchat,
        /**
        * Targets the Spectacles platform.
        */
        Spectacles,
        /**
        * Targets the Camera Kit platform.
        */
        CameraKit
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The actual resources of an {@link "LensStudio:AssetLibrary".Asset}.
    */
    class Resource {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Text description of the asset library resource.
        
        * @readonly
        */
        description: string
        
        /**
        * Display name of the asset library resource.
        
        * @readonly
        */
        name: string
        
        /**
        * URI identifying the location of the asset library resource.
        
        * @readonly
        */
        uri: string
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The callback of an errored `fetch` call by the {@link "LensStudio:AssetLibrary".AssetListService}.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class ServiceError {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Human-readable message describing the service error.
        
        * @readonly
        */
        description: string
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The Asset Library space which assets should be searched within. In most cases `Public` should be used. Used with {@link "LensStudio:AssetLibrary".EnvironmentSetting}.   @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    enum Space {
        /**
        * Represents an invalid or unset space value.
        */
        Invalid,
        /**
        * Denotes an asset space restricted to internal use.
        */
        Internal,
        /**
        * Denotes an asset space accessible publicly.
        */
        Public
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Tag or classification used to further categorize an asset within its primary asset type.
    */
    class Subcategory {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Asset Library subcategory. Mostly used for Templates, and handling new/updaetd tags.
        
        * @readonly
        */
        description: string
        
        /**
        * @readonly
        */
        iconUrl: string
        
        /**
        * @readonly
        */
        id: string
        
        /**
        * @readonly
        */
        name: string
        
    }

}

/**
* Provides a chat-based assistant plugin integrated into the Lens Studio editor environment.

* @module LensStudio:ChatAssistant
*/
declare module "LensStudio:ChatAssistant" {
}

/**
* Provides the base class, descriptor, registry interface, and result types for creating AI-invokable ChatTool plugins.

* @module LensStudio:ChatTool
*/
declare module "LensStudio:ChatTool" {
}

declare module "LensStudio:ChatTool" {
    /**
    * Base class for AI-invokable plugin operations in Developer Mode that execute on demand and return a Result.
    */
    class ChatTool extends Editor.IPlugin {
        /**
        * Constructs a ChatTool plugin instance with the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Executes the tool with the given parameters and returns a Result containing output data or an error string.
        */
        execute(parameters: Parameters): Promise<Result>
        
        /**
        * The PluginSystem instance used to access shared Editor interfaces via findInterface().
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

declare module "LensStudio:ChatTool" {
    /**
    * Descriptor for a ChatTool plugin, holding registration metadata and the JSON schema for its AI-callable parameters.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new ChatTool Descriptor with default values for id, name, description, and dependencies.
        */
        constructor()
        
        /**
        * JSON schema object defining the parameters accepted by the chat tool's execute() method.
        */
        schema: any
        
    }

}

declare module "LensStudio:ChatTool" {
    /**
    * Registry interface for discovering and executing registered ChatTool plugins.
    */
    class IChatToolRegistry extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Execute a registered chat tool by its plugin descriptor with the given parameters.
        */
        execute(descriptor: IPluginDescriptor, parameters: Parameters): Promise<Result>
        
        /**
        * Signal emitted when a chat tool plugin is unregistered from the registry.
        
        * @readonly
        */
        toolDeregistered: signal1<IPluginDescriptor, void>
        
        /**
        * Signal emitted when a new chat tool plugin is registered.
        
        * @readonly
        */
        toolRegistered: signal1<IPluginDescriptor, void>
        
        /**
        * Array of all currently registered chat tool plugin descriptors.
        
        * @readonly
        */
        tools: IPluginDescriptor[]
        
        /**
        * Unique identifier used to look up this interface via the plugin system.
        */
        static interfaceId: Editor.InterfaceId
        
    }

}

declare module "LensStudio:ChatTool" {
    /**
    * Holds input data passed to a ChatTool when invoked by the AI assistant.
    */
    class Parameters {
        /**
        * Constructs a new Parameters instance for configuring a ChatTool plugin descriptor.
        */
        constructor()
        
        /**
        * Arbitrary payload containing the tool's input parameters, structured per the tool's schema.
        */
        data: any
        
    }

}

declare module "LensStudio:ChatTool" {
    /**
    * Return value from a ChatTool execute() call, carrying either output data or an error message.
    */
    class Result {
        /**
        * Constructs a new Result object for returning operation outcomes from a ChatTool execute() method.
        */
        constructor()
        
        /**
        * Holds the successful output payload returned by the tool operation.
        */
        data: any
        
        /**
        * Error message string set when the tool operation fails; empty on success.
        */
        error: string
        
    }

}

/**
* Provides clipboard integration for reading and writing data within the Editor.

* @module LensStudio:Clipboard
*/
declare module "LensStudio:Clipboard" {
    /**
    * Global clipboard instance for the current Editor session.
    */
    let clipboard: import('LensStudio:Clipboard').Clipboard
    
}

declare module "LensStudio:Clipboard" {
    /**
    * Provides access to the system clipboard within the Lens Studio editor.
    */
    class Clipboard {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Current text content of the clipboard.
        */
        text: string
        
    }

}

/**
* Module providing the CoreService base class and Descriptor for registering background plugin services.

* @module LensStudio:CoreService
*/
declare module "LensStudio:CoreService" {
}

declare module "LensStudio:CoreService" {
    /**
    * Base class for background plugins that run without a UI, managed by the plugin system via start/stop lifecycle.
    */
    class CoreService extends Editor.IPlugin {
        /**
        * Constructs a new CoreService instance, serving as the base class for background plugin services that integrate with the Lens Studio plugin system.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Initialize the service, set up event connections, and begin background operations.
        */
        start(): void
        
        /**
        * Tear down event connections and stop all background operations.
        */
        stop(): void
        
        /**
        * The plugin system instance used to find and access registered interfaces.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

declare module "LensStudio:CoreService" {
    /**
    * Descriptor class for CoreService plugins, providing metadata such as ID, name, description, and dependencies required by the plugin system.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new service descriptor for registering a CoreService plugin with the plugin system.
        */
        constructor()
        
    }

}

/**
* @module LensStudio:Crypto
*/
declare module "LensStudio:Crypto" {
    export function getRandomValues(typedArray: Uint8Array): Uint8Array
    
    export function randomUUID(): string
    
}

declare module "LensStudio:Crypto" {
    class subtle {
        
        /** @hidden */
        protected constructor()
        
        static digest(algorithm: string, data: Uint8Array): Promise<Uint8Array>
        
    }

}

/**
* Plugin module for creating modal or floating dialog windows with custom UI widgets.

* @module LensStudio:DialogPlugin
*/
declare module "LensStudio:DialogPlugin" {
}

declare module "LensStudio:DialogPlugin" {
    /**
    * Descriptor class for configuring a DialogPlugin, providing metadata and dependencies for a temporary UI dialog.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Creates a new DialogPlugin Descriptor instance for configuring dialog plugin metadata.
        */
        constructor()
        
        /**
        * Menu path hierarchy defining where the dialog's action appears in the editor menu.
        */
        menuActionHierarchy: string[]
        
        /**
        * Configuration object specifying how the dialog's action is represented in the editor toolbar.
        */
        toolbarConfig?: import('LensStudio:Ui').ToolbarConfig
        
    }

}

declare module "LensStudio:DialogPlugin" {
    /**
    * Plugin base class for temporary UI dialogs such as confirmations, settings panels, and wizards.
    */
    class DialogPlugin extends Editor.IPlugin {
        /**
        * Constructs a new DialogPlugin instance with the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Tears down the plugin and releases its resources.
        */
        deinit(): void
        
        /**
        * Creates and displays the dialog as a child of the given parent widget, returning the resulting Dialog instance.
        */
        show(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Dialog
        
        /**
        * The PluginSystem instance that owns and manages this plugin.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Base module for creating editor plugins with custom entity editing capabilities.

* @module LensStudio:EditorPlugin
*/
declare module "LensStudio:EditorPlugin" {
}

declare module "LensStudio:EditorPlugin" {
    import {EditorDescriptor} from "LensStudio:PanelPlugin" 
    
    /**
    * Metadata descriptor for an EditorPlugin, providing configuration used by the plugin system before instantiation.
    */
    class Descriptor extends EditorDescriptor {
        /**
        * Constructs a new Descriptor instance for registering an editor plugin.
        */
        constructor()
        
        /**
        * Function that determines whether the plugin can edit a given asset.
        */
        canEdit: (arg1: Editor.Model.Entity) => any
        
    }

}

declare module "LensStudio:EditorPlugin" {
    /**
    * Base class for Lens Studio editor plugins that can create UI widgets and respond to entity edits.
    */
    class EditorPlugin extends Editor.IPlugin {
        /**
        * Constructs an EditorPlugin instance, optionally bound to a plugin system and descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Creates and returns a widget parented to the given parent widget.
        */
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        /**
        * Cleans up and deinitializes the plugin.
        */
        deinit(): void
        
        /**
        * Handles editing of the given entities, returning true if the plugin handled them.
        */
        edit(entities: Editor.Model.Entity[]): boolean
        
        /**
        * The plugin system instance this plugin belongs to.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Provides functionality to generate and register entity types in the Lens Studio Editor.

* @module LensStudio:EntityGenerator
*/
declare module "LensStudio:EntityGenerator" {
}

declare module "LensStudio:EntityGenerator" {
    /**
    * Descriptor for an entity generator plugin, providing metadata such as display order, entity type, and icon.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Creates a new Descriptor instance for configuring an entity generator plugin.
        */
        constructor()
        
        /**
        * Numeric order controlling where this generator appears in the UI relative to others.
        */
        displayOrder: number
        
        /**
        * Target entity category this generator creates  'SceneObject', 'Asset', or 'Component'.
        */
        entityType: string
        
        /**
        * Icon displayed for this generator in the Lens Studio UI.
        */
        icon: Editor.Icon
        
    }

}

declare module "LensStudio:EntityGenerator" {
    /**
    * Plugin that generates a new Entity in the scene.
    */
    class EntityGenerator extends Editor.IPlugin {
        /**
        * Constructs an EntityGenerator plugin instance with the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Generates a new Entity and returns it as a Promise.
        */
        generate(): Promise<Editor.Model.Entity>
        
        /**
        * The PluginSystem instance associated with this plugin.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:FileSystem` and add `filesystem` in your plugin's `module.json`.

* @module LensStudio:FileSystem
*/
declare module "LensStudio:FileSystem" {
    /**
    * `Options` can take recursive and force. The recursive parameter controls whether to read into subdirectories. The force parameter controls whether duplicated contents will be overwritten during the copying process. 
    
    * ```js
    * fs.copyDir(Tests.srcDir, Tests.destDir, {force: true, recursive: true});
    * fs.copyDir(Tests.srcDir, Tests.destDir, null);
    * fs.copyDir(Tests.srcDir, Tests.destDir, {});
    * fs.copyDir(Tests.srcDir, Tests.destDir, {force: false});
    * ```
    */
    export function copyDir(src: Editor.Path, dest: Editor.Path, options: CopyDirOptions): void
    
    /**
    * Copies a file from `src` to `dest`.
    */
    export function copyFile(src: Editor.Path, dest: Editor.Path): void
    
    /**
    * Create a directory at `path`.
    */
    export function createDir(path: Editor.Path, options: CreateDirOptions): void
    
    /**
    * Checks if a file or directory exists at `path`.
    */
    export function exists(path: Editor.Path): boolean
    
    /**
    * Checks whether a `path` is a directory.
    */
    export function isDirectory(path: Editor.Path): boolean
    
    /**
    * Checks whether a `path` is a file.
    */
    export function isFile(path: Editor.Path): boolean
    
    /**
    * Returns the content of `path` as bytes.
    */
    export function readBytes(path: Editor.Path): Uint8Array
    
    /**
    * Returns an array of paths relative to the specified one.
    
    * `Options` can take a single parameter named `recursive` (`false` by default):
    
    *  ```js
    * fs.readDir(Tests.destDir, {recursive: false});
    * ```
    
    */
    export function readDir(path: Editor.Path, options: ReadDirOptions): Editor.Path[]
    
    /**
    * Returns the content of `path`.
    */
    export function readFile(path: Editor.Path): string
    
    /**
    * Resolves a path to its canonical absolute form, following symlinks.
    */
    export function realPath(path: Editor.Path): Editor.Path
    
    /**
    * Removes the `path`.
    */
    export function remove(path: Editor.Path): void
    
    /**
    * Renames the `path`.
    */
    export function rename(oldPath: Editor.Path, newPath: Editor.Path): void
    
    /**
    * Get the size of `path`.
    */
    export function size(path: Editor.Path): number
    
    /**
    * Writes a file to `path` given the `data`.
    */
    export function writeFile(path: Editor.Path, data: (Uint8Array|string)): void
    
}

declare module "LensStudio:FileSystem" {
    /**
    * Used with {@link "LensStudio:FileSystem".CopyDirOptions}. 
    */
    class CopyDirOptions {
        
        /** @hidden */
        protected constructor()
        
        /**
        * When true, overwrites existing files at the destination.
        */
        force: boolean
        
        /**
        * When true, copies nested subdirectories and their contents.
        */
        recursive: boolean
        
    }

}

declare module "LensStudio:FileSystem" {
    /**
    * Used with {@link "LensStudio:FileSystem".CreateDirOptions}.
    */
    class CreateDirOptions {
        
        /** @hidden */
        protected constructor()
        
        /**
        * When true, creates all intermediate directories in the path if they do not exist.
        */
        recursive: boolean
        
    }

}

declare module "LensStudio:FileSystem" {
    /**
    * Used with {@link "LensStudio:FileSystem".ReadDirOptions}.
    */
    class ReadDirOptions {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Whether to read directory contents recursively, including all subdirectories.
        */
        recursive: boolean
        
    }

}

declare module "LensStudio:FileSystem" {
    /**
    * Helper to create temporary directory.
    */
    class TempDir extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Filesystem path to the temporary directory.
        
        * @readonly
        */
        path: Editor.Path
        
        /**
        * Creates a temporary directory which will be deleted the moment all references to it disappears.
        */
        static create(): TempDir
        
    }

}

declare module "LensStudio:FileSystem" {
    /**
    * Monitors a filesystem path for file changes such as additions, modifications, moves, and removals.
    */
    class Watcher extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Begins watching the configured path for filesystem events.
        */
        start(): void
        
        /**
        * Stops watching the configured path for filesystem events.
        */
        stop(): void
        
        /**
        * Indicates whether the watcher is currently active.
        
        * @readonly
        */
        isWatching: boolean
        
        /**
        * Signal emitted when a file is added at the watched path.
        
        * @readonly
        */
        onAdded: signal1<Editor.Path, void>
        
        /**
        * Signal emitted when a file is modified at the watched path.
        
        * @readonly
        */
        onModified: signal1<Editor.Path, void>
        
        /**
        * Signal emitted when a file is moved at the watched path.
        
        * @readonly
        */
        onMoved: signal2<Editor.Path, Editor.Path, void>
        
        /**
        * Signal emitted when a file is removed from the watched path.
        
        * @readonly
        */
        onRemoved: signal1<Editor.Path, void>
        
        /**
        * The filesystem path being monitored by this watcher.
        
        * @readonly
        */
        path: Editor.Path
        
        /**
        * Creates a new Watcher instance for the specified path.
        */
        static create(path: Editor.Path): Watcher
        
    }

}

/**
* Plugin module that exposes GUI service configuration and lifecycle management.

* @module LensStudio:GuiService
*/
declare module "LensStudio:GuiService" {
}

declare module "LensStudio:GuiService" {
    /**
    * Descriptor for a GuiService plugin, providing metadata and instantiation configuration for GUI-based services.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new GuiService Descriptor instance.
        */
        constructor()
        
    }

}

declare module "LensStudio:GuiService" {
    /**
    * Plugin that manages and serves GUI components within the Lens Studio editor.
    */
    class GuiService extends Editor.IPlugin {
        /**
        * Constructs a GuiService plugin instance with the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Starts the GUI service and initializes its GUI components.
        */
        start(): void
        
        /**
        * Stops the GUI service and tears down its GUI components.
        */
        stop(): void
        
        /**
        * The plugin system instance this service is registered with.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Embeds an interactive, real-time lens preview into an editor panel UI.

* @module LensStudio:LensBasedEditorView
*/
declare module "LensStudio:LensBasedEditorView" {
}

/**
* Provides logging infrastructure for Lens Studio, enabling plugins to collect and monitor user log output.

* @module LensStudio:Logger
*/
declare module "LensStudio:Logger" {
}

declare module "LensStudio:Logger" {
    /**
    * Plugin component interface for collecting and exposing user log data.
    */
    class IUserLogCollector extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Signal fired when a log reveal is requested, providing the associated log string.
        
        * @readonly
        */
        onRevealLogRequest: signal1<string, void>
        
        /**
        * Unique identifier for the IUserLogCollector interface.
        */
        static interfaceId: Editor.InterfaceId
        
    }

}

/**
* @module LensStudio:Mcp
*/
declare module "LensStudio:Mcp" {
}

declare module "LensStudio:Mcp" {
    class IMcpServer extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        getConfig(): any | undefined
        
        getServerToken(): string
        
        getServerUrl(): string
        
        isRunning(): boolean
        
        static interfaceId: Editor.InterfaceId
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:ModelUI`.

* @module LensStudio:ModelUi
*/
declare module "LensStudio:ModelUi" {
}

declare module "LensStudio:ModelUi" {
    import {LineEdit} from "LensStudio:Ui" 
    
    /**
    * A line edit widget for picking and referencing a scene entity by type.
    */
    class EntityReferencePickerLine extends LineEdit {
        /**
        * Constructs an EntityReferencePickerLine widget for picking entity references of a given type, bound to the specified asset manager and entity prototype registry.
        */
        constructor(assetManager: Editor.Model.AssetManager, entityPrototypeRegistry: Editor.Model.IEntityPrototypeRegistry, entityType: string, parent: import('LensStudio:Ui').Widget)
        
        /** @internal */
        static create(widget: EntityReferencePickerLine): EntityReferencePickerLine
        
        /**
        * Fired when an asset is highlighted in the picker.
        
        * @readonly
        */
        onAssetHighlight: signal0<void>
        
        /**
        * Fired when the user confirms an entity selection.
        
        * @readonly
        */
        onEntityChoose: signal0<void>
        
        /**
        * Fired when the current entity reference is cleared.
        
        * @readonly
        */
        onEntityClear: signal0<void>
        
        /**
        * Fired when an entity is dropped onto the picker, carrying the dropped entity.
        
        * @readonly
        */
        onEntityDrop: signal1<Editor.Model.Entity, void>
        
        /**
        * Fired when an entity is selected in the picker.
        
        * @readonly
        */
        onEntitySelect: signal0<void>
        
    }

}

/**
* Collection of multimedia UI widgets including a media player with playback state, position, and mute controls.

* @module LensStudio:MultimediaWidgets
*/
declare module "LensStudio:MultimediaWidgets" {
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Network` and add `network` in your plugin's `module.json`. 

* @module LensStudio:Network
*/
declare module "LensStudio:Network" {
    /**
    * Calls a HTTPS endpoint with authorization to Snapchat. See {@link Editor.IAuthorization}. Requires `snap_auth_token` in `module.json` of your plugin.
    
    * @beta
    */
    export function performAuthorizedHttpRequest(request: HttpRequest, callback: (arg1: HttpResponse) => void): void
    
    /**
    * Calls a HTTP endpoint.
    
    * @beta
    */
    export function performHttpRequest(request: HttpRequest, callback: (arg1: HttpResponse) => void): void
    
    /**
    * Request an HTTP call with reply. You should store the reply object (e.g. in the `this` of the plugin) in order for the network connection to be maintained.
    
    * @beta
    */
    export function performHttpRequestWithReply(request: HttpRequest): HttpReply
    
}

declare module "LensStudio:Network" {
    /**
    * A TCP Server address. Use with {@link "LensStudio:Network".TcpServer}.
    */
    class Address {
        /**
        * Constructs a new TCP server address instance for use with TcpServer.
        */
        constructor()
        
        /**
        * The address of the server. You should never pass in an address that includes a schema part (e.g. "http://", "ws://", etc.).
        */
        address: string
        
        /**
        * The port to connect to.
        */
        port: number
        
    }

}

declare module "LensStudio:Network" {
    /**
    * Base class for network servers that accept incoming socket connections.
    */
    class BaseServer extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Closes the server and stops accepting new connections.
        */
        close(): void
        
        /**
        * Starts listening for incoming connections on the specified address; returns true if successful.
        */
        listen(address: Address): boolean
        
        /**
        * The address string the server is currently bound to.
        
        * @readonly
        */
        address: string
        
        /**
        * Signal fired when a new client socket connects to the server.
        
        * @readonly
        */
        onConnect: signal1<import('LensStudio:Network').BaseSocket, void>
        
        /**
        * Signal fired when a server error occurs, passing an error code.
        
        * @readonly
        */
        onError: signal1<number, void>
        
        /**
        * @readonly
        */
        port: number
        
    }

}

declare module "LensStudio:Network" {
    /**
    * Base class for network socket connections providing data transport over local or remote addresses.
    */
    class BaseSocket extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Closes the socket connection gracefully.
        */
        close(): void
        
        /**
        * Destroys the socket and releases all associated resources immediately.
        */
        destroy(): void
        
        /**
        * The local address bound to this socket.
        
        * @readonly
        */
        localAddress: Address
        
        /**
        * Signal fired when the socket successfully establishes a connection.
        
        * @readonly
        */
        onConnect: signal0<void>
        
        /**
        * Signal fired when data is received on the socket, carrying the received buffer.
        
        * @readonly
        */
        onData: signal1<Editor.Buffer, void>
        
        /**
        * Signal fired when the remote end signals the end of transmission.
        
        * @readonly
        */
        onEnd: signal0<void>
        
        /**
        * Signal fired when a socket error occurs.
        
        * @readonly
        */
        onError: signal1<number, void>
        
        /**
        * The remote address this socket is connected to.
        
        * @readonly
        */
        remoteAddress: Address
        
    }

}

declare module "LensStudio:Network" {
    /**
    * Multipart form data container for HTTP requests.
    
    * @beta
    */
    class FormData {
        /**
        * Constructs a new FormData instance for building multipart HTTP request bodies.
        
        * @beta
        */
        constructor()
        
        /**
        * Appends a body part with optional headers to the form data.
        
        * @beta
        */
        append(body: (Uint8Array|string), headers: any): void
        
    }

}

declare module "LensStudio:Network" {
    /**
    * Represents an in-progress HTTP response, providing signals for receiving streamed data, completion, and errors.
    
    * @beta
    */
    class HttpReply extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Signal fired when a chunk of response data is received, providing an Editor.Buffer with the chunk contents.
        
        * @readonly
        
        * @beta
        */
        onData: signal1<Editor.Buffer, void>
        
        /**
        * Signal fired when the HTTP response has fully completed, providing the final HttpResponse.
        
        * @readonly
        
        * @beta
        */
        onEnd: signal1<import('LensStudio:Network').HttpResponse, void>
        
        /**
        * Signal fired when the HTTP request encounters an error, providing the HttpResponse with error details.
        
        * @readonly
        
        * @beta
        */
        onError: signal1<import('LensStudio:Network').HttpResponse, void>
        
    }

}

declare module "LensStudio:Network" {
    /**
    * A HTTP Request configuration. Use with {@link "LensStudio:Network".performHttpRequestWithReply}.
    
    * @beta
    */
    class HttpRequest {
        /**
        * Constructs a new HttpRequest object for use with performHttpRequest or performAuthorizedHttpRequest.
        
        * @beta
        */
        constructor()
        
        /**
        * Authorization credentials attached to the HTTP request.
        
        * @beta
        */
        authorization: Editor.IAuthorization
        
        /**
        * The body for the HTTP Request.
        
        * @beta
        */
        body: (Uint8Array|import('LensStudio:Network').FormData|string)
        
        /**
        * The content type of the request body.
        
        * @beta
        */
        contentType: string
        
        /**
        * The header for the HTTP request.
        
        * @beta
        */
        headers: any
        
        /**
        * The HTTP method to send the request with.
        
        * @beta
        */
        method: HttpRequest.Method
        
        /**
        * The URL where the request should be made to.
        
        * @beta
        */
        url: string
        
    }

}

declare module "LensStudio:Network" {
    namespace HttpRequest {
        /**
        * The method in which to send the HTTP request. Use with {@link "LensStudio:Network".HttpRequest}.
        
        * @beta
        */
        enum Method {
            /**
            * HTTP GET method, used to retrieve a resource.
            
            * @beta
            */
            Get,
            /**
            * HTTP POST method, used to submit data to a resource.
            
            * @beta
            */
            Post,
            /**
            * HTTP PUT method, used to replace a resource with new data.
            
            * @beta
            */
            Put,
            /**
            * HTTP DELETE method, used to remove a resource.
            
            * @beta
            */
            Delete
        }
    
    }

}

declare module "LensStudio:Network" {
    /**
    * An HTTP response, received from the callback to performing a request, such as through: {@link "LensStudio:Network".performHttpRequestWithReply}, or {@link "LensStudio:RemoteServiceModule".performApiRequest}.
    
    * @beta
    */
    class HttpResponse {
        
        /** @hidden */
        protected constructor()
        
        /**
        * The body of this response.
        
        * @readonly
        
        * @beta
        */
        body: Editor.Buffer
        
        /**
        * The content type of this response.
        
        * @readonly
        
        * @beta
        */
        contentType: string
        
        /**
        * The error of this response, if applicable.
        
        * @readonly
        
        * @beta
        */
        error: string
        
        /**
        * The headers of this response.
        
        * @readonly
        
        * @beta
        */
        headers: any
        
        /**
        * The HTTP status code of this response.
        
        * @readonly
        
        * @beta
        */
        statusCode: number
        
    }

}

declare module "LensStudio:Network" {
    /**
    * A class to accept TCP connetions. Useful for receiving streaming data. It's also able to send back responses.
    */
    class TcpServer extends BaseServer {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Create a TCP Server.
        */
        static create(): TcpServer
        
    }

}

declare module "LensStudio:Network" {
    /**
    * TCP socket for use with {@link "LensStudio:Network".TcpSocket}. 
    */
    class TcpSocket extends BaseSocket {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Write to the socket.
        */
        write(data: (Uint8Array|string)): number
        
    }

}

/**
* Provides the base classes and registration utilities for building overlay plugins in Lens Studio.

* @module LensStudio:OverlayPlugin
*/
declare module "LensStudio:OverlayPlugin" {
}

declare module "LensStudio:OverlayPlugin" {
    /**
    * Descriptor class for configuring and registering an overlay plugin, including asset instantiation eligibility.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new Descriptor for an OverlayPlugin.
        */
        constructor()
        
    }

}

declare module "LensStudio:OverlayPlugin" {
    /**
    * Base class for plugins that render overlay UI on top of the editor viewport.
    */
    class OverlayPlugin extends Editor.IPlugin {
        /**
        * Constructs an OverlayPlugin instance with the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Creates and returns the overlay widget attached to the given parent widget.
        */
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        /**
        * Cleans up and releases resources held by the overlay plugin.
        */
        deinit(): void
        
        /**
        * Requests that the overlay be hidden.
        */
        requestHide(): void
        
        /**
        * Requests that the overlay be shown.
        */
        requestShow(): void
        
        /**
        * The plugin system instance this plugin is registered with.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Base module for building persistent UI panel plugins that render widgets within the Lens Studio editor.

* @module LensStudio:PanelPlugin
*/
declare module "LensStudio:PanelPlugin" {
}

declare module "LensStudio:PanelPlugin" {
    /**
    * Metadata descriptor for a PanelPlugin, providing id, name, description, and dependency configuration used by the plugin system before instantiation.
    */
    class Descriptor extends PanelDescriptor {
        /**
        * Constructs a new PanelPlugin descriptor used to plugin metadata such as id, name, description, and dependencies.
        */
        constructor()
        
    }

}

declare module "LensStudio:PanelPlugin" {
    /**
    * Descriptor for a panel plugin that behaves as a dockable editor window within Lens Studio.
    */
    class EditorDescriptor extends PanelDescriptor {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare module "LensStudio:PanelPlugin" {
    /**
    * Descriptor object used to configure and register a panel plugin with Lens Studio.
    */
    class PanelDescriptor extends BaseDescriptor {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Initial dock state of the panel when first opened.
        */
        defaultDockState: import('LensStudio:Ui').DockState
        
        /**
        * Default size of the panel when first created.
        */
        defaultSize: import('LensStudio:Ui').Size
        
        /**
        * Whether only one instance of this panel can exist at a time.
        */
        isUnique: boolean
        
        /**
        * Menu path segments used to place this panel in the application menu.
        */
        menuActionHierarchy: string[]
        
        /**
        * Minimum allowed size of the panel.
        */
        minimumSize: import('LensStudio:Ui').Size
        
        /**
        * Optional toolbar configuration to display in the panel.
        */
        toolbarConfig?: import('LensStudio:Ui').ToolbarConfig
        
    }

}

declare module "LensStudio:PanelPlugin" {
    /**
    * Base class for persistent panel plugins that render UI within a dockable Lens Studio panel.
    */
    class PanelPlugin extends IPanelPlugin {
        /**
        * Constructs a new PanelPlugin instance that registers a persistent UI panel within Lens Studio.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Creates and returns the root widget for the panel, parented to the given widget.
        */
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        /**
        * Tears down the plugin and releases any resources it holds.
        */
        deinit(): void
        
        /**
        * The plugin system instance used to resolve interface dependencies.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Plugin verification module exposing Descriptor and PluginVerifier base classes for implementing automated plugin tests.

* @module LensStudio:PluginVerifier
*/
declare module "LensStudio:PluginVerifier" {
}

declare module "LensStudio:PluginVerifier" {
    /**
    * Metadata descriptor for a PluginVerifier, identifying which plugins it targets and how to verify them.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Creates a new verifier descriptor instance for configuring plugin verifier metadata.
        */
        constructor()
        
        /**
        * Function that returns true if this verifier should run for the given plugin descriptor.
        */
        canVerify: (arg1: IPluginDescriptor) => any
        
    }

}

declare module "LensStudio:PluginVerifier" {
    /**
    * Plugin class for verifying and validating other Lens Studio plugins through automated testing.
    */
    class PluginVerifier extends Editor.IPlugin {
        /**
        * Constructs a PluginVerifier instance bound to the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Runs verification tests against a plugin descriptor and writes output artifacts to the specified directory.
        */
        verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): Promise<void>
        
        /**
        * The plugin system instance this verifier operates within.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Base class for editor presets that create pre-configured scene objects, assets, or components via the Add menu.

* @module LensStudio:Preset
*/
declare module "LensStudio:Preset" {
}

declare module "LensStudio:Preset" {
    /**
    * Descriptor class for a Preset plugin, providing metadata and configuration used by the plugin system at registration time.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new Preset Descriptor instance.
        */
        constructor()
        
        /**
        * Specifies the target entity type the preset operates on: 'SceneObject', 'Asset', or 'Component'.
        */
        entityType: string
        
        /**
        * Icon displayed for the preset in the Lens Studio UI, created via Editor.Icon.fromFile().
        */
        icon: Editor.Icon
        
        /**
        * List of asset paths to import when the preset is instantiated.
        */
        pathsToImport: Editor.Path[]
        
        /**
        * Category or group name under which the preset appears in the preset picker UI.
        */
        section: string
        
    }

}

declare module "LensStudio:Preset" {
    /**
    * Base class for plugins that create pre-configured scene objects, assets, or components via the Add menu.
    */
    class Preset extends Editor.IPlugin {
        /**
        * Constructs a new Preset instance for defining a custom editor preset that creates scene objects, assets, or components.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Synchronously creates and places a pre-configured entity at the given destination scene object or path.
        */
        create(destination: (Editor.Model.SceneObject|Editor.Path), importSettings?: any): Editor.Model.Entity
        
        /**
        * Asynchronously creates and places a pre-configured entity at the given destination scene object or path.
        */
        createAsync(destination: (Editor.Model.SceneObject|Editor.Path), importSettings?: any): Promise<Editor.Model.Entity>
        
        /**
        * The plugin system instance used to resolve interface dependencies.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Provides access to preview streams, camera views, and media resources within the Lens Studio environment.

* @module LensStudio:Preview
*/
declare module "LensStudio:Preview" {
}

declare module "LensStudio:Preview" {
    /**
    * Enum-like class defining stream type constants for preview sessions.
    */
    class StreamType {
        
        /** @hidden */
        protected constructor()
        
    }

}

/**
* Provides the base infrastructure for creating project-level settings panels with configurable sections and titles.

* @module LensStudio:ProjectSettingsPlugin
*/
declare module "LensStudio:ProjectSettingsPlugin" {
}

declare module "LensStudio:ProjectSettingsPlugin" {
    /**
    * Descriptor for a project settings plugin, defining its icon, section, and title metadata.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new Descriptor instance for configuring a project settings plugin entry.
        */
        constructor()
        
        /**
        * Icon displayed for the settings panel entry.
        */
        icon: Editor.Icon
        
        /**
        * Section name under which this settings panel is grouped.
        */
        section: string
        
        /**
        * Display title shown for this settings panel entry.
        */
        title: string
        
    }

}

declare module "LensStudio:ProjectSettingsPlugin" {
    /**
    * ProjectSettingsPlugin allows creating custom project settings panels in Lens Studio. Plugins implement this interface to add domain-specific settings (e.g., Mobile Settings, Preview Settings, Spectacles Settings) with custom UI, issue reporting, and lifecycle management.
    */
    class ProjectSettingsPlugin extends Editor.IPlugin {
        /**
        * Initializes a ProjectSettingsPlugin with a plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Creates and returns a UI widget for the project settings panel. The returned widget must be a child of the provided parent widget. Called by the project settings dialog to render the plugin's UI.
        */
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        /**
        * Call to shut down or unloadplugin. Used to clean up resources, listeners, or state.
        */
        deinit(): void
        
        /**
        * Sets the current issue status (errors, warnings, or no issues) for this settings panel. Triggers the issuesChanged signal when statuses change, allowing the settings dialog to update visual indicators.
        */
        setIssues(issues: (import('LensStudio:Ui').ProjectSettings.Error|import('LensStudio:Ui').ProjectSettings.Warning|import('LensStudio:Ui').ProjectSettings.NoIssue)[]): void
        
        /**
        * Reference to the plugin system instance.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Plugin component for pushing lens effects and configurations to physical devices.

* @module LensStudio:PushToDevice
*/
declare module "LensStudio:PushToDevice" {
}

/**
* Class for interacting with Snap's RemoteServiceModule. Unlike {@link "LensStudio:Network".performHttpRequestWithReply}, the API requests done here are to specific endpoints that have been registered with Snap.

* @module LensStudio:RemoteServiceModule
*/
declare module "LensStudio:RemoteServiceModule" {
    /**
    * Perform the API request.
    */
    export function performApiRequest(request: RemoteApiRequest, callback: (arg1: RemoteApiResponse) => void): void
    
}

declare module "LensStudio:RemoteServiceModule" {
    /**
    * Configuration for request through {@link "LensStudio:RemoteServiceModule".performApiRequest}
    */
    class RemoteApiRequest {
        
        /** @hidden */
        protected constructor()
        
        /**
        * The body of the request.
        */
        body: (Uint8Array|string)
        
        /**
        * The endpoint of the request (e.g. API path).
        */
        endpoint: string
        
        /**
        * Request parameters as key-value pairs.
        */
        parameters: any
        
        /**
        * The spec id of the RemoteServiceModule. 
        */
        specId: string
        
        /**
        * Create the configuration.
        */
        static create(): RemoteApiRequest
        
    }

}

declare module "LensStudio:RemoteServiceModule" {
    /**
    * Represents the response from a remote API call with status, body, and linked resources.
    */
    class RemoteApiResponse {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Buffer containing the response body data.
        
        * @readonly
        */
        body: Editor.Buffer
        
        /**
        * Array of resources linked to the response.
        
        * @readonly
        */
        linkedResources: RemoteApiResponse.LinkedResource[]
        
        /**
        * HTTP status code of the response.
        
        * @readonly
        */
        statusCode: number
        
    }

}

declare module "LensStudio:RemoteServiceModule" {
    namespace RemoteApiResponse {
        /**
        * Represents a linked resource with a URL reference.
        */
        class LinkedResource {
            
            /** @hidden */
            protected constructor()
            
            /**
            * The URL of the linked resource.
            
            * @readonly
            */
            url: string
            
        }
    
    }

}

/**
* Module for script editing capabilities in Lens Studio.

* @module LensStudio:ScriptEditor
*/
declare module "LensStudio:ScriptEditor" {
}

declare module "LensStudio:ScriptEditor" {
    /**
    * Provides definitions and paths for script editor functionality.
    */
    class Definitions {
        
        /** @hidden */
        protected constructor()
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Serialization`.

* @module LensStudio:Serialization
*/
declare module "LensStudio:Serialization" {
}

declare module "LensStudio:Serialization" {
    /**
    * Interface for reading serialized data.
    
    * @beta
    */
    class IReader extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare module "LensStudio:Serialization" {
    /**
    * Writes serialized data to a string representation.
    
    * @beta
    */
    class IWriter extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Get the serialized output as a string.
        
        * @beta
        */
        getString(): string
        
    }

}

declare module "LensStudio:Serialization" {
    /**
    * Class which allows you to serialize and deserialize data from YAML. Useful for modifying layout with {@link Editor.Dock.IDockManager}.
    */
    class Yaml {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Create a YAML reader from a string.
        
        * @beta
        */
        static createReader(data: string): IReader
        
        /**
        * Create a YAML writer for serializing data.
        
        * @beta
        */
        static createWriter(): IWriter
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Shell`.

* @module LensStudio:Shell
*/
declare module "LensStudio:Shell" {
    /**
    * Open a URL with optional query parameters in the default browser.
    */
    export function openUrl(baseUrl: string, queryData: any): boolean
    
    /**
    * Reveal a file or folder in the system file explorer.
    */
    export function showItemInFolder(path: Editor.Path): void
    
}

/**
* Toolkit for packaging and distributing Lens Studio projects.

* @module LensStudio:Spk
*/
declare module "LensStudio:Spk" {
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Subprocess` and add `subprocess` in your plugin's `module.json`.

* @module LensStudio:Subprocess
*/
declare module "LensStudio:Subprocess" {
    /**
    * the options parameter can take `cwd` and `timeout`, meaning the current working directory to launch the program in, as well as the milliseconds to wait for a synchronously spawned subprocess to finish. By default, `cwd` is set to the current directory of the Lens Studio application, and timeout is set to 30000.
    */
    export function spawn(command: string, args: string[], options: SpawnOptions): Subprocess
    
    /**
    * the options parameter can take `cwd` and `timeout`, meaning the current working directory to launch the program in, as well as the milliseconds to wait for a synchronously spawned subprocess to finish. By default, `cwd` is set to the current directory of the Lens Studio application, and timeout is set to 30000.
    */
    export function spawnSync(command: string, args: string[], options: SpawnOptions): SpawnSyncResult
    
}

declare module "LensStudio:Subprocess" {
    /**
    * The exit status of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
    enum ExitStatus {
        /**
        * The process exited normally.
        */
        NormalExit,
        /**
        * The process exited due to a crash.
        */
        CrashExit
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * The process error of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
    enum ProcessError {
        /**
        * Process failed to start.
        */
        FailedToStart,
        /**
        * Process crashed during execution.
        */
        Crashed,
        /**
        * Process execution timed out.
        */
        Timedout,
        /**
        * Error reading from process.
        */
        ReadError,
        /**
        * Error writing to process.
        */
        WriteError,
        /**
        * Unknown process error occurred.
        */
        UnknownError
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * The process state of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
    enum ProcessState {
        /**
        * Process is not running.
        */
        Idle,
        /**
        * Process is initializing and starting up.
        */
        Starting,
        /**
        * Process is actively running.
        */
        Running
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * The options of {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}.  `env`, can be specified as a `{PATH: myPath, PWD: myPwd}` or a JS object. The PATH and PWD fields will override the default value in your environment has when the subprocess is spawned.   You can access the default environment variables from {@link "LensStudio:App"},  where its a constant value that you can retrieve just like `.version`, using `.env`.
    */
    class SpawnOptions {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Working directory path for the spawned process.
        */
        cwd: Editor.Path
        
        /**
        * Environment variables for the spawned process.
        */
        env: any
        
        /**
        * Maximum time in milliseconds for the process to complete.
        */
        timeout: number
        
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * The result of {@link "LensStudio:Subprocess".spawnSync}. 
    */
    class SpawnSyncResult {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Process exit code.
        
        * @readonly
        */
        exitCode: number
        
        /**
        * Standard error output from the process.
        
        * @readonly
        */
        stderr: Editor.Buffer
        
        /**
        * Standard output from the process.
        
        * @readonly
        */
        stdout: Editor.Buffer
        
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * Class which allows you to trigger a subproccess outside of Lens Studio (e.g. a command line command).
    */
    class Subprocess extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Kills a subprocess.
        */
        kill(): void
        
        /**
        * Starts a subprocess.
        */
        start(): void
        
        /**
        * The command for the subprocess.
        
        * @readonly
        */
        command: string
        
        /**
        * A handle for getting callback when a subprocess' state has errored.
        
        * @readonly
        */
        onError: signal1<number, void>
        
        /**
        * A handle for getting callback when a subprocess' state has exited.
        
        * Callback will receive two arguments in order:
        * Exit code (usually 0 means success)
        * Exit status (0 on normal exit, 1 on crash)
        
        
        * @readonly
        */
        onExit: signal2<number, number, void>
        
        /**
        * A handle for getting callback when a subprocess is started
        
        * @readonly
        */
        onStart: signal0<void>
        
        /**
        * A handle for getting callback when a subprocess' state has changed.
        
        * Callback will receive a number describing a state. 
        
        * Possible states:
        * Not running  0
        * Starting  1
        * Running  2
        
        
        * @readonly
        */
        onStateChange: signal1<number, void>
        
        /**
        * A handle for getting callback when a subprocess' state has received stderr.
        
        * @readonly
        */
        stderr: signal1<Editor.Buffer, void>
        
        /**
        * A handle for getting callback when a subprocess' state has received stdin.
        
        * @readonly
        */
        stdin: Writable
        
        /**
        * A handle for getting callback when a subprocess' state has received stdout.
        
        * @readonly
        */
        stdout: signal1<Editor.Buffer, void>
        
        /**
        * Create a subprocess.
        */
        static create(command: string, args: string[], options: SpawnOptions): Subprocess
        
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * Stream for writing data to a subprocess.
    */
    class Writable extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Write data to the stream and return the number of bytes written.
        */
        write(data: (Uint8Array|string)): number
        
    }

}

/**
* Provides system information for Lens Studio.

* @module LensStudio:SysInfo
*/
declare module "LensStudio:SysInfo" {
    /**
    * String identifier for the product type.
    */
    let productType: string
    
}

/**
* @module LensStudio:TypeScript
*/
declare module "LensStudio:TypeScript" {
}

declare module "LensStudio:TypeScript" {
    class ITypeScriptCompilationApi extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        refreshProjectCompilation(): Promise<TypeScriptCompilationResult>
        
        runIsolatedCompilation(tsconfigPath: string): Promise<TypeScriptCompilationResult>
        
        static interfaceId: Editor.InterfaceId
        
    }

}

declare module "LensStudio:TypeScript" {
    class TypeScriptCompilationResult {
        
        /** @hidden */
        protected constructor()
        
        /**
        * @readonly
        */
        errors: string[]
        
        /**
        * @readonly
        */
        succeeded: boolean
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Ui`.

* @module LensStudio:Ui
*/
declare module "LensStudio:Ui" {
    /**
    * Retrieve a URL string representation.
    */
    export function getUrlString(displayText: string, url: string): string
    
}

declare module "LensStudio:Ui" {
    /**
    * Base class for button widgets with icon and state support.
    */
    class AbstractButton extends Widget {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Set the button's icon.
        */
        setIcon(icon: Editor.Icon): void
        
        /**
        * Set the button's icon dimensions.
        */
        setIconSize(w: number, h: number): void
        
        /**
        * Whether the button is checkable (toggleable).
        */
        checkable: boolean
        
        /**
        * Current checked state of the button.
        */
        checked: boolean
        
        /**
        * The button's display text.
        */
        text: string
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Base class for menu widgets with actions and submenus.
    */
    class AbstractMenu extends Widget {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Add an action to the menu.
        */
        addAction(action: Action): void
        
        /**
        * Add a submenu with the given caption.
        */
        addMenu(caption: string): AbstractMenu
        
        /**
        * Add a separator to the menu.
        */
        addSeparator(): void
        
        /**
        * Display the menu at the target widget's location.
        */
        popup(target: Widget): void
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * A UI action that can be triggered or toggled within a widget.
    */
    class Action extends ScriptObject {
        /**
        * Create an Action instance for use with menu hierarchies and toolbar configurations.
        */
        constructor(parent: Widget)
        
        /**
        * Block or unblock signals from being emitted by this action.
        */
        blockSignals(blocked: boolean): void
        
        /**
        * Whether this action can be checked or toggled.
        */
        checkable: boolean
        
        /**
        * Current checked state of this action.
        */
        checked: boolean
        
        /**
        * Icon displayed for this action.
        */
        icon: Editor.Icon
        
        /**
        * Whether the icon is visible in menus.
        */
        iconVisibleInMenu: boolean
        
        /**
        * Signal emitted when this action is toggled.
        
        * @readonly
        */
        onToggle: signal1<boolean, void>
        
        /**
        * Signal emitted when this action is triggered.
        
        * @readonly
        */
        onTrigger: signal1<boolean, void>
        
        /**
        * Text label displayed for this action.
        */
        text: string
        
        /**
        * Tooltip text shown when hovering over this action.
        */
        toolTip: string
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Horizontal and vertical alignment options for UI components.
    */
    enum Alignment {
        /**
        * Default alignment value.
        */
        Default,
        /**
        * Align to the leading edge (start).
        */
        AlignLeading,
        /**
        * Align to the left.
        */
        AlignLeft,
        /**
        * Align to the right.
        */
        AlignRight,
        /**
        * Align to the trailing edge (end).
        */
        AlignTrailing,
        /**
        * Align horizontally to center.
        */
        AlignHCenter,
        /**
        * Justify alignment.
        */
        AlignJustify,
        /**
        * Absolute positioning alignment.
        */
        AlignAbsolute,
        /**
        * Mask for horizontal alignment flags.
        */
        AlignHorizontal_Mask,
        /**
        * Align to the top.
        */
        AlignTop,
        /**
        * Align to the bottom.
        */
        AlignBottom,
        /**
        * Align vertically to center.
        */
        AlignVCenter,
        /**
        * Align to center.
        */
        AlignCenter,
        /**
        * Align to baseline.
        */
        AlignBaseline,
        /**
        * Mask for vertical alignment flags.
        */
        AlignVertical_Mask
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying arrow positions for UI elements.
    */
    enum ArrowPosition {
        /**
        * Position arrow at the top.
        */
        Top,
        /**
        * Position arrow at the bottom.
        */
        Bottom
    }

}

declare module "LensStudio:Ui" {
    /**
    * Specifies how to handle aspect ratio constraints in UI.
    */
    enum AspectRatioMode {
        /**
        * Ignore aspect ratio constraints.
        */
        IgnoreAspectRatio,
        /**
        * Maintain the aspect ratio.
        */
        KeepAspectRatio,
        /**
        * Maintain the aspect ratio by expanding as needed.
        */
        KeepAspectRatioByExpanding
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying background color role.
    */
    enum BackgroundRole {
        /**
        * Application main window background
        */
        WindowBackground,
        /**
        * Secondary panel background
        */
        PanelBackground,
        /**
        * Standard component background
        */
        ComponentBackground,
        /**
        * Popup/tooltip background
        */
        PopupBackground,
        /**
        * Button and clickable element background
        */
        ButtonBackground,
        /**
        * Text input and form field background
        */
        InputBackground,
        /**
        * Call-To-Action button background
        */
        CtaBackground
    }

}

declare module "LensStudio:Ui" {
    /**
    * Layout manager arranging widgets in a row or column.
    */
    class BoxLayout extends Layout {
        /**
        * Construct a BoxLayout for arranging widgets in a linear direction.
        */
        constructor()
        
        /**
        * Adds a child layout to this BoxLayout. The child layout is appended in the current direction (left-to-right or top-to-bottom).
        */
        addLayout(layout: Layout): void
        
        /**
        * Adds a stretch space (spacer) with the specified stretch factor. Higher stretch values take more available space proportionally. Default factor is 0 (fixed space).
        */
        addStretch(stretch: number): void
        
        /**
        * Adds a widget to the layout with an optional stretch factor and alignment. The stretch determines how much space the widget claims; alignment controls its position within its allocated space.
        */
        addWidgetWithStretch(widget: Widget, stretch: number, alignment: Alignment): void
        
        /**
        * Sets the layout direction (LeftToRight, RightToLeft, TopToBottom, BottomToTop). Controls whether widgets are arranged horizontally or vertically.
        */
        setDirection(direction: Direction): void
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget displaying a callout or tooltip with optional arrow.
    */
    class CalloutFrame extends Widget {
        /**
        * Construct a CalloutFrame UI widget.
        */
        constructor(parent: Widget)
        
        /**
        * Set the background color of the callout frame.
        */
        setBackgroundColor(color: Color): void
        
        /**
        * Set the background role and color group for the callout frame.
        */
        setBackgroundRole(role: BackgroundRole, group: ColorGroup): void
        
        /**
        * Set the foreground color of the callout frame.
        */
        setForegroundColor(color: Color): void
        
        /**
        * Set the foreground role and color group for the callout frame.
        */
        setForegroundRole(role: ForegroundRole, group: ColorGroup): void
        
        /**
        * Width of the callout frame border in pixels.
        */
        lineWidth: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for toggling a boolean state.
    */
    class CheckBox extends AbstractButton {
        /**
        * Construct a new CheckBox widget.
        */
        constructor(parent: Widget)
        
        /**
        * The current state of the checkbox.
        */
        checkState: CheckState
        
        /**
        * Signal emitted when the checkbox is toggled.
        
        * @readonly
        */
        onToggle: signal1<boolean, void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum representing checkbox state.
    */
    enum CheckState {
        /**
        * Unchecked state.
        */
        Unchecked,
        /**
        * Partially checked state.
        */
        PartiallyChecked,
        /**
        * Checked state.
        */
        Checked
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum controlling layout clearing behavior.
    */
    enum ClearLayoutBehavior {
        /**
        * Delete widgets when the layout is cleared.
        */
        DeleteClearedWidgets,
        /**
        * Preserve widgets when the layout is cleared.
        */
        KeepClearedWidgets
    }

}

declare module "LensStudio:Ui" {
    /**
    * Label widget that responds to mouse clicks.
    */
    class ClickableLabel extends Label {
        /**
        * Constructor for ClickableLabel widget.
        */
        constructor(parent: Widget)
        
        /**
        * Signal emitted when the label is clicked.
        
        * @readonly
        */
        onClick: signal0<void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Event triggered when a window or dialog closes.
    */
    class CloseEvent extends Event {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget panel that can be expanded or collapsed.
    */
    class CollapsiblePanel extends Widget {
        /**
        * Constructor for CollapsiblePanel widget.
        */
        constructor(icon: Editor.Icon, text: string, parent: Widget)
        
        /** @internal */
        static create(widget: CollapsiblePanel): CollapsiblePanel
        
        /**
        * Remove all content from the collapsible panel.
        */
        clearContent(): void
        
        /**
        * Set the panel expanded or collapsed state.
        */
        expand(value: boolean): void
        
        /**
        * Set the widget displayed inside the collapsible panel.
        */
        setContentWidget(widget: Widget): void
        
        /**
        * Background color role for the panel header.
        */
        customBackgroundRole: BackgroundRole
        
        /**
        * Whether the panel can be expanded or collapsed.
        */
        expandable: boolean
        
        /**
        * Signal emitted when the panel is expanded or collapsed.
        
        * @readonly
        */
        onExpand: signal1<boolean, void>
        
        /**
        * If true - the panel explicitly paints its background using the color from the color scheme for the role specified in customBackgroundRole. If false - the panel uses the default widget background, allowing parent theming to apply
        */
        overrideBackgroundRole: boolean
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Represents an RGBA color value.
    */
    class Color {
        /**
        * Construct a new Color instance.
        */
        constructor()
        
        /**
        * Alpha (opacity) component of the color.
        */
        alpha: number
        
        /**
        * Blue component of the color.
        */
        blue: number
        
        /**
        * Green component of the color.
        */
        green: number
        
        /**
        * Red component of the color.
        */
        red: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Button for selecting or displaying a color.
    */
    class ColorButton extends PushButton {
        /**
        * Constructor for ColorButton widget.
        */
        constructor(parent: Widget)
        
        /**
        * Update the tooltip automatically based on current state.
        */
        setAutoUpdateToolTip(autoUpdateToolTip: boolean): void
        
        /**
        * Whether the alpha channel is enabled in the color picker.
        */
        alphaEnabled: boolean
        
        /**
        * Emitted when a color is accepted in the picker.
        
        * @readonly
        */
        colorAccepted: signal1<import('LensStudio:Ui').Color, void>
        
        /**
        * Emitted when the color picker is closed without accepting.
        
        * @readonly
        */
        colorRejected: signal1<import('LensStudio:Ui').Color, void>
        
        /**
        * Emitted when the color value changes during selection.
        
        * @readonly
        */
        colorValueChanged: signal1<import('LensStudio:Ui').Color, void>
        
        /**
        * The currently displayed color in the button.
        */
        currentColor: Color
        
        /**
        * Emitted when the color picker dialog is closed.
        
        * @readonly
        */
        dialogClosed: signal0<void>
        
        /**
        * Emitted when the color picker dialog is created.
        
        * @readonly
        */
        dialogCreated: signal1<import('LensStudio:Ui').Color, void>
        
        /**
        * Whether the color picker dialog is currently open.
        
        * @readonly
        */
        isDialogActive: boolean
        
        /**
        * The last color value that was accepted by the user.
        
        * @readonly
        */
        lastAcceptedColor: Color
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying color group role.
    */
    enum ColorGroup {
        /**
        * Base color state.
        */
        Base,
        /**
        * Normal color state.
        */
        Normal,
        /**
        * Hover color state.
        */
        Hover,
        /**
        * Pressed color state.
        */
        Pressed,
        /**
        * Disabled color state.
        */
        Disabled,
        /**
        * Read-only color state.
        */
        ReadOnly,
        /**
        * Color state for disabled elements in hierarchy.
        */
        DisabledInHierarchy
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying color role for styling.
    */
    enum ColorRole {
        /**
        * Color for window text elements.
        */
        WindowText,
        /**
        * Color for button backgrounds.
        */
        Button,
        /**
        * Light color variant.
        */
        Light,
        /**
        * Midlight color variant.
        */
        Midlight,
        /**
        * Dark color variant.
        */
        Dark,
        /**
        * Mid color variant.
        */
        Mid,
        /**
        * Color for text elements.
        */
        Text,
        /**
        * Color for bright text elements.
        */
        BrightText,
        /**
        * Color for button text.
        */
        ButtonText,
        /**
        * Base color for input areas and backgrounds.
        */
        Base,
        /**
        * Color for window backgrounds.
        */
        Window,
        /**
        * Color for shadow effects.
        */
        Shadow,
        /**
        * Color for highlighted elements.
        */
        Highlight,
        /**
        * Color for highlighted text.
        */
        HighlightedText,
        /**
        * Color for hyperlink text.
        */
        Link,
        /**
        * Color for visited hyperlinks.
        */
        LinkVisited,
        /**
        * Alternate base color for contrast.
        */
        AlternateBase,
        /**
        * No color role assigned.
        */
        NoRole,
        /**
        * Color for tooltip backgrounds.
        */
        ToolTipBase,
        /**
        * Color for tooltip text.
        */
        ToolTipText,
        /**
        * Color for placeholder text.
        */
        PlaceholderText
    }

}

declare module "LensStudio:Ui" {
    /**
    * Dropdown widget for selecting from a list of options.
    */
    class ComboBox extends Widget {
        /**
        * Constructor for ComboBox widget.
        */
        constructor(parent: Widget)
        
        /**
        * Add an item with an associated icon to the combo box.
        */
        addIconItem(icon: Editor.Icon, text: string): void
        
        /**
        * Add a text item to the combo box.
        */
        addItem(text: string): void
        
        /**
        * Remove all items from the combo box.
        */
        clear(): void
        
        /**
        * Set the icon for an item at the specified index.
        */
        setItemIcon(index: number, icon: Editor.Icon): void
        
        /**
        * The text of the currently selected item.
        */
        currentText: string
        
        /**
        * Signal emitted when the selected item changes.
        
        * @readonly
        */
        onCurrentTextChange: signal1<string, void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum controlling context menu behavior.
    */
    enum ContextMenuPolicy {
        /**
        * The widget will not display a context menu. If a user right-clicks, nothing happens. Useful for widgets where context menus are not relevant.
        */
        NoContextMenu,
        /**
        * Uses the platform's default context menu behavior. On most systems, this shows cut/copy/paste for text widgets, but behavior varies by widget type and platform.
        */
        DefaultContextMenu,
        /**
        * Automatically creates a context menu from the widget's actions. Use addAction() or addMenu() to add items. The menu is displayed on right-click. Common for toolbars and menu widgets.
        */
        ActionsContextMenu,
        /**
        * Disables automatic menu generation. The widget emits customContextMenuRequested(QPoint) signal on right-click, allowing the application to display a custom menu. Most flexible option for complex menus.
        */
        CustomContextMenu,
        /**
        * Actively prevents context menus from appea
        */
        PreventContextMenu
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying mouse cursor shape.
    */
    enum CursorShape {
        /**
        * Standard arrow cursor.
        */
        ArrowCursor,
        /**
        * Upward-pointing arrow cursor.
        */
        UpArrowCursor,
        /**
        * Crosshair cursor.
        */
        CrossCursor,
        /**
        * Wait/loading cursor.
        */
        WaitCursor,
        /**
        * Text input cursor.
        */
        IBeamCursor,
        /**
        * Vertical resize cursor.
        */
        SizeVerCursor,
        /**
        * Horizontal resize cursor.
        */
        SizeHorCursor,
        /**
        * Backslash diagonal resize cursor.
        */
        SizeBDiagCursor,
        /**
        * Forward diagonal resize cursor.
        */
        SizeFDiagCursor,
        /**
        * Omnidirectional resize cursor.
        */
        SizeAllCursor,
        /**
        * Blank/invisible cursor.
        */
        BlankCursor,
        /**
        * Vertical split cursor.
        */
        SplitVCursor,
        /**
        * Horizontal split cursor.
        */
        SplitHCursor,
        /**
        * Pointing hand cursor.
        */
        PointingHandCursor,
        /**
        * Forbidden/prohibited cursor.
        */
        ForbiddenCursor,
        /**
        * Help/what's this cursor.
        */
        WhatsThisCursor,
        /**
        * Busy cursor.
        */
        BusyCursor,
        /**
        * Open hand cursor.
        */
        OpenHandCursor,
        /**
        * Closed/grabbing hand cursor.
        */
        ClosedHandCursor,
        /**
        * Drag to copy cursor.
        */
        DragCopyCursor,
        /**
        * Drag to move cursor.
        */
        DragMoveCursor,
        /**
        * Drag to link cursor.
        */
        DragLinkCursor
    }

}

declare module "LensStudio:Ui" {
    /**
    * Modal or modeless dialog window.
    */
    class Dialog extends Widget {
        /**
        * Constructor for Dialog class.
        */
        constructor(parent: Widget)
        
        /**
        * Close the dialog with accepted status.
        */
        accept(): void
        
        /**
        * Close the dialog with a specific result code.
        */
        done(code: number): void
        
        /**
        * Run the dialog modally and return the result code.
        */
        exec(): number
        
        /**
        * Display the dialog non-modally.
        */
        open(): void
        
        /**
        * Close the dialog with rejected status.
        */
        reject(): void
        
        /**
        * Set whether the dialog blocks interaction with other windows.
        */
        setModal(modal: boolean): void
        
        /**
        * Signal emitted when the dialog closes.
        
        * @readonly
        */
        onFinish: signal1<number, void>
        
    }

}

declare module "LensStudio:Ui" {
    namespace Dialog {
        /**
        * Enum representing the result codes for dialog operations.
        */
        enum Code {
            /**
            * Dialog was rejected or cancelled by the user.
            */
            Rejected,
            /**
            * Dialog was accepted or confirmed by the user.
            */
            Accepted
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Dialogs {
        /**
        * Options for file/directory dialogs.
        */
        enum Options {
            /**
            * Standard file dialog with standard filters.
            */
            Usual,
            /**
            * File dialog restricted to directories only.
            */
            DirectoriesOnly
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Dialogs {
        /**
        * Parameters for file dialog configuration.
        */
        class Params {
            
            /** @hidden */
            protected constructor()
            
            /**
            * Title text displayed in the dialog.
            */
            caption: string
            
            /**
            * File type filter pattern for the dialog.
            */
            filter: string
            
            /**
            * Additional dialog behavior options.
            */
            options: Dialogs.Options
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying layout direction.
    */
    enum Direction {
        /**
        * Layout flows from left to right.
        */
        LeftToRight,
        /**
        * Layout flows from right to left.
        */
        RightToLeft,
        /**
        * Layout flows from top to bottom.
        */
        TopToBottom,
        /**
        * Layout flows from bottom to top.
        */
        BottomToTop
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum representing dock widget state.
    */
    enum DockState {
        /**
        * Dock state when the UI element is attached.
        */
        Attached,
        /**
        * Dock state when the UI element is detached.
        */
        Detached
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for entering floating-point numbers.
    */
    class DoubleSpinBox extends Widget {
        /**
        * Constructor for DoubleSpinBox widget.
        */
        constructor(parent: Widget)
        
        /**
        * Sets the minimum and maximum range for the spin box.
        */
        setRange(min: number, max: number): void
        
        /**
        * Signal fired when the value changes, receives the new Number value.
        
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        /**
        * The increment/decrement step value.
        */
        singleStep: number
        
        /**
        * Current value.
        */
        value: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Manages text and code editors.
    */
    class EditorsManager extends IEditorsManager {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare module "LensStudio:Ui" {
    class Event extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        accept(): void
        
        ignore(): void
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying font role for styling.
    */
    enum FontRole {
        /**
        * Default font role.
        */
        Default,
        /**
        * First font role.
        */
        First,
        /**
        * Default font role with underline.
        */
        DefaultUnderlined,
        /**
        * Default font role with bold weight.
        */
        DefaultBold,
        /**
        * Default font role with italic style.
        */
        DefaultItalic,
        /**
        * Small font role.
        */
        Small,
        /**
        * Monospace font role.
        */
        Monospace,
        /**
        * Small title font role.
        */
        SmallTitle,
        /**
        * Title font role.
        */
        Title,
        /**
        * Title font role with bold weight.
        */
        TitleBold,
        /**
        * Medium title font role.
        */
        MediumTitle,
        /**
        * Medium title font role with bold weight.
        */
        MediumTitleBold,
        /**
        * Large title font role.
        */
        LargeTitle,
        /**
        * Large title font role with bold weight.
        */
        LargeTitleBold
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying foreground color role.
    */
    enum ForegroundRole {
        /**
        * Primary content text color role.
        */
        Content,
        /**
        * Active or selected content text color role.
        */
        ActiveContent,
        /**
        * Placeholder or hint text color role.
        */
        PlaceholderContent,
        /**
        * Hyperlink text color role.
        */
        Link,
        /**
        * Highlighted text color role.
        */
        Highlight,
        /**
        * Focused element text color role.
        */
        Focus,
        /**
        * Inner divider line color role.
        */
        DividerIn,
        /**
        * Outer divider line color role.
        */
        DividerOut,
        /**
        * Input field outline color role.
        */
        InputOutline,
        /**
        * Button outline color role.
        */
        ButtonOutline,
        /**
        * Region selection indicator color role.
        */
        RegionSelection,
        /**
        * Red accent color role.
        */
        ColorRed,
        /**
        * Orange accent color role.
        */
        ColorOrange,
        /**
        * Yellow accent color role.
        */
        ColorYellow,
        /**
        * Green accent color role.
        */
        ColorGreen
    }

}

declare module "LensStudio:Ui" {
    /**
    * Layout manager arranging widgets in a grid.
    */
    class GridLayout extends Layout {
        /**
        * Constructor for a grid layout container that arranges child widgets in rows and columns.
        */
        constructor()
        
        /**
        * Add a layout to the grid at a specific row and column with alignment.
        */
        addLayout(layout: Layout, row: number, column: number, alignment: Alignment): void
        
        /**
        * Add a widget to the grid at a specific row and column with alignment.
        */
        addWidgetAt(widget: Widget, row: number, column: number, alignment: Alignment): void
        
        /**
        * Add a widget to the grid spanning multiple rows and columns with alignment.
        */
        addWidgetWithSpan(widget: Widget, fromRow: number, fromColumn: number, rowSpan: number, columnSpan: number, alignment: Alignment): void
        
        /**
        * Get the minimum width of a column.
        */
        getColumnMinimumWidth(column: number): number
        
        /**
        * Get the stretch factor of a column.
        */
        getColumnStretch(column: number): number
        
        /**
        * Get the minimum height of a row.
        */
        getRowMinimumHeight(row: number): number
        
        /**
        * Get the stretch factor of a row.
        */
        getRowStretch(row: number): number
        
        /**
        * Set the minimum width of a column.
        */
        setColumnMinimumWidth(column: number, minSize: number): void
        
        /**
        * Set the stretch factor of a column.
        */
        setColumnStretch(column: number, stretch: number): void
        
        /**
        * Set the minimum height of a row.
        */
        setRowMinimumHeight(row: number, minSize: number): void
        
        /**
        * Set the stretch factor of a row.
        */
        setRowStretch(row: number, stretch: number): void
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Main interface for accessing UI dialogs and workspace.
    */
    class Gui extends IGui {
        
        /** @hidden */
        protected constructor()
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying icon display mode.
    */
    enum IconMode {
        /**
        * Monochrome icon rendering mode.
        */
        MonoChrome,
        /**
        * Regular icon rendering mode.
        */
        Regular
    }

}

declare module "LensStudio:Ui" {
    /**
    * Interface for file and message dialogs.
    */
    class IDialogs extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Open a file selection dialog and return the selected file path.
        */
        selectFileToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path
        
        /**
        * Open a file save dialog and return the selected file path.
        */
        selectFileToSave(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path
        
        /**
        * Open a file selection dialog allowing multiple selections and return an array of selected file paths.
        */
        selectFilesToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path[]
        
        /**
        * Returns selected path, or an empty path if the dialog was cancelled.
        
        */
        selectFolderToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path
        
        /**
        * Open a folder selection dialog for saving and return the selected folder path.
        */
        selectFolderToSave(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Interface for text editor management.
    */
    class IEditorsManager extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Open editors for the specified entity with optional plugin-specific configurations.
        */
        openEditors(entity: Editor.Model.Entity, editorPluginIds?: any): void
        
        /**
        * Interface identifier for retrieving this plugin component.
        */
        static interfaceId: Editor.InterfaceId
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Interface for GUI functionality.
    */
    class IGui extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Create a new dialog window.
        */
        createDialog(): Dialog
        
        /**
        * Create a new widget.
        */
        createWidget(): Widget
        
        /**
        * Manager for all open dialogs.
        
        * @readonly
        */
        dialogs: IDialogs
        
        /**
        * Manager for workspace layouts and panels.
        
        * @readonly
        
        * @beta
        */
        workspaces: IWorkspaceManager
        
        /**
        * Interface identifier for IGui.
        */
        static interfaceId: Editor.InterfaceId
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget displaying an image.
    */
    class ImageView extends Widget {
        /**
        * Create an ImageView widget for displaying images in the Lens Studio UI.
        */
        constructor(parent: Widget)
        
        /**
        * Signal emitted when the image view is clicked.
        
        * @readonly
        */
        onClick: signal0<void>
        
        /**
        * Signal emitted when hover state changes over the image view.
        
        * @readonly
        */
        onHover: signal1<boolean, void>
        
        /**
        * The pixmap image to display.
        */
        pixmap: Pixmap
        
        /**
        * The border radius of the image view corners.
        */
        radius: number
        
        /**
        * Enable hover response behavior.
        */
        responseHover: boolean
        
        /**
        * Controls whether the image (pixmap) is scaled to fit the dimensions of the ImageView widget. Setting it to true will scale the image to match the widget size, while false will display the image at its original size.
        */
        scaledContents: boolean
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Interface for workspace management.
    */
    class IWorkspaceManager extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Create a workspace from a descriptor.
        */
        create(descriptor: Workspaces.Descriptor): Workspaces.Workspace
        
        /**
        * Check if a descriptor is registered.
        */
        isRegistered(descriptor: Workspaces.Descriptor): boolean
        
        /**
        * Read a workspace descriptor from a directory path.
        */
        readDescriptor(presetDirPath: Editor.Path): Workspaces.Descriptor | undefined
        
        /**
        * Register a workspace descriptor and return a preset handle.
        */
        register(descriptor: Workspaces.Descriptor): Workspaces.PresetHandle
        
        /**
        * Unregister a workspace by its preset handle.
        */
        unregister(handle: Workspaces.PresetHandle): void
        
        /**
        * Array of all available workspaces.
        
        * @readonly
        */
        all: Workspaces.Workspace[]
        
        /**
        * Emitted just before a workspace becomes the current active workspace during setCurrent(). Allows listeners to prepare for activation.
        
        * @readonly
        */
        onAboutToBeActivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted just before a workspace is inserted into the manager's list. Fires during add() before the workspace is added to the internal collection.
        
        * @readonly
        */
        onAboutToBeAdded: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted just before the current workspace is deactivated when switching to another workspace. Allows listeners to save state or cleanup.
        
        * @readonly
        */
        onAboutToBeDeactivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted just before a workspace is removed from the manager. Fires during remove() before the workspace is ejected from the list, allowing state saving.
        
        * @readonly
        */
        onAboutToBeRemoved: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted after a workspace has been successfully activated and is now current. Fires after the tab index is set and the workspace is ready for use.
        
        * @readonly
        */
        onActivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted after a workspace has been successfully added to the manager and its tab created. Fires after the workspace is inserted into the internal list.
        
        * @readonly
        */
        onAdded: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted after a workspace is fully initialized with its layout loaded and panel properties deserialized. Indicates the workspace is ready for interaction.
        
        * @readonly
        */
        onCreated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted after a workspace has been deactivated and is no longer current. Fires after another workspace is activated.
        
        * @readonly
        */
        onDeactivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * Emitted after a workspace is successfully removed from the manager. Passes the workspace's metadata (not the object itself, as it may be destroyed).
        
        * @readonly
        */
        onRemoved: signal1<import('LensStudio:Ui').Workspaces.Metadata, void>
        
    }

}

declare module "LensStudio:Ui" {
    enum Key {
        Key_Space,
        Key_0,
        Key_1,
        Key_2,
        Key_3,
        Key_4,
        Key_5,
        Key_6,
        Key_7,
        Key_8,
        Key_9,
        Key_A,
        Key_B,
        Key_C,
        Key_D,
        Key_E,
        Key_F,
        Key_G,
        Key_H,
        Key_I,
        Key_J,
        Key_K,
        Key_L,
        Key_M,
        Key_N,
        Key_O,
        Key_P,
        Key_Q,
        Key_R,
        Key_S,
        Key_T,
        Key_U,
        Key_V,
        Key_W,
        Key_X,
        Key_Y,
        Key_Z,
        Key_Escape,
        Key_Tab,
        Key_Backspace,
        Key_Return,
        Key_Delete,
        Key_Left,
        Key_Up,
        Key_Right,
        Key_Down,
        Key_Shift,
        Key_Control,
        Key_Meta,
        Key_Alt
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum representing keyboard modifier keys.
    */
    enum KeyboardModifier {
        /**
        * No modifier key pressed.
        */
        NoModifier,
        /**
        * Shift key modifier.
        */
        ShiftModifier,
        /**
        * Control key modifier.
        */
        ControlModifier,
        /**
        * Alt key modifier.
        */
        AltModifier,
        /**
        * Meta/Command key modifier.
        */
        MetaModifier,
        /**
        * Keypad key modifier.
        */
        KeypadModifier,
        /**
        * Group switch key modifier.
        */
        GroupSwitchModifier
    }

}

declare module "LensStudio:Ui" {
    class KeyEvent extends Event {
        
        /** @hidden */
        protected constructor()
        
        /**
        * @readonly
        */
        key: Key
        
        /**
        * @readonly
        */
        modifiers: KeyboardModifier
        
        /**
        * @readonly
        */
        text: string
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget displaying read-only text.
    */
    class Label extends Widget {
        /**
        * Construct a label widget for displaying text in a UI panel.
        */
        constructor(parent: Widget)
        
        /**
        * Signal emitted when a link in the label text is activated.
        
        * @readonly
        */
        onLinkActivate: signal1<string, void>
        
        /**
        * Enable or disable opening external links when clicked.
        */
        openExternalLinks: boolean
        
        /**
        * The text content displayed by the label.
        */
        text: string
        
        /**
        * Enable or disable automatic text wrapping.
        */
        wordWrap: boolean
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Base class for layout managers.
    */
    class Layout extends ScriptObject {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Add a widget to the layout.
        */
        addWidget(widget: Widget): void
        
        /**
        * Remove all widgets from the layout with specified cleanup behavior.
        */
        clear(behavior: ClearLayoutBehavior): void
        
        /**
        * Schedule layout for deletion after event processing.
        */
        deleteLater(): void
        
        /**
        * Set the margins around layout contents.
        */
        setContentsMargins(left: number, top: number, right: number, bottom: number): void
        
        /**
        * Set alignment for a nested layout within this layout.
        */
        setLayoutAlignment(layout: Layout, alignment: Alignment): boolean
        
        /**
        * Set alignment for a widget within this layout.
        */
        setWidgetAlignment(widget: Widget, alignment: Alignment): boolean
        
        /**
        * Whether the layout is active and responsive to user input.
        */
        enabled: boolean
        
        /**
        * Whether this object references a valid layout.
        
        * @readonly
        */
        isNull: boolean
        
        /**
        * Distance between widgets in the layout.
        */
        spacing: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for single-line text input.
    */
    class LineEdit extends Widget {
        /**
        * Initialize a single-line text input widget.
        */
        constructor(parent: Widget)
        
        /**
        * The current position of the text cursor.
        */
        cursorPosition: number
        
        /**
        * The icon displayed in the line edit.
        */
        icon: Editor.Icon
        
        /**
        * Signal emitted when editing is finished.
        
        * @readonly
        */
        onEditingFinished: signal0<void>
        
        /**
        * Signal emitted when the return key is pressed.
        
        * @readonly
        */
        onReturnPressed: signal0<void>
        
        /**
        * Signal emitted when the text changes.
        
        * @readonly
        */
        onTextChange: signal1<string, void>
        
        /**
        * Placeholder text shown when the input is empty.
        */
        placeholderText: string
        
        /**
        * Whether the line edit is read-only.
        */
        readonly: boolean
        
        /**
        * The current text content.
        */
        text: string
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget displaying a scrollable list of items.
    */
    class ListWidget extends Widget {
        /**
        * Constructs a ListWidget UI element for displaying list items.
        */
        constructor(parent: Widget)
        
        /**
        * Add a generic item to the list.
        */
        addItem(item: ListWidgetItem): void
        
        addTextItem(text: string): void
        
        /**
        * Remove all items from the list.
        */
        clear(): void
        
        /**
        * Set the currently selected row by index.
        */
        setCurrentRow(row: number): void
        
        /**
        * Replace the widget displayed at a specific row.
        */
        setItemWidget(item: ListWidgetItem, widget: Widget): void
        
        /**
        * Index of the currently selected row.
        */
        currentRow: number
        
        /**
        * Signal emitted when the selected row changes.
        
        * @readonly
        */
        onCurrentRowChanged: signal1<number, void>
        
        /**
        * Signal emitted when a row is double-clicked.
        
        * @readonly
        */
        onRowDoubleClicked: signal1<number, void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Individual item in a ListWidget.
    */
    class ListWidgetItem extends ScriptObject {
        /**
        * Construct a list widget item for use in ListWidget containers.
        */
        constructor(parent: ListWidget)
        
        /**
        * Sets the icon displayed for this list item.
        */
        setIcon(icon: Editor.Icon): void
        
        /**
        * Whether the list item is hidden from display.
        */
        hidden: boolean
        
        /**
        * Whether the list item is currently selected.
        */
        selected: boolean
        
        /**
        * Suggested dimensions for rendering the list item.
        */
        sizeHint: Size
        
        /**
        * The text label displayed for the list item.
        */
        text: string
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Popup menu widget.
    */
    class Menu extends AbstractMenu {
        /**
        * Create a Menu instance for building menu hierarchies.
        */
        constructor(parent: Widget)
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Dialog for displaying messages or confirmations.
    */
    class MessageBox {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Display a critical error message dialog and return the button clicked by the user.
        */
        static critical(title: string, text: string, buttons: MessageBox.StandardButtons, defaultButton: MessageBox.StandardButton): MessageBox.StandardButton
        
        /**
        * Display an information message dialog and return the button clicked by the user.
        */
        static information(title: string, text: string, buttons: MessageBox.StandardButtons, defaultButton: MessageBox.StandardButton): MessageBox.StandardButton
        
        /**
        * Display a question dialog and return the button clicked by the user.
        */
        static question(title: string, text: string, buttons: MessageBox.StandardButtons, defaultButton: MessageBox.StandardButton): MessageBox.StandardButton
        
        /**
        * Display a warning message dialog and return the button clicked by the user.
        */
        static warning(title: string, text: string, buttons: MessageBox.StandardButtons, defaultButton: MessageBox.StandardButton): MessageBox.StandardButton
        
    }

}

declare module "LensStudio:Ui" {
    namespace MessageBox {
        /**
        * Icon enumeration for message box dialogs.
        */
        enum Icon {
            /**
            * No icon displayed.
            */
            NoIcon,
            /**
            * Information icon.
            */
            Information,
            /**
            * Warning icon.
            */
            Warning,
            /**
            * Critical/error icon.
            */
            Critical,
            /**
            * Question icon.
            */
            Question
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace MessageBox {
        /**
        * Standard message box button types.
        */
        enum StandardButton {
            /**
            * No button.
            */
            NoButton,
            /**
            * OK button.
            */
            Ok,
            /**
            * Save button.
            */
            Save,
            /**
            * Save all button.
            */
            SaveAll,
            /**
            * Open button.
            */
            Open,
            /**
            * Yes button.
            */
            Yes,
            /**
            * Yes to all button.
            */
            YesToAll,
            /**
            * No button.
            */
            No,
            /**
            * No to all button.
            */
            NoToAll,
            /**
            * Abort button.
            */
            Abort,
            /**
            * Retry button.
            */
            Retry,
            /**
            * Ignore button.
            */
            Ignore,
            /**
            * Close button.
            */
            Close,
            /**
            * Cancel button.
            */
            Cancel,
            /**
            * Discard button.
            */
            Discard,
            /**
            * Help button.
            */
            Help,
            /**
            * Apply button.
            */
            Apply,
            /**
            * Reset button.
            */
            Reset,
            /**
            * Restore defaults button.
            */
            RestoreDefaults
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace MessageBox {
        /**
        * Predefined button combinations for standard message box dialogs.
        
        * @beta
        */
        class StandardButtons {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum representing mouse button identifiers.
    */
    enum MouseButton {
        /**
        * No mouse button pressed
        */
        NoButton,
        /**
        * Left mouse button (primary click)
        */
        LeftButton,
        /**
        * Right mouse button (context menu)
        */
        RightButton,
        /**
        * Middle mouse button (scroll wheel click)
        */
        MiddleButton,
        /**
        * Back button (typically on side of mouse)
        */
        BackButton,
        /**
        * Forward button (typically on side of mouse)
        */
        ForwardButton
    }

}

declare module "LensStudio:Ui" {
    /**
    * Event object containing mouse interaction data.
    */
    class MouseEvent extends Event {
        
        /** @hidden */
        protected constructor()
        
        /**
        * The specific mouse button that triggered the event
        
        * @readonly
        */
        button: MouseButton
        
        /**
        * All mouse buttons currently pressed (flags)
        
        * @readonly
        */
        buttons: MouseButton
        
        /**
        * The x-coordinate of the mouse position relative to the widget
        
        * @readonly
        */
        globalX: number
        
        /**
        * The y-coordinate of the mouse position relative to the widget
        
        * @readonly
        */
        globalY: number
        
        /**
        * The keyboard modifiers pressed during the mouse event (Shift, Ctrl, Alt, etc.).
        
        * @readonly
        */
        modifiers: KeyboardModifier
        
        /**
        * The absolute x-coordinate of the mouse position on screen
        
        * @readonly
        */
        x: number
        
        /**
        * The absolute y-coordinate of the mouse position on screen
        
        * @readonly
        */
        y: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Represents an animated movie or video file.
    */
    class Movie extends ScriptObject {
        /**
        * Constructs a new Movie UI element within the LensStudio:Ui namespace.
        */
        constructor(filename: Editor.Path)
        
        jumpToFrame(frame: number): boolean
        
        /**
        * Resizes the movie to the specified width and height
        */
        resize(width: number, height: number): void
        
        cacheMode: Movie.CacheMode
        
        /**
        * @readonly
        */
        frameCount: number
        
        /**
        * The width of the movie in pixels
        */
        height: number
        
        /**
        * The height of the movie in pixels
        */
        speed: number
        
        /**
        * The playback speed of the movie
        */
        width: number
        
    }

}

declare module "LensStudio:Ui" {
    namespace Movie {
        enum CacheMode {
            CacheNone,
            CacheAll
        }
    
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for playing movies or animations.
    */
    class MovieView extends Widget {
        /**
        * Constructs a new MovieView widget for embedding video playback within a plugin panel.
        */
        constructor(parent: Widget)
        
        /**
        * Whether the movie plays back automatically.
        */
        animated: boolean
        
        /**
        * The Movie asset displayed by this widget.
        */
        movie: Movie
        
        /**
        * Signal emitted when the widget is clicked.
        
        * @readonly
        */
        onClick: signal0<void>
        
        /**
        * Signal emitted when the hover state changes, passing true when hovered.
        
        * @readonly
        */
        onHover: signal1<boolean, void>
        
        /**
        * Whether the widget responds to hover events.
        */
        responseHover: boolean
        
        /**
        * Whether the movie content is scaled to fill the widget bounds.
        */
        scaledContents: boolean
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying horizontal or vertical orientation.
    */
    enum Orientation {
        /**
        * Horizontal orientation, laying out elements along the X axis.
        */
        Horizontal,
        /**
        * Vertical orientation, laying out elements along the Y axis.
        */
        Vertical
    }

}

declare module "LensStudio:Ui" {
    /**
    * Toolbar that collapses into a menu when space is limited.
    */
    class OverflowToolBar extends Widget {
        /**
        * Constructs an OverflowToolBar widget that collapses toolbar items into an overflow menu when space is insufficient.
        */
        constructor(parent: Widget)
        
        /**
        * Adds a stretch spacer to the specified section with the given stretch factor.
        */
        addStretch(section: Section, stretch: number): void
        
        /**
        * Adds a widget to the specified section, optionally associating it with an action.
        */
        addWidget(widget: Widget, section: Section, action?: Action): void
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Represents an image in memory.
    */
    class Pixmap extends ScriptObject {
        /**
        * Constructs a new Pixmap instance for use in UI widgets.
        */
        constructor(filename: Editor.Path)
        
        /**
        * Crops the pixmap to the specified rectangle.
        */
        crop(rect: Rect): void
        
        /**
        * Loads an image from the given file path.
        */
        load(filename: Editor.Path): void
        
        /**
        * Resizes the pixmap to the specified width and height.
        */
        resize(width: number, height: number): void
        
        /**
        * Saves the pixmap to the given file path, with optional quality setting.
        */
        save(filename: Editor.Path, quality?: number): void
        
        /**
        * Controls how the aspect ratio is preserved during resize operations.
        */
        aspectRatioMode: AspectRatioMode
        
        /**
        * Height of the pixmap in pixels.
        */
        height: number
        
        /**
        * Controls the transformation quality mode used when scaling the pixmap.
        */
        transformationMode: TransformationMode
        
        /**
        * Width of the pixmap in pixels.
        */
        width: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Popup widget with an arrow pointing to a reference position.
    */
    class PopupWithArrow extends Widget {
        /**
        * Constructs a popup widget with a directional arrow indicator for contextual UI overlays.
        */
        constructor(parent: Widget, arrowPosition: ArrowPosition)
        
        /** @internal */
        static create(widget: PopupWithArrow): PopupWithArrow
        
        /**
        * Closes the popup.
        */
        close(): void
        
        /**
        * Shows the popup anchored to the given target widget.
        */
        popup(target: Widget): void
        
        /**
        * Sets the main content widget displayed inside the popup.
        */
        setMainWidget(widget: Widget): void
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget displaying a progress bar.
    */
    class ProgressBar extends Widget {
        /**
        * Constructs a new ProgressBar widget.
        */
        constructor(parent: Widget)
        
        /**
        * Sets the primary fill color of the progress bar.
        */
        setPrimaryColor(color: Color): void
        
        /**
        * Sets the minimum and maximum bounds of the progress bar.
        */
        setRange(minimum: number, maximum: number): void
        
        /**
        * Sets the secondary color of the progress bar, typically used for the background track.
        */
        setSecondaryColor(color: Color): void
        
        /**
        * Upper bound of the progress bar range.
        */
        maximum: number
        
        /**
        * Lower bound of the progress bar range.
        */
        minimum: number
        
        /**
        * Current progress value within the minimummaximum range.
        */
        value: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget showing progress without a specific percentage.
    */
    class ProgressIndicator extends Widget {
        /**
        * Constructs a new ProgressIndicator widget for displaying indeterminate or determinate progress feedback in a plugin panel.
        */
        constructor(parent: Widget)
        
        /**
        * Starts displaying the progress animation.
        */
        start(): void
        
        /**
        * Stops and hides the progress animation.
        */
        stop(): void
        
    }

}

declare module "LensStudio:Ui" {
    namespace ProjectSettings {
        /**
        * Represents a project settings validation error with a human-readable description.
        */
        class Error {
            /**
            * Constructs a project settings error with the given description string.
            */
            constructor(description: string)
            
            /**
            * Human-readable message describing the project settings error.
            */
            description: string
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace ProjectSettings {
        /**
        * Represents a project settings validation result with no issues.
        */
        class NoIssue {
            /**
            * Constructs a NoIssue result indicating no project settings validation issues were found.
            */
            constructor()
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace ProjectSettings {
        /**
        * Represents a warning associated with a project setting, holding a descriptive message.
        */
        class Warning {
            /**
            * Constructs a Warning project settings validation result with the given description.
            */
            constructor(description: string)
            
            /**
            * The warning message text.
            */
            description: string
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    /**
    * Clickable button widget.
    */
    class PushButton extends AbstractButton {
        /**
        * Constructs a new PushButton widget with the given parent widget.
        */
        constructor(parent: Widget)
        
        /**
        * Sets the icon display mode for the button.
        */
        setIconMode(iconMode: IconMode): void
        
        /**
        * Sets the button icon and its display mode simultaneously.
        */
        setIconWithMode(icon: Editor.Icon, iconMode: IconMode): void
        
        /**
        * Signal emitted when the button is clicked.
        
        * @readonly
        */
        onClick: signal0<void>
        
        /**
        * Whether the button is styled as a primary action button.
        */
        primary: boolean
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for selecting one option from a group.
    */
    class RadioButton extends AbstractButton {
        /**
        * Constructs a new RadioButton widget instance.
        */
        constructor(parent: Widget)
        
        /**
        * Signal emitted when the radio button is clicked.
        
        * @readonly
        */
        onClick: signal0<void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Manager for radio button groups.
    */
    class RadioButtonGroup extends Widget {
        /**
        * Constructs a new RadioButtonGroup widget for grouping mutually exclusive radio button options.
        */
        constructor(parent: Widget)
        
        /**
        * Adds a button to the group with the given numeric id.
        */
        addButton(button: AbstractButton, id: number): void
        
        /**
        * Deselects all buttons in the group.
        */
        clearSelection(): void
        
        /**
        * Index of the currently selected button.
        */
        currentIndex: number
        
        /**
        * Currently selected button widget.
        
        * @readonly
        */
        currentItem: AbstractButton
        
        /**
        * Pixel spacing between buttons in the group.
        */
        spacing: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Represents a rectangular area with x, y, width, height.
    */
    class Rect {
        /**
        * Constructs a new Rect instance representing a rectangular region in UI space.
        */
        constructor(x: number, y: number, width: number, height: number)
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Menu with search/filter functionality.
    */
    class SearchableMenu extends AbstractMenu {
        /**
        * Constructs a new SearchableMenu widget with a built-in search field for filtering menu items.
        */
        constructor(parent: Widget)
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * LineEdit with search capabilities.
    */
    class SearchLineEdit extends LineEdit {
        /**
        * Constructs a SearchLineEdit widget for use in plugin UI panels.
        */
        constructor(parent: Widget)
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Collapsible section widget for grouping content.
    */
    enum Section {
        /**
        * Left section of the layout area.
        */
        Left,
        /**
        * Center section of the layout area.
        */
        Center,
        /**
        * Right section of the layout area.
        */
        Right
    }

}

declare module "LensStudio:Ui" {
    /**
    * Visual separator widget.
    */
    class Separator extends Widget {
        /**
        * Constructs a horizontal or vertical separator widget for visually dividing UI sections.
        */
        constructor(orientation: Orientation, shadow: Shadow, parent: Widget)
        
        /** @internal */
        static create(widget: Separator): Separator
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying shadow effect style.
    */
    enum Shadow {
        /**
        * Flat shadow with no depth effect.
        */
        Plain,
        /**
        * Shadow style that makes an element appear raised above the surface.
        */
        Raised,
        /**
        * Shadow style that makes an element appear recessed into the surface.
        */
        Sunken
    }

}

declare module "LensStudio:Ui" {
    class Shortcut extends ScriptObject {
        constructor(parent: Widget, keySequence: string, context: ShortcutContext)
        
        /**
        * @readonly
        */
        onActivated: signal0<void>
        
        /**
        * @readonly
        */
        onActivatedAmbiguously: signal0<void>
        
    }

}

declare module "LensStudio:Ui" {
    enum ShortcutContext {
        WidgetShortcut,
        WindowShortcut,
        ApplicationShortcut,
        WidgetWithChildrenShortcut
    }

}

declare module "LensStudio:Ui" {
    /**
    * Represents width and height dimensions.
    */
    class Size {
        /**
        * Constructs a new Size object representing a two-dimensional size value with width and height.
        */
        constructor(width: number, height: number)
        
        /**
        * Height component of the size.
        */
        height: number
        
        /**
        * Width component of the size.
        */
        width: number
        
    }

}

declare module "LensStudio:Ui" {
    namespace SizePolicy {
        /**
        * Enum defining how a widget resizes along a single axis.
        */
        enum Policy {
            /**
            * Widget size is fixed and will not grow or shrink.
            */
            Fixed,
            /**
            * Widget can grow but prefers its minimum size hint.
            */
            Minimum,
            /**
            * Widget can grow and will expand if extra space is available, but prefers its minimum size hint.
            */
            MinimumExpanding,
            /**
            * Widget can shrink but prefers its size hint as maximum.
            */
            Maximum,
            /**
            * Widget uses its size hint as preferred size and can grow or shrink.
            */
            Preferred,
            /**
            * Widget actively takes as much space as available.
            */
            Expanding,
            /**
            * Widget size hint is ignored and it takes all available space.
            */
            Ignored
        }
    
    }

}

declare module "LensStudio:Ui" {
    /**
    * Collection of size values.
    */
    class Sizes {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Side dimension for button delegate elements.
        */
        static ButtonDelegateSide: number
        
        /**
        * Standard height for button widgets.
        */
        static ButtonHeight: number
        
        /**
        * Corner radius applied to buttons.
        */
        static ButtonRadius: number
        
        /**
        * Diameter of the drawn checkbox indicator.
        */
        static CheckBoxDrawedDiameter: number
        
        /**
        * Width of the checkbox outline stroke.
        */
        static CheckBoxOutlineWidth: number
        
        /**
        * Padding added around a checkbox when focused.
        */
        static CheckboxFocusPadding: number
        
        /**
        * Internal padding within a checkbox.
        */
        static CheckboxPadding: number
        
        /**
        * Corner radius of the checkbox shape.
        */
        static CheckboxRadius: number
        
        /**
        * Margin around content inside a dialog.
        */
        static DialogContentMargin: number
        
        /**
        * Padding value equal to twice the standard padding.
        */
        static DoublePadding: number
        
        /**
        * Height of the drag handle icon.
        */
        static DragIconSizeHeight: number
        
        /**
        * Width of the drag handle icon.
        */
        static DragIconSizeWidth: number
        
        /**
        * Side dimension of extent/expand icons.
        */
        static ExtentIconSide: number
        
        /**
        * Padding value equal to half the standard padding.
        */
        static HalfPadding: number
        
        /**
        * Standard side dimension for icons.
        */
        static IconSide: number
        
        /**
        * Standard height for input field widgets.
        */
        static InputHeight: number
        
        /**
        * Corner radius applied to input fields.
        */
        static InputRadius: number
        
        /**
        * Height of individual menu items.
        */
        static MenuItemHeight: number
        
        /**
        * Side dimension of the icon shown in message boxes.
        */
        static MessageBoxIconSide: number
        
        /**
        * Standard padding value used throughout the UI.
        */
        static Padding: number
        
        /**
        * Larger padding value for wider spacing needs.
        */
        static PaddingLarge: number
        
        /**
        * Height of progress bar widgets.
        */
        static ProgressBarHeight: number
        
        /**
        * Corner radius applied to rounded pixmap images.
        */
        static RoundedPixmapRadius: number
        
        /**
        * Margin around content adjacent to separators.
        */
        static SeparatorContentsMargin: number
        
        /**
        * Width of separator line elements.
        */
        static SeparatorLineWidth: number
        
        /**
        * Height of the window size grip widget.
        */
        static SizeGripSizeHeight: number
        
        /**
        * Width of the window size grip widget.
        */
        static SizeGripSizeWidth: number
        
        /**
        * Standard spacing between UI elements.
        */
        static Spacing: number
        
        /**
        * Height of increment/decrement buttons in a spinbox.
        */
        static SpinboxButtonHeight: number
        
        /**
        * Width of increment/decrement buttons in a spinbox.
        */
        static SpinboxButtonWidth: number
        
        /**
        * Default width of a spinbox widget.
        */
        static SpinboxDefaultWidth: number
        
        /**
        * Width of the splitter handle divider.
        */
        static SplitterHandleWidth: number
        
        /**
        * Height of text edit widgets.
        */
        static TextEditHeight: number
        
        /**
        * Internal padding within tool button widgets.
        */
        static ToolButtonPadding: number
        
        /**
        * Width of the gradient used for text eliding in views.
        */
        static ViewElidingGradientWidth: number
        
        /**
        * Indentation width for items in tree or list views.
        */
        static ViewIndentation: number
        
        /**
        * Height of section headers in views.
        */
        static ViewSectionHeight: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for selecting a value within a range.
    */
    class Slider extends Widget {
        /**
        * Constructs a new Slider widget for selecting a numeric value within a range.
        */
        constructor(parent: Widget)
        
        /**
        * Sets the minimum and maximum values of the slider.
        */
        setRange(min: number, max: number): void
        
        /**
        * Signal emitted when the slider value changes, providing the new value.
        
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        /**
        * The step size used when the slider is moved by a single increment.
        */
        singleStep: number
        
        /**
        * The current numeric value of the slider.
        */
        value: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for entering integer numbers.
    */
    class SpinBox extends Widget {
        /**
        * Constructs a new SpinBox widget for numeric input with configurable range and step values.
        */
        constructor(parent: Widget)
        
        /**
        * Sets the minimum and maximum allowed values for the spin box.
        */
        setRange(min: number, max: number): void
        
        /**
        * Signal emitted when the spin box value changes, passing the new numeric value.
        
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        /**
        * The increment amount applied when stepping the spin box up or down.
        */
        step: number
        
        /**
        * The current numeric value of the spin box.
        */
        value: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget dividing a container into resizable sections.
    */
    class Splitter extends Widget {
        /**
        * Constructs a new Splitter widget for dividing a layout area into resizable panes.
        */
        constructor(parent: Widget)
        
        /**
        * Appends a widget to the splitter.
        */
        addWidget(widget: Widget): void
        
        /**
        * Inserts a widget at the given index position.
        */
        insertWidget(index: number, widget: Widget): void
        
        /**
        * Sets whether the child widget at the given index can be collapsed to zero size.
        */
        setCollapsible(index: number, collapsible: boolean): void
        
        /**
        * Whether child widgets can be collapsed to zero size by the user.
        */
        childrenCollapsible: boolean
        
        /**
        * Number of child widgets in the splitter.
        
        * @readonly
        */
        count: number
        
        /**
        * Width of the divider handle between child widgets, in pixels.
        */
        handleWidth: number
        
        /**
        * Signal emitted when the splitter handle is moved.
        
        * @readonly
        */
        onSplitterMove: signal2<number, number, void>
        
        /**
        * Layout direction of the splitter, either horizontal or vertical.
        */
        orientation: Orientation
        
        /**
        * List of sizes of the child widgets in pixels.
        */
        sizes: number[]
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Layout manager displaying one widget at a time.
    */
    class StackedLayout extends Layout {
        /**
        * Constructs a new StackedLayout instance for stacking widgets on top of each other.
        */
        constructor()
        
        /**
        * Inserts a widget at the specified index and returns its position in the stack.
        */
        addWidgetAt(widget: Widget, index: number): number
        
        /**
        * Index of the currently visible widget in the stack.
        */
        currentIndex: number
        
        /**
        * Signal fired when the visible widget index changes, passing the new index.
        
        * @readonly
        */
        onCurrentChanged: signal1<number, void>
        
        /**
        * Controls how widgets are stacked and which one is visible.
        */
        stackingMode: StackingMode
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Container displaying one child widget at a time.
    */
    class StackedWidget extends Widget {
        /**
        * Constructs a new StackedWidget container that displays one child widget at a time.
        */
        constructor(parent: Widget)
        
        /**
        * Adds a widget to the stack and returns its index.
        */
        addWidget(widget: Widget): number
        
        /**
        * Index of the currently visible widget.
        */
        currentIndex: number
        
        /**
        * Reference to the currently visible widget.
        */
        currentWidget: Widget
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying stacking order mode.
    */
    enum StackingMode {
        /**
        * Stacks only one widget at a time, hiding others.
        */
        StackOne,
        /**
        * Stacks all widgets simultaneously.
        */
        StackAll
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget showing status with color or icon.
    */
    class StatusIndicator extends Widget {
        /**
        * Constructs a new StatusIndicator widget instance.
        */
        constructor(text: string, parent: Widget)
        
        /** @internal */
        static create(widget: StatusIndicator): StatusIndicator
        
        /**
        * Starts the spinning animation of the status indicator.
        */
        start(): void
        
        /**
        * Stops the spinning animation of the status indicator.
        */
        stop(): void
        
        /**
        * The label text displayed alongside the status indicator.
        */
        text: string
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget displaying tabs for switching between panels.
    */
    class TabBar extends Widget {
        /**
        * Constructs a new TabBar widget for organizing content into selectable tabs.
        */
        constructor(parent: Widget)
        
        /**
        * Adds a new tab with the given text label.
        */
        addTab(text: string): void
        
        /**
        * Sets the icon for the tab at the specified index.
        */
        setTabIcon(index: number, icon: Editor.Icon): void
        
        /**
        * Index of the currently selected tab.
        */
        currentIndex: number
        
        /**
        * Signal emitted when the selected tab index changes.
        
        * @readonly
        */
        onCurrentChange: signal1<number, void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Represents cursor position in text.
    */
    class TextCursor {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Moves the cursor using the given operation and mode, returns true if the position changed.
        */
        movePosition(operation: TextCursor.MoveOperation, mode: TextCursor.MoveMode): boolean
        
    }

}

declare module "LensStudio:Ui" {
    namespace TextCursor {
        /**
        * Enum controlling whether cursor movement also moves the anchor or keeps it in place, defining selection behavior.
        */
        enum MoveMode {
            /**
            * Moves both the cursor and the anchor to the new position, collapsing any selection.
            */
            MoveAnchor,
            /**
            * Moves only the cursor while keeping the anchor fixed, extending or creating a selection.
            */
            KeepAnchor
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace TextCursor {
        /**
        * Enum of cursor movement operations for navigating within a text document.
        */
        enum MoveOperation {
            /**
            * Cursor does not move.
            */
            NoMove,
            /**
            * Moves cursor to the start of the document.
            */
            Start,
            /**
            * Moves cursor up one line.
            */
            Up,
            /**
            * Moves cursor to the start of the current line.
            */
            StartOfLine,
            /**
            * Moves cursor to the start of the current block.
            */
            StartOfBlock,
            /**
            * Moves cursor to the start of the current word.
            */
            StartOfWord,
            /**
            * Moves cursor to the start of the previous block.
            */
            PreviousBlock,
            /**
            * Moves cursor one character backward.
            */
            PreviousCharacter,
            /**
            * Moves cursor to the start of the previous word.
            */
            PreviousWord,
            /**
            * Moves cursor one character to the left.
            */
            Left,
            /**
            * Moves cursor one word to the left.
            */
            WordLeft,
            /**
            * Moves cursor to the end of the document.
            */
            End,
            /**
            * Moves cursor down one line.
            */
            Down,
            /**
            * Moves cursor to the end of the current line.
            */
            EndOfLine,
            /**
            * Moves cursor to the end of the current block.
            */
            EndOfBlock,
            /**
            * Moves cursor to the start of the next block.
            */
            NextBlock,
            /**
            * Moves cursor one character forward.
            */
            NextCharacter,
            /**
            * Moves cursor to the start of the next word.
            */
            NextWord,
            /**
            * Moves cursor one character to the right.
            */
            Right,
            /**
            * Moves cursor one word to the right.
            */
            WordRight,
            /**
            * Moves cursor to the next table cell.
            */
            NextCell,
            /**
            * Moves cursor to the previous table cell.
            */
            PreviousCell,
            /**
            * Moves cursor to the first cell of the next table row.
            */
            NextRow,
            /**
            * Moves cursor to the first cell of the previous table row.
            */
            PreviousRow
        }
    
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for multi-line text input.
    */
    class TextEdit extends Widget {
        /**
        * Constructs a new TextEdit widget for multi-line text input.
        */
        constructor(parent: Widget)
        
        /**
        * Controls whether rich text formatting is accepted (true = formatted, false = plain text only).
        */
        acceptRichText: boolean
        
        /**
        * Signal emitted whenever the text content changes.
        
        * @readonly
        */
        onTextChange: signal0<void>
        
        /**
        * String displayed when TextEdit is empty, shown in dimmed text as a hint to the user.
        */
        placeholderText: string
        
        /**
        * When set, replaces entire content with plain text.
        */
        plainText: string
        
        /**
        * Controlling edit permissions (true = read-only, false = editable).
        */
        readOnly: boolean
        
        /**
        * Object reppresenting cursor position and selection, used to move cursor or select text.
        */
        textCursor: TextCursor
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Configuration for toolbar appearance and behavior.
    */
    class ToolbarConfig {
        /**
        * Constructs a new ToolbarConfig instance for configuring a plugin's toolbar button appearance and behavior.
        */
        constructor()
        
        /**
        * Text label displayed on the toolbar.
        */
        caption: string
        
        /**
        * Icon displayed on the toolbar.
        */
        icon: Editor.Icon
        
        /**
        * Toolbar behavior and layout settings.
        */
        settings: ToolbarSettings
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying toolbar position.
    */
    enum ToolbarPosition {
        /**
        * Docks the toolbar to the right side.
        */
        Right,
        /**
        * Docks the toolbar to the left side.
        */
        Left
    }

}

declare module "LensStudio:Ui" {
    /**
    * Settings for toolbar configuration.
    */
    class ToolbarSettings {
        /**
        * Constructs a new ToolbarSettings configuration object for use in a plugin descriptor's toolbar configuration.
        */
        constructor()
        
        /**
        * Position of the toolbar within the editor layout, as a ToolbarPosition value.
        */
        position: ToolbarPosition
        
        /**
        * Whether this toolbar is designated as the primary toolbar.
        */
        primary: boolean
        
        /**
        * Numeric priority used to determine toolbar ordering when multiple toolbars share the same position.
        */
        priority: number
        
        /**
        * Whether text labels are shown alongside toolbar icons.
        */
        showText: boolean
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Button suitable for toolbar placement.
    */
    class ToolButton extends AbstractButton {
        /**
        * Constructs a new ToolButton widget.
        */
        constructor(parent: Widget)
        
        /**
        * Sets the default action associated with the button.
        */
        setDefaultAction(action: Action): void
        
        /**
        * Signal emitted when the button is clicked.
        
        * @readonly
        */
        onClick: signal0<void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Enum specifying image transformation mode.
    */
    enum TransformationMode {
        /**
        * Applies a fast, lower-quality transformation without anti-aliasing.
        */
        FastTransformation,
        /**
        * Applies a smooth, higher-quality transformation with anti-aliasing.
        */
        SmoothTransformation
    }

}

declare module "LensStudio:Ui" {
    /**
    * Container with vertical scrolling.
    */
    class VerticalScrollArea extends Widget {
        /**
        * Constructs a new vertical scroll area widget.
        */
        constructor(parent: Widget)
        
        /**
        * Sets the child widget to be displayed inside the scroll area.
        */
        setWidget(widget: Widget): void
        
        /**
        * The maximum scroll position value.
        
        * @readonly
        */
        maximum: number
        
        /**
        * The minimum scroll position value.
        
        * @readonly
        */
        minimum: number
        
        /**
        * Signal emitted when the scroll position value changes.
        
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        /**
        * The current scroll position within the scroll area.
        */
        value: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Widget for displaying video content.
    */
    class VideoView extends Widget {
        /**
        * Constructs a new VideoView widget for embedding video playback inside a plugin panel.
        */
        constructor(parent: Widget)
        
        /**
        * Pauses the currently playing video.
        */
        pause(): void
        
        /**
        * Starts or resumes video playback.
        */
        play(): void
        
        /**
        * Sets the video file to play from the given path.
        */
        setSource(path: Editor.Path): void
        
        /**
        * Stops video playback and resets to the beginning.
        */
        stop(): void
        
        /**
        * Total duration of the loaded video in seconds.
        
        * @readonly
        */
        duration: number
        
        /**
        * Number of times the video will loop; -1 for infinite looping.
        */
        loopCount: number
        
        /**
        * Whether the video audio is muted.
        */
        muted: boolean
        
        /**
        * Callback fired when the video view is clicked.
        
        * @readonly
        */
        onClick: signal0<void>
        
        /**
        * Callback fired when the pointer enters or leaves the video view.
        
        * @readonly
        */
        onHover: signal1<boolean, void>
        
        /**
        * Callback fired when the playback position changes.
        
        * @readonly
        */
        onPositionChanged: signal1<number, void>
        
        /**
        * Callback fired when the playback state changes.
        
        * @readonly
        */
        onStateChanged: signal1<any, void>
        
        /**
        * Current playback position in seconds.
        */
        position: number
        
        /**
        * Corner radius of the video view widget.
        */
        radius: number
        
        /**
        * Whether the widget responds to hover events.
        */
        responseHover: boolean
        
        /**
        * Current playback state of the video.
        
        * @readonly
        */
        state: any
        
        /**
        * Playback volume level, from 0.0 to 1.0.
        */
        volume: number
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Embedded Chromium browser widget for HTML/CSS/JavaScript UI.
    */
    class WebEngineView extends Widget {
        /**
        * Constructs an embedded Chromium browser widget for rendering HTML/CSS/JavaScript UI inside a plugin panel.
        */
        constructor(parent: Widget)
        
        /**
        * Navigates the web view to the specified URL.
        */
        load(url: string): void
        
        /**
        * Signal emitted when a page load completes, with a boolean indicating success.
        
        * @readonly
        */
        onLoadFinished: signal1<boolean, void>
        
        /**
        * Signal emitted when a page load begins.
        
        * @readonly
        */
        onLoadStarted: signal0<void>
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * Base class for all UI widgets.
    */
    class Widget extends ScriptObject {
        /**
        * Constructs a new Widget with the given parent widget.
        */
        constructor(parent: Widget)
        
        /**
        * Brings the widget's top-level window to the foreground and gives it focus.
        */
        activateWindow(): void
        
        /**
        * Resizes the widget to fit its contents based on the size hint.
        */
        adjustSize(): void
        
        /**
        * Blocks or unblocks signal emission from the widget.
        */
        blockSignals(blocked: boolean): void
        
        /**
        * Closes the widget, hiding it and emitting the onClose signal.
        */
        close(): void
        
        /**
        * Schedules the widget for deletion after the current event loop iteration.
        */
        deleteLater(): void
        
        findChild(objectName: string): Widget
        
        getProperty(name: string): any
        
        /**
        * Captures the widget's current rendered content as a Pixmap.
        */
        grab(): Pixmap
        
        /**
        * Moves the widget to the specified position.
        */
        move(ax: number, ay: number): void
        
        /**
        * Raises the widget to the top of the parent widget's stack.
        */
        raise(): void
        
        /**
        * Resizes the widget to the specified width and height.
        */
        resize(width: number, height: number): void
        
        /**
        * Sets the margins around the widget's contents.
        */
        setContentsMargins(left: number, top: number, right: number, bottom: number): void
        
        /**
        * Sets the cursor shape displayed when the mouse is over the widget.
        */
        setCursor(shape: CursorShape): void
        
        /**
        * Sets a custom pixmap as the cursor when the mouse is over the widget.
        */
        setCursorPixmap(pixmap: Pixmap): void
        
        setFixedHeight(height: number): void
        
        /**
        * Locks the widget's width to the given value, preventing resizing.
        */
        setFixedWidth(width: number): void
        
        /**
        * Gives keyboard input focus to the widget.
        */
        setFocus(): void
        
        /**
        * Sets the maximum height the widget can be resized to.
        */
        setMaximumHeight(height: number): void
        
        /**
        * Sets the maximum width the widget can be resized to.
        */
        setMaximumWidth(width: number): void
        
        /**
        * Sets the minimum height the widget must maintain.
        */
        setMinimumHeight(height: number): void
        
        /**
        * Sets the minimum width the widget must maintain.
        */
        setMinimumWidth(width: number): void
        
        setProperty(name: string, value: any): boolean
        
        /**
        * Controls how the widget grows or shrinks relative to its layout.
        */
        setSizePolicy(horizontal: SizePolicy.Policy, vertical: SizePolicy.Policy): void
        
        /**
        * Marks property changes on this widget as undoable via the undo stack.
        */
        setUndoable(undoable: boolean): void
        
        /**
        * Marks property changes on this widget and all its children as undoable.
        */
        setUndoableRecursive(undoable: boolean): void
        
        /**
        * Makes the widget visible.
        */
        show(): void
        
        /**
        * Resets the cursor to the parent widget's cursor.
        */
        unsetCursor(): void
        
        /**
        * Whether the widget automatically fills its background before painting.
        */
        autoFillBackground: boolean
        
        /**
        * The color role used for the widget's background.
        */
        backgroundRole: ColorRole
        
        /**
        * @readonly
        */
        className: string
        
        /**
        * Controls how the widget handles context menu requests.
        */
        contextMenuPolicy: ContextMenuPolicy
        
        /**
        * The ratio between physical and logical pixels for the widget's display.
        
        * @readonly
        */
        devicePixelRatio: number
        
        /**
        * Whether the widget is interactive and accepts user input.
        */
        enabled: boolean
        
        /**
        * The font role applied to the widget's text rendering.
        */
        fontRole: FontRole
        
        /**
        * The color role used for the widget's foreground elements.
        */
        foregroundRole: ColorRole
        
        /**
        * @readonly
        */
        hasFocus: boolean
        
        /**
        * Current height of the widget in pixels.
        
        * @readonly
        */
        height: number
        
        /**
        * Whether the widget is hidden from view.
        */
        hidden: boolean
        
        /**
        * True if the underlying native widget object has been destroyed.
        
        * @readonly
        */
        isNull: boolean
        
        isTransparentForMouseEvents: boolean
        
        /**
        * The layout manager assigned to arrange child widgets.
        */
        layout: Layout
        
        objectName: string
        
        /**
        * Signal emitted when the widget is closed.
        
        * @readonly
        */
        onClose: signal1<import('LensStudio:Ui').CloseEvent, void>
        
        /**
        * @readonly
        */
        onFocusIn: signal0<void>
        
        /**
        * @readonly
        */
        onFocusOut: signal0<void>
        
        /**
        * Signal emitted when the widget becomes hidden.
        
        * @readonly
        */
        onHide: signal0<void>
        
        /**
        * Signal emitted when a key is pressed while the widget has focus.
        
        * @readonly
        */
        onKeyPress: signal1<number, void>
        
        /**
        * Signal emitted when the user double-clicks on the widget.
        
        * @readonly
        */
        onMouseDoubleClick: signal1<import('LensStudio:Ui').MouseEvent, void>
        
        /**
        * Signal emitted when the mouse moves over the widget.
        
        * @readonly
        */
        onMouseMove: signal1<import('LensStudio:Ui').MouseEvent, void>
        
        /**
        * Signal emitted when a mouse button is pressed on the widget.
        
        * @readonly
        */
        onMousePress: signal1<import('LensStudio:Ui').MouseEvent, void>
        
        /**
        * Signal emitted when a mouse button is released on the widget.
        
        * @readonly
        */
        onMouseRelease: signal1<import('LensStudio:Ui').MouseEvent, void>
        
        /**
        * Signal emitted when the widget is resized.
        
        * @readonly
        */
        onResize: signal2<number, number, void>
        
        /**
        * Signal emitted when the widget becomes visible.
        
        * @readonly
        */
        onShow: signal0<void>
        
        /**
        * Text displayed in a tooltip when the user hovers over the widget.
        */
        toolTip: string
        
        /**
        * Whether the widget is currently visible.
        */
        visible: boolean
        
        /**
        * Current width of the widget in pixels.
        
        * @readonly
        */
        width: number
        
        /**
        * Title text displayed in the widget's title bar when shown as a window.
        */
        windowTitle: string
        
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * Descriptor for a workspace, defining its identity and configuration within the Workspaces system.
        
        * @beta
        */
        class Descriptor {
            /**
            * Constructs a new workspace descriptor holding layout and metadata configuration.
            
            * @beta
            */
            constructor()
            
            /**
            * Function that reads and returns the layout configuration for the workspace.
            
            * @beta
            */
            layoutReader: import('LensStudio:Serialization').IReader
            
            /**
            * Metadata associated with the workspace descriptor, such as display name and other identifying properties.
            
            * @beta
            */
            metadata: Workspaces.Metadata
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * Holds metadata for a workspace, including its display name and icon.
        
        * @beta
        */
        class Metadata {
            /**
            * Constructs a new Metadata instance for a workspace, holding its display name and icon.
            
            * @beta
            */
            constructor()
            
            /**
            * Icon representing the workspace in the UI.
            
            * @beta
            */
            icon: Editor.Icon
            
            /**
            * Display name of the workspace.
            
            * @beta
            */
            name: string
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * Handle referencing a saved workspace layout preset.
        
        * @beta
        */
        class PresetHandle {
            
            /** @hidden */
            protected constructor()
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * Represents a workspace layout containing a dock manager and associated metadata.
        
        * @beta
        */
        class Workspace extends ScriptObject {
            
            /** @hidden */
            protected constructor()
            
            /**
            * The dock manager controlling panel layout within this workspace.
            
            * @readonly
            
            * @beta
            */
            dockManager: Editor.Dock.IDockManager
            
            /**
            * Metadata associated with this workspace.
            
            * @readonly
            
            * @beta
            */
            metadata: Workspaces.Metadata
            
        }
    
    }

}

/**
* @module LensStudio:UiTest
*/
declare module "LensStudio:UiTest" {
    export function KeyEvent(type: EventType, key: import('LensStudio:Ui').Key, modifiers: import('LensStudio:Ui').KeyboardModifier, text: string): import('LensStudio:Ui').KeyEvent
    
    export function MouseEvent(type: EventType, button: import('LensStudio:Ui').MouseButton, modifiers: import('LensStudio:Ui').KeyboardModifier, x: number, y: number): import('LensStudio:Ui').MouseEvent
    
    export function findChildren(widget: import('LensStudio:Ui').Widget, className: string): import('LensStudio:Ui').Widget[]
    
    export function invoke(widget: import('LensStudio:Ui').Widget, method: string): boolean
    
    export function itemClick(widget: import('LensStudio:Ui').Widget, path: number[]): void
    
    export function itemCollapse(widget: import('LensStudio:Ui').Widget, path: number[]): void
    
    export function itemCount(widget: import('LensStudio:Ui').Widget, path: number[]): number
    
    export function itemExpand(widget: import('LensStudio:Ui').Widget, path: number[]): void
    
    export function itemText(widget: import('LensStudio:Ui').Widget, path: number[]): string
    
    export function mainWindow(gui: import('LensStudio:Ui').IGui): import('LensStudio:Ui').Widget
    
    export function processEvents(ms: number): void
    
    export function sendEvent(widget: import('LensStudio:Ui').Widget, event: import('LensStudio:Ui').Event): void
    
}

declare module "LensStudio:UiTest" {
    enum EventType {
        MouseButtonPress,
        MouseButtonRelease,
        MouseButtonDblClick,
        MouseMove,
        KeyPress,
        KeyRelease
    }

}

/**
* Plugin module that enables custom URI scheme handling within Lens Studio.

* @module LensStudio:UriHandlerPlugin
*/
declare module "LensStudio:UriHandlerPlugin" {
}

declare module "LensStudio:UriHandlerPlugin" {
    /**
    * Descriptor for a URI handler plugin, providing metadata and instantiation logic.
    */
    class Descriptor extends BaseDescriptor {
        /**
        * Constructs a new UriHandlerPlugin descriptor instance.
        */
        constructor()
        
        /**
        * Callback that determines whether this handler can instantiate the given asset.
        */
        canHandle: (arg1: string) => any
        
    }

}

declare module "LensStudio:UriHandlerPlugin" {
    /**
    * Plugin base class for handling URI requests within the Editor plugin system.
    */
    class UriHandlerPlugin extends Editor.IPlugin {
        /**
        * Constructs a UriHandlerPlugin instance with the given plugin system and optional descriptor.
        */
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        /**
        * Handles a URI string and returns whether it was successfully processed.
        */
        handle(uri: string): boolean
        
        /**
        * The PluginSystem instance this plugin is registered with.
        
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Namespace providing UUID creation and manipulation utilities for identifying assets, components, and packages.

* @module LensStudio:Uuid
*/
declare module "LensStudio:Uuid" {
    /**
    * Parses a UUID from its string representation.
    */
    export function fromString(uuid: string): Uuid
    
    /**
    * A UUID instance representing an invalid or null identifier.
    */
    let invalid: import('LensStudio:Uuid').Uuid
    
}

declare module "LensStudio:Uuid" {
    /**
    * Represents a universally unique identifier used to reference assets and components.
    */
    class Uuid {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Check if uuid is valid.
        */
        isValid(): boolean
        
        /**
        * Convert uuid to string.
        */
        toString(): string
        
    }

}

/**
* WebSocket module exposing client and server types for real-time bidirectional communication over the WebSocket protocol.

* @module LensStudio:WebSocket
*/
declare module "LensStudio:WebSocket" {
}

declare module "LensStudio:WebSocket" {
    import {BaseSocket} from "LensStudio:Network" 
    
    /**
    * WebSocket client for establishing and communicating over WebSocket connections in Lens Studio plugins.
    */
    class WebSocket extends BaseSocket {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Connects to a remote address using the WebSocket protocol.
        */
        connect(address: import('LensStudio:Network').Address): void
        
        /**
        * Sends binary or text data over the WebSocket connection, returning the number of bytes sent.
        */
        send(data: (Uint8Array|string)): number
        
        /**
        * Creates a new WebSocket instance.
        */
        static create(): WebSocket
        
    }

}

declare module "LensStudio:WebSocket" {
    import {BaseServer} from "LensStudio:Network" 
    
    /**
    * WebSocket server that listens on a local address and accepts incoming client connections from web content or other plugins.
    */
    class WebSocketServer extends BaseServer {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Creates and returns a new WebSocketServer instance.
        */
        static create(): WebSocketServer
        
    }

}

/**
* 2x2 column-major floating-point matrix.
*/
declare class mat2 {
    /**
    * Constructs a new mat2 initialized to the identity matrix.
    */
    constructor()
    
    /**
    * Adds another mat2 to this matrix and returns the result.
    */
    add(mat: mat2): mat2
    
    /**
    * Returns the scalar determinant of this matrix.
    */
    determinant(): number
    
    /**
    * Divides this matrix by another mat2 element-wise and returns the result.
    */
    div(mat: mat2): mat2
    
    /**
    * Returns true if this matrix equals the given mat2.
    */
    equal(mat: mat2): boolean
    
    /**
    * Returns the inverse of this matrix.
    */
    inverse(): mat2
    
    /**
    * Multiplies this matrix by another mat2 and returns the result.
    */
    mult(mat: mat2): mat2
    
    /**
    * Multiplies each element of this matrix by a scalar and returns the result.
    */
    multiplyScalar(scalar: number): mat2
    
    /**
    * Subtracts another mat2 from this matrix and returns the result.
    */
    sub(mat: mat2): mat2
    
    /**
    * Returns a string representation of this matrix.
    */
    toString(): string
    
    /**
    * Returns the transpose of this matrix.
    */
    transpose(): mat2
    
    /**
    * First column of the matrix as a vec2.
    */
    column0: vec2
    
    /**
    * Second column of the matrix as a vec2.
    */
    column1: vec2
    
    /**
    * Human-readable description string for this matrix instance.
    */
    description: string
    
    /**
    * Returns a mat2 set to the identity matrix.
    */
    static identity(): mat2
    
    /**
    * Returns a mat2 with all elements set to zero.
    */
    static zero(): mat2
    
}

/**
* A 3x3 matrix type supporting common linear algebra operations.
*/
declare class mat3 {
    /**
    * Constructs a new identity mat3 matrix.
    */
    constructor()
    
    /**
    * Adds another mat3 to this matrix and returns the result.
    */
    add(mat: mat3): mat3
    
    /**
    * Returns the scalar determinant of this matrix.
    */
    determinant(): number
    
    /**
    * Divides this matrix by another mat3 element-wise and returns the result.
    */
    div(mat: mat3): mat3
    
    /**
    * Returns true if this matrix equals the given mat3.
    */
    equal(mat: mat3): boolean
    
    /**
    * Returns the inverse of this matrix.
    */
    inverse(): mat3
    
    /**
    * Multiplies this matrix by another mat3 and returns the result.
    */
    mult(mat: mat3): mat3
    
    /**
    * Multiplies all elements of this matrix by a scalar value and returns the result.
    */
    multiplyScalar(scalar: number): mat3
    
    /**
    * Subtracts another mat3 from this matrix and returns the result.
    */
    sub(mat: mat3): mat3
    
    /**
    * Returns a string representation of this matrix.
    */
    toString(): string
    
    /**
    * Returns the transpose of this matrix.
    */
    transpose(): mat3
    
    /**
    * First column vector of the matrix.
    */
    column0: vec3
    
    /**
    * Second column vector of the matrix.
    */
    column1: vec3
    
    /**
    * Third column vector of the matrix.
    */
    column2: vec3
    
    /**
    * Human-readable description string for this matrix instance.
    */
    description: string
    
    /**
    * Returns a mat3 identity matrix.
    */
    static identity(): mat3
    
    /**
    * Constructs a mat3 rotation matrix from a given angle or rotation value.
    */
    static makeFromRotation(rotation: quat): mat3
    
    /**
    * Returns a mat3 with all elements set to zero.
    */
    static zero(): mat3
    
}

/**
* 4x4 matrix used for 3D transformations including rotation, scale, translation, and projection.
*/
declare class mat4 {
    /**
    * Constructs a new identity mat4.
    */
    constructor()
    
    /**
    * Adds another mat4 to this matrix and returns the result.
    */
    add(mat: mat4): mat4
    
    /**
    * Returns the scalar determinant of this matrix.
    */
    determinant(): number
    
    /**
    * Divides this matrix by another mat4 element-wise and returns the result.
    */
    div(mat: mat4): mat4
    
    /**
    * Returns true if this matrix equals the given mat4.
    */
    equal(mat: mat4): boolean
    
    /**
    * Extracts and returns the Euler angles as a vec3 from this matrix.
    */
    extractEulerAngles(): vec3
    
    /**
    * Returns the inverse of this matrix.
    */
    inverse(): mat4
    
    /**
    * Multiplies this matrix by another mat4 and returns the result.
    */
    mult(mat: mat4): mat4
    
    /**
    * Transforms a direction vector by this matrix, ignoring translation.
    */
    multiplyDirection(direction: vec3): vec3
    
    /**
    * Transforms a point by this matrix, applying translation.
    */
    multiplyPoint(point: vec3): vec3
    
    /**
    * Multiplies this matrix by a scalar value and returns the result.
    */
    multiplyScalar(scalar: number): mat4
    
    /**
    * Multiplies this matrix by a vec4 and returns the result.
    */
    multiplyVector(vector: vec4): vec4
    
    /**
    * Subtracts another mat4 from this matrix and returns the result.
    */
    sub(mat: mat4): mat4
    
    /**
    * Returns a string representation of this matrix.
    */
    toString(): string
    
    /**
    * Returns the transpose of this matrix.
    */
    transpose(): mat4
    
    /**
    * First column of the matrix as a vec4.
    */
    column0: vec4
    
    /**
    * Second column of the matrix as a vec4.
    */
    column1: vec4
    
    /**
    * Third column of the matrix as a vec4.
    */
    column2: vec4
    
    /**
    * Fourth column of the matrix as a vec4.
    */
    column3: vec4
    
    /**
    * Returns a string representation of the matrix.
    */
    description: string
    
    /**
    * Performs component-wise multiplication of two mat4 matrices and returns the result.
    */
    static compMult(a: mat4, b: mat4): mat4
    
    /**
    * Constructs a mat4 from translation, rotation quaternion, and scale components.
    */
    static compose(translation: vec3, rotation: quat, scale: vec3): mat4
    
    /**
    * Creates a mat4 from four column vectors.
    */
    static fromColumns(column0: vec4, column1: vec4, column2: vec4, column3: vec4): mat4
    
    /**
    * Creates a mat4 rotation matrix from Euler angles in radians.
    */
    static fromEulerAngles(angles: vec3): mat4
    
    /**
    * Creates a mat4 rotation matrix for a rotation around the X axis.
    */
    static fromEulerX(angle: number): mat4
    
    /**
    * Creates a mat4 rotation matrix for a rotation around the Y axis.
    */
    static fromEulerY(angle: number): mat4
    
    /**
    * Creates a mat4 rotation matrix for a rotation around the Z axis.
    */
    static fromEulerZ(angle: number): mat4
    
    /**
    * Creates a mat4 rotation matrix from a quaternion.
    */
    static fromRotation(rotation: quat): mat4
    
    /**
    * Creates a mat4 from four row vectors.
    */
    static fromRows(row0: vec4, row1: vec4, row2: vec4, row3: vec4): mat4
    
    /**
    * Creates a mat4 scale matrix from a vec3.
    */
    static fromScale(scale: vec3): mat4
    
    /**
    * Creates a mat4 translation matrix from a vec3.
    */
    static fromTranslation(translation: vec3): mat4
    
    /**
    * Returns a mat4 identity matrix.
    */
    static identity(): mat4
    
    /**
    * Creates a view matrix that orients toward a target from an eye position.
    */
    static lookAt(eye: vec3, center: vec3, up: vec3): mat4
    
    /**
    * Constructs a mat4 from three basis vectors.
    */
    static makeBasis(x: vec3, y: vec3, z: vec3): mat4
    
    /**
    * Creates an orthographic projection matrix.
    */
    static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): mat4
    
    /**
    * Computes the outer product of two vec4 vectors and returns the resulting mat4.
    */
    static outerProduct(a: vec4, b: vec4): mat4
    
    /**
    * Creates a perspective projection matrix.
    */
    static perspective(fov: number, aspect: number, near: number, far: number): mat4
    
    /**
    * Returns a mat4 with all elements set to zero.
    */
    static zero(): mat4
    
}

/**
* Utility class providing common math operations and constants.
*/
declare class MathUtils {
    
    /** @hidden */
    protected constructor()
    
    /**
    * Clamps value v between lo and hi.
    */
    static clamp(v: number, lo: number, hi: number): number
    
    /**
    * Linearly interpolates between a and b by time.
    */
    static lerp(a: number, b: number, time: number): number
    
    /**
    * Returns a random number between lo and hi.
    */
    static randomRange(lo: number, hi: number): number
    
    /**
    * Remaps value v from input range to output range.
    */
    static remap(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number
    
    /**
    * Conversion factor from degrees to radians.
    */
    static DegToRad: number
    
    /**
    * Conversion factor from radians to degrees.
    */
    static RadToDeg: number
    
}

/**
* Quaternion type for representing rotations in 3D space.
*/
declare class quat {
    /**
    * Constructs a quaternion with the given w, x, y, z components.
    */
    constructor(w: number, x: number, y: number, z: number)
    
    /**
    * Computes the dot product with another quaternion.
    */
    dot(quat: quat): number
    
    /**
    * Returns true if this quaternion equals another quaternion.
    */
    equal(quat: quat): boolean
    
    /**
    * Returns the rotation angle in radians represented by this quaternion.
    */
    getAngle(): number
    
    /**
    * Returns the rotation axis as a vec3.
    */
    getAxis(): vec3
    
    /**
    * Returns the inverse of this quaternion.
    */
    invert(): quat
    
    /**
    * Multiplies this quaternion by another, combining rotations.
    */
    multiply(quat: quat): quat
    
    /**
    * Rotates a vec3 by this quaternion.
    */
    multiplyVec3(vec3: vec3): vec3
    
    /**
    * Returns a normalized copy of this quaternion.
    */
    normalize(): void
    
    /**
    * Converts this quaternion to Euler angles in radians.
    */
    toEulerAngles(): vec3
    
    /**
    * Returns a string representation of this quaternion.
    */
    toString(): string
    
    /**
    * The w (scalar) component of the quaternion.
    */
    w: number
    
    /**
    * The x component of the quaternion.
    */
    x: number
    
    /**
    * The y component of the quaternion.
    */
    y: number
    
    /**
    * The z component of the quaternion.
    */
    z: number
    
    /**
    * Creates a quaternion from an angle in radians and a rotation axis.
    */
    static angleAxis(angle: number, axis: vec3): quat
    
    /**
    * Returns the angle in radians between two quaternions.
    */
    static angleBetween(a: quat, b: quat): number
    
    /**
    * Creates a quaternion from Euler angles given as separate x, y, z values.
    */
    static fromEulerAngles(x: number, y: number, z: number): quat
    
    /**
    * Creates a quaternion from a vec3 of Euler angles.
    */
    static fromEulerVec(eulerAngles: vec3): quat
    
    /**
    * Creates a quaternion from a 3x3 rotation matrix.
    */
    static fromRotationMat(rotationMat: mat3): quat
    
    /**
    * Creates a quaternion from a 4x4 rotation matrix.
    */
    static fromRotationMat4(rotationMat4: mat4): quat
    
    /**
    * Linearly interpolates between two quaternions by factor t.
    */
    static lerp(a: quat, b: quat, time: number): quat
    
    /**
    * Creates a quaternion representing a rotation that looks from one point toward another.
    */
    static lookAt(forward: vec3, up: vec3): quat
    
    /**
    * Returns the identity quaternion representing no rotation.
    */
    static quatIdentity(): quat
    
    /**
    * Creates a quaternion representing the rotation from one vector to another.
    */
    static rotationFromTo(from: vec3, to: vec3): quat
    
    /**
    * Spherically interpolates between two quaternions by factor t.
    */
    static slerp(a: quat, b: quat, time: number): quat
    
}

/**
* Base class for all script-accessible Lens Studio objects.
*/
declare class ScriptObject {
    
    /** @hidden */
    protected constructor()
    
    /**
    * Returns the name of this object's type.
    */
    getTypeName(): string
    
    /**
    * Returns true if the object is of the specified type.
    */
    isOfType(type: string): boolean
    
    /**
    * Returns true if this object refers to the same instance as the given object.
    */
    isSame(other: ScriptObject): boolean
    
}

/**
* Provides encrypted storage for each plugin module's sensitive data, like access tokens. It uses Keychain on macOS and Credentials Manager on Windows. The data can be stored and retrieved as string-to-string key value pairs via a global secureLocalStorage object. Data for each plugin module (module.json) is kept separate from all others. There is a 2KB limit on the string size because this is meant for small pieces of secure info rather than a generic container.
*/
declare class SecureLocalStorage extends ScriptObject {
    
    /** @hidden */
    protected constructor()
    
    /**
    * Remove all values in the storage.
    */
    clear(): void
    
    /**
    * Get the value stored under `keyName`.
    */
    getItem(keyName: string): string | undefined
    
    /**
    * Get the length of the storage.
    */
    length(): number
    
    /**
    * Remove the stored value under `keyName`.
    */
    removeItem(keyName: string): void
    
    /**
    * Sets the value stored under `keyName`.
    */
    setItem(keyName: string, keyValue: string): void
    
}

/**
* Namespace providing task management utilities for tracking and coordinating asynchronous operations.
*/
declare class Task {
    
    /** @hidden */
    protected constructor()
    
}

declare namespace Task {
    /**
    * Interface for a plugin component that manages pending tasks and exposes a promise that resolves when all tasks complete.
    */
    class ITaskManager extends Editor.IPluginComponent {
        
        /** @hidden */
        protected constructor()
        
        /**
        * Returns a promise that resolves when all pending tasks have completed.
        */
        whenAllCompleted(): Promise<void>
        
        /**
        * Unique identifier for the ITaskManager interface, used for component lookup.
        */
        static interfaceId: Editor.InterfaceId
        
    }

}

declare namespace Task {
    /**
    * Concrete implementation of ITaskManager that tracks and coordinates task completion within the editor.
    */
    class TaskManager extends Task.ITaskManager {
        
        /** @hidden */
        protected constructor()
        
    }

}

/**
* Decodes binary data from a Uint8Array into a string using a specified character encoding.
*/
declare class TextDecoder extends ScriptObject {
    /**
    * Constructs a TextDecoder with an optional encoding name (defaults to UTF-8).
    */
    constructor(encoding?: string)
    
    /**
    * Decodes a Uint8Array into a string using the instance's encoding.
    */
    decode(data: Uint8Array): string
    
    /**
    * The character encoding name used by this decoder, e.g. 'utf-8'.
    
    * @readonly
    */
    encoding: string
    
}

/**
* Encodes strings into UTF-8 byte arrays.
*/
declare class TextEncoder extends ScriptObject {
    /**
    * Creates a new TextEncoder instance.
    */
    constructor()
    
    /**
    * Encodes a string into a Uint8Array using UTF-8.
    */
    encode(value: string): Uint8Array
    
    /**
    * Encodes a string into an existing Uint8Array in place.
    */
    encodeInto(value: string, result: Uint8Array): void
    
    /**
    * The encoding format used by this encoder, always 'utf-8'.
    
    * @readonly
    */
    encoding: string
    
}

/**
* A handle for a timer. You can create a timeout using {@link setTimeout}.
*/
declare class Timeout extends ScriptObject {
    
    /** @hidden */
    protected constructor()
    
}

/**
* 2D vector with x and y components, used for 2D positions, directions, and math operations.
*/
declare class vec2 {
    /**
    * Constructs a vec2 with the given x and y values.
    */
    constructor(x: number, y: number)
    
    /**
    * Returns a new vec2 that is the sum of this and the given vector.
    */
    add(vec: vec2): vec2
    
    /**
    * Adds the given vector to this vector in place.
    */
    addInPlace(vec: vec2): void
    
    /**
    * Returns the angle in radians between this vector and the given vector.
    */
    angleTo(vec: vec2): number
    
    /**
    * Returns a new vec2 with its length clamped to the given maximum.
    */
    clampLength(length: number): vec2
    
    /**
    * Clamps the length of this vector to the given maximum in place.
    */
    clampLengthInPlace(length: number): void
    
    /**
    * Returns a new vec2 with the same x and y values.
    */
    clone(): vec2
    
    /**
    * Copies x and y values from the given vector into this vector.
    */
    copyFrom(source: (vec3|vec4|vec2)): void
    
    /**
    * Returns the distance between this vector and the given vector.
    */
    distance(vec: vec2): number
    
    /**
    * Returns the squared distance between this vector and the given vector.
    */
    distanceSquared(vec: vec2): number
    
    /**
    * Returns a new vec2 that is this vector divided component-wise by the given vector.
    */
    div(vec: vec2): vec2
    
    /**
    * Divides this vector component-wise by the given vector in place.
    */
    divInPlace(vec: vec2): void
    
    /**
    * Returns the dot product of this vector and the given vector.
    */
    dot(vec: vec2): number
    
    /**
    * Returns true if this vector and the given vector have equal x and y values.
    */
    equal(vec: vec2): boolean
    
    /**
    * Sets all components of this vector to the given scalar value.
    */
    fill(scalar: number): void
    
    /**
    * Linearly interpolates this vector toward the target vector by the given factor in place.
    */
    lerpInPlace(target: vec2, t: number): void
    
    /**
    * Returns a new vec2 moved from this vector toward the target by at most the given max distance.
    */
    moveTowards(target: vec2, step: number): vec2
    
    /**
    * Moves this vector toward the target by at most the given max distance in place.
    */
    moveTowardsInPlace(point: vec2, magnitude: number): void
    
    /**
    * Returns a new vec2 that is this vector multiplied component-wise by the given vector.
    */
    mult(vec: vec2): vec2
    
    /**
    * Multiplies this vector component-wise by the given vector in place.
    */
    multInPlace(vec: vec2): void
    
    /**
    * Returns a new vec2 with the same direction but unit length.
    */
    normalize(): vec2
    
    /**
    * Normalizes this vector to unit length in place.
    */
    normalizeInPlace(): void
    
    /**
    * Returns the projection of this vector onto the given vector.
    */
    project(onto: vec2): vec2
    
    /**
    * Projects this vector onto the given vector in place.
    */
    projectInPlace(onto: vec2): void
    
    /**
    * Returns this vector projected onto the plane defined by the given normal.
    */
    projectOnPlane(planeNormal: vec2): vec2
    
    /**
    * Projects this vector onto the plane defined by the given normal in place.
    */
    projectOnPlaneInPlace(planeNormal: vec2): void
    
    /**
    * Returns the reflection of this vector off the surface defined by the given normal.
    */
    reflect(planeNormal: vec2): vec2
    
    /**
    * Reflects this vector off the surface defined by the given normal in place.
    */
    reflectInPlace(planeNormal: vec2): void
    
    /**
    * Returns a new vec2 scaled by the given scalar.
    */
    scale(vec: vec2): vec2
    
    /**
    * Scales this vector by the given scalar in place.
    */
    scaleInPlace(vec: vec2): void
    
    /**
    * Sets this vector to a random unit vector.
    */
    setRandomUnitVector(): void
    
    /**
    * Sets the x and y components of this vector.
    */
    setXY(x?: number, y?: number): void
    
    /**
    * Returns a new vec2 that is this vector minus the given vector.
    */
    sub(vec: vec2): vec2
    
    /**
    * Subtracts the given vector from this vector in place.
    */
    subInPlace(vec: vec2): void
    
    /**
    * Returns a string representation of this vector.
    */
    toString(): string
    
    /**
    * Returns a new vec2 uniformly scaled by the given scalar.
    */
    uniformScale(scale: number): vec2
    
    /**
    * Uniformly scales this vector by the given scalar in place.
    */
    uniformScaleInPlace(scale: number): void
    
    /**
    * Alias for the y component.
    */
    g: number
    
    /**
    * Magnitude of the vector.
    */
    length: number
    
    /**
    * Squared magnitude of the vector.
    */
    lengthSquared: number
    
    /**
    * Alias for the x component.
    */
    r: number
    
    /**
    * Horizontal component of the vector.
    */
    x: number
    
    /**
    * Vertical component of the vector.
    */
    y: number
    
    /**
    * Static vec2 pointing in the negative y direction (0, -1).
    */
    static down(): vec2
    
    /**
    * Static vec2 pointing in the negative x direction (-1, 0).
    */
    static left(): vec2
    
    /**
    * Returns a new vec2 linearly interpolated between two vectors by the given factor.
    */
    static lerp(from: vec2, to: vec2, t: number): vec2
    
    /**
    * Returns a vec2 with the component-wise maximum of two vectors.
    */
    static max(a: vec2, b: vec2): vec2
    
    /**
    * Returns a vec2 with the component-wise minimum of two vectors.
    */
    static min(a: vec2, b: vec2): vec2
    
    /**
    * Static vec2 with all components set to 1.
    */
    static one(): vec2
    
    /**
    * Returns a random unit vec2.
    */
    static randomUnitVector(): vec2
    
    /**
    * Static vec2 pointing in the positive x direction (1, 0).
    */
    static right(): vec2
    
    /**
    * Static vec2 pointing in the positive y direction (0, 1).
    */
    static up(): vec2
    
    /**
    * Static vec2 with all components set to 0.
    */
    static zero(): vec2
    
}

/**
* 3-component floating-point vector used for 3D positions, directions, and RGB color values.
*/
declare class vec3 {
    /**
    * Constructs a vec3 with the given x, y, z components.
    */
    constructor(x: number, y: number, z: number)
    
    /**
    * Returns a new vec3 that is the sum of this vector and the given vector.
    */
    add(vec: vec3): vec3
    
    /**
    * Adds the given vector to this vector in place.
    */
    addInPlace(vec: vec3): void
    
    /**
    * Returns the angle in radians between this vector and the given vector.
    */
    angleTo(vec: vec3): number
    
    /**
    * Returns a new vec3 with its length clamped to the given maximum length.
    */
    clampLength(length: number): vec3
    
    /**
    * Clamps the length of this vector to the given maximum length in place.
    */
    clampLengthInPlace(length: number): void
    
    /**
    * Returns a new vec3 with the same component values as this vector.
    */
    clone(): vec3
    
    /**
    * Copies the component values from the given vector into this vector.
    */
    copyFrom(source: (vec3|vec4|vec2)): void
    
    /**
    * Returns the cross product of this vector and the given vector.
    */
    cross(vec: vec3): vec3
    
    /**
    * Computes the cross product of this vector and the given vector, storing the result in this vector.
    */
    crossInPlace(vec: vec3): void
    
    /**
    * Returns the Euclidean distance between this vector and the given vector.
    */
    distance(vec: vec3): number
    
    /**
    * Returns the squared Euclidean distance between this vector and the given vector.
    */
    distanceSquared(vec: vec3): number
    
    /**
    * Returns a new vec3 that is this vector divided component-wise by the given vector.
    */
    div(vec: vec3): vec3
    
    /**
    * Divides this vector component-wise by the given vector in place.
    */
    divInPlace(vec: vec3): void
    
    /**
    * Returns the dot product of this vector and the given vector.
    */
    dot(vec: vec3): number
    
    /**
    * Returns true if this vector's components are equal to the given vector's components.
    */
    equal(vec: vec3): boolean
    
    /**
    * Sets all components of this vector to the given value.
    */
    fill(scalar: number): void
    
    /**
    * Linearly interpolates this vector toward the given target vector by factor t, in place.
    */
    lerpInPlace(target: vec3, t: number): void
    
    /**
    * Returns a new vec3 moved from this vector toward the target by at most maxDelta distance.
    */
    moveTowards(target: vec3, step: number): vec3
    
    /**
    * Moves this vector toward the target by at most maxDelta distance, in place.
    */
    moveTowardsInPlace(point: vec3, magnitude: number): void
    
    /**
    * Returns a new vec3 that is this vector multiplied component-wise by the given vector.
    */
    mult(vec: vec3): vec3
    
    /**
    * Multiplies this vector component-wise by the given vector in place.
    */
    multInPlace(vec: vec3): void
    
    /**
    * Returns a new vec3 with the same direction as this vector but with length 1.
    */
    normalize(): vec3
    
    /**
    * Normalizes this vector to unit length in place.
    */
    normalizeInPlace(): void
    
    /**
    * Returns the projection of this vector onto the given vector.
    */
    project(onto: vec3): vec3
    
    /**
    * Projects this vector onto the given vector in place.
    */
    projectInPlace(onto: vec3): void
    
    /**
    * Returns the projection of this vector onto the plane defined by the given normal.
    */
    projectOnPlane(planeNormal: vec3): vec3
    
    /**
    * Projects this vector onto the plane defined by the given normal, in place.
    */
    projectOnPlaneInPlace(planeNormal: vec3): void
    
    /**
    * Returns the reflection of this vector off a surface with the given normal.
    */
    reflect(planeNormal: vec3): vec3
    
    /**
    * Reflects this vector off a surface with the given normal, in place.
    */
    reflectInPlace(planeNormal: vec3): void
    
    /**
    * Returns a new vec3 rotated from this vector toward the target, by at most maxAngle radians.
    */
    rotateTowards(target: vec3, step: number): vec3
    
    /**
    * Rotates this vector toward the target by at most maxAngle radians, in place.
    */
    rotateTowardsInPlace(target: vec3, step: number): void
    
    /**
    * Returns a new vec3 that is this vector multiplied by the given scalar.
    */
    scale(vec: vec3): vec3
    
    /**
    * Multiplies this vector by the given scalar in place.
    */
    scaleInPlace(vec: vec3): void
    
    /**
    * Sets the r, g, b components of this vector.
    */
    setRGB(r?: number, g?: number, b?: number): void
    
    /**
    * Sets this vector to a random unit vector in place.
    */
    setRandomUnitVector(): void
    
    /**
    * Sets the x, y, z components of this vector.
    */
    setXYZ(x?: number, y?: number, z?: number): void
    
    /**
    * Spherically interpolates this vector toward the given target vector by factor t, in place.
    */
    slerpInPlace(target: vec3, t: number): void
    
    /**
    * Returns a new vec3 that is this vector minus the given vector.
    */
    sub(vec: vec3): vec3
    
    /**
    * Subtracts the given vector from this vector in place.
    */
    subInPlace(vec: vec3): void
    
    /**
    * Returns a string representation of this vector's components.
    */
    toString(): string
    
    /**
    * Returns a new vec3 with all components multiplied by the given scalar.
    */
    uniformScale(scale: number): vec3
    
    /**
    * Multiplies all components of this vector by the given scalar in place.
    */
    uniformScaleInPlace(scale: number): void
    
    /**
    * Blue channel component, equivalent to z.
    */
    b: number
    
    /**
    * Green channel component, equivalent to y.
    */
    g: number
    
    /**
    * The Euclidean length of this vector.
    */
    length: number
    
    /**
    * The squared Euclidean length of this vector.
    */
    lengthSquared: number
    
    /**
    * Red channel component, equivalent to x.
    */
    r: number
    
    /**
    * X component of this vector.
    */
    x: number
    
    /**
    * Y component of this vector.
    */
    y: number
    
    /**
    * Z component of this vector.
    */
    z: number
    
    /**
    * Static vec3 pointing in the negative Z direction (0, 0, -1).
    */
    static back(): vec3
    
    /**
    * Static vec3 pointing in the negative Y direction (0, -1, 0).
    */
    static down(): vec3
    
    /**
    * Static vec3 pointing in the positive Z direction (0, 0, 1).
    */
    static forward(): vec3
    
    /**
    * Static vec3 pointing in the negative X direction (-1, 0, 0).
    */
    static left(): vec3
    
    /**
    * Returns a new vec3 linearly interpolated between two vectors by factor t.
    */
    static lerp(from: vec3, to: vec3, t: number): vec3
    
    /**
    * Returns a new vec3 with the component-wise maximum of two vectors.
    */
    static max(a: vec3, b: vec3): vec3
    
    /**
    * Returns a new vec3 with the component-wise minimum of two vectors.
    */
    static min(a: vec3, b: vec3): vec3
    
    /**
    * Static vec3 with all components set to 1.
    */
    static one(): vec3
    
    /**
    * Returns an orthonormalized version of the given vector relative to a reference vector.
    */
    static orthonormalize(a: vec3, b: vec3): void
    
    /**
    * Returns a new vec3 with a random unit direction.
    */
    static randomUnitVector(): vec3
    
    /**
    * Static vec3 pointing in the positive X direction (1, 0, 0).
    */
    static right(): vec3
    
    /**
    * Returns a new vec3 spherically interpolated between two vectors by factor t.
    */
    static slerp(from: vec3, to: vec3, t: number): vec3
    
    /**
    * Static vec3 pointing in the positive Y direction (0, 1, 0).
    */
    static up(): vec3
    
    /**
    * Static vec3 with all components set to 0.
    */
    static zero(): vec3
    
}

/**
* Four-component float vector used for XYZW coordinates and RGBA color values.
*/
declare class vec4 {
    /**
    * Constructs a vec4 with the given x, y, z, and w components.
    */
    constructor(x: number, y: number, z: number, w: number)
    
    /**
    * Returns a new vec4 that is the sum of this vector and the given vector.
    */
    add(vec: vec4): vec4
    
    /**
    * Adds the given vector to this vector in place.
    */
    addInPlace(vec: vec4): void
    
    /**
    * Returns the angle in radians between this vector and the given vector.
    */
    angleTo(vec: vec4): number
    
    /**
    * Returns a new vec4 with its length clamped to the given maximum.
    */
    clampLength(length: number): vec4
    
    /**
    * Clamps the length of this vector to the given maximum in place.
    */
    clampLengthInPlace(length: number): void
    
    /**
    * Returns a new vec4 with the same component values.
    */
    clone(): vec4
    
    /**
    * Copies component values from the given vec4 into this vector.
    */
    copyFrom(source: (vec3|vec4|vec2)): void
    
    /**
    * Returns the distance between this vector and the given vector.
    */
    distance(vec: vec4): number
    
    /**
    * Returns the squared distance between this vector and the given vector.
    */
    distanceSquared(vec: vec4): number
    
    /**
    * Returns a new vec4 that is this vector divided component-wise by the given vector.
    */
    div(vec: vec4): vec4
    
    /**
    * Divides this vector component-wise by the given vector in place.
    */
    divInPlace(vec: vec4): void
    
    /**
    * Returns the dot product of this vector and the given vector.
    */
    dot(vec: vec4): number
    
    /**
    * Returns true if this vector and the given vector have equal components.
    */
    equal(vec: vec4): boolean
    
    /**
    * Sets all components of this vector to the given value.
    */
    fill(scalar: number): void
    
    /**
    * Linearly interpolates this vector toward the given vector by the given factor in place.
    */
    lerpInPlace(target: vec4, t: number): void
    
    /**
    * Returns a new vec4 moved toward the target by at most the given max delta.
    */
    moveTowards(target: vec4, step: number): vec4
    
    /**
    * Moves this vector toward the target by at most the given max delta in place.
    */
    moveTowardsInPlace(point: vec4, magnitude: number): void
    
    /**
    * Returns a new vec4 that is this vector multiplied component-wise by the given vector.
    */
    mult(vec: vec4): vec4
    
    /**
    * Multiplies this vector component-wise by the given vector in place.
    */
    multInPlace(vec: vec4): void
    
    /**
    * Returns a new vec4 with unit length in the same direction.
    */
    normalize(): vec4
    
    /**
    * Normalizes this vector to unit length in place.
    */
    normalizeInPlace(): void
    
    /**
    * Returns a new vec4 projected onto the given vector.
    */
    project(onto: vec4): vec4
    
    /**
    * Projects this vector onto the given vector in place.
    */
    projectInPlace(onto: vec4): void
    
    /**
    * Returns a new vec4 projected onto the plane defined by the given normal.
    */
    projectOnPlane(planeNormal: vec4): vec4
    
    /**
    * Projects this vector onto the plane defined by the given normal in place.
    */
    projectOnPlaneInPlace(planeNormal: vec4): void
    
    /**
    * Returns a new vec4 reflected off the plane defined by the given normal.
    */
    reflect(planeNormal: vec4): vec4
    
    /**
    * Reflects this vector off the plane defined by the given normal in place.
    */
    reflectInPlace(planeNormal: vec4): void
    
    /**
    * Returns a new vec4 scaled by the given scalar.
    */
    scale(vec: vec4): vec4
    
    /**
    * Scales this vector by the given scalar in place.
    */
    scaleInPlace(vec: vec4): void
    
    /**
    * Sets the r, g, b, and a components of this vector.
    */
    setRGBA(r?: number, g?: number, b?: number, a?: number): void
    
    /**
    * Sets the x, y, z, and w components of this vector.
    */
    setXYZW(x?: number, y?: number, z?: number, w?: number): void
    
    /**
    * Returns a new vec4 that is this vector minus the given vector.
    */
    sub(vec: vec4): vec4
    
    /**
    * Subtracts the given vector from this vector in place.
    */
    subInPlace(vec: vec4): void
    
    /**
    * Returns a string representation of this vector.
    */
    toString(): string
    
    /**
    * Returns a new vec4 with all components multiplied by the given scalar.
    */
    uniformScale(scale: number): vec4
    
    /**
    * Multiplies all components of this vector by the given scalar in place.
    */
    uniformScaleInPlace(scale: number): void
    
    /**
    * Alpha component of the vector, equivalent to w.
    */
    a: number
    
    /**
    * Blue component of the vector, equivalent to z.
    */
    b: number
    
    /**
    * Green component of the vector, equivalent to y.
    */
    g: number
    
    /**
    * Magnitude of the vector.
    */
    length: number
    
    /**
    * Squared magnitude of the vector.
    */
    lengthSquared: number
    
    /**
    * Red component of the vector, equivalent to x.
    */
    r: number
    
    /**
    * Fourth component of the vector.
    */
    w: number
    
    /**
    * First component of the vector.
    */
    x: number
    
    /**
    * Second component of the vector.
    */
    y: number
    
    /**
    * Third component of the vector.
    */
    z: number
    
    /**
    * Returns a new vec4 linearly interpolated between two vectors by the given factor.
    */
    static lerp(from: vec4, to: vec4, t: number): vec4
    
    /**
    * Returns a new vec4 with the component-wise maximum of two vectors.
    */
    static max(a: vec4, b: vec4): vec4
    
    /**
    * Returns a new vec4 with the component-wise minimum of two vectors.
    */
    static min(a: vec4, b: vec4): vec4
    
    /**
    * Returns a vec4 with all components set to 1.
    */
    static one(): vec4
    
    /**
    * Returns a vec4 with all components set to 0.
    */
    static zero(): vec4
    
}

/**
* A 4-component boolean vector with x/y/z/w and r/g/b/a accessors.
*/
declare class vec4b {
    /**
    * Constructs a vec4b from four boolean components x, y, z, and w.
    */
    constructor(x: boolean, y: boolean, z: boolean, w: boolean)
    
    /**
    * Returns a string representation of the vector.
    */
    toString(): string
    
    /**
    * The alpha (w) boolean component.
    */
    a: boolean
    
    /**
    * The blue (z) boolean component.
    */
    b: boolean
    
    /**
    * The green (y) boolean component.
    */
    g: boolean
    
    /**
    * The red (x) boolean component.
    */
    r: boolean
    
    /**
    * The fourth (w) boolean component.
    */
    w: boolean
    
    /**
    * The first (x) boolean component.
    */
    x: boolean
    
    /**
    * The second (y) boolean component.
    */
    y: boolean
    
    /**
    * The third (z) boolean component.
    */
    z: boolean
    
}


/**
* Not for real use. Contains a fake instance of every class. Helpful for checking the API of a class.

* @deprecated
*/
declare namespace _palette {
    let Base64: Base64
    
    let BaseDescriptor: BaseDescriptor
    
    let console: console
    
    let console_Category: console.Category
    
    /**
    * Namespace that provides access to the components of Lens Studio.
    */
    let Editor: Editor
    
    let Editor_Ai: Editor.Ai
    
    let Editor_Ai_Storage: Editor.Ai.Storage
    
    /**
    * The options for horizontal alignment, for example when using {@link Editor.Components.BaseMeshVisual}
    */
    let Editor_Alignment_Horizontal: Editor.Alignment.Horizontal
    
    /**
    * The options for vertical alignment, for example when using {@link Editor.Components.BaseMeshVisual}
    */
    let Editor_Alignment_Vertical: Editor.Alignment.Vertical
    
    let Editor_AnimationClip: Editor.AnimationClip
    
    let Editor_AnimationLayerBlendMode: Editor.AnimationLayerBlendMode
    
    let Editor_AnimationLayerScaleMode: Editor.AnimationLayerScaleMode
    
    let Editor_Assets: Editor.Assets
    
    let Editor_Assets_AnimationAsset: Editor.Assets.AnimationAsset
    
    /**
    * The aliasing mode of {@link Editor.Assets.RenderTarget}.
    */
    let Editor_Assets_AntialiasingMode: Editor.Assets.AntialiasingMode
    
    let Editor_Assets_AntialiasingQuality: Editor.Assets.AntialiasingQuality
    
    /**
    * An asset in Lens Studio.
    */
    let Editor_Assets_Asset: Editor.Assets.Asset
    
    let Editor_Assets_AssetCompressionSettings: Editor.Assets.AssetCompressionSettings
    
    let Editor_Assets_AudioTrackAsset: Editor.Assets.AudioTrackAsset
    
    /**
    * The blendmode of a {@link Editor.Assets.PassInfo}.
    */
    let Editor_Assets_BlendMode: Editor.Assets.BlendMode
    
    let Editor_Assets_BodyTracking3DAsset: Editor.Assets.BodyTracking3DAsset
    
    /**
    * How a Render Target should be cleared every frame {@link Editor.Assets.RenderTarget}.
    */
    let Editor_Assets_ClearColorOption: Editor.Assets.ClearColorOption
    
    let Editor_Assets_CullMode: Editor.Assets.CullMode
    
    let Editor_Assets_CustomCodeNodeAsset: Editor.Assets.CustomCodeNodeAsset
    
    /**
    * The depth buffer strategy of a {@link Editor.Assets.RenderTarget}.
    */
    let Editor_Assets_DepthBufferStrategy: Editor.Assets.DepthBufferStrategy
    
    /**
    * How a {@link Editor.Assets.PassInfo} should determine its depth compared to others.
    */
    let Editor_Assets_DepthFunction: Editor.Assets.DepthFunction
    
    /**
    * A native asset that provides the texture from the camera feed. Import with {@link Editor.Model.AssetManager#createNativeAsset}.
    */
    let Editor_Assets_DeviceCameraTexture: Editor.Assets.DeviceCameraTexture
    
    let Editor_Assets_DracoCompressionSettings: Editor.Assets.DracoCompressionSettings
    
    /**
    * A native asset that provides a cropped region of the input texture, calculated based on face position. Import with {@link Editor.Model.AssetManager#createNativeAsset}.   Learn more in {@link LensScripting.FaceCropTextureProvider}
    
    */
    let Editor_Assets_FaceCropTexture: Editor.Assets.FaceCropTexture
    
    /**
    * A native asset that provides a 3D mesh of the user's face. Import with {@link Editor.Model.AssetManager#createNativeAsset}.   Learn more in the Face Mesh guide.
    */
    let Editor_Assets_FaceMesh: Editor.Assets.FaceMesh
    
    let Editor_Assets_FileCompressionSettings: Editor.Assets.FileCompressionSettings
    
    /**
    * An asset for 3D meshes.
    */
    let Editor_Assets_FileMesh: Editor.Assets.FileMesh
    
    /**
    * An asset for textures.
    */
    let Editor_Assets_FileTexture: Editor.Assets.FileTexture
    
    let Editor_Assets_FileTexture2DArray: Editor.Assets.FileTexture2DArray
    
    let Editor_Assets_FileTexture3D: Editor.Assets.FileTexture3D
    
    let Editor_Assets_FileTextureCubemap: Editor.Assets.FileTextureCubemap
    
    let Editor_Assets_FileTextureInfo: Editor.Assets.FileTextureInfo
    
    let Editor_Assets_FileTextureInfo3D: Editor.Assets.FileTextureInfo3D
    
    /**
    * How a texture should be sampled. 
    */
    let Editor_Assets_FilteringMode: Editor.Assets.FilteringMode
    
    /**
    * Settings used with {@link Editor.Components.Text} and {@link Editor.Components.Text3D}.
    */
    let Editor_Assets_Font: Editor.Assets.Font
    
    let Editor_Assets_FontCollection: Editor.Assets.FontCollection
    
    let Editor_Assets_FontFamily: Editor.Assets.FontFamily
    
    /**
    * The same entity as in Lens Scripting.  @see {link Editor.Assets.PassInfo}. 
    */
    let Editor_Assets_FrustumCullMode: Editor.Assets.FrustumCullMode
    
    /**
    * An asset that contains Gaussian Splats and is used in conjunction with the GaussianSplattingVisual component. It is part of a system that renders Gaussian Splats.
    */
    let Editor_Assets_GaussianSplattingAsset: Editor.Assets.GaussianSplattingAsset
    
    /**
    * A native asset that provides data for {@link LensScripting.HairVisual}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    */
    let Editor_Assets_HairDataAsset: Editor.Assets.HairDataAsset
    
    /**
    * A native asset that provides data for {@link LensScripting.HandTracking3DAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    */
    let Editor_Assets_HandTracking3DAsset: Editor.Assets.HandTracking3DAsset
    
    /**
    * Used with {Editor.Assets.HandTracking3DAsset}.
    */
    let Editor_Assets_HandTracking3DHandType: Editor.Assets.HandTracking3DHandType
    
    /**
    * A {@link LensScripting.MarkerAsset} for use with {@link Editor.Components.MarkerTrackingComponent}
    */
    let Editor_Assets_ImageMarker: Editor.Assets.ImageMarker
    
    /**
    * A script asset that is written in JavaScript. 
    */
    let Editor_Assets_JavaScriptAsset: Editor.Assets.JavaScriptAsset
    
    let Editor_Assets_JsonAsset: Editor.Assets.JsonAsset
    
    let Editor_Assets_LicensedAudioTrack: Editor.Assets.LicensedAudioTrack
    
    let Editor_Assets_LocationAsset: Editor.Assets.LocationAsset
    
    /**
    * A native asset that provides data for {@link LensScripting.LocationAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    
    */
    let Editor_Assets_LocationMesh: Editor.Assets.LocationMesh
    
    /**
    * Used with {Editor.Assets.Location}.
    */
    let Editor_Assets_LocationType: Editor.Assets.LocationType
    
    let Editor_Assets_MarkdownAsset: Editor.Assets.MarkdownAsset
    
    /**
    * A native asset that provides information for Marker tracking. Learn more at {@link LensScripting.MarkerAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    
    */
    let Editor_Assets_MarkerAsset: Editor.Assets.MarkerAsset
    
    /**
    * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Material}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    
    */
    let Editor_Assets_Material: Editor.Assets.Material
    
    let Editor_Assets_MeshInfo: Editor.Assets.MeshInfo
    
    /**
    * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.MLAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    
    * @beta
    */
    let Editor_Assets_MLAsset: Editor.Assets.MLAsset
    
    let Editor_Assets_MSAAStrategy: Editor.Assets.MSAAStrategy
    
    let Editor_Assets_NativePackageDescriptor: Editor.Assets.NativePackageDescriptor
    
    /**
    * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Object3DAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    
    */
    let Editor_Assets_Object3DAsset: Editor.Assets.Object3DAsset
    
    /**
    * Base class for entities which has object and component relationship such as {@link Editor.Assets.Scene} and {@link Editor.Assets.ObjectPrefab}.
    */
    let Editor_Assets_ObjectOwner: Editor.Assets.ObjectOwner
    
    /**
    * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.ObjectPrefab}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    */
    let Editor_Assets_ObjectPrefab: Editor.Assets.ObjectPrefab
    
    /**
    * A native asset that provides information for object tracking texture. Learn more at {@link LensScripting.ObjectTrackingTextureProvider}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    
    */
    let Editor_Assets_ObjectTrackingTexture: Editor.Assets.ObjectTrackingTexture
    
    /**
    * Used with {@link Editor.Assets.ObjectTrackingTexture}.
    */
    let Editor_Assets_ObjectTrackingTextureType: Editor.Assets.ObjectTrackingTextureType
    
    let Editor_Assets_PackagePolicy: Editor.Assets.PackagePolicy
    
    /**
    * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Pass}. 
    */
    let Editor_Assets_Pass: Editor.Assets.Pass
    
    let Editor_Assets_PassBinding: Editor.Assets.PassBinding
    
    let Editor_Assets_PassBindingType: Editor.Assets.PassBindingType
    
    /**
    * The {@link Editor.Assets.Pass} on a {@link Editor.Assets.Material}.
    */
    let Editor_Assets_PassInfo: Editor.Assets.PassInfo
    
    let Editor_Assets_PassUiData: Editor.Assets.PassUiData
    
    let Editor_Assets_PerformanceCompressionSettings: Editor.Assets.PerformanceCompressionSettings
    
    let Editor_Assets_Physics: Editor.Assets.Physics
    
    let Editor_Assets_Physics_Filter: Editor.Assets.Physics.Filter
    
    let Editor_Assets_Physics_LevelsetColliderAsset: Editor.Assets.Physics.LevelsetColliderAsset
    
    let Editor_Assets_Physics_Matter: Editor.Assets.Physics.Matter
    
    let Editor_Assets_Physics_WorldSettingsAsset: Editor.Assets.Physics.WorldSettingsAsset
    
    /**
    * @beta
    */
    let Editor_Assets_RemoteMLAsset: Editor.Assets.RemoteMLAsset
    
    let Editor_Assets_RemoteReferenceAsset: Editor.Assets.RemoteReferenceAsset
    
    /**
    * A mesh asset to be used with a {@link LensScripting.RenderMeshVisual}
    */
    let Editor_Assets_RenderMesh: Editor.Assets.RenderMesh
    
    /**
    * A native asset that provides the target for a camera to provide its output to. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    */
    let Editor_Assets_RenderTarget: Editor.Assets.RenderTarget
    
    let Editor_Assets_Sampler: Editor.Assets.Sampler
    
    /**
    * The entity which will be coverted into the Lens scene during project export. This scene will contan and own all objects and components in the Lens. This entity can be accessed via the current project’s `model.project.scene`.
    */
    let Editor_Assets_Scene: Editor.Assets.Scene
    
    /**
    * Script Assets are text files that contain the code you write for your Lens. Scripts are written in Javascript or TypeScript. 
    */
    let Editor_Assets_ScriptAsset: Editor.Assets.ScriptAsset
    
    let Editor_Assets_ScriptInputInfo: Editor.Assets.ScriptInputInfo
    
    /**
    * A native asset that provides information for segmentation texture. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    */
    let Editor_Assets_SegmentationTexture: Editor.Assets.SegmentationTexture
    
    /**
    * Built in segmentation textures to be used with {@link Editor.Assets.SegmentationTexture}.
    */
    let Editor_Assets_SegmentationType: Editor.Assets.SegmentationType
    
    let Editor_Assets_SetupScript: Editor.Assets.SetupScript
    
    let Editor_Assets_ShaderType: Editor.Assets.ShaderType
    
    let Editor_Assets_SizeCompressionSettings: Editor.Assets.SizeCompressionSettings
    
    /**
    * A native asset that can be used with {@link LensScripting.MarkerTrackingComponent} Learn more at {@link LensScripting.SnapcodeMarkerProvider}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
    */
    let Editor_Assets_SnapcodeMarker: Editor.Assets.SnapcodeMarker
    
    let Editor_Assets_SubgraphAsset: Editor.Assets.SubgraphAsset
    
    let Editor_Assets_SupabaseProject: Editor.Assets.SupabaseProject
    
    /**
    * A 2D texture asset.
    */
    let Editor_Assets_Texture: Editor.Assets.Texture
    
    let Editor_Assets_TextureCompressionLevel: Editor.Assets.TextureCompressionLevel
    
    let Editor_Assets_TextureParameter: Editor.Assets.TextureParameter
    
    let Editor_Assets_TypeScriptAsset: Editor.Assets.TypeScriptAsset
    
    /**
    * Used to set the version of script assets.
    */
    let Editor_Assets_Version: Editor.Assets.Version
    
    /**
    * Used witih {@link Editor.Assets.FaceMesh}
    */
    let Editor_Assets_VertexAttribute: Editor.Assets.VertexAttribute
    
    /**
    * Options for what value is returned when a fetch falls outside the bounds of a texture.
    
    */
    let Editor_Assets_WrapMode: Editor.Assets.WrapMode
    
    let Editor_Axis: Editor.Axis
    
    let Editor_Buffer: Editor.Buffer
    
    let Editor_Components: Editor.Components
    
    let Editor_Components_AnimationPlayer: Editor.Components.AnimationPlayer
    
    let Editor_Components_AudioComponent: Editor.Components.AudioComponent
    
    /**
    * Settings used with {@link LensScripting.Text}.
    */
    let Editor_Components_BackgroundSettings: Editor.Components.BackgroundSettings
    
    /**
    * Settings used with {@link Editor.Components.Head} to set position on the face.
    */
    let Editor_Components_BarycentricVertex: Editor.Components.BarycentricVertex
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.BaseMeshVisual}.
    */
    let Editor_Components_BaseMeshVisual: Editor.Components.BaseMeshVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.Camera}.
    */
    let Editor_Components_Camera: Editor.Components.Camera
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraAspectPreset: Editor.Components.CameraAspectPreset
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraClearColor: Editor.Components.CameraClearColor
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraClearColor_Mode: Editor.Components.CameraClearColor.Mode
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraClearDepth: Editor.Components.CameraClearDepth
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraClearDepth_Mode: Editor.Components.CameraClearDepth.Mode
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraDepthBufferMode: Editor.Components.CameraDepthBufferMode
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraDeviceProperty: Editor.Components.CameraDeviceProperty
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraOitLayers: Editor.Components.CameraOitLayers
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
    */
    let Editor_Components_CameraType: Editor.Components.CameraType
    
    /**
    * Settings used with {@link LensScripting.Canvas}.
    */
    let Editor_Components_Canvas: Editor.Components.Canvas
    
    let Editor_Components_CapitalizationOverride: Editor.Components.CapitalizationOverride
    
    let Editor_Components_ClipRangeType: Editor.Components.ClipRangeType
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.ClothVisual}.
    */
    let Editor_Components_ClothVisual: Editor.Components.ClothVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
    */
    let Editor_Components_ClothVisual_BendMode: Editor.Components.ClothVisual.BendMode
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
    */
    let Editor_Components_ClothVisual_VertexBinding: Editor.Components.ClothVisual.VertexBinding
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
    */
    let Editor_Components_Component: Editor.Components.Component
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.DeviceTracking}.
    */
    let Editor_Components_DeviceTracking: Editor.Components.DeviceTracking
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.DeviceTracking}.
    */
    let Editor_Components_DeviceTrackingMode: Editor.Components.DeviceTrackingMode
    
    let Editor_Components_DistanceEffectCurveType: Editor.Components.DistanceEffectCurveType
    
    /**
    * Settings used with {@link Editor.Components.Text}.
    */
    let Editor_Components_DropshadowSettings: Editor.Components.DropshadowSettings
    
    /**
    * The same entity as in Lens Scripting.  @see {@link Editor.Components.LightSource}.
    */
    let Editor_Components_EnvmapFromCameraMode: Editor.Components.EnvmapFromCameraMode
    
    /**
    * Settings used with {@link Editor.Components.Text3D}.
    */
    let Editor_Components_ExtrudeDirection: Editor.Components.ExtrudeDirection
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.EyeColorVisual}.
    */
    let Editor_Components_EyeColorVisual: Editor.Components.EyeColorVisual
    
    /**
    * Settings used with {@link Editor.Components.EyeColorVisual}.
    */
    let Editor_Components_EyeToRender: Editor.Components.EyeToRender
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceInsetRegion}. Use with {@link Editor.Components.FaceInsetVisual}.
    */
    let Editor_Components_FaceInsetRegion: Editor.Components.FaceInsetRegion
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceInsetVisual}.
    */
    let Editor_Components_FaceInsetVisual: Editor.Components.FaceInsetVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceMaskVisual}.
    */
    let Editor_Components_FaceMaskVisual: Editor.Components.FaceMaskVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceStretchVisual}.
    */
    let Editor_Components_FaceStretchVisual: Editor.Components.FaceStretchVisual
    
    let Editor_Components_FalloffType: Editor.Components.FalloffType
    
    /**
    * A component used to render GaussianSplattingAsset.
    */
    let Editor_Components_GaussianSplattingVisual: Editor.Components.GaussianSplattingVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.HairVisual}.
    */
    let Editor_Components_HairVisual: Editor.Components.HairVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.Head}.
    */
    let Editor_Components_Head: Editor.Components.Head
    
    /**
    * Settings used with {@link Editor.Components.Head}.
    */
    let Editor_Components_HeadAttachmentPointType: Editor.Components.HeadAttachmentPointType
    
    /**
    * Settings used with {@link Editor.Components.Text} and {@link Editor.Components.Text3D}.
    */
    let Editor_Components_HorizontalOverflow: Editor.Components.HorizontalOverflow
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.Image}.
    */
    let Editor_Components_Image: Editor.Components.Image
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.InteractionComponent}.
    */
    let Editor_Components_InteractionComponent: Editor.Components.InteractionComponent
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.LightSource}.
    */
    let Editor_Components_LightSource: Editor.Components.LightSource
    
    /**
    * Settings used with {@link Editor.Components.LightSource}.
    */
    let Editor_Components_LightType: Editor.Components.LightType
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.LiquifyVisual}.
    */
    let Editor_Components_LiquifyVisual: Editor.Components.LiquifyVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.LocatedAtComponent}.
    */
    let Editor_Components_LocatedAtComponent: Editor.Components.LocatedAtComponent
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.LookAtComponent}.
    */
    let Editor_Components_LookAtComponent: Editor.Components.LookAtComponent
    
    /**
    * Settings used with {@link Editor.Components.LookAtComponent}.
    */
    let Editor_Components_LookAtComponent_AimVectors: Editor.Components.LookAtComponent.AimVectors
    
    /**
    * Settings used with {@link Editor.Components.LookAtComponent}.
    */
    let Editor_Components_LookAtComponent_LookAtMode: Editor.Components.LookAtComponent.LookAtMode
    
    /**
    * Settings used with {@link Editor.Components.LookAtComponent}.
    */
    let Editor_Components_LookAtComponent_WorldUpVector: Editor.Components.LookAtComponent.WorldUpVector
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.ManipulateComponent}.
    */
    let Editor_Components_ManipulateComponent: Editor.Components.ManipulateComponent
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.MarkerTrackingComponent}.
    */
    let Editor_Components_MarkerTrackingComponent: Editor.Components.MarkerTrackingComponent
    
    let Editor_Components_MaskingComponent: Editor.Components.MaskingComponent
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.MaterialMeshVisual}.
    */
    let Editor_Components_MaterialMeshVisual: Editor.Components.MaterialMeshVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.BaseMeshVisual}.
    */
    let Editor_Components_MeshShadowMode: Editor.Components.MeshShadowMode
    
    /**
    * @beta
    */
    let Editor_Components_ObjectTracking: Editor.Components.ObjectTracking
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.ObjectTracking3D}.
    */
    let Editor_Components_ObjectTracking3D: Editor.Components.ObjectTracking3D
    
    let Editor_Components_ObjectTracking3D_TrackingMode: Editor.Components.ObjectTracking3D.TrackingMode
    
    /**
    * Settings used with {@link Editor.Components.ObjectTracking}.
    */
    let Editor_Components_ObjectTrackingType: Editor.Components.ObjectTrackingType
    
    /**
    * Settings used with {@link Editor.Components.Text}.
    */
    let Editor_Components_OutlineSettings: Editor.Components.OutlineSettings
    
    let Editor_Components_Physics: Editor.Components.Physics
    
    let Editor_Components_Physics_BodyComponent: Editor.Components.Physics.BodyComponent
    
    let Editor_Components_Physics_BodySetting: Editor.Components.Physics.BodySetting
    
    let Editor_Components_Physics_Box: Editor.Components.Physics.Box
    
    let Editor_Components_Physics_Capsule: Editor.Components.Physics.Capsule
    
    let Editor_Components_Physics_ColliderComponent: Editor.Components.Physics.ColliderComponent
    
    let Editor_Components_Physics_Cone: Editor.Components.Physics.Cone
    
    let Editor_Components_Physics_Constraint: Editor.Components.Physics.Constraint
    
    let Editor_Components_Physics_ConstraintComponent: Editor.Components.Physics.ConstraintComponent
    
    let Editor_Components_Physics_Cylinder: Editor.Components.Physics.Cylinder
    
    let Editor_Components_Physics_LevelSet: Editor.Components.Physics.LevelSet
    
    let Editor_Components_Physics_Mesh: Editor.Components.Physics.Mesh
    
    let Editor_Components_Physics_Shape: Editor.Components.Physics.Shape
    
    let Editor_Components_Physics_Sphere: Editor.Components.Physics.Sphere
    
    let Editor_Components_Physics_WorldComponent: Editor.Components.Physics.WorldComponent
    
    let Editor_Components_PinToMesh_Orientation: Editor.Components.PinToMesh.Orientation
    
    let Editor_Components_PinToMeshComponent: Editor.Components.PinToMeshComponent
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.PostEffectVisual}.
    */
    let Editor_Components_PostEffectVisual: Editor.Components.PostEffectVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.RectangleSetter}.
    */
    let Editor_Components_RectangleSetter: Editor.Components.RectangleSetter
    
    /**
    * The render layer which the component will be on. 
    */
    let Editor_Components_RenderLayerOwner: Editor.Components.RenderLayerOwner
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.RenderMeshVisual}.
    */
    let Editor_Components_RenderMeshVisual: Editor.Components.RenderMeshVisual
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.RetouchVisual}.
    */
    let Editor_Components_RetouchVisual: Editor.Components.RetouchVisual
    
    /**
    * Used with {@link Editor.Components.DeviceTracking}.  @see {@link LensScripting.RotationOptions}.
    */
    let Editor_Components_RotationOptions: Editor.Components.RotationOptions
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.ScreenRegionComponent}.
    */
    let Editor_Components_ScreenRegionComponent: Editor.Components.ScreenRegionComponent
    
    /**
    * Used with {@link Editor.Components.ScreenRegionComponent}.
    */
    let Editor_Components_ScreenRegionType: Editor.Components.ScreenRegionType
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.ScreenTransform}.
    */
    let Editor_Components_ScreenTransform: Editor.Components.ScreenTransform
    
    /**
    * Used with {@link Editor.Components.ScreenTransformConstraints}.
    */
    let Editor_Components_ScreenTransformConstraints: Editor.Components.ScreenTransformConstraints
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.ScriptComponent}.
    */
    let Editor_Components_ScriptComponent: Editor.Components.ScriptComponent
    
    let Editor_Components_ShadowType: Editor.Components.ShadowType
    
    let Editor_Components_Skin: Editor.Components.Skin
    
    /**
    * Used with {@link Editor.Components.Canvas}.
    */
    let Editor_Components_SortingType: Editor.Components.SortingType
    
    /**
    * Used with {@link Editor.Components.BaseMeshVisual}.
    */
    let Editor_Components_StretchMode: Editor.Components.StretchMode
    
    /**
    * Used with {@link Editor.Components.FaceStretchVisual}.
    */
    let Editor_Components_StretchPoint: Editor.Components.StretchPoint
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.DeviceTracking}.
    */
    let Editor_Components_SurfaceOptions: Editor.Components.SurfaceOptions
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.Text}.
    */
    let Editor_Components_Text: Editor.Components.Text
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.Text3D}.
    */
    let Editor_Components_Text3D: Editor.Components.Text3D
    
    let Editor_Components_TextAdvancedLayout: Editor.Components.TextAdvancedLayout
    
    /**
    * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
    */
    let Editor_Components_TextFill: Editor.Components.TextFill
    
    /**
    * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
    */
    let Editor_Components_TextFillMode: Editor.Components.TextFillMode
    
    let Editor_Components_TextFillTileZone: Editor.Components.TextFillTileZone
    
    /**
    * Settings used with {@link Editor.Components.Canvas}.  @see {@link LensScripting.Canvas}.
    */
    let Editor_Components_UnitType: Editor.Components.UnitType
    
    /**
    * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
    */
    let Editor_Components_VerticalOverflow: Editor.Components.VerticalOverflow
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.Visual}.
    */
    let Editor_Components_Visual: Editor.Components.Visual
    
    let Editor_Compression: Editor.Compression
    
    let Editor_Compression_GZip: Editor.Compression.GZip
    
    /**
    * Module to zip and unzip files. 
    */
    let Editor_Compression_Zip: Editor.Compression.Zip
    
    /**
    * An action in a {@link Editor.IContextActionRegistry}.
    */
    let Editor_ContextAction: Editor.ContextAction
    
    let Editor_Dock: Editor.Dock
    
    /**
    * Manages the states of Lens Studio panels.
    */
    let Editor_Dock_IDockManager: Editor.Dock.IDockManager
    
    let Editor_GaussianSplatting: Editor.GaussianSplatting
    
    let Editor_GaussianSplatting_GsafCreationInfo: Editor.GaussianSplatting.GsafCreationInfo
    
    let Editor_GaussianSplatting_GsafImporterSettings: Editor.GaussianSplatting.GsafImporterSettings
    
    let Editor_Graph: Editor.Graph
    
    /**
    * Component that allows you to check whether Lens Studio is authorized, as well as get authorization. Requires `snap_auth_token` in the `module.json` of your plugin.
    */
    let Editor_IAuthorization: Editor.IAuthorization
    
    /**
    * An icon to be used in the Editor UI.
    */
    let Editor_Icon: Editor.Icon
    
    let Editor_IContext: Editor.IContext
    
    /**
    * A registry of {@link Editor.ContextAction} which will be shown in a contextual menu (i.e. right click).
    */
    let Editor_IContextActionRegistry: Editor.IContextActionRegistry
    
    /**
    * Popup window that allows the user to choose specific objects in the Scene hierarchy, or assets in the Asset Browser.
    */
    let Editor_IEntityPicker: Editor.IEntityPicker
    
    /**
    * Represents ownership of a resource. 
    * If this object is garbage collected, or `dispose()` method is called – the associated resource is freed.
    
    */
    let Editor_IGuard: Editor.IGuard
    
    let Editor_IInterface: Editor.IInterface
    
    let Editor_InterfaceId: Editor.InterfaceId
    
    let Editor_IOverlayManager: Editor.IOverlayManager
    
    let Editor_IPackageActions: Editor.IPackageActions
    
    let Editor_IPackageRegistry: Editor.IPackageRegistry
    
    let Editor_IPlugin: Editor.IPlugin
    
    let Editor_IPluginComponent: Editor.IPluginComponent
    
    /**
    * The model object is a core concept in the plugin development environment. It serves as a central point for accessing key elements such as the scene, project, and {@link Editor.Model.AssetManager}.  The model object encapsulates the data model representing a Lens Studio project. It brings together environment entities and functionalities that are essential for developing plugins. It plays a role analogous to the "Model" component found in Model-View-Controller architectural patterns, containing both data and business logic.  In order to get the model object, which many key objects are stored within, you need the pluginSystem object which is being passed into the constructor of the plugin class, along with the ID of the model component (which can be accessed through the `Editor` namespace) 
    */
    let Editor_Model: Editor.Model
    
    let Editor_Model_AssetContext: Editor.Model.AssetContext
    
    let Editor_Model_AssetContext_Item: Editor.Model.AssetContext.Item
    
    /**
    * A handle for the metadata of an asset. 
    */
    let Editor_Model_AssetImportMetadata: Editor.Model.AssetImportMetadata
    
    let Editor_Model_AssetImportMetadata_PackageIterate: Editor.Model.AssetImportMetadata.PackageIterate
    
    let Editor_Model_AssetManager: Editor.Model.AssetManager
    
    let Editor_Model_AssetMeta: Editor.Model.AssetMeta
    
    let Editor_Model_BaseChangesStream: Editor.Model.BaseChangesStream
    
    let Editor_Model_DeviceType: Editor.Model.DeviceType
    
    /**
    * An object in the scene, or asset in the {@link Editor.Model.AssetManager}
    */
    let Editor_Model_Entity: Editor.Model.Entity
    
    /**
    * @beta
    */
    let Editor_Model_EntityBaseType: Editor.Model.EntityBaseType
    
    let Editor_Model_EntityPrototypeData: Editor.Model.EntityPrototypeData
    
    let Editor_Model_EntityStructure: Editor.Model.EntityStructure
    
    let Editor_Model_ExportOptions: Editor.Model.ExportOptions
    
    let Editor_Model_ExternalPackageDependency: Editor.Model.ExternalPackageDependency
    
    let Editor_Model_FindOption: Editor.Model.FindOption
    
    let Editor_Model_IEntityPrototypeRegistry: Editor.Model.IEntityPrototypeRegistry
    
    /**
    * A registry of various entities. 
    */
    let Editor_Model_IEntityRegistry: Editor.Model.IEntityRegistry
    
    let Editor_Model_IModel: Editor.Model.IModel
    
    /**
    * The result of {@link Editor.Model.AssetManager.importExternalFile} and {@link Editor.Model.AssetManager.importExternalFileAsync}.
    */
    let Editor_Model_ImportResult: Editor.Model.ImportResult
    
    /**
    * @beta
    */
    let Editor_Model_ImportSettings: Editor.Model.ImportSettings
    
    let Editor_Model_InspectableMeta: Editor.Model.InspectableMeta
    
    let Editor_Model_InstantiationParams: Editor.Model.InstantiationParams
    
    /**
    * The layers within a {@link Editor.Model.LayerSet}.
    */
    let Editor_Model_Layer: Editor.Model.Layer
    
    /**
    * The id of a {@link Editor.Model.Layer}.
    */
    let Editor_Model_LayerId: Editor.Model.LayerId
    
    /**
    * The layers of a {@Editor.Assets.Scene}.
    */
    let Editor_Model_Layers: Editor.Model.Layers
    
    /**
    * The same entity as in Lens Scripting.  @see {@link LensScripting.LayerSet}.
    */
    let Editor_Model_LayerSet: Editor.Model.LayerSet
    
    /**
    * The various cameras which will be activated when this project's Lens turns on.
    */
    let Editor_Model_LensActivationCamera: Editor.Model.LensActivationCamera
    
    /**
    * The various contexts in which this Lens can be used.
    */
    let Editor_Model_LensApplicability: Editor.Model.LensApplicability
    
    let Editor_Model_LensClientCompatibility: Editor.Model.LensClientCompatibility
    
    /**
    * The metadata of an entity.
    */
    let Editor_Model_Meta: Editor.Model.Meta
    
    /**
    * Metadata of the current project's Lens.
    */
    let Editor_Model_MetaInfo: Editor.Model.MetaInfo
    
    let Editor_Model_ObjectContext: Editor.Model.ObjectContext
    
    let Editor_Model_PackageOption: Editor.Model.PackageOption
    
    /**
    * An entity which can be turned into a prefab, such as {@link Editor.Model.SceneObject}. 
    */
    let Editor_Model_Prefabable: Editor.Model.Prefabable
    
    let Editor_Model_Project: Editor.Model.Project
    
    let Editor_Model_ProjectSaveMode: Editor.Model.ProjectSaveMode
    
    /**
    * How a file should be imported into the project.
    */
    let Editor_Model_ResultType: Editor.Model.ResultType
    
    /**
    * The same entity as in Lens Scripting.   Can contain one or more {@link Editor.Components.Component}. Additionally, it can have zero or more scene objects which is a child of it.  @see {@link LensScripting.SceneObject}.
    */
    let Editor_Model_SceneObject: Editor.Model.SceneObject
    
    let Editor_Model_SourcePath: Editor.Model.SourcePath
    
    let Editor_Model_SourceRootDirectory: Editor.Model.SourceRootDirectory
    
    let Editor_Model_TransformEntity: Editor.Model.TransformEntity
    
    let Editor_Model_WorldTransformAccessor: Editor.Model.WorldTransformAccessor
    
    let Editor_PackageMetadata: Editor.PackageMetadata
    
    /**
    * A path in the filesystem, or Asset Manager. Useful for things like importing files into Lens Studio through the {@link Editor.Model.AssetManager}. 
    */
    let Editor_Path: Editor.Path
    
    let Editor_PlaybackMode: Editor.PlaybackMode
    
    /**
    * Provides access to the Lens Studio editor plugins, components, and interfaces
    */
    let Editor_PluginSystem: Editor.PluginSystem
    
    let Editor_Point: Editor.Point
    
    /**
    * Used with {@link Editor.Components.ScreenTransform}.
    */
    let Editor_Rect: Editor.Rect
    
    let Editor_ScopedConnection: Editor.ScopedConnection
    
    let Editor_Shape: Editor.Shape
    
    /**
    * Used with {@link Editor.Assets.RenderTarget}.
    */
    let Editor_Size: Editor.Size
    
    /**
    * Used with {@link Editor.Model.SceneObject}.
    */
    let Editor_Transform: Editor.Transform
    
    let Editor_Version: Editor.Version
    
    let IPanelPlugin: IPanelPlugin
    
    let IPluginDescriptor: IPluginDescriptor
    
    /**
    * Module for sending analytics events from a Lens to Snap's analytics pipeline.
    */
    let LensStudio_Analytics: "LensStudio:Analytics"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:App`.
    */
    let LensStudio_App: "LensStudio:App"
    
    /**
    * Plugin module that handles instantiation of assets within the Lens Studio Editor environment.
    */
    let LensStudio_AssetInstantiator: "LensStudio:AssetInstantiator"
    
    /**
    * Plugin that instantiates assets into a scene by placing them as scene objects.
    */
    let LensStudio_AssetInstantiator_AssetInstantiator: "LensStudio:AssetInstantiator.AssetInstantiator"
    
    /**
    * Descriptor for an asset instantiator plugin, providing metadata and a predicate to control which assets can be instantiated.
    */
    let LensStudio_AssetInstantiator_Descriptor: "LensStudio:AssetInstantiator.Descriptor"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:AssetLibrary`.
    */
    let LensStudio_AssetLibrary: "LensStudio:AssetLibrary"
    
    /**
    * A handle for an asset from the Asset Library.
    */
    let LensStudio_AssetLibrary_Asset: "LensStudio:AssetLibrary.Asset"
    
    /**
    * A filter used to narrow down an AssetListRequest.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_AssetFilter: "LensStudio:AssetLibrary.AssetFilter"
    
    /**
    * A request object for finding assets in the Asset Library.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_AssetListRequest: "LensStudio:AssetLibrary.AssetListRequest"
    
    /**
    * A handle returned by the  {@link "LensStudio:AssetLibrary".AssetListService}.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_AssetListResponse: "LensStudio:AssetLibrary.AssetListResponse"
    
    /**
    * A handle to the  {@link "LensStudio:AssetLibrary".AssetListService} which can provide a list of assets based on the passed in parameters.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_AssetListService: "LensStudio:AssetLibrary.AssetListService"
    
    /**
    * The result of a `fetch` call by the {@link "LensStudio:AssetLibrary".AssetListService}, which provides you a list of matching assets in the Asset Library.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_AssetListSuccess: "LensStudio:AssetLibrary.AssetListSuccess"
    
    /**
    * The types of assets that might be provided by the {@link "LensStudio:AssetLibrary"}.
    */
    let LensStudio_AssetLibrary_AssetType: "LensStudio:AssetLibrary.AssetType"
    
    /**
    * Represents metadata about the creator of an Asset Library asset.
    */
    let LensStudio_AssetLibrary_Creator: "LensStudio:AssetLibrary.Creator"
    
    /**
    * The Asset Library environment which assets should be searched within. In most cases `Production` should be used. Used with {@link "LensStudio:AssetLibrary".EnvironmentSetting}.   @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_Environment: "LensStudio:AssetLibrary.Environment"
    
    /**
    * A configuration object that describes what Asset Library environment should be accessed.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_EnvironmentSetting: "LensStudio:AssetLibrary.EnvironmentSetting"
    
    /**
    * Request object for fetching multiple assets by their IDs from the Asset Library.
    */
    let LensStudio_AssetLibrary_GetAssetsByIdsRequest: "LensStudio:AssetLibrary.GetAssetsByIdsRequest"
    
    /**
    * Response object returned from a bulk asset lookup by IDs.
    */
    let LensStudio_AssetLibrary_GetAssetsByIdsResponse: "LensStudio:AssetLibrary.GetAssetsByIdsResponse"
    
    /**
    * Service for fetching assets from the Asset Library by their IDs.
    */
    let LensStudio_AssetLibrary_GetAssetsByIdsService: "LensStudio:AssetLibrary.GetAssetsByIdsService"
    
    /**
    * A handle that provides access to the AssetLibraryListService.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_IAssetLibraryProvider: "LensStudio:AssetLibrary.IAssetLibraryProvider"
    
    /**
    * Provides access to licensed music import functionality for adding music assets to a project.
    */
    let LensStudio_AssetLibrary_LicensedMusic: "LensStudio:AssetLibrary.LicensedMusic"
    
    /**
    * Represents a music asset from the Asset Library, containing metadata and resources for a licensed music track.
    */
    let LensStudio_AssetLibrary_MusicAsset: "LensStudio:AssetLibrary.MusicAsset"
    
    /**
    * Response returned from a music list query, containing either a success result or a service error.
    */
    let LensStudio_AssetLibrary_MusicListResponse: "LensStudio:AssetLibrary.MusicListResponse"
    
    /**
    * Service for fetching lists of music assets from the Asset Library.
    */
    let LensStudio_AssetLibrary_MusicListService: "LensStudio:AssetLibrary.MusicListService"
    
    /**
    * Successful result of a music list query, containing the retrieved music assets.
    */
    let LensStudio_AssetLibrary_MusicListSuccess: "LensStudio:AssetLibrary.MusicListSuccess"
    
    /**
    * Configuration for the page to be accessed in a {@link "LensStudio:AssetLibrary".AssetFilter}.
    */
    let LensStudio_AssetLibrary_Pagination: "LensStudio:AssetLibrary.Pagination"
    
    /**
    * Enum representing the target platform for an asset in the Asset Library.
    */
    let LensStudio_AssetLibrary_Platform: "LensStudio:AssetLibrary.Platform"
    
    /**
    * The actual resources of an {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_Resource: "LensStudio:AssetLibrary.Resource"
    
    /**
    * The callback of an errored `fetch` call by the {@link "LensStudio:AssetLibrary".AssetListService}.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_ServiceError: "LensStudio:AssetLibrary.ServiceError"
    
    /**
    * The Asset Library space which assets should be searched within. In most cases `Public` should be used. Used with {@link "LensStudio:AssetLibrary".EnvironmentSetting}.   @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    let LensStudio_AssetLibrary_Space: "LensStudio:AssetLibrary.Space"
    
    /**
    * Tag or classification used to further categorize an asset within its primary asset type.
    */
    let LensStudio_AssetLibrary_Subcategory: "LensStudio:AssetLibrary.Subcategory"
    
    /**
    * Provides a chat-based assistant plugin integrated into the Lens Studio editor environment.
    */
    let LensStudio_ChatAssistant: "LensStudio:ChatAssistant"
    
    /**
    * Provides the base class, descriptor, registry interface, and result types for creating AI-invokable ChatTool plugins.
    */
    let LensStudio_ChatTool: "LensStudio:ChatTool"
    
    /**
    * Base class for AI-invokable plugin operations in Developer Mode that execute on demand and return a Result.
    */
    let LensStudio_ChatTool_ChatTool: "LensStudio:ChatTool.ChatTool"
    
    /**
    * Descriptor for a ChatTool plugin, holding registration metadata and the JSON schema for its AI-callable parameters.
    */
    let LensStudio_ChatTool_Descriptor: "LensStudio:ChatTool.Descriptor"
    
    /**
    * Registry interface for discovering and executing registered ChatTool plugins.
    */
    let LensStudio_ChatTool_IChatToolRegistry: "LensStudio:ChatTool.IChatToolRegistry"
    
    /**
    * Holds input data passed to a ChatTool when invoked by the AI assistant.
    */
    let LensStudio_ChatTool_Parameters: "LensStudio:ChatTool.Parameters"
    
    /**
    * Return value from a ChatTool execute() call, carrying either output data or an error message.
    */
    let LensStudio_ChatTool_Result: "LensStudio:ChatTool.Result"
    
    /**
    * Provides clipboard integration for reading and writing data within the Editor.
    */
    let LensStudio_Clipboard: "LensStudio:Clipboard"
    
    /**
    * Provides access to the system clipboard within the Lens Studio editor.
    */
    let LensStudio_Clipboard_Clipboard: "LensStudio:Clipboard.Clipboard"
    
    /**
    * Module providing the CoreService base class and Descriptor for registering background plugin services.
    */
    let LensStudio_CoreService: "LensStudio:CoreService"
    
    /**
    * Base class for background plugins that run without a UI, managed by the plugin system via start/stop lifecycle.
    */
    let LensStudio_CoreService_CoreService: "LensStudio:CoreService.CoreService"
    
    /**
    * Descriptor class for CoreService plugins, providing metadata such as ID, name, description, and dependencies required by the plugin system.
    */
    let LensStudio_CoreService_Descriptor: "LensStudio:CoreService.Descriptor"
    
    let LensStudio_Crypto: "LensStudio:Crypto"
    
    let LensStudio_Crypto_subtle: "LensStudio:Crypto.subtle"
    
    /**
    * Plugin module for creating modal or floating dialog windows with custom UI widgets.
    */
    let LensStudio_DialogPlugin: "LensStudio:DialogPlugin"
    
    /**
    * Descriptor class for configuring a DialogPlugin, providing metadata and dependencies for a temporary UI dialog.
    */
    let LensStudio_DialogPlugin_Descriptor: "LensStudio:DialogPlugin.Descriptor"
    
    /**
    * Plugin base class for temporary UI dialogs such as confirmations, settings panels, and wizards.
    */
    let LensStudio_DialogPlugin_DialogPlugin: "LensStudio:DialogPlugin.DialogPlugin"
    
    /**
    * Base module for creating editor plugins with custom entity editing capabilities.
    */
    let LensStudio_EditorPlugin: "LensStudio:EditorPlugin"
    
    /**
    * Metadata descriptor for an EditorPlugin, providing configuration used by the plugin system before instantiation.
    */
    let LensStudio_EditorPlugin_Descriptor: "LensStudio:EditorPlugin.Descriptor"
    
    /**
    * Base class for Lens Studio editor plugins that can create UI widgets and respond to entity edits.
    */
    let LensStudio_EditorPlugin_EditorPlugin: "LensStudio:EditorPlugin.EditorPlugin"
    
    /**
    * Provides functionality to generate and register entity types in the Lens Studio Editor.
    */
    let LensStudio_EntityGenerator: "LensStudio:EntityGenerator"
    
    /**
    * Descriptor for an entity generator plugin, providing metadata such as display order, entity type, and icon.
    */
    let LensStudio_EntityGenerator_Descriptor: "LensStudio:EntityGenerator.Descriptor"
    
    /**
    * Plugin that generates a new Entity in the scene.
    */
    let LensStudio_EntityGenerator_EntityGenerator: "LensStudio:EntityGenerator.EntityGenerator"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:FileSystem` and add `filesystem` in your plugin's `module.json`.
    */
    let LensStudio_FileSystem: "LensStudio:FileSystem"
    
    /**
    * Used with {@link "LensStudio:FileSystem".CopyDirOptions}. 
    */
    let LensStudio_FileSystem_CopyDirOptions: "LensStudio:FileSystem.CopyDirOptions"
    
    /**
    * Used with {@link "LensStudio:FileSystem".CreateDirOptions}.
    */
    let LensStudio_FileSystem_CreateDirOptions: "LensStudio:FileSystem.CreateDirOptions"
    
    /**
    * Used with {@link "LensStudio:FileSystem".ReadDirOptions}.
    */
    let LensStudio_FileSystem_ReadDirOptions: "LensStudio:FileSystem.ReadDirOptions"
    
    /**
    * Helper to create temporary directory.
    */
    let LensStudio_FileSystem_TempDir: "LensStudio:FileSystem.TempDir"
    
    /**
    * Monitors a filesystem path for file changes such as additions, modifications, moves, and removals.
    */
    let LensStudio_FileSystem_Watcher: "LensStudio:FileSystem.Watcher"
    
    /**
    * Plugin module that exposes GUI service configuration and lifecycle management.
    */
    let LensStudio_GuiService: "LensStudio:GuiService"
    
    /**
    * Descriptor for a GuiService plugin, providing metadata and instantiation configuration for GUI-based services.
    */
    let LensStudio_GuiService_Descriptor: "LensStudio:GuiService.Descriptor"
    
    /**
    * Plugin that manages and serves GUI components within the Lens Studio editor.
    */
    let LensStudio_GuiService_GuiService: "LensStudio:GuiService.GuiService"
    
    /**
    * Embeds an interactive, real-time lens preview into an editor panel UI.
    */
    let LensStudio_LensBasedEditorView: "LensStudio:LensBasedEditorView"
    
    /**
    * Provides logging infrastructure for Lens Studio, enabling plugins to collect and monitor user log output.
    */
    let LensStudio_Logger: "LensStudio:Logger"
    
    /**
    * Plugin component interface for collecting and exposing user log data.
    */
    let LensStudio_Logger_IUserLogCollector: "LensStudio:Logger.IUserLogCollector"
    
    let LensStudio_Mcp: "LensStudio:Mcp"
    
    let LensStudio_Mcp_IMcpServer: "LensStudio:Mcp.IMcpServer"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:ModelUI`.
    */
    let LensStudio_ModelUi: "LensStudio:ModelUi"
    
    /**
    * A line edit widget for picking and referencing a scene entity by type.
    */
    let LensStudio_ModelUi_EntityReferencePickerLine: "LensStudio:ModelUi.EntityReferencePickerLine"
    
    /**
    * Collection of multimedia UI widgets including a media player with playback state, position, and mute controls.
    */
    let LensStudio_MultimediaWidgets: "LensStudio:MultimediaWidgets"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:Network` and add `network` in your plugin's `module.json`. 
    */
    let LensStudio_Network: "LensStudio:Network"
    
    /**
    * A TCP Server address. Use with {@link "LensStudio:Network".TcpServer}.
    */
    let LensStudio_Network_Address: "LensStudio:Network.Address"
    
    /**
    * Base class for network servers that accept incoming socket connections.
    */
    let LensStudio_Network_BaseServer: "LensStudio:Network.BaseServer"
    
    /**
    * Base class for network socket connections providing data transport over local or remote addresses.
    */
    let LensStudio_Network_BaseSocket: "LensStudio:Network.BaseSocket"
    
    /**
    * Multipart form data container for HTTP requests.
    
    * @beta
    */
    let LensStudio_Network_FormData: "LensStudio:Network.FormData"
    
    /**
    * Represents an in-progress HTTP response, providing signals for receiving streamed data, completion, and errors.
    
    * @beta
    */
    let LensStudio_Network_HttpReply: "LensStudio:Network.HttpReply"
    
    /**
    * A HTTP Request configuration. Use with {@link "LensStudio:Network".performHttpRequestWithReply}.
    
    * @beta
    */
    let LensStudio_Network_HttpRequest: "LensStudio:Network.HttpRequest"
    
    /**
    * The method in which to send the HTTP request. Use with {@link "LensStudio:Network".HttpRequest}.
    
    * @beta
    */
    let LensStudio_Network_HttpRequest_Method: "LensStudio:Network.HttpRequest.Method"
    
    /**
    * An HTTP response, received from the callback to performing a request, such as through: {@link "LensStudio:Network".performHttpRequestWithReply}, or {@link "LensStudio:RemoteServiceModule".performApiRequest}.
    
    * @beta
    */
    let LensStudio_Network_HttpResponse: "LensStudio:Network.HttpResponse"
    
    /**
    * A class to accept TCP connetions. Useful for receiving streaming data. It's also able to send back responses.
    */
    let LensStudio_Network_TcpServer: "LensStudio:Network.TcpServer"
    
    /**
    * TCP socket for use with {@link "LensStudio:Network".TcpSocket}. 
    */
    let LensStudio_Network_TcpSocket: "LensStudio:Network.TcpSocket"
    
    /**
    * Provides the base classes and registration utilities for building overlay plugins in Lens Studio.
    */
    let LensStudio_OverlayPlugin: "LensStudio:OverlayPlugin"
    
    /**
    * Descriptor class for configuring and registering an overlay plugin, including asset instantiation eligibility.
    */
    let LensStudio_OverlayPlugin_Descriptor: "LensStudio:OverlayPlugin.Descriptor"
    
    /**
    * Base class for plugins that render overlay UI on top of the editor viewport.
    */
    let LensStudio_OverlayPlugin_OverlayPlugin: "LensStudio:OverlayPlugin.OverlayPlugin"
    
    /**
    * Base module for building persistent UI panel plugins that render widgets within the Lens Studio editor.
    */
    let LensStudio_PanelPlugin: "LensStudio:PanelPlugin"
    
    /**
    * Metadata descriptor for a PanelPlugin, providing id, name, description, and dependency configuration used by the plugin system before instantiation.
    */
    let LensStudio_PanelPlugin_Descriptor: "LensStudio:PanelPlugin.Descriptor"
    
    /**
    * Descriptor for a panel plugin that behaves as a dockable editor window within Lens Studio.
    */
    let LensStudio_PanelPlugin_EditorDescriptor: "LensStudio:PanelPlugin.EditorDescriptor"
    
    /**
    * Descriptor object used to configure and register a panel plugin with Lens Studio.
    */
    let LensStudio_PanelPlugin_PanelDescriptor: "LensStudio:PanelPlugin.PanelDescriptor"
    
    /**
    * Base class for persistent panel plugins that render UI within a dockable Lens Studio panel.
    */
    let LensStudio_PanelPlugin_PanelPlugin: "LensStudio:PanelPlugin.PanelPlugin"
    
    /**
    * Plugin verification module exposing Descriptor and PluginVerifier base classes for implementing automated plugin tests.
    */
    let LensStudio_PluginVerifier: "LensStudio:PluginVerifier"
    
    /**
    * Metadata descriptor for a PluginVerifier, identifying which plugins it targets and how to verify them.
    */
    let LensStudio_PluginVerifier_Descriptor: "LensStudio:PluginVerifier.Descriptor"
    
    /**
    * Plugin class for verifying and validating other Lens Studio plugins through automated testing.
    */
    let LensStudio_PluginVerifier_PluginVerifier: "LensStudio:PluginVerifier.PluginVerifier"
    
    /**
    * Base class for editor presets that create pre-configured scene objects, assets, or components via the Add menu.
    */
    let LensStudio_Preset: "LensStudio:Preset"
    
    /**
    * Descriptor class for a Preset plugin, providing metadata and configuration used by the plugin system at registration time.
    */
    let LensStudio_Preset_Descriptor: "LensStudio:Preset.Descriptor"
    
    /**
    * Base class for plugins that create pre-configured scene objects, assets, or components via the Add menu.
    */
    let LensStudio_Preset_Preset: "LensStudio:Preset.Preset"
    
    /**
    * Provides access to preview streams, camera views, and media resources within the Lens Studio environment.
    */
    let LensStudio_Preview: "LensStudio:Preview"
    
    /**
    * Enum-like class defining stream type constants for preview sessions.
    */
    let LensStudio_Preview_StreamType: "LensStudio:Preview.StreamType"
    
    /**
    * Provides the base infrastructure for creating project-level settings panels with configurable sections and titles.
    */
    let LensStudio_ProjectSettingsPlugin: "LensStudio:ProjectSettingsPlugin"
    
    /**
    * Descriptor for a project settings plugin, defining its icon, section, and title metadata.
    */
    let LensStudio_ProjectSettingsPlugin_Descriptor: "LensStudio:ProjectSettingsPlugin.Descriptor"
    
    /**
    * ProjectSettingsPlugin allows creating custom project settings panels in Lens Studio. Plugins implement this interface to add domain-specific settings (e.g., Mobile Settings, Preview Settings, Spectacles Settings) with custom UI, issue reporting, and lifecycle management.
    */
    let LensStudio_ProjectSettingsPlugin_ProjectSettingsPlugin: "LensStudio:ProjectSettingsPlugin.ProjectSettingsPlugin"
    
    /**
    * Plugin component for pushing lens effects and configurations to physical devices.
    */
    let LensStudio_PushToDevice: "LensStudio:PushToDevice"
    
    /**
    * Class for interacting with Snap's RemoteServiceModule. Unlike {@link "LensStudio:Network".performHttpRequestWithReply}, the API requests done here are to specific endpoints that have been registered with Snap.
    */
    let LensStudio_RemoteServiceModule: "LensStudio:RemoteServiceModule"
    
    /**
    * Configuration for request through {@link "LensStudio:RemoteServiceModule".performApiRequest}
    */
    let LensStudio_RemoteServiceModule_RemoteApiRequest: "LensStudio:RemoteServiceModule.RemoteApiRequest"
    
    /**
    * Represents the response from a remote API call with status, body, and linked resources.
    */
    let LensStudio_RemoteServiceModule_RemoteApiResponse: "LensStudio:RemoteServiceModule.RemoteApiResponse"
    
    /**
    * Represents a linked resource with a URL reference.
    */
    let LensStudio_RemoteServiceModule_RemoteApiResponse_LinkedResource: "LensStudio:RemoteServiceModule.RemoteApiResponse.LinkedResource"
    
    /**
    * Module for script editing capabilities in Lens Studio.
    */
    let LensStudio_ScriptEditor: "LensStudio:ScriptEditor"
    
    /**
    * Provides definitions and paths for script editor functionality.
    */
    let LensStudio_ScriptEditor_Definitions: "LensStudio:ScriptEditor.Definitions"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:Serialization`.
    */
    let LensStudio_Serialization: "LensStudio:Serialization"
    
    /**
    * Interface for reading serialized data.
    
    * @beta
    */
    let LensStudio_Serialization_IReader: "LensStudio:Serialization.IReader"
    
    /**
    * Writes serialized data to a string representation.
    
    * @beta
    */
    let LensStudio_Serialization_IWriter: "LensStudio:Serialization.IWriter"
    
    /**
    * Class which allows you to serialize and deserialize data from YAML. Useful for modifying layout with {@link Editor.Dock.IDockManager}.
    */
    let LensStudio_Serialization_Yaml: "LensStudio:Serialization.Yaml"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:Shell`.
    */
    let LensStudio_Shell: "LensStudio:Shell"
    
    /**
    * Toolkit for packaging and distributing Lens Studio projects.
    */
    let LensStudio_Spk: "LensStudio:Spk"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:Subprocess` and add `subprocess` in your plugin's `module.json`.
    */
    let LensStudio_Subprocess: "LensStudio:Subprocess"
    
    /**
    * The exit status of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
    let LensStudio_Subprocess_ExitStatus: "LensStudio:Subprocess.ExitStatus"
    
    /**
    * The process error of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
    let LensStudio_Subprocess_ProcessError: "LensStudio:Subprocess.ProcessError"
    
    /**
    * The process state of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
    let LensStudio_Subprocess_ProcessState: "LensStudio:Subprocess.ProcessState"
    
    /**
    * The options of {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}.  `env`, can be specified as a `{PATH: myPath, PWD: myPwd}` or a JS object. The PATH and PWD fields will override the default value in your environment has when the subprocess is spawned.   You can access the default environment variables from {@link "LensStudio:App"},  where its a constant value that you can retrieve just like `.version`, using `.env`.
    */
    let LensStudio_Subprocess_SpawnOptions: "LensStudio:Subprocess.SpawnOptions"
    
    /**
    * The result of {@link "LensStudio:Subprocess".spawnSync}. 
    */
    let LensStudio_Subprocess_SpawnSyncResult: "LensStudio:Subprocess.SpawnSyncResult"
    
    /**
    * Class which allows you to trigger a subproccess outside of Lens Studio (e.g. a command line command).
    */
    let LensStudio_Subprocess_Subprocess: "LensStudio:Subprocess.Subprocess"
    
    /**
    * Stream for writing data to a subprocess.
    */
    let LensStudio_Subprocess_Writable: "LensStudio:Subprocess.Writable"
    
    /**
    * Provides system information for Lens Studio.
    */
    let LensStudio_SysInfo: "LensStudio:SysInfo"
    
    let LensStudio_TypeScript: "LensStudio:TypeScript"
    
    let LensStudio_TypeScript_ITypeScriptCompilationApi: "LensStudio:TypeScript.ITypeScriptCompilationApi"
    
    let LensStudio_TypeScript_TypeScriptCompilationResult: "LensStudio:TypeScript.TypeScriptCompilationResult"
    
    /**
    * Before using anything in this namespace, make sure to import `LensStudio:Ui`.
    */
    let LensStudio_Ui: "LensStudio:Ui"
    
    /**
    * Base class for button widgets with icon and state support.
    */
    let LensStudio_Ui_AbstractButton: "LensStudio:Ui.AbstractButton"
    
    /**
    * Base class for menu widgets with actions and submenus.
    */
    let LensStudio_Ui_AbstractMenu: "LensStudio:Ui.AbstractMenu"
    
    /**
    * A UI action that can be triggered or toggled within a widget.
    */
    let LensStudio_Ui_Action: "LensStudio:Ui.Action"
    
    /**
    * Horizontal and vertical alignment options for UI components.
    */
    let LensStudio_Ui_Alignment: "LensStudio:Ui.Alignment"
    
    /**
    * Enum specifying arrow positions for UI elements.
    */
    let LensStudio_Ui_ArrowPosition: "LensStudio:Ui.ArrowPosition"
    
    /**
    * Specifies how to handle aspect ratio constraints in UI.
    */
    let LensStudio_Ui_AspectRatioMode: "LensStudio:Ui.AspectRatioMode"
    
    /**
    * Enum specifying background color role.
    */
    let LensStudio_Ui_BackgroundRole: "LensStudio:Ui.BackgroundRole"
    
    /**
    * Layout manager arranging widgets in a row or column.
    */
    let LensStudio_Ui_BoxLayout: "LensStudio:Ui.BoxLayout"
    
    /**
    * Widget displaying a callout or tooltip with optional arrow.
    */
    let LensStudio_Ui_CalloutFrame: "LensStudio:Ui.CalloutFrame"
    
    /**
    * Widget for toggling a boolean state.
    */
    let LensStudio_Ui_CheckBox: "LensStudio:Ui.CheckBox"
    
    /**
    * Enum representing checkbox state.
    */
    let LensStudio_Ui_CheckState: "LensStudio:Ui.CheckState"
    
    /**
    * Enum controlling layout clearing behavior.
    */
    let LensStudio_Ui_ClearLayoutBehavior: "LensStudio:Ui.ClearLayoutBehavior"
    
    /**
    * Label widget that responds to mouse clicks.
    */
    let LensStudio_Ui_ClickableLabel: "LensStudio:Ui.ClickableLabel"
    
    /**
    * Event triggered when a window or dialog closes.
    */
    let LensStudio_Ui_CloseEvent: "LensStudio:Ui.CloseEvent"
    
    /**
    * Widget panel that can be expanded or collapsed.
    */
    let LensStudio_Ui_CollapsiblePanel: "LensStudio:Ui.CollapsiblePanel"
    
    /**
    * Represents an RGBA color value.
    */
    let LensStudio_Ui_Color: "LensStudio:Ui.Color"
    
    /**
    * Button for selecting or displaying a color.
    */
    let LensStudio_Ui_ColorButton: "LensStudio:Ui.ColorButton"
    
    /**
    * Enum specifying color group role.
    */
    let LensStudio_Ui_ColorGroup: "LensStudio:Ui.ColorGroup"
    
    /**
    * Enum specifying color role for styling.
    */
    let LensStudio_Ui_ColorRole: "LensStudio:Ui.ColorRole"
    
    /**
    * Dropdown widget for selecting from a list of options.
    */
    let LensStudio_Ui_ComboBox: "LensStudio:Ui.ComboBox"
    
    /**
    * Enum controlling context menu behavior.
    */
    let LensStudio_Ui_ContextMenuPolicy: "LensStudio:Ui.ContextMenuPolicy"
    
    /**
    * Enum specifying mouse cursor shape.
    */
    let LensStudio_Ui_CursorShape: "LensStudio:Ui.CursorShape"
    
    /**
    * Modal or modeless dialog window.
    */
    let LensStudio_Ui_Dialog: "LensStudio:Ui.Dialog"
    
    /**
    * Enum representing the result codes for dialog operations.
    */
    let LensStudio_Ui_Dialog_Code: "LensStudio:Ui.Dialog.Code"
    
    /**
    * Options for file/directory dialogs.
    */
    let LensStudio_Ui_Dialogs_Options: "LensStudio:Ui.Dialogs.Options"
    
    /**
    * Parameters for file dialog configuration.
    */
    let LensStudio_Ui_Dialogs_Params: "LensStudio:Ui.Dialogs.Params"
    
    /**
    * Enum specifying layout direction.
    */
    let LensStudio_Ui_Direction: "LensStudio:Ui.Direction"
    
    /**
    * Enum representing dock widget state.
    */
    let LensStudio_Ui_DockState: "LensStudio:Ui.DockState"
    
    /**
    * Widget for entering floating-point numbers.
    */
    let LensStudio_Ui_DoubleSpinBox: "LensStudio:Ui.DoubleSpinBox"
    
    /**
    * Manages text and code editors.
    */
    let LensStudio_Ui_EditorsManager: "LensStudio:Ui.EditorsManager"
    
    let LensStudio_Ui_Event: "LensStudio:Ui.Event"
    
    /**
    * Enum specifying font role for styling.
    */
    let LensStudio_Ui_FontRole: "LensStudio:Ui.FontRole"
    
    /**
    * Enum specifying foreground color role.
    */
    let LensStudio_Ui_ForegroundRole: "LensStudio:Ui.ForegroundRole"
    
    /**
    * Layout manager arranging widgets in a grid.
    */
    let LensStudio_Ui_GridLayout: "LensStudio:Ui.GridLayout"
    
    /**
    * Main interface for accessing UI dialogs and workspace.
    */
    let LensStudio_Ui_Gui: "LensStudio:Ui.Gui"
    
    /**
    * Enum specifying icon display mode.
    */
    let LensStudio_Ui_IconMode: "LensStudio:Ui.IconMode"
    
    /**
    * Interface for file and message dialogs.
    */
    let LensStudio_Ui_IDialogs: "LensStudio:Ui.IDialogs"
    
    /**
    * Interface for text editor management.
    */
    let LensStudio_Ui_IEditorsManager: "LensStudio:Ui.IEditorsManager"
    
    /**
    * Interface for GUI functionality.
    */
    let LensStudio_Ui_IGui: "LensStudio:Ui.IGui"
    
    /**
    * Widget displaying an image.
    */
    let LensStudio_Ui_ImageView: "LensStudio:Ui.ImageView"
    
    /**
    * Interface for workspace management.
    */
    let LensStudio_Ui_IWorkspaceManager: "LensStudio:Ui.IWorkspaceManager"
    
    let LensStudio_Ui_Key: "LensStudio:Ui.Key"
    
    /**
    * Enum representing keyboard modifier keys.
    */
    let LensStudio_Ui_KeyboardModifier: "LensStudio:Ui.KeyboardModifier"
    
    let LensStudio_Ui_KeyEvent: "LensStudio:Ui.KeyEvent"
    
    /**
    * Widget displaying read-only text.
    */
    let LensStudio_Ui_Label: "LensStudio:Ui.Label"
    
    /**
    * Base class for layout managers.
    */
    let LensStudio_Ui_Layout: "LensStudio:Ui.Layout"
    
    /**
    * Widget for single-line text input.
    */
    let LensStudio_Ui_LineEdit: "LensStudio:Ui.LineEdit"
    
    /**
    * Widget displaying a scrollable list of items.
    */
    let LensStudio_Ui_ListWidget: "LensStudio:Ui.ListWidget"
    
    /**
    * Individual item in a ListWidget.
    */
    let LensStudio_Ui_ListWidgetItem: "LensStudio:Ui.ListWidgetItem"
    
    /**
    * Popup menu widget.
    */
    let LensStudio_Ui_Menu: "LensStudio:Ui.Menu"
    
    /**
    * Dialog for displaying messages or confirmations.
    */
    let LensStudio_Ui_MessageBox: "LensStudio:Ui.MessageBox"
    
    /**
    * Icon enumeration for message box dialogs.
    */
    let LensStudio_Ui_MessageBox_Icon: "LensStudio:Ui.MessageBox.Icon"
    
    /**
    * Standard message box button types.
    */
    let LensStudio_Ui_MessageBox_StandardButton: "LensStudio:Ui.MessageBox.StandardButton"
    
    /**
    * Predefined button combinations for standard message box dialogs.
    
    * @beta
    */
    let LensStudio_Ui_MessageBox_StandardButtons: "LensStudio:Ui.MessageBox.StandardButtons"
    
    /**
    * Enum representing mouse button identifiers.
    */
    let LensStudio_Ui_MouseButton: "LensStudio:Ui.MouseButton"
    
    /**
    * Event object containing mouse interaction data.
    */
    let LensStudio_Ui_MouseEvent: "LensStudio:Ui.MouseEvent"
    
    /**
    * Represents an animated movie or video file.
    */
    let LensStudio_Ui_Movie: "LensStudio:Ui.Movie"
    
    let LensStudio_Ui_Movie_CacheMode: "LensStudio:Ui.Movie.CacheMode"
    
    /**
    * Widget for playing movies or animations.
    */
    let LensStudio_Ui_MovieView: "LensStudio:Ui.MovieView"
    
    /**
    * Enum specifying horizontal or vertical orientation.
    */
    let LensStudio_Ui_Orientation: "LensStudio:Ui.Orientation"
    
    /**
    * Toolbar that collapses into a menu when space is limited.
    */
    let LensStudio_Ui_OverflowToolBar: "LensStudio:Ui.OverflowToolBar"
    
    /**
    * Represents an image in memory.
    */
    let LensStudio_Ui_Pixmap: "LensStudio:Ui.Pixmap"
    
    /**
    * Popup widget with an arrow pointing to a reference position.
    */
    let LensStudio_Ui_PopupWithArrow: "LensStudio:Ui.PopupWithArrow"
    
    /**
    * Widget displaying a progress bar.
    */
    let LensStudio_Ui_ProgressBar: "LensStudio:Ui.ProgressBar"
    
    /**
    * Widget showing progress without a specific percentage.
    */
    let LensStudio_Ui_ProgressIndicator: "LensStudio:Ui.ProgressIndicator"
    
    /**
    * Represents a project settings validation error with a human-readable description.
    */
    let LensStudio_Ui_ProjectSettings_Error: "LensStudio:Ui.ProjectSettings.Error"
    
    /**
    * Represents a project settings validation result with no issues.
    */
    let LensStudio_Ui_ProjectSettings_NoIssue: "LensStudio:Ui.ProjectSettings.NoIssue"
    
    /**
    * Represents a warning associated with a project setting, holding a descriptive message.
    */
    let LensStudio_Ui_ProjectSettings_Warning: "LensStudio:Ui.ProjectSettings.Warning"
    
    /**
    * Clickable button widget.
    */
    let LensStudio_Ui_PushButton: "LensStudio:Ui.PushButton"
    
    /**
    * Widget for selecting one option from a group.
    */
    let LensStudio_Ui_RadioButton: "LensStudio:Ui.RadioButton"
    
    /**
    * Manager for radio button groups.
    */
    let LensStudio_Ui_RadioButtonGroup: "LensStudio:Ui.RadioButtonGroup"
    
    /**
    * Represents a rectangular area with x, y, width, height.
    */
    let LensStudio_Ui_Rect: "LensStudio:Ui.Rect"
    
    /**
    * Menu with search/filter functionality.
    */
    let LensStudio_Ui_SearchableMenu: "LensStudio:Ui.SearchableMenu"
    
    /**
    * LineEdit with search capabilities.
    */
    let LensStudio_Ui_SearchLineEdit: "LensStudio:Ui.SearchLineEdit"
    
    /**
    * Collapsible section widget for grouping content.
    */
    let LensStudio_Ui_Section: "LensStudio:Ui.Section"
    
    /**
    * Visual separator widget.
    */
    let LensStudio_Ui_Separator: "LensStudio:Ui.Separator"
    
    /**
    * Enum specifying shadow effect style.
    */
    let LensStudio_Ui_Shadow: "LensStudio:Ui.Shadow"
    
    let LensStudio_Ui_Shortcut: "LensStudio:Ui.Shortcut"
    
    let LensStudio_Ui_ShortcutContext: "LensStudio:Ui.ShortcutContext"
    
    /**
    * Represents width and height dimensions.
    */
    let LensStudio_Ui_Size: "LensStudio:Ui.Size"
    
    /**
    * Enum defining how a widget resizes along a single axis.
    */
    let LensStudio_Ui_SizePolicy_Policy: "LensStudio:Ui.SizePolicy.Policy"
    
    /**
    * Collection of size values.
    */
    let LensStudio_Ui_Sizes: "LensStudio:Ui.Sizes"
    
    /**
    * Widget for selecting a value within a range.
    */
    let LensStudio_Ui_Slider: "LensStudio:Ui.Slider"
    
    /**
    * Widget for entering integer numbers.
    */
    let LensStudio_Ui_SpinBox: "LensStudio:Ui.SpinBox"
    
    /**
    * Widget dividing a container into resizable sections.
    */
    let LensStudio_Ui_Splitter: "LensStudio:Ui.Splitter"
    
    /**
    * Layout manager displaying one widget at a time.
    */
    let LensStudio_Ui_StackedLayout: "LensStudio:Ui.StackedLayout"
    
    /**
    * Container displaying one child widget at a time.
    */
    let LensStudio_Ui_StackedWidget: "LensStudio:Ui.StackedWidget"
    
    /**
    * Enum specifying stacking order mode.
    */
    let LensStudio_Ui_StackingMode: "LensStudio:Ui.StackingMode"
    
    /**
    * Widget showing status with color or icon.
    */
    let LensStudio_Ui_StatusIndicator: "LensStudio:Ui.StatusIndicator"
    
    /**
    * Widget displaying tabs for switching between panels.
    */
    let LensStudio_Ui_TabBar: "LensStudio:Ui.TabBar"
    
    /**
    * Represents cursor position in text.
    */
    let LensStudio_Ui_TextCursor: "LensStudio:Ui.TextCursor"
    
    /**
    * Enum controlling whether cursor movement also moves the anchor or keeps it in place, defining selection behavior.
    */
    let LensStudio_Ui_TextCursor_MoveMode: "LensStudio:Ui.TextCursor.MoveMode"
    
    /**
    * Enum of cursor movement operations for navigating within a text document.
    */
    let LensStudio_Ui_TextCursor_MoveOperation: "LensStudio:Ui.TextCursor.MoveOperation"
    
    /**
    * Widget for multi-line text input.
    */
    let LensStudio_Ui_TextEdit: "LensStudio:Ui.TextEdit"
    
    /**
    * Configuration for toolbar appearance and behavior.
    */
    let LensStudio_Ui_ToolbarConfig: "LensStudio:Ui.ToolbarConfig"
    
    /**
    * Enum specifying toolbar position.
    */
    let LensStudio_Ui_ToolbarPosition: "LensStudio:Ui.ToolbarPosition"
    
    /**
    * Settings for toolbar configuration.
    */
    let LensStudio_Ui_ToolbarSettings: "LensStudio:Ui.ToolbarSettings"
    
    /**
    * Button suitable for toolbar placement.
    */
    let LensStudio_Ui_ToolButton: "LensStudio:Ui.ToolButton"
    
    /**
    * Enum specifying image transformation mode.
    */
    let LensStudio_Ui_TransformationMode: "LensStudio:Ui.TransformationMode"
    
    /**
    * Container with vertical scrolling.
    */
    let LensStudio_Ui_VerticalScrollArea: "LensStudio:Ui.VerticalScrollArea"
    
    /**
    * Widget for displaying video content.
    */
    let LensStudio_Ui_VideoView: "LensStudio:Ui.VideoView"
    
    /**
    * Embedded Chromium browser widget for HTML/CSS/JavaScript UI.
    */
    let LensStudio_Ui_WebEngineView: "LensStudio:Ui.WebEngineView"
    
    /**
    * Base class for all UI widgets.
    */
    let LensStudio_Ui_Widget: "LensStudio:Ui.Widget"
    
    /**
    * Descriptor for a workspace, defining its identity and configuration within the Workspaces system.
    
    * @beta
    */
    let LensStudio_Ui_Workspaces_Descriptor: "LensStudio:Ui.Workspaces.Descriptor"
    
    /**
    * Holds metadata for a workspace, including its display name and icon.
    
    * @beta
    */
    let LensStudio_Ui_Workspaces_Metadata: "LensStudio:Ui.Workspaces.Metadata"
    
    /**
    * Handle referencing a saved workspace layout preset.
    
    * @beta
    */
    let LensStudio_Ui_Workspaces_PresetHandle: "LensStudio:Ui.Workspaces.PresetHandle"
    
    /**
    * Represents a workspace layout containing a dock manager and associated metadata.
    
    * @beta
    */
    let LensStudio_Ui_Workspaces_Workspace: "LensStudio:Ui.Workspaces.Workspace"
    
    let LensStudio_UiTest: "LensStudio:UiTest"
    
    let LensStudio_UiTest_EventType: "LensStudio:UiTest.EventType"
    
    /**
    * Plugin module that enables custom URI scheme handling within Lens Studio.
    */
    let LensStudio_UriHandlerPlugin: "LensStudio:UriHandlerPlugin"
    
    /**
    * Descriptor for a URI handler plugin, providing metadata and instantiation logic.
    */
    let LensStudio_UriHandlerPlugin_Descriptor: "LensStudio:UriHandlerPlugin.Descriptor"
    
    /**
    * Plugin base class for handling URI requests within the Editor plugin system.
    */
    let LensStudio_UriHandlerPlugin_UriHandlerPlugin: "LensStudio:UriHandlerPlugin.UriHandlerPlugin"
    
    /**
    * Namespace providing UUID creation and manipulation utilities for identifying assets, components, and packages.
    */
    let LensStudio_Uuid: "LensStudio:Uuid"
    
    /**
    * Represents a universally unique identifier used to reference assets and components.
    */
    let LensStudio_Uuid_Uuid: "LensStudio:Uuid.Uuid"
    
    /**
    * WebSocket module exposing client and server types for real-time bidirectional communication over the WebSocket protocol.
    */
    let LensStudio_WebSocket: "LensStudio:WebSocket"
    
    /**
    * WebSocket client for establishing and communicating over WebSocket connections in Lens Studio plugins.
    */
    let LensStudio_WebSocket_WebSocket: "LensStudio:WebSocket.WebSocket"
    
    /**
    * WebSocket server that listens on a local address and accepts incoming client connections from web content or other plugins.
    */
    let LensStudio_WebSocket_WebSocketServer: "LensStudio:WebSocket.WebSocketServer"
    
    /**
    * 2x2 column-major floating-point matrix.
    */
    let mat2: mat2
    
    /**
    * A 3x3 matrix type supporting common linear algebra operations.
    */
    let mat3: mat3
    
    /**
    * 4x4 matrix used for 3D transformations including rotation, scale, translation, and projection.
    */
    let mat4: mat4
    
    /**
    * Utility class providing common math operations and constants.
    */
    let MathUtils: MathUtils
    
    /**
    * Quaternion type for representing rotations in 3D space.
    */
    let quat: quat
    
    /**
    * Base class for all script-accessible Lens Studio objects.
    */
    let ScriptObject: ScriptObject
    
    /**
    * Provides encrypted storage for each plugin module's sensitive data, like access tokens. It uses Keychain on macOS and Credentials Manager on Windows. The data can be stored and retrieved as string-to-string key value pairs via a global secureLocalStorage object. Data for each plugin module (module.json) is kept separate from all others. There is a 2KB limit on the string size because this is meant for small pieces of secure info rather than a generic container.
    */
    let SecureLocalStorage: SecureLocalStorage
    
    /**
    * Namespace providing task management utilities for tracking and coordinating asynchronous operations.
    */
    let Task: Task
    
    /**
    * Interface for a plugin component that manages pending tasks and exposes a promise that resolves when all tasks complete.
    */
    let Task_ITaskManager: Task.ITaskManager
    
    /**
    * Concrete implementation of ITaskManager that tracks and coordinates task completion within the editor.
    */
    let Task_TaskManager: Task.TaskManager
    
    /**
    * Decodes binary data from a Uint8Array into a string using a specified character encoding.
    */
    let TextDecoder: TextDecoder
    
    /**
    * Encodes strings into UTF-8 byte arrays.
    */
    let TextEncoder: TextEncoder
    
    /**
    * A handle for a timer. You can create a timeout using {@link setTimeout}.
    */
    let Timeout: Timeout
    
    /**
    * 2D vector with x and y components, used for 2D positions, directions, and math operations.
    */
    let vec2: vec2
    
    /**
    * 3-component floating-point vector used for 3D positions, directions, and RGB color values.
    */
    let vec3: vec3
    
    /**
    * Four-component float vector used for XYZW coordinates and RGBA color values.
    */
    let vec4: vec4
    
    /**
    * A 4-component boolean vector with x/y/z/w and r/g/b/a accessors.
    */
    let vec4b: vec4b
    
}

/**
 * The following interfaces are returned by various APIs
 * and allows you to bind some callback when `connect` occurs.
*/

/**
 * An interface that allows you to bind a callback on `connect`.
 */
interface signal0<R> {
    connect(callback: () => R) : Editor.ScopedConnection
}

/**
 * An interface that allows you to bind a callback on `connect`.
 */
interface signal1<T0, R> {
    connect(callback: (arg0:T0) => R) : Editor.ScopedConnection
}

/**
 * An interface that allows you to bind a callback on `connect`.
 */
interface signal2<T0,T1, R> {
    connect(callback: (arg0:T0, arg1:T1) => R) : Editor.ScopedConnection
}

/**
 * An interface that allows you to bind a callback on `connect`.
 */
interface signal3<T0,T1,T2, R> {
    connect(callback: (arg0:T0, arg1:T1, arg2:T2) => R) : Editor.ScopedConnection
}

/**
 * An interface that allows you to bind a callback on `connect`.
 */
interface signal4<T0,T1,T2,T3, R> {
    connect(callback: (arg0:T0, arg1:T1, arg2:T2, arg3:T3) => R) : Editor.ScopedConnection
}

/**
 * An interface that allows you to bind a callback on `connect`.
 */
interface signal5<T0,T1,T2,T3,T4, R> {
    connect(callback: (arg0:T0, arg1:T1, arg2:T2, arg3:T3, arg4:T4) => R) : Editor.ScopedConnection
}

/**
 * LensCore provides an environment where `import.meta` is available.
 * This declaration file is needed because it is not a standard part
 * of ES2021. It is included in the `dom` lib, which plugins don't use.
 */
interface ImportMeta {
    resolve(path: string): string
    url: string
}
