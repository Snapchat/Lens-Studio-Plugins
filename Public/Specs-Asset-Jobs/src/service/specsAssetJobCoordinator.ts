import {
  createBatch,
  isTerminal,
  outputPath,
  replaceJob,
  requestsEqual,
  validateSubmit,
  type AssetRequest,
  type JobError,
  type JobState,
  type PersistedBatch,
  type PersistedJob,
  type SubmitInput,
} from "../domain/contracts.js";
import {
  RemoteOperationError,
  type RemoteStatus,
} from "./remoteProtocol.js";

const DEFAULT_POLL_INTERVAL_MS = 5_000;
/**
 * Per-call poll budget: the barrier polls for at most this long inside ONE MCP
 * call, then returns PENDING so the caller re-invokes. It deliberately does NOT
 * block for the whole generation — a multi-minute in-call poll loop holds a
 * long-lived snap::async coroutine that a GC pass / lens reset can lose ("Last
 * trigger of unfinished task is lost"), wedging the lock. Short calls bound that
 * exposure; the caller's re-invoke loop covers generations that outlast one budget.
 */
const DEFAULT_BARRIER_POLL_BUDGET_MS = 45_000;
/**
 * How long past a barrier's own timeout a held lock may live before a new call
 * treats its holder as lost and reclaims it. Both operations are bounded — the
 * barrier by `barrierTimeoutMs`, and submit by the remote adapter's per-request
 * timeout — so a healthy op always finishes well inside the hold, and this slack
 * keeps a slow-but-live op from being reclaimed while still bounding recovery from
 * a wedged one.
 */
const DEFAULT_MAX_HOLD_SLACK_MS = 60_000;
const PROJECT_CHANGED = "The Lens Studio project changed while the SPECS asset operation was active";
const SUPERSEDED = "The SPECS asset operation was superseded by a newer request";
const EMPTY_NAMES: ReadonlySet<string> = new Set();

export interface StateRepository {
  load(): PersistedBatch | null;
  save(batch: PersistedBatch): void;
}

export interface PreparedRemoteAssetSubmission {
  submit(): Promise<string>;
}

export interface RemoteAssetApi {
  prepareSubmit(request: AssetRequest): Promise<PreparedRemoteAssetSubmission>;
  getStatus(remoteJobId: string, timeoutMs?: number): Promise<RemoteStatus>;
  download(assetUrl: string, timeoutMs?: number): Promise<Uint8Array>;
}

export interface OutputFileStore {
  exists(relativePath: string): boolean;
  /**
   * `allowOverwrite` lets the write replace a file already at the path — used to
   * land a real generation over a progressive-build placeholder. Default false
   * keeps the write refusing a pre-existing path.
   */
  write(relativePath: string, bytes: Uint8Array, allowOverwrite?: boolean): void;
}

export interface CoordinatorClock {
  nowMs(): number;
  delay?(ms: number): Promise<void>;
}

export type CoordinatorStatus = "PENDING" | "READY" | "PARTIAL_FAILED" | "ACTION_REQUIRED" | "FAILED";
export type PublicError = JobError | "submission_unknown" | "collection_failed" | "output_conflict";
export type InputMode = "text" | "reference_image";

export interface PublicJobResult {
  readonly outputName: string;
  /** Echoes the accepted request modality so callers can reject a lost image handoff. */
  readonly inputMode: InputMode;
  readonly state: "PENDING" | "READY" | "FAILED" | "ACTION_REQUIRED";
  readonly outputPath?: string;
  readonly errorCode?: PublicError;
}

export interface CoordinatorSummary {
  readonly status: CoordinatorStatus;
  readonly jobs: readonly PublicJobResult[];
}

export interface CoordinatorOptions {
  readonly pollIntervalMs?: number;
  readonly barrierTimeoutMs?: number;
  readonly maxHoldMs?: number;
}

/**
 * Running out of barrier time, as distinct from a fault in the job itself. A slow
 * job is still a live job, so this must never terminalize it — the next barrier
 * resumes polling the same remote ID.
 */
class BarrierTimeout extends Error {
  constructor() {
    super("SPECS asset barrier timed out");
    this.name = "BarrierTimeout";
  }
}

function duration(value: number | undefined, fallback: number, field: string): number {
  const result = value ?? fallback;
  if (!Number.isFinite(result) || result <= 0) throw new Error(`${field} must be positive`);
  return result;
}

function assertGlb(bytes: Uint8Array): void {
  if (bytes.length < 12 || String.fromCharCode(...bytes.slice(0, 4)) !== "glTF") {
    throw new Error("SPECS response did not contain a GLB v2 file");
  }
  const header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== bytes.length) {
    throw new Error("SPECS response did not contain a GLB v2 file");
  }
}

/**
 * `queued` and `failed` are the two states we know hold no live remote job — the
 * first was never POSTed, the second reached a terminal outcome — so resubmitting
 * the same batch retries them. `submission_unknown` is deliberately excluded: its
 * POST may have landed, and a second one would duplicate the generation.
 */
function canSubmit(job: PersistedJob): boolean {
  return job.state === "queued" || job.state === "failed";
}

export class SpecsAssetJobCoordinator {
  private batch: PersistedBatch | null;
  private valid = true;
  private busy = false;
  /**
   * Identifies the current lock holder. Bumped on every acquisition so a reclaimed
   * predecessor can detect at its next checkpoint that it no longer owns the lock.
   */
  private busyEpoch = 0;
  /** Wall-clock instant after which a still-held lock is treated as abandoned. */
  private busyDeadline = 0;
  /**
   * In-flight poll-delay timers, held in a reachable ref for their whole lifetime.
   * `setTimeout` returns a `Timeout` ScriptObject that is GC-eligible the moment
   * nothing references it; a GC pass (often a lens reset / preview recreate)
   * reclaiming an in-flight timer destroys the snap::async trigger backing the
   * awaited Promise before it fires, and the host reports "Last trigger of
   * unfinished task is lost". Retaining the handle until it fires keeps the native
   * timer alive; the entry is removed inside the callback.
   */
  private readonly pendingTimers = new Set<Timeout>();
  private readonly pollIntervalMs: number;
  private readonly barrierTimeoutMs: number;
  private readonly maxHoldMs: number;

  constructor(
    private readonly repository: StateRepository,
    private readonly remote: RemoteAssetApi,
    private readonly files: OutputFileStore,
    private readonly clock: CoordinatorClock,
    options: CoordinatorOptions = {},
  ) {
    this.pollIntervalMs = duration(options.pollIntervalMs, DEFAULT_POLL_INTERVAL_MS, "poll interval");
    this.barrierTimeoutMs = duration(options.barrierTimeoutMs, DEFAULT_BARRIER_POLL_BUDGET_MS, "barrier poll budget");
    this.maxHoldMs = duration(
      options.maxHoldMs,
      this.barrierTimeoutMs + DEFAULT_MAX_HOLD_SLACK_MS,
      "max hold",
    );
    this.batch = repository.load();
  }

  submit(input: unknown): Promise<CoordinatorSummary> {
    const parsed = validateSubmit(input);
    return this.exclusive((epoch) => this.runSubmit(parsed, epoch), parsed.abandonUncertain);
  }

  barrier(): Promise<CoordinatorSummary> {
    return this.exclusive((epoch) => this.runBarrier(epoch));
  }

  invalidate(): void {
    this.valid = false;
  }

  /**
   * Serialize the coordinator's operations without letting the guard become a
   * permanent deadlock. An operation whose async frame is lost or wedged — the host
   * reports "Last trigger of unfinished task is lost", or a remote call never settles
   * — never runs its `finally`, so `busy` would otherwise stay set for the life of the
   * process and block the very barrier / abandon calls that could clear it. So reject
   * only a lock still within its max hold; reclaim one past its deadline, and let a
   * caller who explicitly abandons the in-flight batch preempt it immediately.
   */
  private async exclusive(
    operation: (epoch: number) => Promise<CoordinatorSummary>,
    preempt = false,
  ): Promise<CoordinatorSummary> {
    this.assertValid();
    const now = this.clock.nowMs();
    if (this.busy && !preempt && now < this.busyDeadline) {
      throw new Error("A SPECS asset operation is already running");
    }
    const epoch = ++this.busyEpoch;
    this.busy = true;
    this.busyDeadline = now + this.maxHoldMs;
    try {
      return await operation(epoch);
    } finally {
      // Only the current holder releases the lock; a reclaimed predecessor that later
      // resumes must not clear a successor's lock.
      if (this.busyEpoch === epoch) this.busy = false;
    }
  }

  private async runSubmit({ requests, abandonUncertain }: SubmitInput, epoch: number): Promise<CoordinatorSummary> {
    this.checkpoint(epoch);
    // A job abandoned in THIS call must not be re-POSTed in the same pass: its prior
    // POST may still be in flight in a concurrent submit that was reclaimed or
    // preempted, and a second POST would duplicate the generation. Abandoning still
    // terminalizes it so the batch frees; a later resubmit — by which point the prior
    // frame is gone — can retry it safely.
    let abandonedNow = abandonUncertain ? this.abandonUncertainJobs() : EMPTY_NAMES;
    let batch = this.batch;
    if (batch === null || !requestsEqual(batch, requests)) {
      if (batch !== null && !isTerminal(batch)) {
        throw new Error(
          this.batchBlockedMessage(batch),
        );
      }
      const conflict = requests.find(
        (request) => !request.overwriteExisting && this.files.exists(outputPath(request)),
      );
      if (conflict !== undefined) throw new Error(`OUTPUT_CONFLICT: ${outputPath(conflict)}`);
      batch = createBatch(requests);
      this.persist(batch);
      // A fresh batch has no in-flight POST to protect; suppressing a reused name here
      // would drop a new generation the caller asked for.
      abandonedNow = EMPTY_NAMES;
    }

    for (const outputName of batch.jobs.map(({ request }) => request.outputName)) {
      const job = this.requireBatch().jobs.find(({ request }) => request.outputName === outputName) as PersistedJob;
      if (!canSubmit(job) || abandonedNow.has(outputName)) continue;
      // A retry of a batch whose output path filled up in the meantime would burn a
      // generation it could never write, so re-check here and not only at creation.
      if (!job.request.overwriteExisting && this.files.exists(outputPath(job.request))) {
        this.persist(this.transition(job, {
          request: job.request,
          state: "failed",
          error: "output_conflict",
        }));
        continue;
      }

      let prepared: PreparedRemoteAssetSubmission;
      try {
        // Image bytes are prepared in memory before any ambiguous state is
        // recorded. A local source failure is therefore definitely not a POST.
        prepared = await this.remote.prepareSubmit(job.request);
        this.checkpoint(epoch);
      } catch (error) {
        this.checkpoint(epoch);
        const terminalError = this.terminalSubmissionError(error);
        if (terminalError === undefined) return this.summary(this.requireBatch());
        this.persist(this.transition(job, { request: job.request, state: "failed", error: terminalError }));
        if (terminalError === "authorization_required" || terminalError === "access_required") {
          return this.summary(this.requireBatch());
        }
        continue;
      }

      // Persist the ambiguous state immediately before POST. If Lens Studio
      // stops after the request reaches the service but before its ID is saved,
      // reload fails closed instead of creating a duplicate generation.
      this.persist(this.transition(job, { request: job.request, state: "submission_unknown" }));
      let remoteJobId: string;
      try {
        remoteJobId = await prepared.submit();
        this.checkpoint(epoch);
      } catch (error) {
        this.checkpoint(epoch);
        const terminalError = this.terminalSubmissionError(error);
        if (terminalError !== undefined) {
          this.persist(this.transition(job, { request: job.request, state: "failed", error: terminalError }));
          if (terminalError === "authorization_required" || terminalError === "access_required") {
            return this.summary(this.requireBatch());
          }
          continue;
        }
        // Stop rather than keep POSTing into a failing endpoint. This job stays
        // uncertain, but its untouched siblings stay `queued` — definitively not
        // submitted — so resubmitting the same batch retries exactly those.
        return this.summary(this.requireBatch());
      }

      try {
        this.persist(this.transition(job, { request: job.request, state: "submitted", remoteJobId }));
      } catch (error) {
        console.error("[SpecsAssetJobs] Failed to retain a submitted job ID:", error, console.None);
        return this.summary(this.requireBatch());
      }
    }
    return this.summary(this.requireBatch());
  }

  private async runBarrier(epoch: number): Promise<CoordinatorSummary> {
    const initial = this.requireBatch();
    // A queued or uncertain job needs a caller decision, but it must not hold its
    // healthy siblings hostage: collect everything the remote accepted and report
    // the unresolved jobs alongside the collected ones.
    const unresolved = initial.jobs.some(
      ({ state }) => state === "submission_unknown" || state === "queued",
    );
    if (!initial.jobs.some(({ state }) => state === "submitted")) {
      return this.summary(initial, unresolved ? "ACTION_REQUIRED" : undefined);
    }

    const deadline = this.clock.nowMs() + this.barrierTimeoutMs;
    const errors = new Map<string, PublicError>();
    const blocked = new Set<string>();

    try {
      return await this.pollUntilDeadline(deadline, epoch, unresolved, errors, blocked);
    } catch (error) {
      // Budget elapsed mid-poll (remaining() threw): not a failure — hand back a
      // summary so the caller re-invokes instead of holding a long coroutine.
      if (error instanceof BarrierTimeout) return this.budgetElapsedSummary(errors);
      throw error;
    }
  }

  /**
   * Summary for a budget that elapsed with jobs still generating. Pending jobs read as
   * PENDING and the caller re-invokes, so transient errors are dropped (retried next
   * call); auth/access failures are persistent and actionable, so surface just those as
   * ACTION_REQUIRED — a pending sibling would otherwise hide them.
   */
  private budgetElapsedSummary(errors: ReadonlyMap<string, PublicError>): CoordinatorSummary {
    const actionable = new Map<string, PublicError>();
    for (const [name, code] of errors) {
      if (code === "authorization_required" || code === "access_required") actionable.set(name, code);
    }
    if (actionable.size === 0) return this.summary(this.requireBatch());
    return this.summary(this.requireBatch(), "ACTION_REQUIRED", actionable);
  }

  private async pollUntilDeadline(
    deadline: number,
    epoch: number,
    unresolved: boolean,
    errors: Map<string, PublicError>,
    blocked: Set<string>,
  ): Promise<CoordinatorSummary> {
    while (true) {
      let pending = false;
      for (const job of this.requireBatch().jobs) {
        if (job.state !== "submitted" || job.remoteJobId === undefined || blocked.has(job.request.outputName)) {
          continue;
        }
        const name = job.request.outputName;
        const path = outputPath(job.request);
        if (!job.request.overwriteExisting && this.files.exists(path)) {
          // Something outside this service owns that path now. Nothing we do later
          // can change that, so record it as terminal — otherwise the job sits at
          // `submitted` forever and the batch can never be replaced. A job that
          // opted into overwriteExisting expects a placeholder here and skips this.
          this.persist(this.transition(job, {
            request: job.request,
            state: "failed",
            error: "output_conflict",
          }));
          blocked.add(name);
          continue;
        }

        let status: RemoteStatus;
        try {
          status = await this.remote.getStatus(job.remoteJobId, this.remaining(deadline));
          this.checkpoint(epoch);
        } catch (error) {
          if (error instanceof BarrierTimeout) throw error;
          this.checkpoint(epoch);
          if (error instanceof RemoteOperationError && error.kind === "retryable") {
            pending = true;
            continue;
          }
          this.recordFailure(job, error, errors, blocked);
          continue;
        }

        if (status.state === "pending") {
          errors.delete(name);
          pending = true;
        } else if (status.state === "failed") {
          this.persist(this.transition(job, {
            request: job.request,
            state: "failed",
            error: "generation_failed",
          }));
        } else {
          try {
            const bytes = await this.download(job.remoteJobId, status.assetUrl, deadline, epoch);
            this.checkpoint(epoch);
            assertGlb(bytes);
            this.files.write(path, bytes, job.request.overwriteExisting);
            this.persist(this.transition(job, { request: job.request, state: "collected" }));
            errors.delete(name);
          } catch (error) {
            if (error instanceof BarrierTimeout) throw error;
            this.checkpoint(epoch);
            this.recordFailure(job, error, errors, blocked);
          }
        }
      }

      if (!pending) {
        return this.summary(
          this.requireBatch(),
          unresolved || errors.size > 0 ? "ACTION_REQUIRED" : undefined,
          errors,
        );
      }
      if (this.clock.nowMs() >= deadline) {
        // Budget elapsed with jobs still generating: return so the caller re-invokes,
        // rather than holding this coroutine open for minutes (what a GC pass loses).
        return this.budgetElapsedSummary(errors);
      }
      await this.delay(Math.min(this.pollIntervalMs, deadline - this.clock.nowMs()), epoch);
    }
  }

  private async download(remoteJobId: string, assetUrl: string, deadline: number, epoch: number): Promise<Uint8Array> {
    let currentUrl = assetUrl;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (!currentUrl.toLowerCase().startsWith("https://")) throw new Error("SPECS returned a non-HTTPS asset URL");
      try {
        return await this.remote.download(currentUrl, this.remaining(deadline));
      } catch (error) {
        this.checkpoint(epoch);
        if (!(error instanceof RemoteOperationError) || attempt > 0) throw error;
        if (error.kind === "retryable") {
          await this.delay(Math.min(this.pollIntervalMs, this.remaining(deadline)), epoch);
          continue;
        }
        if (error.kind === "signed_url_expired") {
          const refreshed = await this.remote.getStatus(remoteJobId, this.remaining(deadline));
          this.checkpoint(epoch);
          if (refreshed.state !== "ready") throw new Error("SPECS did not refresh the asset URL");
          currentUrl = refreshed.assetUrl;
          continue;
        }
        throw error;
      }
    }
    throw new Error("SPECS asset download failed");
  }

  private transition(job: PersistedJob, replacement: PersistedJob): PersistedBatch {
    return replaceJob(this.requireBatch(), job.request.outputName, replacement);
  }

  private terminalSubmissionError(error: unknown): JobError | undefined {
    if (!(error instanceof RemoteOperationError)) return undefined;
    switch (error.kind) {
      case "authorization_required": return "authorization_required";
      case "access_required": return "access_required";
      case "reference_image_invalid": return "reference_image_invalid";
      case "reference_image_too_large": return "reference_image_too_large";
      case "terminal": return "generation_failed";
      default: return undefined;
    }
  }

  private persist(batch: PersistedBatch): void {
    this.repository.save(batch);
    this.batch = batch;
  }

  private requireBatch(): PersistedBatch {
    if (this.batch === null) throw new Error("No retained SPECS asset batch exists");
    return this.batch;
  }

  private summary(
    batch: PersistedBatch,
    override?: CoordinatorStatus,
    errors: ReadonlyMap<string, PublicError> = new Map(),
  ): CoordinatorSummary {
    const states = new Set(batch.jobs.map(({ state }) => state));
    const needsAction = states.has("submission_unknown") || batch.jobs.some(({ error }) =>
      error === "authorization_required" || error === "access_required"
    );
    const status = override ?? (needsAction
      ? "ACTION_REQUIRED"
      : states.has("queued") || states.has("submitted")
        ? "PENDING"
        : states.has("collected") && states.has("failed")
          ? "PARTIAL_FAILED"
          : states.has("collected") ? "READY" : "FAILED");
    return {
      status,
      jobs: batch.jobs.map((job): PublicJobResult => {
        const errorCode = errors.get(job.request.outputName) ??
          (job.state === "submission_unknown" ? "submission_unknown" : job.error);
        const state: PublicJobResult["state"] = errorCode === "submission_unknown" || errors.has(job.request.outputName)
          ? "ACTION_REQUIRED"
          : job.state === "collected" ? "READY" : job.state === "failed" ? "FAILED" : "PENDING";
        return {
          outputName: job.request.outputName,
          inputMode: job.request.referenceImagePath === undefined ? "text" : "reference_image",
          state,
          ...(job.state === "collected" ? { outputPath: outputPath(job.request) } : {}),
          ...(errorCode === undefined ? {} : { errorCode }),
        };
      }),
    };
  }

  /**
   * Release jobs whose POST outcome is unknown so the batch can terminalize, and
   * return their names so the caller does not re-POST them in the same pass. The
   * remote generation they may have started is left to expire on its own; that is
   * the cost the caller accepts by asking for this, and it is still cheaper than a
   * project whose asset batch can never be replaced.
   */
  private abandonUncertainJobs(): ReadonlySet<string> {
    const abandoned = new Set<string>();
    for (const job of this.batch?.jobs ?? []) {
      if (job.state !== "submission_unknown") continue;
      abandoned.add(job.request.outputName);
      this.persist(this.transition(job, {
        request: job.request,
        state: "failed",
        error: "abandoned",
      }));
    }
    return abandoned;
  }

  /**
   * Name what is holding the retained batch open, and the way out. The caller sees
   * only this text, so a bare "batch is active" would leave it with no next move.
   */
  private batchBlockedMessage(batch: PersistedBatch): string {
    const describe = (state: JobState): string => batch.jobs
      .filter((job) => job.state === state)
      .map(({ request }) => request.outputName)
      .join(", ");
    const uncertain = describe("submission_unknown");
    if (uncertain) {
      return `A SPECS asset batch is unresolved: the submission outcome for ${uncertain} is unknown, ` +
        "so a remote generation may already be running. Resubmit the same requests to retry any " +
        "definitely-unsubmitted sibling, or resubmit with abandonUncertain: true to give up on it and " +
        "start a different batch.";
    }
    const active = [describe("submitted"), describe("queued")].filter(Boolean).join(", ");
    return `A different SPECS asset batch is still active (${active}). ` +
      "Call AwaitSpecsAssetJobsBarrier to finish it before submitting different requests.";
  }

  /**
   * Decide whether a failure while observing or collecting a job can still clear.
   * Authorization gaps, barrier timeouts, and transient transport failures keep
   * the retained remote ID for a later barrier. Permanent protocol, payload, or
   * write failures become terminal; leaving those `submitted` would pin the batch
   * open forever.
   */
  private recordFailure(
    job: PersistedJob,
    error: unknown,
    errors: Map<string, PublicError>,
    blocked: Set<string>,
  ): void {
    const code = this.publicError(error);
    blocked.add(job.request.outputName);
    const retryableCollection = error instanceof RemoteOperationError && (
      error.kind === "retryable" || error.kind === "signed_url_expired"
    );
    if (code !== "collection_failed" || retryableCollection) {
      errors.set(job.request.outputName, code);
      return;
    }
    this.persist(this.transition(job, {
      request: job.request,
      state: "failed",
      error: "collection_failed",
    }));
  }

  private publicError(error: unknown): PublicError {
    if (error instanceof RemoteOperationError) {
      if (error.kind === "authorization_required") return "authorization_required";
      if (error.kind === "access_required") return "access_required";
    }
    return "collection_failed";
  }

  private remaining(deadline: number): number {
    const remaining = deadline - this.clock.nowMs();
    if (remaining <= 0) throw new BarrierTimeout();
    return remaining;
  }

  private async delay(ms: number, epoch: number): Promise<void> {
    if (this.clock.delay !== undefined) {
      await this.clock.delay(ms);
    } else {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          this.pendingTimers.delete(timer);
          resolve();
        }, ms);
        this.pendingTimers.add(timer);
      });
    }
    this.checkpoint(epoch);
  }

  private assertValid(): void {
    if (!this.valid) throw new Error(PROJECT_CHANGED);
  }

  /**
   * The resume guard run after every await. A stale operation is failed two ways: the
   * project changed underneath it, or a newer request reclaimed the lock (its
   * predecessor presumed lost). Either aborts before it mutates retained state, so a
   * stranded frame can never race the operation that replaced it.
   *
   * Reaching a checkpoint also proves progress, so it heartbeats the lease — the max
   * hold sizes one bounded step, not a whole multi-request submit that could otherwise
   * be reclaimed mid-POST. A wedged frame never reaches here, so its lease still lapses.
   */
  private checkpoint(epoch: number): void {
    this.assertValid();
    if (this.busyEpoch !== epoch) throw new Error(SUPERSEDED);
    this.busyDeadline = this.clock.nowMs() + this.maxHoldMs;
  }
}
