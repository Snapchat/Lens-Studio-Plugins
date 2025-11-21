export var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Unknown"] = 0] = "Unknown";
    ErrorCode[ErrorCode["Cancelled"] = 1] = "Cancelled";
    ErrorCode[ErrorCode["FailedWhileWaiting"] = 2] = "FailedWhileWaiting";
    ErrorCode[ErrorCode["Timeout"] = 3] = "Timeout";
    ErrorCode[ErrorCode["ViolatesCommunityGuidelines"] = 400] = "ViolatesCommunityGuidelines";
    ErrorCode[ErrorCode["ReachedLimit"] = 429] = "ReachedLimit";
})(ErrorCode || (ErrorCode = {}));
export class ErrorWithCode extends Error {
    constructor(message, code = ErrorCode.Unknown) {
        super(message);
        this.code = code;
    }
}
