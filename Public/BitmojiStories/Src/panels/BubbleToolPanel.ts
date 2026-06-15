import { Unsubscribe } from "LensStudio:Event.js";
import {
    Widget,
    BoxLayout,
    Direction,
    PushButton,
    Label,
    SizePolicy,
    Sizes,
    IGui,
} from "LensStudio:Ui";
import { ComboBox, Dialog, TextPrompt } from "@design-system";
import { ToolPanel } from "../descriptors/ToolDescriptor";
import { Model } from "../model/Model";
import { Selection, SelectionType } from "../model/Selection";
import { createDefaultBubble } from "../model/Bubble";


const BUBBLE_STYLES = ["Default", "Waved", "Scream", "Wall"];
const TAIL_STYLES = ["Curve", "Thunder", "Bridge", "Off"];

export class BubbleToolPanel implements ToolPanel {
    readonly widget: Widget;
    private unsubs: Unsubscribe[] = [];
    private addButton: PushButton;
    private textContainer: Widget;
    private styleContainer: Widget;
    private attachmentContainer: Widget;
    private removeButton: PushButton;
    private textPrompt: TextPrompt;
    private styleCombo: ComboBox;
    private tailCombo: ComboBox;
    private attachmentCombo: ComboBox;
    private gui: IGui;
    private updatingFromModel = false;

    constructor(
        parent: Widget,
        private model: Model,
        private pluginSystem: Editor.PluginSystem,
    ) {
        this.gui = pluginSystem.findInterface(IGui) as IGui;
        this.widget = new Widget(parent);
        this.widget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);

        const layout = new BoxLayout();
        layout.setDirection(Direction.TopToBottom);
        layout.setContentsMargins(0, Sizes.Padding, 0, Sizes.Padding);
        layout.spacing = Sizes.HalfPadding;

        // Add bubble button
        this.addButton = new PushButton(this.widget);
        this.addButton.text = "Add Bubble";
        this.addButton.primary = true;
        this.addButton.onClick.connect(() => this.handleAddBubble());
        layout.addWidget(this.addButton);

        // Text section
        this.textContainer = new Widget(this.widget);
        const textLayout = new BoxLayout();
        textLayout.setDirection(Direction.TopToBottom);
        textLayout.setContentsMargins(0, 0, 0, 0);
        textLayout.spacing = Sizes.HalfPadding;

        const textLabel = new Label(this.textContainer);
        textLabel.text = "Text";
        textLabel.setSizePolicy(SizePolicy.Policy.Preferred, SizePolicy.Policy.Fixed);
        textLayout.addWidget(textLabel);

        this.textPrompt = new TextPrompt(this.textContainer, {
            placeholder: "Enter text here...",
        });
        this.textPrompt.setMaximumHeight(Sizes.TextEditHeight);
        this.unsubs.push(
            this.textPrompt.onValueChange.add((text: string) => {
                if (!this.updatingFromModel) {
                    this.model.setBubbleText(text);
                }
            }),
        );
        textLayout.addWidget(this.textPrompt);
        this.textContainer.layout = textLayout;
        layout.addWidget(this.textContainer);

        // Style section
        this.styleContainer = new Widget(this.widget);
        const styleLayout = new BoxLayout();
        styleLayout.setDirection(Direction.TopToBottom);
        styleLayout.setContentsMargins(0, 0, 0, 0);
        styleLayout.spacing = Sizes.HalfPadding;

        this.styleCombo = new ComboBox(this.styleContainer, {
            name: "Bubble Style",
            items: BUBBLE_STYLES,
            layout: "horizontal",
        });
        this.unsubs.push(
            this.styleCombo.onValueChange.add((text: string) => {
                if (!this.updatingFromModel) {
                    this.model.setBubbleStyle(BUBBLE_STYLES.indexOf(text));
                }
            }),
        );
        styleLayout.addWidget(this.styleCombo);

        this.tailCombo = new ComboBox(this.styleContainer, {
            name: "Tail Style",
            items: TAIL_STYLES,
            layout: "horizontal",
        });
        this.unsubs.push(
            this.tailCombo.onValueChange.add((text: string) => {
                if (!this.updatingFromModel) {
                    this.model.setBubbleTailStyle(TAIL_STYLES.indexOf(text));
                }
            }),
        );
        styleLayout.addWidget(this.tailCombo);
        this.styleContainer.layout = styleLayout;
        layout.addWidget(this.styleContainer);

        // Attachment section
        this.attachmentContainer = new Widget(this.widget);
        const attachLayout = new BoxLayout();
        attachLayout.setDirection(Direction.TopToBottom);
        attachLayout.setContentsMargins(0, 0, 0, 0);
        attachLayout.spacing = Sizes.HalfPadding;

        this.attachmentCombo = new ComboBox(this.attachmentContainer, {
            name: "Attach to",
            items: ["None (Narrator)"],
            layout: "horizontal",
        });
        this.unsubs.push(
            this.attachmentCombo.onValueChange.add((text: string) => {
                if (this.updatingFromModel) return;
                this.applyAttachment(text);
            }),
        );
        attachLayout.addWidget(this.attachmentCombo);
        this.attachmentContainer.layout = attachLayout;
        layout.addWidget(this.attachmentContainer);

        // Remove bubble button
        this.removeButton = new PushButton(this.widget);
        this.removeButton.text = "Remove Bubble";
        this.removeButton.onClick.connect(() => this.handleRemoveBubble());
        layout.addStretch(1);
        layout.addWidget(this.removeButton);

        this.widget.layout = layout;

        this.updateVisibility();
    }

    onSelectionChanged(selection: Selection): void {
        this.updateVisibility();

        if (selection.type === SelectionType.Bubble && selection.index >= 0) {
            this.syncFromModel(selection.index);
        }
    }

    private syncFromModel(bubbleIndex: number): void {
        const frame = this.model.getCurrentFrame();
        if (!frame) return;
        const bubble = frame.getState().bubbles[bubbleIndex];
        if (!bubble) return;

        this.updatingFromModel = true;
        this.textPrompt.value = bubble.text;
        this.styleCombo.value = BUBBLE_STYLES[bubble.bubbleStyle] ?? BUBBLE_STYLES[0];
        this.tailCombo.value = TAIL_STYLES[bubble.tailStyle] ?? TAIL_STYLES[0];
        this.rebuildAttachmentOptions(bubbleIndex);
        this.updatingFromModel = false;
    }

    private rebuildAttachmentOptions(bubbleIndex: number): void {
        const frame = this.model.getCurrentFrame();
        if (!frame) return;
        const state = frame.getState();

        const items: string[] = ["None (Narrator)"];
        state.bitmojis.forEach((_, i) => items.push(`Bitmoji ${i + 1}`));
        state.bubbles.forEach((_, i) => {
            if (i !== bubbleIndex) items.push(`Bubble ${i + 1}`);
        });

        this.attachmentCombo.deinit();
        this.attachmentCombo.deleteLater();

        const layout = this.attachmentContainer.layout as BoxLayout;

        this.attachmentCombo = new ComboBox(this.attachmentContainer, {
            name: "Attach to",
            items,
            layout: "horizontal",
        });
        layout.addWidget(this.attachmentCombo);

        this.unsubs.push(
            this.attachmentCombo.onValueChange.add((text: string) => {
                if (!this.updatingFromModel) {
                    this.applyAttachment(text);
                }
            }),
        );

        const bubble = state.bubbles[bubbleIndex];
        if (bubble.attachments.length > 0) {
            const att = bubble.attachments[0];
            const label =
                att.type === "bitmoji" ? `Bitmoji ${att.index + 1}` : `Bubble ${att.index + 1}`;
            this.attachmentCombo.value = label;
        }
    }

    private applyAttachment(text: string): void {
        const frame = this.model.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bubble || sel.index < 0) return;
        const state = frame.getState();

        // Clear existing
        const bubble = state.bubbles[sel.index];
        for (const att of bubble.attachments) {
            this.model.removeAttachment(att);
        }

        if (text === "None (Narrator)") return;

        if (text.startsWith("Bitmoji ")) {
            const idx = parseInt(text.replace("Bitmoji ", ""), 10) - 1;
            this.model.addAttachment({ type: "bitmoji", index: idx });
        } else if (text.startsWith("Bubble ")) {
            const idx = parseInt(text.replace("Bubble ", ""), 10) - 1;
            this.model.addAttachment({ type: "bubble", index: idx });
        }
    }

    private updateVisibility(): void {
        const frame = this.model.getCurrentFrame();
        const sel = frame?.getSelection();
        const hasBubbleSelected = sel?.type === SelectionType.Bubble && sel.index >= 0;

        this.textContainer.visible = hasBubbleSelected;
        this.styleContainer.visible = hasBubbleSelected;
        this.attachmentContainer.visible = hasBubbleSelected;
        this.removeButton.visible = hasBubbleSelected;
    }

    private handleAddBubble(): void {
        const bubble = createDefaultBubble();
        this.model.addBubble(bubble);
    }

    private async handleRemoveBubble(): Promise<void> {
        const frame = this.model.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bubble || sel.index < 0) return;

        const dialog = new Dialog(this.gui, {
            title: "Remove Bubble",
            text: "Are you sure you want to remove this bubble?",
            actionTitle: "Remove",
            cancelTitle: "Cancel",
        });
        const result = await dialog.show();
        if (result.accepted) {
            this.model.removeBubble(sel.index);
        }
    }

    deinit(): void {
        for (const unsub of this.unsubs) unsub();
        this.unsubs = [];
        this.textPrompt.deinit();
        this.styleCombo.deinit();
        this.tailCombo.deinit();
        this.attachmentCombo.deinit();
    }
}
