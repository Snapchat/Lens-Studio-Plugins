import * as ws from "LensStudio:WebSocket";
import * as Network from "LensStudio:Network";
import type { WebSocketMessage } from "./types.js";

/**
 * WebSocket bridge for WebEngineView communication.
 * Creates a local WebSocket server that web content can connect to.
 */
export class WebSocketBridge {
  private server: ws.WebSocketServer;
  private socket: ws.WebSocket | null = null;
  private connections: Editor.ScopedConnection[] = [];
  private isReady = false;
  private readyResolve: (() => void) | null = null;
  private messageHandler: ((message: WebSocketMessage) => void) | null = null;

  constructor() {
    this.server = ws.WebSocketServer.create();
    this.setupServerEvents();
  }

  private setupServerEvents(): void {
    this.connections.push(
      this.server.onConnect.connect((socket) => {
        this.socket = socket as ws.WebSocket;
        this.setupSocketEvents(this.socket);
      })
    );

    this.connections.push(
      this.server.onError.connect((error) => {
        console.error("[RunEditorCode] WebSocket server error:", error, console.None);
      })
    );
  }

  private setupSocketEvents(socket: ws.WebSocket): void {
    this.connections.push(
      socket.onData.connect((buffer) => {
        this.handleMessage(buffer.toString());
      })
    );

    this.connections.push(
      socket.onEnd.connect(() => {
        if (this.socket === socket) {
          this.socket = null;
          this.isReady = false;
        }
      })
    );

    this.connections.push(
      socket.onError.connect((error) => {
        if (error !== 1) {
          console.error("[RunEditorCode] WebSocket error:", error, console.None);
        }
      })
    );
  }

  private handleMessage(message: string): void {
    try {
      const msg: WebSocketMessage = JSON.parse(message);

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
    this.connections.forEach((c) => c?.disconnect());
    this.connections = [];

    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        console.error("[RunEditorCode] Error closing WebSocket:", e, console.None);
      }
      this.socket = null;
    }

    try {
      this.server.close();
    } catch (e) {
      console.error("[RunEditorCode] Error closing WebSocket server:", e, console.None);
    }

    this.isReady = false;
  }
}
