import { InputError } from "../domain/contracts.js";

/**
 * Turn a thrown value into the one string the model will see.
 *
 * These tools sit in the middle of a long build, and the caller's documented
 * response to a failure is to stop. A single opaque string therefore ends the
 * build even when the cause was a fixable argument, so the message has to carry
 * enough to act on: caller mistakes and this service's own guard conditions come
 * through verbatim, since both are written for the caller and name field paths,
 * asset names, or the next call to make.
 *
 * Anything else is an unexpected internal or remote fault whose message may quote
 * a URL, header, or response body, so only its shape is reported and the detail
 * stays in the log.
 */
export function toolErrorMessage(error: unknown, operation: string): string {
  if (error instanceof InputError) return `Invalid ${operation} arguments: ${error.message}`;
  if (error instanceof Error && isCallerFacing(error.message)) return error.message;
  return `SPECS asset ${operation} failed for an internal reason. Review the Lens Studio log for details.`;
}

/** Guard messages this service raises for the caller, matched on their opening text. */
const CALLER_FACING: readonly string[] = [
  "A SPECS asset batch is unresolved",
  "A different SPECS asset batch is still active",
  "A SPECS asset operation is already running",
  "No retained SPECS asset batch exists",
  "No Lens project is bound",
  "SPECS Asset Jobs service is not running",
  "Corrupt SPECS asset state",
  "OUTPUT_CONFLICT",
  "The Lens Studio project changed",
  "The SPECS asset operation was superseded",
];

function isCallerFacing(message: string): boolean {
  return CALLER_FACING.some((prefix) => message.startsWith(prefix));
}
