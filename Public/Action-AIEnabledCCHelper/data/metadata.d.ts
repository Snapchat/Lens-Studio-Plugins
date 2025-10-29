/**
 * Main interface for AI metadata
 */
export interface AIMetadata {
    /** The name of the AI component as it will appear in the component library */
    componentName: string;

    /** A detailed description of what this component does and its purpose */
    description: string;

    /** Which render layer this component should be placed on */
    renderLayer: RenderLayer;

    /** These notes are used by the system to determine component inclusion in a lens */
    compositionNotes: string;

    /** These notes influence how the system populates the component's inputs. Please provide some examples of input values and explain how they affect the component's behavior */
    designNotes: string;

    /** These notes are for the coding agent, describe how to use the API of your component (inputs/functions/events) for different scenarios */
    codingNotes: string;

    /** The input parameters for this custom component. This should correspond to the // @input in your script */
    inputs: InputParameter[];

    /** These are functions that can be called on this custom component. This should correspond to some function exposed in the script object of your script */
    functions: FunctionDefinition[];

    /** The list of events that this component can emit. Make sure to use the EventModule to setup your events in your script, and expose it on the script object of your script */
    events: EventDefinition[];
}

/**
 * Supported render layers
 * The render layers determine where the component appears in the rendering pipeline
 * 2D Pre Background: For 2D objects that are to be rendered before the background, behind everything else.
 * 3D Background: For 3D objects that are to be rendered in the background, behind everything else.
 * 2D Background: For 2D objects that are to be rendered in the background, behind everything else.
 * 3D Face: For 3D objects that are intended to be attached to the face.
 * 3D Foreground: For 3D objects that are to be rendered in the foreground, in front of everything else.
 * Post Effect: For 2D post effects, rendered below the UI elements.
 * 2D Foreground: For 2D objects that are to be rendered in the foreground, in front of everything else.
 * 3D UI (Safe Region): For 3D objects that are to be rendered in the foreground, in front of everything else.
 * 2D UI (Safe Region): For 2D objects that are to be rendered in the foreground, in front of everything else.
 */
export type RenderLayer =
    | "2D Pre Background"
    | "3D Background"
    | "2D Background"
    | "3D Face"
    | "3D Foreground"
    | "Post Effect"
    | "2D Foreground"
    | "3D UI (Safe Region)"
    | "2D UI (Safe Region)";

/**
 * Input parameter definition
 */
export interface InputParameter {
    /** The name of the input parameter as it appears in the interface */
    name: string;

    /** Explain what this input does and how it affects the component's behavior */
    description: string;

    /** The data type expected. Choose one: string, int, float, boolean, vec2, vec3, vec4, Asset.Texture, Asset.ObjectPrefab */
    type: InputType;

    /** The default value used when no input is provided (for primitives like strings, or numbers) */
    default?: string;

    /** Asset provider type for asset-based inputs (Sticker, Sprite, Image, 3D Object) */
    assetProvider?: AssetProvider;

    /** Asset style description for guiding asset generation (e.g. Cartoony) */
    assetStyle?: string;
}

/**
 * Supported input types
 */
export type InputType =
    | "string"
    | "int"
    | "float"
    | "boolean"
    | "vec2"
    | "vec3"
    | "vec4"
    | "Asset.Texture"
    | "Asset.ObjectPrefab";

/**
 * Supported asset provider types
 * Sticker: A texture with transparent background that will have a white outline around it. Perfect for sticker-style graphics and decals.
 * Sprite: A texture with transparent background. Great for game sprites, icons, and similar graphics that need clean transparency without outlines.
 * Image: A texture that will fill the entire space. Great for background images, green screen replacements, and full-screen graphics.
 * 3D Object: An Asset.ObjectPrefab that can be instantiated to display a 3D object. Used for generating 3D models, meshes, and complex 3D assets.
 */
export type AssetProvider =
    | "Sticker"
    | "Sprite"
    | "Image"
    | "3D Object";

/**
 * Function definition
 */
export interface FunctionDefinition {
    /** The name of the function that can be called on this custom component */
    name: string;

    /** Explain what this function does and when to use it */
    description: string;

    /** The data type returned by this function */
    returnType: ReturnType;

    /** Array of function arguments */
    arguments: FunctionArgument[];
}

/**
 * Function argument definition
 */
export interface FunctionArgument {
    /** The name of the function argument parameter */
    name: string;

    /** The data type of this argument */
    type: ArgumentType;

    /** Description of what this argument is used for */
    description: string;
}

/**
 * Supported return types for functions
 */
export type ReturnType =
    | "void"
    | "string"
    | "number"
    | "boolean"
    | "Object";

/**
 * Supported argument types for function parameters
 */
export type ArgumentType =
    | "string"
    | "int"
    | "float"
    | "boolean"
    | "vec2"
    | "vec3"
    | "vec4"
    | "Asset.Texture"
    | "Asset.ObjectPrefab"
    | "Object"
    | "Array"
    | "Function";

/**
 * Event definition
 */
export interface EventDefinition {
    /** The name of the event that this component can emit */
    name: string;

    /** Explain when this event is triggered and what it indicates */
    description: string;

    /** Array of event arguments passed when this event fires */
    arguments: FunctionArgument[];
}