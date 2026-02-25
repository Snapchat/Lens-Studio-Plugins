export class Console {
    constructor(impl) {
        this.impl = impl;
    }

    info(...data) {
        this.impl.info(...data);
    }

    log(...data) {
        this.impl.log(...data);
    }

    warn(...data) {
        this.impl.warn(...data);
    }

    error(...data) {
        this.impl.error(...data);
    }
}
