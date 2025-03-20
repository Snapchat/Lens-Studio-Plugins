import CoreService from "LensStudio:CoreService";
import * as Network from "LensStudio:Network";
import TcpServerManager from "./TcpServerManager.js";

/**
 * A collection of helper functions for testing the plugin.
 */
class Interlocutor {
    /**
     * Probes a server by sending an HTTP GET request to the specified host address.
     * This function is intended to be used to send a request to the server created by the plugin.
     * @param {string} hostAddr - The host address to probe.
     */
    static probeServer(hostAddr) {
        try {
            const request = new Network.HttpRequest();
            request.url = hostAddr;
            request.method = Network.HttpRequest.Method.Get;

            Network.performHttpRequest(request, function(response) {
                if (response.statusCode !== 200) {
                    console.error("Error: " + response.statusCode + " " + response.body);
                    return;
                }
                console.log("Status Code: " + response.statusCode);
                console.log("Response: " + response.body);
            });
        } catch (error) {
            //@ts-expect-error
            console.error("Error while probing server: " + error.message);
        }
    }

    /**
     * Sends a greeting back to the client socket. This function is intended to be used by the server.
     * @param {Network.TcpSocket} socket - The socket to send the greeting to.
     */
    static greetBack(socket) {
        try {
            socket.write(formHttpResponse(200, "OK", "HELLO FROM SERVER"));
        } catch (error) {
            //@ts-expect-error
            console.log("Error while greeting back: " + error.message);
        }

        /**
         * Forms an HTTP response string.
         * @param {number} statusCode - The HTTP status code.
         * @param {string} statusText - The HTTP status text.
         * @param {string} content - The response content.
         * @returns {string} The formed HTTP response string.
         */
        function formHttpResponse(statusCode, statusText, content) {
            let response = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
            response += "Content-Type: text/html\r\n";
            response += `Content-Length: ${content.length}\r\n`;
            response += "\r\n"; // End of headers
            response += content;
            return response;
        }
    }
}

export class TcpServerDemo extends CoreService {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.TcpServerDemo",
            name: "TCP Server Demo",
            description: "A demo plugin that creates a TCP server",
            dependencies: []
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);

        this.tcpServer = new TcpServerManager();
        this.serverAddr = "127.0.0.1";
        this.serverPort = 3434;
    }

    // Start function in CoreService is called when Lens Studio starts and the plugin is loaded
    start() {
        // Start the tcp server
        this.tcpServer.start(this.serverAddr, this.serverPort);

        // Setup event listeners
        this.tcpServer.onClientConnected = (socket) => {
            console.log(`Client connected from ${socket.remoteAddress.address}:${socket.remoteAddress.port}`);
        };
        this.tcpServer.onClientDataReceived = (data, socket) => {
            console.log(`Received data from ${socket.remoteAddress.address}:${socket.remoteAddress.port}: ${data}`);
            // Send back a response to our client
            Interlocutor.greetBack(socket);
        };
        this.tcpServer.onClientDisconnected = (socket) => {
            console.log(`Client at ${socket.remoteAddress.address}:${socket.remoteAddress.port} disconnected from the server.`);
        };
        this.tcpServer.onClientSocketError = (error, socket) => {
            console.log(`Socket error: ${error}`);
        };

        // Probe the server
        Interlocutor.probeServer(`http://${this.serverAddr}:${this.serverPort}`);
    }

    stop() {
        this.tcpServer.close();
    }
}
