import { EventDispatcher } from "./EventDispatcher.js";

class ReactiveVariable extends EventDispatcher {
    constructor(value) {
        super();
        this._value = value;
    }

    get() {
        return this._value;
    }

    set(value) {
        this._value = value;
        this.dispatchEvent({ type: ReactiveVariable.Change, value: this._value });
    }
}

ReactiveVariable.Change = Symbol("Change");

export { ReactiveVariable };
