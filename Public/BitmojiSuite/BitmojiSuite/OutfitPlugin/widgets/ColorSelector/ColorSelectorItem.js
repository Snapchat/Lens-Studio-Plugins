import * as Ui from 'LensStudio:Ui';
import { EventDispatcher } from '../../../EventDispatcher.js';
import { WidgetFactory } from '../../../WidgetFactory.js';
import { ContentProvider } from '../../providers/ContentProvider.js';

function decimalToHexColor(decimalColor) {
    if (typeof decimalColor !== 'number' || decimalColor < 0 || decimalColor > 16777215) {
      throw new Error('Input must be a number between 0 and 16777215 (0xFFFFFF)');
    }

    const hex = decimalColor.toString(16).padStart(6, '0');

    return `#${hex.toUpperCase()}`;
}

const selectedSvgTemplate = `
        <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="30" height="18" rx="3" stroke="#0871C4" stroke-width="2"/>
            <rect x="2.25" y="2.25" width="27.5" height="15.5" rx="1.75" stroke="black" stroke-width="0.5"/>
            <mask id="clipmask">
                <rect x="2.25" y="2.25" width="27.5" height="15.5" rx="1.75" fill="white"/>
            </mask>
            <g mask="url(#clipmask)">
            &LINES
            </g>
        </svg>`;

const hoveredSvgTemplate = `
        <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.25" y="2.25" width="27.5" height="15.5" rx="1.75" stroke="black" stroke-width="0.5"/>
            <rect x="1" y="1" width="30" height="18" rx="3" stroke="#7BC7FA" stroke-width="2"/>
            <mask id="clipmask">
                <rect x="2.25" y="2.25" width="27.5" height="15.5" rx="1.75" fill="white"/>
            </mask>
            <g mask="url(#clipmask)">
            &LINES
            </g>
        </svg>`;

const normalSvgTemplate = `
        <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.25" y="2.25" width="27.5" height="15.5" rx="1.75" stroke="black" stroke-width="0.5"/>
            <mask id="clipmask">
                <rect x="2.25" y="2.25" width="27.5" height="15.5" rx="1.75" fill="white"/>
            </mask>
            <g mask="url(#clipmask)">
            &LINES
            </g>
        </svg>`;

function expandToLength10(arr) {
    const targetLength = 10;
    const n = arr.length;

    const baseCount = Math.floor(targetLength / n);
    const remainder = targetLength % n;

    const result = [];

    arr.forEach((val, idx) => {
        const count = baseCount + (idx < remainder ? 1 : 0);
        for (let i = 0; i < count; i++) {
            result.push(val);
        }
    });

    return result;
}

function generateSvgLines(decimalColors) {
    decimalColors = decimalColors.slice(0, 3);
    decimalColors = [...new Set(decimalColors)]
    decimalColors = decimalColors.filter(color => color !== 0 && color !== 65793);
    decimalColors = expandToLength10(decimalColors);
    const strokeColors = decimalColors.map(decimalToHexColor);

    const lines = strokeColors.map((color, i) => {
      const x1 = -12 + i * 4;
      const x2 = 8 + i * 4;
      const strokeWidth = (i === 0 || i === 9) ? 3.5 : 2.82842712475;
      return `<line x1="${x1}" y1="20" x2="${x2}" y2="0" stroke="${color}" stroke-width="${strokeWidth}"/>`;
    }).join('\n  ');

    return lines;
}

function generateSVGFromDecimalColors(decimalColors, template) {
    return template.replace("&LINES", generateSvgLines(decimalColors));
}

export class ColorSelectorItem extends EventDispatcher {
    constructor(parent, colors, name) {
        super(parent);
        this.colors = colors;
        this.normalBackground = ContentProvider.createPixmapFromSvg(generateSVGFromDecimalColors(colors, normalSvgTemplate), name + "_normal");
        this.hoveredBackground = ContentProvider.createPixmapFromSvg(generateSVGFromDecimalColors(colors, hoveredSvgTemplate), name + "_hovered");
        this.selectedBackground = ContentProvider.createPixmapFromSvg(generateSVGFromDecimalColors(colors, selectedSvgTemplate), name + "_selected");

        this.signalsBlocked = false;
        this.selected = false;
        this.isBusy = false;

        this.widget = WidgetFactory.beginImageView(parent).sizePolicy(Ui.SizePolicy.Policy.Fixed).pixmap(this.normalBackground).width(32).height(20).scaledContents(true).responseHover(true).end();
        this.widget.onClick.connect(() => this.onClick());
        this.widget.onHover.connect((hovered) => this.onHover(hovered));
    }

    onClick() {
        if (!this.selected && !this.isBusy) {
            this.setSelected(true);
        }
    }

    blockSignals(block) {
        this.signalsBlocked = block;
    }

    onHover(hovered) {
        if (hovered) {
            if (!this.selected) {
                this.widget.pixmap = this.hoveredBackground;
            }
        } else {
            if (this.selected) {
                this.widget.pixmap = this.selectedBackground;
            } else {
                this.widget.pixmap = this.normalBackground;
            }
        }
    }

    setBusy(isBusy) {
        this.isBusy = isBusy;
    }

    setSelected(selected) {
        this.selected = selected;

        if (selected) {
            this.widget.pixmap = this.selectedBackground;
        } else {
            this.widget.pixmap = this.normalBackground;
        }

        if (!this.signalsBlocked) {
            this.dispatchEvent({ type: ColorSelectorItem.SelectionChanged, selected});
        }
    }
}

ColorSelectorItem.SelectionChanged = "SelectionChanged";
