import * as Ui from 'LensStudio:Ui';
import { Control } from './Control.js';
import * as Hint from '../Hint.js';
export class TextInput extends Control {
    constructor(parent, label, defaultValue, placeholderText, maxSymbols, hintWidget, showSurpriseMeButton, valueImporter, valueExporter) {
        super(parent, null, defaultValue, valueImporter, valueExporter);
        this.hintWidget = hintWidget;
        this.maxSymbols = maxSymbols;
        this.mControl = new Ui.TextEdit(this.widget);
        this.mControl.foregroundRole = Ui.ColorRole.PlaceholderText;
        this.mControl.placeholderText = placeholderText;
        this.mControl.setFixedHeight(Ui.Sizes.TextEditHeight);
        this.mControl.acceptRichText = false;
        this.mConnections.push(this.mControl.onTextChange.connect(() => {
            this.mOnValueChanged.forEach((callback) => callback(this.value));
        }));
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = Ui.Sizes.Padding;
        const labelHeaderWidget = this.createLabelHeaderWidget(label, showSurpriseMeButton);
        layout.addWidget(labelHeaderWidget);
        layout.addWidget(this.mControl);
        if (this.maxSymbols) {
            this.limitationLabel = new Ui.Label(this.widget);
            this.limitationLabel.text = "0 / " + this.maxSymbols;
            layout.addWidgetWithStretch(this.limitationLabel, 0, Ui.Alignment.AlignRight);
            this.mOnValueChanged.push((value) => {
                if (value.length >= this.maxSymbols) {
                    this.mControl.blockSignals(true);
                    this.value = value.substring(0, this.maxSymbols);
                    this.moveCursorToEnd();
                    this.mControl.blockSignals(false);
                }
                if (this.limitationLabel) {
                    this.limitationLabel.text = this.value.length + " / " + this.maxSymbols;
                }
            });
        }
        this.widget.layout = layout;
    }
    createLabelHeaderWidget(label, showSurpriseMeButton) {
        const labelHeaderWidget = new Ui.Widget(this.widget);
        const labelHeaderLayout = new Ui.BoxLayout();
        labelHeaderLayout.setDirection(Ui.Direction.LeftToRight);
        labelHeaderLayout.setContentsMargins(0, 0, 0, 0);
        labelHeaderLayout.spacing = Ui.Sizes.Padding;
        const labelWidget = new Ui.Label(labelHeaderWidget);
        labelWidget.text = label;
        labelHeaderLayout.addWidget(labelWidget);
        if (this.hintWidget) {
            const tooltip = Hint.createHintIcon(labelHeaderWidget, this.hintWidget, undefined, 10);
            this.mConnections.push(tooltip.connection);
            labelHeaderLayout.addWidget(tooltip.icon);
        }
        labelHeaderLayout.addStretch(0);
        if (showSurpriseMeButton) {
            this.surpriseMeClickableLabel = new Ui.ClickableLabel(labelHeaderWidget);
            this.surpriseMeClickableLabel.text = Ui.getUrlString('Surprise Me', '');
            labelHeaderLayout.addWidgetWithStretch(this.surpriseMeClickableLabel, 0, Ui.Alignment.AlignRight);
        }
        labelHeaderWidget.layout = labelHeaderLayout;
        return labelHeaderWidget;
    }
    moveCursorToEnd() {
        const cursor = this.mControl.textCursor;
        // @ts-ignore - TextCursor types are not properly exported in LensStudio:Ui
        cursor.movePosition(Ui.TextCursor.MoveOperation.End, Ui.TextCursor.MoveMode.MoveAnchor);
        this.mControl.textCursor = cursor;
    }
    setSurpriseMeCallback(callback) {
        if (!this.surpriseMeClickableLabel) {
            throw new Error('setSurpriseMeCallback: Surprise me clickable label not found');
        }
        this.surpriseMeCallback = callback;
        if (this.surpriseMeClickableLabel) {
            this.mConnections.push(this.surpriseMeClickableLabel.onClick.connect(() => {
                if (this.surpriseMeCallback) {
                    this.surpriseMeCallback();
                }
            }));
        }
    }
    reset() {
        super.reset();
    }
    set value(value) {
        this.mControl.plainText = value;
    }
    get value() {
        return this.mControl.plainText;
    }
}
