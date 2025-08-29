import {
    Alignment, ColorRole,
    Direction,
    Orientation,
    Shadow,
    SizePolicy
} from "LensStudio:Ui";
import * as Ui from "LensStudio:Ui";
import * as Fs from "LensStudio:FileSystem";
import { Event } from "../Utils/event.js";
import { ContentGrid } from "./category-content-ui.js";
import { SearchWidget } from "./search-widget.js";
import { InfoWidget } from "./info-widget.js";
import { EmptyPage } from "./empty-page.js";
import { CategoryTitle } from "./category-title.js";


export class MainPage {
    constructor(parentWidget, parentLayout, controller) {
        this.controller = controller;
        this.parentLayout = parentLayout;
        this.parentWidget = parentWidget;

        this.mainPageLayout = null;
        this.mainPageWidget = null;

        this.contentGrid = null;
        this.categoryCards = [];
        this.categoryPixmaps = [];
        this.categoryTitle = null;
        this.infoWidget = null;
        this.verticalScrollArea = null;
        this.categories = null;
        this.loader = null;

        this.createUI();
    }

    initializeEvents() {
        this.onCategoryClicked = new Event();
        this.onCategoryClicked.add((categoryData) => {
            if (categoryData.index == 0) {
                this.categoryTitle.image.visible = false;
                this.infoWidget.show();
                this.categoryTitle.titleLayout.setContentsMargins(1, 0, 0, 0);
            } else {
                this.categoryTitle.image.visible = true;
                this.categoryTitle.image.pixmap = this.categoryPixmaps[categoryData.index].idle;
                this.infoWidget.hide();
                this.categoryTitle.titleLayout.setContentsMargins(0, 8, 0, 0);
            }
            this.categoryTitle.label.text = categoryData.category;

            this.searchWidget.currentCategory = categoryData.category;
            this.contentGrid.filterBySearchText(this.searchWidget.text);
            this.contentGrid.filterByCategory(categoryData.category);
        });

        this.searchWidget.createCategorySwitchEvent(this.onCategoryClicked, this.categoryCards, this.categoryPixmaps);

        this.contentWidget.onResize.connect((width, height) => {
            this.contentGrid.resize(width, height);
        });
    }

    async createUI() {
        this.createLoader();
        this.categories = await this.controller.categories();
        this.loader.visible = false;

        this.searchWidget = new SearchWidget(this.parentWidget, this.parentLayout);

        const spacer = new Ui.Widget(this.parentWidget);
        spacer.setFixedHeight(4);
        this.parentLayout.addWidget(spacer);

        const separatorHorizontal = new Ui.Separator(Orientation.Horizontal, Shadow.Plain, this.parentWidget);
        // noinspection JSSuspiciousNameCombination
        separatorHorizontal.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.parentLayout.spacing = 0;
        this.parentLayout.addWidget(separatorHorizontal);

        this.mainPageWidget = new Ui.Widget(this.parentWidget);
        this.mainPageLayout = new Ui.BoxLayout();
        this.mainPageLayout.setDirection(Ui.Direction.LeftToRight);
        this.mainPageWidget.layout = this.mainPageLayout;
        this.parentLayout.addWidget(this.mainPageWidget);
        this.mainPageLayout.setContentsMargins(0, 0, 0, 0);

        this.createMenuUI();

        const separatorVertical = new Ui.Separator(Orientation.Vertical, Shadow.Plain, this.mainPageWidget);
        separatorVertical.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        separatorVertical.setMinimumWidth(1);

        this.mainPageLayout.spacing = 0;
        this.mainPageLayout.addWidget(separatorVertical);
        this.createContentUI();
    }

    createLoader() {
        this.loader = new Ui.StatusIndicator("", this.parentWidget);
        this.loader.start();
        this.parentLayout.addWidget(this.loader);
        this.parentLayout.setWidgetAlignment(this.loader, Alignment.AlignCenter)
    }

    createMenuUI() {
        this.menuWidget = new Ui.Widget(this.mainPageWidget);
        this.menuWidget.setFixedWidth(44);
        this.menuWidget.setMinimumWidth(44);
        this.menuLayout = new Ui.BoxLayout();
        this.menuLayout.setDirection(Ui.Direction.TopToBottom);
        this.menuLayout.spacing = 8;
        this.menuWidget.layout = this.menuLayout;

        this.menuLayout.setContentsMargins(4, 8, 4, 0);

        this.mainPageLayout.addWidget(this.menuWidget);
        this.mainPageLayout.setWidgetAlignment(this.menuWidget, Alignment.AlignTop | Alignment.AlignCenter);
        this.initializeCategorySection(this.menuWidget, this.menuLayout);
    }

    createContentUI() {
        this.contentWidget = new Ui.Widget(this.mainPageWidget);

        this.contentLayout = new Ui.BoxLayout();
        this.contentLayout.setDirection(Ui.Direction.TopToBottom);
        this.contentLayout.setContentsMargins(0, 0, 0, 0);
        this.contentLayout.addStretch(0);
        this.contentWidget.setMinimumWidth(1);
        this.contentWidget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        this.contentLayout.spacing = 8;

        this.infoWidget = new InfoWidget(this.contentWidget, this.contentLayout);
        this.contentWidget.layout = this.contentLayout;
        this.mainPageLayout.addWidget(this.contentWidget);

        const scrollWidget = new Ui.Widget(this.contentWidget);
        scrollWidget.layout = this.contentLayout;
        scrollWidget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        scrollWidget.setContentsMargins(0, 0, 0, 0);

        this.verticalScrollArea = new Ui.VerticalScrollArea(this.contentWidget);
        this.verticalScrollArea.setWidget(scrollWidget);
        this.verticalScrollArea.setContentsMargins(0, 0, 0, 0);

        const scrollLayout = new Ui.BoxLayout();
        scrollLayout.setDirection(Ui.Direction.TopToBottom);
        scrollLayout.addWidget(this.verticalScrollArea);
        scrollLayout.setContentsMargins(0, 0, 0, 0);

        this.contentWidget.layout = scrollLayout;
        this.createContentWidget(this.verticalScrollArea, this.contentLayout);
        this.contentLayout.addStretch(2);
        this.initializeEvents();
    }

    initializeCategorySection(parentWidget, parentLayout) {
        [{ name: "All Effects" }, ...this.categories]
            .map(category => ({ category, icons: findLocalCategoryIcons(category) }))
            .filter(({ icons }) => !!icons) // display only known categories
            .forEach(({ category, icons }, index) => {
                this.createCategoryButton(parentWidget, parentLayout, category.name, icons, index);
            });

    }

    createContentWidget(parentWidget, parentLayout) {
        const gridWidget = new Ui.Widget(parentWidget);
        const gridLayout = new Ui.BoxLayout();
        gridWidget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        gridLayout.setContentsMargins(9, 2, 0, 0);
        gridLayout.setDirection(Direction.TopToBottom);
        gridWidget.layout = gridLayout;

        this.categoryTitle = new CategoryTitle(gridWidget, gridLayout, "All Effects");

        const emptyPage = new EmptyPage(gridWidget, gridLayout);
        this.contentWidget.onResize.connect((w, h) => {
            emptyPage.resize(h);
        });

        this.contentGrid = new ContentGrid(gridWidget, gridLayout, this.controller, emptyPage.widget);
        this.contentGrid.initializeGrid(this.categories);
        this.contentGrid.transitionCards.forEach((card) => {
            if (!card.iconDownloaded) {
                this.controller.downloadIcon(card.iconName).then((pixmap) => {
                    card.iconDownloaded = true;
                    card.setImagePreview(pixmap);
                }).catch((error) => console.error(`Error downloading icon for ${card.name}: ${error}`));
            }
        });
        this.contentGrid.onViewChanged.trigger();
        this.searchWidget.contentGrid = this.contentGrid;

        parentLayout.addWidget(gridWidget);
        parentLayout.setWidgetAlignment(gridWidget, Alignment.AlignTop);
    }

    createCategoryButton(parentWidget, parentLayout, categoryName, icons, index) {
        const imageWidget = new Ui.Widget(parentWidget);
        imageWidget.toolTip = categoryName;
        imageWidget.setFixedHeight(28);
        imageWidget.setFixedWidth(36);
        imageWidget.setContentsMargins(0, 0, 0, 0);

        const imageLayout = new Ui.BoxLayout();
        imageLayout.setDirection(Direction.TopToBottom);
        imageLayout.setContentsMargins(0, 0, 0, 0);

        const idlePixmap = new Ui.Pixmap(icons.idle);

        const imageView = new Ui.ImageView(imageWidget);
        imageView.pixmap = idlePixmap;
        const clickPixmap = new Ui.Pixmap(icons.click);

        imageView.onClick.connect(() => {
            this.onCategoryClicked.trigger({
                category: categoryName,
                index: index,
            });
            for (let i = 0; i < this.categoryCards.length; i++) {
                this.categoryCards[i].pixmap = this.categoryPixmaps[i].idle;
            }
            imageView.pixmap = clickPixmap;
            this.verticalScrollArea.value = 0;
        });
        imageView.responseHover = true;

        imageView.onHover.connect((onHover) => {
            if (this.searchWidget.currentCategory == categoryName) {
                return;
            }
            if (onHover) {
                imageView.pixmap = clickPixmap;
            } else {
                imageView.pixmap = idlePixmap;
            }
        });
        if (index == 0) {
            imageView.pixmap = clickPixmap;
        }
        imageView.setContentsMargins(0, 0, 0, 0);
        imageLayout.addWidget(imageView);
        imageWidget.layout = imageLayout;
        imageWidget.setContentsMargins(0, 0, 0, 0);
        imageLayout.setWidgetAlignment(imageView, Alignment.AlignCenter);

        parentLayout.addWidget(imageWidget);
        parentLayout.setWidgetAlignment(imageWidget, Alignment.AlignCenter);

        this.categoryCards.push(imageView);
        this.categoryPixmaps.push({ idle: idlePixmap, click: clickPixmap });
    }
}

/**@returns {{idle: Editor.Path, click: Editor.Path} | null}*/
function findLocalCategoryIcons(category) {
    const idle = new Editor.Path(import.meta.resolve("../Resources/" + category.name + ".svg"));
    const click = new Editor.Path(import.meta.resolve("../Resources/" + category.name + " Click.svg"));
    return Fs.isFile(idle) && Fs.isFile(click) ? { idle, click } : null;
}
