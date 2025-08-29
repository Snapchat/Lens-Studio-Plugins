import { ContentProvider } from "./ContentProvider.js";
import { BM_BUILDER_BASE_URL } from "./constants.js";

const transformOptions = (optionId, type, tones) => {
    if (tones.length === 0) {
        return {
            optionId,
            colors: null,
            colorIndex: -1,
            type
        };
    } else {
        return {
            optionId,
            type,
            colors: tones,
            colorIndex: -1
        };
    }
}

function parseOptions(options, globalType) {
    const result = [];

    options.forEach((option) => {
        const metaResult = [];

        if (!Array.isArray(option.metadata)) {
            option.metadata = [option.metadata];
        }

        option.metadata.forEach((meta) => {
            const { optionId, type, tones } = meta;

            if (type == "garment_category_unset") {
                const option = transformOptions(optionId, globalType, tones);
                metaResult.push(option);
            } else if (type == "one_piece") {
                const optionTop = transformOptions(optionId, "top", tones);
                metaResult.push(optionTop);
                const optionBottom = transformOptions(optionId, "bottom", tones);
                metaResult.push(optionBottom);
            } else if (type == "sock") {
                return;
            } else {
                const option = transformOptions(optionId, type, tones);
                metaResult.push(option);
            }
        });

        if (globalType == "mannequin-with-head-center") {
            if (!metaResult.find(option => option.type == "outerwear")) {
                metaResult.push({ optionId: "", colors: null, colorIndex: -1, type: "outerwear" });
            }
        }

        result.push({ globalType, options: metaResult });
    });

    return result;
}

export class OutfitProviderFactory {
    static createProvider(id, type, emptyOption) {
        return new OutfitProvider(id, type, emptyOption);
    }
}

class OutfitProvider {
    constructor(id, type, emptyOption) {
        this.id = id;
        this.type = type;
        this.cachedItems = null;
        this.currentIndex = 0;
        this.emptyOption = emptyOption;
        this.cachedTones = {};
    }

    async getAll() {
        try {
            if (this.cachedItems) {
                return this.cachedItems;
            }

            const response = await ContentProvider.fetch(BM_BUILDER_BASE_URL + "/sections/" + this.id + "/options", { type: "string", authorized: true });
            const options = JSON.parse(response).options;

            const parsedOptions = parseOptions(options, this.type);

            if (this.emptyOption) {
                this.cachedItems = { items: [{globalType: this.type, options: [{ optionId: "", type: this.type }]}].concat(parsedOptions) };
            } else {
                this.cachedItems = { items: parsedOptions };
            }

            return this.cachedItems;
        } catch (error) {
            console.error(error);
            console.error(error.stack);
        }
    }

    async getTones(optionId) {
        if (this.type == "mannequin-with-head-center") {
            return [];
        }
        if (optionId == "") {
            return [];
        }

        if (this.cachedTones[optionId]) {
            return this.cachedTones[optionId];
        }

        try {
            const response = await ContentProvider.fetch(BM_BUILDER_BASE_URL + "/sections/" + this.id + "/options/" + optionId, { type: "string", authorized: true });
            const tones = JSON.parse(response).option.metadata.tones;
            this.cachedTones[optionId] = tones;
            return tones;
        } catch (error) {
            console.error(error);
            console.error(error.stack);
        }
    }

    async pullPages(pageSize) {
        if (!this.cachedItems) {
            await this.getAll();
        }

        if (this.currentIndex >= this.cachedItems.items.length) {
            return [];
        }

        this.nextIndex = Math.min(this.cachedItems.items.length, this.currentIndex + pageSize);

        const result = this.cachedItems.items.slice(this.currentIndex, this.nextIndex);
        this.currentIndex = this.nextIndex;

        return { "items": result };
    }
}
