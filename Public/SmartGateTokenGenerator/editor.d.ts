/**
 * @module Editor Scripting
 * @version 5.9.0
 * For Snapchat Version: 13.38
*/
/**
* Remove the interval calls.
*/
declare function clearInterval(timeout: Timeout): void

/**
* Cancels the timeout.
*/
declare function clearTimeout(timeout: Timeout): void

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
    
    protected constructor()
    
    static decode(value: string): Uint8Array
    
    static encode(data: Uint8Array): string
    
}

declare class BaseDescriptor extends IPluginDescriptor {
    
    protected constructor()
    
    dependencies: Editor.InterfaceId[]
    
    description: string
    
    id: string
    
    interfaces: Editor.InterfaceId[]
    
    name: string
    
}

declare class console {
    
    protected constructor()
    
    static debug(...data: any[]): void
    
    static error(...data: any[]): void
    
    static info(...data: any[]): void
    
    static log(...data: any[]): void
    
    static trace(...data: any[]): void
    
    static warn(...data: any[]): void
    
}

/**
* Namespace that provides access to the components of Lens Studio.

* @example
* ```js
* // Get the model component
* const model = this.pluginSystem.findInterface(Editor.Model.IModel);
* // Get the AssetManager in the current project (e.g. to import file).
* const assetManager = model.project.assetManager;
* ```
*/
declare class Editor {
    
    protected constructor()
    
    static createAnimationClip(scene: Editor.Assets.Scene): Editor.AnimationClip
    
    /**
    * @beta
    */
    static isNull(object: any): boolean
    
    static IAuthorization: Editor.InterfaceId
    
    /**
    * @beta
    */
    static IContextActionRegistry: Editor.InterfaceId
    
    /**
    * @beta
    */
    static IEntityPicker: Editor.InterfaceId
    
    /**
    * @beta
    */
    static IInstallableContentActions: Editor.InterfaceId
    
    /**
    * @beta
    */
    static IInstallableContentRegistry: Editor.InterfaceId
    
}

declare namespace Editor {
    class Ai {
        
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Ai {
        class Storage {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Alignment {
        /**
        * The options for horizontal alignment, for example when using {@link Editor.Components.BaseMeshVisual}
        
        * @beta
        */
        enum Horizontal {
            /**
            * @beta
            */
            Left,
            /**
            * @beta
            */
            Center,
            /**
            * @beta
            */
            Right
        }
    
    }

}

declare namespace Editor {
    namespace Alignment {
        /**
        * The options for vertical alignment, for example when using {@link Editor.Components.BaseMeshVisual}
        
        * @beta
        */
        enum Vertical {
            /**
            * @beta
            */
            Bottom,
            /**
            * @beta
            */
            Center,
            /**
            * @beta
            */
            Top
        }
    
    }

}

declare namespace Editor {
    class AnimationClip extends Editor.Model.EntityStructure {
        
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
    namespace Assets {
        class AnimationAsset extends Editor.Assets.Asset {
            
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
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The aliasing mode of {@link Editor.Assets.RenderTarget}.
        
        * @beta
        */
        enum AntialiasingMode {
            /**
            * Whether no aliasing should happen. 
            
            * @beta
            */
            Disabled,
            /**
            * Whether MSAA should be used.
            
            * @beta
            */
            MSAA,
            /**
            * @beta
            */
            TAA
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * @beta
        */
        enum AntialiasingQuality {
            /**
            * @beta
            */
            Low,
            /**
            * @beta
            */
            Medium,
            /**
            * @beta
            */
            High,
            /**
            * @beta
            */
            Default,
            /**
            * @beta
            */
            Ultra
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * An asset in Lens Studio.
        
        * @beta
        */
        class Asset extends Editor.Model.Entity {
            
            protected constructor()
            
            /**
            * @readonly
            
            * @beta
            */
            cacheFile: Editor.Path
            
            /**
            * @readonly
            
            * @beta
            */
            fileMeta: Editor.Model.AssetImportMetadata
            
            /**
            * The name of the asset.
            
            * @readonly
            
            * @beta
            */
            name: string
            
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
            
            protected constructor()
            
            handTrackingEnabled: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * How a Render Target should be cleared every frame {@link Editor.Assets.RenderTarget}.
        
        * @beta
        */
        enum ClearColorOption {
            /**
            * The Render Target is not cleared at all.
            
            * @beta
            */
            None,
            /**
            * The last texture in the render pipeline will be used. 
            
            * @beta
            */
            BackgroundTexture,
            /**
            * The specified color will be used for every pixel at the beginning of the frame.
            
            * @beta
            */
            CustomColor,
            /**
            * The specified texture will replace the Render Target at the beginning of the frame. For example, the texture might be the {@link Editor.Assets.DeviceCameraTexture}.
            
            * @beta
            */
            CustomTexture,
            /**
            * @beta
            */
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
        /**
        * The depth buffer strategy of a {@link Editor.Assets.RenderTarget}.
        
        * @beta
        */
        enum DepthBufferStrategy {
            /**
            * @beta
            */
            Auto,
            /**
            * @beta
            */
            ForceOff,
            /**
            * @beta
            */
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
        
        * @beta
        */
        class DeviceCameraTexture extends Editor.Assets.Texture {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides a cropped region of the input texture, calculated based on face position. Import with {@link Editor.Model.AssetManager#createNativeAsset}.   Learn more in {@link LensScripting.FaceCropTextureProvider}
        
        */
        class FaceCropTexture extends Editor.Assets.Texture {
            
            protected constructor()
            
            faceCenterMouthWeight: number
            
            faceIndex: number
            
            inputTexture: Editor.Assets.Texture
            
            scale: vec2
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides a 3D mesh of the user's face. Import with {@link Editor.Model.AssetManager#createNativeAsset}.   Learn more in the Face Mesh guide.
        */
        class FaceMesh extends Editor.Assets.RenderMesh {
            
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
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * An asset for 3D meshes.
        */
        class FileMesh extends Editor.Assets.RenderMesh {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * An asset for textures.
        */
        class FileTexture extends Editor.Assets.Texture {
            
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTexture2DArray extends Editor.Assets.Asset {
            
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo3D
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTexture3D extends Editor.Assets.Asset {
            
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo3D
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTextureCubemap extends Editor.Assets.Asset {
            
            protected constructor()
            
            /**
            * @readonly
            */
            fileInfo: Editor.Assets.FileTextureInfo3D
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTextureInfo extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @readonly
            */
            height: number
            
            /**
            * @readonly
            */
            width: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class FileTextureInfo3D extends Editor.Assets.FileTextureInfo {
            
            protected constructor()
            
            /**
            * @readonly
            */
            depth: number
            
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
        
        * @beta
        */
        class Font extends Editor.Assets.Asset {
            
            protected constructor()
            
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
            
            protected constructor()
            
            /**
            * Flips X and Y axis of the asset.
            */
            flipXY: boolean
            
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
        
        * @beta
        */
        class HairDataAsset extends Editor.Assets.Asset {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides data for {@link LensScripting.HandTracking3DAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class HandTracking3DAsset extends Editor.Assets.Object3DAsset {
            
            protected constructor()
            
            handType: Editor.Assets.HandTracking3DHandType
            
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
        
        * @example
        * ```js
        * // Create the asset
        * const imageMarker = assetManager.createNativeAsset('ImageMarker', 'Image Marker [EDIT_ME]', destination);
        
        * // Ask user for the file they want to use as image marker
        * import * as Ui from 'LensStudio:Ui';
        * const gui = pluginSystem.findInterface(Ui.IGui);
        * const filename = gui.dialogs.selectFileToOpen({ 'caption': 'Select image for the marker', 'filter': '*.png *.jpeg *.jpg' }, '')
        
        * // Import the image, and use it as the marker's texture
        * const importedTextureMeta = await assetManager.importExternalFileAsync(filename, destination, Editor.Model.ResultType.Auto);
        * imageMarker.texture = importedTextureMeta.primary;
        * ```
        */
        class ImageMarker extends Editor.Assets.MarkerAsset {
            
            protected constructor()
            
            texture: Editor.Assets.FileTexture
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A script asset that is written in JavaScript. 
        
        * @beta
        
        * @example
        * #script-assetshttps://docs.snap.com/lens-studio/5.0.0/essential-skills/scripting/scripting-introduction
        */
        class JavaScriptAsset extends Editor.Assets.ScriptAsset {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides data for {@link LensScripting.LocationAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class Location extends Editor.Assets.Asset {
            
            protected constructor()
            
            /**
            * @beta
            */
            displayName: string
            
            /**
            * @beta
            */
            locationId: string
            
            /**
            * @beta
            */
            locationType: Editor.Assets.LocationType
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides data for {@link LensScripting.LocationAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class LocationMesh extends Editor.Assets.RenderMesh {
            
            protected constructor()
            
            location: Editor.Assets.Location
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Used with {Editor.Assets.Location}.
        
        * @beta
        */
        enum LocationType {
            /**
            * @beta
            */
            Snap,
            /**
            * @beta
            */
            Custom,
            /**
            * @beta
            */
            World,
            /**
            * @beta
            */
            Tile,
            /**
            * @beta
            */
            RelativeTile,
            /**
            * @beta
            */
            Proxy,
            /**
            * @beta
            */
            NativeAR
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for Marker tracking. Learn more at {@link LensScripting.MarkerAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class MarkerAsset extends Editor.Assets.Asset {
            
            protected constructor()
            
            height: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Material}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class Material extends Editor.Assets.Asset {
            
            protected constructor()
            
            addPass(pass: Editor.Assets.Pass): Editor.Assets.PassInfo
            
            passInfos: Editor.Assets.PassInfo[]
            
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
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * @beta
        */
        enum MSAAStrategy {
            /**
            * @beta
            */
            Default,
            /**
            * @beta
            */
            OnlyWhenRequired
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * @beta
        */
        class NativePackageDescriptor extends Editor.Assets.Asset {
            
            protected constructor()
            
            /**
            * @readonly
            
            * @beta
            */
            componentId: Editor.Uuid
            
            /**
            * @beta
            */
            description: string
            
            /**
            * @readonly
            
            * @beta
            */
            exportId: Editor.Uuid
            
            /**
            * @beta
            */
            icon: Editor.Icon
            
            /**
            * @readonly
            
            * @beta
            */
            packageName: string
            
            /**
            * @beta
            */
            setupScript: Editor.Assets.SetupScript
            
            /**
            * @beta
            */
            version: Editor.Assets.Version
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Object3DAsset}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        */
        class Object3DAsset extends Editor.Assets.Asset {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Base class for entities which has object and component relationship such as {@link Editor.Assets.Scene} and {@link Editor.Assets.ObjectPrefab}.
        
        * @beta
        */
        class ObjectOwner extends Editor.Assets.Asset {
            
            protected constructor()
            
            /**
            * Adds a scene object to the entity.
            
            * @beta
            */
            addSceneObject(parent: Editor.Model.SceneObject): Editor.Model.SceneObject
            
            /**
            * Creates a scene object to the entity.
            
            * @beta
            */
            createSceneObject(name: string): Editor.Model.SceneObject
            
            /**
            * Find components on the entity.
            
            * @beta
            */
            findComponents(entityType: string): Editor.Components.Component[]
            
            /**
            * Get the index of `object` within the list of all the root objects.
            
            * @beta
            */
            getRootObjectIndex(object: Editor.Model.SceneObject): number
            
            /**
            * Reparent the scene object to another scene object. You can use this to reparent objects to the root (i.e. pass in `null`).
            
            * @beta
            */
            reparentSceneObject(object: Editor.Model.SceneObject, newParent: Editor.Model.SceneObject, position?: number): void
            
            /**
            * A list of scene objects which is a direct child of this entity.
            
            * @readonly
            
            * @beta
            */
            rootSceneObjects: Editor.Model.SceneObject[]
            
            /**
            * A list of scene objects which is a child of this entity.
            
            * @readonly
            
            * @beta
            */
            sceneObjects: Editor.Model.SceneObject[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.ObjectPrefab}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        * @beta
        */
        class ObjectPrefab extends Editor.Assets.ObjectOwner {
            
            protected constructor()
            
            /**
            * @beta
            */
            lazyLoading: boolean
            
            /**
            * @readonly
            
            * @beta
            */
            prefabInstances: Editor.Model.SceneObject[]
            
            /**
            * @beta
            */
            retainAssets: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for object tracking texture. Learn more at {@link LensScripting.ObjectTrackingTextureProvider}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        
        * @example
        * ```js
        * const model = pluginSystem.findInterface(Editor.Model.IModel);
        * const assetManager = model.project.assetManager;
        
        * const destination new Editor.Path('');
        * const trackingType = Editor.Assets.ObjectTrackingTextureType.Nails;
        
        * const result = assetManager.createNativeAsset('ObjectTrackingTexture', 'Object Tracking Texture', destination);
        * result.trackingType = trackingType;
        * const objectTrackingTexParam = new Editor.Assets.TextureParameter(objectTrackingTexImage.id);
        * ```
        */
        class ObjectTrackingTexture extends Editor.Assets.Texture {
            
            protected constructor()
            
            trackingType: Editor.Assets.ObjectTrackingTextureType
            
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
        /**
        * A native asset that provides information for visual objects rendering. Learn more at {@link LensScripting.Pass}. 
        
        * @example
        * ```js
        * // Get access to the project's assetManager
        * const model = pluginSystem.findInterface(Editor.Model.IModel);
        * const assetManager = model.project.assetManager;
        
        * // Locate the shader pass we want to import
        * const resourceLoc = import.meta.resolve('Resources/myMesh.ss_graph');
        * const absGraphPath = new Editor.Path(resourceLoc);
        
        * // Import the shader pass
        * const meta = await assetManager.importExternalFileAsync(absolutePath, new Editor.Path(''), Editor.Model.ResultType.Packed);
        * // You can set meta.primary on a Material asset to use it.
        * ```
        */
        class Pass extends Editor.Assets.Asset {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * The {@link Editor.Assets.Pass} on a {@link Editor.Assets.Material}.
        
        * @beta
        
        * @example
        * ```js
        * // Import built in helpers
        * import * as Utils from 'LensStudio:Utils@1.0.js';
        
        * // In the plugin create function
        * const model = pluginSystem.findInterface(Editor.Model.IModel);
        * const assetManager = model.project.assetManager;
        * const destination = destination;
        
        * const material = const assetManager.createNativeAsset('Material', 'Material Name', destination);
        
        * const absGraphPath = new Editor.Path(params.graph_path);
        * const pass = await Utils.findOrCreateAsync(assetManager, absGraphPath, destination);
        * const passInfo = material.addPass(pass);
        * ```
        */
        class PassInfo extends Editor.Model.Entity {
            
            protected constructor()
            
            /**
            * @beta
            */
            getPropertyNames(): string[]
            
            /**
            * @beta
            */
            blendMode: Editor.Assets.BlendMode
            
            /**
            * @beta
            */
            colorMask: any
            
            /**
            * @beta
            */
            cullMode: Editor.Assets.CullMode
            
            /**
            * @beta
            */
            defines: string[]
            
            /**
            * @beta
            */
            depthFunction: Editor.Assets.DepthFunction
            
            /**
            * @beta
            */
            depthTest: boolean
            
            /**
            * @beta
            */
            depthWrite: boolean
            
            /**
            * @beta
            */
            frustumCulling: Editor.Assets.FrustumCullMode
            
            /**
            * @beta
            */
            instanceCount: number
            
            /**
            * @beta
            */
            polygonOffset: vec2
            
            /**
            * @beta
            */
            twoSided: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class Filter extends Editor.Assets.Asset {
                
                protected constructor()
                
                includeDynamic: boolean
                
                includeIntangible: boolean
                
                includeStatic: boolean
                
                onlyLayers: Editor.Model.LayerSet
                
                skipLayers: Editor.Model.LayerSet
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class LevelsetColliderAsset extends Editor.Assets.Asset {
                
                protected constructor()
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class Matter extends Editor.Assets.Asset {
                
                protected constructor()
                
                dynamicBounciness: number
                
                friction: number
                
                rollingFriction: number
                
                spinningFriction: number
                
                staticBounciness: number
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace Physics {
            class WorldSettingsAsset extends Editor.Assets.Asset {
                
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
        /**
        * A mesh asset to be used with a {@link LensScripting.RenderMeshVisual}
        
        * @example
        * ```js
        * // Get access to the project's assetManager
        * const model = pluginSystem.findInterface(Editor.Model.IModel);
        * const assetManager = model.project.assetManager;
        
        * // Locate the mesh we want to import
        * const resourceLoc = import.meta.resolve('Resources/myMesh.mesh');
        * const absGraphPath = new Editor.Path(resourceLoc);
        
        * // Import the mesh
        * const meta = await assetManager.importExternalFileAsync(absolutePath, new Editor.Path(''), Editor.Model.ResultType.Packed);
        * // You can set meta.primary on a Mesh Component to use it.
        * ```
        */
        class RenderMesh extends Editor.Assets.Asset {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides the target for a camera to provide its output to. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        * @beta
        */
        class RenderTarget extends Editor.Assets.Texture {
            
            protected constructor()
            
            /**
            * @beta
            */
            antialiasingMode: Editor.Assets.AntialiasingMode
            
            /**
            * @beta
            */
            clearColor: vec4
            
            /**
            * @beta
            */
            clearColorOption: Editor.Assets.ClearColorOption
            
            /**
            * @beta
            */
            depthBuffer: Editor.Assets.DepthBufferStrategy
            
            /**
            * @beta
            */
            inputTexture: Editor.Assets.Texture
            
            /**
            * @beta
            */
            msaaStrategy: Editor.Assets.MSAAStrategy
            
            /**
            * @beta
            */
            resolution: Editor.Size
            
            /**
            * @beta
            */
            useScreenResolution: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class Sampler {
            
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
        
        * @beta
        */
        class Scene extends Editor.Assets.ObjectOwner {
            
            protected constructor()
            
            /**
            * Instantiate a prefab as a child of `parent` under this entity.
            
            * @beta
            */
            instantiatePrefab(prefab: Editor.Assets.ObjectPrefab, parent: Editor.Model.SceneObject): Editor.Model.SceneObject
            
            /**
            * This list of layers that exists within this scene.
            
            * @readonly
            
            * @beta
            */
            layers: Editor.Model.Layers
            
            /**
            * The camera that renders `renderOutput`.
            
            * @readonly
            
            * @beta
            */
            mainCamera: Editor.Components.Camera
            
            /**
            * The {@link Editor.Assets.RenderTarget} which this scene will be rendered to.  See {@link LensScripting.ScriptScene}.
            
            * @beta
            */
            renderOutput: Editor.Assets.RenderTarget
            
            /**
            * The overlay {@link Editor.Assets.RenderTarget} which this scene will be rendered to. This will shown at full resolution to the device which opens the Lens.
            
            * @beta
            */
            renderOverlayOutput: Editor.Assets.RenderTarget
            
            /**
            * The preview {@link Editor.Assets.RenderTarget} which this scene will be rendered to.  See {@link LensScripting.ScriptScene}.
            
            * @beta
            */
            renderPreviewOutput: Editor.Assets.RenderTarget
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Script Assets are text files that contain the code you write for your Lens. Scripts are written in Javascript or TypeScript. 
        
        * @beta
        
        * @example
        * ```js
        * ///@input string stringToPrint = "Print this on Tap"
        * //@input int testIntProperty = 7
        * //@input int[] testIntArray = {1, 2, 3}
        
        * scriptAsset.stringToPrint = "New String";
        * scriptAsset.testIntProperty = 9;
        * scriptAsset.testIntArray = [4,5,6];
        
        * // set icon 
        * const buffer = Editor.FileSystem.readTextAll(path to svg file)
        * const newIcon = Editor.Icon.setIconFromSVGData(buffer)
        * scriptAsset.icon = newIcon;
        * // getIcon
        * const icon = scriptAsset.icon
        
        * // set description 
        * scriptAsset.description = "helloWorld"
        * // get description 
        * const desc = scriptAsset.description 
        
        * // hide input 
        * scriptAsset.setScriptInputHidden("myInputName", true);
        
        * // unhide input 
        * scriptAsset.setScriptInputHidden("myInputName", true);
        
        * // check visibility of input 
        * scriptAsset.isScriptInputHidden("myInputName");
        * ```
        */
        class ScriptAsset extends Editor.Assets.Asset {
            
            protected constructor()
            
            /**
            * Returns true if the script inpput is hidden from the scene.
            
            * @beta
            */
            isScriptInputHidden(inputName: string): boolean
            
            /**
            * Used when you'd like to hide inputs from users in the scene. 
            
            * @beta
            */
            setScriptInputHidden(inputName: string, hidden: boolean): void
            
            /**
            * Id associated with the script asset. 
            
            * @readonly
            
            * @beta
            */
            componentId: Editor.Uuid
            
            /**
            * Description associated with the script asset 
            
            * @beta
            */
            description: string
            
            /**
            * Export id associated with the script asset. 
            
            * @readonly
            
            * @beta
            */
            exportId: Editor.Uuid
            
            /**
            * Icon associated with the script asset. 
            
            * @beta
            */
            icon: Editor.Icon
            
            /**
            * Version associated with the script asset.
            
            * @beta
            */
            version: Editor.Assets.Version
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        namespace ScriptTypes {
            /**
            * Used to set the vislbity of script assets on export. 
            
            * @beta
            
            * @example
            * ```js
            * scriptAsset.setVisiblity(Editor.Assets.ScriptTypes.Visibility.Locked)
            * scriptAsset.setVisiblity(Editor.Assets.ScriptTypes.Visibility.Editable)
            * ```
            */
            enum Visibility {
                /**
                * Sets the visiblity to locked, meaning changes cannot be made to asset.
                
                * @beta
                */
                Locked,
                /**
                * Sets the visiblity to editable, meaning changes can be made to asset.
                
                * @beta
                */
                Editable
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that provides information for segmentation texture. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        
        * @example
        * ```js
        * const model = pluginSystem.findInterface(Editor.Model.IModel);
        * const assetManager = model.project.assetManager;
        
        * const destination new Editor.Path('');
        * const segmentationType = Editor.Assets.SegmentationType.PortraitHair;
        
        * const result = assetManager.createNativeAsset('SegmentationTexture', 'Segmentation Texture', destination);
        * result.segmentationType = segmentationType;
        * ```
        */
        class SegmentationTexture extends Editor.Assets.Texture {
            
            protected constructor()
            
            feathering: number
            
            invertMask: boolean
            
            refineEdge: boolean
            
            segmentationType: Editor.Assets.SegmentationType
            
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
        /**
        * @beta
        */
        class SetupScript {
            
            protected constructor()
            
            /**
            * @readonly
            
            * @beta
            */
            code: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A native asset that can be used with {@link LensScripting.MarkerTrackingComponent} Learn more at {@link LensScripting.SnapcodeMarkerProvider}. Import with {@link Editor.Model.AssetManager#createNativeAsset}. 
        */
        class SnapcodeMarker extends Editor.Assets.MarkerAsset {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * A 2D texture asset.
        
        * @beta
        
        * @example
        * ```js
        * // Get access to the project's assetManager
        * const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        * const assetManager = model.project.assetManager;
        
        * // Locate the shader pass we want to import
        * const resourceLoc = import.meta.resolve('Resources/image.jpeg');
        * const absGraphPath = new Editor.Path(resourceLoc);
        
        * // Import the shader pass
        * const meta = await assetManager.importExternalFileAsync(absolutePath, new Editor.Path(''), Editor.Model.ResultType.Packed);
        * // You can set meta.primary on a pass asset to use it.
        * ```
        */
        class Texture extends Editor.Assets.Asset {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        class TextureParameter {
            constructor(id: Editor.Uuid)
            
            id: Editor.Uuid
            
            sampler: Editor.Assets.Sampler
            
        }
    
    }

}

declare namespace Editor {
    namespace Assets {
        /**
        * Used to set the version of script assets.
        
        * @beta
        
        * @example
        * ```js
        * scriptAsset.version.major = 3;
        * scriptAsset.version.minor  = 2;
        * scriptAsset.version.patch = 1;
        * ```
        */
        class Version {
            /**
            * scriptAsset.version = new Editor.Assets.Version(1,2,3);
            
            * @beta
            */
            constructor(major: number, minor: number, patch: number)
            
            /**
            * Major version number.
            
            * @beta
            */
            major: number
            
            /**
            * Minor version number.
            
            * @beta
            */
            minor: number
            
            /**
            * Patch version number. 
            
            * @beta
            */
            patch: number
            
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
    /**
    * @beta
    */
    class Buffer {
        /**
        * @beta
        */
        constructor(bytes: Uint8Array)
        
        /**
        * @beta
        */
        toBytes(): Uint8Array
        
        /**
        * @beta
        */
        toString(): string
        
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        class AnimationPlayer extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            animationClips: Editor.AnimationClip[]
            
            /**
            * @beta
            */
            autoplay: boolean
            
            /**
            * @beta
            */
            clipRangeType: Editor.Components.ClipRangeType
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link LensScripting.Text}.
        
        * @beta
        */
        class BackgroundSettings extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            cornerRadius: number
            
            /**
            * @beta
            */
            enabled: boolean
            
            /**
            * @beta
            */
            fill: Editor.Components.TextFill
            
            /**
            * @beta
            */
            margins: Editor.Rect
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Head} to set position on the face.
        
        * @beta
        */
        class BarycentricVertex {
            /**
            * @beta
            */
            constructor()
            
            /**
            * @beta
            */
            indices: number[]
            
            /**
            * @beta
            */
            weights: number[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.BaseMeshVisual}.
        
        * @beta
        */
        class BaseMeshVisual extends Editor.Components.Visual {
            
            protected constructor()
            
            /**
            * @beta
            */
            horizontalAlignment: Editor.Alignment.Horizontal
            
            /**
            * @beta
            */
            meshShadowMode: Editor.Components.MeshShadowMode
            
            /**
            * @beta
            */
            shadowColor: vec4
            
            /**
            * @beta
            */
            shadowDensity: number
            
            /**
            * @beta
            */
            stretchMode: Editor.Components.StretchMode
            
            /**
            * @beta
            */
            verticalAlignment: Editor.Alignment.Vertical
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Camera}.
        
        * @beta
        */
        class Camera extends Editor.Components.RenderLayerOwner {
            
            protected constructor()
            
            /**
            * @beta
            */
            aspect: number
            
            /**
            * @beta
            */
            aspectPreset: Editor.Components.CameraAspectPreset
            
            /**
            * @beta
            */
            cameraType: Editor.Components.CameraType
            
            /**
            * @beta
            */
            clearColor: Editor.Components.CameraClearColor
            
            /**
            * @beta
            */
            clearDepth: Editor.Components.CameraClearDepth
            
            /**
            * @beta
            */
            depthMode: Editor.Components.CameraDepthBufferMode
            
            /**
            * @beta
            */
            deviceProperty: Editor.Components.CameraDeviceProperty
            
            /**
            * @beta
            */
            far: number
            
            /**
            * @beta
            */
            fov: number
            
            /**
            * @beta
            */
            inputTexture: Editor.Assets.Texture
            
            /**
            * @beta
            */
            maskTexture: Editor.Assets.Texture
            
            /**
            * @beta
            */
            mipmapLevel: number
            
            /**
            * @beta
            */
            near: number
            
            /**
            * @beta
            */
            oitLayers: Editor.Components.CameraOitLayers
            
            /**
            * @readonly
            
            * @beta
            */
            orthographicSize: vec2
            
            /**
            * @beta
            */
            renderOrder: number
            
            /**
            * @beta
            */
            renderTarget: Editor.Assets.RenderTarget
            
            /**
            * @beta
            */
            size: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        
        * @beta
        */
        enum CameraAspectPreset {
            /**
            * @beta
            */
            Specific,
            /**
            * @beta
            */
            Custom
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        
        * @beta
        */
        class CameraClearColor extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            color: vec4
            
            /**
            * @beta
            */
            input: Editor.Assets.Texture
            
            /**
            * @beta
            */
            mode: Editor.Components.CameraClearColor.Mode
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace CameraClearColor {
            /**
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
            
            * @beta
            */
            enum Mode {
                /**
                * @beta
                */
                None,
                /**
                * @beta
                */
                Background,
                /**
                * @beta
                */
                Color,
                /**
                * @beta
                */
                Texture
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        
        * @beta
        */
        class CameraClearDepth extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            input: Editor.Assets.Texture
            
            /**
            * @beta
            */
            mode: Editor.Components.CameraClearDepth.Mode
            
            /**
            * @beta
            */
            value: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace CameraClearDepth {
            /**
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
            
            * @beta
            */
            enum Mode {
                /**
                * @beta
                */
                None,
                /**
                * @beta
                */
                Value,
                /**
                * @beta
                */
                Texture
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        
        * @beta
        */
        enum CameraDepthBufferMode {
            /**
            * @beta
            */
            Regular,
            /**
            * @beta
            */
            Logarithmic
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        
        * @beta
        */
        enum CameraDeviceProperty {
            /**
            * @beta
            */
            None,
            /**
            * @beta
            */
            Aspect,
            /**
            * @beta
            */
            Fov,
            /**
            * @beta
            */
            All
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        
        * @beta
        */
        enum CameraOitLayers {
            /**
            * @beta
            */
            NoOit,
            /**
            * @beta
            */
            Layers4,
            /**
            * @beta
            */
            Layers4Plus1,
            /**
            * @beta
            */
            Layers8
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.Camera}.
        
        * @beta
        */
        enum CameraType {
            /**
            * @beta
            */
            Perspective,
            /**
            * @beta
            */
            Orthographic
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link LensScripting.Canvas}.
        
        * @beta
        */
        class Canvas extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            pivot: vec2
            
            /**
            * @beta
            */
            sortingType: Editor.Components.SortingType
            
            /**
            * @beta
            */
            unitType: Editor.Components.UnitType
            
            /**
            * @beta
            */
            worldSpaceRect: Editor.Rect
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        enum CapitalizationOverride {
            /**
            * @beta
            */
            None,
            /**
            * @beta
            */
            AllUpper,
            /**
            * @beta
            */
            AllLower
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        enum ClipRangeType {
            /**
            * @beta
            */
            Frames,
            /**
            * @beta
            */
            Seconds
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ClothVisual}.
        
        * @beta
        */
        class ClothVisual extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            bendMode: Editor.Components.ClothVisual.BendMode
            
            /**
            * @beta
            */
            bendStiffness: number
            
            /**
            * @beta
            */
            colliders: Editor.Components.Physics.ColliderComponent[]
            
            /**
            * @beta
            */
            collisionEnabled: boolean
            
            /**
            * @beta
            */
            collisionFriction: number
            
            /**
            * @beta
            */
            collisionOffset: number
            
            /**
            * @beta
            */
            collisionStiffness: number
            
            /**
            * @beta
            */
            debugModeEnabled: boolean
            
            /**
            * @beta
            */
            frameRate: number
            
            /**
            * @beta
            */
            friction: number
            
            /**
            * @beta
            */
            gravity: vec3
            
            /**
            * @beta
            */
            iterations: number
            
            /**
            * @beta
            */
            mass: number
            
            /**
            * @beta
            */
            maxAcceleration: number
            
            /**
            * @beta
            */
            mesh: Editor.Assets.RenderMesh
            
            /**
            * @beta
            */
            stretchStiffness: number
            
            /**
            * @beta
            */
            updateNormalsEnabled: boolean
            
            /**
            * @beta
            */
            vertexBindings: Editor.Components.ClothVisual.VertexBinding[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace ClothVisual {
            /**
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
            
            * @beta
            */
            enum BendMode {
                /**
                * @beta
                */
                Isometric,
                /**
                * @beta
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
            * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
            
            * @beta
            */
            class VertexBinding extends Editor.Model.Entity {
                
                protected constructor()
                
                /**
                * @beta
                */
                color: vec4
                
                /**
                * @beta
                */
                colorMask: any
                
                /**
                * @beta
                */
                followObject: Editor.Model.SceneObject
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.ClothVisual}.
        
        * @beta
        */
        class Component extends Editor.Model.Prefabable {
            
            protected constructor()
            
            /**
            * @beta
            */
            enabled: boolean
            
            /**
            * @beta
            */
            name: string
            
            /**
            * @readonly
            
            * @beta
            */
            sceneObject: Editor.Model.SceneObject
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.LightSource}.
        
        * @beta
        */
        enum DecayType {
            /**
            * @beta
            */
            None,
            /**
            * @beta
            */
            Linear,
            /**
            * @beta
            */
            Quadratic
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.DeviceTracking}.
        
        * @beta
        */
        class DeviceTracking extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            deviceTrackingMode: Editor.Components.DeviceTrackingMode
            
            /**
            * @beta
            */
            rotationOptions: Editor.Components.RotationOptions
            
            /**
            * @beta
            */
            surfaceOptions: Editor.Components.SurfaceOptions
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.DeviceTracking}.
        
        * @beta
        */
        enum DeviceTrackingMode {
            /**
            * @beta
            */
            Rotation,
            /**
            * @beta
            */
            Surface,
            /**
            * @beta
            */
            World
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.
        
        * @beta
        */
        class DropshadowSettings extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            enabled: boolean
            
            /**
            * @beta
            */
            fill: Editor.Components.TextFill
            
            /**
            * @beta
            */
            offset: vec2
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link Editor.Components.LightSource}.
        
        * @beta
        */
        enum EnvmapFromCameraMode {
            /**
            * @beta
            */
            Auto,
            /**
            * @beta
            */
            Face,
            /**
            * @beta
            */
            Surface
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text3D}.
        
        * @beta
        */
        enum ExtrudeDirection {
            /**
            * @beta
            */
            Forwards,
            /**
            * @beta
            */
            Backwards,
            /**
            * @beta
            */
            Both
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.EyeColorVisual}.
        
        * @beta
        */
        class EyeColorVisual extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            eyeToRender: Editor.Components.EyeToRender
            
            /**
            * @beta
            */
            faceIndex: number
            
            /**
            * @beta
            */
            rotationEnabled: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.EyeColorVisual}.
        
        * @beta
        */
        enum EyeToRender {
            /**
            * @beta
            */
            Both,
            /**
            * @beta
            */
            Left,
            /**
            * @beta
            */
            Right
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceInsetRegion}. Use with {@link Editor.Components.FaceInsetVisual}.
        
        * @beta
        */
        enum FaceInsetRegion {
            /**
            * @beta
            */
            LeftEye,
            /**
            * @beta
            */
            RightEye,
            /**
            * @beta
            */
            Mouth,
            /**
            * @beta
            */
            Nose,
            /**
            * @beta
            */
            Face,
            /**
            * @beta
            */
            Custom
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceInsetVisual}.
        
        * @beta
        */
        class FaceInsetVisual extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            faceIndex: number
            
            /**
            * @beta
            */
            faceRegion: Editor.Components.FaceInsetRegion
            
            /**
            * @beta
            */
            flipX: boolean
            
            /**
            * @beta
            */
            flipY: boolean
            
            /**
            * @beta
            */
            innerBorderRadius: number
            
            /**
            * @beta
            */
            offset: vec2
            
            /**
            * @beta
            */
            outerBorderRadius: number
            
            /**
            * @beta
            */
            pivot: vec2
            
            /**
            * @beta
            */
            sourceScale: vec2
            
            /**
            * @beta
            */
            subDivisionCount: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceMaskVisual}.
        
        * @beta
        */
        class FaceMaskVisual extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            drawMouth: boolean
            
            /**
            * @beta
            */
            enabledLipsFix: boolean
            
            /**
            * @beta
            */
            enabledTeethFix: boolean
            
            /**
            * @beta
            */
            faceIndex: number
            
            /**
            * @beta
            */
            maskCoordinates: vec2[]
            
            /**
            * @beta
            */
            maskOnMouthClosed: Editor.Assets.Texture
            
            /**
            * @beta
            */
            originalFaceIndex: number
            
            /**
            * @beta
            */
            teethFixAlpha: number
            
            /**
            * @beta
            */
            textureCoordinates: vec2[]
            
            /**
            * @beta
            */
            useOriginalTexCoords: boolean
            
            /**
            * @beta
            */
            useTextureFacePosition: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.FaceStretchVisual}.
        
        * @beta
        */
        class FaceStretchVisual extends Editor.Components.BaseMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            addFeature(name: string): void
            
            /**
            * @beta
            */
            clearFeatures(): void
            
            /**
            * @beta
            */
            getFeatureNames(): string[]
            
            /**
            * @beta
            */
            getFeaturePoints(name: string): Editor.Components.StretchPoint[]
            
            /**
            * @beta
            */
            getFeatureWeight(name: string): number
            
            /**
            * @beta
            */
            removeFeature(name: string): void
            
            /**
            * @beta
            */
            setFeatureWeight(name: string, weight: number): void
            
            /**
            * @beta
            */
            updateFeaturePoints(name: string, points: Editor.Components.StretchPoint[]): void
            
            /**
            * @beta
            */
            faceIndex: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * A component used to render GaussianSplattingAsset.
        */
        class GaussianSplattingVisual extends Editor.Components.MaterialMeshVisual {
            
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
        
        * @beta
        */
        class HairVisual extends Editor.Components.BaseMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            bendStiffness: number
            
            /**
            * @beta
            */
            clumpDensity: number
            
            /**
            * @beta
            */
            clumpRadius: number
            
            /**
            * @beta
            */
            clumpTipScale: number
            
            /**
            * @beta
            */
            collapseStiffness: number
            
            /**
            * @beta
            */
            colliders: Editor.Components.Physics.ColliderComponent[]
            
            /**
            * @beta
            */
            collisionEnabled: boolean
            
            /**
            * @beta
            */
            collisionFriction: number
            
            /**
            * @beta
            */
            collisionOffset: number
            
            /**
            * @beta
            */
            collisionStiffness: number
            
            /**
            * @beta
            */
            damp: number
            
            /**
            * @beta
            */
            debugDrawLoadedStrands: boolean
            
            /**
            * @beta
            */
            debugDrawSimulatedStrands: boolean
            
            /**
            * @beta
            */
            debugModeEnabled: boolean
            
            /**
            * @beta
            */
            density: number
            
            /**
            * @beta
            */
            fallbackModeEnabled: boolean
            
            /**
            * @beta
            */
            frameRate: number
            
            /**
            * @beta
            */
            friction: number
            
            /**
            * @beta
            */
            gravity: vec3
            
            /**
            * @beta
            */
            hairData: Editor.Assets.HairDataAsset
            
            /**
            * @beta
            */
            hairMaterial: Editor.Assets.Material
            
            /**
            * @beta
            */
            hairResolution: number
            
            /**
            * @beta
            */
            noise: number
            
            /**
            * @beta
            */
            selfCollisionEnabled: boolean
            
            /**
            * @beta
            */
            selfCollisionFriction: number
            
            /**
            * @beta
            */
            selfCollisionOffset: number
            
            /**
            * @beta
            */
            selfCollisionStiffness: number
            
            /**
            * @beta
            */
            steppedCutEnabled: boolean
            
            /**
            * @beta
            */
            stiffness: number
            
            /**
            * @beta
            */
            strandCut: number
            
            /**
            * @beta
            */
            strandNeighborCosThreshold: number
            
            /**
            * @beta
            */
            strandNeighborLengthThreshold: number
            
            /**
            * @beta
            */
            strandNeighborRadius: number
            
            /**
            * @beta
            */
            strandTaper: number
            
            /**
            * @beta
            */
            strandWidth: number
            
            /**
            * @beta
            */
            stretchLimitEnabled: boolean
            
            /**
            * @beta
            */
            stretchStiffness: number
            
            /**
            * @beta
            */
            twistStiffness: number
            
            /**
            * @beta
            */
            windEnabled: boolean
            
            /**
            * @beta
            */
            windForce: vec3
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Head}.
        
        * @beta
        */
        class Head extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            attachedBarycentricVertex: Editor.Components.BarycentricVertex
            
            /**
            * @beta
            */
            attachmentPoint: Editor.Components.HeadAttachmentPointType
            
            /**
            * @beta
            */
            faceIndex: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Head}.
        
        * @beta
        */
        enum HeadAttachmentPointType {
            /**
            * @beta
            */
            HeadCenter,
            /**
            * @beta
            */
            CandideCenter,
            /**
            * @beta
            */
            TriangleBarycentric,
            /**
            * @beta
            */
            FaceMeshCenter,
            /**
            * @beta
            */
            LeftEyeballCenter,
            /**
            * @beta
            */
            RightEyeballCenter,
            /**
            * @beta
            */
            MouthCenter,
            /**
            * @beta
            */
            Chin,
            /**
            * @beta
            */
            Forehead,
            /**
            * @beta
            */
            LeftForehead,
            /**
            * @beta
            */
            RightForehead,
            /**
            * @beta
            */
            LeftCheek,
            /**
            * @beta
            */
            RightCheek
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text} and {@link Editor.Components.Text3D}.
        
        * @beta
        */
        enum HorizontalOverflow {
            /**
            * @beta
            */
            Overflow,
            /**
            * @beta
            */
            Truncate,
            /**
            * @beta
            */
            TruncateFront,
            /**
            * @beta
            */
            Wrap,
            /**
            * @beta
            */
            Ellipsis,
            /**
            * @beta
            */
            EllipsisFront,
            /**
            * @beta
            */
            Shrink
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Image}.
        
        * @beta
        */
        class Image extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            flipX: boolean
            
            /**
            * @beta
            */
            flipY: boolean
            
            /**
            * @beta
            */
            pivot: vec2
            
            /**
            * @beta
            */
            rotationAngle: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.InteractionComponent}.
        
        * @beta
        */
        class InteractionComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            camera: Editor.Components.Camera
            
            /**
            * @beta
            */
            depthFilter: boolean
            
            /**
            * @beta
            */
            meshVisuals: Editor.Components.BaseMeshVisual[]
            
            /**
            * @beta
            */
            minimumTouchSize: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LightSource}.
        
        * @beta
        */
        class LightSource extends Editor.Components.RenderLayerOwner {
            
            protected constructor()
            
            /**
            * @beta
            */
            autoLightSourcePosition: boolean
            
            /**
            * @beta
            */
            autoShadowFrustumSize: boolean
            
            /**
            * @beta
            */
            autoShadowFrustumSizeExtend: number
            
            /**
            * @beta
            */
            castsShadows: boolean
            
            /**
            * @beta
            */
            color: vec4
            
            /**
            * @beta
            */
            decayLimit: boolean
            
            /**
            * @beta
            */
            decayRange: number
            
            /**
            * @beta
            */
            decayType: Editor.Components.DecayType
            
            /**
            * @beta
            */
            diffuseEnvmapTexture: Editor.Assets.Texture
            
            /**
            * @beta
            */
            dynamicEnvInputTexture: Editor.Assets.Texture
            
            /**
            * @beta
            */
            envmapExposure: number
            
            /**
            * @beta
            */
            envmapFromCameraMode: Editor.Components.EnvmapFromCameraMode
            
            /**
            * @beta
            */
            envmapRotation: number
            
            /**
            * @beta
            */
            estimationSharpness: number
            
            /**
            * @beta
            */
            innerConeAngle: number
            
            /**
            * @beta
            */
            intensity: number
            
            /**
            * @beta
            */
            lightType: Editor.Components.LightType
            
            /**
            * @beta
            */
            outerConeAngle: number
            
            /**
            * @beta
            */
            shadowBlurRadius: number
            
            /**
            * @beta
            */
            shadowColor: vec4
            
            /**
            * @beta
            */
            shadowDensity: number
            
            /**
            * @beta
            */
            shadowFrustumFarClipPlane: number
            
            /**
            * @beta
            */
            shadowFrustumNearClipPlane: number
            
            /**
            * @beta
            */
            shadowFrustumSize: number
            
            /**
            * @beta
            */
            shadowTextureSize: number
            
            /**
            * @beta
            */
            specularEnvmapTexture: Editor.Assets.Texture
            
            /**
            * @beta
            */
            useEnvmapFromCamera: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.LightSource}.
        
        * @beta
        */
        enum LightType {
            /**
            * @beta
            */
            Point,
            /**
            * @beta
            */
            Directional,
            /**
            * @beta
            */
            Spot,
            /**
            * @beta
            */
            Ambient,
            /**
            * @beta
            */
            EnvMap,
            /**
            * @beta
            */
            Estimation
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LiquifyVisual}.
        
        * @beta
        */
        class LiquifyVisual extends Editor.Components.BaseMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            intensity: number
            
            /**
            * @beta
            */
            radius: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LocatedAtComponent}.
        */
        class LocatedAtComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            location: Editor.Assets.Location
            
            /**
            * @beta
            */
            position: vec3
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LookAtComponent}.
        */
        class LookAtComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            aimVectors: Editor.Components.LookAtComponent.AimVectors
            
            /**
            * @beta
            */
            lookAtMode: Editor.Components.LookAtComponent.LookAtMode
            
            /**
            * @beta
            */
            offsetRotation: quat
            
            /**
            * @beta
            */
            target: Editor.Model.SceneObject
            
            /**
            * @beta
            */
            worldUpVector: Editor.Components.LookAtComponent.WorldUpVector
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace LookAtComponent {
            /**
            * Settings used with {@link Editor.Components.LookAtComponent}.
            
            * @beta
            */
            enum AimVectors {
                /**
                * @beta
                */
                XAimYUp,
                /**
                * @beta
                */
                XAimZUp,
                /**
                * @beta
                */
                YAimXUp,
                /**
                * @beta
                */
                YAimZUp,
                /**
                * @beta
                */
                ZAimXUp,
                /**
                * @beta
                */
                ZAimYUp,
                /**
                * @beta
                */
                XAimNegativeYUp,
                /**
                * @beta
                */
                XAimNegativeZUp,
                /**
                * @beta
                */
                YAimNegativeXUp,
                /**
                * @beta
                */
                YAimNegativeZUp,
                /**
                * @beta
                */
                ZAimNegativeXUp,
                /**
                * @beta
                */
                ZAimNegativeYUp,
                /**
                * @beta
                */
                NegativeXAimYUp,
                /**
                * @beta
                */
                NegativeXAimZUp,
                /**
                * @beta
                */
                NegativeYAimXUp,
                /**
                * @beta
                */
                NegativeYAimZUp,
                /**
                * @beta
                */
                NegativeZAimXUp,
                /**
                * @beta
                */
                NegativeZAimYUp,
                /**
                * @beta
                */
                NegativeXAimNegativeYUp,
                /**
                * @beta
                */
                NegativeXAimNegativeZUp,
                /**
                * @beta
                */
                NegativeYAimNegativeXUp,
                /**
                * @beta
                */
                NegativeYAimNegativeZUp,
                /**
                * @beta
                */
                NegativeZAimNegativeXUp,
                /**
                * @beta
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
            * Settings used with {@link Editor.Components.LookAtComponent}.
            
            * @beta
            */
            enum LookAtMode {
                /**
                * @beta
                */
                LookAtPoint,
                /**
                * @beta
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
            * Settings used with {@link Editor.Components.LookAtComponent}.
            
            * @beta
            */
            enum WorldUpVector {
                /**
                * @beta
                */
                SceneX,
                /**
                * @beta
                */
                SceneY,
                /**
                * @beta
                */
                SceneZ,
                /**
                * @beta
                */
                TargetX,
                /**
                * @beta
                */
                TargetY,
                /**
                * @beta
                */
                TargetZ,
                /**
                * @beta
                */
                ObjectX,
                /**
                * @beta
                */
                ObjectY,
                /**
                * @beta
                */
                ObjectZ
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ManipulateComponent}.
        
        * @beta
        */
        class ManipulateComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            drag: boolean
            
            /**
            * @beta
            */
            maxDistance: number
            
            /**
            * @beta
            */
            maxScale: number
            
            /**
            * @beta
            */
            minDistance: number
            
            /**
            * @beta
            */
            minScale: number
            
            /**
            * @beta
            */
            rotate: boolean
            
            /**
            * @beta
            */
            scale: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.MarkerTrackingComponent}.
        */
        class MarkerTrackingComponent extends Editor.Components.Component {
            
            protected constructor()
            
            marker: Editor.Assets.MarkerAsset
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        class MaskingComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            cornerRadius: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.MaterialMeshVisual}.
        
        * @beta
        */
        class MaterialMeshVisual extends Editor.Components.BaseMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            addMaterialAt(value: Editor.Assets.Material, pos?: number): void
            
            /**
            * @beta
            */
            clearMaterials(): void
            
            /**
            * @beta
            */
            getMaterialAt(pos: number): Editor.Assets.Material
            
            /**
            * @beta
            */
            getMaterialsCount(): number
            
            /**
            * @beta
            */
            indexOfMaterial(value: Editor.Assets.Material): number | undefined
            
            /**
            * @beta
            */
            moveMaterial(origin: number, destination: number): void
            
            /**
            * @beta
            */
            removeMaterialAt(pos: number): void
            
            /**
            * @beta
            */
            setMaterialAt(pos: number, value: Editor.Assets.Material): void
            
            /**
            * @beta
            */
            mainMaterial: Editor.Assets.Material
            
            /**
            * @beta
            */
            materials: Editor.Assets.Material[]
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.BaseMeshVisual}.
        
        * @beta
        */
        enum MeshShadowMode {
            /**
            * @beta
            */
            None,
            /**
            * @beta
            */
            Caster,
            /**
            * @beta
            */
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
            
            protected constructor()
            
            /**
            * @beta
            */
            trackingType: Editor.Components.ObjectTrackingType
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ObjectTracking3D}.
        */
        class ObjectTracking3D extends Editor.Components.Component {
            
            protected constructor()
            
            matchingRootObject: Editor.Model.SceneObject
            
            objectIndex: number
            
            trackPosition: boolean
            
            trackingAsset: Editor.Assets.Object3DAsset
            
            trackingMode: Editor.Components.ObjectTracking3D.TrackingMode
            
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
        
        * @beta
        */
        enum ObjectTrackingType {
            /**
            * @beta
            */
            Cat,
            /**
            * @beta
            */
            Dog,
            /**
            * @beta
            */
            Pet,
            /**
            * @beta
            */
            Hand,
            /**
            * @beta
            */
            Nails,
            /**
            * @beta
            */
            Shoulder,
            /**
            * @beta
            */
            UpperBody,
            /**
            * @beta
            */
            FullBody
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.
        
        * @beta
        */
        class OutlineSettings extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            enabled: boolean
            
            /**
            * @beta
            */
            fill: Editor.Components.TextFill
            
            /**
            * @beta
            */
            size: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class BodyComponent extends Editor.Components.Physics.ColliderComponent {
                
                protected constructor()
                
                angularDamping: number
                
                bodySetting: Editor.Components.Physics.BodySetting
                
                bodySettingValue: number
                
                damping: number
                
                dynamic: boolean
                
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
                
                protected constructor()
                
                size: vec3
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Capsule extends Editor.Components.Physics.Shape {
                
                protected constructor()
                
                axis: Editor.Axis
                
                length: number
                
                radius: number
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class ColliderComponent extends Editor.Components.Component {
                
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
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Cone extends Editor.Components.Physics.Shape {
                
                protected constructor()
                
                axis: Editor.Axis
                
                length: number
                
                radius: number
                
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
                
                protected constructor()
                
                constraint: Editor.Components.Physics.Constraint
                
                debugDrawEnabled: boolean
                
                target: Editor.Components.Physics.ColliderComponent
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Cylinder extends Editor.Components.Physics.Shape {
                
                protected constructor()
                
                axis: Editor.Axis
                
                length: number
                
                radius: number
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class LevelSet extends Editor.Components.Physics.Shape {
                
                protected constructor()
                
                asset: Editor.Assets.Physics.LevelsetColliderAsset
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Mesh extends Editor.Components.Physics.Shape {
                
                protected constructor()
                
                convex: boolean
                
                mesh: Editor.Assets.RenderMesh
                
                skin: Editor.Components.Skin
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Shape extends Editor.Model.EntityStructure {
                
                protected constructor()
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class Sphere extends Editor.Components.Physics.Shape {
                
                protected constructor()
                
                radius: number
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace Physics {
            class WorldComponent extends Editor.Components.Component {
                
                protected constructor()
                
                updateOrder: number
                
                worldSettings: Editor.Assets.Physics.WorldSettingsAsset
                
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        namespace PinToMesh {
            /**
            * @beta
            */
            enum Orientation {
                /**
                * @beta
                */
                OnlyPosition,
                /**
                * @beta
                */
                PositionAndDirection
            }
        
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        class PinToMeshComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            offsetPosition: vec3
            
            /**
            * @beta
            */
            offsetRotation: vec3
            
            /**
            * @beta
            */
            orientation: Editor.Components.PinToMesh.Orientation
            
            /**
            * @beta
            */
            pinUV: vec2
            
            /**
            * @beta
            */
            target: Editor.Components.BaseMeshVisual
            
            /**
            * @beta
            */
            useVertexNormal: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.PostEffectVisual}.
        */
        class PostEffectVisual extends Editor.Components.MaterialMeshVisual {
            
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
            
            protected constructor()
            
            cropTexture: Editor.Assets.Texture
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The render layer which the component will be on. 
        
        * @beta
        */
        class RenderLayerOwner extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            renderLayer: Editor.Model.LayerSet
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.RenderMeshVisual}.
        
        * @beta
        */
        class RenderMeshVisual extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            blendNormals: boolean
            
            /**
            * @beta
            */
            blendShapesEnabled: boolean
            
            /**
            * @beta
            */
            mesh: Editor.Assets.RenderMesh
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.RetouchVisual}.
        
        * @beta
        */
        class RetouchVisual extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            eyeWhiteningIntensity: number
            
            /**
            * @beta
            */
            faceIndex: number
            
            /**
            * @beta
            */
            sharpenEyeIntensity: number
            
            /**
            * @beta
            */
            softSkinIntensity: number
            
            /**
            * @beta
            */
            teethWhiteningIntensity: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.DeviceTracking}.  @see {@link LensScripting.RotationOptions}.
        
        * @beta
        */
        class RotationOptions extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            invertRotation: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ScreenRegionComponent}.
        
        * @beta
        */
        class ScreenRegionComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            region: Editor.Components.ScreenRegionType
            
            /**
            * @beta
            */
            resizeWithKeyboard: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.ScreenRegionComponent}.
        
        * @beta
        */
        enum ScreenRegionType {
            /**
            * @beta
            */
            FullFrame,
            /**
            * @beta
            */
            Capture,
            /**
            * @beta
            */
            Preview,
            /**
            * @beta
            */
            SafeRender,
            /**
            * @beta
            */
            RoundButton
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ScreenTransform}.
        
        * @beta
        */
        class ScreenTransform extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            advanced: boolean
            
            /**
            * @beta
            */
            anchor: Editor.Rect
            
            /**
            * @beta
            */
            constraints: Editor.Components.ScreenTransformConstraints
            
            /**
            * @beta
            */
            offset: Editor.Rect
            
            /**
            * @beta
            */
            pivot: vec2
            
            /**
            * @beta
            */
            transform: Editor.Transform
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.ScreenTransformConstraints}.
        
        * @beta
        */
        class ScreenTransformConstraints {
            /**
            * @beta
            */
            constructor()
            
            /**
            * @beta
            */
            fixedHeight: boolean
            
            /**
            * @beta
            */
            fixedWidth: boolean
            
            /**
            * @beta
            */
            pinToBottom: boolean
            
            /**
            * @beta
            */
            pinToLeft: boolean
            
            /**
            * @beta
            */
            pinToRight: boolean
            
            /**
            * @beta
            */
            pinToTop: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.ScriptComponent}.
        
        * @beta
        
        * @example
        * ```js
        * const scriptComponent = sceneObject.addComponent('ScriptComponent')
        * scriptComponent.scriptAsset = scriptAsset
        * ```
        */
        class ScriptComponent extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * Script asset associated with the script component. 
            
            * @beta
            */
            scriptAsset: Editor.Assets.ScriptAsset
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        class Skin extends Editor.Components.Component {
            
            protected constructor()
            
            skinBones: object
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.Canvas}.
        
        * @beta
        */
        enum SortingType {
            /**
            * @beta
            */
            Hierarchy,
            /**
            * @beta
            */
            Depth
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.BaseMeshVisual}.
        
        * @beta
        */
        enum StretchMode {
            /**
            * @beta
            */
            Fill,
            /**
            * @beta
            */
            Fit,
            /**
            * @beta
            */
            Stretch,
            /**
            * @beta
            */
            FitHeight,
            /**
            * @beta
            */
            FitWidth,
            /**
            * @beta
            */
            FillAndCut
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Used with {@link Editor.Components.FaceStretchVisual}.
        
        * @beta
        */
        class StretchPoint {
            /**
            * @beta
            */
            constructor()
            
            /**
            * @beta
            */
            delta: vec3
            
            /**
            * @beta
            */
            index: number
            
            /**
            * @beta
            */
            weight: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.DeviceTracking}.
        
        * @beta
        */
        class SurfaceOptions extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            enhanceWithNativeAR: boolean
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Text}.
        
        * @beta
        */
        class Text extends Editor.Components.BaseMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            advancedLayout: Editor.Components.TextAdvancedLayout
            
            /**
            * @beta
            */
            backgroundSettings: Editor.Components.BackgroundSettings
            
            /**
            * @beta
            */
            capitalizationOverride: Editor.Components.CapitalizationOverride
            
            /**
            * @beta
            */
            depthTest: boolean
            
            /**
            * @beta
            */
            dropshadowSettings: Editor.Components.DropshadowSettings
            
            /**
            * @beta
            */
            editable: boolean
            
            /**
            * @beta
            */
            font: Editor.Assets.Font
            
            /**
            * @beta
            */
            horizontalOverflow: Editor.Components.HorizontalOverflow
            
            /**
            * @beta
            */
            letterSpacing: number
            
            /**
            * @beta
            */
            lineSpacing: number
            
            /**
            * @beta
            */
            outlineSettings: Editor.Components.OutlineSettings
            
            /**
            * @beta
            */
            showEditingPreview: boolean
            
            /**
            * @beta
            */
            size: number
            
            /**
            * @beta
            */
            sizeToFit: boolean
            
            /**
            * @beta
            */
            text: string
            
            /**
            * @beta
            */
            textFill: Editor.Components.TextFill
            
            /**
            * @beta
            */
            touchHandler: Editor.Components.InteractionComponent
            
            /**
            * @beta
            */
            twoSided: boolean
            
            /**
            * @beta
            */
            verticalOverflow: Editor.Components.VerticalOverflow
            
            /**
            * @beta
            */
            worldSpaceRect: Editor.Rect
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Text3D}.
        
        * @beta
        */
        class Text3D extends Editor.Components.MaterialMeshVisual {
            
            protected constructor()
            
            /**
            * @beta
            */
            advancedLayout: Editor.Components.TextAdvancedLayout
            
            /**
            * @beta
            */
            capitalizationOverride: Editor.Components.CapitalizationOverride
            
            /**
            * @beta
            */
            editable: boolean
            
            /**
            * @beta
            */
            enableBatching: boolean
            
            /**
            * @beta
            */
            extrudeDirection: Editor.Components.ExtrudeDirection
            
            /**
            * @beta
            */
            extrusionDepth: number
            
            /**
            * @beta
            */
            font: Editor.Assets.Font
            
            /**
            * @beta
            */
            horizontalOverflow: Editor.Components.HorizontalOverflow
            
            /**
            * @beta
            */
            letterSpacing: number
            
            /**
            * @beta
            */
            lineSpacing: number
            
            /**
            * @beta
            */
            showEditingPreview: boolean
            
            /**
            * @beta
            */
            size: number
            
            /**
            * @beta
            */
            sizeToFit: boolean
            
            /**
            * @beta
            */
            text: string
            
            /**
            * @beta
            */
            touchHandler: Editor.Components.InteractionComponent
            
            /**
            * @beta
            */
            verticalOverflow: Editor.Components.VerticalOverflow
            
            /**
            * @beta
            */
            worldSpaceRect: Editor.Rect
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        class TextAdvancedLayout extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            capitalizationOverride: Editor.Components.CapitalizationOverride
            
            /**
            * @beta
            */
            extentsTarget: Editor.Components.ScreenTransform
            
            /**
            * @beta
            */
            letterSpacing: number
            
            /**
            * @beta
            */
            lineSpacing: number
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
        
        * @beta
        */
        class TextFill extends Editor.Model.EntityStructure {
            
            protected constructor()
            
            /**
            * @beta
            */
            color: vec4
            
            /**
            * @beta
            */
            mode: Editor.Components.TextFillMode
            
            /**
            * @beta
            */
            texture: Editor.Assets.Texture
            
            /**
            * @beta
            */
            textureStretch: Editor.Components.StretchMode
            
            /**
            * @beta
            */
            tileCount: number
            
            /**
            * @beta
            */
            tileZone: Editor.Components.TextFillTileZone
            
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
        
        * @beta
        */
        enum TextFillMode {
            /**
            * @beta
            */
            Solid,
            /**
            * @beta
            */
            Texture
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * @beta
        */
        enum TextFillTileZone {
            /**
            * @beta
            */
            Rect,
            /**
            * @beta
            */
            Extents,
            /**
            * @beta
            */
            Character,
            /**
            * @beta
            */
            Screen
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Canvas}.  @see {@link LensScripting.Canvas}.
        
        * @beta
        */
        enum UnitType {
            /**
            * @beta
            */
            World,
            /**
            * @beta
            */
            Pixels,
            /**
            * @beta
            */
            Points
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * Settings used with {@link Editor.Components.Text}.  @see {@link LensScripting.Text}.
        
        * @beta
        */
        enum VerticalOverflow {
            /**
            * @beta
            */
            Overflow,
            /**
            * @beta
            */
            Truncate,
            /**
            * @beta
            */
            Shrink
        }
    
    }

}

declare namespace Editor {
    namespace Components {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.Visual}.
        
        * @beta
        */
        class Visual extends Editor.Components.Component {
            
            protected constructor()
            
            /**
            * @beta
            */
            renderOrder: number
            
        }
    
    }

}

declare namespace Editor {
    class Compression {
        
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Compression {
        /**
        * Module to zip and unzip files. 
        */
        class Zip {
            
            protected constructor()
            
            /**
            * Pack files into a zip. 
            
            * @beta
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
    
    * @beta
    */
    class ContextAction {
        /**
        * @beta
        */
        constructor()
        
        /**
        * Callback for when the action is executed.
        
        * @beta
        */
        apply: () => void
        
        /**
        * Caption for the action.
        
        * @beta
        */
        caption: string
        
        /**
        * Description for the action.
        
        * @beta
        */
        description: string
        
        /**
        * Section for the action to be in. 
        
        * @beta
        */
        group: string[]
        
        /**
        * Identifier for the caption. 
        
        * @beta
        */
        id: string
        
    }

}

declare namespace Editor {
    class Dock {
        
        protected constructor()
        
    }

}

declare namespace Editor {
    namespace Dock {
        /**
        * Manages the states of Lens Studio panels.
        
        * @beta
        
        * @example
        * ```js
        * import CoreService from 'LensStudio:CoreService';
        * import * as serialization from 'LensStudio:Serialization';
        
        * export class DockManager extends CoreService {
        *     static descriptor() {
        *         return {
        *             id: 'Snap.Test.DockManager',
        *             name: 'DockManager',
        *             description: 'DockManager',
        *             dependencies: [Editor.Dock.IDockManager]
        *         };
        *     }
        
        *     constructor(pluginSystem) {
        *         super(pluginSystem);
        *         this.guards = [];
        *     }
        
        *     start() {
        *         const layoutStr = 'dock:\n' +
        * d: false\n' +
        *             '  main:\n' +
        *             '    items:\n' +
        *             '      - items:\n';
        
        *         // Simply test that reader and writer can be created and used without throwing
        *         let reader = serialization.Yaml.createReader(layoutStr);
        *         const writer = serialization.Yaml.createWriter();
        
        *         const dockManager = this.pluginSystem.findInterface(Editor.Dock.IDockManager);
        *         dockManager.write(writer);
        *         const writtenContent = writer.getString();
        *         reader = serialization.Yaml.createReader(writtenContent);
        *     }
        
        *     stop() {
        *     }
        * }
        * ```
        */
        interface IDockManager extends Editor.IPluginComponent {
            
            
            /**
            * @beta
            */
            activate(panel: IPanelPlugin): void
            
            /**
            * @beta
            */
            add(panel: IPanelPlugin): void
            
            /**
            * @beta
            */
            highlight(panel: IPanelPlugin): void
            
            /**
            * Reads the current state of the DockManager.
            
            * @beta
            */
            read(reader: import('LensStudio:Serialization').IReader): void
            
            /**
            * @beta
            */
            remove(panel: IPanelPlugin): void
            
            /**
            * Writes to the Dock Manager.
            
            * @beta
            */
            write(writer: import('LensStudio:Serialization').IWriter): void
            
            /**
            * @readonly
            
            * @beta
            */
            panels: IPanelPlugin[]
            
        }
    
    }

}

declare namespace Editor {
    /**
    * Component that allows you to check whether Lens Studio is authorized, as well as get authorization. Requires `snap_auth_token` in the `module.json` of your plugin.
    
    * @beta
    */
    interface IAuthorization extends Editor.IPluginComponent {
        
        
        /**
        * Initiate the authorization flow.
        
        * @beta
        */
        authorize(): void
        
        /**
        * Current authorization state.
        
        * @readonly
        
        * @beta
        */
        isAuthorized: boolean
        
        /**
        * Signal that responds to changes in authorization state.
        
        * @readonly
        
        * @beta
        */
        onAuthorizationChange: signal1<boolean, void>
        
    }

}

declare namespace Editor {
    /**
    * An icon to be used in the Editor UI.
    
    * @beta
    
    * @example
    * ```js
    * const pathToIconFromPlugin = import.meta.resolve('icon.svg');
    * Editor.Icon.fromFile(pathToIconFromPlugin);
    * ```
    */
    class Icon {
        
        protected constructor()
        
        /**
        * Creates an icon from an SVG file.
        
        * @beta
        */
        static fromFile(absoluteFilePath: Editor.Path): Editor.Icon
        
        /**
        * Creates an icon from a buffer containing SVG data.
        
        * @beta
        */
        static fromSvgData(buffer: string): Editor.Icon
        
    }

}

declare namespace Editor {
    /**
    * @beta
    */
    class IContext extends ScriptObject {
        
        
    }

}

declare namespace Editor {
    /**
    * A registry of {@link Editor.ContextAction} which will be shown in a contextual menu (i.e. right click).
    
    * @beta
    
    * @example
    * ```js
    * import { CoreService } from 'LensStudio:CoreService';
    
    * export class ContextActionRegistry extends CoreService {
    *     static descriptor() {
    *         return {
    *             id: 'com.example.contextActionRegistry',
    *             name: 'ContextActionRegistry',
    *             description: 'ContextActionRegistry',
    *             dependencies: [Editor.IContextActionRegistry]
    *         };
    *     }
    
    *     constructor(pluginSystem) {
    *         super(pluginSystem);
    *         this.guards = [];
    *     }
    
    *     start() {
    *         const contextActionRegistry = this.pluginSystem.findInterface(Editor.IContextActionRegistry);
    *         this.guards.push(contextActionRegistry.registerAction((context) => {
    *             const action = new Editor.ContextAction();
    *             action.id = 'Test Action Id';
    *             action.caption = 'Test Action Caption';
    *             action.description = 'Test Action Description';
    *             action.group = ['Test Group'];
    *             action.apply = () => {
    *             };
    *             return action;
    *         }));
    *     }
    
    *     stop() {
    *         this.guards = [];
    *     }
    * }
    * ```
    */
    interface IContextActionRegistry extends Editor.IPluginComponent {
        
        /**
        * Adds the `action` to the registry.
        
        * @beta
        */
        registerAction(action: (arg1: Editor.IContext) => Editor): Editor.IGuard
        
    }

}

declare namespace Editor {
    /**
    * Popup window that allows the user to choose specific objects in the Scene hierarchy, or assets in the Asset Browser.
    
    * @beta
    
    * @example
    * ```js 
    * // Get access to the project's model component 
    * const model = this.pluginSystem.findInterface(Editor.IModel); 
    * const project = model.project;  
    
    * // Get access to the picker component 
    * const refPicker = this.pluginSystem.findInterface(Editor.IEntityPicker);  
    
    * // Open a picker  
    * const type = "SceneObject" 
    
    * // or Asset, etc. 
    * refPicker.requestPicker(type, (pickedReplacementUid) => {
    *     console.log(pickedReplacementUid);
    * })  
    
    * // List assets in project 
    * const assetManager = project.assetManager; 
    * assetManager.assets.forEach( asset => {
    *     console.log(asset.id);
    * })  
    
    * // List objects in project's scene 
    * const scene = project.scene; 
    * scene.sceneObjects.forEach( obj => {
    *     console.log(obj.id);
    * })
    * ```
    */
    interface IEntityPicker extends Editor.IPluginComponent {
        
        
        /**
        * @beta
        */
        requestPicker(entityType: string, callback: (arg1: Editor.Model.Entity) => void): void
        
    }

}

declare namespace Editor {
    /**
    * Represents ownership of a resource. 
    * If this object is garbage collected, or `dispose()` method is called – the associated resource is freed.
    
    
    * @beta
    */
    class IGuard extends ScriptObject {
        
        protected constructor()
        
        /**
        * @beta
        */
        dispose(): void
        
    }

}

declare namespace Editor {
    /**
    * @beta
    */
    interface IInstallableContentActions extends Editor.IPluginComponent {
        
        
        /**
        * @beta
        */
        exportScript(scriptAsset: Editor.Assets.ScriptAsset, path: Editor.Path, visibility: Editor.Assets.ScriptTypes.Visibility, externalDependenciesToInclude?: any): void
        
    }

}

declare namespace Editor {
    /**
    * @beta
    */
    interface IInstallableContentRegistry extends Editor.IPluginComponent {
        
        
        /**
        * @beta
        */
        getTypeById(uid: Editor.Uuid, entityBaseType: Editor.Model.EntityBaseType): string
        
        /**
        * @beta
        */
        getTypeByName(name: string, entityBaseType: Editor.Model.EntityBaseType): string
        
        /**
        * @beta
        */
        getTypeByVersion(uid: Editor.Uuid, version: Editor.Assets.Version, entityBaseType: Editor.Model.EntityBaseType): string
        
    }

}

declare namespace Editor {
    class IInterface extends ScriptObject {
        protected constructor()
        
        
    }

}

declare namespace Editor {
    interface InterfaceId {
        
        
    }

}

declare namespace Editor {
    /**
    * @beta
    */
    interface IOverlayManager extends Editor.IPluginComponent {
        
        
        /**
        * @beta
        */
        requestShow(overlayID: string): void
        
    }

}

declare namespace Editor {
    class IPlugin extends Editor.IInterface {

        protected constructor()
        
        
        /**
        * @readonly
        */
        id: string
        
    }

}

declare namespace Editor {
    interface IPluginComponent extends Editor.IInterface {
        
        
    }

}

declare namespace Editor {
    /**
    * The model object is a core concept in the plugin development environment. It serves as a central point for accessing key elements such as the scene, project, and {@link Editor.Model.AssetManager}.  The model object encapsulates the data model representing a Lens Studio project. It brings together environment entities and functionalities that are essential for developing plugins. It plays a role analogous to the "Model" component found in Model-View-Controller architectural patterns, containing both data and business logic.  In order to get the model object, which many key objects are stored within, you need the pluginSystem object which is being passed into the constructor of the plugin class, along with the ID of the model component (which can be accessed through the `Editor` namespace) 
    
    * @example
    * ```js
    * const model = pluginSystem.findInterface(Editor.Model.IModel)
    * const assetManager = model.project.assetManager
    * const scene = model.project.scene
    * ```
    */
    class Model {
        
        protected constructor()
        
        /**
        * @beta
        */
        static IEntityPrototypeRegistry: Editor.InterfaceId
        
        /**
        * @beta
        */
        static IEntityRegistry: Editor.InterfaceId
        
        static IModel: Editor.InterfaceId
        
    }

}

declare namespace Editor {
    namespace Model {
        class AssetContext extends Editor.IContext {
            
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
        
        * @beta
        
        * @example
        * ```js
        * // Get an asset by either finding an already imported one, or importing it.
        * export function findOrCreate(assetManager, absolutePath) {
        *     let meta = assetManager.findImportedCopy(absolutePath);
        *     if (meta) {
        *         return meta.primaryAsset;
        *     }
        
        *     meta = assetManager.importExternalFile(absolutePath);
        *     return meta.primaryAsset;
        * }
        * ```
        
        */
        class AssetImportMetadata extends Editor.Model.Entity {
            
            protected constructor()
            
            /**
            * @beta
            */
            getNativePackageItems(iterateOption: Editor.Model.AssetImportMetadata.PackageIterate): Editor.Model.AssetImportMetadata[]
            
            /**
            * @beta
            */
            setExtraDataItem(key: string, value: string): void
            
            /**
            * A list of all the available assets this handle contains.
            
            * @readonly
            
            * @beta
            */
            assets: Editor.Assets.Asset[]
            
            /**
            * The primary asset of this handle. Usually, this is the asset you will assign after accessing an asset.
            
            * @readonly
            
            * @beta
            */
            primaryAsset: Editor.Assets.Asset
            
            /**
            * The source file where the asset was imported from.
            
            * @readonly
            
            * @beta
            */
            sourcePath: Editor.Path
            
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
            
            protected constructor()
            
            createNativeAsset(assetType: string, baseName: string, relativeDestinationDir: Editor.Path): Editor.Assets.Asset
            
            createPackage(requestedAssets: Editor.Model.AssetImportMetadata[], relativeDestinationDir: Editor.Path, packageName: string, packageOption: Editor.Model.PackageOption): Editor.Model.AssetImportMetadata
            
            exportAssets(requestedAssets: Editor.Model.AssetImportMetadata[], absoluteDestination: Editor.Path): Editor.Model.AssetImportMetadata[]
            
            exportSceneObjects(topLevelSceneObjects: Editor.Model.SceneObject[], absoluteDestination: Editor.Path): Editor.Model.AssetImportMetadata[]
            
            /**
            * Find a copy, if it exists, of a file. 
            */
            findImportedCopy(absoluteSourcePath: Editor.Path): Editor.Model.AssetImportMetadata
            
            getFileMeta(relativeFilePath: Editor.Path): Editor.Model.AssetImportMetadata
            
            importExternalFile(absoluteSourcePath: Editor.Path, relativeDestinationDir: Editor.Path, resultType: Editor.Model.ResultType): Editor.Model.ImportResult
            
            importExternalFileAsync(absoluteSourcePath: Editor.Path, relativeDestinationDir: Editor.Path, resultType: Editor.Model.ResultType): Promise<Editor.Model.ImportResult>
            
            move(fileMeta: Editor.Model.AssetImportMetadata, relativeDestinationDir: Editor.Path): void
            
            remove(relativeFilePath: Editor.Path): void
            
            rename(fileMeta: Editor.Model.AssetImportMetadata, newName: string): void
            
            saveAsPrefab(sceneObject: Editor.Model.SceneObject, relativeDestinationDir: Editor.Path): Editor.Assets.ObjectPrefab
            
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
        class BaseChangesStream extends ScriptObject {
            
            protected constructor()
            
            executeAsGroup(name: string, change: () => void): void
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class ChangesStream extends Editor.Model.BaseChangesStream {
            
            protected constructor()
            
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
        
        * @beta
        */
        class Entity extends ScriptObject {
            
            protected constructor()
            
            /**
            * A list of entities which this entity has a reference to.
            
            * @beta
            */
            getDirectlyReferencedEntities(): Editor.Model.Entity[]
            
            /**
            * A list of entities which has a reference to this entity.
            
            * @beta
            */
            getOwnedEntities(): Editor.Model.Entity[]
            
            /**
            * Swap this entity for another one based on a JSON of the current entity id and the target entity id. 
            
            * @beta
            */
            remapReferences(referenceMapping: object): void
            
            /**
            * The unique id of the entity.
            
            * @readonly
            
            * @beta
            */
            id: Editor.Uuid
            
            /**
            * The entity's type. 
            
            * @readonly
            
            * @beta
            */
            type: string
            
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
        /**
        * @beta
        */
        class EntityPrototypeData {
            /**
            * @beta
            */
            constructor()
            
            /**
            * @beta
            */
            baseEntityType: string
            
            /**
            * @beta
            */
            caption: string
            
            /**
            * @beta
            */
            creator: (any|any)
            
            /**
            * @beta
            */
            entityType: string
            
            /**
            * @beta
            */
            icon: Editor.Icon
            
            /**
            * @beta
            */
            section: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * @beta
        */
        class EntityStructure extends Editor.Model.Entity {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * @beta
        */
        interface IEntityPrototypeRegistry extends Editor.IPluginComponent {
            
            
            /**
            * @beta
            */
            createEntity(entityType: string, context: (Editor.Path|Editor.Model.Entity), callback: (arg1: Editor.Model.Entity) => void): void
            
            /**
            * @beta
            */
            getCaptionForType(type: string): string
            
            /**
            * @beta
            */
            getEntityTypes(baseType: string, filter: (arg1: string) => any): string[]
            
            /**
            * @beta
            */
            getIconForType(type: string): Editor.Icon
            
            /**
            * @beta
            */
            registerEntityPrototype(prototypeData: Editor.Model.EntityPrototypeData): Editor.IGuard
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * A registry of various entities. 
        
        * @beta
        
        * @example
        * ```js
        * // Get a list of abstract entities
        * const entityRegistry = pluginSystem.findInterface(Editor.Model.IEntityRegistry);
        * const abstractFilter = (entityType) => {
        *     return entityRegistry.getMeta(entityType).isAbstract;
        * };
        * ```
        */
        interface IEntityRegistry extends Editor.IPluginComponent {
            
            
            /**
            * Get the metadata of an entity.
            
            * @beta
            */
            getMeta(entityType: string): Editor.Model.Meta
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        interface IModel extends Editor.IPluginComponent {
            
            
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
            project: Editor.Model.Project
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The result of {@link Editor.Model.AssetManager.importExternalFile} and {@link Editor.Model.AssetManager.importExternalFileAsync}.
        */
        class ImportResult {
            
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
        * The layers within a {@link Editor.Model.LayerSet}.
        
        * @beta
        */
        class Layer {
            
            protected constructor()
            
            /**
            * The id of this layer.
            
            * @beta
            */
            id: Editor.Model.LayerId
            
            /**
            * The name of the layer.
            
            * @beta
            */
            name: string
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The id of a {@link Editor.Model.Layer}.
        
        * @beta
        */
        class LayerId {
            /**
            * @beta
            */
            constructor(value: number)
            
            /**
            * @beta
            */
            static forEach(predicate: (arg1: Editor.Model.LayerId) => void): void
            
            /**
            * @beta
            */
            static forEachUser(predicate: (arg1: Editor.Model.LayerId) => void): void
            
            /**
            * The default layer in a Lens.
            
            * @beta
            */
            static Default: Editor.Model.LayerId
            
            /**
            * The maximum user of a layer.
            
            * @beta
            */
            static MaxUser: Editor.Model.LayerId
            
            /**
            * The minimum user of a layer.
            
            * @beta
            */
            static MinUser: Editor.Model.LayerId
            
            /**
            * The layer which is used by the Orthographic camera by default.
            
            * @beta
            */
            static Ortho: Editor.Model.LayerId
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The layers of a {@Editor.Assets.Scene}.
        
        * @beta
        */
        class Layers extends Editor.Model.Entity {
            
            protected constructor()
            
            /**
            * Add `layerId` to this entity.
            
            * @beta
            */
            add(layerId: Editor.Model.LayerId): Editor.Model.Layer
            
            /**
            * Whether the layers contain `layerId`.
            
            * @beta
            */
            contains(layerId: Editor.Model.LayerId): boolean
            
            /**
            * Get the layer with `layerId` if possible.
            
            * @beta
            */
            find(layerId: Editor.Model.LayerId): Editor.Model.Layer | undefined
            
            /**
            * Remove `layerId` from this entity.
            
            * @beta
            */
            remove(layerId: Editor.Model.LayerId): void
            
            /**
            * Check if another layer can be added to this entity.
            
            * @readonly
            
            * @beta
            */
            canAdd: boolean
            
            /**
            * The LayerSet which represents this entity.
            
            * @readonly
            
            * @beta
            */
            combinedIds: Editor.Model.LayerSet
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        /**
        * The same entity as in Lens Scripting.  @see {@link LensScripting.LayerSet}.
        
        * @beta
        */
        class LayerSet {
            
            protected constructor()
            
            /**
            * @beta
            */
            contains(other: Editor.Model.LayerSet): boolean
            
            /**
            * @beta
            */
            except(other: Editor.Model.LayerSet): Editor.Model.LayerSet
            
            /**
            * @beta
            */
            intersect(other: Editor.Model.LayerSet): Editor.Model.LayerSet
            
            /**
            * @beta
            */
            isEmpty(): boolean
            
            /**
            * @beta
            */
            toArray(): Editor.Model.LayerId[]
            
            /**
            * @beta
            */
            union(other: Editor.Model.LayerSet): Editor.Model.LayerSet
            
            /**
            * @beta
            */
            static PredefinedIds(): Editor.Model.LayerSet
            
            /**
            * @beta
            */
            static fromBit(bit: number): Editor.Model.LayerSet
            
            /**
            * @beta
            */
            static fromId(layerId: Editor.Model.LayerId): Editor.Model.LayerSet
            
            /**
            * @beta
            */
            static fromMask(mask: number): Editor.Model.LayerSet
            
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
        /**
        * The metadata of an entity.
        
        * @beta
        */
        class Meta extends ScriptObject {
            
            protected constructor()
            
            /**
            * Whether the entity can be created.
            
            * @readonly
            
            * @beta
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
            
            protected constructor()
            
            /**
            * Sets the `icon` as the Lens' icon.
            */
            setIcon(externalPath: Editor.Path): void
            
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
            
            /**
            * The publicly visible name of the Lens.
            */
            lensName: string
            
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
        
        * @beta
        */
        class Prefabable extends Editor.Model.Entity {
            
            protected constructor()
            
        }
    
    }

}

declare namespace Editor {
    namespace Model {
        class Project extends ScriptObject {
            
            protected constructor()
            
            onEntityAdded(typeName: string): signal1<Editor.Model.Entity, void>
            
            onEntityAdding(typeName: string): signal1<Editor.Model.Entity, void>
            
            onEntityRemoved(typeName: string): signal1<Editor.Uuid, void>
            
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
            history: Editor.Model.ChangesStream
            
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
        
        * @beta
        */
        class SceneObject extends Editor.Model.Prefabable {
            
            protected constructor()
            
            /**
            * Add a scene object as a child of this object at a specified `pos`.
            
            * @beta
            */
            addChildAt(value: Editor.Model.SceneObject, pos?: number): void
            
            /**
            * Add a new {@link Editor.Components.Component} by entityType to this object..
            
            * @beta
            */
            addComponent(entityType: string): Editor.Components.Component
            
            /**
            * Add the component `value` at the specified `pos`.
            
            * @beta
            */
            addComponentAt(value: Editor.Components.Component, pos?: number): void
            
            /**
            * Remove all children from this object.
            
            * @beta
            */
            clearChildren(): void
            
            /**
            * Remove all components from this scene object.
            
            * @beta
            */
            clearComponents(): void
            
            /**
            * @beta
            */
            copy(): Editor.Model.SceneObject
            
            /**
            * Destroy this scene object. All references to it becomes invalid.
            
            * @beta
            */
            destroy(): void
            
            /**
            * Get a specific object at the specified `pos`.
            
            * @beta
            */
            getChildAt(pos: number): Editor.Model.SceneObject
            
            /**
            * Get the number of children on this object.
            
            * @beta
            */
            getChildrenCount(): number
            
            /**
            * Get the component at the specified `pos`.
            
            * @beta
            */
            getComponentAt(pos: number): Editor.Components.Component
            
            /**
            * Get the number of components on this object.
            
            * @beta
            */
            getComponentsCount(): number
            
            /**
            * Get the parent of this scene object.
            
            * @beta
            */
            getParent(): Editor.Model.SceneObject
            
            /**
            * Get the position of a specific object, if the object is a child of this object.
            
            * @beta
            */
            indexOfChild(value: Editor.Model.SceneObject): number | undefined
            
            /**
            * Get the position of a specific component `value` on this object. 
            
            * @beta
            */
            indexOfComponent(value: Editor.Components.Component): number | undefined
            
            /**
            * Move `child` in the order of children on this object.
            
            * @beta
            */
            moveChild(child: Editor.Model.SceneObject, destination: number): void
            
            /**
            * Move the component `value` to a specified `pos`.
            
            * @beta
            */
            moveComponent(origin: number, destination: number): void
            
            /**
            * Remove a child from this from this scene object.
            
            * @beta
            */
            removeChild(child: Editor.Model.SceneObject): void
            
            /**
            * Remove a child at the specified `pos`.
            
            * @beta
            */
            removeChildAt(pos: number): void
            
            /**
            * Remove the first component of `entityType` from this object.
            
            * @beta
            */
            removeComponent(entityType: string): boolean
            
            /**
            * Remove the components at the specified `pos`.
            
            * @beta
            */
            removeComponentAt(pos: number): void
            
            /**
            * Set the child scene object `value` to be at the specified `pos`.
            
            * @beta
            */
            setChildAt(pos: number, value: Editor.Model.SceneObject): void
            
            /**
            * Set the component `value` to be at the specified `pos`.
            
            * @beta
            */
            setComponentAt(pos: number, value: Editor.Components.Component): void
            
            /**
            * Set the parent of this scene object.
            
            * @beta
            */
            setParent(newParent: Editor.Model.SceneObject, position?: number): void
            
            /**
            * A list of scene objects that is a child of this scene object.
            
            * @beta
            */
            children: Editor.Model.SceneObject[]
            
            /**
            * A list of components that is a child of this scene object.
            
            * @beta
            */
            components: Editor.Components.Component[]
            
            /**
            * Whether this scene object is enabled or disabled.
            
            * @beta
            */
            enabled: boolean
            
            /**
            * Whether this scene object contains any component which is of type `Editor.Components.Visual`.
            
            * @readonly
            
            * @beta
            */
            hasVisuals: boolean
            
            /**
            * The layer that this scene object is on.
            
            * @beta
            */
            layer: Editor.Model.LayerId
            
            /**
            * The layerSet this scene object is on.
            
            * @beta
            */
            layers: Editor.Model.LayerSet
            
            /**
            * The transform of this scene object relative to its parent.
            
            * @beta
            */
            localTransform: Editor.Transform
            
            /**
            * The name of the scene object.
            
            * @beta
            */
            name: string
            
            /**
            * @readonly
            
            * @beta
            */
            topOwner: Editor.Assets.ObjectOwner
            
            /**
            * The transform of this scene object relative to the scene its in.
            
            * @beta
            */
            worldTransform: Editor.Transform
            
            /**
            * @beta
            */
            static commonParent(sceneObjects: Editor.Model.SceneObject[]): Editor.Model.SceneObject
            
            /**
            * @beta
            */
            static topLevel(sceneObjects: Editor.Model.SceneObject[]): Editor.Model.SceneObject[]
            
        }
    
    }

}

declare namespace Editor {
    /**
    * A path in the filesystem, or Asset Manager. Useful for things like importing files into Lens Studio through the {@link Editor.Model.AssetManager}. 
    
    * @example
    * ```js
    * // Get access to the project's assetManager
    * const model = this.pluginSystem.findInterface(Editor.Model.IModel);
    * const assetManager = model.project.assetManager;
    
    * // Locate the shader pass we want to import
    * const resourceLoc = import.meta.resolve('Resources/myMesh.ss_graph');
    * const absGraphPath = new Editor.Path(resourceLoc);
    
    * // Import the shader pass
    * const pathInAssetManager = new Editor.Path('');
    * const meta = await assetManager.importExternalFileAsync(absolutePath, pathInAssetManager, Editor.Model.ResultType.Packed);
    * ```
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
    
    * @example
    * ```js
    * import { Preset } from 'LensStudio:Preset';
    
    * export class ObjectPrefabPreset extends Preset {
    *     static descriptor() {
    *         return {
    *             id: 'Com.Snap.ObjectPrefabPreset',
    *             dependencies: [Editor.Model.IModel],
    *             name: 'Object Prefab',
    *             description: '',
    *             icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/ObjectPrefab.svg')),
    *             section: 'General',
    *             entityType: 'ObjectPrefab'
    *         };
    *     }
    *     constructor(pluginSystem) {
    *         super(pluginSystem);
    *     }
    *     create(destination) {
    *         const model = this.pluginSystem.findInterface(Editor.Model.IModel);
    *         const assetManager = model.project.assetManager;
    
    *         const prefab = assetManager.createNativeAsset('ObjectPrefab', 'ObjectPrefab', destination);
    
    *         const object = prefab.addSceneObject(null);
    *         object.name = 'Object Prefab';
    
    *         return prefab;
    *     }
    * }
    * ```
    
    * ```js
    * // Triggering another plugin from a plugin
    * import { MyOtherPluginPreset } from './MyOtherPluginPreset.js';
    * const myOtherPluginPreset = new MyOtherPluginPreset(this.pluginSystem);
    * myOtherPluginResult = await myOtherPluginPreset.createAsync();
    * ```
    
    */
    class PluginSystem extends ScriptObject {
        
        protected constructor()
        
        create(descriptor: IPluginDescriptor): Editor.IPlugin
        
        /**
        * Get various interfaces to the Lens Studio editor, such as its {@link Editor.Model} and {@link Editor.Model.AssetManager}. 
        */
        findInterface(id: Editor.InterfaceId): Editor.IInterface
        
        loadDirectory(directory: Editor.Path): void
        
        unloadDirectory(directory: Editor.Path): void
        
        /**
        * @readonly
        */
        descriptors: IPluginDescriptor[]
        
    }

}

declare namespace Editor {
    /**
    * @beta
    */
    class Point {
        /**
        * @beta
        */
        constructor()
        
        /**
        * @beta
        */
        x: number
        
        /**
        * @beta
        */
        y: number
        
    }

}

declare namespace Editor {
    /**
    * Used with {@link Editor.Components.ScreenTransform}.
    
    * @beta
    */
    class Rect {
        /**
        * @beta
        */
        constructor()
        
        /**
        * @beta
        */
        getCenter(): vec2
        
        /**
        * @beta
        */
        getSize(): vec2
        
        /**
        * @beta
        */
        setCenter(center: vec2): void
        
        /**
        * @beta
        */
        setSize(size: vec2): void
        
        /**
        * @beta
        */
        toVec4(): vec4
        
        /**
        * @beta
        */
        bottom: number
        
        /**
        * @beta
        */
        left: number
        
        /**
        * @beta
        */
        leftBottom: vec2
        
        /**
        * @beta
        */
        right: number
        
        /**
        * @beta
        */
        rightTop: vec2
        
        /**
        * @beta
        */
        top: number
        
        /**
        * @beta
        */
        static create(left: number, right: number, bottom: number, top: number): Editor.Rect
        
        /**
        * @beta
        */
        static fromMinMax(min: vec2, max: vec2): Editor.Rect
        
    }

}

declare namespace Editor {
    /**
    * @beta
    */
    class ScopedConnection extends Editor.IGuard {
        
        protected constructor()
        
        /**
        * @beta
        */
        disconnect(): boolean
        
        /**
        * @readonly
        
        * @beta
        */
        isConnected: boolean
        
    }

}

declare namespace Editor {
    class Shape {
        
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
    
    * @beta
    */
    class Size {
        /**
        * @beta
        */
        constructor(x: number, y: number)
        
        /**
        * @beta
        */
        equal(value: Editor.Size): boolean
        
        /**
        * @beta
        */
        isEmpty(): boolean
        
        /**
        * @beta
        */
        toVec2(): vec2
        
        /**
        * @beta
        */
        x: number
        
        /**
        * @beta
        */
        y: number
        
        /**
        * @beta
        */
        static fromVec2(value: vec2): Editor.Size
        
    }

}

declare namespace Editor {
    /**
    * Used with {@link Editor.Model.SceneObject}.
    
    * @beta
    */
    class Transform {
        /**
        * @beta
        */
        constructor(position: vec3, rotation: vec3, scale: vec3)
        
        /**
        * @beta
        */
        position: vec3
        
        /**
        * @beta
        */
        rotation: vec3
        
        /**
        * @beta
        */
        scale: vec3
        
    }

}

declare namespace Editor {
    /**
    * A unique identifier. Used to identify things like {@link Editor.Model.EntityBaseType} and {@link Editor.IInstallableContentRegistry}
    
    * @beta
    */
    class Uuid {
        
        protected constructor()
        
        /**
        * Returns whether the identifier is valid.
        
        * @beta
        */
        isValid(): boolean
        
        /**
        * Returns the identifier as a string.
        
        * @beta
        */
        toString(): string
        
    }

}

declare class IPanelPlugin extends Editor.IPlugin {
    protected constructor()
    
    
}

declare class IPluginDescriptor extends ScriptObject {
    
    
    /**
    * @readonly
    */
    dependencies: Editor.InterfaceId[]
    
    /**
    * @readonly
    */
    description: string
    
    /**
    * @readonly
    */
    id: string
    
    /**
    * @readonly
    */
    interfaces: Editor.InterfaceId[]
    
    /**
    * @readonly
    */
    name: string
    
}

/**
* @module LensStudio:Analytics
*/
declare module "LensStudio:Analytics" {
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:App`.

* @module LensStudio:App

* @example
* ```js
* import * as app from "LensStudio:App"
* const version = app.version;
* ```
*/
declare module "LensStudio:App" {
    /**
    * A map containing the PATH and PWD environment variables of the current Lens Studio process.
    */
    let env: object
    
    /**
    * The Lens Studio version.
    */
    let version: string
    
}

/**
* @module LensStudio:AssetInstantiator
*/
declare module "LensStudio:AssetInstantiator" {
}

declare module "LensStudio:AssetInstantiator" {
    class AssetInstantiator extends IAssetInstantiator {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        instantiate(asset: Editor.Assets.Asset, scene: Editor.Assets.Scene, target: Editor.Model.SceneObject): Editor.Model.Prefabable[]
        
    }

}

declare module "LensStudio:AssetInstantiator" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        canInstantiate: (arg1: Editor.Assets.Asset) => any
        
    }

}

declare module "LensStudio:AssetInstantiator" {
    class IAssetInstantiator {
        
        protected constructor()
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:AssetLibrary`.

* @module LensStudio:AssetLibrary
*/
declare module "LensStudio:AssetLibrary" {
    let IAssetLibraryProvider: Editor.InterfaceId
    
}

declare module "LensStudio:AssetLibrary" {
    /**
    * A handle for an asset from the Asset Library.
    */
    class Asset {
        
        protected constructor()
        
        /**
        * The id of the asset.
        */
        assetId: string
        
        /**
        * The name of the asset.
        */
        assetName: string
        
        /**
        * The type of the asset.
        */
        assetType: AssetType
        
        /**
        * A handle for the resources contained in the asset that can be downloaded.
        */
        resources: Resource[]
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A filter used to narrow down an AssetListRequest.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetFilter {
        constructor()
        
        categoryId: string
        
        pagination: Pagination
        
        searchText: string
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A request object for finding assets in the Asset Library.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetListRequest {
        constructor(environmentSetting: EnvironmentSetting, assetFilter: AssetFilter)
        
        /**
        * @readonly
        */
        assetFilter: AssetFilter
        
        /**
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
        
        protected constructor()
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A handle to the  {@link "LensStudio:AssetLibrary".AssetListService} which can provide a list of assets based on the passed in parameters.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetListService extends ScriptObject {
        
        protected constructor()
        
        fetch(request: AssetListRequest, onSuccess: (arg1: AssetListSuccess) => void, onFailure: (arg1: ServiceError) => void): void
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The result of a `fetch` call by the {@link "LensStudio:AssetLibrary".AssetListService}, which provides you a list of matching assets in the Asset Library.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class AssetListSuccess {
        
        protected constructor()
        
        assets: Asset[]
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The types of assets that might be provided by the {@link "LensStudio:AssetLibrary"}.
    */
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
    /**
    * The Asset Library environment which assets should be searched within. In most cases `Production` should be used. Used with {@link "LensStudio:AssetLibrary".EnvironmentSetting}.   @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    enum Environment {
        Invalid,
        Production,
        Staging
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A configuration object that describes what Asset Library environment should be accessed.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class EnvironmentSetting {
        constructor()
        
        environment: Environment
        
        space: Space
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * A handle that provides access to the AssetLibraryListService.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    interface IAssetLibraryProvider extends Editor.IPluginComponent {
        
        
        /**
        * @readonly
        */
        service: AssetListService
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * Configuration for the page to be accessed in a {@link "LensStudio:AssetLibrary".AssetFilter}.
    */
    class Pagination {
        
        protected constructor()
        
        /**
        * @readonly
        */
        limit: number
        
        /**
        * @readonly
        */
        offset: number
        
        static singleBatch(offset: number, limit: number): Pagination
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The actual resources of an {@link "LensStudio:AssetLibrary".Asset}.
    */
    class Resource {
        
        protected constructor()
        
        name: string
        
        uri: string
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The callback of an errored `fetch` call by the {@link "LensStudio:AssetLibrary".AssetListService}.  @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    class ServiceError {
        
        protected constructor()
        
        description: string
        
    }

}

declare module "LensStudio:AssetLibrary" {
    /**
    * The Asset Library space which assets should be searched within. In most cases `Public` should be used. Used with {@link "LensStudio:AssetLibrary".EnvironmentSetting}.   @see {@link "LensStudio:AssetLibrary".Asset}.
    */
    enum Space {
        Invalid,
        Internal,
        Public
    }

}

/**
* @module LensStudio:ChatAssistant
*/
declare module "LensStudio:ChatAssistant" {
}

/**
* @module LensStudio:CoreService
*/
declare module "LensStudio:CoreService" {
}

declare module "LensStudio:CoreService" {
    class CoreService extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        start(): void
        
        stop(): void
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

declare module "LensStudio:CoreService" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
    }

}

/**
* @module LensStudio:DialogPlugin
*/
declare module "LensStudio:DialogPlugin" {
}

declare module "LensStudio:DialogPlugin" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        menuActionHierarchy: string[]
        
        toolbarConfig?: import('LensStudio:Ui').ToolbarConfig
        
    }

}

declare module "LensStudio:DialogPlugin" {
    class DialogPlugin extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        show(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Dialog
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* @module LensStudio:EditorPlugin
*/
declare module "LensStudio:EditorPlugin" {
}

declare module "LensStudio:EditorPlugin" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        canEdit: (arg1: Editor.Model.Entity) => any
        
        toolbarConfig?: import('LensStudio:Ui').ToolbarConfig
        
    }

}

declare module "LensStudio:EditorPlugin" {
    class EditorPlugin extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        edit(entities: Editor.Model.Entity[]): boolean
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* Before using anything in this namespace, make sure to import `LensStudio:FileSystem` and add `filesystem` in your plugin's `module.json`.

* @module LensStudio:FileSystem

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
        
        protected constructor()
        
        force: boolean
        
        recursive: boolean
        
    }

}

declare module "LensStudio:FileSystem" {
    /**
    * Used with {@link "LensStudio:FileSystem".CreateDirOptions}.
    */
    class CreateDirOptions {
        
        protected constructor()
        
        recursive: boolean
        
    }

}

declare module "LensStudio:FileSystem" {
    /**
    * Used with {@link "LensStudio:FileSystem".ReadDirOptions}.
    */
    class ReadDirOptions {
        
        protected constructor()
        
        recursive: boolean
        
    }

}

declare module "LensStudio:FileSystem" {
    /**
    * Helper to create temporary directory.
    
    * @example
    * ```js
    * import * as fs from 'LensStudio:FileSystem';
    
    * const resourceName = "resourceName.txt";
    
    * // Create a temporary dir
    * const tempDir = fs.TempDir.create();
    
    * // Create a path that we want to write file to
    * const resourcePath = tempDir.path;
    * resoursePath.append(resourceName);
    
    * // Write to the file
    * fs.writeFile(resourceName, "Hello World");
    * ```
    */
    class TempDir extends ScriptObject {
        
        protected constructor()
        
        /**
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
    class Watcher extends ScriptObject {
        
        protected constructor()
        
        start(): void
        
        stop(): void
        
        /**
        * @readonly
        */
        isWatching: boolean
        
        /**
        * @readonly
        */
        onAdded: signal1<Editor.Path, void>
        
        /**
        * @readonly
        */
        onModified: signal1<Editor.Path, void>
        
        /**
        * @readonly
        */
        onMoved: signal2<Editor.Path, Editor.Path, void>
        
        /**
        * @readonly
        */
        onRemoved: signal1<Editor.Path, void>
        
        /**
        * @readonly
        */
        path: Editor.Path
        
        static create(path: Editor.Path): Watcher
        
    }

}

/**
* @module LensStudio:GuiService
*/
declare module "LensStudio:GuiService" {
}

declare module "LensStudio:GuiService" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
    }

}

declare module "LensStudio:GuiService" {
    class GuiService extends IGuiService {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        start(): void
        
        stop(): void
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

declare module "LensStudio:GuiService" {
    class IGuiService {
        
        protected constructor()
        
    }

}

/**
* @module LensStudio:LensBasedEditorView
*/
declare module "LensStudio:LensBasedEditorView" {
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:ModelUI`.

* @module LensStudio:ModelUi
*/
declare module "LensStudio:ModelUi" {
}

declare module "LensStudio:ModelUi" {
    import {LineEdit} from "LensStudio:Ui" 
    
    class EntityReferencePickerLine extends LineEdit {
        
        protected constructor()
        
        /**
        * @readonly
        */
        onAssetHighlight: signal0<void>
        
        /**
        * @readonly
        */
        onEntityClear: signal0<void>
        
        /**
        * @readonly
        */
        onEntityDrop: signal1<Editor.Model.Entity, void>
        
        /**
        * @readonly
        */
        onEntitySelect: signal0<void>
        
        static create(widget: LineEdit): LineEdit
        static create(assetManager: Editor.Model.AssetManager, entityPrototypeRegistry: Editor.Model.IEntityPrototypeRegistry, entityType: string, widget: import('LensStudio:Ui').Widget): EntityReferencePickerLine
        
    }

}

/**
* @module LensStudio:MultimediaWidgets
*/
declare module "LensStudio:MultimediaWidgets" {
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Network` and add `network` in your plugin's `module.json`. 

* @module LensStudio:Network

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
        constructor()
        
        /**
        * The address of the server.
        */
        address: string
        
        /**
        * The port to connect to.
        */
        port: number
        
    }

}

declare module "LensStudio:Network" {
    class BaseServer extends ScriptObject {
        
        protected constructor()
        
        close(): void
        
        listen(address: Address): boolean
        
        /**
        * @readonly
        */
        address: string
        
        /**
        * @readonly
        */
        onConnect: signal1<import('LensStudio:Network').BaseSocket, void>
        
        /**
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
    class BaseSocket extends ScriptObject {
        
        protected constructor()
        
        close(): void
        
        destroy(): void
        
        /**
        * @readonly
        */
        localAddress: Address
        
        /**
        * @readonly
        */
        onData: signal1<Editor.Buffer, void>
        
        /**
        * @readonly
        */
        onEnd: signal0<void>
        
        /**
        * @readonly
        */
        onError: signal1<number, void>
        
        /**
        * @readonly
        */
        remoteAddress: Address
        
    }

}

declare module "LensStudio:Network" {
    /**
    * @beta
    */
    class FormData {
        /**
        * @beta
        */
        constructor()
        
        /**
        * @beta
        */
        append(body: (Uint8Array|string), headers: object): void
        
    }

}

declare module "LensStudio:Network" {
    /**
    * @beta
    */
    class HttpReply extends ScriptObject {
        
        protected constructor()
        
        /**
        * @readonly
        
        * @beta
        */
        onData: signal1<Editor.Buffer, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onEnd: signal1<import('LensStudio:Network').HttpResponse, void>
        
        /**
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
    
    * @example
    * ```js
    * // Note: reply object needs to be stored (e.g. in `this` object of the plugin) 
    * // in order for the network connection to be maintained.
    * const reply = performHttpRequestWithReply(httpRequest);
    * reply.onData.connect((buffer) => {
    *   console.log('Received data chunk: ' + buffer.toString());
    * });
    * reply.onEnd.connect(response => {
    *   console.log(response.statusCode);
    * });
    * reply.onError.connect(response => {});
    * ```
    */
    class HttpRequest {
        /**
        * @beta
        */
        constructor()
        
        /**
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
        headers: object
        
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
            * @beta
            */
            Get,
            /**
            * @beta
            */
            Post,
            /**
            * @beta
            */
            Put,
            /**
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
        headers: object
        
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
    
    * @example
    * ```js
    * import * as Network from "LensStudio:Network"
    
    * export default class TcpServerManager {
    *   constructor() {
    *     this.server = Network.TcpServer.create()
    *     this.connections = []
    *     this.sockets = []
    *     this.onClientConnected = null
    *     this.onClientDataReceived = null
    *     this.onClientDisconnected = null
    *     this.onClientSocketError = null
    *     this.enableLogging = false
    
    *     // Setup listeners
    *     this.connections.push(
    *       this.server.onConnect.connect(socket => {
    *         //save sockets to the persistent array so they dont get garbage collected
    *         this.sockets.push(socket)
    
    *         if (this.enableLogging) {
    *           console.log(`Incoming connection from ${socket.remoteAddress.address}:${socket.remoteAddress.port}`)
    *         }
    
    *         if (this.onClientConnected) {
    *           this.onClientConnected(socket)
    *         }
    
    *         this.connections.push(
    *           socket.onData.connect(data => {
    *             if (this.enableLogging) {
    *               console.log(`Received data from socket: ${data}`)
    *             }
    
    *             if (this.onClientDataReceived) {
    *               this.onClientDataReceived(data, socket)
    *             }
    *           })
    *         )
    
    *         this.connections.push(
    *           socket.onEnd.connect(() => {
    *             if (this.enableLogging) {
    *               console.log(`Socket connected to ${socket.remoteAddress.address}:${socket.remoteAddress.port} disconnected from the server.`)
    *             }
    
    *             if (this.onClientDisconnected) {
    *               this.onClientDisconnected(socket)
    *             }
    *           })
    *         )
    
    *         this.connections.push(
    *           socket.onError.connect(error => {
    *             if (this.enableLogging) {
    *               logger.logException(`Socket error: ${error}`)
    *             }
    
    *             if (this.onClientSocketError) {
    *               this.onClientSocketError(error, socket)
    *             }
    *           })
    *         )
    *       })
    *     )
    *   }
    
    *   start (address, port) {
    *     const localhostAddr = new Network.Address()
    *     localhostAddr.address = address
    *     localhostAddr.port = port
    *     try {
    *       this.server.listen(localhostAddr)
    *       console.log(`Server started at ${address}:${port}`)
    *     } catch (e) {
    *       console.log("Failed to start the server: " + e)
    *     }
    *   }
    
    *   close (){
    *     // Disconnect all the connections
    *     this.connections.forEach(connection => connection.disconnect())
    *     this.connections = []
    *     // Close the server
    *     this.server.close()
    *   }
    * }
    * ```
    */
    class TcpSocket extends BaseSocket {
        
        protected constructor()
        
        /**
        * Write to the socket.
        */
        write(data: (Uint8Array|string)): number
        
    }

}

/**
* @module LensStudio:OverlayPlugin
*/
declare module "LensStudio:OverlayPlugin" {
}

declare module "LensStudio:OverlayPlugin" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
    }

}

declare module "LensStudio:OverlayPlugin" {
    class OverlayPlugin extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        requestHide(): void
        
        requestShow(): void
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* @module LensStudio:PanelPlugin
*/
declare module "LensStudio:PanelPlugin" {
}

declare module "LensStudio:PanelPlugin" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        defaultDockState: import('LensStudio:Ui').DockState
        
        defaultSize: import('LensStudio:Ui').Size
        
        isUnique: boolean
        
        menuActionHierarchy: string[]
        
        minimumSize: import('LensStudio:Ui').Size
        
        toolbarConfig?: import('LensStudio:Ui').ToolbarConfig
        
    }

}

declare module "LensStudio:PanelPlugin" {
    class PanelPlugin extends IPanelPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* @module LensStudio:PluginVerifier
*/
declare module "LensStudio:PluginVerifier" {
}

declare module "LensStudio:PluginVerifier" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        canVerify: (arg1: IPluginDescriptor) => any
        
    }

}

declare module "LensStudio:PluginVerifier" {
    class PluginVerifier extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        verify(pluginDescriptor: IPluginDescriptor, outputDir: Editor.Path): any
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* @module LensStudio:Preset
*/
declare module "LensStudio:Preset" {
}

declare module "LensStudio:Preset" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        entityType: string
        
        icon: Editor.Icon
        
        section: string
        
    }

}

declare module "LensStudio:Preset" {
    class Preset extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        create(destination: (Editor.Model.SceneObject|Editor.Path)): Editor.Model.Entity
        
        createAsync(destination: (Editor.Model.SceneObject|Editor.Path)): Promise<Editor.Model.Entity>
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* @module LensStudio:ProjectSettingsPlugin
*/
declare module "LensStudio:ProjectSettingsPlugin" {
}

declare module "LensStudio:ProjectSettingsPlugin" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        icon: Editor.Icon
        
        section: string
        
        title: string
        
    }

}

declare module "LensStudio:ProjectSettingsPlugin" {
    class ProjectSettingsPlugin extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        
        setIssues(issues: (import('LensStudio:Ui').ProjectSettings.Error|import('LensStudio:Ui').ProjectSettings.Warning|import('LensStudio:Ui').ProjectSettings.NoIssue)[]): void
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

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
        
        protected constructor()
        
        /**
        * The body of the request.
        */
        body: (Uint8Array|string)
        
        /**
        * The endpoint of the request (e.g. API path).
        */
        endpoint: string
        
        parameters: object
        
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
    class RemoteApiResponse {
        
        protected constructor()
        
        /**
        * @readonly
        */
        body: Editor.Buffer
        
        /**
        * @readonly
        */
        linkedResources: RemoteApiResponse.LinkedResource[]
        
        /**
        * @readonly
        */
        statusCode: number
        
    }

}

declare module "LensStudio:RemoteServiceModule" {
    namespace RemoteApiResponse {
        class LinkedResource {
            
            protected constructor()
            
            /**
            * @readonly
            */
            url: string
            
        }
    
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
    * @beta
    */
    class IReader extends ScriptObject {
        
        protected constructor()
        
    }

}

declare module "LensStudio:Serialization" {
    /**
    * @beta
    */
    class IWriter extends ScriptObject {
        
        protected constructor()
        
        /**
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
        
        protected constructor()
        
        /**
        * @beta
        */
        static createReader(data: string): IReader
        
        /**
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
    export function openUrl(baseUrl: string, queryData: object): boolean
    
    export function showItemInFolder(path: Editor.Path): void
    
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Subprocess` and add `subprocess` in your plugin's `module.json`.

* @module LensStudio:Subprocess

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
*         this.connections.push(this.pythonVersionSubprocess.started.connect(createStartedCallback(myCommand)));
*         this.connections.push(this.pythonVersionSubprocess.stateChanged.connect(createStateChangedCallback(myCommand)));
*         this.connections.push(this.pythonVersionSubprocess.errored.connect(createErrorCallback(myCommand)));
*         this.connections.push(this.pythonVersionSubprocess.exited.connect(createExitCallback(myCommand)));
*         this.connections.push(this.pythonVersionSubprocess.stdout.connect(createStdOutCallback(myCommand)));
*         this.connections.push(this.pythonVersionSubprocess.stderr.connect(createStdErrCallback(myCommand)));

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
*         this.connections = [];

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
        NormalExit,
        CrashExit
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * The process error of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
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
    /**
    * The process state of a {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}. 
    */
    enum ProcessState {
        Idle,
        Starting,
        Running
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * The options of {@link "LensStudio:Subprocess".spawn} or {@link "LensStudio:Subprocess".spawnSync}.  `env`, can be specified as a `{PATH: myPath, PWD: myPwd}` or a JS object. The PATH and PWD fields will override the default value in your environment has when the subprocess is spawned.   You can access the default environment variables from {@link "LensStudio:App"},  where its a constant value that you can retrieve just like `.version`, using `.env`.
    */
    class SpawnOptions {
        
        protected constructor()
        
        cwd: Editor.Path
        
        env: object
        
        timeout: number
        
    }

}

declare module "LensStudio:Subprocess" {
    /**
    * The result of {@link "LensStudio:Subprocess".spawnSync}. 
    */
    class SpawnSyncResult {
        
        protected constructor()
        
        /**
        * @readonly
        */
        exitCode: number
        
        /**
        * @readonly
        */
        stderr: Editor.Buffer
        
        /**
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
    class Writable extends ScriptObject {
        
        protected constructor()
        
        write(data: (Uint8Array|string)): number
        
    }

}

/**
* @module LensStudio:SysInfo
*/
declare module "LensStudio:SysInfo" {
    let productType: string
    
}

/**
* Before using anything in this namespace, make sure to import `LensStudio:Ui`.

* @module LensStudio:Ui
*/
declare module "LensStudio:Ui" {
    export function getUrlString(displayText: string, url: string): string
    
    let IGui: Editor.InterfaceId
    
}

declare module "LensStudio:Ui" {
    class AbstractButton extends Widget {
        
        protected constructor()
        
        setIcon(icon: Editor.Icon): void
        
        setIconSize(w: number, h: number): void
        
        checked: boolean
        
        text: string
        
    }

}

declare module "LensStudio:Ui" {
    class Action extends ScriptObject {
        
        protected constructor()
        
        blockSignals(blocked: boolean): void
        
        checkable: boolean
        
        checked: boolean
        
        icon: Editor.Icon
        
        iconVisibleInMenu: boolean
        
        /**
        * @readonly
        */
        onToggle: signal1<boolean, void>
        
        /**
        * @readonly
        */
        onTrigger: signal1<boolean, void>
        
        text: string
        
        toolTip: string
        
        static create(caption: Widget): Action
        
    }

}

declare module "LensStudio:Ui" {
    enum Alignment {
        Default,
        AlignLeading,
        AlignLeft,
        AlignRight,
        AlignTrailing,
        AlignHCenter,
        AlignJustify,
        AlignAbsolute,
        AlignHorizontal_Mask,
        AlignTop,
        AlignBottom,
        AlignVCenter,
        AlignCenter,
        AlignBaseline,
        AlignVertical_Mask
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
    class BoxLayout extends Layout {
        
        protected constructor()
        
        addLayout(layout: Layout): void
        
        addStretch(stretch: number): void
        
        addWidgetWithStretch(widget: Widget, stretch: number, alignment: Alignment): void
        
        setDirection(direction: Direction): void
        
        static create(): BoxLayout
        
    }

}

declare module "LensStudio:Ui" {
    class CalloutFrame extends Widget {
        
        protected constructor()
        
        static create(widget: Widget): CalloutFrame
        
    }

}

declare module "LensStudio:Ui" {
    class CheckBox extends AbstractButton {
        
        protected constructor()
        
        checkState: CheckState
        
        /**
        * @readonly
        */
        onToggle: signal1<boolean, void>
        
        static create(widget: Widget): CheckBox
        
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
    enum ClearLayoutBehavior {
        DeleteClearedWidgets,
        KeepClearedWidgets
    }

}

declare module "LensStudio:Ui" {
    class ClickableLabel extends Label {
        
        protected constructor()
        
        /**
        * @readonly
        */
        onClick: signal0<void>
        
        static create(widget: Widget): ClickableLabel
        
    }

}

declare module "LensStudio:Ui" {
    class CollapsiblePanel extends Widget {
        
        static create(widget: Widget): Widget;
        protected constructor()
        
        clearContent(): void
        
        expand(value: boolean): void
        
        setContentWidget(widget: Widget): void
        
        customBackgroundRole: BackgroundRole
        
        expandable: boolean
        
        /**
        * @readonly
        */
        onExpand: signal1<boolean, void>
        
        overrideBackgroundRole: boolean
        
        static create(icon: Editor.Icon, text: string, widget: Widget): CollapsiblePanel
        
    }

}

declare module "LensStudio:Ui" {
    class Color {
        constructor()
        
        alpha: number
        
        blue: number
        
        green: number
        
        red: number
        
    }

}

declare module "LensStudio:Ui" {
    class ColorButton extends PushButton {
        
        protected constructor()
        
        setAutoUpdateToolTip(autoUpdateToolTip: boolean): void
        
        alphaEnabled: boolean
        
        /**
        * @readonly
        */
        colorAccepted: signal1<import('LensStudio:Ui').Color, void>
        
        /**
        * @readonly
        */
        colorRejected: signal1<import('LensStudio:Ui').Color, void>
        
        /**
        * @readonly
        */
        colorValueChanged: signal1<import('LensStudio:Ui').Color, void>
        
        currentColor: Color
        
        /**
        * @readonly
        */
        dialogClosed: signal0<void>
        
        /**
        * @readonly
        */
        dialogCreated: signal1<import('LensStudio:Ui').Color, void>
        
        /**
        * @readonly
        */
        isDialogActive: boolean
        
        /**
        * @readonly
        */
        lastAcceptedColor: Color
        
        static create(widget: Widget): ColorButton
        
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
    class ComboBox extends Widget {
        
        protected constructor()
        
        addIconItem(icon: Editor.Icon, text: string): void
        
        addItem(text: string): void
        
        setItemIcon(index: number, icon: Editor.Icon): void
        
        currentText: string
        
        /**
        * @readonly
        */
        onCurrentTextChange: signal1<string, void>
        
        static create(widget: Widget): ComboBox
        
    }

}

declare module "LensStudio:Ui" {
    enum ContextMenuPolicy {
        NoContextMenu,
        DefaultContextMenu,
        ActionsContextMenu,
        CustomContextMenu,
        PreventContextMenu
    }

}

declare module "LensStudio:Ui" {
    class Dialog extends Widget {
        
        protected constructor()
        
        close(): void
        
        show(): void
        
        /**
        * @readonly
        */
        onClose: signal0<void>
        
        static create(widget: Widget): Dialog
        
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
        class Params {
            
            protected constructor()
            
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
    enum DockState {
        Attached,
        Detached
    }

}

declare module "LensStudio:Ui" {
    class DoubleSpinBox extends Widget {
        
        protected constructor()
        
        setRange(min: number, max: number): void
        
        /**
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        singleStep: number
        
        value: number
        
        static create(widget: Widget): DoubleSpinBox
        
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
    class GridLayout extends Layout {
        
        protected constructor()
        
        addLayout(layout: Layout, row: number, column: number, alignment: Alignment): void
        
        addWidgetAt(widget: Widget, row: number, column: number, alignment: Alignment): void
        
        addWidgetWithSpan(widget: Widget, fromRow: number, fromColumn: number, rowSpan: number, columnSpan: number, alignment: Alignment): void
        
        getColumnMinimumWidth(column: number): number
        
        getColumnStretch(column: number): number
        
        getRowMinimumHeight(row: number): number
        
        getRowStretch(row: number): number
        
        setColumnMinimumWidth(column: number, minSize: number): void
        
        setColumnStretch(column: number, stretch: number): void
        
        setRowMinimumHeight(row: number, minSize: number): void
        
        setRowStretch(row: number, stretch: number): void
        
        static create(): GridLayout
        
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
        
        selectFileToSave(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path
        
        selectFilesToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path[]
        
        /**
        * Returns selected path, or an empty path if the dialog was cancelled.
        
        */
        selectFolderToOpen(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path
        
        selectFolderToSave(params: Dialogs.Params, defaultPath: Editor.Path): Editor.Path
        
    }

}

declare module "LensStudio:Ui" {
    interface IGui extends Editor.IPluginComponent {
        
        createDialog(): Dialog
        
        createWidget(): Widget
        
        /**
        * @readonly
        */
        dialogs: IDialogs
        
        /**
        * @readonly
        
        * @beta
        */
        workspaces: IWorkspaceManager
        
    }

}

declare module "LensStudio:Ui" {
    class ImageView extends Widget {
        
        protected constructor()
        
        /**
        * @readonly
        */
        onClick: signal0<void>
        
        /**
        * @readonly
        */
        onHover: signal1<boolean, void>
        
        pixmap: Pixmap
        
        radius: number
        
        responseHover: boolean
        
        scaledContents: boolean
        
        static create(widget: Widget): ImageView
        
    }

}

declare module "LensStudio:Ui" {
    /**
    * @beta
    */
    class IWorkspaceManager extends ScriptObject {
        
        protected constructor()
        
        /**
        * @beta
        */
        create(descriptor: Workspaces.Descriptor): Workspaces.Workspace
        
        /**
        * @beta
        */
        readDescriptor(presetDirPath: Editor.Path): Workspaces.Descriptor | undefined
        
        /**
        * @beta
        */
        register(descriptor: Workspaces.Descriptor): Workspaces.PresetHandle
        
        /**
        * @beta
        */
        unregister(handle: Workspaces.PresetHandle): void
        
        /**
        * @readonly
        
        * @beta
        */
        all: Workspaces.Workspace[]
        
        /**
        * @readonly
        
        * @beta
        */
        onAboutToBeActivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onAboutToBeAdded: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onAboutToBeDeactivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onAboutToBeRemoved: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onActivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onAdded: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onDeactivated: signal1<import('LensStudio:Ui').Workspaces.Workspace, void>
        
        /**
        * @readonly
        
        * @beta
        */
        onRemoved: signal1<import('LensStudio:Ui').Workspaces.Metadata, void>
        
    }

}

declare module "LensStudio:Ui" {
    class Label extends Widget {
        
        protected constructor()
        
        /**
        * @readonly
        */
        onLinkActivate: signal1<string, void>
        
        openExternalLinks: boolean
        
        text: string
        
        wordWrap: boolean
        
        static create(widget: Widget): Label
        
    }

}

declare module "LensStudio:Ui" {
    class Layout extends ScriptObject {
        
        protected constructor()
        
        addWidget(widget: Widget): void
        
        clear(behavior: ClearLayoutBehavior): void
        
        deleteLater(): void
        
        setContentsMargins(left: number, top: number, right: number, bottom: number): void
        
        setLayoutAlignment(layout: Layout, alignment: Alignment): boolean
        
        setWidgetAlignment(widget: Widget, alignment: Alignment): boolean
        
        enabled: boolean
        
        /**
        * @readonly
        */
        isNull: boolean
        
        spacing: number
        
    }

}

declare module "LensStudio:Ui" {
    class LineEdit extends Widget {
        
        protected constructor()
        
        icon: Editor.Icon
        
        /**
        * @readonly
        */
        onTextChange: signal1<string, void>
        
        placeholderText: string
        
        text: string
        
        static create(widget: Widget): LineEdit
        
    }

}

declare module "LensStudio:Ui" {
    class Menu extends Widget {
        
        protected constructor()
        
        addAction(action: Action): void
        
        addMenu(caption: string): Menu
        
        addSeparator(): void
        
        popup(target: Widget): void
        
        static create(parent: Widget): Menu
        
    }

}

declare module "LensStudio:Ui" {
    class Movie extends ScriptObject {
        
        protected constructor()
        
        resize(width: number, height: number): void
        
        height: number
        
        speed: number
        
        width: number
        
        static create(filename: Editor.Path): Movie
        
    }

}

declare module "LensStudio:Ui" {
    class MovieView extends Widget {
        
        protected constructor()
        
        animated: boolean
        
        movie: Movie
        
        /**
        * @readonly
        */
        onClick: signal0<void>
        
        /**
        * @readonly
        */
        onHover: signal1<boolean, void>
        
        responseHover: boolean
        
        scaledContents: boolean
        
        static create(widget: Widget): MovieView
        
    }

}

declare module "LensStudio:Ui" {
    enum Orientation {
        Horizontal,
        Vertical
    }

}

declare module "LensStudio:Ui" {
    class OverflowToolBar extends Widget {
        
        protected constructor()
        
        addStretch(section: Section, stretch: number): void
        
        addWidget(widget: Widget, section: Section, action?: Action): void
        
        static create(widget: Widget): OverflowToolBar
        
    }

}

declare module "LensStudio:Ui" {
    class Pixmap extends ScriptObject {
        
        protected constructor()
        
        crop(rect: Rect): void
        
        load(filename: Editor.Path): void
        
        resize(width: number, height: number): void
        
        save(filename: Editor.Path): void
        
        aspectRatioMode: AspectRatioMode
        
        height: number
        
        transformationMode: TransformationMode
        
        width: number
        
        static create(filename: Editor.Path): Pixmap
        
    }

}

declare module "LensStudio:Ui" {
    class PopupWithArrow extends Widget {
        
        static create(widget: Widget): Widget;
        protected constructor()
        
        close(): void
        
        popup(target: Widget): void
        
        setMainWidget(widget: Widget): void
        
        static create(widget: Widget, arrowPosition: ArrowPosition): PopupWithArrow
        
    }

}

declare module "LensStudio:Ui" {
    class ProgressBar extends Widget {
        
        protected constructor()
        
        setRange(minimum: number, maximum: number): void
        
        maximum: number
        
        minimum: number
        
        value: number
        
        static create(widget: Widget): ProgressBar
        
    }

}

declare module "LensStudio:Ui" {
    class ProgressIndicator extends Widget {
        
        protected constructor()
        
        start(): void
        
        stop(): void
        
        static create(widget: Widget): ProgressIndicator
        
    }

}

declare module "LensStudio:Ui" {
    namespace ProjectSettings {
        class Error {
            constructor(description: string)
            
            description: string
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace ProjectSettings {
        class NoIssue {
            constructor()
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace ProjectSettings {
        class Warning {
            constructor(description: string)
            
            description: string
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    class PushButton extends AbstractButton {
        
        protected constructor()
        
        setIconMode(iconMode: IconMode): void
        
        setIconWithMode(icon: Editor.Icon, iconMode: IconMode): void
        
        /**
        * @readonly
        */
        onClick: signal0<void>
        
        primary: boolean
        
        static create(widget: Widget): PushButton
        
    }

}

declare module "LensStudio:Ui" {
    class RadioButton extends AbstractButton {
        
        protected constructor()
        
        /**
        * @readonly
        */
        onClick: signal0<void>
        
        static create(widget: Widget): RadioButton
        
    }

}

declare module "LensStudio:Ui" {
    class RadioButtonGroup extends Widget {
        
        protected constructor()
        
        addButton(button: AbstractButton, id: number): void
        
        clearSelection(): void
        
        currentIndex: number
        
        /**
        * @readonly
        */
        currentItem: AbstractButton
        
        spacing: number
        
        static create(widget: Widget): RadioButtonGroup
        
    }

}

declare module "LensStudio:Ui" {
    class Rect {
        constructor(x: number, y: number, width: number, height: number)
        
    }

}

declare module "LensStudio:Ui" {
    class SearchLineEdit extends LineEdit {
        
        protected constructor()
        
        static create(widget: Widget): SearchLineEdit
        
    }

}

declare module "LensStudio:Ui" {
    enum Section {
        Left,
        Center,
        Right
    }

}

declare module "LensStudio:Ui" {
    class Separator extends Widget {
        
        protected constructor()
        
        static create(orientation: Orientation, shadow: Shadow, widget: Widget): Separator
        
        static create(widget: Widget): Widget;
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
    class Size {
        constructor(width: number, height: number)
        
        height: number
        
        width: number
        
    }

}

declare module "LensStudio:Ui" {
    namespace SizePolicy {
        enum Policy {
            Fixed,
            Minimum,
            MinimumExpanding,
            Maximum,
            Preferred,
            Expanding,
            Ignored
        }
    
    }

}

declare module "LensStudio:Ui" {
    class Sizes {
        
        protected constructor()
        
        static ButtonDelegateSide: number
        
        static ButtonHeight: number
        
        static ButtonRadius: number
        
        static CheckBoxDrawedDiameter: number
        
        static CheckBoxOutlineWidth: number
        
        static CheckboxFocusPadding: number
        
        static CheckboxPadding: number
        
        static CheckboxRadius: number
        
        static DialogContentMargin: number
        
        static DoublePadding: number
        
        static DragIconSizeHeight: number
        
        static DragIconSizeWidth: number
        
        static ExtentIconSide: number
        
        static HalfPadding: number
        
        static IconSide: number
        
        static InputHeight: number
        
        static InputRadius: number
        
        static MenuItemHeight: number
        
        static MessageBoxIconSide: number
        
        static Padding: number
        
        static PaddingLarge: number
        
        static ProgressBarHeight: number
        
        static RoundedPixmapRadius: number
        
        static SeparatorContentsMargin: number
        
        static SeparatorLineWidth: number
        
        static SizeGripSizeHeight: number
        
        static SizeGripSizeWidth: number
        
        static Spacing: number
        
        static SpinboxButtonHeight: number
        
        static SpinboxButtonWidth: number
        
        static SpinboxDefaultWidth: number
        
        static SplitterHandleWidth: number
        
        static TextEditHeight: number
        
        static ToolButtonPadding: number
        
        static ViewElidingGradientWidth: number
        
        static ViewIndentation: number
        
        static ViewSectionHeight: number
        
    }

}

declare module "LensStudio:Ui" {
    class Slider extends Widget {
        
        protected constructor()
        
        setRange(min: number, max: number): void
        
        /**
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        singleStep: number
        
        value: number
        
        static create(widget: Widget): Slider
        
    }

}

declare module "LensStudio:Ui" {
    class SpinBox extends Widget {
        
        protected constructor()
        
        setRange(min: number, max: number): void
        
        /**
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        step: number
        
        value: number
        
        static create(widget: Widget): SpinBox
        
    }

}

declare module "LensStudio:Ui" {
    class StackedLayout extends Layout {
        
        protected constructor()
        
        addWidgetAt(widget: Widget, index: number): number
        
        currentIndex: number
        
        /**
        * @readonly
        */
        onCurrentChanged: signal1<number, void>
        
        stackingMode: StackingMode
        
        static create(): StackedLayout
        
    }

}

declare module "LensStudio:Ui" {
    class StackedWidget extends Widget {
        
        protected constructor()
        
        addWidget(widget: Widget): number
        
        currentIndex: number
        
        currentWidget: Widget
        
        static create(widget: Widget): StackedWidget
        
    }

}

declare module "LensStudio:Ui" {
    enum StackingMode {
        StackOne,
        StackAll
    }

}

declare module "LensStudio:Ui" {
    class StatusIndicator extends Widget {
        
        protected constructor()
        
        start(): void
        
        stop(): void
        
        text: string
        
        static create(widget: Widget): Widget;
        static create(text: string, widget: Widget): StatusIndicator;
        
    }

}

declare module "LensStudio:Ui" {
    class TabBar extends Widget {
        
        protected constructor()
        
        addTab(text: string): void
        
        setTabIcon(index: number, icon: Editor.Icon): void
        
        currentIndex: number
        
        /**
        * @readonly
        */
        onCurrentChange: signal1<number, void>
        
        static create(widget: Widget): TabBar
        
    }

}

declare module "LensStudio:Ui" {
    class TextEdit extends Widget {
        
        protected constructor()
        
        acceptRichText: boolean
        
        /**
        * @readonly
        */
        onTextChange: signal0<void>
        
        placeholderText: string
        
        plainText: string
        
        static create(widget: Widget): TextEdit
        
    }

}

declare module "LensStudio:Ui" {
    class ToolbarConfig {
        constructor()
        
        caption: string
        
        icon: Editor.Icon
        
        settings: ToolbarSettings
        
    }

}

declare module "LensStudio:Ui" {
    enum ToolbarPosition {
        Right,
        Left
    }

}

declare module "LensStudio:Ui" {
    class ToolbarSettings {
        constructor()
        
        position: ToolbarPosition
        
        primary: boolean
        
        priority: number
        
        showText: boolean
        
    }

}

declare module "LensStudio:Ui" {
    class ToolButton extends AbstractButton {
        
        protected constructor()
        
        setDefaultAction(action: Action): void
        
        checkable: boolean
        
        /**
        * @readonly
        */
        onClick: signal0<void>
        
        static create(parent: Widget): ToolButton
        
    }

}

declare module "LensStudio:Ui" {
    enum TransformationMode {
        FastTransformation,
        SmoothTransformation
    }

}

declare module "LensStudio:Ui" {
    class VerticalScrollArea extends Widget {
        
        protected constructor()
        
        setWidget(widget: Widget): void
        
        /**
        * @readonly
        */
        maximum: number
        
        /**
        * @readonly
        */
        minimum: number
        
        /**
        * @readonly
        */
        onValueChange: signal1<number, void>
        
        value: number
        
        static create(widget: Widget): VerticalScrollArea
        
    }

}

declare module "LensStudio:Ui" {
    class WebEngineView extends Widget {
        
        protected constructor()
        
        load(url: string): void
        
        /**
        * @readonly
        */
        onLoadFinished: signal1<boolean, void>
        
        /**
        * @readonly
        */
        onLoadStarted: signal0<void>
        
        static create(parent: Widget): WebEngineView
        
    }

}

declare module "LensStudio:Ui" {
    class Widget extends ScriptObject {
        
        protected constructor()
        
        activateWindow(): void
        
        adjustSize(): void
        
        blockSignals(blocked: boolean): void
        
        deleteLater(): void
        
        grab(): Pixmap
        
        move(ax: number, ay: number): void
        
        raise(): void
        
        resize(width: number, height: number): void
        
        setContentsMargins(left: number, top: number, right: number, bottom: number): void
        
        setFixedHeight(height: number): void
        
        setFixedWidth(width: number): void
        
        setMaximumHeight(height: number): void
        
        setMaximumWidth(width: number): void
        
        setMinimumHeight(height: number): void
        
        setMinimumWidth(width: number): void
        
        setSizePolicy(horizontal: SizePolicy.Policy, vertical: SizePolicy.Policy): void
        
        autoFillBackground: boolean
        
        backgroundRole: ColorRole
        
        contextMenuPolicy: ContextMenuPolicy
        
        /**
        * @readonly
        */
        devicePixelRatio: number
        
        enabled: boolean
        
        fontRole: FontRole
        
        foregroundRole: ColorRole
        
        /**
        * @readonly
        */
        height: number
        
        hidden: boolean
        
        /**
        * @readonly
        */
        isNull: boolean
        
        layout: Layout
        
        /**
        * @readonly
        */
        onHide: signal0<void>
        
        /**
        * @readonly
        */
        onResize: signal2<number, number, void>
        
        /**
        * @readonly
        */
        onShow: signal0<void>
        
        toolTip: string
        
        visible: boolean
        
        /**
        * @readonly
        */
        width: number
        
        windowTitle: string
        
        static create(widget: Widget): Widget
        
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * @beta
        */
        class Descriptor {
            /**
            * @beta
            */
            constructor()
            
            /**
            * @beta
            */
            layoutReader: import('LensStudio:Serialization').IReader
            
            /**
            * @beta
            */
            metadata: Workspaces.Metadata
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * @beta
        */
        class Metadata {
            /**
            * @beta
            */
            constructor()
            
            /**
            * @beta
            */
            icon: Editor.Icon
            
            /**
            * @beta
            */
            name: string
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * @beta
        */
        class PresetHandle {
            
            protected constructor()
            
        }
    
    }

}

declare module "LensStudio:Ui" {
    namespace Workspaces {
        /**
        * @beta
        */
        class Workspace extends ScriptObject {
            
            protected constructor()
            
            /**
            * @readonly
            
            * @beta
            */
            dockManager: Editor.Dock.IDockManager
            
            /**
            * @readonly
            
            * @beta
            */
            metadata: Workspaces.Metadata
            
        }
    
    }

}

/**
* @module LensStudio:UriHandlerPlugin
*/
declare module "LensStudio:UriHandlerPlugin" {
}

declare module "LensStudio:UriHandlerPlugin" {
    class Descriptor extends BaseDescriptor {
        constructor()
        
        canHandle: (arg1: string) => any
        
    }

}

declare module "LensStudio:UriHandlerPlugin" {
    class UriHandlerPlugin extends Editor.IPlugin {
        constructor(pluginSystem: Editor.PluginSystem, descriptor?: Descriptor)
        
        handle(uri: string): boolean
        
        /**
        * @readonly
        */
        pluginSystem: Editor.PluginSystem
        
    }

}

/**
* @module LensStudio:WebSocket
*/
declare module "LensStudio:WebSocket" {
}

declare module "LensStudio:WebSocket" {
    import {BaseSocket} from "LensStudio:Network" 
    
    class WebSocket extends BaseSocket {
        
        protected constructor()
        
        send(data: (Uint8Array|string)): number
        
    }

}

declare module "LensStudio:WebSocket" {
    import {BaseServer} from "LensStudio:Network" 
    
    class WebSocketServer extends BaseServer {
        
        protected constructor()
        
        static create(): WebSocketServer
        
    }

}

declare class ScriptObject {
    
    protected constructor()
    
    getTypeName(): string
    
    isOfType(type: string): boolean
    
    isSame(other: ScriptObject): boolean
    
}

/**
* Provides encrypted storage for each plugin module's sensitive data, like access tokens. It uses Keychain on macOS and Credentials Manager on Windows. The data can be stored and retrieved as string-to-string key value pairs via a global secureLocalStorage object. Data for each plugin module (module.json) is kept separate from all others. There is a 2KB limit on the string size because this is meant for small pieces of secure info rather than a generic container.

* @example
* ```js
* secureLocalStorage.setItem('myLoginPassword', 'myPassword');
* console.log("My stored password is: " + secureLocalStorage.getItem('myLoginPassword'));
* secureLocalStorage.removeItem('myLoginPassword');
* console.log("My stored password is: " + secureLocalStorage.getItem('myLoginPassword'));
* ```
*/
declare class SecureLocalStorage extends ScriptObject {
    
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

declare class Task {
    
    protected constructor()
    
}

declare class TextEncoder extends ScriptObject {
    constructor()
    
    encode(value: string): Uint8Array
    
    encodeInto(value: string, result: Uint8Array): void
    
    /**
    * @readonly
    */
    encoding: string
    
}

/**
* A handle for a timer. You can create a timeout using {@link setTimeout}.
*/
declare class Timeout extends ScriptObject {
    
    protected constructor()
    
}

/**
* @beta
*/
declare class TypeScriptAsset extends Editor.Assets.ScriptAsset {
    
    protected constructor()
    
}

/**
 * @module LensStudio:AssetUtils.js
 */
declare module "LensStudio:AssetUtils.js" {
export enum ShaderGraphType {
    ShaderGraphImage = 0,
    ShaderGraphUberPbr = 1,
    ShaderGraphUnlit = 2,
    ShaderGraphOccluder = 3,
    ShaderGraphGltf = 4
}
/**
 * Retrieves the resource file absolute path for the specified asset type.
 *
 * @param assetType - The type of the asset, use ShaderGraphType enum.
 * @returns The absolute path of the resource file.
 */
export function getResourceFile(assetType: ShaderGraphType): Editor.Path;
/**
 * Finds or creates an asset in the asset manager.
 *
 * @param assetManager - The asset manager instance.
 * @param assetAbsPath - The absolute path of the asset.
 * @param destDirInProject - The destination directory in the project. this is a relative path to the project Assets root.
 * @returns The primary asset found or created.
 * @throws Error if there is an error importing the asset or if the import result is invalid.
 */
export function findOrCreateNonNativeAsset(assetManager: Editor.Model.AssetManager, assetAbsPath: Editor.Path, destDirInProject: Editor.Path): Promise<Editor.Assets.Asset>;
/**
 * Finds or creates a native asset with the specified name.
 *
 * @param nativeAssetTypeName - The name of the native asset.
 * @param assetManager - The asset manager.
 * @param basename - The base name of the asset.
 * @param destinationDir - the relative path to Assets root in the project, if searching will be limited to this directory,
 * and the asset will be created in this directory if not found. If not provided, the search will be done in the entire
 * project and the creation will be in the root directory.
 * @returns The found or created native asset.
 */
export function findOrCreateNativeAsset(nativeAssetTypeName: string, assetManager: Editor.Model.AssetManager, basename: string, destinationDir?: Editor.Path): Editor.Assets.Asset;
/**
 * Finds an asset in the asset manager based on the specified type, name, and optional parent directory.
 *
 * @param assetManager
 * @param assetType - The type of the asset to find.
 * @param assetName - The name of the asset to find.
 * @param parentDir - (Optional) The parent directory of the asset. If provided, the asset's source path must match this directory.
 * @returns An array of assets that match the specified criteria.
 */
export function findAsset(assetManager: Editor.Model.AssetManager, assetType: string, assetName: string, parentDir?: Editor.Path): Editor.Assets.Asset[];
/**
 * Finds or creates an object tracking texture asset.
 *
 * @param assetManager - The asset manager to search for or create the asset.
 * @param destination - The destination path for the asset.
 * @param type - The type of the object tracking texture.
 * @returns The found or created object tracking texture asset.
 */
export function findOrCreateObjectTrackingTexture(assetManager: Editor.Model.AssetManager, destination: Editor.Path, type: Editor.Assets.ObjectTrackingTextureType): Editor.Assets.Asset;
/**
 * Finds or creates a screen texture asset.
 *
 * @param assetManager - The asset manager to use.
 * @param destination - The destination path for the asset.
 * @returns The screen texture asset.
 */
export function findOrCreateScreenTexture(assetManager: Editor.Model.AssetManager, destination: Editor.Path): Editor.Assets.Asset;
/**
 * Creates a material from a shader graph asset.
 *
 * @param assetManager - The asset manager used to create the material.
 * @param graphType - The type of the shader graph asset.
 * @param materialDir - The directory where the material will be created. Default is an empty string.
 * @param materialName - The name of the material. Default is 'new material'.
 * @param shaderGraphDir - The directory of the shader graph asset. Default is an empty string.
 * @returns An object containing the created material asset, the shader graph asset, and the pass on the material.
 */
export function createMaterialFromGraph(assetManager: Editor.Model.AssetManager, graphType: ShaderGraphType, materialDir?: string, materialName?: string, shaderGraphDir?: string): Promise<{
    material: Editor.Assets.Material;
    shaderGraphAsset: Editor.Assets.Pass;
    passInfo: Editor.Assets.PassInfo;
}>;
/**
 * Adds a pass to the given material and optionally adds define strings to the pass.
 *
 * @param material - The material to which the pass will be added.
 * @param pass - The pass to be added to the material.
 * @param addDefineStrings - An optional array of define strings to be added to the pass. Defaults to ['ENABLE_BASE_TEX'].
 * @returns The pass information after adding the pass and define strings.
 */
export function addGraphToMaterial(material: Editor.Assets.Material, pass: Editor.Assets.Pass, addDefineStrings?: string[]): Editor.Assets.PassInfo;
/**
 * Imports an image as a texture and sets up its wrap mode.
 *
 * @param assetManager
 * @param imageFileAbsolutePath - The absolute path to the image file.
 * @param wrapMode - The wrap mode for the texture. Defaults to `Editor.Assets.WrapMode.ClampToEdge`.
 * @param imageImportDestinationDir - The directory where the image will be imported. Defaults to "Images".
 * @returns An object containing the image asset and texture parameter.
 *
 * @throws Will log an error if the image asset fails to load.
 */
export function importImageAsTexture(assetManager: Editor.Model.AssetManager, imageFileAbsolutePath: string, wrapMode?: Editor.Assets.WrapMode, imageImportDestinationDir?: string): Promise<{
    imageAsset: Editor.Assets.Asset;
    textureParam: Editor.Assets.TextureParameter;
}>;
/**
 * Add a define to the pass info's defines array.
 * @param passInfo - The pass info object to modify.
 * @param define - The define string to add.
 */
export function addDefine(passInfo: Editor.Assets.PassInfo, define: string): void;
/**
 * Set up the wrap mode for a sampler. If only one wrap mode is provided, it's applied to all dimensions.
 * @param sampler - The sampler to modify.
 * @param wrapModeU - The wrap mode for U dimension.
 * @param wrapModeV - The wrap mode for V dimension. If not provided, uses wrapModeU.
 * @param wrapModeW - The wrap mode for W dimension. If not provided, uses wrapModeU.
 * @returns The modified sampler.
 */
export function setupSamplerWrapMode(sampler: Editor.Assets.Sampler, wrapModeU: Editor.Assets.WrapMode, wrapModeV?: Editor.Assets.WrapMode, wrapModeW?: Editor.Assets.WrapMode): Editor.Assets.Sampler;

}
/**
 * @module LensStudio:GeneralUtils.js
 */
declare module "LensStudio:GeneralUtils.js" {
/**
 * Converts a callback-based function to a Promise-based function.
 * @param fn The callback-based function to convert.
 * @returns A Promise-based version of the function.
 */
export function promisify<T>(fn: (callback: (err: Error | null, result?: T) => void) => void): Promise<T>;

}
/**
 * @module LensStudio:HierarchyUtils.js
 */
declare module "LensStudio:HierarchyUtils.js" {
/**
 * Represents the options for creating a scene object.
 */
export interface CreateOptions {
    /**
     * The scene in which the object will be created.
     */
    scene: Editor.Assets.Scene;
    /**
     * The parent object under which the new object will be created.
     */
    parent: Editor.Model.SceneObject;
    /**
     * The type(s) of component(s) to be attached to the new object.
     * if null, no component will be attached.
     */
    componentType: string | string[] | null;
    /**
     * The name of the new object
     */
    name: string;
}
/**
 * Represents the options for searching.
 */
export interface SearchOptions {
    /**
     * The maximum depth to search. 1 means only the immediate children of the base object.
     */
    maxDepth?: number;
    /**
     * Indicates whether to find all matches or stop at the first match.
     */
    findAll?: boolean;
    /**
     * Indicates whether to create the item if it is not found.
     */
    createIfNotFound?: boolean;
    /**
     * The options for creating the item.
     */
    createOptions?: CreateOptions;
}
/**
 * Finds a scene object or an array of scene objects in the ancestors of a given base scene object by the specified component type.
 *
 * @param base - The base scene object from which to start the search.
 * @param componentType - The type of component to search for.
 * @param options - Optional search options.
 * @param options.maxDepth - The maximum depth to search. Default is 100.
 * @param options.findAll - Whether to find all matches. Default is false.
 * @param options.createIfNotFound - Whether to create if not found. Default is false.
 * @param options.createOptions - Options for creation if needed.
 * @returns An array of found scene objects, or null if not found.
 */
export function findInAncestorsByType(base: Editor.Model.SceneObject, componentType: string, options?: SearchOptions): Editor.Model.SceneObject[];
/**
 * Finds a scene object or an array of scene objects within the descendants of a base scene object, based on the specified component type.
 *
 * @param base - The base scene object or scene to search within.
 * @param componentType - The type of component to search for.
 * @param options - Optional search options.
 * @returns an array of found scene objects, or null if not found.
 */
export function findInDescendantsByType(base: Editor.Model.SceneObject | Editor.Assets.Scene, componentType: string, options?: SearchOptions): Editor.Model.SceneObject[];
/**
 * Finds a scene object with the specified name in the ancestors of the given base scene object.
 *
 * @param base - The base scene object from which to start the search.
 * @param name - The name of the scene object to find. Only exact matches are considered.
 * @param options - The search options.
 * @returns The found scene object if `findAll` is `false`, an array of found scene objects if `findAll` is `true`, or `null` if no scene object is found.
 */
export function findInAncestorsByName(base: Editor.Model.SceneObject, name: string, options?: SearchOptions): Editor.Model.SceneObject[];
/**
 * Finds a scene object or an array of scene objects in the descendants of a base scene object by name.
 *
 * @param base - The base scene object to search in.
 * @param name - The name of the scene object(s) to find. Only exact matches are considered.
 * @param options - Optional search options.
 * @param options.maxDepth - The maximum depth to search. 1 means only the immediate children of the base object. Default is 100.
 * @param options.findAll - Indicates whether to find all matches or stop at the first match. Default is false.
 * @param options.createIfNotFound - Indicates whether to create the item if it is not found. Default is false.
 * @param options.createOptions - The options for creating the item. Default is null.
 *
 *
 * @returns an array of found scene objects, or null if not found.
 */
export function findInDescendantsByName(base: Editor.Model.SceneObject | Editor.Assets.Scene, name: string, options?: SearchOptions): Editor.Model.SceneObject[];
/**
 * Finds objects of a specific component type in the root of a scene.
 *
 * @param scene - The scene to search in.
 * @param componentType - The type of component to search for.
 * @param options - Additional search options.
 * @returns an array of found scene objects, or null if not found.
 */
export function findInRootObjectsByType(scene: Editor.Assets.Scene, componentType: string, options?: SearchOptions): Editor.Model.SceneObject[];
/**
 * Finds a scene object or an array of scene objects in the root objects of a scene by name.
 *
 * @param scene - The scene to search in.
 * @param name - The name of the scene object(s) to find. Only exact matches are considered.
 * @param options - The search options.
 * @returns an array of found scene objects, or null if not found.
 */
export function findInRootObjectsByName(scene: Editor.Assets.Scene, name: string, options?: SearchOptions): Editor.Model.SceneObject[];
/**
 * Finds or creates a child scene object with the specified name under the given root object.
 * It only searches the immediate children of the root object.
 * If a child object with the specified name already exists, it is returned.
 * Otherwise, a new scene object is created, added to the scene, and assigned the specified name.
 *
 * @param rootObject - The root object under which to search for or create the child object.
 * @param name - The name of the child object to find or create. Only exact matches are considered.
 * @param scene - The scene in which to add the new scene object if it needs to be created.
 * @returns The found or created child scene object.
 */
export function findOrCreateChildWithName(rootObject: Editor.Model.SceneObject, name: string, scene: Editor.Assets.Scene): Editor.Model.SceneObject;
/**
 * Finds the nearest camera in the ancestors of the given scene object.
 *
 * @param baseSceneObject - The scene object from which to start the search.
 * @param cameraType - The type of camera to search for (e.g., Orthographic, Perspective). Use null for any type.
 * @param maxDepth - Maximum search depth. Default is 1000.
 * @returns The nearest matching camera or null.
 */
export function findNearestCameraInAncestors(baseSceneObject: Editor.Model.SceneObject, cameraType?: Editor.Components.CameraType, maxDepth?: number): Editor.Model.SceneObject;
/**
 * Finds the nearest camera ancestor of a scene object, if one exists.
 * if not, it returns the first camera in the scene.
 *
 * @param sceneObject - The scene object to search for orthographic camera ancestors.
 * @param cameraType - The type of camera to search for, or null to find any camera.
 * @returns The nearest camera ancestor of the scene object, or null if none is found.
 */
export function getNearestOrFirstCamera(sceneObject: Editor.Model.SceneObject, scene: Editor.Assets.Scene, cameraType?: Editor.Components.CameraType): Editor.Model.SceneObject;
/**
 * Finds the first camera in the scene.
 *
 * @param cameraType - The type of camera to search for, or null to find any camera.
 * @returns The first camera in the scene model, or null if none is found.
 */
export function getFirstCameraInScene(scene: Editor.Assets.Scene, cameraType?: Editor.Components.CameraType): Editor.Model.SceneObject;
/**
 * Retrieves or creates a canvas component for a given camera object.
 *
 * @param cameraObject - The camera object to retrieve or create the canvas component for.
 * @param unitType - The unit type for the canvas component.
 * @returns The canvas component associated with the camera object.
 */
export function getOrCreateCanvas(cameraObject: Editor.Model.SceneObject, unitType: Editor.Components.UnitType): Editor.Components.Canvas;
/**
 * Retrieves or creates a ScreenRegionComponent for a given camera object and scene.
 *
 * @param cameraObject - The camera object to search for a ScreenRegionComponent.
 * @param scene - The scene in which to create the ScreenRegionComponent if it doesn't exist.
 * @returns The ScreenRegionComponent associated with the camera object, or a newly created one.
 */
export function getOrCreateScreenRegion(cameraObject: Editor.Model.SceneObject, scene: Editor.Assets.Scene): Editor.Components.ScreenRegionComponent;
/**
 * Creates an orthographic camera component on a scene object.
 *
 * @param scene - The scene in which the camera will be created.
 * @param sceneObject - The scene object on which the camera component will be added.
 * @param unitType - The unit type for the canvas component (optional, default is `Editor.Components.UnitType.Points`).
 * @returns The modified scene object with the added camera and canvas components.
 */
export function createOrthoCameraOnObject(scene: Editor.Assets.Scene, sceneObject: Editor.Model.SceneObject, unitType?: Editor.Components.UnitType, renderLayer?: Editor.Model.LayerId): Editor.Model.SceneObject;
/**
 * Creates a perspective camera on the specified scene object.
 *
 * @param scene - The scene in which the camera will be created.
 * @param sceneObject - The scene object on which the camera will be added.
 * @returns The modified scene object with the added camera component.
 */
export function createPerspectiveCameraOnObject(scene: Editor.Assets.Scene, sceneObject: Editor.Model.SceneObject, renderLayer?: Editor.Model.LayerId): Editor.Model.SceneObject;
/**
 * Finds or creates an orthographic camera for a given scene object.
 *
 * @param scene - The scene in which the camera will be created or searched.
 * @param sceneObject - The scene object for which the camera will be created or searched.
 * @param canvasUnitType - The unit type for the canvas component of the camera. Defaults to `Editor.Components.UnitType.Points`.
 * @returns An object containing the camera object, screen region component, and canvas component.
 */
export function findOrCreateOrthoCameraForObject(scene: Editor.Assets.Scene, sceneObject: Editor.Model.SceneObject, canvasUnitType?: Editor.Components.UnitType): {
    cameraObject: Editor.Model.SceneObject;
    screenRegionComponent: Editor.Components.ScreenRegionComponent;
    canvasComponent: Editor.Components.Canvas;
};
/**
 * Finds or creates a camera object of the specified type within the given scene.
 *
 * @param scene - The scene in which to find or create the camera object.
 * @param cameraType - The type of camera to find or create (Orthographic or Perspective).
 * @param bearerSceneObject - Optional. The scene object to which the new camera will be attached if created.
 * @returns The scene object containing the camera of the specified type.
 * @throws Will throw an error if the camera type is invalid.
 */
export function findOrCreateCameraObject(scene: Editor.Assets.Scene, cameraType: Editor.Components.CameraType, bearerSceneObject?: Editor.Model.SceneObject): Editor.Model.SceneObject;

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
 * The following classes are the same as the ones in Lens Scripting. 
 * They are provided here for convenience as they can be used in Editor Scripting.
*/


/**
* A two dimensional vector.
* Vectors can only store finite numbers in the range Number.MIN_VALUE to Number.MAX_VALUE.

*/
declare class vec2 {
    /**
    * Creates a new instance of a vec2.
    */
    constructor(x: number, y: number)
    
    /**
    * Returns a string representation of the vector.
    */
    toString(): string
    
    /**
    * Returns the vector plus `vec`.
    */
    add(vec: vec2): vec2
    
    /**
    * Returns the vector minus `vec`.
    */
    sub(vec: vec2): vec2
    
    /**
    * Returns the component-wise multiplication product of the vector and `vec`.
    */
    mult(vec: vec2): vec2
    
    /**
    * Returns the component-wise multiplication product of the vector and `vec`.
    */
    scale(vec: vec2): vec2
    
    /**
    * Returns the division of the vector by the vector `vec`.
    */
    div(vec: vec2): vec2
    
    /**
    * Multiplies the components by the number `scale`.
    */
    uniformScale(scale: number): vec2
    
    /**
    * Returns whether this is equal to `vec`.
    */
    equal(vec: vec2): boolean
    
    /**
    * Returns a copy of the vector with its length clamped to `length`.
    */
    clampLength(length: number): vec2
    
    /**
    * Returns a copy of the vector with its length scaled to 1.
    */
    normalize(): vec2
    
    /**
    * Returns the angle between the vector and `vec`.
    */
    angleTo(vec: vec2): number
    
    /**
    * Returns the distance between the vector and the vector `vec`.
    */
    distance(vec: vec2): number
    
    /**
    * Like `distance()`, but returns the squared distance between vectors.
    */
    distanceSquared(vec: vec2): number
    
    /**
    * Returns the dot product of the vector and `vec`.
    */
    dot(vec: vec2): number
    
    /**
    * Returns a copy of the vector moved towards the point `point` by the amount `magnitude`.
    */
    moveTowards(point: vec2, magnitude: number): vec2
    
    /**
    * Returns a copy of the vector projected onto the vector `vec`.
    */
    project(vec: vec2): vec2
    
    /**
    * Projects the vector onto the plane represented by the normal `normal`.
    */
    projectOnPlane(normal: vec2): vec2
    
    /**
    * Returns a copy of the vector reflected across the plane defined by the normal `vec`.
    */
    reflect(vec: vec2): vec2
    
    /**
    * x component of the vec2.
    */
    x: number
    
    /**
    * y component of the vec2.
    */
    y: number
    
    /**
    * Alternate name for the x component.
    */
    r: number
    
    /**
    * Alternate name for the y component.
    */
    g: number
    
    /**
    * Returns the length of the vector.
    */
    length: number
    
    /**
    * Returns the squared length of the vector.
    */
    lengthSquared: number
    
}
declare namespace vec2 {
    /**
    * Returns a new vector containing the largest value of each component in the two vectors.
    */
    export function max(vecA: vec2, vecB: vec2): vec2
    
    /**
    * Returns a new vector containing the smallest value of each component in the two vectors.
    */
    export function min(vecA: vec2, vecB: vec2): vec2
    
    /**
    * Linearly interpolates between the two vectors `vecA` and `vecB` by the factor `t`.
    */
    export function lerp(vecA: vec2, vecB: vec2, t: number): vec2
    
    /**
    * Returns the vector (1, 1).
    */
    export function one(): vec2
    
    /**
    * Returns the vector (0, 0).
    */
    export function zero(): vec2
    
    /**
    * Returns the vector (0, 1).
    */
    export function up(): vec2
    
    /**
    * Returns the vector (0, -1).
    */
    export function down(): vec2
    
    /**
    * Returns the vector (-1, 0).
    */
    export function left(): vec2
    
    /**
    * Returns the vector (1, 0).
    */
    export function right(): vec2
    
    /**
    * Generate a random 2D direction vector. This is equivalent to a random point on a unit-radius circle.
    */
    export function randomDirection(): vec2
    

}

/**
* A three dimensional vector. 
* Vectors can only store finite numbers in the range Number.MIN_VALUE to Number.MAX_VALUE.

*/
declare class vec3 {
    /**
    * Creates a new instance of a vec3.
    */
    constructor(x: number, y: number, z: number)
    
    /**
    * Returns a string representation of the vector.
    */
    toString(): string
    
    /**
    * Returns the cross product of the vector and `vec`
    */
    cross(vec: vec3): vec3
    
    /**
    * Returns a copy of the vector rotated towards the `target` vector by `step` radians.
    
    * The vectors may be non-normalized. The function always returns a vector with the source vector's magnitude.
    * This prevents overshoot. If `step` exceeds the angle between vectors, it stops at the `target` direction.
    * If `step` is negative, this rotates the source vector away from `target`. It stops when the direction is precisely opposite to `target`.
    * If the vectors are in opposite directions, the result is rotated along an arbitrary (but consistent) axis.
    * If either vector is zero magnitude, it returns the source vector.
    
    */
    rotateTowards(target: vec3, step: number): vec3
    
    /**
    * Returns the vector plus `vec`.
    */
    add(vec: vec3): vec3
    
    /**
    * Returns the vector minus `vec`.
    */
    sub(vec: vec3): vec3
    
    /**
    * Returns the component-wise multiplication product of the vector and `vec`.
    */
    mult(vec: vec3): vec3
    
    /**
    * Returns the component-wise multiplication product of the vector and `vec`.
    */
    scale(vec: vec3): vec3
    
    /**
    * Returns the division of the vector by the vector `vec`.
    */
    div(vec: vec3): vec3
    
    /**
    * Multiplies the components by the number `scale`.
    */
    uniformScale(scale: number): vec3
    
    /**
    * Returns whether this is equal to `vec`.
    */
    equal(vec: vec3): boolean
    
    /**
    * Returns a copy of the vector with its length clamped to `length`.
    */
    clampLength(length: number): vec3
    
    /**
    * Returns a copy of the vector with its length scaled to 1.
    */
    normalize(): vec3
    
    /**
    * Returns the angle in radians between the vector and `vec`.
    */
    angleTo(vec: vec3): number
    
    /**
    * Returns the distance between the vector and the vector `vec`.
    */
    distance(vec: vec3): number
    
    /**
    * Like `distance()`, but returns the squared distance between vectors.
    */
    distanceSquared(vec: vec3): number
    
    /**
    * Returns the dot product of the vector and `vec`.
    */
    dot(vec: vec3): number
    
    /**
    * Returns a copy of the vector moved towards the point `point` by the amount `magnitude`.
    */
    moveTowards(point: vec3, magnitude: number): vec3
    
    /**
    * Returns a copy of the vector projected onto the vector `vec`.
    */
    project(vec: vec3): vec3
    
    /**
    * Projects the vector onto the plane represented by the normal `normal`.
    */
    projectOnPlane(normal: vec3): vec3
    
    /**
    * Returns a copy of the vector reflected across the plane defined by the normal `vec`.
    */
    reflect(vec: vec3): vec3
    
    /**
    * x component of the vec3.
    */
    x: number
    
    /**
    * y component of the vec3.
    */
    y: number
    
    /**
    * z component of the vec3.
    */
    z: number
    
    /**
    * Alternate name for the x component.
    */
    r: number
    
    /**
    * Alternate name for the y component.
    */
    g: number
    
    /**
    * Alternate name for the z component.
    */
    b: number
    
    /**
    * Returns the length of the vector.
    */
    length: number
    
    /**
    * Returns the squared length of the vector.
    */
    lengthSquared: number
    
}
declare namespace vec3 {
    /**
    * Makes the vectors `vecA` and `vecB` normalized and orthogonal to each other.
    */
    export function orthonormalize(vecA: vec3, vecB: vec3): void
    
    /**
    * Returns a new vector containing the largest value of each component in the two vectors.
    */
    export function max(vecA: vec3, vecB: vec3): vec3
    
    /**
    * Returns a new vector containing the smallest value of each component in the two vectors.
    */
    export function min(vecA: vec3, vecB: vec3): vec3
    
    /**
    * Linearly interpolates between the two vectors `vecA` and `vecB` by the factor `t`.
    */
    export function lerp(vecA: vec3, vecB: vec3, t: number): vec3
    
    /**
    * Spherically interpolates between the two vectors `vecA` and `vecB` by the factor `t`.
    */
    export function slerp(vecA: vec3, vecB: vec3, t: number): vec3
    
    /**
    * Returns the vector (1, 1, 1).
    */
    export function one(): vec3
    
    /**
    * Returns the vector (0, 0, 0).
    */
    export function zero(): vec3
    
    /**
    * Returns the vector (0, 1, 0).
    */
    export function up(): vec3
    
    /**
    * Returns the vector (0, -1, 0).
    */
    export function down(): vec3
    
    /**
    * Returns the vector (-1, 0, 0).
    */
    export function left(): vec3
    
    /**
    * Returns the vector (1, 0, 0).
    */
    export function right(): vec3
    
    /**
    * Returns the vector (0, 0, -1).
    */
    export function back(): vec3
    
    /**
    * Returns the vector (0, 0, 1).
    */
    export function forward(): vec3
    
    /**
    * Generate random 3D direction vector. This is equivalent to a random point on a unit-radius sphere.
    */
    export function randomDirection(): vec3
    

}

/**
* A four dimensional vector.
* Vectors can only store finite numbers in the range Number.MIN_VALUE to Number.MAX_VALUE.

*/
declare class vec4 {
    /**
    * Creates a new instance of a vec4.
    */
    constructor(x: number, y: number, z: number, w: number)
    
    /**
    * Returns a string representation of the vector.
    */
    toString(): string
    
    /**
    * Returns the vector plus `vec`.
    */
    add(vec: vec4): vec4
    
    /**
    * Returns the vector minus `vec`.
    */
    sub(vec: vec4): vec4
    
    /**
    * Returns the component-wise multiplication product of the vector and `vec`.
    */
    mult(vec: vec4): vec4
    
    /**
    * Returns the component-wise multiplication product of the vector and `vec`.
    */
    scale(vec: vec4): vec4
    
    /**
    * Returns the division of the vector by the vector `vec`.
    */
    div(vec: vec4): vec4
    
    /**
    * Multiplies the components by the number `scale`.
    */
    uniformScale(scale: number): vec4
    
    /**
    * Returns whether this is equal to `vec`.
    */
    equal(vec: vec4): boolean
    
    /**
    * Returns a copy of the vector with its length clamped to `length`.
    */
    clampLength(length: number): vec4
    
    /**
    * Returns a copy of the vector with its length scaled to 1.
    */
    normalize(): vec4
    
    /**
    * Returns the angle between the vector and `vec`.
    */
    angleTo(vec: vec4): number
    
    /**
    * Returns the distance between the vector and the vector `vec`.
    */
    distance(vec: vec4): number
    
    /**
    * Like `distance()`, but returns the squared distance between vectors.
    */
    distanceSquared(vec: vec4): number
    
    /**
    * Returns the dot product of the vector and `vec`.
    */
    dot(vec: vec4): number
    
    /**
    * Returns a copy of the vector moved towards the point `point` by the amount `magnitude`.
    */
    moveTowards(point: vec4, magnitude: number): vec4
    
    /**
    * Returns a copy of the vector projected onto the vector `vec`.
    */
    project(vec: vec4): vec4
    
    /**
    * Projects the vector onto the plane represented by the normal `normal`.
    */
    projectOnPlane(normal: vec4): vec4
    
    /**
    * Returns a copy of the vector reflected across the plane defined by the normal `vec`.
    */
    reflect(vec: vec4): vec4
    
    /**
    * x component of the vec4.
    */
    x: number
    
    /**
    * y component of the vec4.
    */
    y: number
    
    /**
    * z component of the vec4.
    */
    z: number
    
    /**
    * w component of the vec4.
    */
    w: number
    
    /**
    * Alternate name for the x component.
    */
    r: number
    
    /**
    * Alternate name for the y component.
    */
    g: number
    
    /**
    * Alternate name for the z component.
    */
    b: number
    
    /**
    * Alternate name for the w component.
    */
    a: number
    
    /**
    * Returns the length of the vector.
    */
    length: number
    
    /**
    * Returns the squared length of the vector.
    */
    lengthSquared: number
    
}
declare namespace vec4 {
    /**
    * Returns a new vector containing the largest value of each component in the two vectors.
    */
    export function max(vecA: vec4, vecB: vec4): vec4
    
    /**
    * Returns a new vector containing the smallest value of each component in the two vectors.
    */
    export function min(vecA: vec4, vecB: vec4): vec4
    
    /**
    * Linearly interpolates between the two vectors `vecA` and `vecB` by the factor `t`.
    */
    export function lerp(vecA: vec4, vecB: vec4, t: number): vec4
    
    /**
    * Returns the vector (1, 1, 1, 1).
    */
    export function one(): vec4
    
    /**
    * Returns the vector (0, 0, 0, 0).
    */
    export function zero(): vec4
    

}


/**
* A quaternion, used to represent rotation.
*/
declare class quat {
    /**
    * Creates a new quat.
    */
    constructor(w: number, x: number, y: number, z: number)
    
    /**
    * Returns an inverted version of the quat.
    */
    invert(): quat
    
    /**
    * Normalizes the quat.
    */
    normalize(): void
    
    /**
    * Returns a string representation of the quat.
    */
    toString(): string
    
    /**
    * Returns an euler angle representation of the quat, in radians.
    */
    toEulerAngles(): vec3
    
    /**
    * Returns the rotation angle of the quat.
    */
    getAngle(): number
    
    /**
    * Returns the rotation axis of the quat.
    */
    getAxis(): vec3
    
    /**
    * Returns the dot product of the two quats.
    */
    dot(quat: quat): number
    
    /**
    * Returns the product of this quat and `b`.
    */
    multiply(b: quat): quat
    
    /**
    * Returns the result of rotating direction vector `vec3` by this quat.
    */
    multiplyVec3(vec3: vec3): vec3
    
    /**
    * Returns whether this quat and `b` are equal.
    */
    equal(b: quat): boolean
    
    /**
    * x component of the quat.
    */
    x: number
    
    /**
    * y component of the quat.
    */
    y: number
    
    /**
    * z component of the quat.
    */
    z: number
    
    /**
    * w component of the quat.
    */
    w: number
    
}
declare namespace quat {
    /**
    * Returns the angle between `a` and `b`.
    */
    export function angleBetween(a: quat, b: quat): number
    
    /**
    * Returns a new quat with angle `angle` and axis `axis`.
    */
    export function angleAxis(angle: number, axis: vec3): quat
    
    /**
    * Returns a new quat using the euler angles `x`, `y`, `z` (in radians).
    */
    export function fromEulerAngles(x: number, y: number, z: number): quat
    
    /**
    * Returns a new quat using the euler angle `eulerVec` (in radians).
    */
    export function fromEulerVec(eulerVec: vec3): quat
    
    /**
    * Returns a rotation quat between direction vectors `from` and `to`.
    */
    export function rotationFromTo(from: vec3, to: vec3): quat
    
    /**
    * Returns a new quat with a forward vector `forward` and up vector `up`.
    */
    export function lookAt(forward: vec3, up: vec3): quat
    
    /**
    * Returns a new quat linearly interpolated between `a` and `b`.
    */
    export function lerp(a: quat, b: quat, t: number): quat
    
    /**
    * Returns a new quat spherically linearly interpolated between `a` and `b`.
    */
    export function slerp(a: quat, b: quat, t: number): quat
    
    /**
    * Returns the identity quaternion.
    */
    export function quatIdentity(): quat
    
    /**
    * Creates a quaternion from a matrix.
    */
    export function fromRotationMat(rotationMat: mat3): quat
    

}

/**
* A 3x3 matrix.
*/
declare class mat3 {
    /**
    * Creates a new mat3, defaulting to identity values.
    */
    constructor()
    
    /**
    * Returns the result of adding the two matrices together.
    */
    add(mat: mat3): mat3
    
    /**
    * Returns the result of subtracting the two matrices.
    */
    sub(mat: mat3): mat3
    
    /**
    * Returns the result of multiplying the two matrices.
    */
    mult(mat: mat3): mat3
    
    /**
    * Returns the result of dividing the two matrices.
    */
    div(mat: mat3): mat3
    
    /**
    * Returns the determinant of the matrix.
    */
    determinant(): number
    
    /**
    * Returns the inverse of the matrix.
    */
    inverse(): mat3
    
    /**
    * Returns the transpose of this matrix.
    */
    transpose(): mat3
    
    /**
    * Returns whether the two matrices are equal.
    */
    equal(mat: mat3): boolean
    
    /**
    * Returns the result of scalar multiplying the matrix.
    */
    multiplyScalar(scalar: number): mat3
    
    /**
    * Returns a string representation of the matrix.
    */
    toString(): string
    
    /**
    * Returns a string representation of the matrix.
    */
    description: string
    
    /**
    * The first column of the matrix.
    */
    column0: vec3
    
    /**
    * The second column of the matrix.
    */
    column1: vec3
    
    /**
    * The third column of the matrix.
    */
    column2: vec3
    
}
declare namespace mat3 {
    /**
    * Returns the identity matrix.
    */
    export function identity(): mat3
    
    /**
    * Returns a matrix with all zero values.
    */
    export function zero(): mat3
    
    /**
    * Returns a matrix representing the specified rotation.
    */
    export function makeFromRotation(arg1: quat): mat3
    

}

declare class bvec4 {
}


/**
 * @module LensStudio:LcaUtils.js
 */
declare module "LensStudio:LcaUtils.js" {
import * as Network from "LensStudio:Network";
/**
 * Adds LCA token to Http Request
 *
 * @param request - Request object which LCA token needs to be attached to
 * @param issuer - Issuer URL which used for generating LCA token
 */
export function attachLCAHeader(request: Network.HttpRequest, issuer: string): void;
}
