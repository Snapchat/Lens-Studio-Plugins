import {EDITOR_EVENTS, FILE_EVENTS} from "../../lib/Resources/Common.js";

/**
 * @file Manages the WebSocket connection, reconnection logic, and server communication.
 */
export class NetworkManager {
    constructor() {
        this.socket = null;
        this.requestIdCounter = 0;
        this.responseHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectDelay = 30000;
        this.reconnectTimerId = null;
        this.isPermanentlyClosing = false;
        this.messageHandlers = null;
        this.maxReconnectAttempts = 5;

        window.addEventListener('beforeunload', () => {
            this.isPermanentlyClosing = true;
            if (this.reconnectTimerId) clearTimeout(this.reconnectTimerId);
            if (this.socket) this.socket.close();
        });
    }

    initialize(messageHandlers) {
        this.messageHandlers = messageHandlers
        window.addEventListener('beforeunload', () => {
            this.isPermanentlyClosing = true;
            if (this.reconnectTimerId) clearTimeout(this.reconnectTimerId);
            if (this.socket) this.socket.close();
        });

        this.connect();
    }

    request(event, payload = {}) {
        return new Promise((resolve, reject) => {
            const requestId = this.requestIdCounter++;
            this.responseHandlers.set(requestId, {resolve, reject});
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({event, payload, requestId}));
            } else {
                reject(new Error("Socket is not connected."));
            }
        });
    }

    notify(event, payload = {}) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({event, payload}));
        }
    }

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.isPermanentlyClosing = true;
            return;
        }
        const delay = Math.min(this.maxReconnectDelay, (2 ** this.reconnectAttempts) * 1000);
        this.reconnectAttempts++;
        this.reconnectTimerId = setTimeout(() => this.connect(), delay);
    }

    connect() {
        const port = new URLSearchParams(window.location.search).get('port');
        if (!port) {
            if (this.messageHandlers.onConnectionError) {
                this.messageHandlers.onConnectionError('// Error: Port not specified. Cannot connect to Lens Studio.');
            }
            return;
        }

        if (this.messageHandlers.onConnecting) {
            this.messageHandlers.onConnecting();
        }

        this.socket = new WebSocket(`ws://127.0.0.1:${port}`);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.notify('editorReady');
            if (this.messageHandlers.onOpen) {
                this.messageHandlers.onOpen();
            }
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.event === 'shutdown') {
                this.handleShutdown();
                return;
            }

            if (message.event === 'REQUEST_SHUTDOWN_CHECK') {
                if (typeof window.fileManager !== 'undefined') {
                    window.fileManager.handleShutdownCheck();
                }
                return;
            }

            if (message.requestId !== undefined && this.responseHandlers.has(message.requestId)) {
                this.responseHandlers.get(message.requestId).resolve(message.payload);
                this.responseHandlers.delete(message.requestId);
                return;
            }

            if (this.messageHandlers[message.event]) {
                this.messageHandlers[message.event](message.payload);
            }
        };

        this.socket.onclose = () => {
            if (this.isPermanentlyClosing) {
                return;
            }
            if (this.messageHandlers.onClose) {
                this.messageHandlers.onClose();
            }
            this.reconnect();
        };

        this.socket.onerror = (err) => {
            console.error("Socket error:", err.toString());
        };
    }

    handleShutdown() {
        try {
            this.isPermanentlyClosing = true;

            if (this.reconnectTimerId) {
                clearTimeout(this.reconnectTimerId);
                this.reconnectTimerId = null;
            }

            if (typeof window.fileManager !== 'undefined') {
                window.fileManager.cleanup();
            }

            this.responseHandlers.clear();

            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({event: 'shutdownComplete'}));
            }

            setTimeout(() => {
                if (this.socket) {
                    this.socket.close();
                }
            }, 100);

        } catch (e) {
            console.error("Error during shutdown cleanup:", e);
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                try {
                    this.socket.send(JSON.stringify({event: 'shutdownComplete'}));
                } catch (sendError) {
                    console.error("Failed to send shutdown complete:", sendError);
                }
            }
        }
    }
}
