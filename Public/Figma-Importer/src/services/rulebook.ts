/**
 * Configuration for each object type.
 */
/**
 * Represents the configuration for recreating an object.
 */
export type RecreationConfig = {
    /**
     * The method used for recreating the object.
     */
    recreationMethod: RecreationMethod,
    /**
     * Indicates whether to ignore the children of the object during recreation.
     */
    ignoreChildren: boolean,
    /**
     * Indicates whether to ignore the object itself during recreation.
     */
    ignoreSelf: boolean
}

export enum RecreationMethod {
    /** @description Rasterize the object and use the PNG as a texture */
    Rasterization,
    /** @description Use a shader to reproduce the fill, color, stroke, etc. */
    Shape2D
}

/**
 * Default export containing various configurations.
 */
type recreateConfigurations = Readonly<Record<string, RecreationConfig>>

export const content: recreateConfigurations = {
    'BOOLEAN_OPERATION': {
        recreationMethod: RecreationMethod.Rasterization,
        ignoreChildren: true,
        ignoreSelf: false
    },
    'GROUP': {
        recreationMethod: RecreationMethod.Shape2D,
        ignoreChildren: false,
        // In Figma, a Group is an organizer, not a real object. Its children are actually children of the Group's parent. The Group itself cannot have fill or styling. We can ignore the Group and place its children directly under its parent, treating the Group as non-existent.
        ignoreSelf: true
    },
    'COMPONENT': {
        recreationMethod: RecreationMethod.Rasterization,
        ignoreChildren: true,
        ignoreSelf: false
    },
    'COMPONENT_SET': {
        recreationMethod: RecreationMethod.Shape2D,
        ignoreChildren: false,
        ignoreSelf: true
    },
    'INSTANCE': {
        recreationMethod: RecreationMethod.Rasterization,
        ignoreChildren: true,
        ignoreSelf: false
    },
    'FRAME': {
        recreationMethod: RecreationMethod.Shape2D,
        ignoreChildren: false,
        ignoreSelf: false
    },
    'default': {
        recreationMethod: RecreationMethod.Rasterization,
        ignoreChildren: false,
        ignoreSelf: false
    }
}

export function getRuleByType(type: string): RecreationConfig {
    return content[type] ?? content['default']
}
