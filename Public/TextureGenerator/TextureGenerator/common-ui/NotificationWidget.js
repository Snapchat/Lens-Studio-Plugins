import { CalloutWidget } from "./CalloutWidget";
import { createColor } from "./Utils";
export class ErrorNotificationWidget extends CalloutWidget {
    constructor(parent, text) {
        super(parent, text, createColor(234, 85, 99, 255), new Editor.Path(import.meta.resolve('./Resources/error_icon.svg')));
    }
}
export class InfoNotificationWidget extends CalloutWidget {
    constructor(parent, text) {
        super(parent, text, createColor(154, 112, 205, 255), new Editor.Path(import.meta.resolve('./Resources/info.svg')));
    }
}
