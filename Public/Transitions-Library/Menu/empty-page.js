import {Alignment, Direction, Size, SizePolicy} from "LensStudio:Ui";
import * as Ui from "LensStudio:Ui";
export class EmptyPage {
    constructor(parentWidget, parentLayout) {
        this.widget = new Ui.Widget(parentWidget);
        this.widget.setContentsMargins(0, 90, 0, 0);
        this.widget.visible = false;
        this.widget.spacing = 20;
        const layout = new Ui.BoxLayout();
        layout.setDirection(Direction.TopToBottom);

        this.widget.layout = layout;

        const emptyPageTitle = new Ui.Label(this.widget);
        emptyPageTitle.fontRole = Ui.FontRole.LargeTitle;
        emptyPageTitle.text = "Your search did not return any results.";

        const emptyPageImage = new Ui.ImageView(this.widget);
        const emptyPagePixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/' + 'EmptyPage.svg')));
        emptyPagePixmap.resize(250, 250);
        emptyPageImage.pixmap = emptyPagePixmap;
        layout.addStretch(1);
        layout.addWidget(emptyPageImage);
        layout.addWidget(emptyPageTitle);
        layout.addStretch(2);
        layout.setWidgetAlignment(emptyPageTitle, Alignment.AlignCenter);
        layout.setWidgetAlignment(emptyPageImage, Alignment.AlignCenter);
        parentLayout.addWidget(this.widget);
    }

    resize(h) {
        this.widget.setContentsMargins(0, h/5, 0, 0);
    }
}
