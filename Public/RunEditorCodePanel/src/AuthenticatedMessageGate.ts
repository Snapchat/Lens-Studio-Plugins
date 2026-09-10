import type { WebSocketMessage } from "./types.js";

export type MessageGateDecision = "authenticate" | "dispatch" | "reject";

/**
 * Enforces authentication as the first message on a WebSocket connection.
 * Authentication messages are consumed by the gate and never dispatched.
 */
export class AuthenticatedMessageGate {
  private authenticated = false;
  private readonly expectedToken: string;

  constructor(expectedToken: string) {
    if (!expectedToken) {
      throw new Error("WebSocket authentication token must not be empty");
    }
    this.expectedToken = expectedToken;
  }

  evaluate(message: WebSocketMessage): MessageGateDecision {
    if (this.authenticated) {
      return message.event === "auth" ? "reject" : "dispatch";
    }

    if (message.event !== "auth") {
      return "reject";
    }

    const payload = message.payload as { token?: unknown } | null;
    if (!payload || typeof payload !== "object" || payload.token !== this.expectedToken) {
      return "reject";
    }

    this.authenticated = true;
    return "authenticate";
  }
}
