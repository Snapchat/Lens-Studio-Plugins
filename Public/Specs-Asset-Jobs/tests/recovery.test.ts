/**
 * Fault-injection cases for the paths a happy-path build never reaches.
 *
 * The governing rule is that no single failure may leave a project permanently
 * unable to make progress. A retained batch that can never terminalize is a dead
 * end, because the builder is forbidden from generating a service-owned mesh by
 * any other route — so every failure here has to end in either a retry that is
 * provably safe or a terminal state that frees the batch.
 */
import { createBatch, InputError, parsePersistedBatch, type PersistedBatch } from "../src/domain/contracts.js";
import { durableWrite, type OverwriteCapableFs } from "../src/persistence/durableWrite.js";
import {
  PersistedBatchJournal,
  type StateFileSystem,
} from "../src/persistence/stateJournal.js";
import type { RemoteStatus } from "../src/service/remoteProtocol.js";
import { RemoteOperationError } from "../src/service/remoteProtocol.js";
import { toolErrorMessage } from "../src/tools/toolErrors.js";
import { glb, input, jobState, notGlb, setup } from "./fakes.js";
import { assert, deferred, equal, rejects, run, test } from "./harness.js";

const uncertain = (): Error => new RemoteOperationError("timeout", "submission_unknown");

class FakeStateFiles implements StateFileSystem<string> {
  readonly contents = new Map<string, string>();
  failRename: string | null = null;

  exists(path: string): boolean {
    return this.contents.has(path);
  }

  read(path: string): string {
    const contents = this.contents.get(path);
    if (contents === undefined) throw new Error(`Missing ${path}`);
    return contents;
  }

  write(path: string, contents: string): void {
    this.contents.set(path, contents);
  }

  remove(path: string): void {
    this.contents.delete(path);
  }

  rename(from: string, to: string): void {
    if (`${from}->${to}` === this.failRename) throw new Error("injected rename failure");
    const contents = this.read(from);
    if (this.exists(to)) throw new Error(`Destination exists: ${to}`);
    this.contents.delete(from);
    this.contents.set(to, contents);
  }
}

const statePaths = { primary: "state", backup: "backup", temporary: "temporary" } as const;

function journal(files: FakeStateFiles): PersistedBatchJournal<string> {
  return new PersistedBatchJournal(files, statePaths);
}

function retainedBatch(name: string): PersistedBatch {
  return createBatch([{ outputName: name, prompt: `Generate ${name}` }]);
}

test("a transient create failure leaves untouched siblings submittable", async () => {
  const current = setup();
  current.remote.submits.push(uncertain());

  equal((await current.coordinator.submit(input(["Crate", "Robot"]))).status, "ACTION_REQUIRED");
  equal(current.remote.submitCalls.join(","), "Crate", "stopped POSTing after the failure");
  equal(jobState(current.repository, "Crate"), "submission_unknown");
  equal(jobState(current.repository, "Robot"), "queued", "sibling was never POSTed");

  // Resubmitting the same batch must retry only the definitely-unsubmitted job.
  current.remote.submits.push("job-robot");
  equal((await current.coordinator.submit(input(["Crate", "Robot"]))).status, "ACTION_REQUIRED");
  equal(current.remote.submitCalls.join(","), "Crate,Robot", "Crate must not be POSTed twice");
  equal(jobState(current.repository, "Robot"), "submitted");
});

test("an invalid reference image fails before any POST or ambiguous submission state", async () => {
  const current = setup();
  current.remote.preparations.push(new RemoteOperationError(
    "Reference image does not exist",
    "reference_image_invalid",
  ));
  const imageInput = {
    requests: [{
      outputName: "Lantern",
      prompt: "Generate lantern",
      referenceImagePath: "/tmp/missing-lantern.png",
    }],
  };

  const result = await current.coordinator.submit(imageInput);
  equal(result.status, "FAILED");
  equal(result.jobs[0]?.errorCode, "reference_image_invalid");
  equal(jobState(current.repository, "Lantern"), "failed:reference_image_invalid");
  equal(current.remote.submitCalls.length, 0, "invalid local input must not initiate a POST");
  assert(
    !current.repository.writes.some(({ jobs }) => jobs[0]?.state === "submission_unknown"),
    "invalid local input must not be persisted as a possibly-submitted job",
  );
});

test("an invalid image job does not block a valid sibling from collection", async () => {
  const current = setup();
  current.remote.preparations.push(
    new RemoteOperationError("Reference image does not exist", "reference_image_invalid"),
  );
  current.remote.submits.push("job-crate");
  const mixedInput = {
    requests: [
      { outputName: "Lantern", prompt: "Generate lantern", referenceImagePath: "/tmp/missing-lantern.png" },
      { outputName: "Crate", prompt: "Generate crate" },
    ],
  };

  equal((await current.coordinator.submit(mixedInput)).status, "PENDING");
  equal(jobState(current.repository, "Lantern"), "failed:reference_image_invalid");
  equal(jobState(current.repository, "Crate"), "submitted");
  equal(current.remote.submitCalls.join(","), "Crate", "invalid input must not block a healthy sibling POST");

  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  const collected = await current.coordinator.barrier();
  equal(collected.status, "PARTIAL_FAILED");
  equal(collected.jobs.find(({ outputName }) => outputName === "Lantern")?.errorCode, "reference_image_invalid");
  equal(collected.jobs.find(({ outputName }) => outputName === "Crate")?.state, "READY");
});

test("an image-too-large create response is terminal and does not retry", async () => {
  const current = setup();
  current.remote.submits.push(new RemoteOperationError(
    "Reference image is too large",
    "reference_image_too_large",
  ));
  const imageInput = {
    requests: [{
      outputName: "Lantern",
      prompt: "Generate lantern",
      referenceImagePath: "/tmp/lantern.png",
    }],
  };

  const failed = await current.coordinator.submit(imageInput);
  equal(failed.status, "FAILED");
  equal(failed.jobs[0]?.errorCode, "reference_image_too_large");
  equal(jobState(current.repository, "Lantern"), "failed:reference_image_too_large");

  current.remote.submits.push("job-lantern-retry");
  equal((await current.coordinator.submit(imageInput)).status, "PENDING");
  equal(current.remote.submitCalls.length, 2, "a later explicit resubmission is the only retry");
});

test("an oversized image job does not block a valid sibling from collection", async () => {
  const current = setup();
  current.remote.submits.push(
    new RemoteOperationError("Reference image is too large", "reference_image_too_large"),
    "job-crate",
  );
  const mixedInput = {
    requests: [
      { outputName: "Lantern", prompt: "Generate lantern", referenceImagePath: "/tmp/lantern.png" },
      { outputName: "Crate", prompt: "Generate crate" },
    ],
  };

  equal((await current.coordinator.submit(mixedInput)).status, "PENDING");
  equal(jobState(current.repository, "Lantern"), "failed:reference_image_too_large");
  equal(jobState(current.repository, "Crate"), "submitted");
  equal(current.remote.submitCalls.join(","), "Lantern,Crate", "a 413 must not block a healthy sibling POST");

  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  equal((await current.coordinator.barrier()).status, "PARTIAL_FAILED");
});

test("a v1 text-only record remains compatible when image input is optional", () => {
  const record = createBatch([{ outputName: "Crate", prompt: "Generate Crate" }]);
  const parsed = JSON.parse(JSON.stringify(record));
  const restored = parsePersistedBatch(parsed);
  equal(restored.schemaVersion, 1);
  equal(restored.jobs[0]?.request.referenceImagePath, undefined);
});

test("the barrier collects healthy siblings of an uncertain job", async () => {
  const current = setup();
  current.remote.submits.push("job-crate", uncertain());
  await current.coordinator.submit(input(["Crate", "Robot"]));
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());

  const result = await current.coordinator.barrier();
  equal(result.status, "ACTION_REQUIRED", "the uncertain job still needs a decision");
  assert(current.files.exists("Assets/GeneratedMeshes/Crate.glb"), "healthy sibling was not collected");
  equal(result.jobs.find(({ outputName }) => outputName === "Crate")?.state, "READY");
  equal(
    result.jobs.find(({ outputName }) => outputName === "Robot")?.errorCode,
    "submission_unknown",
  );
});

test("a different batch is refused with the way out named", async () => {
  const current = setup();
  current.remote.submits.push(uncertain());
  await current.coordinator.submit(input(["Crate"]));

  await rejects(current.coordinator.submit(input(["Anvil"])), /abandonUncertain/);
});

test("abandoning an uncertain job frees the batch", async () => {
  const current = setup();
  current.remote.submits.push(uncertain());
  await current.coordinator.submit(input(["Crate"]));

  current.remote.submits.push("job-anvil");
  const result = await current.coordinator.submit(input(["Anvil"], { abandonUncertain: true }));
  equal(result.status, "PENDING");
  equal(current.remote.submitCalls.join(","), "Crate,Anvil", "the abandoned job must not be replayed");
  equal(jobState(current.repository, "Anvil"), "submitted");
});

test("an occupied output path fails that job without blocking its siblings", async () => {
  const current = setup();
  current.remote.submits.push("job-crate", "job-robot");
  await current.coordinator.submit(input(["Crate", "Robot"]));
  // Something outside the service claimed Crate's path while the batch was running.
  current.files.files.set("Assets/GeneratedMeshes/Crate.glb", glb(9));
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/robot.glb" });
  current.remote.downloads.push(glb());

  const result = await current.coordinator.barrier();
  equal(result.status, "PARTIAL_FAILED", "a terminal per-job failure is not a caller decision");
  equal(result.jobs.find(({ outputName }) => outputName === "Crate")?.errorCode, "output_conflict");
  equal(jobState(current.repository, "Crate"), "failed:output_conflict");
  assert(current.files.exists("Assets/GeneratedMeshes/Robot.glb"), "sibling was not collected");

  // The batch is terminal, so the next build step can start a different one.
  current.remote.submits.push("job-anvil");
  equal((await current.coordinator.submit(input(["Anvil"]))).status, "PENDING");
});

test("a payload that is not a GLB is terminal, not a permanent pending job", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(notGlb());

  equal((await current.coordinator.barrier()).status, "FAILED");
  equal(jobState(current.repository, "Crate"), "failed:collection_failed");
  assert(!current.files.exists("Assets/GeneratedMeshes/Crate.glb"), "invalid bytes were written");

  current.remote.submits.push("job-crate-2");
  equal((await current.coordinator.submit(input(["Crate"]))).status, "PENDING", "batch was not freed");
});

test("an authorization gap during the barrier stays retryable", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));
  current.remote.statuses.push(
    new RemoteOperationError("signed out", "authorization_required"),
  );

  const blocked = await current.coordinator.barrier();
  equal(blocked.status, "ACTION_REQUIRED");
  equal(blocked.jobs[0]?.errorCode, "authorization_required");
  equal(jobState(current.repository, "Crate"), "submitted", "sign-in clears, so keep the job");

  // After signing in, the same job collects without a new remote generation.
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  equal((await current.coordinator.barrier()).status, "READY");
  equal(current.remote.submitCalls.length, 1, "recovery must not recreate the job");
});

test("an auth gap surfaces as ACTION_REQUIRED even when a sibling holds the budget open", async () => {
  const current = setup(null, { barrierTimeoutMs: 1 });
  current.remote.submits.push("job-crate", "job-robot");
  await current.coordinator.submit(input(["Crate", "Robot"]));

  // Crate hits an auth gap while Robot keeps generating, so the budget elapses with a
  // sibling still pending. The auth signal must still reach the caller, not read as PENDING.
  current.remote.statuses.push(
    new RemoteOperationError("signed out", "authorization_required"),
    { state: "pending" },
  );

  const result = await current.coordinator.barrier();
  equal(result.status, "ACTION_REQUIRED");
  equal(result.jobs.find(({ outputName }) => outputName === "Crate")?.errorCode, "authorization_required");
  equal(result.jobs.find(({ outputName }) => outputName === "Robot")?.state, "PENDING");
  equal(jobState(current.repository, "Crate"), "submitted", "sign-in clears, so the job is kept");
});

test("a terminal status failure frees the retained batch", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));
  current.remote.statuses.push(new RemoteOperationError("job not found", "terminal"));

  const failed = await current.coordinator.barrier();
  equal(failed.status, "FAILED");
  equal(failed.jobs[0]?.errorCode, "collection_failed");
  equal(jobState(current.repository, "Crate"), "failed:collection_failed");

  current.remote.submits.push("job-anvil");
  equal((await current.coordinator.submit(input(["Anvil"]))).status, "PENDING");
});

test("a terminal download failure frees the retained batch", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(new RemoteOperationError("asset is gone", "terminal"));

  const failed = await current.coordinator.barrier();
  equal(failed.status, "FAILED");
  equal(failed.jobs[0]?.errorCode, "collection_failed");
  equal(jobState(current.repository, "Crate"), "failed:collection_failed");

  current.remote.submits.push("job-anvil");
  equal((await current.coordinator.submit(input(["Anvil"]))).status, "PENDING");
});

test("an exhausted transient download keeps the remote job retryable", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(
    new RemoteOperationError("temporarily unavailable", "retryable"),
    new RemoteOperationError("still unavailable", "retryable"),
  );

  const blocked = await current.coordinator.barrier();
  equal(blocked.status, "ACTION_REQUIRED");
  equal(blocked.jobs[0]?.errorCode, "collection_failed");
  equal(jobState(current.repository, "Crate"), "submitted", "transient transport must retain the remote ID");

  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  equal((await current.coordinator.barrier()).status, "READY");
  equal(current.remote.submitCalls.length, 1, "recovery must not recreate the job");
});

test("a slow job returns PENDING and keeps polling on the next barrier", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));
  const status = deferred<RemoteStatus>();
  current.remote.statuses.push(status.promise);

  const barrier = current.coordinator.barrier();
  current.clock.now = 100;
  status.resolve({ state: "ready", assetUrl: "https://provider.example/crate.glb" });

  const slow = await barrier;
  equal(slow.status, "PENDING", "poll budget elapsed but the job is still generating, not failed");
  equal(slow.jobs[0]?.errorCode, undefined, "a still-generating job carries no error");
  equal(slow.jobs[0]?.state, "PENDING");
  equal(jobState(current.repository, "Crate"), "submitted", "a slow job is not a failed job");

  current.remote.statuses.length = 0;
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  equal((await current.coordinator.barrier()).status, "READY");
});

test("a failure message is actionable without leaking remote detail", () => {
  equal(
    toolErrorMessage(new InputError("requests[1].outputName is not a safe asset name"), "submission"),
    "Invalid submission arguments: requests[1].outputName is not a safe asset name",
    "a fixable argument must say what to fix, or the caller just stops",
  );
  const guard = "A different SPECS asset batch is still active (Robot).";
  equal(toolErrorMessage(new Error(guard), "barrier"), guard, "service guards are written for the caller");
  const internal = toolErrorMessage(
    new Error("Bearer abc123 rejected by https://api.specs.com/v1/inference/text-to-3d"),
    "submission",
  );
  assert(!internal.includes("abc123") && !internal.includes("api.specs.com"), "leaked remote detail");
});

test("a corrupt primary state falls back to the last-known-good backup", () => {
  const files = new FakeStateFiles();
  files.contents.set(statePaths.primary, "{not-json");
  files.contents.set(statePaths.backup, JSON.stringify(retainedBatch("Crate")));

  equal(journal(files).load()?.jobs[0]?.request.outputName, "Crate");
});

test("an interrupted state rotation leaves a loadable backup", () => {
  const files = new FakeStateFiles();
  files.contents.set(statePaths.primary, JSON.stringify(retainedBatch("Crate")));
  files.failRename = `${statePaths.temporary}->${statePaths.primary}`;

  let failure = "";
  try {
    journal(files).save(retainedBatch("Robot"));
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }
  equal(failure, "injected rename failure");
  equal(journal(files).load()?.jobs[0]?.request.outputName, "Crate");
});

test("a staged first state survives a crash before its initial rename", () => {
  const files = new FakeStateFiles();
  files.contents.set(statePaths.temporary, JSON.stringify(retainedBatch("Crate")));

  equal(journal(files).load()?.jobs[0]?.request.outputName, "Crate");
});

test("two corrupt state copies fail closed instead of resetting", () => {
  const files = new FakeStateFiles();
  files.contents.set(statePaths.primary, "{not-json");
  files.contents.set(statePaths.backup, "[]");

  let failure = "";
  try {
    journal(files).load();
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }
  assert(failure.startsWith("Corrupt SPECS asset state"), `Unexpected failure: ${failure}`);
  assert(failure.includes(".tmp"), "recovery did not name every state file that must be abandoned");
});

test("a lost operation's lock is reclaimed so recovery is never permanently blocked", async () => {
  const current = setup(null, { maxHoldMs: 50 });
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));

  // The first barrier wedges: its status poll never settles, so the async frame
  // parks forever and the `finally` that clears the in-process lock never runs.
  const stuck = deferred<RemoteStatus>();
  current.remote.statuses.push(stuck.promise);
  const wedged = current.coordinator.barrier();

  // A retry within the max hold still serializes against the apparently-live op.
  await rejects(current.coordinator.barrier(), /already running/);

  // Past the max hold the holder is presumed lost, so the next call reclaims the
  // lock instead of failing forever — before this fix, this deadlocked.
  current.clock.now = 51;
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  equal((await current.coordinator.barrier()).status, "READY", "the reclaimed lock let the barrier finish");
  void wedged;
});

test("an explicit abandon preempts a wedged lock without waiting for its deadline", async () => {
  const current = setup(null, { maxHoldMs: 1_000 });
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));

  // Wedge the lock on a never-settling poll, well within the max hold.
  const stuck = deferred<RemoteStatus>();
  current.remote.statuses.push(stuck.promise);
  const wedged = current.coordinator.barrier();

  // A plain call is still blocked, but abandonUncertain preempts immediately: it
  // reaches the batch guard (Crate is submitted, so a different batch is refused)
  // rather than bouncing off "already running" — proving the lock was preempted.
  await rejects(current.coordinator.barrier(), /already running/);
  await rejects(
    current.coordinator.submit(input(["Anvil"], { abandonUncertain: true })),
    /different SPECS asset batch is still active/,
  );
  void wedged;
});

test("a healthy slow multi-submit heartbeats its lease and is not reclaimed mid-flight", async () => {
  const current = setup(null, { maxHoldMs: 50 });
  // Drive each POST by hand so the clock can advance between them: a multi-request
  // submit whose total time exceeds one max-hold window, each step well within it.
  const crate = deferred<string>();
  const anvil = deferred<string>();
  current.remote.submits.push(crate.promise, anvil.promise);

  const slow = current.coordinator.submit(input(["Crate", "Anvil"]));
  await new Promise<void>((resolve) => setTimeout(resolve, 0)); // park on Crate's POST

  // Crate returns past the ORIGINAL 50ms deadline; its checkpoint heartbeats the lease.
  current.clock.now = 60;
  crate.resolve("job-crate");
  await new Promise<void>((resolve) => setTimeout(resolve, 0)); // persist Crate, park on Anvil

  // Lease was refreshed, so the submit is still the live holder: a competing call after
  // the original deadline must be refused, not allowed to race the in-flight Anvil POST.
  await rejects(current.coordinator.barrier(), /already running/);

  current.clock.now = 90;
  anvil.resolve("job-anvil");
  const result = await slow;
  equal(result.status, "PENDING");
  equal(jobState(current.repository, "Crate"), "submitted");
  equal(jobState(current.repository, "Anvil"), "submitted", "the slow POST persisted its real ID, not orphaned");
});

test("a superseded operation aborts at its next checkpoint instead of writing state", async () => {
  const current = setup(null, { maxHoldMs: 50 });
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));

  // Park the first barrier mid-poll, then reclaim the lock past its deadline.
  const stuck = deferred<RemoteStatus>();
  current.remote.statuses.push(stuck.promise);
  const superseded = current.coordinator.barrier();

  current.clock.now = 51;
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  equal((await current.coordinator.barrier()).status, "READY", "the reclaiming barrier collected the job");
  const writesAfterReclaim = current.repository.writes.length;

  // The stranded first barrier now resumes. It must fail at its checkpoint and not
  // persist a second transition for a job its successor already collected.
  stuck.resolve({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  await rejects(superseded, /superseded/i);
  equal(current.repository.writes.length, writesAfterReclaim, "a stranded op must not mutate retained state");
  equal(current.files.files.size, 1, "the successor collected exactly one GLB");
});

test("a superseded barrier does not write a duplicate GLB after its successor collects", async () => {
  const current = setup(null, { maxHoldMs: 50 });
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input(["Crate"]));

  // Park the first barrier at the download step, past status resolution — the latest
  // point it could still write a file and persist a transition. Drain microtasks so it
  // advances through getStatus and parks in the download before the reclaim below.
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  const stuckDownload = deferred<Uint8Array>();
  current.remote.downloads.push(stuckDownload.promise);
  const superseded = current.coordinator.barrier();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  // Reclaim past the deadline and let a fresh barrier collect the job cleanly.
  current.clock.now = 51;
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(glb());
  equal((await current.coordinator.barrier()).status, "READY");
  equal(current.files.files.size, 1, "the successor wrote exactly one GLB");
  const writesAfterReclaim = current.repository.writes.length;

  // The stranded barrier's download now returns bytes. It must abort at its checkpoint
  // and neither overwrite the GLB nor persist a second transition.
  stuckDownload.resolve(glb(7));
  await rejects(superseded, /superseded/i);
  equal(current.files.files.size, 1, "a stranded op must not write a duplicate GLB");
  equal(current.repository.writes.length, writesAfterReclaim, "a stranded op must not persist after supersession");
});

test("abandonUncertain does not re-POST a job it abandoned in the same call", async () => {
  const current = setup();
  current.remote.submits.push(uncertain());
  await current.coordinator.submit(input(["Crate"]));
  equal(jobState(current.repository, "Crate"), "submission_unknown");

  // Resubmitting the SAME batch with abandonUncertain must free Crate (so a later batch
  // can start) but must NOT issue a second POST while its first POST may still be live —
  // that would duplicate the remote generation the submission_unknown state guards against.
  const result = await current.coordinator.submit(input(["Crate"], { abandonUncertain: true }));
  equal(current.remote.submitCalls.join(","), "Crate", "the abandoned job must not be re-POSTed in the same call");
  equal(jobState(current.repository, "Crate"), "failed:abandoned");
  equal(result.jobs[0]?.state, "FAILED");
});

test("abandonUncertain still POSTs a reused output name in a replacement batch", async () => {
  const current = setup();
  current.remote.submits.push(uncertain());
  await current.coordinator.submit(input(["Crate"]));
  equal(jobState(current.repository, "Crate"), "submission_unknown");

  // A reused name with a new prompt replaces the batch; the fresh Crate is a distinct
  // generation the caller asked for and must not inherit the abandon suppression.
  current.remote.submits.push("job-crate-2");
  const result = await current.coordinator.submit({
    requests: [{ outputName: "Crate", prompt: "A completely different crate" }],
    abandonUncertain: true,
  });
  equal(current.remote.submitCalls.join(","), "Crate,Crate", "the replacement Crate must be POSTed");
  equal(jobState(current.repository, "Crate"), "submitted");
  equal(result.jobs[0]?.state, "PENDING");
});

test("abandonUncertain adding a sibling still POSTs both the reused name and the sibling", async () => {
  const current = setup();
  current.remote.submits.push(uncertain());
  await current.coordinator.submit(input(["Crate"]));
  equal(jobState(current.repository, "Crate"), "submission_unknown");

  // Adding a sibling changes the request list, so this also replaces the batch. Neither
  // the reused Crate nor the new Anvil may be suppressed.
  current.remote.submits.push("job-crate", "job-anvil");
  await current.coordinator.submit(input(["Crate", "Anvil"], { abandonUncertain: true }));
  equal(
    current.remote.submitCalls.join(","),
    "Crate,Crate,Anvil",
    "both the reused Crate and the new Anvil must be POSTed",
  );
  equal(jobState(current.repository, "Crate"), "submitted");
  equal(jobState(current.repository, "Anvil"), "submitted");
});

/**
 * Models Lens Studio's `FileSystem`: rename does NOT clobber an existing target,
 * which is what forces durableWrite to move an existing file aside rather than
 * remove-then-rename. `failRename` injects a rename failure for one "from->to" pair.
 */
class FakeOutputFs implements OverwriteCapableFs<string> {
  readonly files = new Map<string, Uint8Array>();
  failRename: string | null = null;

  exists(path: string): boolean {
    return this.files.has(path);
  }

  size(path: string): number {
    const bytes = this.files.get(path);
    if (bytes === undefined) throw new Error(`Missing ${path}`);
    return bytes.length;
  }

  writeFile(path: string, bytes: Uint8Array): void {
    this.files.set(path, bytes);
  }

  remove(path: string): void {
    this.files.delete(path);
  }

  rename(from: string, to: string): void {
    if (`${from}->${to}` === this.failRename) throw new Error("injected rename failure");
    const bytes = this.files.get(from);
    if (bytes === undefined) throw new Error(`Missing ${from}`);
    if (this.files.has(to)) throw new Error(`Destination exists: ${to}`);
    this.files.delete(from);
    this.files.set(to, bytes);
  }
}

const outputPaths = { final: "final", temporary: "final.tmp", sideways: "final.bak" } as const;

test("durableWrite replaces a flagged placeholder in place", () => {
  const fs = new FakeOutputFs();
  fs.files.set("final", new Uint8Array([1])); // a progressive-build placeholder
  durableWrite(fs, outputPaths, glb(), { allowOverwrite: true, conflictLabel: "Assets/x.glb" }, () => {});
  equal(fs.files.size, 1, "only the final file remains");
  equal(fs.files.get("final")?.length, glb().length, "the real generation landed");
  assert(!fs.exists("final.tmp") && !fs.exists("final.bak"), "temp and backup are cleaned up");
});

test("durableWrite refuses a foreign file and leaves it untouched", () => {
  const fs = new FakeOutputFs();
  const foreign = new Uint8Array([9, 9, 9]);
  fs.files.set("final", foreign);
  let message = "";
  try {
    durableWrite(fs, outputPaths, glb(), { allowOverwrite: false, conflictLabel: "Assets/x.glb" }, () => {});
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(/OUTPUT_CONFLICT: Assets\/x\.glb/.test(message), "must refuse a foreign file, naming the path");
  equal(fs.files.get("final"), foreign, "the foreign file is untouched");
  assert(!fs.exists("final.tmp"), "the staged temp is cleaned up");
});

test("durableWrite restores the original when the overwrite swap fails", () => {
  const fs = new FakeOutputFs();
  const original = new Uint8Array([1]); // the placeholder / prior mesh being replaced
  fs.files.set("final", original);
  fs.failRename = "final.tmp->final"; // the swap-in of the replacement fails

  let threw = false;
  try {
    durableWrite(fs, outputPaths, glb(), { allowOverwrite: true, conflictLabel: "Assets/x.glb" }, () => {});
  } catch {
    threw = true;
  }
  assert(threw, "a failed overwrite must surface");
  equal(fs.files.get("final"), original, "a failed overwrite must not destroy the file it was replacing");
  assert(!fs.exists("final.bak"), "the moved-aside original is restored, not stranded at the backup");
  assert(!fs.exists("final.tmp"), "the staged temp is cleaned up");
});

await run("33 recovery tests");
