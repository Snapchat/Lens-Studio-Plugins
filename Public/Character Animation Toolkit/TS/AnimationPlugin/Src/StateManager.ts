// @ts-nocheck
export enum StateKeys {
    IsUserAuthenticated = 'isUserAuthenticated',
    IsDialogShown = 'isDialogShown',
}

class StateManager {
    private states: { [key in StateKeys]: boolean } = {
        [StateKeys.IsUserAuthenticated]: false,
        [StateKeys.IsDialogShown]: false,
    };

    public updateState(stateName: StateKeys, value: boolean): void {
        this.states[stateName] = value;
    }

    public getStateValue(stateName: StateKeys): boolean {
        return this.states[stateName];
    }
}

export const stateManager = new StateManager();
