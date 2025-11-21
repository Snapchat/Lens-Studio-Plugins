import * as Ui from "LensStudio:Ui";
import { CalloutWidget } from "./CalloutWidget";
import { createColor } from "./Utils";
import { logEventLinkOpen } from "../common/Analytics";

class GuidelineAndTermsWidget extends CalloutWidget {
    constructor(parent: Ui.Widget, text: string, link: string) {
        super(
            parent,
            text,
            createColor(68, 74, 85, 255),
            new Editor.Path(import.meta.resolve('./Resources/info.svg'))
        );

        this.label.openExternalLinks = true;
        this.label.onClick.connect(() => { logEventLinkOpen(link) });
    }
}

export function createGuidelinesWidget(parent: Ui.Widget): Ui.Widget {
    const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/face-mask';
    const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
    const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices and usage guidelines.';
    return new GuidelineAndTermsWidget(parent, guideLinesText, guidelinesLink);
}

export function createTermsWidget(parent: Ui.Widget): Ui.Widget {
    const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
    const termsUrlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);
    const termsText = 'By using the feature, you agree to our ' + termsUrlString + '.';
    return new GuidelineAndTermsWidget(parent, termsText, termsLink);
}
