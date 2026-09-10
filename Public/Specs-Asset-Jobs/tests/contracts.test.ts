import {
  createBatch,
  MAX_BATCH_REQUESTS,
  parsePersistedBatch,
  validateSubmit,
} from "../src/domain/contracts.js";
import { assert, run, test } from "./harness.js";

function requests(count: number): { outputName: string; prompt: string }[] {
  return Array.from({ length: count }, (_, index) => ({
    outputName: `Mesh${index}`,
    prompt: `Generate mesh ${index}`,
  }));
}

function expectInputError(body: () => unknown): void {
  try {
    body();
  } catch (error) {
    assert(error instanceof Error && error.name === "InputError", "expected an InputError");
    return;
  }
  throw new Error("expected validation to fail");
}

test("a full batch at the cap is accepted", () => {
  const input = validateSubmit({ requests: requests(MAX_BATCH_REQUESTS) });
  assert(input.requests.length === MAX_BATCH_REQUESTS, "all requests should survive validation");
});

test("a batch over the cap is rejected on input", () => {
  expectInputError(() => validateSubmit({ requests: requests(MAX_BATCH_REQUESTS + 1) }));
});

test("the persisted-record check accepts a batch as large as the input check", () => {
  // The two checks must move in lockstep: a batch that submits must also
  // round-trip through persistence, else a large batch recovers as corrupt.
  const batch = createBatch(validateSubmit({ requests: requests(MAX_BATCH_REQUESTS) }).requests);
  const parsed = parsePersistedBatch(batch);
  assert(parsed.jobs.length === MAX_BATCH_REQUESTS, "a max-size batch must round-trip through persistence");
});

test("the persisted-record check rejects a batch over the cap", () => {
  const oversized = createBatch(requests(MAX_BATCH_REQUESTS + 1));
  let rejected = false;
  try {
    parsePersistedBatch(oversized);
  } catch {
    rejected = true;
  }
  assert(rejected, "an over-cap persisted record must be refused");
});

await run("4 contracts tests");
