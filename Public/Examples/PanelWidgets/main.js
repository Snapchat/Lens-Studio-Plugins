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
        const mainWidget = Ui.Widget.create(parent);
        const mainLayout = Ui.BoxLayout.create();
        mainLayout.setDirection(Ui.Direction.TopToBottom);
        const demoStackedWidget = Ui.StackedWidget.create(mainWidget);
        const demoTabBar = Ui.TabBar.create(mainWidget);

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
        const buttonTabWidget = Ui.Widget.create(widget);
        const buttonTabLayout = Ui.BoxLayout.create();
        buttonTabLayout.setDirection(Ui.Direction.TopToBottom);
        const buttonGridLayout = Ui.GridLayout.create();
        // Click button
        const clickButton = Ui.PushButton.create(buttonTabWidget);
        clickButton.text = "Click";
        // Primary button
        const primaryButton = Ui.PushButton.create(buttonTabWidget);
        primaryButton.text = "Primary";
        primaryButton.primary = true;
        // Disabled button
        const disabledButton = Ui.PushButton.create(buttonTabWidget);
        disabledButton.text = "Disabled";
        disabledButton.enabled = false;
        // Icon button
        const iconButton = Ui.PushButton.create(buttonTabWidget);
        iconButton.text = "Click";
        iconButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("Resources/Image.svg"))), Ui.IconMode.MonoChrome);
        // Radio button group
        const radioButtonGroup = Ui.RadioButtonGroup.create(buttonTabWidget);

        const radioBtnGroupChildA = Ui.RadioButton.create(radioButtonGroup);
        radioBtnGroupChildA.toolTip = "Option A";
        radioBtnGroupChildA.setIcon(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("Resources/Image.svg"))));

        radioButtonGroup.addButton(radioBtnGroupChildA, 0);

        const radioBtnGroupChildB = Ui.PushButton.create(radioButtonGroup);
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
        const textEditTabWidget = Ui.Widget.create(widget);
        const textEditTabLayout = Ui.BoxLayout.create();
        textEditTabLayout.setDirection(Ui.Direction.TopToBottom);
        const lineEditLabel = Ui.Label.create(widget);
        lineEditLabel.foregroundRole = Ui.ColorRole.BrightText;
        const textEditLabel = Ui.Label.create(widget);
        textEditLabel.foregroundRole = Ui.ColorRole.BrightText;

        const textEditArea = Ui.TextEdit.create(widget);
        textEditArea.placeholderText = "Enter text here...";
        textEditArea.foregroundRole = Ui.ColorRole.PlaceholderText;
        textEditArea.setFixedHeight(Ui.Sizes.TextEditHeight);
        textEditArea.onTextChange.connect(() => {
            textEditLabel.text = "Your input: " + textEditArea.plainText;
        });
        const lineEditField = Ui.LineEdit.create(widget);
        lineEditField.placeholderText = "Enter text here...";
        lineEditField.foregroundRole = Ui.ColorRole.PlaceholderText;
        lineEditField.onTextChange.connect((text) => {
            lineEditLabel.text = "Your input: " + text;
        });

        const clearButton = Ui.PushButton.create(widget);
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
        const checkBoxTabWidget = Ui.Widget.create(widget);
        const checkBoxTabLayout = Ui.BoxLayout.create();
        checkBoxTabLayout.setDirection(Ui.Direction.TopToBottom);
        for (let i = 0; i < 5; i++) {
            const checkBox = Ui.CheckBox.create(checkBoxTabWidget);
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

        const checkBoxScrollWidget = Ui.Widget.create(checkBoxTabWidget);
        checkBoxScrollWidget.layout = checkBoxTabLayout;
        const checkBoxScrollArea = Ui.VerticalScrollArea.create(checkBoxTabWidget);
        checkBoxScrollArea.setWidget(checkBoxScrollWidget);
        checkBoxScrollArea.setFixedHeight((Ui.Sizes.MenuItemHeight + Ui.Sizes.CheckboxPadding) * 5);
        const checkBoxScrollLayout = Ui.BoxLayout.create();
        checkBoxScrollLayout.setDirection(Ui.Direction.TopToBottom);
        checkBoxScrollLayout.addWidget(checkBoxScrollArea);

        checkBoxTabWidget.layout = checkBoxScrollLayout;
        stackedWidget.addWidget(checkBoxTabWidget);
    }

    createStatusIndicatorTab(tabBar, stackedWidget, widget) {
        tabBar.addTab("StatusIndicator");
        const statusIndicatorTabWidget = Ui.Widget.create(widget);
        const statusIndicatorTabLayout = Ui.BoxLayout.create();
        statusIndicatorTabLayout.setDirection(Ui.Direction.TopToBottom);
        const statusIndicator = Ui.StatusIndicator.create("Progressing", statusIndicatorTabWidget);
        statusIndicator.visible = false;
        statusIndicator.setSizePolicy(Ui.SizePolicy.Policy.Ignored, Ui.SizePolicy.Policy.Ignored);
        const startButton = Ui.PushButton.create(statusIndicatorTabWidget);
        const stopButton = Ui.PushButton.create(statusIndicatorTabWidget);
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
        const dialogTabWidget = Ui.Widget.create(widget);
        const dialogTabLayout = Ui.BoxLayout.create();
        dialogTabLayout.setDirection(Ui.Direction.TopToBottom);
        const openDialogButton = Ui.PushButton.create(dialogTabWidget);
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
        const comboBoxTabWidget = Ui.Widget.create(widget);
        // Create a new layout for the new widget
        const comboBoxTabLayout = Ui.BoxLayout.create();
        // Set the direction of the new layout
        comboBoxTabLayout.setDirection(Ui.Direction.TopToBottom);
        // Create a new combobox widget
        const comboBox = Ui.ComboBox.create(comboBoxTabWidget);
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
        const imageGridTabWidget = Ui.Widget.create(widget);
        const imageGridTabLayout = Ui.BoxLayout.create();
        const image = Ui.Pixmap.create(new Editor.Path(import.meta.resolve("Resources/Image.svg")));
        const boxMesh = Ui.Pixmap.create(new Editor.Path(import.meta.resolve("Resources/BoxMesh.svg")));
        image.resize(64, 64);
        boxMesh.resize(64, 64);
        const imageView1 = Ui.ImageView.create(imageGridTabWidget);
        imageView1.pixmap = image;
        const imageView2 = Ui.ImageView.create(imageGridTabWidget);
        imageView2.pixmap = boxMesh;

        const separator = Ui.Separator.create(Ui.Orientation.Vertical, Ui.Shadow.Plain, imageGridTabWidget);
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
        const progressBarStartTabWidget = Ui.Widget.create(widget);
        const progressBarStartTabLayout = Ui.BoxLayout.create();
        progressBarStartTabLayout.setDirection(Ui.Direction.TopToBottom);
        const processStartButton = Ui.PushButton.create(progressBarStartTabWidget);
        processStartButton.text = "Process Start";
        processStartButton.foregroundRole = Ui.ColorRole.Button;
        progressBarStartTabLayout.addWidget(processStartButton);
        progressBarStartTabWidget.layout = progressBarStartTabLayout;
        stackedWidget.addWidget(progressBarStartTabWidget);

        const progressBarTabWidget = Ui.Widget.create(widget);
        const progressBarTabLayout = Ui.BoxLayout.create();
        progressBarTabLayout.setDirection(Ui.Direction.TopToBottom);
        const cancelButton = Ui.PushButton.create(progressBarTabWidget);
        cancelButton.text = "Cancel";
        const progressBar = Ui.ProgressBar.create(progressBarTabWidget);
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

        const webViewTabWidget = Ui.Widget.create(widget);
        const webViewTabLayout = Ui.BoxLayout.create();
        webViewTabLayout.setDirection(Ui.Direction.TopToBottom);

        const webView = Ui.WebEngineView.create(webViewTabWidget);
        webView.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        webView.load("https://docs.snap.com/lens-studio/home");

        webViewTabLayout.addWidget(webView);

        webViewTabWidget.layout = webViewTabLayout;
        stackedWidget.addWidget(webViewTabWidget);
    }
}
