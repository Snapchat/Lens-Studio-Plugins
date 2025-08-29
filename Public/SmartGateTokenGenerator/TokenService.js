import * as Network from 'LensStudio:Network';

export default class TokenService {
    constructor() {
        this.STORE_TOKEN_KEY = 'smart_gate_token';
        this.API_URL = 'https://gcp.api.snapchat.com/smart-gate/v1/token';
    }

    // Storage operations
    storeToken(token) {
        try {
            global.secureLocalStorage.setItem(this.STORE_TOKEN_KEY, token);
        } catch (e) {
            console.error('Error storing token:', e.message);
        }
    }

    getStoredToken() {
        try {
            return global.secureLocalStorage.getItem(this.STORE_TOKEN_KEY);
        } catch (e) {
            console.error('Error retrieving token:', e.message);
            return null;
        }
    }

    removeStoredToken() {
        try {
            global.secureLocalStorage.removeItem(this.STORE_TOKEN_KEY);
        } catch (e) {
            console.error('Error removing token:', e.message);
        }
    }

    // Network operations
    generateToken(onSuccess, onError) {
        const request = new Network.HttpRequest();
        request.url = this.API_URL;
        request.method = Network.HttpRequest.Method.Post;

        Network.performAuthorizedHttpRequest(request, response => {
            if (response.statusCode === 200) {
                try {
                    const jsonResponse = JSON.parse(response.body.toString());
                    const token = jsonResponse.token;
                    if (token) {
                        this.storeToken(token);
                        onSuccess(token);
                    } else {
                        onError("No token found in response");
                    }
                } catch (e) {
                    onError("Error parsing response: " + e.message + ". Response body: " + response.body);
                }
            } else {
                onError(`Error: ${response.statusCode} - ${response.body}`);
            }
        });
    }

    revokeToken(onSuccess, onError) {
        const request = new Network.HttpRequest();
        request.url = this.API_URL;
        request.method = Network.HttpRequest.Method.Delete;
        Network.performAuthorizedHttpRequest(request, response => {
            if (response.statusCode === 200) {
                try {
                    this.removeStoredToken();
                    onSuccess();
                } catch (e) {
                    onError("Error parsing response: " + e.message + ". Response body: " + response.body);
                }
            } else {
                onError(`Error revoking token: ${response.statusCode} - ${response.body}`);
            }
        });
    }
}
