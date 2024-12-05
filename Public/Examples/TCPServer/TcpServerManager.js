import * as Network from "LensStudio:Network";

export default class TcpServerManager {
    constructor() {
        /**
         * @type {Network.TcpServer}
         * @private
         */
        this.server = Network.TcpServer.create();

        /**
         * @type {Editor.Connection[]}
         * @private
         */
        this.connections = [];

        /**
         * @type {Network.TcpSocket[]}
         * @private
         */
        this.sockets = [];

        /**
         * @type {(function(import("LensStudio:Network").TcpSocket): void) | null}
         * @public
         */
        this.onClientConnected = null;

        /**
         * @type {(function(any, import("LensStudio:Network").TcpSocket): void) | null}
         * @public
         */
        this.onClientDataReceived = null;

        /**
         * @type {(function(import("LensStudio:Network").TcpSocket): void) | null}
         * @public
         */
        this.onClientDisconnected = null;

        /**
         * @type {(function(any, import("LensStudio:Network").TcpSocket): void) | null}
         * @public
         */
        this.onClientSocketError = null;

        /**
         * @type {boolean}
         * @public
         */
        this.enableLogging = false;

        // Setup listeners
        this.connections.push(this.server.onConnect.connect((/**@type {import("LensStudio:Network").TcpSocket} */socket) => {

            // Save sockets to the persistent array so they don't get garbage collected
            this.sockets.push(socket);

            if (this.enableLogging) {
                console.log(`Incoming connection from ${socket.remoteAddress.address}:${socket.remoteAddress.port}`);
            }

            if (this.onClientConnected) {
                this.onClientConnected(socket);
            }

            this.connections.push(socket.onData.connect((data) => {
                if (this.enableLogging) {
                    console.log(`Received data from socket: ${data}`);
                }

                if (this.onClientDataReceived) {
                    this.onClientDataReceived(data, socket);
                }
            }));

            this.connections.push(socket.onEnd.connect(() => {
                if (this.enableLogging) {
                    console.log(`Socket connected to ${socket.remoteAddress.address}:${socket.remoteAddress.port} disconnected from the server.`);
                }

                if (this.onClientDisconnected) {
                    this.onClientDisconnected(socket);
                }
            }));

            this.connections.push(socket.onError.connect((error) => {
                if (this.enableLogging) {
                    console.log(`Socket error: ${error}`);
                }

                if (this.onClientSocketError) {
                    this.onClientSocketError(error, socket);
                }
            }));
        }));
    }

    /**
     * Starts the server at the specified address and port.
     * @param {string} address - The IP address to listen on.
     * @param {number} port - The port number to listen on.
     */
    start(address, port) {
        const localhostAddr = new Network.Address();
        localhostAddr.address = address;
        localhostAddr.port = port;
        try {
            this.server.listen(localhostAddr);
            console.log(`Server started at ${address}:${port}`);
        } catch (e) {
            console.log("Failed to start the server: " + e);
        }
    }

    /**
     * Closes the server and disconnects all connections.
     */
    close() {
        // Disconnect all the connections
        this.connections.forEach((connection) => connection.disconnect());
        this.connections = [];
        // Close the server
        this.server.close();
    }
}
