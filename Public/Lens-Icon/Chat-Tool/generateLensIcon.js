import * as ChatTools from 'LensStudio:ChatTool';
import schemaJson from './generateLensIcon.json';

import { Generator, GeneratorState } from '../App/generator.js';
import { NetworkingManager } from '../App/networking.js';
import { AuthProvider } from '../App/authProvider.js';

import { Storage } from '../utils/storage.js';

import { GenAIIconName } from '../App/common.js';
import { setIcon } from '../App/app.js';

export class GenerateLensIconTool extends ChatTools.ChatTool {
    static descriptor() {
        return {
            id: schemaJson.name,
            name: schemaJson.displayName,
            description: "Generates image for lens icon based on text prompt.",
            schema: schemaJson
        };
    }

    async execute(parameters) {
        return new Promise((resolve, reject) => {
            const result = new ChatTools.Result();
            try {
                const prompt = parameters?.data?.prompt;

                if (!prompt || typeof prompt !== 'string') {
                    result.error = "Invalid or missing 'prompt' parameter.";
                    resolve(result);
                }

                const authorization = this.pluginSystem.findInterface(Editor.IAuthorization);
                const networkingManager = new NetworkingManager();
                const authProvider = new AuthProvider(networkingManager, authorization);

                const generator = new Generator(networkingManager, authProvider);
                const storage = new Storage();

                generator.stateChanged.on(GeneratorState.Success, () => {
                    if (generator.iconBytes.length > 0) {
                        const iconPath = storage.createFile(GenAIIconName, generator.iconBytes[0]);

                        setIcon(iconPath, this.pluginSystem);
                        resolve(result);
                    } else {
                        result.error = "Failed to generate icon.";
                        resolve(result);
                    }
                });

                generator.stateChanged.on(GeneratorState.Failed, (error) => {
                    if (error && error.name == "AldError") {
                        result.error = "Failed to generate icon because of guidelines violation.";
                    } else {
                        result.error = "Failed to generate icon.";
                    }

                    resolve(result);
                });

                generator.stateChanged.on(GeneratorState.ConnectionFailed, (error) => {
                    result.error = "Failed to generate icon because of connection failure.";
                    resolve(result);
                })

                generator.generate({
                    "prompt": prompt,
                    "promptDecorator": "",
                    "size": 1,
                    "frame": true
                });
            } catch(error) {
                result.error = `Failed to execute Generate Lens Icon tool: ${error?.message ?? error}`;
                reject(result);
            }
        });
    }
}
