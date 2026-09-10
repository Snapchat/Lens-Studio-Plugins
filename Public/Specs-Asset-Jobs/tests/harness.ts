declare const console: {
  log(message: string): void;
  error(message: string): void;
};
declare const process: { exitCode: number };

type TestBody = () => void | Promise<void>;
const tests: Array<{ readonly name: string; readonly body: TestBody }> = [];

export function test(name: string, body: TestBody): void {
  tests.push({ name, body });
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function equal<T>(actual: T, expected: T, detail = ""): void {
  assert(Object.is(actual, expected), `${detail} expected ${String(expected)}, got ${String(actual)}`);
}

export async function rejects(promise: Promise<unknown>, expected: RegExp): Promise<void> {
  try {
    await promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(expected.test(message), `Expected ${String(expected)}, got ${message}`);
    return;
  }
  throw new Error(`Expected ${String(expected)}, but promise resolved`);
}

export function deferred<T>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}

export async function run(label: string): Promise<void> {
  let failures = 0;
  for (const current of tests.splice(0)) {
    try {
      await current.body();
      console.log(`PASS ${current.name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${current.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (failures > 0) {
    process.exitCode = 1;
    throw new Error(`${failures} ${label} test(s) failed`);
  }
  console.log(`PASS ${label}`);
}
