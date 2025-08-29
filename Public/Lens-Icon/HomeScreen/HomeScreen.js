import * as Ui from 'LensStudio:Ui';
import { Storage } from '../utils/storage.js';
import { logEventAssetImport } from '../App/analytics.js';
import { GenAIIconName } from '../App/common.js';

export class HomeScreen {
    constructor(pluginSystem, authorization, requestGenerationCb, requestIconCropperCb) {
        this.pluginSystem = pluginSystem;
        this.requestGenerationCb = requestGenerationCb;
        this.requestIconCropperCb = requestIconCropperCb;

        this.isIconPresented = false;

        this.gui = this.pluginSystem.findInterface(Ui.IGui);
        this.authProvider = authorization;

        this.storage = new Storage();
    };

    isConfigEmpty(config) {
        if (!config) {
            return true;
        }

        if (!config.iconPath) {
            return true;
        }

        return false;
    }

    init(config) {
        if (!this.isConfigEmpty(config)) {
            this.initFromConfig(config);
        } else {
            this.initDefault();
        }
    }

    initDefault() {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const project = model.project;

        const metainfo = project.metaInfo;
        if (metainfo.isIconSet) {
            this.setIcon(metainfo.iconPath, false);
        } else {
            this.resetIcon();
        }

        this.promptInput.text = "";

        this.loginPrompt.visible = !this.authProvider.isAuthorized;
        this.generateButton.visible = this.authProvider.isAuthorized;

        this.generateButton.primary = false;
        this.importButton.primary = true;
    }

    initFromConfig(config) {
        this.initDefault();
        this.setIcon(config.iconPath);
    }

    createGenAiWidget(parent) {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        widget.setFixedHeight(154);
        widget.setFixedWidth(480);
        widget.setContentsMargins(0, 0, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const bg = new Ui.ImageView(widget);
        bg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        bg.setFixedHeight(154);
        bg.setFixedWidth(480);
        bg.setContentsMargins(0, 20, 0, 0);

        bg.pixmap = new Ui.Pixmap(import.meta.resolve("./Resources/frame_bg.svg"));
        bg.scaledContents = true;
        bg.radius = 4 / widget.devicePixelRatio;

        const logo = new Ui.ImageView(widget);
        logo.setContentsMargins(0, 0, 0, 0);
        logo.setFixedWidth(40);
        logo.setFixedHeight(40);

        logo.scaledContents = true;

        logo.pixmap = new Ui.Pixmap(import.meta.resolve("./Resources/ai_logo.svg"));
        logo.move(220, 0);

        layout.addStretch(0);

        const title = new Ui.ImageView(bg);
        title.setFixedWidth(163);
        title.setFixedHeight(14);

        title.scaledContents = true;
        title.pixmap = new Ui.Pixmap(import.meta.resolve("./Resources/lets_generate_a_lens_icon.svg"));

        layout.addWidget(title);
        layout.setWidgetAlignment(title, Ui.Alignment.AlignCenter);

        this.promptInput = new Ui.LineEdit(bg);
        this.promptInput.placeholderText = 'An icon of...';

        this.promptInput.setFixedWidth(300);

        layout.addWidget(this.promptInput);
        layout.setWidgetAlignment(this.promptInput, Ui.Alignment.AlignCenter);

        this.generateButton = new Ui.PushButton(bg);
        this.generateButton.text = "Generate";

        this.generateButton.enabled = false;

        this.promptInput.onTextChange.connect((text) => {
            const enabled = text.length > 0 && this.authProvider.isAuthorized
            this.generateButton.enabled = enabled;

            this.generateButton.primary = enabled;
            this.importButton.primary = !this.generateButton.primary;

        });

        this.generateButton.onClick.connect(() => {
            this.requestGenerationCb(this.promptInput.text);
        });

        const generateImagePath = import.meta.resolve('./Resources/ai_icon.svg');
        this.generateButton.setIconWithMode(Editor.Icon.fromFile(generateImagePath), Ui.IconMode.MonoChrome);

        layout.addWidget(this.generateButton);
        layout.setWidgetAlignment(this.generateButton, Ui.Alignment.AlignCenter);

        this.loginPrompt = new Ui.ClickableLabel(widget);
        this.loginPrompt.setContentsMargins(0, 0, 0, 0);
        this.loginPrompt.text = "<center>To generate a Lens icon, please " + Ui.getUrlString("log-in", "") + " into MyLenses</center>";

        this.loginPrompt.onClick.connect(() => {
            if (this.authConnection) {
                this.authConnection.disconnect();
                this.authConnection = null;
            }

            this.authConnection = this.authProvider.onAuthorizationChange.connect((authorized) => {
                const enabled = this.promptInput.text.length > 0
                if (authorized) {
                    this.generateButton.enabled = enabled;
                }

                this.loginPrompt.visible = !authorized;
                this.generateButton.visible = authorized;

                this.generateButton.primary = enabled;
                this.importButton.primary = !this.generateButton.primary;

                this.authConnection.disconnect();
                this.authConnection = null;
            });

            this.authProvider.authorize();
        });

        this.loginPrompt.setMinimumHeight(Ui.Sizes.ButtonHeight);

        layout.addWidget(this.loginPrompt);
        layout.setWidgetAlignment(this.loginPrompt, Ui.Alignment.AlignCenter);

        layout.addStretch(0);

        layout.spacing = Ui.Sizes.Spacing * 3;

        bg.layout = layout;

        return widget;
    }

    setIcon(iconPath, updateMetainfo = true) {
        const pixmap = new Ui.Pixmap(iconPath);
        pixmap.aspectRatioMode = Ui.AspectRatioMode.KeepAspectRatio;
        pixmap.transformationMode = Ui.TransformationMode.SmoothTransformation;
        const sideLength = 156 * this.iconPlaceholder.devicePixelRatio;

        if (pixmap.width < pixmap.height) {
            pixmap.width = sideLength;
        } else {
            pixmap.height = sideLength;
        }

        pixmap.crop(new Ui.Rect(0, 0, sideLength, sideLength));

        this.iconPlaceholder.pixmap = pixmap;
        this.isIconPresented = true;

        this.logoCarousel.visible = false;
        this.iconPlaceholder.visible = true;

        if (updateMetainfo) {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            const project = model.project;

            const metainfo = project.metaInfo;
            metainfo.setIcon(iconPath);

            // could be either be string or Editor.Path, so we always convert to Editor.Path first
            const fileName = (new Editor.Path(iconPath.toString())).fileName

            if (fileName == GenAIIconName) {
                logEventAssetImport("SUCCESS", "GEN_AI");
            } else {
                logEventAssetImport("SUCCESS", "FROM_FILE");
            }

            project.metaInfo = metainfo;
        }
    }

    resetIcon() {
        this.isIconPresented = false;

        this.logoCarousel.visible = true;
        this.iconPlaceholder.visible = false;
    }

    createIconPreview(parent) {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);

        widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.logoCarousel = new Ui.ImageView(widget);
        this.logoCarousel.setFixedWidth(472);
        this.logoCarousel.setFixedHeight(120);

        this.logoCarousel.scaledContents = true;
        this.logoCarousel.pixmap = new Ui.Pixmap(import.meta.resolve("./Resources/icon_carousel.png"));
        this.logoCarousel.visible = false;

        this.iconPlaceholder = new Ui.ImageView(widget);
        this.iconPlaceholder.setFixedWidth(156);
        this.iconPlaceholder.setFixedHeight(156);
        this.iconPlaceholder.scaledContents = true;
        this.iconPlaceholder.radius = 78 * widget.devicePixelRatio;

        this.iconPlaceholder.visible = false;

        layout.addWidget(this.logoCarousel);
        layout.addWidget(this.iconPlaceholder);
        widget.layout = layout;

        return widget;
    }

    requestImport(filePath = null) {
        if (!filePath) {
            filePath = this.gui.dialogs.selectFileToOpen({ 'caption': 'Select file to open', 'filter': '*.webp *.jpeg *.jpg *.png' }, '');
        }

        if (!filePath.isEmpty) {
            try {
                let pixmap = new Ui.Pixmap(filePath);

                pixmap.transformationMode = Ui.TransformationMode.SmoothTransformation;
                pixmap.aspectRatioMode = Ui.AspectRatioMode.KeepAspectRatio;

                if (pixmap.width > pixmap.height) {
                    if (pixmap.width > 1024) {
                        // downscale
                        pixmap.width = 1024;
                    } else if (pixmap.width < 320) {
                        // upscale
                        pixmap.width = 320;
                    }
                } else {
                    if (pixmap.height > 1024) {
                        // downscale
                        pixmap.height = 1024;
                    } else if (pixmap.height < 320) {
                        // upscale
                        pixmap.height = 320;
                    }
                }


                pixmap.save(this.storage.directory.path.appended("icon.png"));

                this.requestIconCropperCb(Base64.encode(this.storage.readBytes(this.storage.directory.path.appended("icon.png"))));
            } catch(error) {
                console.error("Can't open the file: " + filePath);
            }
        }
    }

    createWidget(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.widget.setContentsMargins(0, Ui.Sizes.DoublePadding, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        layout.spacing = Ui.Sizes.Spacing * 4;

        const title = new Ui.Label(this.widget);
        title.text = "Lens Icon";

        title.fontRole = Ui.FontRole.MediumTitleBold;
        title.foregroundRole = Ui.ColorRole.BrightText;

        const title2 = new Ui.Label(this.widget);
        title2.text = "<center>The icon should be clear, engaging, and</center><center>representative of your Lens.</center>";
        title2.fontRole = Ui.FontRole.MediumTitle;

        const title3 = new Ui.Label(this.widget);
        title3.text = '<span style="color: rgba(195, 210, 223, 0.6);"><center>The Lens icon helps your Lens get distributed on Snapchat and</center><center>is one of the first things Snapchatters see.</center></span>';
        title3.fontRole = Ui.FontRole.Default;

        layout.addWidget(title);
        layout.setWidgetAlignment(title, Ui.Alignment.AlignCenter);

        layout.addWidget(title2);
        layout.setWidgetAlignment(title2, Ui.Alignment.AlignCenter);

        layout.addWidget(title3);
        layout.setWidgetAlignment(title3, Ui.Alignment.AlignCenter);

        this.importButton = new Ui.PushButton(this.widget);
        this.importButton.text = "Import";
        this.importButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        const importImagePath = import.meta.resolve('./Resources/import.svg');
        this.importButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);

        this.importButton.onClick.connect(() => {
            this.requestImport();
        });

        layout.addWidget(this.importButton);
        layout.setWidgetAlignment(this.importButton, Ui.Alignment.AlignCenter);

        const iconPreviewWidget = this.createIconPreview(this.widget);

        layout.addStretch(0);

        layout.addWidget(iconPreviewWidget);
        layout.setWidgetAlignment(iconPreviewWidget, Ui.Alignment.AlignCenter);

        layout.addStretch(0);

        const genAiWidget = this.createGenAiWidget(this.widget)
        layout.addWidget(genAiWidget);
        layout.setWidgetAlignment(genAiWidget, Ui.Alignment.AlignCenter);

        this.widget.layout = layout;

        return this.widget;
    }
}
