import * as Network from 'LensStudio:Network';
import Strings from './TokenDialogStrings.js';

const HTTP_SUCCESS = 200;

class Token {
    constructor(provider, token, timestamp) {
        this.provider = provider;
        this.token = token;
        this.timestamp = timestamp;
    }

    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return new Token(data.provider, data.token, data.timestamp);
        } catch (e) {
            return null;
        }
    }

    toJSON() {
        return JSON.stringify({
            provider: this.provider,
            token: this.token,
            timestamp: this.timestamp
        });
    }

    static fromResponse(tokenType, responseData) {
        return new Token(
            tokenType,
            responseData.token,
            responseData.timestamp
        );
    }
}

export default class TokenService {
    constructor() {
        this.TOKEN_STORAGE_KEYS = {
            OPENAI: 'smart_gate_token_data_openai',
            GOOGLE: 'smart_gate_token_data_google',
            SNAP: 'smart_gate_token_data_snap'
        };
        
        this.API_BASE_URL = 'https://gcp.api.snapchat.com/smart-gate/v2/token';
        this.DEVELOPMENT_MODE = true;
    }

    _createRequest(method, tokenType) {
        const request = new Network.HttpRequest();
        request.url = `${this.API_BASE_URL}/${tokenType}`;
        request.method = method;
        return request;
    }

    _parseResponseBody(responseBody) {
        try {
            if (typeof responseBody === 'string') {
                return JSON.parse(responseBody);
            }
            return JSON.parse(responseBody.toString());
        } catch (e) {
            throw new Error(Strings.RESPONSE_PARSE_ERROR);
        }
    }

    storeToken(tokenEntity) {
        try {
            const key = this.TOKEN_STORAGE_KEYS[tokenEntity.provider];
            if (key) {
                global.secureLocalStorage.setItem(key, tokenEntity.toJSON());
            } else {
                this._devLog('Unknown token provider:', tokenEntity.provider);
            }
        } catch (e) {
            this._devLog('Error storing token:', String(e));
        }
    }

    getStoredToken(tokenType) {
        try {
            const key = this.TOKEN_STORAGE_KEYS[tokenType];
            if (key) {
                const storedData = global.secureLocalStorage.getItem(key);
                return storedData ? Token.fromJSON(storedData) : null;
            }
            return null;
        } catch (e) {
            this._devLog('Error retrieving token:', String(e));
            return null;
        }
    }

    removeStoredToken(tokenType) {
        try {
            const key = this.TOKEN_STORAGE_KEYS[tokenType];
            if (key) {
                global.secureLocalStorage.removeItem(key);
            }
        } catch (e) {
            this._devLog('Error removing token:', String(e));
        }
    }

    generateToken(tokenType, onSuccess, onError) {
        const request = this._createRequest(Network.HttpRequest.Method.Post, tokenType);
        this._devLog('Making request to:', request.url);

        Network.performAuthorizedHttpRequest(request, response => {
            this._devLog('Response:', request.url, response.statusCode, response.body);
            
            if (response.statusCode === HTTP_SUCCESS) {
                try {
                    const jsonResponse = this._parseResponseBody(response.body);
                    
                    if (jsonResponse.token) {
                        const tokenEntity = Token.fromResponse(tokenType, jsonResponse);
                        this.storeToken(tokenEntity);
                        onSuccess(tokenEntity);
                        this._devLog("✓ Generated token for", tokenType);
                    } else {
                        onError(Strings.NO_TOKEN_IN_RESPONSE);
                        this._devLog('✗ No token in response');
                    }
                } catch (e) {
                    onError(e instanceof Error ? e.message : Strings.RESPONSE_PARSE_ERROR);
                    this._devLog('✗ Parse error:', String(e));
                }
            } else {
                onError(`${Strings.SERVER_ERROR} (${response.statusCode})`);
                this._devLog('✗ HTTP error:', response.statusCode);
            }
        });
    }

    revokeToken(tokenType, onSuccess, onError) {
        const request = this._createRequest(Network.HttpRequest.Method.Delete, tokenType);
        this._devLog('Making request to:', request.url);
        
        Network.performAuthorizedHttpRequest(request, response => {
            this._devLog('Response:', request.url, response.statusCode, response.body);
            
            if (response.statusCode === HTTP_SUCCESS) {
                try {
                    this.removeStoredToken(tokenType);
                    onSuccess();
                    this._devLog("✓ Revoked token for", tokenType);
                } catch (e) {
                    onError(e instanceof Error ? e.message : Strings.DEFAULT_ERROR_MESSAGE);
                    this._devLog('✗ Revoke error:', String(e));
                }
            } else {
                onError(`${Strings.SERVER_ERROR} (${response.statusCode})`);
                this._devLog('✗ Revoke HTTP error:', response.statusCode);
            }
        });
    }

    getTokenTypes() {
        return Object.keys(this.TOKEN_STORAGE_KEYS);
    }

    _devLog(...args) {
        if (this.DEVELOPMENT_MODE) {
            console.log('[DevLog]', ...args);
        }
    }
}

