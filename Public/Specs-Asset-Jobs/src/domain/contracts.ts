export type OutputQuality = "compact" | "balanced" | "standard";
export type GenerationQuality = "fast" | "balanced" | "high";

export const GENERATED_MESH_DIRECTORY = "Assets/GeneratedMeshes";

/**
 * Largest batch a single retained batch may hold. Not a backend constraint —
 * SPECS jobs POST individually and excess is queued server-side — but a bound
 * that keeps one project's retained batch to a realistic build's worth of
 * meshes. The submit input validation, the persisted-record validation, and the
 * tool's `maxItems` all key off this and must stay in agreement.
 */
export const MAX_BATCH_REQUESTS = 16;

export interface AssetRequest {
  readonly outputName: string;
  readonly prompt: string;
  /** An absolute image path used only to create the initial remote job. */
  readonly referenceImagePath?: string;
  readonly negativePrompt?: string;
  readonly style?: string;
  readonly seed?: number;
  readonly outputQuality?: OutputQuality;
  readonly previewQuality?: GenerationQuality;
  readonly reconstructionQuality?: GenerationQuality;
  /**
   * Allow the collected GLB to replace a file already at the output path. A
   * progressive build writes a primitive placeholder to the mesh's final path
   * (`Assets/GeneratedMeshes/<Name>.glb`) so the scene is visible early; the real
   * generation is meant to overwrite that placeholder in place. Without this the
   * pre-existing placeholder reads as a foreign `output_conflict` and the job can
   * never collect. Left unset, the path-collision guard stays fully in force.
   */
  readonly overwriteExisting?: boolean;
}

export type JobState = "queued" | "submitted" | "collected" | "failed" | "submission_unknown";
export type JobError =
  | "authorization_required"
  | "access_required"
  | "generation_failed"
  | "output_conflict"
  | "collection_failed"
  | "reference_image_invalid"
  | "reference_image_too_large"
  | "abandoned";

/**
 * A caller mistake in the tool arguments, as opposed to an internal or remote
 * fault. The message names the offending field and its constraint, so the tools
 * return it verbatim — the model can correct itself instead of stopping.
 */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

export interface PersistedJob {
  readonly request: AssetRequest;
  readonly state: JobState;
  readonly remoteJobId?: string;
  readonly error?: JobError;
}

export interface PersistedBatch {
  readonly schemaVersion: 1;
  readonly jobs: readonly PersistedJob[];
}

const OUTPUT_QUALITIES: readonly OutputQuality[] = ["compact", "balanced", "standard"];
const GENERATION_QUALITIES: readonly GenerationQuality[] = ["fast", "balanced", "high"];
const JOB_STATES: readonly JobState[] = ["queued", "submitted", "collected", "failed", "submission_unknown"];
const JOB_ERRORS: readonly JobError[] = [
  "authorization_required",
  "access_required",
  "generation_failed",
  "output_conflict",
  "collection_failed",
  "reference_image_invalid",
  "reference_image_too_large",
  "abandoned",
];
const RESERVED_OUTPUT = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

function record(value: unknown, field: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new InputError(`${field} must be an object`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string, maximum: number): string {
  if (typeof value !== "string") throw new InputError(`${field} must be a string`);
  const result = value.trim();
  if (!result || result.length > maximum || /[\u0000-\u001f\u007f]/.test(result)) {
    throw new InputError(`${field} must contain 1-${maximum} safe characters`);
  }
  return result;
}

function optionalText(value: unknown, field: string, maximum: number): string | undefined {
  return value === undefined ? undefined : text(value, field, maximum);
}

function optionalAbsolutePath(value: unknown, field: string): string | undefined {
  const result = optionalText(value, field, 4_096);
  if (result !== undefined && !(/^(?:\/|[A-Za-z]:[\\/])/.test(result))) {
    throw new InputError(`${field} must be an absolute file path`);
  }
  return result;
}

function request(value: unknown, index: number): AssetRequest {
  const raw = record(value, `requests[${index}]`);
  const outputName = text(raw.outputName, `requests[${index}].outputName`, 80);
  if (!/^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(outputName) || RESERVED_OUTPUT.test(outputName)) {
    throw new InputError(`requests[${index}].outputName is not a safe asset name`);
  }
  if (
    raw.seed !== undefined &&
    (!Number.isInteger(raw.seed) || (raw.seed as number) < 0 || (raw.seed as number) > 4_294_967_295)
  ) {
    throw new InputError(`requests[${index}].seed must be an unsigned 32-bit integer`);
  }
  if (raw.outputQuality !== undefined && !OUTPUT_QUALITIES.includes(raw.outputQuality as OutputQuality)) {
    throw new InputError(`requests[${index}].outputQuality is invalid`);
  }
  for (const field of ["previewQuality", "reconstructionQuality"] as const) {
    if (raw[field] !== undefined && !GENERATION_QUALITIES.includes(raw[field] as GenerationQuality)) {
      throw new InputError(`requests[${index}].${field} is invalid`);
    }
  }
  if (raw.overwriteExisting !== undefined && typeof raw.overwriteExisting !== "boolean") {
    throw new InputError(`requests[${index}].overwriteExisting must be a boolean`);
  }
  return {
    outputName,
    prompt: text(raw.prompt, `requests[${index}].prompt`, 1500),
    referenceImagePath: optionalAbsolutePath(raw.referenceImagePath, `requests[${index}].referenceImagePath`),
    negativePrompt: optionalText(raw.negativePrompt, `requests[${index}].negativePrompt`, 1000),
    style: optionalText(raw.style, `requests[${index}].style`, 500),
    seed: raw.seed as number | undefined,
    outputQuality: raw.outputQuality as OutputQuality | undefined,
    previewQuality: raw.previewQuality as GenerationQuality | undefined,
    reconstructionQuality: raw.reconstructionQuality as GenerationQuality | undefined,
    // Normalize to `true`-or-absent so a persisted batch reparses identically to
    // the submitted one (requestsEqual is a JSON compare).
    overwriteExisting: raw.overwriteExisting === true ? true : undefined,
  };
}

export interface SubmitInput {
  readonly requests: readonly AssetRequest[];
  /**
   * Give up on jobs whose POST outcome is unknown, accepting that a remote
   * generation may already be running for them, so the batch can reach a
   * terminal state. An uncertain submission is never resolvable by observation
   * — we hold no remote job ID to read — so releasing it has to be a deliberate
   * caller decision rather than something this service infers.
   */
  readonly abandonUncertain: boolean;
}

export function validateSubmit(value: unknown): SubmitInput {
  const raw = record(value, "Submit input");
  if (!Array.isArray(raw.requests) || raw.requests.length < 1 || raw.requests.length > MAX_BATCH_REQUESTS) {
    throw new InputError(`SPECS asset batches must contain between 1 and ${MAX_BATCH_REQUESTS} requests`);
  }
  if (raw.abandonUncertain !== undefined && typeof raw.abandonUncertain !== "boolean") {
    throw new InputError("abandonUncertain must be a boolean");
  }
  const requests = raw.requests.map(request);
  const names = requests.map(({ outputName }) => outputName.toLocaleLowerCase("en-US"));
  if (new Set(names).size !== names.length) throw new InputError("outputName values must be distinct");
  return { requests, abandonUncertain: raw.abandonUncertain === true };
}

export function outputPath({ outputName }: AssetRequest): string {
  return `${GENERATED_MESH_DIRECTORY}/${outputName}.glb`;
}

export function createBatch(requests: readonly AssetRequest[]): PersistedBatch {
  return {
    schemaVersion: 1,
    jobs: requests.map((current) => ({ request: current, state: "queued" })),
  };
}

export function replaceJob(
  batch: PersistedBatch,
  outputName: string,
  replacement: PersistedJob,
): PersistedBatch {
  return {
    ...batch,
    jobs: batch.jobs.map((job) => job.request.outputName === outputName ? replacement : job),
  };
}

export function requestsEqual(batch: PersistedBatch, requests: readonly AssetRequest[]): boolean {
  return JSON.stringify(batch.jobs.map(({ request }) => request)) === JSON.stringify(requests);
}

export function isTerminal(batch: PersistedBatch): boolean {
  return batch.jobs.every(({ state }) => state === "collected" || state === "failed");
}

export function parsePersistedBatch(value: unknown): PersistedBatch {
  const raw = record(value, "Persisted state");
  if (raw.schemaVersion !== 1 || !Array.isArray(raw.jobs) || raw.jobs.length < 1 || raw.jobs.length > MAX_BATCH_REQUESTS) {
    throw new Error("Incompatible SPECS asset state");
  }
  const jobs = raw.jobs.map((valueAtIndex, index): PersistedJob => {
    const job = record(valueAtIndex, `jobs[${index}]`);
    const state = job.state as JobState;
    if (!JOB_STATES.includes(state)) throw new Error(`Invalid state at jobs[${index}]`);
    const parsedRequest = request(job.request, index);
    const remoteJobId = job.remoteJobId === undefined
      ? undefined
      : text(job.remoteJobId, `jobs[${index}].remoteJobId`, 500);
    const error = job.error as JobError | undefined;
    if (error !== undefined && !JOB_ERRORS.includes(error)) throw new Error(`Invalid error at jobs[${index}]`);
    if ((state === "submitted") !== (remoteJobId !== undefined)) {
      throw new Error(`Invalid remote job ID at jobs[${index}]`);
    }
    if ((state === "failed") !== (error !== undefined)) {
      throw new Error(`Invalid error at jobs[${index}]`);
    }
    return { request: parsedRequest, state, remoteJobId, error };
  });
  const names = jobs.map(({ request: current }) => current.outputName.toLocaleLowerCase("en-US"));
  if (new Set(names).size !== names.length) throw new Error("Persisted output names must be distinct");
  return { schemaVersion: 1, jobs };
}
