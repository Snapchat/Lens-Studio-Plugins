import {SizePolicy} from "LensStudio:Ui";
import * as Ui from "LensStudio:Ui";

const CARD_WIDTH = 110;
const CARD_HEIGHT = 182;
const CARD_MARGIN = 8;
const START_GRID_WIDTH = 800;
export class GridWatcher {
    constructor(gridWidget, gridLayout, parentWidget,  transitionCards) {
        this.transitionCards = transitionCards;
        this.gridLayout = gridLayout;
        this.gridWidget = gridWidget;
        this.gridWidgetWidth = START_GRID_WIDTH;
    }
    update() {
        this.sort();
        this.resize(this.gridWidgetWidth);
    }
    sort() {
        this.transitionCards.sort((a, b) => {
            if (a.visible === b.visible) {
                const nameA = a.name.match(/(\D+|\d+)/g);
                const nameB = b.name.match(/(\D+|\d+)/g);

                for (let i = 0; i < Math.min(nameA.length, nameB.length); i++) {
                    const partA = nameA[i];
                    const partB = nameB[i];

                    if (!isNaN(partA) && !isNaN(partB)) {
                        const numA = parseInt(partA, 10);
                        const numB = parseInt(partB, 10);
                        if (numA !== numB) return numA - numB;
                    } else {
                        const strA = partA.toLowerCase();
                        const strB = partB.toLowerCase();
                        if (strA < strB) return -1;
                        if (strA > strB) return 1;
                    }
                }
                return nameA.length - nameB.length;
            }
            return a.visible ? -1 : 1;
        });
    }
    resize(width) {
        this.gridWidgetWidth = width;

        let visibleCards = 0;
        this.transitionCards.forEach((card) => {
            if (card.visible) {
                visibleCards ++;
            }
        });

        const galleryWidth = width - CARD_MARGIN;
        const cardMinWidth = CARD_WIDTH + CARD_MARGIN;

        let cardsPerRow = (galleryWidth >= cardMinWidth) ? Math.floor(galleryWidth / cardMinWidth) : 1;
        cardsPerRow = Math.min(cardsPerRow, visibleCards);

        let row = 0, col = 0;
        for (let i = 0; i < this.transitionCards.length; i++) {
            if (col === 0) {
                this.gridLayout.setRowStretch(row, 0);
            }
            const card = this.transitionCards[i].widget;
            this.gridLayout.addWidgetAt(card, row, col, Ui.Alignment.AlignLeft);
            col++;
            if (col >= cardsPerRow) {
                col = 0;
                row++;
            }
        }
        this.gridLayout.setRowStretch(row + 1, 0);
        this.gridWidget.setFixedWidth((CARD_WIDTH + CARD_MARGIN) * Math.min(cardsPerRow, visibleCards));
        this.gridWidget.setFixedHeight((CARD_HEIGHT + CARD_MARGIN * 1.1) * Math.ceil(visibleCards/ cardsPerRow))
    }
}
