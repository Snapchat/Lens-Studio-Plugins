import * as Network from "LensStudio:Network";
import * as FileSystem from "LensStudio:FileSystem";
import type { AssetRequest } from "../domain/contracts.js";
import {
  classifyDownloadFailure,
  classifyHttpFailure,
  createSubmitBody,
  parseJson,
  parseStatus,
  parseSubmittedJobId,
  RemoteOperationError,
  type RemoteStatus,
} from "./remoteProtocol.js";
import type { PreparedRemoteAssetSubmission, RemoteAssetApi } from "./specsAssetJobCoordinator.js";

const API_BASE = "https://api.specs.com/v1/inference/text-to-3d";
const CREATE_PATH = "/v1/generations";
const REQUEST_TIMEOUT_MS = 30_000;

interface RequestOptions {
  readonly operation: "create" | "download" | "status";
  readonly timeoutMs?: number;
  readonly imageBacked?: boolean;
}

function imageMimeType(bytes: Uint8Array): string | null {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= png.length && png.every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) return "image/webp";
  return null;
}

/**
 * A request and its native callback, held together in a reachable ref for the whole
 * in-flight window. Both are handed to `Network.perform*HttpRequest` and otherwise
 * referenced by nothing in JS; a GC pass reclaiming an in-flight callback or request
 * destroys the snap::async trigger before the response arrives, surfacing as "Last
 * trigger of unfinished task is lost". Retaining them until `finish` runs prevents it.
 */
interface InflightRequest {
  readonly request: Network.HttpRequest;
  readonly callback: (response: Network.HttpResponse) => void;
}

export class SpecsAssetRemoteAdapter implements RemoteAssetApi {
  private readonly cancellations = new Set<(error: RemoteOperationError) => void>();
  private readonly timers = new Set<Timeout>();
  private readonly inflight = new Set<InflightRequest>();

  async prepareSubmit(request: AssetRequest): Promise<PreparedRemoteAssetSubmission> {
    // This occurs before the coordinator records submission_unknown. Polling and
    // collection use the retained remote ID and never reopen the source image.
    const inputImageDataUrl = request.referenceImagePath === undefined
      ? undefined
      : this.referenceImageDataUrl(request.referenceImagePath);
    const body = createSubmitBody(request, inputImageDataUrl);
    return {
      submit: async (): Promise<string> => {
        const response = await this.perform(
          this.request("POST", CREATE_PATH, body),
          { operation: "create", imageBacked: inputImageDataUrl !== undefined },
        );
        return parseSubmittedJobId(parseJson(response.body.toString(), "submission_unknown"));
      },
    };
  }

  async getStatus(
    remoteJobId: string,
    timeoutMs = REQUEST_TIMEOUT_MS,
  ): Promise<RemoteStatus> {
    const response = await this.perform(
      this.request("GET", `${CREATE_PATH}/${encodeURIComponent(remoteJobId)}`),
      { operation: "status", timeoutMs },
    );
    return parseStatus(parseJson(response.body.toString(), "terminal"));
  }

  async download(assetUrl: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Uint8Array> {
    const request = new Network.HttpRequest();
    request.url = assetUrl;
    request.method = Network.HttpRequest.Method.Get;
    request.headers = {
      "Lens-Assembler-Is-Collection-Download": "true",
      "Lens-Assembler-Collection-Asset-Name": "specs_text_to_3d_glb",
    };
    return (await this.perform(request, { operation: "download", timeoutMs })).body.toBytes();
  }

  dispose(): void {
    const stopped = new RemoteOperationError(
      "SPECS request stopped because the plugin or project closed",
      "submission_unknown",
    );
    [...this.cancellations].forEach((cancel) => cancel(stopped));
    this.cancellations.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.inflight.clear();
  }

  private request(method: "GET" | "POST", path: string, body?: unknown): Network.HttpRequest {
    const request = new Network.HttpRequest();
    request.url = `${API_BASE}${path}`;
    request.method = method === "GET"
      ? Network.HttpRequest.Method.Get
      : Network.HttpRequest.Method.Post;
    request.headers = { Accept: "application/json" };
    request.contentType = "application/json";
    if (method === "POST") request.body = JSON.stringify(body ?? {});
    return request;
  }

  private referenceImageDataUrl(referenceImagePath: string): string {
    try {
      const path = new Editor.Path(referenceImagePath);
      if (!FileSystem.exists(path) || !FileSystem.isFile(path)) {
        throw new Error("Reference image does not exist");
      }
      const bytes = FileSystem.readBytes(path);
      const mimeType = imageMimeType(bytes);
      if (mimeType === null) throw new Error("Reference image is not a supported image file");
      return `data:${mimeType};base64,${Base64.encode(bytes)}`;
    } catch (error) {
      if (error instanceof RemoteOperationError) throw error;
      console.error("[SpecsAssetJobs] Could not read reference image:", error, console.None);
      throw new RemoteOperationError(
        "The reference image could not be read as a PNG, JPEG, or WebP file",
        "reference_image_invalid",
      );
    }
  }

  private perform(
    request: Network.HttpRequest,
    options: RequestOptions,
  ): Promise<Network.HttpResponse> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error?: RemoteOperationError, response?: Network.HttpResponse): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this.timers.delete(timeout);
        this.cancellations.delete(cancel);
        this.inflight.delete(inflight);
        error === undefined ? resolve(response as Network.HttpResponse) : reject(error);
      };
      const cancel = (error: RemoteOperationError): void => finish(error);
      const timeout = setTimeout(
        () => cancel(options.operation === "download"
          ? classifyDownloadFailure(0, "SPECS request timed out")
          : classifyHttpFailure(
              0,
              "SPECS request timed out",
              options.operation === "create" ? "create" : "observe",
              options.imageBacked === true,
            )),
        Math.max(1, Math.min(REQUEST_TIMEOUT_MS, options.timeoutMs ?? REQUEST_TIMEOUT_MS)),
      );
      this.timers.add(timeout);
      this.cancellations.add(cancel);

      const callback = (response: Network.HttpResponse): void => {
        if (!response.error && response.statusCode >= 200 && response.statusCode < 300) {
          finish(undefined, response);
          return;
        }
        const networkError = response.error || null;
        finish(options.operation === "download"
          ? classifyDownloadFailure(response.statusCode, networkError)
          : classifyHttpFailure(
              response.statusCode,
              networkError,
              options.operation === "create" ? "create" : "observe",
              options.imageBacked === true,
            ));
      };
      const inflight: InflightRequest = { request, callback };
      this.inflight.add(inflight);
      if (options.operation !== "download") Network.performAuthorizedHttpRequest(request, callback);
      else Network.performHttpRequest(request, callback);
    });
  }
}
