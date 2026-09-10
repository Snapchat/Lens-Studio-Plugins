import {
  classifyDownloadFailure,
  classifyHttpFailure,
  createSubmitBody,
  parseStatus,
  parseSubmittedJobId,
  RemoteOperationError,
} from "../src/service/remoteProtocol.js";
import { assert, equal, run, test } from "./harness.js";

const JOB_ID = "provider-job:v2/abc_123";

function remoteError(body: () => unknown): RemoteOperationError {
  try {
    body();
  } catch (error) {
    assert(error instanceof RemoteOperationError, "expected RemoteOperationError");
    return error;
  }
  throw new Error("expected operation to fail");
}

test("SPECS payloads map to the minimal remote protocol", () => {
  const body = createSubmitBody({
    outputName: "Crate",
    prompt: "blue crate",
    negativePrompt: "text",
    seed: 42,
    outputQuality: "standard",
  });
  equal(body.prompt, "blue crate");
  equal(body.negative_prompt, "text");
  equal(body.seed, 42);
  equal(body.output_quality, "standard");
  equal(parseSubmittedJobId({ job_id: JOB_ID }), JOB_ID);

  equal(parseStatus({ status: "running", progress: { detail: "private" } }).state, "pending");
  const ready = parseStatus({
    status: "succeeded",
    asset_url: "https://provider.example/signed.glb?signature=private",
  });
  assert(ready.state === "ready", "ready status was not classified");
  equal(ready.assetUrl, "https://provider.example/signed.glb?signature=private");
  equal(parseStatus({
    status: "failed",
    error_code: "provider_private_code",
    error_message: "provider private detail",
  }).state, "failed");
});

test("an image-backed request adds a data URL without changing the text fields", () => {
  const imageRequest = {
    outputName: "Lantern",
    prompt: "amber lantern",
    negativePrompt: "text",
    outputQuality: "standard" as const,
    referenceImagePath: "/tmp/lantern.png",
  };

  const body = createSubmitBody(imageRequest, "data:image/png;base64,cG5n");
  equal(body.prompt, "amber lantern");
  equal(body.negative_prompt, "text");
  equal(body.output_quality, "standard");
  equal(body.input_image_data_url, "data:image/png;base64,cG5n");
  assert(!("referenceImagePath" in body), "the local source path leaked to the remote service");
});

test("remote failures use one discriminated decision kind", () => {
  equal(classifyHttpFailure(0, "timeout", "create").kind, "submission_unknown");
  equal(classifyHttpFailure(401, null, "create").kind, "authorization_required");
  equal(classifyHttpFailure(403, null, "observe").kind, "access_required");
  equal(classifyHttpFailure(502, null, "observe").kind, "retryable");
  equal(classifyHttpFailure(422, null, "create").kind, "terminal");
  equal(classifyHttpFailure(413, null, "create", true).kind, "reference_image_too_large");
  equal(classifyHttpFailure(413, null, "create").kind, "terminal");
  equal(classifyDownloadFailure(403, null).kind, "signed_url_expired");
  equal(remoteError(() => parseSubmittedJobId({})).kind, "submission_unknown");
});

await run("3 remote protocol tests");
