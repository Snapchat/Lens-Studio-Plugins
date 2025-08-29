//@ts-nocheck
import PanelPlugin from "LensStudio:PanelPlugin";
import * as Ui from "LensStudio:Ui";

// A panel with all the possible widgets
export class PanelWidgets extends PanelPlugin {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.PanelWidgets",
            name: "Panel Widgets Demo",
            description: "A panel plugin showcasing demos of all the available widgets",
            dependencies: [Ui.IGui]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);
    }


    /**
     * Creates a widget and sets up the necessary layout and connections.
     *
     * @param {Ui.Widget} parent - The parent widget to attach the created widget to.
     * @returns {Ui.Widget} The created widget.
     */
    createWidget(parent) {
        const mainWidget = new Ui.Widget(parent);
        const mainLayout = new Ui.BoxLayout();
        mainLayout.setDirection(Ui.Direction.TopToBottom);
        const demoStackedWidget = new Ui.StackedWidget(mainWidget);
        const demoTabBar = new Ui.TabBar(mainWidget);

        // Create a connection to change the index of the stacked widget when the tab is changed
        demoTabBar.onCurrentChange.connect((index) => {
            demoStackedWidget.currentIndex = index;
        });

        // Add tabs

        const widgetCreationMethods = [
            "createButtonTab",
            "createTextEditTab",
            "createCheckBoxTab",
            "createStatusIndicatorTab",
            "createDialogTab",
            "createComboBoxTab",
            "createImageGridTab",
            "createWebViewTab",
            // The progress bar tab is added separately because it has two pages
            // It has to be the last tab here in this example. Otherwise, the index will be off
            "createProgressBarTab"
        ].map(methodName => this[methodName]);

        widgetCreationMethods.forEach((method) => {
            method.call(this, demoTabBar, demoStackedWidget, mainWidget);
        });

        mainLayout.setContentsMargins(Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin);
        mainLayout.addWidget(demoTabBar);
        mainLayout.addWidget(demoStackedWidget);
        mainWidget.layout = mainLayout;
        return mainWidget;
    }

    createButtonTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("Button");
        const buttonTabWidget = new Ui.Widget(widget);
        const buttonTabLayout = new Ui.BoxLayout();
        buttonTabLayout.setDirection(Ui.Direction.TopToBottom);
        const buttonGridLayout = new Ui.GridLayout();
        // Click button
        const clickButton = new Ui.PushButton(buttonTabWidget);
        clickButton.text = "Click";
        // Primary button
        const primaryButton = new Ui.PushButton(buttonTabWidget);
        primaryButton.text = "Primary";
        primaryButton.primary = true;
        // Disabled button
        const disabledButton = new Ui.PushButton(buttonTabWidget);
        disabledButton.text = "Disabled";
        disabledButton.enabled = false;
        // Icon button
        const iconButton = new Ui.PushButton(buttonTabWidget);
        iconButton.text = "Click";
        iconButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("Resources/Image.svg"))), Ui.IconMode.MonoChrome);
        // Radio button group
        const radioButtonGroup = new Ui.RadioButtonGroup(buttonTabWidget);

        const radioBtnGroupChildA = new Ui.RadioButton(radioButtonGroup);
        radioBtnGroupChildA.toolTip = "Option A";
        radioBtnGroupChildA.setIcon(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("Resources/Image.svg"))));

        radioButtonGroup.addButton(radioBtnGroupChildA, 0);

        const radioBtnGroupChildB = new Ui.PushButton(radioButtonGroup);
        radioBtnGroupChildB.toolTip = "Option B";
        radioBtnGroupChildB.setIcon(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("Resources/Image.svg"))));

        radioButtonGroup.addButton(radioBtnGroupChildB, 1);

        clickButton.onClick.connect(() => {
            clickButton.text = "Clicked";
        });
        iconButton.onClick.connect(() => {
            iconButton.text = "Clicked";
            iconButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("Resources/BoxMesh.svg"))), Ui.IconMode.Regular);
        });

        buttonGridLayout.addWidget(clickButton);
        buttonGridLayout.addWidget(iconButton);
        buttonGridLayout.addWidget(primaryButton);
        buttonGridLayout.addWidget(disabledButton);
        buttonGridLayout.addWidget(radioButtonGroup);
        buttonTabLayout.addStretch(0);
        buttonTabLayout.addLayout(buttonGridLayout);
        buttonTabLayout.addStretch(0);
        buttonGridLayout.spacing = Ui.Sizes.Padding;
        buttonTabWidget.layout = buttonTabLayout;
        stackedWidget.addWidget(buttonTabWidget);
    }

    createTextEditTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("TextEdit");
        const textEditTabWidget = new Ui.Widget(widget);
        const textEditTabLayout = new Ui.BoxLayout();
        textEditTabLayout.setDirection(Ui.Direction.TopToBottom);
        const lineEditLabel = new Ui.Label(widget);
        lineEditLabel.foregroundRole = Ui.ColorRole.BrightText;
        const textEditLabel = new Ui.Label(widget);
        textEditLabel.foregroundRole = Ui.ColorRole.BrightText;

        const textEditArea = new Ui.TextEdit(widget);
        textEditArea.placeholderText = "Enter text here...";
        textEditArea.foregroundRole = Ui.ColorRole.PlaceholderText;
        textEditArea.setFixedHeight(Ui.Sizes.TextEditHeight);
        textEditArea.onTextChange.connect(() => {
            textEditLabel.text = "Your input: " + textEditArea.plainText;
        });
        const lineEditField = new Ui.LineEdit(widget);
        lineEditField.placeholderText = "Enter text here...";
        lineEditField.foregroundRole = Ui.ColorRole.PlaceholderText;
        lineEditField.onTextChange.connect((text) => {
            lineEditLabel.text = "Your input: " + text;
        });

        const clearButton = new Ui.PushButton(widget);
        clearButton.text = "Clear";
        clearButton.foregroundRole = Ui.ColorRole.Button;
        clearButton.onClick.connect(() => {
            textEditArea.plainText = "";
            lineEditField.text = "";
            lineEditLabel.text = "";
            textEditLabel.text = "";
        });

        textEditTabLayout.addWidget(lineEditField);
        textEditTabLayout.addWidget(lineEditLabel);
        textEditTabLayout.addWidget(textEditArea);
        textEditTabLayout.addWidget(textEditLabel);
        textEditTabLayout.addWidget(clearButton);
        textEditTabLayout.addStretch(0);
        textEditTabLayout.spacing = Ui.Sizes.Padding;
        textEditTabWidget.layout = textEditTabLayout;
        stackedWidget.addWidget(textEditTabWidget);
    }

    createCheckBoxTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("CheckBox");
        const checkBoxTabWidget = new Ui.Widget(widget);
        const checkBoxTabLayout = new Ui.BoxLayout();
        checkBoxTabLayout.setDirection(Ui.Direction.TopToBottom);
        for (let i = 0; i < 5; i++) {
            const checkBox = new Ui.CheckBox(checkBoxTabWidget);
            checkBox.setFixedHeight(Ui.Sizes.MenuItemHeight);
            checkBox.text = "Option " + i;
            checkBox.onToggle.connect((checked) => {
                if (checked) {
                    checkBox.text = "Option " + i + " Checked!";
                } else {
                    checkBox.text = "Option " + i;
                }
            });
            checkBoxTabLayout.addWidget(checkBox);
        }

        const checkBoxScrollWidget = new Ui.Widget(checkBoxTabWidget);
        checkBoxScrollWidget.layout = checkBoxTabLayout;
        const checkBoxScrollArea = new Ui.VerticalScrollArea(checkBoxTabWidget);
        checkBoxScrollArea.setWidget(checkBoxScrollWidget);
        checkBoxScrollArea.setFixedHeight((Ui.Sizes.MenuItemHeight + Ui.Sizes.CheckboxPadding) * 5);
        const checkBoxScrollLayout = new Ui.BoxLayout();
        checkBoxScrollLayout.setDirection(Ui.Direction.TopToBottom);
        checkBoxScrollLayout.addWidget(checkBoxScrollArea);

        checkBoxTabWidget.layout = checkBoxScrollLayout;
        stackedWidget.addWidget(checkBoxTabWidget);
    }

    createStatusIndicatorTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("StatusIndicator");
        const statusIndicatorTabWidget = new Ui.Widget(widget);
        const statusIndicatorTabLayout = new Ui.BoxLayout();
        statusIndicatorTabLayout.setDirection(Ui.Direction.TopToBottom);
        const statusIndicator = new Ui.StatusIndicator("Progressing", statusIndicatorTabWidget);
        statusIndicator.visible = false;
        statusIndicator.setSizePolicy(Ui.SizePolicy.Policy.Ignored, Ui.SizePolicy.Policy.Ignored);
        const startButton = new Ui.PushButton(statusIndicatorTabWidget);
        const stopButton = new Ui.PushButton(statusIndicatorTabWidget);
        startButton.text = "Start";
        stopButton.text = "Stop";

        startButton.onClick.connect(() => {
            statusIndicator.visible = true;
            statusIndicator.start();
        });
        stopButton.onClick.connect(() => {
            statusIndicator.stop();
            statusIndicator.visible = false;
        });

        statusIndicatorTabLayout.addStretch(0);
        statusIndicatorTabLayout.addWidget(startButton);
        statusIndicatorTabLayout.addWidget(stopButton);
        statusIndicatorTabLayout.addWidget(statusIndicator);
        statusIndicatorTabLayout.addStretch(0);
        statusIndicatorTabLayout.spacing = Ui.Sizes.Padding;
        statusIndicatorTabWidget.layout = statusIndicatorTabLayout;
        stackedWidget.addWidget(statusIndicatorTabWidget);
    }

    createDialogTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("Dialog");
        const dialogTabWidget = new Ui.Widget(widget);
        const dialogTabLayout = new Ui.BoxLayout();
        dialogTabLayout.setDirection(Ui.Direction.TopToBottom);
        const openDialogButton = new Ui.PushButton(dialogTabWidget);
        openDialogButton.text = "Open a dialog";
        openDialogButton.foregroundRole = Ui.ColorRole.Button;
        /**
         * @type {Ui.Gui}
         */
        const guiComponent = this.pluginSystem.findInterface(Ui.IGui);
        const gui = guiComponent;
        const dialog = gui.createDialog();
        dialog.windowTitle = "Sample Dialog";
        dialog.resize(200, 200);
        openDialogButton.onClick.connect(() => {
            dialog.show();
        });
        dialogTabLayout.addWidget(openDialogButton);
        dialogTabWidget.layout = dialogTabLayout;
        stackedWidget.addWidget(dialogTabWidget);
    }

    createComboBoxTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("ComboBox");
        // Create a new widget
        const comboBoxTabWidget = new Ui.Widget(widget);
        // Create a new layout for the new widget
        const comboBoxTabLayout = new Ui.BoxLayout();
        // Set the direction of the new layout
        comboBoxTabLayout.setDirection(Ui.Direction.TopToBottom);
        // Create a new combobox widget
        const comboBox = new Ui.ComboBox(comboBoxTabWidget);
        comboBox.addIconItem(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("Resources/Image.svg"))), "Option 1");
        comboBox.addItem("Option 2");
        comboBox.addItem("Option 3");
        comboBoxTabLayout.addStretch(0);
        // Finally, add the combobox widget to the layout we just created above
        comboBoxTabLayout.addWidget(comboBox);
        comboBoxTabLayout.addStretch(0);
        // Set the layout to the widget
        comboBoxTabWidget.layout = comboBoxTabLayout;
        // Finally, add the widget to the stacked widget
        stackedWidget.addWidget(comboBoxTabWidget);
    }

    createImageGridTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("Image Grid");
        const imageGridTabWidget = new Ui.Widget(widget);
        const imageGridTabLayout = new Ui.BoxLayout();
        const image = new Ui.Pixmap(new Editor.Path(import.meta.resolve("Resources/Image.svg")));
        const boxMesh = new Ui.Pixmap(new Editor.Path(import.meta.resolve("Resources/BoxMesh.svg")));
        image.resize(64, 64);
        boxMesh.resize(64, 64);
        const imageView1 = new Ui.ImageView(imageGridTabWidget);
        imageView1.pixmap = image;
        const imageView2 = new Ui.ImageView(imageGridTabWidget);
        imageView2.pixmap = boxMesh;

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, imageGridTabWidget);
        imageGridTabLayout.addStretch(0);
        imageGridTabLayout.addWidgetWithStretch(imageView1, 0, Ui.Alignment.AlignCenter);
        imageGridTabLayout.addStretch(0);
        imageGridTabLayout.addWidget(separator);
        imageGridTabLayout.addStretch(0);
        imageGridTabLayout.addWidgetWithStretch(imageView2, 0, Ui.Alignment.AlignBottom);
        imageGridTabLayout.addStretch(0);
        imageGridTabWidget.layout = imageGridTabLayout;
        stackedWidget.addWidget(imageGridTabWidget);
    }

    /**
     * Creates a progress bar tab in the specified tab bar and adds it to the stacked widget.
     *
     * @param {Ui.TabBar} tabBar - The tab bar to add the progress bar tab to.
     * @param {Ui.StackedWidget} stackedWidget - The stacked widget to add the progress bar tab widget to.
     * @param {Ui.Widget} widget - The parent widget for the progress bar tab.
     */
    createProgressBarTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("ProgressBar");
        const progressBarStartTabWidget = new Ui.Widget(widget);
        const progressBarStartTabLayout = new Ui.BoxLayout();
        progressBarStartTabLayout.setDirection(Ui.Direction.TopToBottom);
        const processStartButton = new Ui.PushButton(progressBarStartTabWidget);
        processStartButton.text = "Process Start";
        processStartButton.foregroundRole = Ui.ColorRole.Button;
        progressBarStartTabLayout.addWidget(processStartButton);
        progressBarStartTabWidget.layout = progressBarStartTabLayout;
        stackedWidget.addWidget(progressBarStartTabWidget);

        const progressBarTabWidget = new Ui.Widget(widget);
        const progressBarTabLayout = new Ui.BoxLayout();
        progressBarTabLayout.setDirection(Ui.Direction.TopToBottom);
        const cancelButton = new Ui.PushButton(progressBarTabWidget);
        cancelButton.text = "Cancel";
        const progressBar = new Ui.ProgressBar(progressBarTabWidget);
        progressBar.setFixedHeight(Ui.Sizes.ProgressBarHeight);
        progressBarTabLayout.addWidget(progressBar);
        progressBarTabLayout.addWidget(cancelButton);
        progressBarTabWidget.layout = progressBarTabLayout;
        cancelButton.onClick.connect(() => {
            // Return to the previous stacked widget which has the start button
            // The number here is the index of the start button tab
            stackedWidget.currentIndex = 8;
        });
        stackedWidget.addWidget(progressBarTabWidget);

        processStartButton.onClick.connect(() => {
            // Advance to the next stacked widget, which displays the progress bar in action
            stackedWidget.currentIndex = 9;
            progressBar.maximum = 0;
            progressBar.minimum = 0;
            progressBar.value = 0;
        });
    }

    createWebViewTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("WebView");

        const webViewTabWidget = new Ui.Widget(widget);
        const webViewTabLayout = new Ui.BoxLayout();
        webViewTabLayout.setDirection(Ui.Direction.TopToBottom);

        const webView = new Ui.WebEngineView(webViewTabWidget);
        webView.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        webView.load("https://docs.snap.com/lens-studio/home");

        webViewTabLayout.addWidget(webView);

        webViewTabWidget.layout = webViewTabLayout;
        stackedWidget.addWidget(webViewTabWidget);
    }
}
