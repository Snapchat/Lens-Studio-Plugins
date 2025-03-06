import * as Network from 'LensStudio:Network'
import * as Shell from 'LensStudio:Shell'
import TcpServerMan from './TcpServerManager.js'
// import { sha256 } from '../ext_libs/sha256.js'
import { logger } from '../utils/FigmaUtils.js'
import { myEncodeURIComponent } from '../utils/myEncodeURIComponent.js'
import { stringToBase64 } from '../utils/base64.js'

//Update: Per Figma's request, we have updated the oauth flow. updated date: 2025-02-20

const addr = {
    serverAddr: "http://127.0.0.1",
    serverPort: 8080,
    codeTradeInUrl: 'https://api.figma.com/v1/oauth/token',
    permissionPageUrl: 'https://www.figma.com/oauth',
}

//those are static values that should not be changed
const CLIENT_SECRET = Object.freeze('FIHf7QJ7deE8GxKQuIXrzPWhntAJUK') // in the OAuth PKCE flow, the client secret is considered known to the public.
const CLIENT_ID = Object.freeze('sqElujdLVPvHXOuU7xJqPF')

function tradeInCodeForAccessToken(client_id: string, client_secret: string, code: string/* , codeVerifier: string */): Promise<any> {
    return new Promise((resolve, reject) => {
        const tradeInRequest = makeTradeinRequestBody(
            addr.codeTradeInUrl,
            Network.HttpRequest.Method.Post,
            client_id,
            client_secret,
            `${addr.serverAddr}:${addr.serverPort}`,
            code/* ,
            codeVerifier */)
        try {
            //@ts-expect-error - the api is still in effect
            Network.performHttpRequest(tradeInRequest, (response: Network.HttpResponse) => {
                // Check for a successful response
                if (response.statusCode !== 200) {
                    reject(new Error('HTTP Error: ' + response.statusCode))
                } else {
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
    // TODO: PKCE process disabled due to technical issues.
    // We are currently under a time crunch and will reimplement this when releasing the new version of the plugin before the DDL.
    client_id: string, client_secret: string, redirect_uri: string, code: string/* ,
    codeVerifier: string */) {
    const request = new Network.HttpRequest()
    request.url = url
    request.method = method

    // Encode credentials for Basic Auth
    const credentials = `${client_id}:${client_secret}`
    const encodedCredentials = stringToBase64(credentials)

    // Set headers with Basic authentication
    request.headers = {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    const bodyParams = [
        // TODO: PKCE process disabled due to technical issues.
        // We are currently under a time crunch and will reimplement this when releasing the new version of the plugin before the DDL.
        // `code_verifier=${codeVerifier}`,
        `redirect_uri=${myEncodeURIComponent(redirect_uri)}`,
        `code=${code}`,
        `grant_type=authorization_code`
    ]

    request.body = bodyParams.join('&')

    return request
}

function parseCodeFromGETRequest(str: string) {
    const lines = str.split('\n')
    const firstLine = lines[0]

    if (!firstLine) throw new Error('No first line found in the request')
    if (!firstLine.includes('GET')) throw new Error('No GET request found in the request')

    // Define regular expressions to extract code and state
    const codeRegex = /code=([^&]+)/
    const stateRegex = /state=([^&\s]+)/

    // Extract code and state using regular expressions
    const codeMatch = firstLine.match(codeRegex)
    const stateMatch = firstLine.match(stateRegex)

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

/**
 * Generates a complete HTML page.
 *
 * @param title - The title for the HTML page.
 * @param message - The message displayed in the page body.
 * @returns The HTML content as a string.
 */
function getHtmlTemplate(title: string, message: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body {
            font-family: sans-serif;
            display: flex;
            font-size: 1rem;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
    </style>
</head>
<body>
    <p>${message}</p>
</body>
</html>
`.trim()
}

// Define HTML templates to be used in different scenarios.
const HTMLTemplates = {
    stateMismatch: getHtmlTemplate("Error", "State mismatch. Please try again."),
    missingAuthCode: getHtmlTemplate("Error", "Authentication code missing. Please try again."),
    authSuccess: getHtmlTemplate("Success", "Authentication successful, you can close this page now."),
    authFailure: getHtmlTemplate("Error", "Authentication failed. Please try again.<br>If the problem persists, contact the developer."),
}

export function startOAuth() {
    const state = randomStringGenerator(10)
    // TODO: PKCE process disabled due to technical issues.
    // We are currently under a time crunch and will reimplement this when releasing the new version of the plugin before the DDL.
    // const codeVerifier = generateCodeVerifier()
    // const codeChallenge = generateCodeChallenge(codeVerifier)    
    try {
        Shell.openUrl(addr.permissionPageUrl, {
            redirect_uri: `${addr.serverAddr}:${addr.serverPort}`,
            client_id: CLIENT_ID,
            response_type: 'code',
            scope: 'files:read',
            state: state,
            // TODO: PKCE process disabled due to technical issues.
            // We are currently under a time crunch and will reimplement this when releasing the new version of the plugin before the DDL.
            // code_challenge: codeChallenge,
            // code_challenge_method: 'S256',
        })
    } catch (e) {
        console.error(e)
    }

    const tcpServer = new TcpServerMan()
    tcpServer.enableLogging = true

    return new Promise((resolve, reject) => {
        tcpServer.onClientDataReceived = async (data, socket) => {
            try {
                const dataStr = data.toString()

                if (dataStr.includes('GET') && dataStr.includes('favicon.ico')) {
                    socket.close()
                    return
                }

                let parsed
                try {
                    parsed = parseCodeFromGETRequest(dataStr)
                } catch (parseError) {
                    // If the request is not valid for OAuth, close the connection.
                    socket.close()
                    return
                }

                const { code: authCode, state: remoteState } = parsed

                if (state.trim() !== remoteState.trim()) {
                    socket.write(formHttpResponse(200, 'OK', HTMLTemplates.stateMismatch))
                    throw new Error('State mismatch')
                }

                if (!authCode) {
                    socket.write(formHttpResponse(200, 'OK', HTMLTemplates.missingAuthCode))
                    throw new Error('Missing authentication code')
                }

                try {
                    const tokenResponse = await tradeInCodeForAccessToken(
                        CLIENT_ID,
                        CLIENT_SECRET,
                        authCode
                    )
                    logger.info('Access token received successfully')

                    // Send success page
                    socket.write(formHttpResponse(200, 'OK', HTMLTemplates.authSuccess))
                    resolve(tokenResponse)
                } catch (exchangeError) {
                    // Send error page on token exchange failure
                    socket.write(formHttpResponse(200, 'OK', HTMLTemplates.authFailure))
                    throw exchangeError
                }
            } catch (error) {
                reject(error)
            } finally {
                socket.close()
            }
        }

        tcpServer.onClientConnected = () => {
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

// function generateCodeVerifier() {
//     const length = 128
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
//     let result = ''
//     for (let i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() * characters.length))
//     }
//     return result
// }

// //Generates a random code verifier string   .
// function generateCodeChallenge(codeVerifier: string) {
//     const hash = sha256.array(codeVerifier)
//     // const encoder = new Base64UrlSafe()
//     const codeChallenge = stringToBase64(hash)
//     return codeChallenge
// }
