import * as Ui from 'LensStudio:Ui';

export class PanelUI {
    static createMainPanel(parent, callbacks) {
        const connections = [];
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(4, 4, 4, 4);
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = 4;

        const titleLabel = PanelUI.createTitleLabel(widget);
        layout.addWidgetWithStretch(titleLabel, 0, Ui.Alignment.AlignTop);

        const addButton = PanelUI.createAddDirectoryButton(widget);
        if (callbacks.onAddDirectory) {
            const conn = addButton.onClick.connect(callbacks.onAddDirectory);
            connections.push(conn);
        }
        layout.addWidgetWithStretch(addButton, 0, Ui.Alignment.AlignTop);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, widget);
        layout.addWidgetWithStretch(separator, 0, Ui.Alignment.AlignTop);

        const { scrollArea, directoriesLayout, directoriesWidget } = PanelUI.createDirectoriesContainer(widget);
        layout.addWidget(scrollArea);

        widget.layout = layout;

        return {
            widget,
            directoriesLayout,
            directoriesWidget,
            connections
        };
    }

    static createTitleLabel(parent) {
        const label = new Ui.Label(parent);
        label.text = 'Sync Native Libraries';
        label.fontRole = Ui.FontRole.LargeTitle;
        return label;
    }

    static createAddDirectoryButton(parent) {
        const button = new Ui.PushButton(parent);
        button.text = 'Add Directory';
        button.primary = true;
        return button;
    }

    static createDirectoriesContainer(parent) {
        const directoriesWidget = new Ui.Widget(parent);
        directoriesWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const directoriesLayout = new Ui.BoxLayout();
        directoriesLayout.setContentsMargins(0, 0, 0, 0);
        directoriesLayout.setDirection(Ui.Direction.TopToBottom);
        directoriesLayout.spacing = 4;
        directoriesWidget.layout = directoriesLayout;

        const scrollArea = new Ui.VerticalScrollArea(parent);
        scrollArea.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        scrollArea.setWidget(directoriesWidget);

        return {
            scrollArea,
            directoriesLayout,
            directoriesWidget
        };
    }
}
