import * as Ui from 'LensStudio:Ui';
import { OutfitProviderFactory } from './OutfitProviders.js';
import { ContentProvider } from './ContentProvider.js';

import { BM_BUILDER_BASE_URL } from './constants.js';

const sectionsMapping = {
    "40": {
        id: "mannequin-with-head-center",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/outfit_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/outfit_hover.svg")),
        title: "Outfit",
        order: 0,
        emptyOption: false,
        cancel: ["top", "bottom", "dress", "footwear", "outerwear"],
        aspectRatio: 1.3,
    },
    "29": {
        id: "top",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/top_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/top_hover.svg")),
        title: "Top",
        order: 1,
        emptyOption: false,
        cancel: ["dress", "mannequin-with-head-center"],
        aspectRatio: 1,
    },
    "30": {
        id: "bottom",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/bottom_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/bottom_hover.svg")),
        title: "Bottom",
        order: 2,
        emptyOption: false,
        cancel: ["dress", "mannequin-with-head-center"],
        aspectRatio: 1,
    },
    "39": {
        id: "dress",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/dress_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/dress_hover.svg")),
        title: "Dress",
        order: 3,
        emptyOption: false,
        cancel: ["top", "bottom", "mannequin-with-head-center"],
        aspectRatio: 1,
    },
    "31": {
        id: "footwear",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/footwear_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/footwear_hover.svg")),
        title: "Footwear",
        order: 4,
        emptyOption: true,
        cancel: ["mannequin-with-head-center"],
        aspectRatio: 1,
    },
    "53": {
        id: "bag",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/bag_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/bag_hover.svg")),
        title: "Bag",
        order: 5,
        emptyOption: true,
        cancel: [],
        aspectRatio: 1,
    },
    "32": {
        id: "outerwear",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/outerwear_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/outerwear_hover.svg")),
        title: "Outerwear",
        order: 6,
        emptyOption: true,
        cancel: ["mannequin-with-head-center"],
        aspectRatio: 1,
    },
    "14": {
        id: "glasses",
        icon: new Ui.Pixmap(import.meta.resolve("./Resources/icons/glasses_normal.svg")),
        iconHover: new Ui.Pixmap(import.meta.resolve("./Resources/icons/glasses_hover.svg")),
        title: "Glasses",
        order: 7,
        emptyOption: true,
        cancel: [],
        aspectRatio: 1,
    }
}

export class SectionsProvider {
    static async getAll() {
        const response = await ContentProvider.fetch(BM_BUILDER_BASE_URL + "/sections", { type: "string", authorized: true });
        const sections = JSON.parse(response).sections;

        const result = new Array(sections.length);
        for (const section of sections) {
            if (!sectionsMapping[section.id]) {
                continue;
            }

            result[sectionsMapping[section.id].order] = {
                id: sectionsMapping[section.id].id,
                title: sectionsMapping[section.id].title,
                icon: sectionsMapping[section.id].icon,
                iconHover: sectionsMapping[section.id].iconHover,
                provider: OutfitProviderFactory.createProvider(section.id, sectionsMapping[section.id].id, sectionsMapping[section.id].emptyOption),
                cancel: sectionsMapping[section.id].cancel,
                aspectRatio: sectionsMapping[section.id].aspectRatio
            };
        }

        return { "items": result };
    }
}
