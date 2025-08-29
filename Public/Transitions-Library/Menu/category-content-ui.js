import * as Ui from "LensStudio:Ui";
import {Alignment} from "LensStudio:Ui";
import {TransitionCard} from "./transition-card.js";
import {GridWatcher} from "./grid-watcher.js";
import {Event} from "../Utils/event.js"

export class ContentGrid {
    constructor(parentWidget, parentLayout, controller, emptyPageWidget) {
        this.ITEMS_IN_ROW = 3;
        this.controller = controller;

        this.onViewChanged = new Event();
        this.isVisible = true;

        this.parentWidget = parentWidget;
        this.parentLayout = parentLayout;
        this.emptyPageWidget = emptyPageWidget;
        this.transitionCards = [];

        this.createGrid();

        this.onViewChanged.add(() => this.gridWatcher.update());
    }
    show() {
        this.parentWidget.visible = this.isVisible = true;
        for (const transitionCard of this.transitionCards) {
            transitionCard.show();
        }
        this.onViewChanged.trigger();
    }
    hide() {
        this.parentWidget.visible = this.isVisible = false;
        for (const transitionCard of this.transitionCards) {
            transitionCard.hide();
        }
        this.onViewChanged.trigger();
    }

    initializeGrid(categories) {
        categories.forEach(category => {
            category.entities.forEach((entity) => {
                const transitionCard = this.createTransitionCard(this.transitionCards.length);
                transitionCard.categoryName = category.name;
                transitionCard.name = entity.name;
                transitionCard.iconName = entity.iconName;
                transitionCard.moviePreviewName = entity.moviePreviewName;
                transitionCard.lsoID = entity.id;
                if (entity.keyWords) {
                    transitionCard.keyWords = entity.keyWords;
                }
            });
        });
        this.gridWatcher = new GridWatcher(this.gridWidget, this.gridLayout, this.parentWidget,this.transitionCards);
    };
    createGrid() {
        this.gridWidget = new Ui.Widget(this.parentWidget);
        this.parentLayout.addWidget(this.gridWidget)
        this.parentLayout.setWidgetAlignment(this.gridWidget, Alignment.AlignLeft);
        this.gridLayout = new Ui.GridLayout();
        this.gridLayout.setContentsMargins(0, 0, 0, 0);
        this.gridLayout.setLayoutAlignment(this.gridLayout, Ui.Alignment.AlignTop | Ui.Alignment.AlignLeft);
        this.gridWidget.layout = this.gridLayout;
    }
    filterBySearchText(searchText) {
        let visibleCards = 0;
        const wordsToCheck = searchText.toLowerCase().split(" ").filter(word => word.trim() !== "");

        this.transitionCards.forEach((transitionCard) => {
            if ((wordsToCheck.some(word => transitionCard.name.toLowerCase().includes(word))) ||
                (wordsToCheck.some(word => transitionCard.categoryName.toLowerCase().includes(word))) ||
                (transitionCard.keyWords && wordsToCheck.some(word => transitionCard.keyWords.toLowerCase().includes(word))) || searchText == "") {
                transitionCard.show();
                visibleCards ++;
            } else {
                transitionCard.hide();
            }
        });
        this.emptyPageWidget.visible = visibleCards == 0;
        this.onViewChanged.trigger();
    }
    filterByCategory(categoryName) {
        let visibleCards = 0;
        this.transitionCards.forEach((button) => {
            if ((button.categoryName == categoryName || categoryName == "All Effects") && button.visible) {
                button.show();
                visibleCards ++;
            } else {
                button.hide();
            }
        });
        this.emptyPageWidget.visible = visibleCards == 0;
        this.onViewChanged.trigger();
    }
    createTransitionCard(index) {
        const column = index % this.ITEMS_IN_ROW;
        const row = Math.floor(index / this.ITEMS_IN_ROW);
        const transitionCard = new TransitionCard(this.gridWidget, this.gridLayout, this.controller);
        transitionCard.setGridPosition(row, column);
        this.transitionCards.push(transitionCard);
        return transitionCard;
    }
    resize(width) {
        this.gridWatcher.resize(width);
    }
}
