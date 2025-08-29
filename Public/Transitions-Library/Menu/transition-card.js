import {Alignment, ColorRole, SizePolicy} from "LensStudio:Ui";
import * as Ui from "LensStudio:Ui";

export class TransitionCard {
    constructor(parentWidget, gridLayout, controller) {
        this.parentWidget = parentWidget;
        this.gridLayout = gridLayout;
        this.CARD_WIDTH = 110;
        this.CARD_HEIGHT = 182;

        this.iconName = null;
        this.moviePreviewName = null;
        this.keyWords = null;
        this.lsoID = null;
        this._name = null;
        this.controller = controller;

        this.previewDownloaded = false;

        this.transitionCardWidget = null;
        this.transitionCardLayout = null;
        this.imagePreview = null;
        this.playIcon = null;
        this.videoPreview = null;
        this.touchZone = null;
        this.cardLabel = null;
        this.previewLayout = null;
        this.installButton = null;
        this.onHoverFrame = null;
        this.importFrame = null;
        this.gradientImagePreview = null;
        this.gradientVideoPreview = null;
        this.loader = null;

        this.onHover = false;
        this.isImportingState = false;
        this.iconDownloaded = false;

        this.isActive = true;

        this.createTransitionFrame();
        this.createPreview();
        this.createTouchZone();
        this.createButtonLabel();
        this.createInstallButton();
        this.setUpLayouts();
    }

    get widget() {
        return this.transitionCardWidget;
    }
    get visible() {
        return this.isActive;
    }
    set visible(value) {
        this.isActive = value;
    }

    set name(transitionName) {
        this.cardLabel.text = transitionName;
        this._name = transitionName;
    }

    get name() {
        return this._name;
    }
    show() {
        this.transitionCardWidget.visible = true;
        this.transitionCardWidget.blockSignals(false);
        this.isActive = true;
    }

    hide() {
        this.transitionCardWidget.visible = false;
        this.transitionCardWidget.blockSignals(true);
        this.isActive = false;
    }
    setImportState() {
        this.isImportingState = true;
        this.playIcon.visible = false;
        this.installButton.visible = false;
        this.gradientImagePreview.visible = false;
        this.imagePreview.visible = true;
        this.importFrame.visible = true;
        this.cardLabel.visible = false;
        this.loader.visible = true;
        this.onHoverFrame.visible = false;
    }

    setIdleState() {
        this.isImportingState = false;
        this.importFrame.visible = false;
        this.loader.visible = false;
        this.cardLabel.visible = true;
        this.playIcon.visible = true;
        this.onHoverFrame.visible = false;

        if (this.onHover) {
            this.imagePreview.visible = false;
            this.installButton.visible = true;
            this.onHoverFrame.visible = true;
        } else {
            this.gradientImagePreview.visible = true;
        }
    }
    createTransitionFrame() {
        this.transitionCardWidget = new Ui.Widget(this.parentWidget);
        this.transitionCardWidget.setSizePolicy(SizePolicy.Policy.Fixed, SizePolicy.Policy.Fixed);
        this.transitionCardWidget.setMaximumHeight(this.CARD_HEIGHT);
        this.transitionCardWidget.setMaximumWidth(this.CARD_WIDTH);
        this.transitionCardWidget.setMinimumHeight(this.CARD_HEIGHT);
        this.transitionCardWidget.setMinimumWidth(this.CARD_WIDTH);
        this.transitionCardLayout = new Ui.StackedLayout();
        this.transitionCardLayout.spacing = 0;
        this.transitionCardLayout.setContentsMargins(0, 0, 0, 0);
        this.transitionCardLayout.stackingMode = Ui.StackingMode.StackAll;
    }

    createPreview() {
        //icon
        this.imagePreview = new Ui.ImageView(this.transitionCardWidget);
        const playIconLayout = new Ui.BoxLayout();
        //playIcon
        this.playIcon = new Ui.ImageView(this.imagePreview);
        const playIconPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/Play.svg')));
        playIconPixmap.resize(55, 55);
        this.playIcon.pixmap = playIconPixmap;
        this.playIcon.visible = false;
        playIconLayout.addWidget(this.playIcon);
        playIconLayout.setWidgetAlignment(this.playIcon, Alignment.AlignCenter);
        this.imagePreview.layout = playIconLayout;

        //video
        this.videoPreview = new Ui.MovieView(this.transitionCardWidget);
        this.videoPreview.setContentsMargins(0, 0, 0, 0);

        //onHoverFrame
        this.onHoverFrame = new Ui.ImageView(this.transitionCardWidget);
        const frameCardPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/Frame.svg')));
        this.onHoverFrame.pixmap = frameCardPixmap;
        this.onHoverFrame.setContentsMargins(0,0, 0, 0);
        this.onHoverFrame.visible = false;
        this.onHoverFrame.scaledContents = true;

        //gradientImage
        this.gradientImagePreview = new Ui.ImageView(this.transitionCardWidget);
        const gradientPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/Gradient.svg')));
        this.gradientImagePreview.pixmap = gradientPixmap;
        this.gradientImagePreview.visible = false;
        this.gradientImagePreview.scaledContents = true;

        //gradientVideo
        this.gradientVideoPreview = new Ui.ImageView(this.transitionCardWidget);
        const gradientVideoPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/Gradient.svg')));
        gradientVideoPixmap.resize(this.CARD_WIDTH, this.CARD_HEIGHT);
        this.gradientVideoPreview.pixmap = gradientVideoPixmap;
        this.gradientVideoPreview.setContentsMargins(0, 0, 0, 0);
        this.gradientVideoPreview.visible = false;
        this.gradientVideoPreview.scaledContents = true;

        //loader
        this.loader = new Ui.MovieView(this.transitionCardWidget);
        const loaderMovie = new Ui.Movie(new Editor.Path(import.meta.resolve('../Resources/Loader.gif')));
        loaderMovie.resize(25, 25);
        this.loader.movie = loaderMovie;
        this.loader.animated = true;
        this.loader.movie.speed = 100;
        this.loader.setContentsMargins(45, 0, 0, 0);

        // Import card
        this.importFrame =  new Ui.ImageView(this.transitionCardWidget);
        this.importFrame.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/Import frame.svg')));
        this.importFrame.setContentsMargins(0, 0, 0, 0);
        this.importFrame.visible = false;
        this.importFrame.scaledContents = true;
    }

    createTouchZone() {
        this.touchZone = new Ui.ImageView(this.transitionCardWidget);
        this.touchZone.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.touchZone.scaledContents = true;
        this.touchZone.responseHover = true;

        this.touchZone.onHover.connect((onHover) => {
            this.onHover = onHover;
            if (this.isImportingState) {
                this.installButton.visible = false;
                this.videoPreview.animated = false;
                this.imagePreview.visible = true;
                return;
            }
            this.installButton.visible = onHover;
            if (!this.previewDownloaded) {
                this.controller.downloadPreview(this.moviePreviewName).then((movie) => {
                    this.previewDownloaded = true;
                    this.setVideoPreview(movie);

                    if (!this.onHover) {
                        this.videoPreview.animated = false;
                        this.onHoverFrame.visible = false;
                        this.imagePreview.visible = true;
                        this.gradientImagePreview.visible = true;
                    }
                }).catch((error) => console.error(`Error downloading preview for ${this.name}: ${error}`));
            }
            if (onHover) {
                this.imagePreview.visible = !this.previewDownloaded;
                if (this.previewDownloaded) {
                    this.videoPreview.animated = true;
                    this.onHoverFrame.visible = true;
                }
            } else {
                this.imagePreview.visible = true;
                if (this.previewDownloaded) {
                    this.videoPreview.animated = false;
                    this.onHoverFrame.visible = false;
                }
            }
            if (this.iconDownloaded) {
                this.gradientImagePreview.visible = this.imagePreview.visible;
            }
        })
    }
    createButtonLabel() {
        this.cardLabel = new Ui.Label(this.touchZone);
        this.cardLabel.fontRole = Ui.FontRole.SmallTitle;
        this.cardLabel.foregroundRole = ColorRole.BrightText;
        this.cardLabel.text = "Name";
        this.cardLabel.wordWrap = true;
        this.cardLabel.setContentsMargins(0, 37, 0, 0);
    }
    setUpLayouts() {
        this.previewLayout.addStretch(0);
        this.previewLayout.addWidget(this.cardLabel);
        this.previewLayout.addWidget(this.installButton);

        this.previewLayout.setWidgetAlignment(this.cardLabel, Alignment.AlignLeft | Alignment.AlignBottom);
        this.previewLayout.setWidgetAlignment(this.installButton, Alignment.AlignLeft | Alignment.AlignBottom);

        this.touchZone.layout = this.previewLayout;

        this.transitionCardLayout.addWidget(this.touchZone);
        this.transitionCardLayout.addWidget(this.loader);
        this.transitionCardLayout.addWidget(this.importFrame);
        this.transitionCardLayout.addWidget(this.onHoverFrame);
        this.transitionCardLayout.addWidget(this.gradientImagePreview);
        this.transitionCardLayout.addWidget(this.imagePreview);
        this.transitionCardLayout.addWidget(this.gradientVideoPreview);
        this.transitionCardLayout.addWidget(this.videoPreview);
        this.transitionCardLayout.setWidgetAlignment(this.loader, Alignment.AlignCenter);
        this.transitionCardLayout.setWidgetAlignment(this.videoPreview, Alignment.AlignCenter);
        this.transitionCardLayout.setWidgetAlignment(this.onHoverFrame, Alignment.AlignCenter);
        this.transitionCardLayout.setWidgetAlignment(this.gradientImagePreview, Alignment.AlignCenter);
        this.transitionCardLayout.setWidgetAlignment(this.gradientVideoPreview, Alignment.AlignCenter);
        this.transitionCardWidget.layout = this.transitionCardLayout;
    }

    createInstallButton() {
        this.previewLayout = new Ui.BoxLayout();
        this.previewLayout.setDirection(Ui.Direction.TopToBottom);

        this.installButton = new Ui.PushButton(this.touchZone);
        this.installButton.setFixedHeight(20);
        this.installButton.setFixedWidth(72);
        this.installButton.text = "Import";
        this.installButton.primary = true;
        this.installButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('../Resources/Import.svg'))), Ui.IconMode.MonoChrome);

        this.installButton.onClick.connect(() => {
            this.setImportState();
            this.controller.onInstall(this)
                .finally(() => this.setIdleState());
        });
        this.installButton.visible = false;
    }
    setImagePreview(pixmap) {
        this.imagePreview.pixmap = pixmap;
        this.loader.visible = false;
        this.gradientImagePreview.visible = true;
        this.gradientVideoPreview.visible = true;
        this.playIcon.visible = true;
        this.imagePreview.scaledContents = true;
    }
    setVideoPreview(movie) {
          movie.resize(this.CARD_WIDTH, this.CARD_HEIGHT);
          this.videoPreview.movie = movie;
          this.videoPreview.animated = true;
          this.videoPreview.movie.speed = 100.0;
          this.videoPreview.visible = true;
          this.imagePreview.visible = false;
          this.onHoverFrame.visible = true;
          this.gradientImagePreview.visible = false;
    }
    setGridPosition(row, column) {
         this.gridLayout.addWidgetAt(this.transitionCardWidget, row, column, Alignment.AlignTop);
    }
}
