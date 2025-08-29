export var StateKeys;
(function (StateKeys) {
    StateKeys["IsUserAuthenticated"] = "isUserAuthenticated";
    StateKeys["IsDialogShown"] = "isDialogShown";
})(StateKeys || (StateKeys = {}));
class StateManager {
    constructor() {
        this.states = {
            [StateKeys.IsUserAuthenticated]: false,
            [StateKeys.IsDialogShown]: false,
        };
    }
    updateState(stateName, value) {
        this.states[stateName] = value;
    }
    getStateValue(stateName) {
        return this.states[stateName];
    }
}
export const stateManager = new StateManager();
