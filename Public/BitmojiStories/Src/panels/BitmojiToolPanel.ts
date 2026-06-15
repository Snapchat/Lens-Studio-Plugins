import { Unsubscribe } from "LensStudio:Event.js";
import {
    Widget,
    BoxLayout,
    Direction,
    PushButton,
    Label,
    SizePolicy,
    Sizes,
    Separator,
    Orientation,
    Shadow,
    IGui,
} from "LensStudio:Ui";
import { ComboBox, Dialog } from "@design-system";
import { ToolPanel } from "../descriptors/ToolDescriptor";
import { Model } from "../model/Model";
import { Selection, SelectionType } from "../model/Selection";
import { createDefaultBitmoji, MAX_BITMOJIS_PER_FRAME } from "../model/Bitmoji";
import { Grid } from "../common/Grid";
import { PoseEntry, getAllPoses, getDefaultPose } from "./PoseTool/PoseProvider";

export class BitmojiToolPanel implements ToolPanel {
    readonly widget: Widget;
    private unsubs: Unsubscribe[] = [];
    private addButton: PushButton;
    private addSeparator: Separator;
    private filler: Widget;
    private settingsContainer: Widget;
    private posesContainer: Widget;
    private removeButton: PushButton;
    private typeCombo: ComboBox;
    private poseGrid: Grid<PoseEntry>;
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

        // Add bitmoji button
        this.addButton = new PushButton(this.widget);
        this.addButton.text = "Add Bitmoji";
        this.addButton.primary = true;
        this.addButton.onClick.connect(() => this.handleAddBitmoji());
        layout.addWidget(this.addButton);

        this.addSeparator = new Separator(Orientation.Horizontal, Shadow.Plain, this.widget);
        layout.addWidget(this.addSeparator);

        this.filler = new Widget(this.widget);
        this.filler.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        layout.addWidget(this.filler);

        // Bitmoji type selector
        this.settingsContainer = new Widget(this.widget);
        const settingsLayout = new BoxLayout();
        settingsLayout.setDirection(Direction.TopToBottom);
        settingsLayout.setContentsMargins(0, 0, 0, 0);
        settingsLayout.spacing = Sizes.HalfPadding;

        this.typeCombo = new ComboBox(this.settingsContainer, {
            name: "Bitmoji Type",
            items: ["Me", "Friend"],
            layout: "horizontal",
        });
        this.unsubs.push(
            this.typeCombo.onValueChange.add((text: string) => {
                if (this.updatingFromModel) return;
                this.model.updateBitmojiType(text === "Me" ? 0 : 1);
            }),
        );
        settingsLayout.addWidget(this.typeCombo);

        settingsLayout.addWidget(new Separator(Orientation.Horizontal, Shadow.Plain, this.settingsContainer));

        this.settingsContainer.layout = settingsLayout;
        layout.addWidget(this.settingsContainer);

        // Pose grid
        this.posesContainer = new Widget(this.widget);
        const posesLayout = new BoxLayout();
        posesLayout.setDirection(Direction.TopToBottom);
        posesLayout.setContentsMargins(0, 0, 0, 0);

        this.poseGrid = new Grid<PoseEntry>(this.posesContainer, 120, 140, 1.5);
        this.poseGrid.setItems(getAllPoses());
        this.unsubs.push(
            this.poseGrid.onTileClicked.add((pose: PoseEntry) => {
                console.log("Setting pose:", pose);
                this.model.setPose({
                    url: pose.url,
                    extraUrl: pose.extraUrl,
                    path: pose.path,
                    extraPath: pose.extraPath,
                });
                this.poseGrid.selectByIndex(pose.index);
            }),
        );
        posesLayout.addWidget(this.poseGrid.widget);
        this.posesContainer.layout = posesLayout;
        layout.addWidget(this.posesContainer);

        // Remove bitmoji button
        this.removeButton = new PushButton(this.widget);
        this.removeButton.text = "Remove Bitmoji";
        this.removeButton.onClick.connect(() => this.handleRemoveBitmoji());
        layout.addWidget(this.removeButton);

        this.widget.layout = layout;

        this.updateVisibility();
    }

    onSelectionChanged(selection: Selection): void {
        this.updateVisibility();

        if (selection.type === SelectionType.Bitmoji && selection.index >= 0) {
            const frame = this.model.getCurrentFrame();
            if (!frame) return;
            const bitmoji = frame.getState().bitmojis[selection.index];
            if (bitmoji) {
                // Block onValueChange while we sync the combo to the selected bitmoji,
                // otherwise the panel feeds an updateBitmojiType back into the model
                // and the canvas redownloads the avatar against a stale selection.
                this.updatingFromModel = true;
                try {
                    this.typeCombo.value = bitmoji.bitmojiType === 0 ? "Me" : "Friend";
                } finally {
                    this.updatingFromModel = false;
                }
            }
        }
    }

    private updateVisibility(): void {
        const frame = this.model.getCurrentFrame();
        const sel = frame?.getSelection();
        const hasBitmojiSelected = sel?.type === SelectionType.Bitmoji && sel.index >= 0;
        const bitmojiCount = frame?.getState().bitmojis.length ?? 0;

        this.addButton.enabled = bitmojiCount < MAX_BITMOJIS_PER_FRAME;
        this.addSeparator.visible = hasBitmojiSelected;
        this.filler.visible = !hasBitmojiSelected;
        this.settingsContainer.visible = hasBitmojiSelected;
        this.posesContainer.visible = hasBitmojiSelected;
        this.removeButton.visible = hasBitmojiSelected;
    }

    private handleAddBitmoji(): void {
        const frame = this.model.getCurrentFrame();
        if (!frame) return;
        const count = frame.getState().bitmojis.length;
        const defaultPose = getDefaultPose();
        const bitmoji = createDefaultBitmoji(count, {
            url: defaultPose.url,
            extraUrl: defaultPose.extraUrl,
            path: defaultPose.path,
            extraPath: defaultPose.extraPath,
        });
        this.model.addBitmoji(bitmoji);
    }

    private async handleRemoveBitmoji(): Promise<void> {
        const frame = this.model.getCurrentFrame();
        if (!frame) return;
        const sel = frame.getSelection();
        if (sel.type !== SelectionType.Bitmoji || sel.index < 0) return;

        const dialog = new Dialog(this.gui, {
            title: "Remove Bitmoji",
            text: "Are you sure you want to remove this bitmoji?",
            actionTitle: "Remove",
            cancelTitle: "Cancel",
        });
        const result = await dialog.show();
        if (result.accepted) {
            this.model.removeBitmoji(sel.index);
        }
    }

    deinit(): void {
        for (const unsub of this.unsubs) unsub();
        this.unsubs = [];
        this.typeCombo.deinit();
        this.poseGrid.deinit();
    }
}
