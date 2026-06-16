/**
 * Shared logging helpers for the Agents-Docs plugin.
 */

export function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

export function fetchFailureMessage(name: string): string {
    return `[AgentsDocs] Failed to fetch ${name} from Contentful; ${name} was not injected. This can happen when Lens Studio is not signed in or the user is not authorized.`;
}

export function logFetchFailure(name: string, error: unknown): void {
    console.warn(fetchFailureMessage(name));
    console.warn(`[AgentsDocs] ${name} Contentful fetch failure details:`, error, console.None);
}
