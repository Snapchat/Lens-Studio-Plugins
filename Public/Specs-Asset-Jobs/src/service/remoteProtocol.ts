import type { AssetRequest } from "../domain/contracts.js";

export type RemoteStatus =
  | { readonly state: "pending" }
  | { readonly state: "ready"; readonly assetUrl: string }
  | { readonly state: "failed" };

export type RemoteErrorKind =
  | "authorization_required"
  | "access_required"
  | "retryable"
  | "signed_url_expired"
  | "submission_unknown"
  | "reference_image_invalid"
  | "reference_image_too_large"
  | "terminal";

export class RemoteOperationError extends Error {
  constructor(message: string, readonly kind: RemoteErrorKind) {
    super(message);
    this.name = "RemoteOperationError";
  }
}

export function createSubmitBody(
  request: AssetRequest,
  inputImageDataUrl?: string,
): Record<string, unknown> {
  return {
    prompt: request.prompt,
    ...(inputImageDataUrl === undefined ? {} : { input_image_data_url: inputImageDataUrl }),
    ...(request.negativePrompt === undefined ? {} : { negative_prompt: request.negativePrompt }),
    ...(request.style === undefined ? {} : { style: request.style }),
    ...(request.seed === undefined ? {} : { seed: request.seed }),
    ...(request.outputQuality === undefined ? {} : { output_quality: request.outputQuality }),
    ...(request.previewQuality === undefined ? {} : { preview_quality: request.previewQuality }),
    ...(request.reconstructionQuality === undefined
      ? {}
      : { reconstruction_quality: request.reconstructionQuality }),
  };
}

export function parseJson(text: string, kind: RemoteErrorKind): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RemoteOperationError("SPECS returned invalid JSON", kind);
  }
}

export function parseSubmittedJobId(payload: unknown): string {
  const jobId = payload !== null && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>).job_id
    : undefined;
  if (typeof jobId !== "string" || !jobId) {
    throw new RemoteOperationError("SPECS create response did not contain job_id", "submission_unknown");
  }
  return jobId;
}

export function parseStatus(payload: unknown): RemoteStatus {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new RemoteOperationError("SPECS status response was invalid", "terminal");
  }
  const body = payload as Record<string, unknown>;
  const status = typeof body.status === "string" ? body.status.toLowerCase() : "";
  if (["queued", "running", "image_generated"].includes(status)) return { state: "pending" };
  if (status === "failed" || status === "canceled") return { state: "failed" };
  if (status === "succeeded" && typeof body.asset_url === "string" && body.asset_url) {
    return { state: "ready", assetUrl: body.asset_url };
  }
  throw new RemoteOperationError("SPECS status response was incomplete or unrecognized", "terminal");
}

export function classifyHttpFailure(
  statusCode: number,
  networkError: string | null,
  operation: "create" | "observe",
  imageBacked = false,
): RemoteOperationError {
  if (statusCode === 401) return new RemoteOperationError("SPECS authorization is required", "authorization_required");
  if (statusCode === 403) return new RemoteOperationError("SPECS access is required", "access_required");
  if (statusCode === 413 && operation === "create" && imageBacked) {
    return new RemoteOperationError("The reference image is too large for SPECS image-to-3D", "reference_image_too_large");
  }
  const transient = [0, 408, 429, 500, 502, 503, 504].includes(statusCode);
  const kind: RemoteErrorKind = transient
    ? operation === "create" ? "submission_unknown" : "retryable"
    : "terminal";
  return new RemoteOperationError(networkError ?? `SPECS request returned HTTP ${statusCode}`, kind);
}

export function classifyDownloadFailure(statusCode: number, networkError: string | null): RemoteOperationError {
  return statusCode === 401 || statusCode === 403
    ? new RemoteOperationError("The signed SPECS download URL expired", "signed_url_expired")
    : classifyHttpFailure(statusCode, networkError, "observe");
}
