import OverlayPlugin from 'LensStudio:OverlayPlugin';
import UriHandlerPlugin from 'LensStudio:UriHandlerPlugin';
import * as Ui from 'LensStudio:Ui';
import * as fs from 'LensStudio:FileSystem';

const overlayId = 'Com.Snap.Gui.SpectaclesOverlay';
const configFilePath = import.meta.resolve('config.json');

function setWidgetSize(widget, width, height) {
    widget.setFixedWidth(width);
    widget.setFixedHeight(height);
}

let queryParameters = '';

export class SpectaclesOverlay extends OverlayPlugin {
    static descriptor() {
        return {
            id: overlayId,
            name: 'Spectacles Overlay',
            description: 'Spectacles Purchase Overlay',
        };
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);

        if (fs.exists(configFilePath)) {
            this.config = JSON.parse(fs.readFile(configFilePath));
        } else {
            this.config = {
                disabled: false,
            };
        }

        if (!this.config.disabled)
        {
            this.timeout = setTimeout(() => {
                this.requestShow();
            }, 2000);
        }
    }

    createStatusIndicator(parent) {
        const indicatorContainer = new Ui.Widget(parent);
        this.statusIndicator = new Ui.ProgressIndicator(indicatorContainer);
        setWidgetSize(this.statusIndicator, 40, 40);

        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.setDirection(Ui.Direction.TopToBottom);

        layout.addStretch(1);
        layout.addWidgetWithStretch(this.statusIndicator, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(1);

        indicatorContainer.layout = layout;

        return indicatorContainer;
    }

    createHeader(parent) {
        const container = new Ui.Widget(parent);
        container.setFixedHeight(28);

        const headerLabel = new Ui.Label(container);
        headerLabel.text = 'Spectacles Application';
        headerLabel.fontRole = Ui.FontRole.Title;

        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.setDirection(Ui.Direction.LeftToRight);

        layout.addStretch(1);
        layout.addWidgetWithStretch(headerLabel, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(1);

        container.layout = layout;

        return container;
    }

    createFooterLayout(parent) {
        const dontShowAgainCheckBox = new Ui.CheckBox(parent);
        dontShowAgainCheckBox.text = 'Don\'t show it again';
        dontShowAgainCheckBox.onToggle.connect((value) => {
            this.config.disabled = value;
            fs.writeFile(configFilePath, JSON.stringify(this.config));
        });

        const closeButton = new Ui.PushButton(parent);
        closeButton.text = 'Close';
        closeButton.onClick.connect(() => {
            this.requestHide();
        });

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setContentsMargins(16, 8, 16, 8);
        footerLayout.spacing = 0;

        footerLayout.addWidget(dontShowAgainCheckBox);
        footerLayout.addStretch(1);
        footerLayout.addWidget(closeButton);

        return footerLayout;
    }

    createWidget(parent) {
        const overlaySize = {
            width: 800,
            height: 600
        };
        const container = new Ui.Widget(parent);
        this.views = new Ui.StackedWidget(container);

        this.webView = new Ui.WebEngineView(this.views);
        setWidgetSize(this.webView, 0, 0);
        this.webView.contextMenuPolicy = Ui.ContextMenuPolicy.NoContextMenu;

        const indicatorContainer = this.createStatusIndicator(this.views);
        this.views.addWidget(indicatorContainer);
        this.views.addWidget(this.webView);

        setWidgetSize(container, overlaySize.width, overlaySize.height);
        container.backgroundRole = Ui.ColorRole.Midlight;
        container.autoFillBackground = true;

        const mainLayout = new Ui.BoxLayout();
        mainLayout.setDirection(Ui.Direction.TopToBottom);
        mainLayout.setContentsMargins(0, 0, 0, 0);
        mainLayout.spacing = 0;

        this.webView.onLoadStarted.connect(() => {
            this.views.currentIndex = 0;
            this.statusIndicator.start();
        });
        this.webView.onLoadFinished.connect(() => {
            this.views.currentIndex = 1;
            setWidgetSize(this.webView, overlaySize.width, overlaySize.height - 40);
        });

        let formUrl = 'https://www.spectacles.com/lens-studio-application/8c1d86a1-d6f0-47d7-a2f1-48f83e90a299';
        if (queryParameters.length > 0)
        {
            formUrl = formUrl + '?' + queryParameters;
        }
        this.webView.load(formUrl);

        const footerLayout = this.createFooterLayout(container);

        mainLayout.addWidget(this.createHeader(container));
        mainLayout.addWidget(this.views);
        mainLayout.addLayout(footerLayout);
        container.layout = mainLayout;

        return container;
    }
}

export class SpectaclesUriHandler extends UriHandlerPlugin {
    static descriptor() {
        return {
            id: 'Com.Snap.SpectaclesUriHandler',
            name: 'Uri Handler',
            description: 'Spectacles Uri Handler',
            canHandle: function (uri) {
                const args = uri.split('?');
                const url = args[0];
                const regex = /^.+:\/{0,2}spectacles-overlay\/?$/;
                return regex.test(url);
            },
        };
    }

    handle(uri) {
        const overlayManager = this.pluginSystem.findInterface(Editor.IOverlayManager);
        const args = uri.split('?');
        if (args.length > 1)
        {
            queryParameters = args[1];
        }
        overlayManager.requestShow(overlayId);
        return true;
    }
}
