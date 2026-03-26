export class RequestTokenManager {
    constructor() {
        this.validRequestTokens = [];
        this.incrementalTokenId = 0;
    }

    generateToken() {
        const result = this.incrementalTokenId;
        this.validRequestTokens.push(result);
        this.incrementalTokenId += 1;

        return result;
    }

    isValid(token) {
        return this.validRequestTokens.includes(token);
    }

    invalidateToken(token) {
        this.validRequestTokens = this.validRequestTokens.filter(item => item !== token);
    }

    invalidateTokenAll() {
        this.validRequestTokens = [];
    }
}
