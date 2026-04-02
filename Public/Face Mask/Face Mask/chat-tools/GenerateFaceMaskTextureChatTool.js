import { ChatTool, Result } from 'LensStudio:ChatTool';
import { FaceMaskGenTask } from '../generator/FaceMaskGenTask';
import { Importer } from '../importer/Importer';
const schema = {
    displayName: "Generate Face Mask Texture",
    canBeReferencedInPrompt: true,
    icon: "$(files)",
    name: "GenerateFaceMaskTexture",
    tags: [
        "generate",
        "face mask texture",
        "create face mask texture",
        "AI face mask texture",
        "procedural face mask texture"
    ],
    modelDescription: "Generates face mask textures using Snap's ControlNet server. Creates realistic face mask textures based on text prompts, imports the result as a packed Face Mask package, and adds a Face Mask scene object with FaceMaskVisual component.",
    inputSchema: {
        type: "object",
        required: ["prompt", "name"],
        properties: {
            prompt: {
                type: "string",
                modelDescription: "Text prompt describing the desired face mask texture (e.g., 'Albert Einstein', 'Golden Retriever', 'cyberpunk robot')."
            },
            name: {
                type: "string",
                modelDescription: "Name for the generated face mask texture asset."
            },
            negativePrompt: {
                type: "string",
                modelDescription: "Optional negative prompt to specify what should NOT appear in the generated face mask texture."
            },
            seed: {
                type: "integer",
                modelDescription: "Optional seed for reproducible results. Use -1 for random generation.",
                default: -1
            }
        }
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: false
    }
};
export class GenerateFaceMaskTextureChatTool extends ChatTool {
    static descriptor() {
        return {
            id: schema.name,
            name: schema.displayName,
            description: "Generate face mask textures using AI based on text descriptions.",
            schema: schema
        };
    }
    async execute(parameters) {
        const result = new Result();
        try {
            const prompt = parameters?.data?.prompt;
            const name = parameters?.data?.name;
            const negativePrompt = parameters?.data?.negativePrompt;
            const rawSeed = parameters?.data?.seed;
            const seed = (typeof rawSeed === 'number' && Number.isInteger(rawSeed)) ? rawSeed : -1;
            if (!prompt || typeof prompt !== 'string') {
                result.error = 'Prompt is required.';
                return result;
            }
            if (!name || typeof name !== 'string') {
                result.error = 'Face mask texture name is required.';
                return result;
            }
            const authorization = this.pluginSystem.findInterface(Editor.IAuthorization);
            if (!authorization || !authorization.isAuthorized) {
                result.error = 'Please log into your Snapchat account in Lens Studio to use this tool. You can log in from the Menu Bar: Go to My Lenses > Login';
                return result;
            }
            const stopper = { stop: false };
            const task = new FaceMaskGenTask(prompt, negativePrompt ?? '', seed, stopper);
            const base64ImageData = await task.run();
            const imageBytes = Base64.decode(base64ImageData);
            const importer = new Importer();
            const importResult = await importer.importTextureAndCreateFaceMask(imageBytes, name, this.pluginSystem);
            result.data = {
                textureAssetUUID: importResult.textureAsset?.id?.toString(),
                textureAssetName: importResult.textureAsset?.name,
                sceneObjectUUID: importResult.sceneObject?.id?.toString(),
                sceneObjectName: importResult.sceneObject?.name,
                componentUUID: importResult.faceMaskComponent?.id?.toString(),
                message: `Successfully generated face mask "${name}" with scene object and FaceMaskVisual component from prompt: ${prompt}`
            };
            return result;
        }
        catch (e) {
            result.error = `Failed to generate face mask texture: ${e?.message ?? e}`;
            return result;
        }
    }
}
