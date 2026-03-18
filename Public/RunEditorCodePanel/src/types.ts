/** Generic WebSocket message format for plugin communication */
export interface WebSocketMessage {
  event: string;
  payload?: unknown;
}

/** Client → Server: Execute code request */
export interface ExecuteCodeRequest {
  code: string;
}
