import { EventDispatcher } from '../../../EventDispatcher.js';
import { WidgetFactory } from '../../../WidgetFactory.js';
import { ColorSelectorItem } from './ColorSelectorItem.js';
import * as Ui from 'LensStudio:Ui';

export class ColorSelector extends EventDispatcher {
    constructor(parent) {
        super(parent);

        this.colorItems = [];
        this.currentIndex = -1;
        this.signalsBlocked = false;

        this.widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Expanding).end();
        this.layout = WidgetFactory.beginVerticalLayout().spacing(Ui.Sizes.Padding).end();

        this.widget.setFixedWidth(32 + Ui.Sizes.Padding * 3);

        const scrollWidget = WidgetFactory.beginWidget(this.widget).end();
        scrollWidget.layout = this.layout;

        const scrollArea = new Ui.VerticalScrollArea(this.widget);
        scrollArea.setWidget(scrollWidget);

        this.widget.layout = WidgetFactory.beginVerticalLayout().contentsMargings(0).addWidget(scrollArea).end();
    }

    blockSignals(block) {
        this.colorItems.forEach((item) => {
            item.blockSignals(block);
        });
        this.signalsBlocked = block;
    }

    setBusy(isBusy) {
        this.colorItems.forEach((item) => {
            item.setBusy(isBusy);
        });
    }

    addColor(item) {
        const index = this.colorItems.length;
        item.addEventListener(ColorSelectorItem.SelectionChanged, ({selected}) => this.onColorSelectionChanged(index, selected));

        this.colorItems.push(item);
        // bind layout and section items?
        this.layout.addWidget(item.widget);

        if (index == this.currentIndex) {
            item.setSelected(true);
        }
    }

    reset() {
        this.setColors(null);
        this.currentIndex = -1
    }

    selectIndex(index) {
        this.colorItems[index].blockSignals(true);
        this.colorItems[index].setSelected(true);
        this.colorItems[index].blockSignals(false);
        this.onColorSelectionChanged(index, true);
    }

    setColors(colors) {
        this.colorItems = [];
        this.layout.clear(Ui.ClearLayoutBehavior.DeleteClearedWidgets);

        if (colors) {
            colors.forEach((colorArray, index) => {
                const item = new ColorSelectorItem(this.widget, colorArray, index);
                this.addColor(item);
            });

            this.layout.addStretch(0);
        }
    }

    onColorSelectionChanged(index, selected) {
        if (selected && index != this.currentIndex) {
            this.currentIndex = index;

            for (let i = 0; i < this.colorItems.length; i++) {
                if (i != this.currentIndex) {
                    this.colorItems[i].blockSignals(true);
                    this.colorItems[i].setSelected(false);
                    this.colorItems[i].blockSignals(false);
                }
            }

            if (!this.signalsBlocked) {
                this.dispatchEvent({type: ColorSelector.ColorChanged, index });
            }
        } else if (!selected && this.currentIndex == index) {
            this.currentIndex = -1;
            if (!this.signalsBlocked) {
                this.dispatchEvent({type: ColorSelector.ColorChanged, index: -1 });
            }
        }
    }

    currentColor() {
        if (this.currentIndex == -1) {
            return null;
        } else {
            return this.colorItems[this.currentIndex];
        }
    }
}

ColorSelector.ColorChanged = "ColorChanged";
