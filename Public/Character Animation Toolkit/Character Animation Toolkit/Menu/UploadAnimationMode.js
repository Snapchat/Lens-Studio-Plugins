import * as Ui from "LensStudio:Ui";
import { MenuTemplate } from "./MenuTemplate.js";
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import { uploadFile } from "../api.js";
export class UploadAnimationMode {
    constructor(animationLibrary) {
        this.connections = [];
        this.menuTemplate = new MenuTemplate();
        this.animationLibrary = animationLibrary;
        this.defaultBackground = new Ui.Pixmap(import.meta.resolve('./Resources/videoUploadBackground.svg'));
        this.hoveredBackground = new Ui.Pixmap(import.meta.resolve('./Resources/videoUploadBackground_h.svg'));
    }
    create(parent, onReturnCallback, goToGalleryPage) {
        const widget = this.menuTemplate.createWidget(parent);
        const layout = this.menuTemplate.createLayout();
        const header = this.menuTemplate.createHeader(widget, 'File Upload', () => {
            onReturnCallback();
        });
        const contentLayout = this.menuTemplate.createContentLayout();
        contentLayout.spacing = Ui.Sizes.DoublePadding;
        const label = new Ui.Label(parent);
        label.wordWrap = true;
        label.text = "Choose a file to upload. Ensure the file meets the requirements:<br><br>" +
            "• Format: <b>.fbx only</b><br>" +
            "• Max File Size: <b>20 MB</b><br><br>";
        contentLayout.addWidget(label);
        contentLayout.addStretch(0);
        // File Upload
        const fileUpload = new Ui.ImageView(parent);
        fileUpload.responseHover = true;
        fileUpload.pixmap = this.defaultBackground;
        fileUpload.setFixedWidth(288);
        fileUpload.setFixedHeight(288);
        const iconView = new Ui.ImageView(fileUpload);
        iconView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        iconView.move(125, 120);
        iconView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/uploadIcon.svg'));
        const iconSize = 36;
        iconView.setFixedHeight(iconSize);
        iconView.setFixedWidth(iconSize);
        const buttonLabel = new Ui.ClickableLabel(fileUpload);
        buttonLabel.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        buttonLabel.setFixedWidth(72);
        buttonLabel.wordWrap = true;
        buttonLabel.text = '<center>' + 'Upload .fbx' + '</center>';
        buttonLabel.move(109, 159);
        contentLayout.addWidgetWithStretch(fileUpload, 0, (Ui.Alignment.AlignCenter));
        contentLayout.addStretch(1);
        layout.addWidget(header);
        layout.addLayout(contentLayout);
        this.connections.push(fileUpload.onHover.connect((hovered) => {
            if (hovered) {
                fileUpload.pixmap = this.hoveredBackground;
            }
            else {
                fileUpload.pixmap = this.defaultBackground;
            }
        }));
        const buttonItems = [fileUpload, iconView, buttonLabel];
        buttonItems.forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
                //@ts-ignore
                const filePath = pluginSystem.findInterface(Ui.IGui).dialogs.selectFileToOpen({ 'caption': 'Select file to open', 'filter': '*.fbx' }, '');
                if (!filePath.isEmpty) {
                    const startIntervalFunction = this.animationLibrary.addAnimationToMyGallery("UPLOAD");
                    goToGalleryPage(3);
                    uploadFile(filePath, (response) => {
                        if (response.statusCode === 200 || response.statusCode === 201) {
                            startIntervalFunction(JSON.parse(response.body).id);
                        }
                        else {
                            startIntervalFunction(null);
                        }
                    });
                }
            }));
        });
        widget.layout = layout;
        return widget;
    }
}
