import * as ws from 'LensStudio:WebSocket';
import * as network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';

let imageChunks = {};

function handleWebSocketMessage(socket, message) {
    let parsedMessage;
    try {
        parsedMessage = JSON.parse(message);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return;
    }

    switch(parsedMessage.messageType) {
        case 'closeConnection':
            console.warn('Closing the connection');
            socket.close();
            break;
        case 'regularMessage':
            console.log("Received regular message:", parsedMessage.content);
            break;
        case 'dataRequest':
            console.log('Received data request');
            let sent = socket.send('HERE IS YOUR REQUESTED DATA FROM THE SERVER');
            console.log('Sent message of length ' + sent + ' bytes');
            break;
        case 'imageChunk':
            handleImageChunk(parsedMessage);
            break;
        case 'imageUploadComplete':
            handleImageUploadComplete(parsedMessage.name);
            break;
        default:
            console.log("Unknown message type:", parsedMessage.messageType);
    }
}

function handleImageChunk(parsedMessage) {
    const { name, chunkIndex, totalChunks, data } = parsedMessage;
    if (!imageChunks[name]) {
        imageChunks[name] = new Array(totalChunks);
    }
    imageChunks[name][chunkIndex] = data;
    console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} for image: ${name}`);
}

function handleImageUploadComplete(name) {
    console.log(`Image upload complete: ${name}`);
    if (!imageChunks[name]) {
        console.error(`No chunks found for image: ${name}`);
        return;
    }
    const completeImageData = imageChunks[name].join('');
    const uint8Array = Base64.decode(completeImageData);
    console.log("Image size:", uint8Array.length, "bytes");
    saveImageToFile(name, uint8Array);
    delete imageChunks[name];  // Clean up the chunks
}

function saveImageToFile(name, data) {
    const path = new Editor.Path(import.meta.resolve(`./fromClient/${name}` + '.png'));
    if (!fs.exists(path.parent)) {
        fs.createDir(path.parent, {});
    }
    fs.writeFile(path, data);
    console.log("Saved image to:", path);
}

export class WebSocketServerManager {
    constructor() {
        this.server = ws.WebSocketServer.create();
        this.sockets = [];

        this.server.onConnect.connect((socket) => {
            console.log('New connection');
            this.sockets.push(socket);

            socket.onData.connect((buffer) => {
                handleWebSocketMessage(socket, buffer.toString());
            });

            socket.onEnd.connect(() => {
                console.log('Socket closed');
            });

            socket.onError.connect((error) => {
                console.log('Socket error: ' + error);
            });
        });

        this.server.onError.connect((error) => {
            console.log('Server error: ' + error);
        });
    }

    start(address, port) {
        const localhostAddr = new network.Address();
        localhostAddr.address = address;
        localhostAddr.port = port;
        try {
            this.server.listen(localhostAddr);
            console.log(`Server started at ${address}:${port}`);
        } catch (e) {
            console.error('Failed to start the server: ' + e);
        }
    }

    close() {
        for (let socket of this.sockets) {
            socket.close();
        }
        this.server.close();
    }
}

export function launchWebSocketServer() {
    const addr = {
        serverAddr: '127.0.0.1',
        serverPort: 3000,
    };
    const server = new WebSocketServerManager();
    server.start(addr.serverAddr, addr.serverPort);
    return server;
}
