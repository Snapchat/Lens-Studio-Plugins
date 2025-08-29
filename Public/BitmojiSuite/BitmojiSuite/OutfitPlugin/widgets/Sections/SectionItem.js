import * as Ui from 'LensStudio:Ui';
import { EventDispatcher } from '../../../EventDispatcher.js';
import { WidgetFactory } from '../../../WidgetFactory.js';
import { hoveredBackgroundColor, hoveredForegroundColor, normalBackgroundColor, normalForegroundColor, selectedBackgroundColor, selectedForegroundColor } from '../../components/colors.js';

export class SectionItem extends EventDispatcher {
    constructor(parent) {
        super(parent);

        this.signalsBlocked = false;
        this.selected = false;

        this.widget = WidgetFactory.beginCalloutFrame(parent).sizePolicy(Ui.SizePolicy.Policy.Fixed).width(84).height(84).lineWidth(1).backgroundColor(normalBackgroundColor).foregroundColor(normalForegroundColor).end();

        this.iconView = WidgetFactory.beginImageView(this.widget).sizePolicy(Ui.SizePolicy.Policy.Fixed).scaledContents(true).width(36).height(36).end();
        this.iconView.onClick.connect(() => this.onClick());

        this.title = WidgetFactory.beginLabel(this.widget).end();

        this.touchZone = WidgetFactory.beginImageView(this.widget).sizePolicy(Ui.SizePolicy.Policy.Fixed).width(84).height(84).responseHover(true).end();
        this.touchZone.onClick.connect(() => this.onClick());
        this.touchZone.onHover.connect((hovered) => this.onHover(hovered));

        this.widget.layout = WidgetFactory.beginVerticalLayout().addStretch(0).addWidget(this.iconView, Ui.Alignment.AlignCenter).addWidget(this.title, Ui.Alignment.AlignCenter).addStretch(0).end();
    }

    setIcon(icon, iconHover) {
        this.icon = icon;
        this.iconHover = iconHover;

        this.iconView.pixmap = icon;
    }

    setTitle(title) {
        this.title.text = title;
    }

    onClick() {
        this.setSelected(!this.selected);
    }

    blockSignals(block) {
        this.signalsBlocked = block;
    }

    setNormalStyle() {
        this.widget.setBackgroundColor(normalBackgroundColor);
        this.widget.setForegroundColor(normalForegroundColor);
    }

    setSelectedStyle() {
        this.widget.setBackgroundColor(selectedBackgroundColor);
        this.widget.setForegroundColor(selectedForegroundColor);
    }

    setHoverStyle() {
        this.widget.setBackgroundColor(hoveredBackgroundColor);
        this.widget.setForegroundColor(hoveredForegroundColor);
    }

    onHover(hovered) {
        if (hovered) {
            if (!this.selected) {
                this.setHoverStyle();
            }

            this.title.foregroundRole = Ui.ColorRole.BrightText;
            this.iconView.pixmap = this.iconHover;
        } else {
            this.selected ? this.setSelectedStyle() : this.setNormalStyle();

            this.title.foregroundRole = Ui.ColorRole.Text;
            this.iconView.pixmap = this.icon;
        }
    }

    setSelected(selected) {
        this.selected = selected;

        this.selected ? this.setSelectedStyle() : this.setNormalStyle();

        if (!this.signalsBlocked) {
            this.dispatchEvent({ type: SectionItem.SelectionChanged, selected});
        }
    }
}

SectionItem.SelectionChanged = "SelectionChanged";
