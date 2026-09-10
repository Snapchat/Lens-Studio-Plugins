/**
 * Shape of a dream/effect settings object returned by the dreams API
 * and cached in the gallery / settings pages.
 */
export interface DreamPreview {
    targetImageUrl: string;
}

export interface DreamSettings {
    id?: string;
    state: string;
    prompt: string;
    previewUrl?: string;
    packId?: string;
    previews?: DreamPreview[];
    isFavorite?: boolean;
    seed?: string;
}
