import * as Ui from "LensStudio:Ui";
import * as Network from "LensStudio:Network";
import { StorageProvider } from "./StorageProvider.js";

const storage = new StorageProvider();
globalThis.timeouts = [];

export class ContentProvider {
    static generatePixelSVG(hexColor) {
        return `<svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
          <rect width="1" height="1" fill="#${hexColor}"/>
        </svg>`;
      }

    static createColorTile(code) {
        return this.createPixmapFromSvg(ContentProvider.generatePixelSVG(code), code + ".svg");
    }

    static createPixmapFromSvg(content, name) {
        const path = storage.createFile(name + ".svg", content);

        return new Ui.Pixmap(path);
    }

    static async downloadMovie(filename, url) {
        const previewContent = await this.fetch(url);
        const previewFilename = storage.createFile(filename, previewContent);
        return new Ui.Movie(previewFilename);
    }

    static async downloadPixmap(filename, url) {
        const previewContent = await this.fetch(url);

        if (previewContent.length === 0) {
            return null;
        }

        const previewFilename = storage.createFile(filename, previewContent);
        return new Ui.Pixmap(previewFilename);
    }

    static async fetch(url, options = {}) {
        const {
            type = "bytes",
            retries = 3,
            delay = 500,
            authorized = false
        } = options;

        return new Promise((resolve, reject) => {
            if (!url) {
                resolve(new Uint8Array());
                return;
            }

            const attemptFetch = (remainingRetries) => {
                const request = new Network.HttpRequest();
                request.url = url;
                request.method = Network.HttpRequest.Method.Get;

                const onResponse = (response) => {
                    if (response.statusCode === 200) {
                        switch (type) {
                            case "bytes":
                                resolve(response.body.toBytes());
                                break;
                            case "string":
                                resolve(response.body.toString());
                                break;
                            default:
                                resolve(response.body.toBytes());
                                break;
                        }
                    } else if (remainingRetries > 0) {
                        globalThis.timeouts.push(setTimeout(() => {
                            attemptFetch(remainingRetries - 1);
                        }, delay));
                    } else {
                        resolve(new Uint8Array());
                    }
                };

                if (authorized) {
                    Network.performAuthorizedHttpRequest(request, onResponse);
                } else {
                    Network.performHttpRequest(request, onResponse);
                }
            };

            attemptFetch(retries);
        });
    }
}
