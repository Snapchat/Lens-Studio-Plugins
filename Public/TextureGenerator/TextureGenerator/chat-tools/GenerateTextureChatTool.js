import { ChatTool, Result } from 'LensStudio:ChatTool';
import { TextureGenAPI } from '../generator/TextureGenAPI';
import { Importer } from '../importer/Importer';
const schema = {
    displayName: "Generate Texture",
    canBeReferencedInPrompt: true,
    icon: "$(files)",
    name: "GenerateTexture",
    tags: [
        "generate",
        "texture",
        "create texture",
        "AI texture",
        "procedural texture",
        "PBR",
        "tileable"
    ],
    modelDescription: "Generates general-purpose textures using Snap's Aether Stable Diffusion text-to-image server. Creates PBR textures, tileable patterns, materials, and photorealistic textures based on text prompts.",
    inputSchema: {
        type: "object",
        required: ["prompt", "name"],
        properties: {
            prompt: {
                type: "string",
                modelDescription: "Descriptive text prompt for texture generation (e.g., 'PBR metal texture, rust, tileable', 'wood grain photorealistic', 'abstract geometric pattern')."
            },
            name: {
                type: "string",
                modelDescription: "Name for the generated texture asset."
            }
        }
    },
    annotations: {
        readOnlyHint: false,
        destructiveHint: false
    }
};
export class GenerateTextureChatTool extends ChatTool {
    static descriptor() {
        return {
            id: schema.name,
            name: schema.displayName,
            description: "Generate general-purpose textures using AI based on text descriptions.",
            schema: schema
        };
    }
    async execute(parameters) {
        const result = new Result();
        try {
            const prompt = parameters?.data?.prompt;
            const name = parameters?.data?.name;
            if (!prompt || typeof prompt !== 'string') {
                result.error = 'Prompt is required.';
                return result;
            }
            if (!name || typeof name !== 'string') {
                result.error = 'Texture name is required.';
                return result;
            }
            const authorization = this.pluginSystem.findInterface(Editor.IAuthorization);
            if (!authorization || !authorization.isAuthorized) {
                result.error = 'Please log into your Snapchat account in Lens Studio to use this tool. You can log in from the Menu Bar: Go to My Lenses > Login';
                return result;
            }
            const imageBuffer = await TextureGenAPI.generate(this.pluginSystem, prompt);
            if (!imageBuffer) {
                result.error = 'Texture generation failed. The server may be unavailable — please try again.';
                return result;
            }
            const importer = new Importer();
            const importResult = await importer.import(imageBuffer, name, this.pluginSystem);
            result.data = {
                textureAssetUUID: importResult.textureAsset?.id?.toString(),
                textureAssetName: importResult.textureAsset?.name,
                message: `Successfully generated texture "${name}" from prompt: ${prompt}`
            };
            return result;
        }
        catch (e) {
            result.error = `Failed to generate texture: ${e?.message ?? e}`;
            return result;
        }
    }
}
