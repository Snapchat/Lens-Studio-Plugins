/**
 * @beta
 * @hidden
 */
declare module "LensStudio:LensBasedEditorView" {
    import type { Widget } from "LensStudio:Ui"

    enum State {
        Idle,
        Loading,
        Running,
    }

    class ImageInput {
        file: string
        paused: boolean
        fps: number
    }

    class VideoInput {
        file: string
        paused: boolean
        sequential: boolean
    }

    interface InputControl extends ScriptObject {
        pause(): void
        resume(): void
    }

    class LoadOptions {
        lens: Editor.Path
        input: ImageInput | VideoInput
        ignoredTypes: string[]
        useOverlayOutput: boolean
    }

    interface LBEView extends Widget {
        load(options: LoadOptions): void
        unload(): void
        reload(): void
        pause(): void
        resume(): void
        postMessage(value: object): void
        deviceType: Editor.Model.DeviceType
        mlIndex: number
        readonly isLoaded: boolean
        readonly isPaused: boolean
        readonly state: State
        readonly onMessage: signal1<{ data: object }, void>
        readonly onStateChanged: signal1<State, void>
        readonly input: InputControl
    }

    class InitOptions {
        authorization: Editor.IAuthorization
    }

    function create(options: InitOptions, parent: Widget): LBEView
}
