import * as ChatTools from "LensStudio:ChatTool";
import { getSpecsAssetJobService } from "../service/specsAssetJobService.js";
import { toolErrorMessage } from "./toolErrors.js";
import schemaJson from "./awaitSpecsAssetJobsBarrierTool.json";

export class AwaitSpecsAssetJobsBarrierTool extends ChatTools.ChatTool {
  static descriptor() {
    return {
      id: schemaJson.name,
      name: schemaJson.displayName,
      description: schemaJson.modelDescription,
      dependencies: [],
      schema: schemaJson,
    };
  }

  async execute(_parameters: ChatTools.Parameters): Promise<ChatTools.Result> {
    const result = new ChatTools.Result();
    try {
      result.data = await getSpecsAssetJobService().barrier();
    } catch (error) {
      console.error("[SpecsAssetJobs] Barrier tool failed:", error, console.None);
      result.error = toolErrorMessage(error, "barrier");
    }
    return result;
  }
}
