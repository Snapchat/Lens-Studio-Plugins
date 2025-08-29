import { PanelPlugin } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';

import { launchWebSocketServer } from './serverManager.js';

export class WebPlugin extends PanelPlugin {
	static descriptor() {
		return {
			id: 'Com.Snap.WebPlugin',
			name: 'WebPlugin',
			description: 'Demonstrates browser communication via Web API',
		};
	}

	constructor(pluginSystem) {
		super(pluginSystem);
	}

	createWidget(parent) {
		//make the widget fundementals
		const widget = new Ui.Widget(parent);
		const layout = new Ui.BoxLayout();
		layout.setDirection(Ui.Direction.TopToBottom);
		const stackedWidget = new Ui.StackedWidget(widget);

		//tab 1 - base page
		const newBaseWidget = new Ui.Widget(widget);
		const newBaseLayout = new Ui.BoxLayout();
		newBaseLayout.setDirection(Ui.Direction.TopToBottom);

		//webView
		const webView = new Ui.WebEngineView(parent);
		webView.visible = false;

		//loading label for web
		const webLoadingIndicator = new Ui.StatusIndicator(
			'Starting WebView',
			newBaseWidget,
		);
		webLoadingIndicator.visible = false;
		webLoadingIndicator.setSizePolicy(
			Ui.SizePolicy.Policy.Ignored,
			Ui.SizePolicy.Policy.Ignored,
		);
		webLoadingIndicator.start();

		//add a label for webViewerrors
		const webViewError = new Ui.Label(widget);
		webViewError.text = 'Error: Something went wrong 1';
		webViewError.foregroundRole = Ui.ColorRole.BrightText;
		webViewError.visible = false;

		//button for startWebView
		const startWebViewButton = new Ui.PushButton(widget);
		startWebViewButton.text = 'Start Server';
		startWebViewButton.foregroundRole = Ui.ColorRole.Button;
		startWebViewButton.onClick.connect(
			function () {
                this.serverManager = launchWebSocketServer();

				webViewError.visible = false;
				webLoadingIndicator.visible = true;
				startWebViewButton.visible = false;

				startWebView();
			},
		);

		//add them to the layout
		newBaseLayout.addWidget(webView);
		newBaseLayout.addWidget(webViewError);
		newBaseLayout.addWidget(webLoadingIndicator);
		newBaseLayout.addWidget(startWebViewButton);
		newBaseWidget.layout = newBaseLayout;
		stackedWidget.addWidget(newBaseWidget);

		//return the widget
		layout.setContentsMargins(
			Ui.Sizes.DialogContentMargin,
			Ui.Sizes.DialogContentMargin,
			Ui.Sizes.DialogContentMargin,
			Ui.Sizes.DialogContentMargin,
		);
		layout.addWidget(stackedWidget);
		widget.layout = layout;
		return widget;

        function startWebView() {
            webView.load('file://' + import.meta.resolve('web/websocket_image_chunked.html'));
            webView.visible = true;
            webLoadingIndicator.visible = false;
            startWebViewButton.visible = false;
        }
    }
}
