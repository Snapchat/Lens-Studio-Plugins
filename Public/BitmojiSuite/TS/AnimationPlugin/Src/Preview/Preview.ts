import * as Ui from "LensStudio:Ui";
import {Widget} from "../components/common/widgets/widget.js";
import {VBoxLayout} from "../components/common/layouts/vBoxLayout.js";
import {LBEPreview} from "./LBEPreview.js";
import {dependencyContainer, DependencyKeys} from "../DependencyContainer.js";
import {AnimationImporter} from "../AnimationImporter.js";
import {AnimationLibrary} from "../Menu/AnimationLibrary.js";
import {logEventImport} from "../analytics.js";

export class Preview {

    private lbePreview: LBEPreview;
    private animationImporter: AnimationImporter;
    private importButton: Ui.PushButton | undefined;
    private fbxPath: Editor.Path | undefined;
    private category: string = "";

    constructor() {
        this.lbePreview = new LBEPreview();
        this.animationImporter = new AnimationImporter();
        dependencyContainer.register(DependencyKeys.LBEPreview, this.lbePreview);
    }

    create(parent: Widget): Widget {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.setMinimumWidth(324);

        const layout = new VBoxLayout()
        layout.setDirection(Ui.Direction.BottomToTop)
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        layout.addWidgetWithStretch(this.createFooter(widget), 0, Ui.Alignment.AlignBottom);
        layout.addWidget(this.lbePreview.create(widget));

        widget.layout = layout;

        return widget;
    }

    private createFooter(parent: Widget): Widget {
        const widget = new Widget(parent);
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.autoFillBackground = true;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        widget.setFixedHeight(56);

        const layout = new VBoxLayout()
        layout.setContentsMargins(16, 0, 16, 0);
        layout.spacing = 0;

        this.importButton = new Ui.PushButton(widget.toNativeWidget());
        this.importButton.text = 'Apply';
        this.importButton.primary = true;
        this.importButton.enabled = false;

        this.importButton.onClick.connect(() => {
            if (this.fbxPath) {
                if (this.importButton) {
                    this.importButton.enabled = false;
                }
                this.animationImporter.importToProject(this.fbxPath);
                logEventImport(this.category + "_BITMOJI");
                //@ts-ignore
                dependencyContainer.get(DependencyKeys.Main).editWithBitmojiComponent();
                (dependencyContainer.get(DependencyKeys.AnimationLibrary) as AnimationLibrary).clearSelection();
            }
        })

        layout.addNativeWidgetWithStretch(this.importButton, 0, Ui.Alignment.AlignRight);

        widget.layout = layout;

        return widget;
    }

    onAnimationSelected(path: Editor.Path, category: string) {
        this.category = category;
        this.fbxPath = path;
        if (this.importButton) {
            this.importButton.enabled = true;
        }
    }

    onAnimationLoadStart() {
        this.fbxPath = undefined;
        if (this.importButton) {
            this.importButton.enabled = false;
        }
    }
}
