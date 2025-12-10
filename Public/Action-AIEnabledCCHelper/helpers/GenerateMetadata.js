/**
 * Generate markdown template from form data based on the updated metadata structure
 * @param {Object} formData - Form data containing component metadata
 * @returns {string} Generated markdown template
 */
export function generateMarkdown(formData) {
    let markdown = "";

    // Title
    markdown += `<!-- Component Name: The name of the component as it will appear in the component library -->\n`;
    const componentName = formData.componentName || "[Replace with Component Name]";
    markdown += `# ${componentName}\n\n`;

    // Basic info
    const description = formData.description || "[Replace with your description]";

    markdown += `<!-- Description: A detailed description of what this component does and its purpose -->\n`;
    markdown += `- Description: ${description}\n\n`;

    // Render Layer
    markdown += `<!--\n`;
    markdown += `Render Layer: Where your component should be placed in the rendering pipeline.\n`;
    markdown += `Choose one: 2D Pre Background, 3D Background, 2D Background, 3D Face, 3D Foreground, Post Effect, 2D Foreground, 3D UI (Safe Region), 2D UI (Safe Region)\n`;
    markdown += `-->\n`;
    markdown += `- Render Layer: ${formData.renderLayer || "[Replace with your chosen Render Layer]"}\n\n`;

    // Composition Notes
    if (formData.compositionNotes && formData.compositionNotes.trim()) {
        markdown += `## Composition Notes\n`;
        markdown += `<!-- These notes are used by the system to determine component inclusion in a lens. -->\n`;
        markdown += `${formData.compositionNotes}\n\n`;
    }

    // Design Notes
    if (formData.designNotes && formData.designNotes.trim()) {
        markdown += `## Design Notes\n`;
        markdown += `<!-- These notes influence how the system populates the component's inputs. Please provide some examples of input values and explain how they affect the component's behavior. -->\n`;
        markdown += `${formData.designNotes}\n\n`;
    }

    // Coding Notes
    if (formData.codingNotes && formData.codingNotes.trim()) {
        markdown += `## Coding Notes\n`;
        markdown += `<!-- These notes are for the coding agent, describe how to use the API of your component (inputs/functions/events) for different scenarios -->\n`;
        markdown += `${formData.codingNotes}\n\n`;
    }

    // Inputs
    if (formData.inputs && formData.inputs.length > 0) {
        markdown += `<!--\n`;
        markdown += ` * inputs: The input parameters for this custom component. This should correspond to the // @input in your script.\n`;
        markdown += `\n`;
        markdown += ` * For each input parameter you should have the following:\n`;
        markdown += ` * - Name: The name of the input parameter as it appears in the interface\n`;
        markdown += ` * - Description: Explain what this input does and how it affects the component's behavior\n`;
        markdown += ` * - Type: The data type expected. Choose one: string, int, float, boolean, vec2, vec3, vec4, Asset.Texture, Asset.ObjectPrefab\n`;
        markdown += `\n`;
        markdown += ` * If you are using primitives like strings, or numbers, you need to provide a default value:\n`;
        markdown += ` * - Default: The default value used when no input is provided\n`;
        markdown += `\n`;
        markdown += ` * If instead you want to use asset generators, you need to provide the asset provider and asset style:\n`;
        markdown += ` * - Asset Provider: Asset provider type for asset-based inputs (Sticker, Sprite, Image, 3D Object)\n`;
        markdown += ` * - Asset Style: Asset style description for guiding asset generation (e.g. Cartoony)\n`;
        markdown += `-->\n`;
        markdown += `## Inputs\n\n`;
        formData.inputs.forEach(input => {
            const name = input.name || "Input Name";
            const desc = input.description || "Input description";
            const type = input.type || "string";

            markdown += `### ${name}\n`;
            markdown += `- Description: ${desc}\n`;
            markdown += `- Type: ${type}\n`;

            if (input.assetProvider) {
                markdown += `- Asset Provider: ${input.assetProvider}\n`;
            }

            if (input.assetStyle) {
                markdown += `- Asset Style: ${input.assetStyle}\n`;
            }

            if (input.default && !input.assetProvider) {
                markdown += `- Default: ${input.default}\n`;
            }

            markdown += `\n`;
        });
    }

    // Functions
    if (formData.functions && formData.functions.length > 0) {
        markdown += `<!--\n`;
        markdown += ` * Functions: These are functions that can be called on this custom component. This should correspond to some function exposed in the script object of your script.\n`;
        markdown += `\n`;
        markdown += ` * An example of a function description is the following:\n`;
        markdown += `\n`;
        markdown += "```\n";
        markdown += ` * ### functionName(argumentName1: argumentType1) : returnType\n`;
        markdown += ` * - description: Explain what this function does and when to use it.\n`;
        markdown += ` * - argumentName1: The description for argument1.\n`;
        markdown += "```\n";
        markdown += `\n`;
        markdown += ` * You can omit the arguments section if the function takes no parameters.\n`;
        markdown += `-->\n`;
        markdown += `## Functions\n\n`;
        formData.functions.forEach(func => {
            const name = func.name || "functionName";
            const desc = func.description || "Function description";
            const returnType = func.returnType || "void";

            // Generate function signature
            let signature = `${name}(`;
            if (func.arguments && func.arguments.length > 0) {
                const argSignatures = func.arguments.map(arg => `${arg.name}: ${arg.type}`).join(', ');
                signature += argSignatures;
            }
            signature += `) : ${returnType}`;

            markdown += `### ${signature}\n`;
            markdown += `- Description: ${desc}\n`;

            if (func.arguments && func.arguments.length > 0) {
                func.arguments.forEach(arg => {
                    markdown += `- ${arg.name}: ${arg.description}\n`;
                });
            }

            markdown += `\n`;
        });
    }

    // Events
    if (formData.events && formData.events.length > 0) {
        markdown += `<!--\n`;
        markdown += ` * Events: The list of events that this component can emit. Make sure to use the EventModule to setup your events in your script, and expose it on the script object of your script.\n`;
        markdown += `\n`;
        markdown += ` * An example of an event description is the following:\n`;
        markdown += `\n`;
        markdown += "```\n";
        markdown += ` * ### eventName(argumentName1: argumentType1, argumentName2: argumentType2)\n`;
        markdown += ` * - description: Explain when this event is triggered and what it indicates.\n`;
        markdown += ` * - argumentName1: The description for argument1.\n`;
        markdown += ` * - argumentName2: The description for argument2.\n`;
        markdown += "```\n";
        markdown += `\n`;
        markdown += ` * You can omit the arguments section if the event doesn't pass any arguments.\n`;
        markdown += `-->\n`;
        markdown += `## Events\n\n`;
        formData.events.forEach(event => {
            const name = event.name || "eventName";
            const desc = event.description || "Event description";

            // Generate event signature
            let signature = `${name}(`;
            if (event.arguments && event.arguments.length > 0) {
                const argSignatures = event.arguments.map(arg => `${arg.name}: ${arg.type}`).join(', ');
                signature += argSignatures;
            }
            signature += `)`;

            markdown += `### ${signature}\n`;
            markdown += `- Description: ${desc}\n`;

            if (event.arguments && event.arguments.length > 0) {
                event.arguments.forEach(arg => {
                    markdown += `- ${arg.name}: ${arg.description}\n`;
                });
            }

            markdown += `\n`;
        });
    }

    // Examples section (optional)
    if (formData.examples && formData.examples.length > 0) {
        markdown += `<!-- Examples are optional -->\n`;
        markdown += `## Examples\n\n`;

        formData.examples.forEach((example, index) => {
            markdown += `### Example ${index + 1}\n`;
            if (example.description) {
                markdown += `- Description: ${example.description}\n`;
            }
            if (example.comment) {
                markdown += `- Comment: ${example.comment}\n`;
            }

            if (example.inputs && Object.keys(example.inputs).length > 0) {
                markdown += `\n#### Inputs\n`;
                Object.entries(example.inputs).forEach(([key, value]) => {
                    markdown += `- ${key}: ${value}\n`;
                });
            }

            markdown += `\n`;
        });
    }

    // Add reference documentation at the end as comments
    markdown += `<!--\n`;
    markdown += `Reference Documentation\n`;
    markdown += `\n`;
    markdown += `Render Layer Definitions:\n`;
    markdown += `- 2D Pre Background: For 2D objects that are to be rendered before the background, behind everything else.\n`;
    markdown += `- 3D Background: For 3D objects that are to be rendered in the background, behind everything else.\n`;
    markdown += `- 2D Background: For 2D objects that are to be rendered in the background, behind everything else.\n`;
    markdown += `- 3D Face: For 3D objects that are intended to be attached to the face.\n`;
    markdown += `- 3D Foreground: For 3D objects that are to be rendered in the foreground, in front of everything else.\n`;
    markdown += `- Post Effect: For 2D post effects, rendered below the UI elements.\n`;
    markdown += `- 2D Foreground: For 2D objects that are to be rendered in the foreground, in front of everything else.\n`;
    markdown += `- 3D UI (Safe Region): For 3D objects that are to be rendered in the foreground, in front of everything else.\n`;
    markdown += `- 2D UI (Safe Region): For 2D objects that are to be rendered in the foreground, in front of everything else.\n`;
    markdown += `\n`;
    markdown += `Asset Provider Definitions:\n`;
    markdown += `- Sticker: A texture with transparent background that will have a white outline around it. Perfect for sticker-style graphics and decals.\n`;
    markdown += `- Sprite: A texture with transparent background. Great for game sprites, icons, and similar graphics that need clean transparency without outlines.\n`;
    markdown += `- Image: A texture that will fill the entire space. Great for background images, green screen replacements, and full-screen graphics.\n`;
    markdown += `- 3D Object: An Asset.ObjectPrefab that can be instantiated to display a 3D object. Used for generating 3D models, meshes, and complex 3D assets.\n`;
    markdown += `-->\n`;

    return markdown;
}
