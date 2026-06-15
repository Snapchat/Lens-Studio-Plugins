import { Unsubscribe } from "LensStudio:Event.js";
import {
    Widget,
    BoxLayout,
    Direction,
    PushButton,
    Label,
    CalloutFrame,
    ClickableLabel,
    ImageView,
    StatusIndicator,
    Pixmap,
    SizePolicy,
    Sizes,
    Orientation,
    Shadow,
    Separator,
    StackedLayout,
    StackingMode,
    Alignment,
    ColorRole,
    IGui,
    Color,
} from "LensStudio:Ui";
import * as Ui from "LensStudio:Ui";
import * as FileSystem from "LensStudio:FileSystem";
import { TextPrompt } from "@design-system";
import { ToolPanel } from "../descriptors/ToolDescriptor";
import { Model } from "../model/Model";
import { Selection } from "../model/Selection";
import { BackgroundGenerator } from "../common/BackgroundGenerator";
import { StorageProvider } from "../common/StorageProvider";

const MIN_PROMPT_LENGTH = 3;

function createColor(r: number, g: number, b: number, a: number): Color {
    const c = new Color();
    c.red = r;
    c.green = g;
    c.blue = b;
    c.alpha = a;
    return c;
}

const bgColor = createColor(45, 50, 57, 255);
const hoverBgColor = createColor(79, 89, 99, 255);
const borderColor = createColor(255, 255, 255, 255 * 0.08);

export class BackgroundToolPanel implements ToolPanel {
    readonly widget: Widget;
    private unsubs: Unsubscribe[] = [];
    private statusIndicator: StatusIndicator;
    private spacer: Widget;
    private storageProvider = new StorageProvider();
    private promptInput: TextPrompt;

    constructor(
        parent: Widget,
        private model: Model,
        private pluginSystem: Editor.PluginSystem,
    ) {
        this.widget = new Widget(parent);
        this.widget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);

        const layout = new BoxLayout();
        layout.setDirection(Direction.TopToBottom);
        layout.setContentsMargins(0, Sizes.Padding, 0, Sizes.Padding);
        layout.spacing = Sizes.HalfPadding;

        // Guidelines callout
        layout.addWidget(this.createGuidelinesCallout());

        // Prompt + Generate
        const promptLabel = new Label(this.widget);
        promptLabel.text = "Prompt";
        layout.addWidget(promptLabel);

        this.promptInput = new TextPrompt(this.widget, {
            placeholder: "Describe the background...",
        });
        this.promptInput.setMaximumHeight(Sizes.TextEditHeight);
        layout.addWidget(this.promptInput);

        const generateButton = new PushButton(this.widget);
        generateButton.text = "Generate texture";
        generateButton.onClick.connect(() => this.generateBackground(this.promptInput.value));
        layout.addWidget(generateButton);

        this.promptInput.onValueChange.add((value: string) => {
            generateButton.enabled = value.trim().length >= MIN_PROMPT_LENGTH;
        });

        generateButton.enabled = this.promptInput.value.trim().length >= MIN_PROMPT_LENGTH;

        // Status indicator
        this.statusIndicator = new StatusIndicator("", this.widget);
        this.statusIndicator.setContentsMargins(0, 0, 0, 0);
        this.statusIndicator.visible = false;
        layout.addWidget(this.statusIndicator);

        this.spacer = new Widget(this.widget);
        this.spacer.setFixedHeight(Sizes.Padding);
        layout.addWidget(this.spacer);

        // Separator between generate and upload sections
        layout.addWidget(new Separator(Orientation.Horizontal, Shadow.Raised, this.widget));
        const separatorSpacer = new Widget(this.widget);
        separatorSpacer.setFixedHeight(Sizes.Padding);
        layout.addWidget(separatorSpacer);

        // Upload section
        layout.addWidget(this.createImportButton());

        layout.addStretch(0);
        this.widget.layout = layout;

        model.selectBackground();
    }

    private createGuidelinesCallout(): CalloutFrame {
        const frame = new CalloutFrame(this.widget);
        const frameLayout = new BoxLayout();
        frameLayout.setDirection(Direction.LeftToRight);
        frameLayout.setContentsMargins(Sizes.HalfPadding, Sizes.HalfPadding, Sizes.HalfPadding, Sizes.HalfPadding);
        frameLayout.spacing = Sizes.Spacing;

        const infoIcon = new ImageView(frame);
        infoIcon.setSizePolicy(SizePolicy.Policy.Fixed, SizePolicy.Policy.Fixed);
        infoIcon.setFixedWidth(Sizes.IconSide);
        infoIcon.setFixedHeight(Sizes.IconSide);
        infoIcon.scaledContents = true;
        infoIcon.pixmap = new Pixmap(new Editor.Path(import.meta.resolve("./BackgroundTool/resources/info.svg")));
        frameLayout.addWidget(infoIcon);

        const guidelinesLabel = new ClickableLabel(frame);
        const link = "https://developers.snap.com/lens-studio/features/bitmoji-suite/comic-maker";
        const urlString = Ui.getUrlString("guidelines", link);
        guidelinesLabel.text = "Check our " + urlString + " for examples and best practices.";
        guidelinesLabel.wordWrap = true;
        guidelinesLabel.openExternalLinks = true;
        frameLayout.addWidgetWithStretch(guidelinesLabel, 1, Alignment.Default);

        frame.layout = frameLayout;
        return frame;
    }

    private createImportButton(): Widget {
        const calloutFrame = new CalloutFrame(this.widget);
        calloutFrame.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Fixed);
        calloutFrame.lineWidth = 1.5;
        calloutFrame.setBackgroundColor(bgColor);
        calloutFrame.setForegroundColor(borderColor);

        const container = new Widget(calloutFrame);
        container.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Fixed);
        container.backgroundRole = ColorRole.NoRole;

        const touchZone = new ImageView(calloutFrame);
        touchZone.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        touchZone.scaledContents = true;
        touchZone.responseHover = true;
        touchZone.setCursor(Ui.CursorShape.PointingHandCursor);
        touchZone.onClick.connect(() => this.importBackground());
        touchZone.onHover.connect((hovered: boolean) => {
            calloutFrame.setBackgroundColor(hovered ? hoverBgColor : bgColor);
        });

        const uploadIcon = new ImageView(container);
        uploadIcon.pixmap = new Pixmap(new Editor.Path(import.meta.resolve("./BackgroundTool/resources/upload_icon.svg")));

        const uploadLabel = new Label(container);
        uploadLabel.text = "UPLOAD IMAGE";

        const formatLabel = new Label(container);
        formatLabel.text = ".JPG, .PNG";

        const containerLayout = new BoxLayout();
        containerLayout.setDirection(Direction.TopToBottom);
        containerLayout.setContentsMargins(Sizes.Padding, 4 * Sizes.DoublePadding, Sizes.Padding, 4 * Sizes.DoublePadding);
        containerLayout.addStretch(0);
        containerLayout.addWidgetWithStretch(uploadIcon, 0, Alignment.AlignHCenter);
        containerLayout.addWidgetWithStretch(uploadLabel, 0, Alignment.AlignHCenter);
        containerLayout.addWidgetWithStretch(formatLabel, 0, Alignment.AlignHCenter);
        containerLayout.addStretch(0);
        container.layout = containerLayout;

        const stackLayout = new StackedLayout();
        stackLayout.stackingMode = StackingMode.StackAll;
        stackLayout.setContentsMargins(0, 0, 0, 0);
        stackLayout.addWidget(touchZone);
        stackLayout.addWidget(container);
        calloutFrame.layout = stackLayout;

        return calloutFrame;
    }

    private setStatus(status: string, loading = false): void {
        if (status === "") {
            this.statusIndicator.stop();
            this.statusIndicator.visible = false;
            this.spacer.visible = true;
            return;
        }
        this.statusIndicator.text = status;
        if (loading) {
            this.statusIndicator.start();
        } else {
            this.statusIndicator.stop();
        }
        this.statusIndicator.visible = true;
        this.spacer.visible = false;
    }

    private importBackground(): void {
        const gui = this.pluginSystem.findInterface(IGui) as IGui;
        const params = { caption: "Select file to open", filter: "*.png *.jpg", options: Ui.Dialogs.Options.Usual } as Ui.Dialogs.Params;
        const filePath = gui.dialogs.selectFileToOpen(params, new Editor.Path(""));
        if (filePath.isEmpty) return;

        const imageData = FileSystem.readBytes(filePath);
        this.model.updateBackgroundTexture(Base64.encode(imageData), filePath.toString());
    }

    private generateBackground(prompt: string): void {
        if (!prompt.trim()) return;
        this.setStatus("Generating background...", true);
        const generator = new BackgroundGenerator();
        generator
            .generateBackground(prompt)
            .then((image) => {
                this.setStatus("Background generated successfully");
                const filePath = this.storageProvider.createFile(
                    new Editor.Path("background.png"),
                    Base64.decode(image),
                );
                this.model.updateBackgroundTexture(image, filePath.toString());
            })
            .catch((error) => {
                this.setStatus(String(error));
                console.error("[BackgroundToolPanel] Generation failed:", error);
            });
    }

    deinit(): void {
        for (const unsub of this.unsubs) unsub();
        this.unsubs = [];
        this.promptInput.deinit();
    }
}
