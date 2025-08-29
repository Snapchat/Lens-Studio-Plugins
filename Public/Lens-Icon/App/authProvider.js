export class AuthProvider {
    constructor(networkingManager, authorization) {
        this.networkingManager = networkingManager;
        this.authorization = authorization;
    }

    async me() {
        if (!this.authorization.isAuthorized) {
            return null;
        }

        return await this.networkingManager.fetchJson('https://ml.snap.com/api/me', { authorized: true });
    }

    async versions() {
        const response = await this.networkingManager.fetchJson('https://ml.snap.com/api/versions', { authorized: true });

        if (response) {
            return response.versions;
        } else {
            return [-1];
        }
    }

    async acceptTerms(terms) {
        const response = await this.networkingManager.performAuthorizedHttpRequestAsync(this.networkingManager.createHttpRequest({
            url: 'https://ml.snap.com/api/me/terms?terms=' + terms,
            method: "PUT"
        }));

        if (response.statusCode != 204) {
            return false;
        }

        return true;
    }
}
