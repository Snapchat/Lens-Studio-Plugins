import { DialogPlugin } from 'LensStudio:DialogPlugin';
import * as Ui from 'LensStudio:Ui';
import TokenService from './TokenService.js';
import SmartGateTokenDialog from './TokenDialog.js';

export class TokenGeneratorPlugin extends DialogPlugin {
    static descriptor() {
        return {
            id: 'Com.Snap.SmartGate.TokenGenerator',
            name: 'Remote Service Gateway Token',
        };
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        this.tokenService = new TokenService();
        this.dialogUI = new SmartGateTokenDialog(this.tokenService, pluginSystem);
    }

    show(mainWindow) {
        try {
            return this.dialogUI.create(mainWindow);
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
            return new Ui.Dialog(mainWindow);
        }
    }
}
