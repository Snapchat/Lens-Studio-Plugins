/** Asserts that the given condition is true, otherwise throws an error with the given message. */
export function assert(condition: any, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message)
    }
}

/** Used with control flow analysis to assert that this code path is expected to be unreachable. */
export function assertNever(_value: never): never {
    throw new Error("This should never happen")
}

/** Verifies that the given value is not `undefined` or `null`, otherwise throws an error with the given message. */
export function verify<T>(value: T, message?: string): NonNullable<T> {
    if (value == null) {
        throw new Error(message)
    }
    return value
}

/** Returns the call stack of the currently executing script. */
export function stackTrace(): string {
    return `${Error().stack}`
}

/** Print details of an error that was caught. */
export function reportError(reason: unknown): void {
    if (reason instanceof Error) {
        console.error(`${reason.name}: ${reason.message}\n${reason.stack}`)
    } else {
        console.error(`${typeof reason}: ${reason}`)
    }
}
