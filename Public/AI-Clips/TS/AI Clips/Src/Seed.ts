import * as Ui from "LensStudio:Ui";

export class Seed {

    private connections: Array<any> = [];
    private mainWidget: Ui.Widget;
    private spinBox: Ui.SpinBox;
    private randomButton: Ui.PushButton;
    private lockedBox: Ui.ImageView;
    private lockedLabel: Ui.Label;

    constructor(parent: Ui.Widget) {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, Ui.Sizes.Padding, 0, 0);

        const label = new Ui.Label(widget);
        label.text = 'Seed';
        layout.addWidget(label);
        layout.spacing = 4;

        const infoIcon = this.createInfoIcon(widget);
        layout.addWidget(infoIcon);

        const spinBox = new Ui.SpinBox(widget);
        spinBox.setRange(0, 2147483647);
        spinBox.step = 1;
        spinBox.setFixedWidth(120);
        spinBox.setFixedHeight(24);

        layout.addWidget(spinBox);

        const randomButton = new Ui.PushButton(widget);

        randomButton.setFixedWidth(24);
        randomButton.setFixedHeight(24);

        const randomButtonLayout = new Ui.BoxLayout();
        randomButtonLayout.setContentsMargins(0, 0, 0, 0);

        randomButton.layout = randomButtonLayout;

        const diceImageView = new Ui.ImageView(randomButton);
        diceImageView.scaledContents = true;
        diceImageView.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/dice.svg')));
        diceImageView.setFixedHeight(16);
        diceImageView.setFixedWidth(16);
        randomButtonLayout.addWidgetWithStretch(diceImageView, 0, Ui.Alignment.AlignCenter);

        [randomButton, diceImageView].forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                spinBox.value = this.getRandomInt();
            }));
        })

        layout.addWidget(randomButton);

        this.lockedBox = new Ui.ImageView(widget);
        this.lockedBox.setFixedWidth(120);
        this.lockedBox.setFixedHeight(24);
        this.lockedBox.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/number_box.svg')));

        const lockedBoxLayout = new Ui.BoxLayout();
        lockedBoxLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
        this.lockedBox.layout = lockedBoxLayout;

        this.lockedLabel = new Ui.Label(this.lockedBox);
        this.lockedLabel.wordWrap = true;
        this.lockedLabel.setFixedWidth(112);

        lockedBoxLayout.addWidgetWithStretch(this.lockedLabel, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);

        layout.addWidget(this.lockedBox);

        this.lockedBox.visible = false;

        layout.addStretch(1);

        widget.layout = layout;

        this.mainWidget = widget;
        this.spinBox = spinBox;
        this.randomButton = randomButton;

        spinBox.value = this.getRandomInt();
    }

    private getRandomInt(): number {
        const max = 2147483648;
        return Math.floor(Math.random() * max);
    }

    private createInfoIcon(parent: Ui.Widget) {
        const infoImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/small_info.svg')));

        const info = new Ui.ImageView(parent);
        info.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        info.setFixedHeight(Ui.Sizes.IconSide);
        info.setFixedWidth(Ui.Sizes.IconSide);
        info.scaledContents = true;

        info.pixmap = infoImage;
        info.responseHover = true;

        const popupWidget = new Ui.PopupWithArrow(info, Ui.ArrowPosition.Top);
        popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

        popupWidget.setMainWidget(this.createHint(popupWidget, "Seed", "Control randomness with a seed. Use the same number to recreate the same look, or try different ones for new variations!"));

        const connection = info.onHover.connect((hovered) => {
            if (hovered) {
                popupWidget.popup(info);
            } else {
                popupWidget.close();
                parent.activateWindow();
            }
        });

        return info;
    }

    private createHint(parent: Ui.Widget, title: string, text: string) {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const content = new Ui.Widget(parent);

        const header = new Ui.Label(content);
        header.text = title;
        header.fontRole = Ui.FontRole.TitleBold;

        const desc = new Ui.Label(content);
        desc.text = text;
        desc.wordWrap = true;

        layout.addWidget(header);
        layout.addWidget(desc);

        content.layout = layout;
        return content;
    }

    setValue(value: number): void {
        if (!value) {
            value = this.getRandomInt();
        }
        this.spinBox.value = value;
    }

    getValue(): number {
        return this.spinBox.value;
    }

    lock() {
        this.lockedLabel.text = this.spinBox.value + "";
        this.randomButton.visible = false;
        this.spinBox.visible = false;
        this.lockedBox.visible = true;
    }

    unlock() {
        this.spinBox.visible = true;
        this.randomButton.visible = true;
        this.lockedBox.visible = false;
    }

    get widget(): Ui.Widget {
        return this.mainWidget;
    }
}
