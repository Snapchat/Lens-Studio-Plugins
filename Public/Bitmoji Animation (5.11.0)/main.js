import { GuiService } from 'LensStudio:GuiService';

export class Main extends GuiService{
    static descriptor() {
        return {
            id: 'Com.Snap.BitmojiAnimationService',
            name: "Bitmoji Animation",
            description: 'Snap ML Kit / Bitmoji Animation',
            dependencies: [Editor.Model.IEntityPrototypeRegistry]
        };
    }

    start() {

    }

    stop() {

    }
}
