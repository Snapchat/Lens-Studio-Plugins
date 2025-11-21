import * as Ui from "LensStudio:Ui";
export function createColor(r, g, b, a) {
    const color = new Ui.Color();
    color.red = r;
    color.green = g;
    color.blue = b;
    color.alpha = a;
    return color;
}
export function createIcon(parent, iconImage, size = Ui.Sizes.IconSide) {
    const imageView = new Ui.ImageView(parent);
    imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
    imageView.setFixedWidth(size);
    imageView.setFixedHeight(size);
    imageView.scaledContents = true;
    imageView.pixmap = iconImage;
    return imageView;
}
