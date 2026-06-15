export enum SelectionType {
    Background = "background",
    Bitmoji = "bitmoji",
    Bubble = "bubble",
}

export interface Selection {
    type: SelectionType | null;
    index: number;
}

export function createEmptySelection(): Selection {
    return { type: null, index: -1 };
}
