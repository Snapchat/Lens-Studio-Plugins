import { ContentProvider } from "./ContentProvider.js";
import * as Ui from 'LensStudio:Ui';

const emptyItemPixmap = new Ui.Pixmap(import.meta.resolve("./Resources/icons/hide.svg"))

const getFileName = (item) => {
    let result = item.globalType;

    item.options.forEach((option) => {
        if (option.optionId) {
            result += "_" + option.optionId;
        }
    });

    return result + "_thumbnail.png";
}

export class BitmojiPreviewProvider {
    constructor(bitmojiData) {
        this.bitmojiData = bitmojiData;
    }

    async getPreviewImage(item) {
        if (item.options.length == 0) console.warn("No options found for item: ", JSON.stringify(item));

        if (item.options[0].optionId) {
            const filename = new Editor.Path(getFileName(item));
            const url = this.buildUrlFromTopObject(item, false);
            return ContentProvider.downloadPixmap(filename, url);
        } else {
            return emptyItemPixmap;
        }
    }

    async getPreviewData(item) {
        const url = this.buildUrlFromTopObject(item, true);
        const result = await ContentProvider.fetch(url, { type: "string" });
        return JSON.parse(result);
    }

    createParamsFromColors(colors, type) {
        const params = {};
        colors.forEach((color, index) => {
            params[`${type}_tone${index + 1}`] = color;
        });

        return params;
    }

    buildUrlFromTopObject(object, debug) {
        const baseUrl = `https://aws.api.snapchat.com/bm-preview/v3/avatar/${object.globalType}`;

        let queryParams = `scale=1&style=5&ua=2&clothing_type=1&gender=${this.bitmojiData.gender}`;

        object.options.forEach((option) => {
            if (option.optionId) {
                queryParams += `&${option.type}=${option.optionId}`;
            }

            if (option.colors) {
                const params = this.createParamsFromColors(option.colors[option.colorIndex == -1 ? 0 : option.colorIndex], option.type);
                for (const [key, value] of Object.entries(params)) {
                    queryParams += `&${key}=${value}`;
                }
            }
        });

        if (this.bitmojiData.bodyType) {
            queryParams += `&body=${this.bitmojiData.bodyType}`;
        }

        if (this.bitmojiData.breastType) {
            queryParams += `&breast=${this.bitmojiData.breastType}`;
        }

        if (debug) {
            queryParams += "&debug=1";
        }

        return `${baseUrl}?${queryParams}`;
    }
}
