import { Pixmap } from "LensStudio:Ui";
import { GridItem } from "../../common/Grid";

export interface PoseEntry extends GridItem {
    url: string;
    extraUrl: string;
    preview: string;
    path: string;
    extraPath: string;
    index: number;
}

function zeroPad(n: number): string {
    return String(n).padStart(2, "0");
}

const POSE_URLS: string[] = [
    "https://cf-st.sc-cdn.net/d/N5pUfn1wZhVYqOXqjVYWc?bo=EhQyAX06AQRCBgjJ8t7HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/GMc0B7dQPrqOKkhXf2vEd?bo=EhQyAX06AQRCBgjV897HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/IcaEeA4QZ8yDH9S8jJtd8?bo=EhQyAX06AQRCBgjr897HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/hHxM7JllKTNQEYck4IHKS?bo=EhQyAX06AQRCBgiG9N7HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/YwrxogeI1PRvS6Jjq0iKH?bo=EhQyAX06AQRCBgic9N7HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/vKiojAWgA79NgBLwEr6tZ?bo=EhQyAX06AQRCBgi19N7HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/HDesMdRUdSp3Wst85bnY0?bo=EhQyAX06AQRCBgjF9N7HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/BIVrOd8mcRAaBwZakcAM8?bo=EhQyAX06AQRCBgjcyv_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/meASWqJx2IjrE4VopGIqB?bo=EhQyAX06AQRCBgjMy__HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/VjRgst4HY99vLjlymHC5A?bo=EhQyAX06AQRCBgjhy__HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/KIi5CSJtm5NFVHXTSYtbJ?bo=EhQyAX06AQRCBgj3y__HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/rvZRln02yVmAPBCmvNtff?bo=EhQyAX06AQRCBgiTzP_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/M6lV8Mu01OJyzLl529yBd?bo=EhQyAX06AQRCBgj01P_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/E7rfANm1Qkv1H4XQPQRy0?bo=EhQyAX06AQRCBgiG1f_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/E91GCpVybll32T4ADg8OI?bo=EhQyAX06AQRCBgiU1f_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/SKbxpjlhzFxP2y8WSbKzm?bo=EhQyAX06AQRCBgim1f_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/XqwZ66bEH61qzktiHjUIV?bo=EhQyAX06AQRCBgjL1__HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/m4O8pqnwiLoJz86iTOief?bo=EhQyAX06AQRCBgjX1__HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/caytGMdsgsza3b7XLeYte?bo=EhQyAX06AQRCBgjo1__HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/Tjy4ne644CpkWOh77Ok7q?bo=EhQyAX06AQRCBgiH2P_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/lEUlZsF0zj5BdPVyIon6x?bo=EhQyAX06AQRCBgic2P_HBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/teydQbDt5m30yLyJDzogg?bo=EhQyAX06AQRCBgi6goDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/HUXSiQbbQKggBCN4t0yQg?bo=EhQyAX06AQRCBgjNgoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/XrNiverGZWui1f9fNqyjs?bo=EhQyAX06AQRCBgjhgoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/hYqYYHUUXWhiQ45B2EnNg?bo=EhQyAX06AQRCBgjzgoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/UfQ6vOZ6C7XcQIyGdx2F9?bo=EhQyAX06AQRCBgiBg4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/HIH6anHclmloCDbncxpmj?bo=EhQyAX06AQRCBgidg4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/amuabmETUlcM43TXey2nW?bo=EhQyAX06AQRCBgiqg4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/q2UqHLzMqGWg7EoPEX59s?bo=EhQyAX06AQRCBgjAg4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/eYQyjPH6QmXum48SvDjqB?bo=EhQyAX06AQRCBgjWg4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/BsCCFeLrDaqpR6iyedign?bo=EhQyAX06AQRCBgjkg4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/6KSlTmcHrLuQ9vBHJYNAQ?bo=EhQyAX06AQRCBgj3g4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/viXyu5MZ2sZjqcMtSSSKn?bo=EhQyAX06AQRCBgiKhIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/NCFXpAKwTA0GqNiFpeu8o?bo=EhQyAX06AQRCBgiXhIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/d3Ah5rnkEXnKmfTxZYOU2?bo=EhQyAX06AQRCBgilhIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/ewmdEM8vGQ14OlfeBdS7T?bo=EhQyAX06AQRCBgiyhIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/tjAep0jrkUiYf5pkroVZV?bo=EhQyAX06AQRCBgjDhIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/5t4FO4F5AtwSrJbPg8XUs?bo=EhQyAX06AQRCBgjShIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/ONSdQ2WFlC2vu0XdlLjS0?bo=EhQyAX06AQRCBgjghIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/sbOYXijCgGALFeynfoFQm?bo=EhQyAX06AQRCBgjyhIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/B0edby5sBFgm81Q5XN9hi?bo=EhQyAX06AQRCBgj-hIDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/L4EJfjsHRAaBVqPO7KwFk?bo=EhQyAX06AQRCBgighYDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/3atJWhVV8b0IK5r6WJjHm?bo=EhQyAX06AQRCBgjLhYDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/sqxFY5EswAIJgcYqTyr7z?bo=EhQyAX06AQRCBgjZhYDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/2vFuFPxqObYb7rW8udeHg?bo=EhQyAX06AQRCBgjlhYDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/HgCUdtOOAiWw3clKpZYrx?bo=EhQyAX06AQRCBgjyhYDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/SxMy92CkQbMSDYnP4K7Gn?bo=EhQyAX06AQRCBgj-hYDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/0CFrfrrOGo9Ld6Lep4UNQ?bo=EhQyAX06AQRCBgiJhoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/anZghXx9Ds6cTGGCxCr3B?bo=EhQyAX06AQRCBgiVhoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/bnUZb2vAjYK8vripZJ1yS?bo=EhQyAX06AQRCBgihhoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/LBOwDSp0KHoAf0oVpksb2?bo=EhQyAX06AQRCBgiuhoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/lS9bBPKcDldF9IaDZn6ek?bo=EhQyAX06AQRCBgi-hoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/5tjms1vmFBeZCP6rDwscV?bo=EhQyAX06AQRCBgjOhoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/dsvEqyHPc2qHt1OEEJUMU?bo=EhQyAX06AQRCBgjfhoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/7VmvSTYURD1d9Vfn501mR?bo=EhQyAX06AQRCBgjzhoDIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/1Kqfpdg4zWpqHcgmFS6lV?bo=EhQyAX06AQRCBgiEh4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/gAVUi5EcFw9qyxO9dC2k5?bo=EhQyAX06AQRCBgiRh4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/ejs2ugKpeqLZgiW9a5HnI?bo=EhQyAX06AQRCBgifh4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/zylx64UtCDbGRfwFfQZOT?bo=EhQyAX06AQRCBgish4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/4qzPjufdk7zDg3Vt32LVI?bo=EhQyAX06AQRCBgi4h4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/Ji6cx6dwwhfxPA1HOnbzx?bo=EhQyAX06AQRCBgjKh4DIBkgCUBJgAQ%3D%3D&uc=18",
    "https://cf-st.sc-cdn.net/d/ZsHTm8CJCEfjDIDds8rdD?bo=EhQyAX06AQRCBgjYh4DIBkgCUBJgAQ%3D%3D&uc=18",
];

const EXTRA_URLS: Record<number, string> = {
    5: "https://cf-st.sc-cdn.net/d/0iODt4S8SKhBzfcLBD4cG?bo=EhQyAX06AQRCBgjsntTIBkgCUBJgAQ%3D%3D&uc=18",
    6: "https://cf-st.sc-cdn.net/d/3gDKTcBiIUeMWnR3mwnBn?bo=EhQyAX06AQRCBgj-ntTIBkgCUBJgAQ%3D%3D&uc=18",
    9: "https://cf-st.sc-cdn.net/d/GR9mj6MjLnY9gtWpm05i3?bo=EhQyAX06AQRCBgiKn9TIBkgCUBJgAQ%3D%3D&uc=18",
    10: "https://cf-st.sc-cdn.net/d/l58PtxRr14Ki4zjh9NzoC?bo=EhQyAX06AQRCBgien9TIBkgCUBJgAQ%3D%3D&uc=18",
    16: "https://cf-st.sc-cdn.net/d/bBty2A6qvgJPDTY4zOQES?bo=EhQyAX06AQRCBgitn9TIBkgCUBJgAQ%3D%3D&uc=18",
    23: "https://cf-st.sc-cdn.net/d/BnHqe6xzNO4mOEdVvFP1T?bo=EhQyAX06AQRCBgi7n9TIBkgCUBJgAQ%3D%3D&uc=18",
    29: "https://cf-st.sc-cdn.net/d/fPiL0W1VlV3Vry4d5RVsS?bo=EhQyAX06AQRCBgjNn9TIBkgCUBJgAQ%3D%3D&uc=18",
    30: "https://cf-st.sc-cdn.net/d/f2rvJTIFDAnrBqosmrp6Y?bo=EhQyAX06AQRCBgj5n9TIBkgCUBJgAQ%3D%3D&uc=18",
    31: "https://cf-st.sc-cdn.net/d/Udj2Th7hIlJAv9wl9nCrw?bo=EhQyAX06AQRCBgiToNTIBkgCUBJgAQ%3D%3D&uc=18",
    32: "https://cf-st.sc-cdn.net/d/0QgvooewKlghBuKsLCHg6?bo=EhQyAX06AQRCBgiioNTIBkgCUBJgAQ%3D%3D&uc=18",
    33: "https://cf-st.sc-cdn.net/d/Cgqt5qYLwt6wL6nXZkPxb?bo=EhQyAX06AQRCBgi7oNTIBkgCUBJgAQ%3D%3D&uc=18",
    34: "https://cf-st.sc-cdn.net/d/EsVfZozrKOAG3alGr5on2?bo=EhQyAX06AQRCBgjJoNTIBkgCUBJgAQ%3D%3D&uc=18",
    35: "https://cf-st.sc-cdn.net/d/36CdTIKnVLb65zpYVlKpM?bo=EhQyAX06AQRCBgiHodTIBkgCUBJgAQ%3D%3D&uc=18",
    36: "https://cf-st.sc-cdn.net/d/pPw8cD3eROzyPzqU8qR0a?bo=EhQyAX06AQRCBgiaodTIBkgCUBJgAQ%3D%3D&uc=18",
    47: "https://cf-st.sc-cdn.net/d/WesfnjZyqs9avwI0xpvN1?bo=EhQyAX06AQRCBgioodTIBkgCUBJgAQ%3D%3D&uc=18",
    49: "https://cf-st.sc-cdn.net/d/JsQ8BnSNFJQF6ingWqIXT?bo=EhQyAX06AQRCBgi1odTIBkgCUBJgAQ%3D%3D&uc=18",
    50: "https://cf-st.sc-cdn.net/d/j6SN04pvA0naNEjbnJs0Y?bo=EhQyAX06AQRCBgjBodTIBkgCUBJgAQ%3D%3D&uc=18",
    52: "https://cf-st.sc-cdn.net/d/Aekv9ehkMzEijweah4a4G?bo=EhQyAX06AQRCBgjPodTIBkgCUBJgAQ%3D%3D&uc=18",
};

function buildPoses(): PoseEntry[] {
    return POSE_URLS.map((url, index) => {
        const num = zeroPad(index + 1);
        const basePath = import.meta.resolve(`./resources/animations/animation_${num}.remoteReferenceAsset`);
        const extraUrl = EXTRA_URLS[index] ?? url;
        const extraPath = EXTRA_URLS[index]
            ? import.meta.resolve(`./resources/animations/animation_${num}_extra.remoteReferenceAsset`)
            : basePath;

        const preview = import.meta.resolve(`./resources/previews/pose_${num}.png`);
        return {
            url,
            extraUrl,
            preview,
            cachedPixmap: new Pixmap(new Editor.Path(preview)),
            path: basePath,
            extraPath,
            index,
        };
    });
}

let _cachedPoses: PoseEntry[] | null = null;

export function getAllPoses(): PoseEntry[] {
    if (!_cachedPoses) {
        _cachedPoses = buildPoses();
    }
    return _cachedPoses;
}

export function getDefaultPose(): PoseEntry {
    return getAllPoses()[0];
}

export function getPosePreviewPixmap(pose: PoseEntry): Pixmap {
    return new Pixmap(new Editor.Path(pose.preview));
}
