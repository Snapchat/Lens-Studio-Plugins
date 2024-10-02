import * as Network from 'LensStudio:Network'
import * as Shell from 'LensStudio:Shell'
import TcpServerMan from './TcpServerManager.js'
import { sha256 } from '../ext_libs/sha256.js'
import { Base64UrlSafe } from '../ext_libs/base64.js'
import { logger } from '../utils/FigmaUtils.js'

const addr = {
    serverAddr: 'http://127.0.0.1',
    serverPort: 8080,
    codeTradeInUrl: 'https://www.figma.com/api/oauth/token',
    permissionPageUrl: 'https://www.figma.com/oauth',
}

//those are static values that should not be changed
const client_secret = Object.freeze('FIHf7QJ7deE8GxKQuIXrzPWhntAJUK') // in the OAuth PKCE flow, the client secret is considered known to the public.
const client_id = Object.freeze('sqElujdLVPvHXOuU7xJqPF')

function tradeInCodeForAccessToken(client_id: string, client_secret: string, code: string, codeVerifier: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const tradeInRequest = makeTradeinRequestBody(
            addr.codeTradeInUrl,
            Network.HttpRequest.Method.Post,
            client_id,
            client_secret,
            `${addr.serverAddr}:${addr.serverPort}`,
            code,
            codeVerifier)
        try {
            Network.performHttpRequest(tradeInRequest, (response: any) => {
                if (response.statusCode !== 200) {
                    reject(new Error('HTTP Error: ' + response.statusCode))
                } else {
                    // logger.logMessage('Request success! Status code: ' + response.statusCode + '  content type: ' + response.contentType)
                    const json = JSON.parse(response.body.toString())
                    resolve(json)
                }
            })
        } catch (e) {
            reject(e)
        }
    })
}

function makeTradeinRequestBody(url: string,
    method: Network.HttpRequest.Method,
    client_id: string, client_secret: string, redirect_uri: string, code: string,
    codeVerifier: string) {
    const request = new Network.HttpRequest()
    request.url = url
    request.method = method
    request.body = `client_id=${client_id}&client_secret=${client_secret}&code_verifier=${codeVerifier}&redirect_uri=${redirect_uri}&code=${code}&grant_type=authorization_code`
    return request
}

function parseCodeFromGETRequest(str: string) {

    // Define regular expressions to extract code and state
    const codeRegex = /code=([^&]+)/
    const stateRegex = /state=([^ ]+)/

    // Extract code and state using regular expressions
    const codeMatch = str.match(codeRegex)
    const stateMatch = str.match(stateRegex)

    if (codeMatch && stateMatch) {
        const code = codeMatch[1]
        const state = stateMatch[1]
        return {
            code, state
        }
    } else {
        throw new Error('No code or state found in the request')
    }
}

function randomStringGenerator(length: number) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
}

export function startOAuth() {

    const state = randomStringGenerator(10)
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)

    //1. Open a browser window to the Figma OAuth URL
    Shell.openUrl(addr.permissionPageUrl, {
        'redirect_uri': `${addr.serverAddr}:${addr.serverPort}`,
        'client_id': client_id,
        'response_type': 'code',
        'scope': 'files:read',
        'state': state,
        'code_challenge': codeChallenge,
    })

    //2. Wait for the user to authenticate and get redirected to the redirect_uri
    const tcpServer = new TcpServerMan()
    tcpServer.enableLogging = true

    return new Promise((resolve, reject) => {
        tcpServer.onClientDataReceived = async (data, socket) => {

            logger.debug(JSON.stringify(data.toString(), null, 4))
            //getting the code from the request
            const { code: authCode, state: remoteState } = parseCodeFromGETRequest(data.toString())
            if (state !== remoteState) {
                throw new Error('State mismatch')
            }
            socket.write(formHttpResponse(200, 'OK', authCode ? 'Authentication successful, you can close this page now' : 'Authentication failed, please try again'))

            if (!authCode) {
                logger.warn('No code found in the request')
                reject(new Error('No code found in the request'))
            } else {
                if (!client_id || !client_secret) {
                    logger.warn('No client_id or client_secret found')
                    reject(new Error('No client_id or client_secret found'))
                } else {
                    //final step, trade in the code for an access token
                    const json = await tradeInCodeForAccessToken(client_id, client_secret, authCode, codeVerifier)
                    if (!json) {
                        reject(new Error('No json response from tradeInCodeForAccessToken'))
                    } else {
                        logger.info('Access token received successfully')
                        resolve(json)
                    }
                }
            }
            socket.destroy()
        }

        tcpServer.onClientConnected = () => {
            //close the server immediately after the first connection to avoid repeated requests
            tcpServer.close()
        }

        tcpServer.start(addr.serverAddr, addr.serverPort)
    })
}

// return web page with a message
function formHttpResponse(statusCode: number, statusText: string, content: string) {
    let response = `HTTP/1.1 ${statusCode} ${statusText}\r\n`
    response += 'Content-Type: text/html\r\n'
    response += `Content-Length: ${content.length}\r\n`
    response += '\r\n' // End of headers
    response += content
    return response
}

function generateCodeVerifier() {
    const length = 128
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

//Generates a random code verifier string   .
function generateCodeChallenge(codeVerifier: string) {
    //@ts-expect-error not sure the lib is correct
    const hash = sha256.array(codeVerifier)
    const encoder = new Base64UrlSafe()
    const codeChallenge = encoder.encode(hash)
    return codeChallenge
}
