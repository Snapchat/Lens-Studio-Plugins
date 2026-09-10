# SPECS Asset Jobs

Lens Studio plugin for submitting SPECS text-to-3D and image-to-3D work early and collecting it at one late dependency barrier.

It exports three plugin classes:

- `SubmitSpecsAssetJobsTool` submits one to sixteen requests to fixed paths under `Assets/GeneratedMeshes`.
- `AwaitSpecsAssetJobsBarrierTool` accepts no arguments and performs bounded polling and safe collection.
- `SpecsAssetJobService` owns one retained batch for the open project and stops it when the project changes.

The project-local state stores request intent, submission state, and remote job IDs. Image-backed requests retain only their absolute source path; their bytes are read and sent as a data URL for the initial POST, never copied into state. It never stores credentials or signed URLs. A submission is marked uncertain before its POST; if Lens Studio stops before the returned ID is retained, reload reports `ACTION_REQUIRED` instead of creating a possible duplicate.

The barrier polls inside Lens Studio for a bounded window per call, refreshes one expired signed URL, validates GLB v2 bytes, and refuses to overwrite an existing output unless the request opted in with `overwriteExisting`. When the window elapses with jobs still generating it returns `PENDING`, so the caller re-invokes it until a terminal or action-required result — the short call keeps a long-lived polling coroutine from being lost to a GC pass mid-generation. Public results contain the batch status, compact per-job outcomes, and the accepted `inputMode` (`text` or `reference_image`) so callers can reject a lost image handoff before continuing their build.

## Failure recovery

No single failure may leave a project unable to make progress, because the builder is forbidden from generating a service-owned mesh by any other route. Every failure therefore ends in either a retry that is provably safe or a terminal state that frees the batch:

| Outcome | Job state | How it clears |
|---|---|---|
| `submission_unknown` | uncertain | Resubmit the same requests to retry siblings that were definitely never POSTed. The uncertain job itself is never replayed — clear it with `abandonUncertain: true`, accepting a possible orphan generation. |
| `authorization_required` / `access_required` | stays submitted | Sign in, then call the barrier again. The retained remote ID is reused. |
| `PENDING` (poll budget elapsed) | stays submitted | Call the barrier again; each call polls for a bounded window and a still-generating job is not a failed job. |
| `generation_failed` / `collection_failed` / `output_conflict` / `reference_image_invalid` / `reference_image_too_large` / `abandoned` | terminal | The batch can be replaced, and resubmitting the same requests retries those jobs. |

A retry re-checks the output path before POSTing, so a path that filled up in the meantime fails that job instead of spending a generation it could not write.

State updates are staged and validated before replacing the primary record, while the previous valid record is retained as a backup. Startup automatically recovers from that backup if the primary was interrupted or corrupted. If both copies are invalid, the service fails closed and reports the exact `.clad` files that must be removed to explicitly abandon any unresolved remote generation; it never silently resets potentially live work.

Tool failures return one string. Argument mistakes and this service's own guard conditions are returned verbatim so the caller can correct itself; anything else reports only its shape and leaves the detail in the Lens Studio log.

Normalization, AABB analysis, orientation, scene wiring, and visual acceptance remain in `/build-mesh`.

`tests/coordinator.test.ts` covers the normal lifecycle and `tests/recovery.test.ts` the fault-injection cases above; both use the fakes in `tests/fakes.ts`. Run `npm test`, `npm run typecheck`, and `npm run build`. Lens Studio verification remains a separate, explicitly authorized check.
