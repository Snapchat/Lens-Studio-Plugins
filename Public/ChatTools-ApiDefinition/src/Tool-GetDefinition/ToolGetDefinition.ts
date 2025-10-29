import * as ChatTools from 'LensStudio:ChatTool';
import * as FileSystem from "LensStudio:FileSystem"
import schemaJson from './ToolGetDefinition.json';

import { getDefinition } from '../Vendors/GetDefinition';

export class GetDefinitionTool extends ChatTools.ChatTool {
    static descriptor() {
        return {
            id: schemaJson.name,
            name: schemaJson.displayName,
            description: "This tool returns what API is available built-in to the Lens environment in a TypeScript definition format. Helpful for finding properties of a component.",
            schema: schemaJson
        };
    }

    async execute(parameters: any) {
        const result = new ChatTools.Result();

        try {
            // Extract parameters
            const className: string = parameters?.data?.className;

            // Validate required parameters
            if (!className || typeof className !== 'string') {
                result.error = "Parameter 'className' is required and must be a string.";
                return result;
            }

            // Your tool logic here
            const outputData = await this.performToolAction(className);

            // Set success result
            result.data = {
                message: "Tool executed successfully",
                result: outputData
            };

            return result;
        } catch (error: Error | unknown) {
            result.error = `Tool execution failed: ${error instanceof Error ? error.message : error}`;
            return result;
        }
    }

    private async performToolAction(className: string): Promise<any> {

        return { success: true, result: getDefinition(className) };
    }
}
