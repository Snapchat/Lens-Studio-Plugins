import * as Ui from 'LensStudio:Ui'

export function createImageView(widget: any, imagePath: Editor.Path) {
    const pixmap = new Ui.Pixmap(imagePath)
    const imageView = new Ui.ImageView(widget)
    imageView.pixmap = pixmap
    return imageView
}

export function createLabel(widget: Ui.Widget, text: string, fontRole: Ui.FontRole, foregroundRole: Ui.ColorRole, fixedHeight: number = 0): Ui.Label {
    const label = new Ui.Label(widget)
    label.fontRole = fontRole
    label.foregroundRole = foregroundRole
    label.text = text
    if (fixedHeight > 0) {
        label.setFixedHeight(fixedHeight)
    }
    return label
}

export function createLineWithButton(
    widget: Ui.Widget,
    layout: Ui.BoxLayout,
    placeholderText: string,
    buttonText: string,
    defaultText = '',
    onButtonClick: (url: string) => void) {

    //create horizontal layout
    const hLayout = new Ui.BoxLayout()
    hLayout.setDirection(Ui.Direction.LeftToRight)
    //add this to parent layout

    // Create line edit
    const lineEdit = new Ui.LineEdit(widget)
    lineEdit.placeholderText = placeholderText
    if (defaultText != '')
        lineEdit.text = defaultText
    lineEdit.foregroundRole = Ui.ColorRole.PlaceholderText
    //add to horizontal layout
    hLayout.addWidget(lineEdit)

    // Create button
    const button = new Ui.PushButton(widget)
    button.text = buttonText
    const buttonClickConnection = button.onClick.connect(() => {
        onButtonClick(lineEdit.text)
    })
    hLayout.addWidget(button)

    const height = Ui.Sizes.InputHeight
    lineEdit.setFixedHeight(height)
    button.setFixedHeight(height)
    button.setSizePolicy(Ui.SizePolicy.Policy.Minimum, Ui.SizePolicy.Policy.Fixed)
    button.foregroundRole = Ui.ColorRole.Button
    button.primary = true

    layout.addLayout(hLayout)

    return buttonClickConnection
}

export function addSeparator(widget: Ui.Widget, layout: { addWidget: (arg0: Ui.Separator) => void }) {
    const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, widget)
    layout.addWidget(separator)
    return separator
}
