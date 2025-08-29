import * as Ui from 'LensStudio:Ui';
import { createAnimationSelection } from "../../animation_library/AnimationSelection.js";
import app from "../../application/app.js";
import { logEventLinkOpen } from '../../application/analytics.js';

export class CreationMenu {

    constructor() {
        this.connections = [];
        this.searchLine = null;
        this.animationSelection = null;
        this.titleLabel = null;

        this.uploadDefaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/upload_default.svg'));
        this.uploadHoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/upload_hover.svg'));
        this.importImage = new Ui.Pixmap(import.meta.resolve('./Resources/import.svg'));
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(32);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

        this.headerTitle = new Ui.Label(this.header);
        this.headerTitle.text = "Bitmoji Animation";
        this.headerTitle.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addStretch(0);
        headerLayout.addWidget(this.headerTitle);
        headerLayout.addStretch(0);

        this.header.layout = headerLayout;
        return this.header;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(57);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);

        this.footer.layout = footerLayout;

        return this.footer;
    }

    createMenu(parent) {
        this.menu = new Ui.Widget(parent);

        this.menuLayout = new Ui.BoxLayout();
        this.menuLayout.setContentsMargins(0, 0, 0, 0);
        this.menuLayout.setDirection(Ui.Direction.TopToBottom);

        // Title
        const titleWidget = new Ui.Widget(this.menu);
        const titleLayout = new Ui.BoxLayout();
        titleLayout.setContentsMargins(0, 16, 0, 8);
        titleLayout.setDirection(Ui.Direction.LeftToRight);

        const titleLabel = new Ui.Label(titleWidget);
        titleLabel.text = 'Create Animation';
        titleLabel.fontRole = Ui.FontRole.LargeTitleBold;

        this.titleLabel = titleLabel;

        titleLayout.addStretch(0);
        titleLayout.addWidget(titleLabel);
        titleLayout.addStretch(0);

        titleWidget.layout = titleLayout;

        this.menuLayout.addWidget(titleWidget);

        // Guideline

        const guidelinesLink = 'https://docs.snap.com/lens-studio/platform-solutions/genai-suite/bitmoji-animations-generation';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for best practices.';
        const guideLines = this.createCalloutWidget(this.widget, guideLinesText, guidelinesLink);
        this.menuLayout.addWidget(guideLines);

        // Terms

        const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
        const termsUrlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);
        const termsText = 'By using the feature, you agree to our ' + termsUrlString;
        const terms = this.createCalloutWidget(this.widget, termsText, termsLink);
        this.menuLayout.addWidget(terms);

        // Button group

        const radioButtonWidget = new Ui.Widget(this.menu);
        const radioButtonLayout = new Ui.BoxLayout();
        radioButtonLayout.setContentsMargins(16, 8, 16, 0);
        radioButtonLayout.setDirection(Ui.Direction.TopToBottom);

        const buttonGroup = new Ui.RadioButtonGroup(radioButtonWidget);

        const button1 = new Ui.RadioButton(buttonGroup);
        button1.text = 'Upload Animation';

        const button2 = new Ui.RadioButton(buttonGroup);
        button2.text = 'Select from library';

        buttonGroup.addButton(button1, 0);
        buttonGroup.addButton(button2, 1);

        radioButtonLayout.addWidget(button1);
        radioButtonLayout.addWidget(button2);

        radioButtonWidget.layout = radioButtonLayout;

        buttonGroup.currentIndex = 1;

        this.menuLayout.addWidget(radioButtonWidget);

        // Separator
        const separatorWidget = new Ui.Widget(this.menu);
        const separatorLayout = new Ui.BoxLayout();
        separatorLayout.setDirection(Ui.Direction.TopToBottom);
        separatorLayout.setContentsMargins(16, 4, 16, 6);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Raised, this.menu);

        separatorLayout.addWidget(separator);
        separatorWidget.layout = separatorLayout;

        this.menuLayout.addWidget(separatorWidget);

        // Action

        this.stackedWidget = new Ui.StackedWidget(this.menu);

        this.stackedWidget.addWidget(this.createLibraryWidget());
        this.stackedWidget.addWidget(this.createUploadWidget());

        this.menuLayout.addWidget(this.stackedWidget);

        button1.onClick.connect(() => {
            this.stackedWidget.currentIndex = 1;
        });
        button2.onClick.connect(() => {
            this.stackedWidget.currentIndex = 0;
        });

        this.menu.layout = this.menuLayout;

        return this.menu;
    }

    createLibraryWidget() {
        const widget = new Ui.Widget(this.menu);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);

        // Search
        const searchLineWidget = new Ui.Widget(widget);
        const searchLineLayout = new Ui.BoxLayout();
        searchLineLayout.setDirection(Ui.Direction.TopToBottom);
        searchLineLayout.setContentsMargins(16, 0, 16, 0);

        this.searchLine = new Ui.SearchLineEdit(widget);

        searchLineLayout.addWidget(this.searchLine);
        searchLineWidget.layout = searchLineLayout;

        layout.addWidget(searchLineWidget);

        // Control

        this.animationSelection = createAnimationSelection(widget);
        layout.addWidget(this.animationSelection.widget);

        widget.layout = layout;

        return widget;
    }

    createUploadWidget() {
        const widget = new Ui.Widget(this.menu);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(16, 0, 16, 0);

        const uploadLabel = new Ui.Label(widget);
        uploadLabel.text = "Upload file";
        uploadLabel.setContentsMargins(0, 3, 0, 0);

        layout.addWidgetWithStretch(uploadLabel, 0, Ui.Alignment.AlignTop);

        const uploadImage = new Ui.ImageView(widget);
        const uploadImageLayout = new Ui.BoxLayout();
        uploadImageLayout.setDirection(Ui.Direction.LeftToRight);
        uploadImageLayout.setContentsMargins(4, 2, 4, 2);

        uploadImage.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        uploadImage.setFixedHeight(20);
        uploadImage.setFixedWidth(171);
        uploadImage.scaledContents = true;
        uploadImage.responseHover = true;

        uploadImage.pixmap = this.uploadDefaultImage;

        const uploadFileName = new Ui.Label(uploadImage);
        uploadFileName.text = "None";
        uploadFileName.fontRole = Ui.FontRole.DefaultItalic;
        uploadFileName.foregroundRole = Ui.ColorRole.PlaceholderText;

        uploadImageLayout.addWidget(uploadFileName);
        uploadImageLayout.addStretch(0);

        const importImage = new Ui.ImageView(uploadImage);
        importImage.pixmap = this.importImage;

        uploadImageLayout.addWidget(importImage);
        uploadImage.layout = uploadImageLayout;

        layout.addWidgetWithStretch(uploadImage, 0, Ui.Alignment.AlignTop);

        widget.layout = layout;

        this.connections.push(uploadImage.onHover.connect((hovered) => {
            if (hovered && !app.animationDialog.lbeIsBusy) {
                uploadImage.pixmap = this.uploadHoveredImage;
            }
            else {
                uploadImage.pixmap = this.uploadDefaultImage;
            }
        }));

        [uploadImage, importImage].forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                if (app.animationDialog.lbeIsBusy) {
                    return;
                }
                const gui = app.findInterface(Ui.IGui);
                const filePath = gui.dialogs.selectFileToOpen({ 'caption': 'Select file to open', 'filter': '*.fbx' }, '');
                if (!filePath.isEmpty) {
                    uploadFileName.text = this.getFileName(filePath.toString());
                    uploadFileName.fontRole = Ui.FontRole.Default;
                    uploadFileName.foregroundRole = Ui.ColorRole.Text;

                    const assetId = this.getLocalAssetId(filePath.toString());

                    app.animationDialog.setPreviewAssetId(null);
                    app.animationDialog.sendMessage(JSON.stringify({status : "start_loading"}));
                    app.animationDialog.animationImport.importLocalFile(filePath.toString(), assetId, () => {
                        this.resetUploadFileName(uploadFileName);
                    });
                    app.animationDialog.setSelectedStatus(true, assetId);
                }
                else {
                    this.resetUploadFileName(uploadFileName);
                }
            }));
        })

        return widget;
    }

    resetUploadFileName(uploadFileName) {
        uploadFileName.text = "None";
        uploadFileName.fontRole = Ui.FontRole.DefaultItalic;
        uploadFileName.foregroundRole = Ui.ColorRole.PlaceholderText;
    }

    getFileName(text) {
        let newFileName = "";
        for (let i = text.length - 1; i >= 0; i--) {
            if (text[i] === '/') {
                break;
            }

            newFileName += text[i];
        }

        return newFileName.split("").reverse().join("");
    }

    getLocalAssetId(text) {
        let newId = "";
        for (let i = 0; i < text.length; i++) {
            if (text[i] !== '/' && text[i] !== '.') {
                newId += text[i];
            }
        }

        return newId;
    }

    createInfoIcon(parent) {
        return this.createIcon(parent, new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/info.svg'))));
    }

    createIcon(parent, iconImage) {
        const imageView = new Ui.ImageView(parent);

        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        imageView.setFixedWidth(Ui.Sizes.IconSide);
        imageView.setFixedHeight(Ui.Sizes.IconSide);

        imageView.scaledContents = true;

        imageView.pixmap = iconImage;

        return imageView;
    }

    createCalloutWidget(parent, text, link) {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(16, 0, 16, 0);
        layout.setDirection(Ui.Direction.TopToBottom);

        const frame = new Ui.CalloutFrame(widget);
        const frameLayout = new Ui.BoxLayout();
        frameLayout.setContentsMargins(4, 4, 4, 4);
        frameLayout.setDirection(Ui.Direction.LeftToRight);
        frameLayout.spacing = Ui.Sizes.Spacing;

        const info = this.createInfoIcon(frame);
        frameLayout.addWidget(info);

        const label = new Ui.ClickableLabel(frame);
        label.text = text;
        label.wordWrap = true;
        label.openExternalLinks = true;
        label.onClick.connect(() => logEventLinkOpen(link));

        frameLayout.addWidgetWithStretch(label, 1, Ui.Alignment.Default);
        frame.layout = frameLayout;
        layout.addWidget(frame);
        widget.layout = layout;

        return widget;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setFixedWidth(320);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);
        const menu = this.createMenu(this.widget);

        this.addEvents();

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.layout.addWidget(header);
        const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        this.layout.addWidget(separator1);
        this.layout.addWidget(menu);

        const separator2 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator2.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator2);

        this.layout.addWidget(footer);

        this.widget.backgroundRole = Ui.ColorRole.Base;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }

    changeTitleText(newText) {
        this.titleLabel.text = newText;
    }

    addEvents() {
        this.connections.push(this.searchLine.onTextChange.connect(function(text) {
            this.animationSelection.newSearchRequest(text);

        }.bind(this)));
    }

    addAnimationToLibrary(name, animDescription, id, callback) {
        this.animationSelection.addAnimationToLibrary(name, animDescription, id, callback);
    }

    setSelectedLibraryItem(id, isBlended) {
        this.animationSelection.setSelectedLibraryItem(id, isBlended);
    }

    addMovie(id, path) {
        this.animationSelection.addMovie(id, path);
    }

    getEntryId(libraryId) {
        return this.animationSelection.getEntryId(libraryId);
    }
}
