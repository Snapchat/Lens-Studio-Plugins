import { RemoteOperationError, type RemoteStatus } from "../src/service/remoteProtocol.js";
import { glb, input, setup } from "./fakes.js";
import { assert, deferred, equal, rejects, run, test } from "./harness.js";

test("retained remote IDs prevent duplicate submission after reload", async () => {
  const first = setup();
  first.remote.submits.push("job-crate", "job-robot");
  equal((await first.coordinator.submit(input(["Crate", "Robot"]))).status, "PENDING");
  equal(first.remote.submitCalls.join(","), "Crate,Robot");
  assert(
    first.repository.writes.some(({ jobs }) => jobs.some(({ state }) => state === "submission_unknown")),
    "submission was not marked ambiguous before POST",
  );

  const resumed = setup(first.repository.record);
  equal((await resumed.coordinator.submit(input(["Crate", "Robot"]))).status, "PENDING");
  equal(resumed.remote.submitCalls.length, 0);
});

test("an image-backed retained job collects after reload without another submission", async () => {
  const inputWithImage = {
    requests: [{
      outputName: "Lantern",
      prompt: "Generate lantern",
      referenceImagePath: "/tmp/lantern.png",
    }],
  };
  const first = setup();
  first.remote.submits.push("job-lantern");
  const submitted = await first.coordinator.submit(inputWithImage);
  equal(submitted.status, "PENDING");
  equal(submitted.jobs[0]?.inputMode, "reference_image");
  equal(first.repository.record?.jobs[0]?.request.referenceImagePath, "/tmp/lantern.png");

  const resumed = setup(first.repository.record);
  resumed.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/lantern.glb" });
  resumed.remote.downloads.push(glb());
  const collected = await resumed.coordinator.barrier();
  equal(collected.status, "READY");
  equal(collected.jobs[0]?.inputMode, "reference_image");
  equal(resumed.remote.submitCalls.length, 0, "reload must collect the retained remote ID without a new POST");
});

test("preparation completes before a submission is durably marked ambiguous", async () => {
  const current = setup();
  current.remote.submits.push("job-lantern");
  const imageInput = {
    requests: [{
      outputName: "Lantern",
      prompt: "Generate lantern",
      referenceImagePath: "/tmp/lantern.png",
    }],
  };
  current.remote.onSubmit = () => {
    equal(current.remote.prepareCalls.join(","), "Lantern", "the source must be prepared before POST");
    assert(
      current.repository.writes.some(({ jobs }) => jobs[0]?.state === "submission_unknown"),
      "the actual POST must follow the durable ambiguous state",
    );
  };

  const result = await current.coordinator.submit(imageInput);
  equal(result.status, "PENDING");
  equal(current.remote.prepareCalls.join(","), "Lantern");
  const unknownWrite = current.repository.writes.find(({ jobs }) => jobs[0]?.state === "submission_unknown");
  assert(unknownWrite !== undefined, "the prepared POST was not guarded by a durable ambiguous state");
});

test("an uncertain submission requires action and is never replayed", async () => {
  const first = setup();
  first.remote.submits.push(new RemoteOperationError("timeout", "submission_unknown"));
  equal((await first.coordinator.submit(input())).status, "ACTION_REQUIRED");
  equal(first.remote.submitCalls.length, 1);

  const resumed = setup(first.repository.record);
  equal((await resumed.coordinator.submit(input())).status, "ACTION_REQUIRED");
  equal(resumed.remote.submitCalls.length, 0);
});

test("a text-only job reports text input mode", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  const result = await current.coordinator.submit(input());
  equal(result.status, "PENDING");
  equal(result.jobs[0]?.inputMode, "text");
});

test("the barrier owns polling and preserves successful siblings", async () => {
  const current = setup();
  current.remote.submits.push("job-crate", "job-robot");
  await current.coordinator.submit(input(["Crate", "Robot"]));
  current.remote.statuses.push(
    { state: "pending" },
    { state: "pending" },
    { state: "ready", assetUrl: "https://provider.example/crate.glb" },
    { state: "failed" },
  );
  current.remote.downloads.push(glb());

  const result = await current.coordinator.barrier();
  equal(result.status, "PARTIAL_FAILED");
  equal(current.remote.statusCalls.length, 4);
  equal(current.clock.delays, 1);
  assert(current.files.exists("Assets/GeneratedMeshes/Crate.glb"), "successful GLB was not collected");
});

test("an expired signed URL is refreshed without recreating the job", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input());
  current.remote.statuses.push(
    { state: "ready", assetUrl: "https://provider.example/stale.glb" },
    { state: "ready", assetUrl: "https://provider.example/fresh.glb" },
  );
  current.remote.downloads.push(
    new RemoteOperationError("expired", "signed_url_expired"),
    glb(),
  );

  equal((await current.coordinator.barrier()).status, "READY");
  equal(current.remote.submitCalls.length, 1);
  equal(current.remote.downloadCalls.join(","), "https://provider.example/stale.glb,https://provider.example/fresh.glb");
});

test("project invalidation prevents a late collection write", async () => {
  const current = setup();
  current.remote.submits.push("job-crate");
  await current.coordinator.submit(input());
  const pending = deferred<RemoteStatus>();
  current.remote.statuses.push(pending.promise);
  const barrier = current.coordinator.barrier();

  current.coordinator.invalidate();
  pending.resolve({ state: "ready", assetUrl: "https://provider.example/crate.glb" });

  await rejects(barrier, /project changed/i);
  equal(current.files.files.size, 0);
});

test("submitting over a pre-existing output path is refused by default", async () => {
  const current = setup();
  current.files.write("Assets/GeneratedMeshes/Crate.glb", glb(), true);
  await rejects(current.coordinator.submit(input(["Crate"])), /OUTPUT_CONFLICT/);
});

test("overwriteExisting lets a real generation replace a placeholder at the final path", async () => {
  // A valid GLB v2 whose declared length matches, longer than the 12-byte glb()
  // placeholder so the overwrite is observable by size (glb()'s marker byte aliases
  // the length field, so it can't distinguish content).
  const realGlb = new Uint8Array(16);
  realGlb.set([0x67, 0x6c, 0x54, 0x46], 0);
  new DataView(realGlb.buffer).setUint32(4, 2, true);
  new DataView(realGlb.buffer).setUint32(8, realGlb.length, true);

  const current = setup();
  const path = "Assets/GeneratedMeshes/Crate.glb";
  current.files.write(path, glb(), true); // progressive-build placeholder (12 bytes)
  current.remote.submits.push("job-crate");
  const submitted = await current.coordinator.submit({
    requests: [{ outputName: "Crate", prompt: "Generate Crate", overwriteExisting: true }],
  });
  equal(submitted.status, "PENDING");
  current.remote.statuses.push({ state: "ready", assetUrl: "https://provider.example/crate.glb" });
  current.remote.downloads.push(realGlb);

  const result = await current.coordinator.barrier();
  equal(result.status, "READY");
  equal(current.files.files.get(path)?.length, 16); // placeholder overwritten in place
});

await run("10 coordinator tests");
