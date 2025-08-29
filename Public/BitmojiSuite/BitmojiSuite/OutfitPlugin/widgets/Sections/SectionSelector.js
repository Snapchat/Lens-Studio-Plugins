import { EventDispatcher } from '../../../EventDispatcher.js';
import { WidgetFactory } from '../../../WidgetFactory.js';
import { SectionItem } from './SectionItem.js';
import * as Ui from 'LensStudio:Ui';

export class SectionSelector extends EventDispatcher {
    constructor(parent) {
        super(parent);

        this.sectionItems = [];
        this.currentIndex = -1;

        this.widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed).backgroundRole(Ui.ColorRole.Mid).end();
        this.layout = WidgetFactory.beginHorizontalLayout().spacing(Ui.Sizes.Padding).end();

        this.widget.setFixedHeight(84 + Ui.Sizes.Padding * 3);

        const scrollWidget = WidgetFactory.beginWidget(this.widget).end();
        scrollWidget.layout = this.layout;

        const scrollArea = new Ui.VerticalScrollArea(this.widget);
        scrollArea.setWidget(scrollWidget);

        this.widget.layout = WidgetFactory.beginVerticalLayout().contentsMargings(0).addWidget(scrollArea).end();
    }

    addSection(item) {
        const index = this.sectionItems.length;
        item.addEventListener(SectionItem.SelectionChanged, ({selected}) => this.onSectionSelectionChanged(index, selected));

        this.sectionItems.push(item);
        // bind layout and section items?
        this.layout.addWidget(item.widget);

        if (index == this.currentIndex) {
            item.setSelected(true);
        }
    }

    onSectionSelectionChanged(index, selected) {
        if (selected) {
            this.currentIndex = index;

            for (let i = 0; i < this.sectionItems.length; i++) {
                if (i != this.currentIndex) {
                    this.sectionItems[i].blockSignals(true);
                    this.sectionItems[i].setSelected(false);
                    this.sectionItems[i].blockSignals(false);
                }
            }

            this.dispatchEvent({type: SectionSelector.SectionChanged, index });
        } else {
            if (this.currentIndex == index) {
                this.currentIndex = -1;
                this.dispatchEvent({type: SectionSelector.SectionChanged, index: -1 });
            }
        }
    }

    currentSection() {
        if (this.currentIndex == -1) {
            return null;
        } else {
            return this.sectionItems[this.currentIndex];
        }
    }
}

SectionSelector.SectionChanged = "SectionChanged";
