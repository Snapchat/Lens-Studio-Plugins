import * as Ui from 'LensStudio:Ui';

import { tieWidgets } from '../../utils.js';
import { Control } from './Control.js';

export class TextEdit extends Control {
    constructor(parent, label, valueImporter, valueExporter, placeholderText, maxSymbols) {
        super(parent, label, valueImporter, valueExporter);

        this.maxSymbols = maxSymbols;

        this.mControl = new Ui.TextEdit(this.widget);

        this.mControl.foregroundRole = Ui.ColorRole.PlaceholderText;
        this.mControl.placeholderText = placeholderText;
        this.mControl.setFixedHeight(Ui.Sizes.TextEditHeight);
        this.mControl.acceptRichText = false;

        this.reset();

        this.mConnections.push(this.mControl.onTextChange.connect(() => {
            this.mOnValueChanged.forEach((callback) => callback(this.value));
        }));

        if (this.maxSymbols) {
            const layout = new Ui.BoxLayout();
            layout.setDirection(Ui.Direction.TopToBottom);
            layout.setContentsMargins(0, 0, 0, 0);

            const limitationLabel = new Ui.Label(this.widget);
            limitationLabel.text = "0 / " + this.maxSymbols;

            layout.addWidget(this.mControl);
            layout.addWidgetWithStretch(limitationLabel, 0, Ui.Alignment.AlignRight);

            this.mOnValueChanged.push((value) => {
                if (value.length >= this.maxSymbols) {
                    this.mControl.blockSignals(true);
                    this.value = value.substring(0, this.maxSymbols);
                    this.moveCursorToEnd();
                    this.mControl.blockSignals(false);
                }

                limitationLabel.text = this.value.length + " / " + this.maxSymbols;
            });

            this.widget.layout = layout;
        } else {
            tieWidgets(this.mLabel, this.mControl, this.mWidget);
        }
    }

    moveCursorToEnd() {
        const cursor = this.mControl.textCursor;
        cursor.movePosition(Ui.TextCursor.MoveOperation.End, Ui.TextCursor.MoveMode.MoveAnchor);
        this.mControl.textCursor = cursor;
    }

    reset() {
        super.reset();

        this.mControl.plainText = '';
    }

    set value(value) {
        if (!value) {
            value = "";
        }

        this.mControl.plainText = value;
    }

    get value() {
        return this.mControl.plainText;
    }
}
