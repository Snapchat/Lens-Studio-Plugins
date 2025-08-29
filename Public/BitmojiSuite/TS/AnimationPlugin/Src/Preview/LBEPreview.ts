import {Widget} from "../components/common/widgets/widget.js";
import * as LensBasedEditorView from 'LensStudio:LensBasedEditorView';
import * as Ui from "LensStudio:Ui";
import {VBoxLayout} from "../components/common/layouts/vBoxLayout.js";
import {dependencyContainer, DependencyKeys} from "../DependencyContainer.js";

export class LBEPreview {

    //@ts-ignore
    private view: LensBasedEditorView.LensBasedEditorView;
    private onLbeLoadedCallback: Function[];

    constructor() {
        this.onLbeLoadedCallback = [];
    }

    create(parent: Widget): Widget {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new VBoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const initOptions = new LensBasedEditorView.InitOptions();
        let authorization: Editor.IAuthorization | undefined = undefined;
        if (dependencyContainer.has(DependencyKeys.PluginSystem)) {
            const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as Editor.PluginSystem;
            authorization = pluginSystem.findInterface(Editor.IAuthorization) as Editor.IAuthorization;
        }
        if (authorization) {
            initOptions.authorization = authorization;
        }

        this.view = LensBasedEditorView.create(initOptions, widget.toNativeWidget());
        this.view.setContentsMargins(0, 0, 0, 0);
        const imageInput = new LensBasedEditorView.ImageInput();
        imageInput.file = new Editor.Path(import.meta.resolve('./Resources/lbeBackground.png'));
        imageInput.fps = 30;
        imageInput.paused = false;

        const loadOptions = new LensBasedEditorView.LoadOptions();
        loadOptions.lens = new Editor.Path(import.meta.resolve("AnimationPreview.zip"));
        loadOptions.input = imageInput;
        loadOptions.ignoredTypes = this.ignoredTypes;
        loadOptions.useOverlayOutput = false;

        layout.addNativeWidget(this.view);
        widget.layout = layout;

        this.view.onStateChanged.connect((state) => {
            if (state === LensBasedEditorView.State.Running) {
                this.onLbeLoadedCallback.forEach((cb) => {
                    cb();
                })
            }
        })

        widget.toNativeWidget().onShow.connect(() => {
            this.view.load(loadOptions);
        })

        return widget;
    }

    sendMessage(message: any) {
        this.view.postMessage(message);
    }

    deinit() {
        if (this.view && this.view.isLoaded) {
            this.view.unload();
            //@ts-ignore
            this.view = null;
        }
    }

    addOnLbeLoadedCallback(callback: Function) {
        this.onLbeLoadedCallback.push(callback);
    }

    isLbeLoaded() {
        return this.view.isLoaded;
    }

    getState() {
        return this.view.state;
    }

    private readonly ignoredTypes = [
        "ScriptComponent",
        "AnimationPlayer",
        "AnimationMixer",
        "Animation",
        "AudioComponent",
        "AudioListenerComponent",
        "ColocatedTrackingComponent",
        "DeviceLocationTrackingComponent",
        "DeviceTracking",
        "LocatedAtComponent",
        "ManipulateComponent",
        "MarkerTrackingComponent",
        "ObjectTracking",
        "ObjectTracking3D",
        "VFXComponent",
        "MLComponent",
        "InteractionComponent",
        "MaskingComponent",
        "BodyComponent",
        "ColliderComponent",
        "ConstraintComponent",
    ];
}
