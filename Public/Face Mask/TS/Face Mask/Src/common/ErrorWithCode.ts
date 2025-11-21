export enum ErrorCode {
    Unknown = 0,
    Cancelled = 1,
    FailedWhileWaiting = 2,
    Timeout = 3,
    ViolatesCommunityGuidelines = 400,
    ReachedLimit = 429,
}

export class ErrorWithCode extends Error {
    public code: ErrorCode;

    constructor(message: string, code: ErrorCode = ErrorCode.Unknown) {
        super(message);
        this.code = code;
    }
}
