---
name: logs-skill
description: Lens Studio log format, thread categories, and grep patterns for reading compiler and preview logs. Use when analyzing logs, debugging compilation failures, or reading preview runtime output.
user-invocable: true
---

# Lens Studio Log Analysis

## Log File Location

Both `RecompileTypescriptTool` and `RunAndCollectLogsTool` return a `logFile` path in their response.
If the path is not available from a recent tool call, use `ExecuteEditorCode` to obtain it:

```js
const FS = await import("LensStudio:FileSystem");
return FS.getLogFile().toString();
```

This returns the full path to the active log file (e.g. `~/Library/Preferences/Snap/Lens Studio Internal/logs/LensStudioLog-<timestamp>.txt`).
Once obtained, use your built-in Read and Grep tools to read logs directly from the filesystem.

## Log Format

Each line follows this structure:

```
<LEVEL> <HH:MM:SS.mmm> <source_file>:<line> (<@thread>) <function>] <message>
```

- **Levels:** `D`=debug, `I`=info, `W`=warning, `E`=error, `F`=fatal
- **Thread:** Always prefixed with `@`. Identifies the subsystem that produced the log.
- The `<function>]` segment ends with a closing bracket before the message.

Example:

```
E 14:32:01.456 TypeScriptCompiler.cpp:285 (@Es::TypeScript) compileProject] TS2304: Cannot find name 'foo'.
I 14:32:05.789 PreviewWorker.cpp:142 (@Es::Preview::PreviewWorker) onScriptLog] Hello from script!
```

## Log Categories by Thread

| Category | Thread pattern | What it contains |
|----------|---------------|------------------|
| TypeScript compiler | `@Es::TypeScript` | Compilation start, success, failure, TS errors |
| Preview runtime | `@Es::Preview::PreviewWorker` | Script `print()` output, runtime errors, lifecycle |
| Device push | `@Es::ToDevice` | Device deployment logs |
| Main / other | everything else | UI, asset management, general engine |

## Compilation Workflow

1. **Trigger:** Call `RecompileTypescriptTool` — it triggers recompilation and waits for success/failure.
2. **On success:** Tool returns `{ status: "succeeded", logFile: "..." }`. No further action needed.
3. **On failure:** Tool returns `{ status: "failed", errors: [...], logFile: "..." }`.
   - Read the `errors` array first — it contains the compiler error messages directly.
   - For deeper analysis (surrounding context, related warnings), use Read/Grep on the `logFile` path:

```
# Find TypeScript compiler errors (level E, TypeScript thread)
Grep the log file for: ^E .* @Es::TypeScript

# Or for specific TS error codes:
Grep the log file for: TS\d{4}:
```

4. **Fix the errors** in the source `.ts` files, then call `RecompileTypescriptTool` again.

## Preview Runtime Workflow

1. **Trigger:** Call `RunAndCollectLogsTool` — it refreshes all preview panels and waits for the lens reset signal.
2. **Read the response.** The tool returns metadata only:
   - `status`: `"success"` | `"timeout"` | `"no_preview"`
   - `logFile`: Absolute path to the active log file
   - `byteOffset`: Byte position in the log file *before* the refresh was triggered
3. **Wait briefly:** Run `sleep 0.5` to let script initialization complete (onAwake errors happen ~100ms after reset).
4. **Read new log entries:** Use Read or Grep on `logFile` starting from `byteOffset` to see only entries produced by the refresh:
   - Script print() output: `grep '@Es::Preview::PreviewWorker.*onScriptLog\]' logFile`
   - Preview runtime errors: `grep '^E .* @Es::Preview::PreviewWorker' logFile`
   - Use the grep patterns in the quick reference below for other categories.
5. **On timeout:** The reset signal wasn't received in time. Logs may still contain partial output — read from `byteOffset` anyway.
6. **On no_preview:** No preview panel is open. Ask the user to open one, or check that the project has a scene loaded.

## Grep Patterns Quick Reference

| Scenario | Pattern |
|----------|---------|
| Compilation succeeded | `TypeScript compilation succeeded!` |
| Compilation started | `Starting TypeScript compilation` |
| Compilation failed | `TypeScript compilation failed!` |
| TS compiler errors (level E) | `^E .* @Es::TypeScript` |
| Specific TS error code | `TS\d{4}:` |
| Preview reset marker | `Lens has been reset` |
| All preview runtime logs | `@Es::Preview::PreviewWorker` |
| Script print() output | `@Es::Preview::PreviewWorker.*onScriptLog\]` |
| Preview runtime errors | `^E .* @Es::Preview::PreviewWorker` |
| Device push logs | `@Es::ToDevice` |

## Efficient Log Reading Tips

- **Tail the file:** Use `Read` with a large `offset` (e.g. total lines - 200) to see only the most recent entries. Logs accumulate over the session; old entries are rarely relevant.
- **Anchor to event markers:** After triggering compilation or preview reset, grep for the marker (`TypeScript compilation succeeded!` or `Lens has been reset`) to find the exact region of interest, then read a window around that line.
- **Filter by level + thread:** Combine level prefix and thread to narrow results. E.g. `^E .* @Es::Preview::PreviewWorker` for preview errors only.
- **Multiple grep passes:** First grep for the event marker to get the line number, then read lines after that marker with a category filter.
