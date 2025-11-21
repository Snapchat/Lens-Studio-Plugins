import * as Ui from 'LensStudio:Ui';
import * as Utils from './Utils';
export function createHintIcon(parent, hintWidget, iconPath, iconSize = Ui.Sizes.IconSide) {
    // Use default solid_warning.svg if no icon path provided
    const defaultIconPath = import.meta.resolve('./Resources/solid_warning.svg');
    const resolvedIconPath = iconPath || defaultIconPath;
    const iconImage = new Ui.Pixmap(resolvedIconPath);
    const infoToolTip = Utils.createIcon(parent, iconImage, iconSize);
    infoToolTip.responseHover = true;
    const popupWidget = new Ui.PopupWithArrow(infoToolTip, Ui.ArrowPosition.Top);
    popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
    popupWidget.setMainWidget(hintWidget);
    const connection = infoToolTip.onHover.connect((hovered) => {
        if (hovered) {
            popupWidget.popup(infoToolTip);
        }
        else {
            popupWidget.close();
            parent.activateWindow();
        }
    });
    return { icon: infoToolTip, connection };
}
export function createStandardHintWidget(parent, title, description, imagePath) {
    const hintWidget = new Ui.Widget(parent);
    const hintLayout = new Ui.BoxLayout();
    hintLayout.setDirection(Ui.Direction.TopToBottom);
    hintLayout.setContentsMargins(8, 8, 8, 8);
    hintLayout.spacing = Ui.Sizes.Padding;
    // Optional Image at the top
    if (imagePath) {
        const imagePixmap = new Ui.Pixmap(imagePath);
        const imageView = new Ui.ImageView(hintWidget);
        imageView.pixmap = imagePixmap;
        imageView.scaledContents = true;
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setMaximumWidth(500);
        imageView.setMaximumHeight(250);
        hintLayout.addWidget(imageView);
    }
    // Title
    const titleLabel = new Ui.Label(hintWidget);
    titleLabel.text = title;
    titleLabel.fontRole = Ui.FontRole.MediumTitleBold;
    titleLabel.wordWrap = true;
    titleLabel.setMaximumWidth(500);
    hintLayout.addWidget(titleLabel);
    // Description
    const descriptionLabel = new Ui.Label(hintWidget);
    descriptionLabel.text = description;
    descriptionLabel.fontRole = Ui.FontRole.Default;
    descriptionLabel.wordWrap = true;
    descriptionLabel.setMaximumWidth(500);
    hintLayout.addWidget(descriptionLabel);
    hintWidget.layout = hintLayout;
    return hintWidget;
}
