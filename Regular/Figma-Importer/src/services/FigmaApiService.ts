import * as Network from 'LensStudio:Network'
import accessTokenManager from './AccessTokenManager.js'
import { logger } from '../utils/FigmaUtils.js'

const baseUrl = 'https://api.figma.com/'

/**
* Creates and performs an HTTP GET request to the specified URL.
* Handles the response based on its content type.
*/
export async function executeHttpGetRequest(url: string, isFigmaRequest: boolean = false): Promise<Network.HttpResponse> {
    const accessToken = accessTokenManager.getAccessToken()
    if (!accessToken || accessToken === '' || accessToken.trim() === '') {
        throw new Error('No token found. Try authenticate again.')
    }
    try {
        const request = new Network.HttpRequest()
        request.url = url
        request.method = Network.HttpRequest.Method.Get

        if (isFigmaRequest) {
            request.headers = {
                'Authorization': 'Bearer ' + accessToken,
            }
        }
        return new Promise((resolve, reject) => {
            try {
                //@ts-expect-error - the api is still in effect
                Network.performHttpRequest(request, function (response: Network.HttpResponse) {
                    resolve(response)
                })
            } catch (e) {
                reject(e)
            }
        })
    } catch (e) {
        logger.error('Encountered an error while executing HTTP GET request to ' + url, e)
        throw e
    }
}

export async function fetchUser(authErrorCallback: () => void) {
    const url = baseUrl + 'v1/me'
    const response = await executeHttpGetRequest(url, true)
    if (response.statusCode === 403) {
        authErrorCallback()
        return
    }
    const json = JSON.parse(response.body.toString())
    return json
}

export async function fetchTeamProjects(teamId: string) {
    // logger.logMessage(`Getting projects from team: ${teamId}`)
    const url = baseUrl + `/v1/teams/${teamId}/projects/`
    const response = await executeHttpGetRequest(url, true)
    if (response.statusCode !== 200) {
        throw new Error(`Error fetching projects from team: ${teamId}`)
    }
    const json = JSON.parse(response.body.toString())
    logger.debug(JSON.stringify(json, null, 2))
    // logger.logMessage(`Getting project list from team: ${json.name}`)
    return json.projects
}

export async function fetchProjectFiles(projectId: string) {
    // logger.logMessage(`Getting files from project: ${projectId}`)
    const url = baseUrl + `v1/projects/${projectId}/files`
    const response = await executeHttpGetRequest(url, true)
    if (response.statusCode !== 200) {
        throw new Error(`Error fetching files from project: ${projectId}`)
    }
    const json = JSON.parse(response.body.toString())
    // console.log(`RESPONSE FROM RES:\n\n${JSON.stringify(json, null, 2)}`)
    return json.files
}

export async function fetchFile(fileKey: string): Promise<Figma.GetFileResponse> {
    logger.debug(`Getting file nodes from file: ${fileKey}`)
    const fileUrl = `https://api.figma.com/v1/files/${fileKey}`
    const response = await executeHttpGetRequest(fileUrl, true)
    if (response.statusCode !== 200) {
        throw new Error(`Error fetching file: ${fileKey}`)
    }
    const json = JSON.parse(response.body.toString())
    return json
}

/**
 * Fetches image URLs from a Figma file for the specified node IDs. This can include specific scale, format, and various SVG options.
 *
 * @returns {Promise<{ [id: string]: string | null }>} A Promise that resolves to an object where each key is a node ID and the value is the corresponding image URL or null if not found. May reject with error code 400 for invalid parameters, 404 if the file is not found, or 500 for an unexpected rendering error.
 */
export async function fetchNodeImgUrls(fileKey: string, IDs: string[], imageOptions: ImageOptions): Promise<{ [id: string]: string | null }> {

    const url = baseUrl
        + `v1/images/${fileKey}`
        + `?ids=${IDs.join(',')}`
        + `&scale=${imageOptions.scale}`
        + `&format=${imageOptions.format}`
        + `&svg_outline_text=${imageOptions.svg_outline_text}`
        + `&svg_include_id=${imageOptions.svg_include_id}`
        + `&svg_include_node_id=${imageOptions.svg_include_node_id}`
        + `&svg_simplify_stroke=${imageOptions.svg_simplify_stroke}`
        + `&contents_only=${imageOptions.contents_only}`
        + `&use_absolute_bounds=${imageOptions.use_absolute_bounds}`

    if (url.length > 2000) {
        throw new Error('URL is too long')
    }

    logger.debug(`Fetching images from url: ${url}. This will take a while...`)
    const response = await executeHttpGetRequest(url, true)
    if (response.statusCode !== 200) {
        logger.error(`Error fetching images from file: ${fileKey}`, null)
        throw new Error('File not found')
    }
    const json = JSON.parse(response.body.toString())
    if (json.err) {
        logger.error(`Error fetching images from file: ${fileKey}`, null)
        throw new Error(json.err)
    }
    return json.images
}

export async function downloadImageFile(url: string) {
    if (!url) throw new Error('URL is required')

    const response: Network.HttpResponse = await executeHttpGetRequest(url, false)

    if (response.statusCode !== 200) {
        throw new Error(`Failed to download image from ${url}`)
    }

    if (!response.contentType) {
        throw new TypeError(`${url} is not returning a content type`)
    }

    let type = response.contentType.split('/')[0]
    let subType = response.contentType.split('/')[1]

    if (type !== 'image') {
        if (response.contentType === 'binary/octet-stream') {
            // Assume it's a PNG if the content type is binary/octet-stream
            // FIXME: This is a hacky way to determine the image type
            type = 'image'
            subType = 'png'
        } else {
            throw new TypeError(`${url} is not returning an image. Its type is ${response.contentType}`)
        }
    }

    return {
        bytes: response.body.toBytes(),
        subType: subType
    }
}

export type ImageOptions = {
    scale?: number
    format?: string
    svg_outline_text?: boolean
    svg_include_id?: boolean
    svg_include_node_id?: boolean
    svg_simplify_stroke?: boolean
    contents_only?: boolean
    use_absolute_bounds?: boolean
}

export function createDefaultImageOptions(options: Partial<ImageOptions> = {}): ImageOptions {
    return {
        // A number between 0.01 and 4, the image scaling factor. Default: 1.
        scale: options.scale ?? 1,

        // A string enum for the image output format, can be jpg, png, svg, or pdf. Default: 'png'.
        format: options.format ?? 'png',

        // Whether text elements are rendered as outlines or as <text> elements in SVGs. Default: true.
        svg_outline_text: options.svg_outline_text ?? true,

        // Whether to include id attributes for all SVG elements. Default: false.
        svg_include_id: options.svg_include_id ?? false,

        // Whether to include node id attributes for all SVG elements. Default: false.
        svg_include_node_id: options.svg_include_node_id ?? false,

        // Whether to simplify strokes and use stroke attribute if possible. Default: true.
        svg_simplify_stroke: options.svg_simplify_stroke ?? true,

        // Whether content that overlaps the node should be excluded from rendering. Default: true.
        contents_only: options.contents_only ?? true,

        // Use the full dimensions of the node regardless of cropping. Default: false.
        use_absolute_bounds: options.use_absolute_bounds ?? false,
    }
}
