import * as Ui from 'LensStudio:Ui';

const RemoveIconSvg = `<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <line
    x1="6"
    y1="6"
    x2="18"
    y2="18"
    stroke="rgb(195, 210, 223)"
    stroke-width="2"
    stroke-linecap="round"
  />
  <line
    x1="18"
    y1="6"
    x2="6"
    y2="18"
    stroke="rgb(195, 210, 223)"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>
`;

export class DirectoryWidgetUI {
    static createDirectoryRow(parent, directoryPath, destinationPath, callbacks) {
        const connections = [];
        const container = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        const sourceLineEdit = DirectoryWidgetUI.createSourceDisplay(container, directoryPath);
        layout.addWidget(sourceLineEdit);

        const destinationLineEdit = DirectoryWidgetUI.createDestinationEditor(container, destinationPath);
        if (callbacks.onDestinationChange) {
            const conn = destinationLineEdit.onTextChange.connect(() => {
                callbacks.onDestinationChange(destinationLineEdit.text);
            });
            connections.push(conn);
        }
        layout.addWidget(destinationLineEdit);

        const syncButton = DirectoryWidgetUI.createSyncButton(container);
        if (callbacks.onSync) {
            const conn = syncButton.onClick.connect(() => {
                callbacks.onSync(directoryPath, destinationLineEdit.text);
            });
            connections.push(conn);
        }
        layout.addWidget(syncButton);

        const removeButton = DirectoryWidgetUI.createRemoveButton(container);
        if (callbacks.onRemove) {
            const conn = removeButton.onClick.connect(callbacks.onRemove);
            connections.push(conn);
        }
        layout.addWidget(removeButton);

        container.layout = layout;

        return { container, connections };
    }

    static createSourceDisplay(parent, directoryPath) {
        const lineEdit = new Ui.LineEdit(parent);
        lineEdit.text = directoryPath.toString();
        lineEdit.readonly = true;
        return lineEdit;
    }

    static createDestinationEditor(parent, destinationPath) {
        const lineEdit = new Ui.LineEdit(parent);
        lineEdit.text = destinationPath.toString();
        return lineEdit;
    }

    static createSyncButton(parent) {
        const button = new Ui.PushButton(parent);
        button.text = 'Sync';
        return button;
    }

    static createRemoveButton(parent) {
        const button = new Ui.PushButton(parent);
        button.setIconWithMode(Editor.Icon.fromSvgData(RemoveIconSvg), Ui.IconMode.Regular);
        return button;
    }
}
