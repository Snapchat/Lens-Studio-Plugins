import { logger } from '../utils/FigmaUtils.js'

class AccessTokenManager {
    private readonly ACCESS_TOKEN_KEY = 'access_token'
    private readonly EXPIRATION_DATE_KEY = 'access_token_expiration'
    private readonly REFRESH_TOKEN_KEY = 'refresh_token'

    constructor() {
    }

    setAccessToken(token: string, expirationDate: string, refreshToken: string): void {
        try {
            global.secureLocalStorage.setItem(this.ACCESS_TOKEN_KEY, token)
            this.setExpirationDate(Number.parseInt(expirationDate))
            global.secureLocalStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
        } catch (e) {
            logger.error('Error setting access token:', e)
        }
    }

    /**
     * Sets the expiration date of the access token.
     * The method takes a number representing the amount of seconds until the token expires.
     * We need to convert it to the "expire at" timestamp, which is the timestamp when the token will expire.
     *
     * @param expireIn - The amount of seconds until the token expires.
     */
    setExpirationDate(expireIn: number): void {
        try {
            const expirationAt = (Date.now() + expireIn * 1000).toString()
            global.secureLocalStorage.setItem(this.EXPIRATION_DATE_KEY, expirationAt)
        } catch (e) {
            logger.error('Error setting expiration date', e)
        }
    }

    getAccessToken(): string | null {
        const token = global.secureLocalStorage.getItem(this.ACCESS_TOKEN_KEY)
        const expirationDate = global.secureLocalStorage.getItem(this.EXPIRATION_DATE_KEY)

        if (!token || !expirationDate || this.isEmptyOrWhitespace(token) || this.isEmptyOrWhitespace(expirationDate)) {
            return null
        }

        if (this.hasExpired(expirationDate)) {
            this.removeAccessToken()
            logger.warn('Access token has expired')
            return null
        }

        return token
    }

    removeAccessToken(): void {
        global.secureLocalStorage.removeItem(this.ACCESS_TOKEN_KEY)
        global.secureLocalStorage.removeItem(this.EXPIRATION_DATE_KEY)
    }

    private isEmptyOrWhitespace(str: string) {
        return !str || /^\s*$/.test(str)
    }

    private hasExpired(expiresAt: string) {
        const currentTime = Date.now()
        return currentTime > Number.parseInt(expiresAt)
    }
}

const accessTokenManager = new AccessTokenManager()
export default accessTokenManager
