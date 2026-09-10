import * as ChatTools from "LensStudio:ChatTool";
import { getSpecsAssetJobService } from "../service/specsAssetJobService.js";
import { toolErrorMessage } from "./toolErrors.js";
import schemaJson from "./submitSpecsAssetJobsTool.json";

export class SubmitSpecsAssetJobsTool extends ChatTools.ChatTool {
  static descriptor() {
    return {
      id: schemaJson.name,
      name: schemaJson.displayName,
      description: schemaJson.modelDescription,
      dependencies: [],
      schema: schemaJson,
    };
  }

  async execute(parameters: ChatTools.Parameters): Promise<ChatTools.Result> {
    const result = new ChatTools.Result();
    try {
      result.data = await getSpecsAssetJobService().submit({
        requests: parameters?.data?.requests,
        abandonUncertain: parameters?.data?.abandonUncertain,
      });
    } catch (error) {
      console.error("[SpecsAssetJobs] Submit tool failed:", error, console.None);
      result.error = toolErrorMessage(error, "submission");
    }
    return result;
  }
}
