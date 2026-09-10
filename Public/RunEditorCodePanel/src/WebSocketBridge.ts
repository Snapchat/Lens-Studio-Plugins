import * as ws from "LensStudio:WebSocket";
import * as Network from "LensStudio:Network";
import { AuthenticatedMessageGate } from "./AuthenticatedMessageGate.js";
import type { WebSocketMessage } from "./types.js";

const AUTHENTICATION_TIMEOUT_MS = 5000;

/**
 * WebSocket bridge for WebEngineView communication.
 * Creates a local WebSocket server that web content can connect to.
 */
export class WebSocketBridge {
  private server: ws.WebSocketServer;
  private socket: ws.WebSocket | null = null;
  private messageGates = new Map<ws.WebSocket, AuthenticatedMessageGate>();
  private authenticationTimeouts = new Map<ws.WebSocket, ReturnType<typeof setTimeout>>();
  private serverConnections: Editor.ScopedConnection[] = [];
  private socketConnections = new Map<ws.WebSocket, Editor.ScopedConnection[]>();
  private isReady = false;
  private readyResolve: (() => void) | null = null;
  private messageHandler: ((message: WebSocketMessage) => void) | null = null;
  private readonly authToken: string;

  constructor(authToken: string) {
    if (!authToken) {
      throw new Error("WebSocket authentication token must not be empty");
    }

    this.authToken = authToken;
    this.server = ws.WebSocketServer.create();
    this.setupServerEvents();
  }

  private setupServerEvents(): void {
    this.serverConnections.push(
      this.server.onConnect.connect((socket) => {
        const clientSocket = socket as ws.WebSocket;
        this.messageGates.set(clientSocket, new AuthenticatedMessageGate(this.authToken));

        const authenticationTimeout = setTimeout(() => {
          this.authenticationTimeouts.delete(clientSocket);
          if (this.messageGates.has(clientSocket)) {
            this.closeSocket(clientSocket);
          }
        }, AUTHENTICATION_TIMEOUT_MS);
        this.authenticationTimeouts.set(clientSocket, authenticationTimeout);
        this.setupSocketEvents(clientSocket);
      })
    );

    this.serverConnections.push(
      this.server.onError.connect((error) => {
        console.error("[RunEditorCode] WebSocket server error:", error, console.None);
      })
    );
  }

  private setupSocketEvents(socket: ws.WebSocket): void {
    const connections = [
      socket.onData.connect((buffer) => {
        this.handleMessage(socket, buffer.toString());
      }),
      socket.onEnd.connect(() => {
        this.clearAuthenticationTimeout(socket);
        this.messageGates.delete(socket);
        if (this.socket === socket) {
          this.socket = null;
          this.isReady = false;
        }
        this.disconnectSocketEvents(socket);
      }),
      socket.onError.connect((error) => {
        if (error !== 1) {
          console.error("[RunEditorCode] WebSocket error:", error, console.None);
        }
      }),
    ];
    this.socketConnections.set(socket, connections);
  }

  private handleMessage(socket: ws.WebSocket, message: string): void {
    try {
      const msg: WebSocketMessage = JSON.parse(message);
      const gate = this.messageGates.get(socket);
      if (!gate) {
        this.closeSocket(socket);
        return;
      }

      const decision = gate.evaluate(msg);
      if (decision === "reject") {
        this.closeSocket(socket);
        return;
      }

      if (decision === "authenticate") {
        this.clearAuthenticationTimeout(socket);
        if (this.socket && this.socket !== socket) {
          this.closeSocket(this.socket);
        }
        this.socket = socket;
        this.isReady = false;
        return;
      }

      if (this.socket !== socket) {
        this.closeSocket(socket);
        return;
      }

      if (msg.event === "ready") {
        this.isReady = true;
        if (this.readyResolve) {
          this.readyResolve();
          this.readyResolve = null;
        }
      }

      if (this.messageHandler) {
        this.messageHandler(msg);
      }
    } catch (error) {
      console.error("[RunEditorCode] Error parsing WebSocket message:", error, console.None);
      this.closeSocket(socket);
    }
  }

  private closeSocket(socket: ws.WebSocket): void {
    this.clearAuthenticationTimeout(socket);
    this.messageGates.delete(socket);
    if (this.socket === socket) {
      this.socket = null;
      this.isReady = false;
    }
    this.disconnectSocketEvents(socket);

    try {
      socket.close();
    } catch (error) {
      console.error("[RunEditorCode] Error closing WebSocket:", error, console.None);
    }
  }

  private disconnectSocketEvents(socket: ws.WebSocket): void {
    const connections = this.socketConnections.get(socket);
    if (!connections) return;

    connections.forEach((connection) => connection?.disconnect());
    this.socketConnections.delete(socket);
  }

  private clearAuthenticationTimeout(socket: ws.WebSocket): void {
    const timeout = this.authenticationTimeouts.get(socket);
    if (timeout !== undefined) {
      clearTimeout(timeout);
      this.authenticationTimeouts.delete(socket);
    }
  }

  start(): number {
    const addr = new Network.Address();
    addr.address = "127.0.0.1";
    addr.port = 0;
    this.server.listen(addr);
    return this.server.port;
  }

  async waitForReady(timeoutMs = 10000): Promise<void> {
    if (this.isReady) return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.readyResolve = null;
        reject(new Error("Timeout waiting for WebEngineView client to be ready"));
      }, timeoutMs);

      this.readyResolve = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }

  onMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandler = handler;
  }

  send(event: string, payload?: unknown): void {
    if (!this.socket) {
      throw new Error("WebSocket not connected");
    }
    this.socket.send(JSON.stringify({ event, payload }));
  }

  close(): void {
    this.serverConnections.forEach((connection) => connection?.disconnect());
    this.serverConnections = [];

    for (const socket of Array.from(this.socketConnections.keys())) {
      this.closeSocket(socket);
    }
    this.messageGates.clear();
    this.authenticationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.authenticationTimeouts.clear();

    try {
      this.server.close();
    } catch (e) {
      console.error("[RunEditorCode] Error closing WebSocket server:", e, console.None);
    }

    this.isReady = false;
  }
}
