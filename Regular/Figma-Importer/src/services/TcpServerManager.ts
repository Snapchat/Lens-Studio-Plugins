import * as Network from 'LensStudio:Network'
import { logger } from '../utils/FigmaUtils.js'
export default class TcpServerManager {
    private server: Network.TcpServer = Network.TcpServer.create()
    private connections: Editor.ScopedConnection[] = []
    private sockets: Network.BaseSocket[] = []
    public onClientConnected: ((socket: Network.BaseSocket) => void) | null = null
    public onClientDataReceived: ((data: any, socket: Network.TcpSocket) => void) | null = null
    public onClientDisconnected: ((socket: Network.BaseSocket) => void) | null = null
    public onClientSocketError: ((error: any, socket: Network.BaseSocket) => void) | null = null
    public enableLogging: boolean = false

    constructor() {
        // Setup listeners
        this.server.onConnect.connect((socket: Network.BaseSocket) => {
            //save sockets to the persistent array so they dont get garbage collected
            this.sockets.push(socket)

            if (this.enableLogging) {
                logger.debug(`Incoming connection from ${socket.remoteAddress.address}:${socket.remoteAddress.port}`)
            }

            if (this.onClientConnected) {
                this.onClientConnected(socket)
            }

            socket.onData.connect((data: object) => {
                if (this.enableLogging) {
                    logger.debug(`Received data from socket: ${data}`)
                }

                if (this.onClientDataReceived) {
                    this.onClientDataReceived(data, socket as Network.TcpSocket)
                }
            })

            socket.onEnd.connect(() => {
                if (this.enableLogging) {
                    logger.debug(`Socket connected to ${socket.remoteAddress.address}:${socket.remoteAddress.port} disconnected from the server.`)
                }

                if (this.onClientDisconnected) {
                    this.onClientDisconnected(socket)
                }
            })

            socket.onError.connect((errorCode: number) => {
                if (this.enableLogging) {
                    logger.error('Socket error', errorCode)
                }

                if (this.onClientSocketError) {
                    this.onClientSocketError(new Error(`Socket error code: ${errorCode}`), socket)
                }
            })
        })
    }

    /**
     * Starts the server at the specified address and port.
     * @param address - The IP address to listen on.
     * @param port - The port number to listen on.
     */
    start(address: string, port: number): void {
        const localhostAddr = new Network.Address()
        localhostAddr.address = address
        localhostAddr.port = port
        try {
            this.server.listen(localhostAddr)
            logger.debug(`Server started at ${address}:${port}`)
        } catch (e) {
            logger.debug('Failed to start the server: ' + e)
        }
    }

    /**
     * Closes the server and disconnects all connections.
     */
    close(): void {
        // Close the server
        this.server.close()
    }
}
