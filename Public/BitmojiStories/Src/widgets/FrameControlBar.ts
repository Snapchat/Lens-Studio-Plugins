import { Event, Unsubscribe } from "LensStudio:Event.js";
import {
    Widget,
    BoxLayout,
    Direction,
    PushButton,
    ImageView,
    Pixmap,
    VerticalScrollArea,
    CalloutFrame,
    Label,
    StackedLayout,
    StackingMode,
    SizePolicy,
    Sizes,
    IconMode,
    FontRole,
    Color,
    ClearLayoutBehavior,
    IGui,
} from "LensStudio:Ui";
import { Dialog } from "@design-system";
import {
    FRAME_CONTROL_BAR_HEIGHT,
    FRAME_PREVIEW_WIDTH,
    FRAME_PREVIEW_HEIGHT,
} from "../common/constants";

function createColor(r: number, g: number, b: number, a: number): Color {
    const c = new Color();
    c.red = r;
    c.green = g;
    c.blue = b;
    c.alpha = a;
    return c;
}

const previewBg = createColor(61, 67, 77, 255);
const previewHoverBg = createColor(79, 89, 99, 255);
const previewHighlight = createColor(123, 199, 250, 255);
const transparent = createColor(0, 0, 0, 0);

class FramePreview {
    readonly widget: CalloutFrame;
    readonly onClick = new Event<void>();
    private _selected = false;
    private label: Label;

    constructor(parent: Widget) {
        this.widget = new CalloutFrame(parent);
        this.widget.lineWidth = 1;
        this.widget.setBackgroundColor(previewBg);
        this.widget.setFixedWidth(FRAME_PREVIEW_WIDTH);
        this.widget.setFixedHeight(FRAME_PREVIEW_HEIGHT);

        const touchZone = new ImageView(this.widget);
        touchZone.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        touchZone.scaledContents = true;
        touchZone.responseHover = true;
        touchZone.onClick.connect(() => this.onClick.trigger());
        touchZone.onHover.connect((hovered: boolean) => {
            this.widget.setBackgroundColor(hovered ? previewHoverBg : previewBg);
        });

        this.label = new Label(touchZone);
        this.label.setFixedWidth(FRAME_PREVIEW_WIDTH);
        this.label.setFixedHeight(FRAME_PREVIEW_HEIGHT);
        this.label.fontRole = FontRole.LargeTitleBold;

        const layout = new BoxLayout();
        layout.setDirection(Direction.LeftToRight);
        layout.spacing = 0;
        layout.setContentsMargins(0, 0, 0, 0);
        layout.addWidget(touchZone);
        this.widget.layout = layout;

        this.setSelected(false);
    }

    setText(text: string): void {
        this.label.text = text;
    }

    setSelected(selected: boolean): void {
        this._selected = selected;
        this.widget.setForegroundColor(selected ? previewHighlight : transparent);
    }
}

export class FrameControlBar {
    readonly widget: Widget;
    readonly onAddFrame = new Event<void>();
    readonly onCopyFrame = new Event<void>();
    readonly onRemoveFrame = new Event<number>();
    readonly onSelectFrame = new Event<number>();

    private previews: FramePreview[] = [];
    private previewUnsubs: Unsubscribe[] = [];
    private previewsContainer: Widget;
    private previewsLayout: BoxLayout;
    private currentIndex = -1;
    private addFrameButton: PushButton;
    private deleteButton: ImageView;
    private gui: IGui;

    constructor(parent: Widget, pluginSystem: Editor.PluginSystem) {
        this.gui = pluginSystem.findInterface(IGui) as IGui;
        this.widget = new Widget(parent);
        this.widget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Fixed);
        this.widget.setFixedHeight(FRAME_CONTROL_BAR_HEIGHT + Sizes.Padding);

        const layout = new BoxLayout();
        layout.setDirection(Direction.LeftToRight);
        layout.setContentsMargins(Sizes.Padding, Sizes.Padding, Sizes.Padding, Sizes.Padding);

        // Add/Copy frame button
        this.addFrameButton = new PushButton(this.widget);
        this.addFrameButton.setFixedWidth(33);
        this.addFrameButton.setFixedHeight(33);
        this.addFrameButton.setIcon(
            Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("./FrameControlBar/resources/plus_icon.svg"))),
        );
        this.addFrameButton.setIconMode(IconMode.MonoChrome);
        this.addFrameButton.primary = true;
        this.addFrameButton.toolTip = "Add page";
        this.addFrameButton.onClick.connect(() => {
            if (this.previews.length === 0) {
                this.onAddFrame.trigger();
            } else {
                this.onCopyFrame.trigger();
            }
        });
        layout.addWidget(this.addFrameButton);

        // Frame previews scroll area
        this.previewsContainer = new Widget(this.widget);
        this.previewsContainer.setSizePolicy(SizePolicy.Policy.Fixed, SizePolicy.Policy.Fixed);
        this.previewsLayout = new BoxLayout();
        this.previewsLayout.setDirection(Direction.LeftToRight);
        this.previewsLayout.setContentsMargins(Sizes.Padding, Sizes.HalfPadding, Sizes.Padding, Sizes.HalfPadding);
        this.previewsContainer.layout = this.previewsLayout;

        const scrollArea = new VerticalScrollArea(this.widget);
        scrollArea.setWidget(this.previewsContainer);
        scrollArea.setContentsMargins(0, 0, 0, 0);
        layout.addWidget(scrollArea);

        // Delete frame button
        this.deleteButton = new ImageView(this.widget);
        this.deleteButton.pixmap = new Pixmap(
            new Editor.Path(import.meta.resolve("./FrameControlBar/resources/delete_icon.svg")),
        );
        this.deleteButton.setFixedWidth(33);
        this.deleteButton.setFixedHeight(33);
        this.deleteButton.setContentsMargins(0, 0, 0, 0);
        this.deleteButton.setSizePolicy(SizePolicy.Policy.Fixed, SizePolicy.Policy.Fixed);
        this.deleteButton.scaledContents = true;
        this.deleteButton.responseHover = true;
        this.deleteButton.toolTip = "Delete page";
        this.deleteButton.onClick.connect(() => this.handleDeleteFrame());
        layout.addWidget(this.deleteButton);

        this.widget.layout = layout;
    }

    addFrame(): void {
        this.insertFrame(this.previews.length);
    }

    insertFrame(atIndex: number): void {
        const preview = new FramePreview(this.previewsContainer);
        preview.setText("<center>" + (atIndex + 1).toString() + "</center>");
        this.previews.splice(atIndex, 0, preview);

        for (const unsub of this.previewUnsubs) unsub();
        this.previewUnsubs = [];
        this.previews.forEach((p, i) => {
            this.previewUnsubs.push(p.onClick.add(() => this.onSelectFrame.trigger(i)));
        });

        this.arrangeLayout();
        this.updateDeleteButtonState();
    }

    removeFrame(index: number): void {
        if (index < 0 || index >= this.previews.length) return;
        this.previews[index].widget.deleteLater();
        this.previews.splice(index, 1);

        // Re-bind click handlers with corrected indices
        for (const unsub of this.previewUnsubs) unsub();
        this.previewUnsubs = [];
        this.previews.forEach((p, i) => {
            this.previewUnsubs.push(p.onClick.add(() => this.onSelectFrame.trigger(i)));
        });

        this.arrangeLayout();
        this.updateDeleteButtonState();
    }

    updateSelection(index: number): void {
        if (this.currentIndex >= 0 && this.currentIndex < this.previews.length) {
            this.previews[this.currentIndex].setSelected(false);
        }
        if (index >= 0 && index < this.previews.length) {
            this.previews[index].setSelected(true);
        }
        this.currentIndex = index;
    }

    private async handleDeleteFrame(): Promise<void> {
        if (this.currentIndex < 0 || this.previews.length === 0) return;

        const dialog = new Dialog(this.gui, {
            title: "Delete Frame",
            text: "Are you sure you want to delete this frame?",
            actionTitle: "Delete",
            cancelTitle: "Cancel",
        });
        const result = await dialog.show();
        if (result.accepted) {
            this.onRemoveFrame.trigger(this.currentIndex);
        }
    }

    private updateDeleteButtonState(): void {
        this.deleteButton.enabled = this.previews.length > 1;
    }

    private arrangeLayout(): void {
        this.previewsLayout.clear(ClearLayoutBehavior.KeepClearedWidgets);
        this.previews.forEach((preview, index) => {
            preview.setText("<center>" + (index + 1).toString() + "</center>");
            this.previewsLayout.addWidget(preview.widget);
        });
    }

    deinit(): void {
        for (const unsub of this.previewUnsubs) unsub();
        this.previewUnsubs = [];
        this.onAddFrame.clear();
        this.onCopyFrame.clear();
        this.onRemoveFrame.clear();
        this.onSelectFrame.clear();
    }
}
