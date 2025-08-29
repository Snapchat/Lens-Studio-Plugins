import * as Ui from "LensStudio:Ui";

export function createColor(r, g, b, a) {
    const color = new Ui.Color();
    color.red = r;
    color.green = g;
    color.blue = b;
    color.alpha = a;
    return color;
}

export const opaqueColor = createColor(0, 0, 0, 0);
export const highlightColor = createColor(8, 113, 196, 255);

// Sections Tab Bar Colors
export const selectedBackgroundColor = createColor(102, 115, 128, 255);
export const selectedForegroundColor = opaqueColor;
export const normalBackgroundColor = createColor(45, 50, 57, 255);
export const normalForegroundColor = createColor(195, 210, 223, 255 * 0.1);
export const hoveredBackgroundColor = createColor(54, 61, 69, 255);
export const hoveredForegroundColor = highlightColor;
