import * as Ui from "LensStudio:Ui";
import {Event} from "../Utils/event.js";
export class SearchWidget {
    constructor(parentWidget, parentLayout) {
        this.contentGrid = null;
        this.onSearchLineChanged = new Event();
        this.searchLayout = new Ui.BoxLayout();
        this.searchLayout.setDirection(Ui.Direction.TopToBottom);
        this.currentCategory = "All Effects";

        this.searchBox = new Ui.SearchLineEdit(parentWidget);
        this.searchBox.setContentsMargins(8, 0, 8, 0);
        this.searchBox.placeholderText = "Search transitions...";
        this.onSearchLineChanged.add((searchText) => this.updateContent(searchText));
        this.searchBox.layout = this.searchLayout;
        parentLayout.addWidget(this.searchBox);
    }
    get text() {
        return this.searchBox.text;
    }
    updateContent(searchText) {
       this.contentGrid.filterBySearchText(searchText, this.currentCategory);
    }
    createCategorySwitchEvent(event, categoryButtons, categoryPixmap) {
        this.searchBox.onTextChange.connect((text) => {
            event.trigger({category: "All Effects", index: 0})
            categoryButtons.forEach((imageView, index) => {
                imageView.pixmap = categoryPixmap[index].idle;
            });
            categoryButtons[0].pixmap = categoryPixmap[0].click;
        });
        this.searchBox.onTextChange.connect((text) => this.onSearchLineChanged.trigger(text));
    }
}
