import * as Ui from "LensStudio:Ui";
export class TextField {
    constructor(parent, text, placeholderText = "", onSurpriseMeButtonClickCallback = null, maxSymbols) {
        this.counterLabel = null;
        this.hasSurpriseMeButton = false;
        this.connections = [];
        this.onTextChangeCallbacks = [];
        this.onSurpriseMeButtonClickCallback = null;
        this.maxSymbols = maxSymbols;
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, Ui.Sizes.Padding, 0, 0);
        // Header
        const header = new Ui.Widget(widget);
        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(0, 0, 0, 0);
        const label = new Ui.Label(header);
        label.text = text;
        headerLayout.addWidget(label);
        headerLayout.addStretch(0);
        const surpriseMeLabel = new Ui.ClickableLabel(header);
        surpriseMeLabel.text = Ui.getUrlString('Surprise Me', '');
        this.surpriseMeLabel = surpriseMeLabel;
        this.onSurpriseMeButtonClickCallback = onSurpriseMeButtonClickCallback;
        if (onSurpriseMeButtonClickCallback) {
            this.hasSurpriseMeButton = true;
            this.surpriseMeLabel.visible = true;
            this.connections.push(this.surpriseMeLabel.onClick.connect(() => {
                this.onSurpriseMeButtonClickCallback?.();
            }));
        }
        else {
            this.hasSurpriseMeButton = false;
            this.surpriseMeLabel.visible = false;
        }
        headerLayout.addWidgetWithStretch(surpriseMeLabel, 0, Ui.Alignment.AlignRight);
        header.layout = headerLayout;
        layout.addWidget(header);
        // Text Edit
        const textEdit = new Ui.TextEdit(widget);
        textEdit.placeholderText = placeholderText;
        textEdit.setFixedHeight(120);
        textEdit.acceptRichText = false;
        this.connections.push(textEdit.onTextChange.connect(() => {
            this.onTextChange();
        }));
        layout.addWidget(textEdit);
        this.textEdit = textEdit;
        if (this.maxSymbols !== undefined && this.maxSymbols > 0) {
            const counterLayout = new Ui.BoxLayout();
            counterLayout.setDirection(Ui.Direction.LeftToRight);
            counterLayout.setContentsMargins(0, 0, 0, 0);
            counterLayout.addStretch(1);
            this.counterLabel = new Ui.Label(widget);
            this.counterLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
            this.updateCounter();
            counterLayout.addWidget(this.counterLabel);
            const counterWidget = new Ui.Widget(widget);
            counterWidget.layout = counterLayout;
            layout.addWidget(counterWidget);
        }
        widget.layout = layout;
        this.mainWidget = widget;
    }
    onTextChange() {
        const truncated = this.truncateToMax(this.textEdit.plainText);
        if (truncated !== this.textEdit.plainText) {
            this.textEdit.blockSignals(true);
            this.textEdit.plainText = truncated;
            this.moveCursorToEnd();
            this.textEdit.blockSignals(false);
        }
        this.updateCounter();
        this.onTextChangeCallbacks.forEach((callback) => {
            callback(truncated);
        });
    }
    addOnTextChangeCallback(callback) {
        this.onTextChangeCallbacks.push(callback);
    }
    setText(text) {
        this.textEdit.plainText = this.truncateToMax(text);
        this.updateCounter();
    }
    lock() {
        this.textEdit.readOnly = true;
        if (this.hasSurpriseMeButton) {
            this.surpriseMeLabel.visible = false;
        }
    }
    unlock() {
        this.textEdit.readOnly = false;
        if (this.hasSurpriseMeButton) {
            this.surpriseMeLabel.visible = true;
        }
    }
    trimEndChars(count) {
        this.textEdit.blockSignals(true);
        this.textEdit.plainText = this.textEdit.plainText.slice(0, -count);
        this.moveCursorToEnd();
        this.textEdit.blockSignals(false);
    }
    updateCounter() {
        if (this.counterLabel && this.maxSymbols !== undefined) {
            this.counterLabel.text = `${[...this.textEdit.plainText].length}/${this.maxSymbols}`;
        }
    }
    truncateToMax(text) {
        if (this.maxSymbols !== undefined) {
            const symbols = [...text];
            if (symbols.length > this.maxSymbols) {
                return symbols.slice(0, this.maxSymbols).join("");
            }
        }
        return text;
    }
    moveCursorToEnd() {
        const cursor = this.textEdit.textCursor;
        cursor.movePosition(Ui.TextCursor.MoveOperation.End, Ui.TextCursor.MoveMode.MoveAnchor);
        this.textEdit.textCursor = cursor;
    }
    get text() {
        return this.textEdit.plainText;
    }
    get widget() {
        return this.mainWidget;
    }
}
