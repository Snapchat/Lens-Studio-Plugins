import * as Network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';

const scriptPath = import.meta.url.replace('file://', '');
const projectRoot = scriptPath.substring(0, scriptPath.lastIndexOf('/'));

export default class TcpServerManager {
    constructor() {
        this.server = Network.TcpServer.create();
        this.sockets = [];
        this.connections = [];

        this.onClientConnected = null;

        this.connections.push(this.server.onConnect.connect((socket) => {
            this.sockets.push(socket);

            socket.onData.connect((data) => {
                this.handleHttpRequest(data, socket);
            });
            socket.onEnd.connect(() => {
                this.sockets = this.sockets.filter(s => s !== socket);
            });
            socket.onError.connect((errorCode) => {
                if (errorCode !== 1)
                    console.error(`Socket Error: ${errorCode}`);
            });
        }));
    }

    start(address) {
        const localhostAddr = new Network.Address();
        localhostAddr.address = address;
        localhostAddr.port = 0;
        try {
            this.server.listen(localhostAddr);
        } catch (e) {
            console.log('Failed to start the server: ' + e);
        }
    }

    close() {
        try {
            for (const connection of this.connections) {
                try {
                    connection.disconnect();
                } catch (e) {
                    console.error("Error disconnecting TCP connection:", e);
                }
            }
            this.connections = [];
        } catch (e) {
            console.error("Error disconnecting TCP connections:", e);
        }

        try {
            for (let socket of this.sockets) {
                try {
                    socket.close();
                } catch (e) {
                    console.error("Error closing TCP socket:", e);
                }
            }
            this.sockets = [];
        } catch (e) {
            console.error("Error closing TCP sockets:", e);
        }

        try {
            this.server.close();
        } catch (e) {
            console.error("Error closing TCP server:", e);
        }
    }

    getPort(){
        return this.server.port;
    }

    handleHttpRequest(data, socket) {
        let dataString = data.toString();
        if (dataString.includes('GET') && dataString.includes('favicon.ico')) {
            return;
        }

        let fullRequestPath = dataString.split(' ')[1];
        let requestPath = fullRequestPath.split('?')[0];

        if (requestPath === '/' || requestPath === '/web/editor') {
            requestPath = '/web/editor.html';
        }

        const absoluteFilePath = new Editor.Path(projectRoot + requestPath);

        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.ts': 'application/typescript',
            '.json': 'application/json',
            '.ttf': 'font/ttf',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.png': 'image/png',
            '.md': 'text/markdown',
        };

        const binaryExtensions = ['.ttf', '.woff', '.woff2', '.png'];

        try {
            const extension = requestPath.substring(requestPath.lastIndexOf('.'));
            const isBinary = binaryExtensions.includes(extension);
            const mimeType = mimeTypes[extension] || 'application/octet-stream';

            const fileContent = isBinary
                ? fs.readBytes(absoluteFilePath)
                : fs.readFile(absoluteFilePath);

            const headers = [
                'HTTP/1.1 200 OK',
                `Content-Type: ${mimeType}`,
                `Content-Length: ${fileContent.length}`,
                'Connection: close'
            ];

            const response = headers.join('\r\n') + '\r\n\r\n';
            socket.write(response);
            socket.write(fileContent);

        } catch (e) {
            console.error(`HTTP Server Error: Could not find or read file ${requestPath}. Details: ${e}`);
            const errorMsg = "<h1>404 Not Found</h1>";
            const headers = [
                'HTTP/1.1 404 Not Found',
                'Content-Type: text/html',
                `Content-Length: ${errorMsg.length}`,
                'Connection: close'
            ];
            socket.write(headers.join('\r\n') + '\r\n\r\n' + errorMsg);
        } finally {
            socket.close();
        }
    }
}
