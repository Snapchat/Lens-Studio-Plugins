import type { AssetRequest, PersistedBatch } from "../src/domain/contracts.js";
import {
  SpecsAssetJobCoordinator,
  type CoordinatorClock,
  type OutputFileStore,
  type RemoteAssetApi,
  type StateRepository,
} from "../src/service/specsAssetJobCoordinator.js";
import type { RemoteStatus } from "../src/service/remoteProtocol.js";

export type Outcome<T> = T | Error | Promise<T>;

async function next<T>(outcomes: Outcome<T>[], label: string): Promise<T> {
  const outcome = outcomes.shift();
  if (outcome === undefined) throw new Error(`Missing fake ${label} outcome`);
  if (outcome instanceof Error) throw outcome;
  return await outcome;
}

export class FakeRepository implements StateRepository {
  record: PersistedBatch | null;
  readonly writes: PersistedBatch[] = [];

  constructor(record: PersistedBatch | null = null) {
    this.record = record;
  }

  load(): PersistedBatch | null {
    return this.record;
  }

  save(record: PersistedBatch): void {
    this.record = record;
    this.writes.push(record);
  }
}

export class FakeFiles implements OutputFileStore {
  readonly files = new Map<string, Uint8Array>();

  exists(path: string): boolean {
    return this.files.has(path);
  }

  write(path: string, bytes: Uint8Array, allowOverwrite = false): void {
    if (this.files.has(path) && !allowOverwrite) throw new Error(`OUTPUT_CONFLICT: ${path}`);
    this.files.set(path, bytes);
  }
}

export class FakeRemote implements RemoteAssetApi {
  readonly preparations: Outcome<void>[] = [];
  readonly submits: Outcome<string>[] = [];
  readonly statuses: Outcome<RemoteStatus>[] = [];
  readonly downloads: Outcome<Uint8Array>[] = [];
  readonly prepareCalls: string[] = [];
  readonly submitCalls: string[] = [];
  onSubmit: (() => void) | null = null;
  readonly statusCalls: string[] = [];
  readonly downloadCalls: string[] = [];

  async prepareSubmit(request: AssetRequest): Promise<{ readonly submit: () => Promise<string> }> {
    this.prepareCalls.push(request.outputName);
    if (this.preparations.length > 0) await next(this.preparations, "prepare");
    return {
      submit: async (): Promise<string> => {
        this.onSubmit?.();
        this.submitCalls.push(request.outputName);
        return await next(this.submits, "submit");
      },
    };
  }

  async getStatus(remoteJobId: string): Promise<RemoteStatus> {
    this.statusCalls.push(remoteJobId);
    return await next(this.statuses, "status");
  }

  async download(assetUrl: string): Promise<Uint8Array> {
    this.downloadCalls.push(assetUrl);
    return await next(this.downloads, "download");
  }
}

export class FakeClock implements CoordinatorClock {
  now = 0;
  delays = 0;

  nowMs(): number {
    return this.now;
  }

  async delay(ms: number): Promise<void> {
    this.delays += 1;
    this.now += ms;
  }
}

export function setup(
  record: PersistedBatch | null = null,
  options: { pollIntervalMs?: number; barrierTimeoutMs?: number; maxHoldMs?: number } = {},
) {
  const repository = new FakeRepository(record);
  const remote = new FakeRemote();
  const files = new FakeFiles();
  const clock = new FakeClock();
  const coordinator = new SpecsAssetJobCoordinator(
    repository,
    remote,
    files,
    clock,
    { pollIntervalMs: 1, barrierTimeoutMs: 100, ...options },
  );
  return { coordinator, repository, remote, files, clock };
}

export function input(
  names: readonly string[] = ["Crate"],
  extra: Record<string, unknown> = {},
): unknown {
  return {
    requests: names.map((outputName) => ({ outputName, prompt: `Generate ${outputName}` })),
    ...extra,
  };
}

export function glb(marker = 0): Uint8Array {
  const bytes = new Uint8Array(12);
  bytes.set([0x67, 0x6c, 0x54, 0x46], 0);
  new DataView(bytes.buffer).setUint32(4, 2, true);
  new DataView(bytes.buffer).setUint32(8, bytes.length, true);
  bytes[11] = marker;
  return bytes;
}

/** A payload that reaches the collector but is not a GLB v2 file. */
export function notGlb(): Uint8Array {
  return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
}

/** The state of one job in the retained batch, for assertions about persistence. */
export function jobState(repository: FakeRepository, outputName: string): string {
  const job = repository.record?.jobs.find((current) => current.request.outputName === outputName);
  return job === undefined ? "absent" : `${job.state}${job.error === undefined ? "" : `:${job.error}`}`;
}
