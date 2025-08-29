import * as Ui from "LensStudio:Ui";
import {Alignment, ColorRole, Direction, FontRole} from "LensStudio:Ui";
export class CategoryTitle {
    constructor(parentWidget, parentLayout, categoryName) {
        const titleWidget = new Ui.Widget(parentWidget);
        this.titleLayout = new Ui.BoxLayout();
        this.titleLayout.setDirection(Direction.LeftToRight);
        this.titleLayout.setContentsMargins(1,0, 0, 0);
        this.titleLayout.spacing = 0;

        this.image = new Ui.ImageView(parentWidget);
        this.image.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/' + categoryName + '.svg')));;
        this.image.setFixedWidth(25)
        this.image.setContentsMargins(0, 0, 0, 0);
        this.image.visible = false;

        this.titleLayout.addWidget(this.image);

        this.label = new Ui.Label(titleWidget);
        this.label.text = categoryName;
        this.label.fontRole = FontRole.TitleBold;
        this.label.foregroundRole = ColorRole.BrightText;

        this.titleLayout.addWidget(this.label);
        titleWidget.layout = this.titleLayout;

        parentLayout.addWidget(titleWidget)
        parentLayout.setWidgetAlignment(titleWidget, Alignment.AlignTop);
    }
}
