import EventEmitter from "../utils/eventEmitter.js";

import { ApiProvider, AldError, TimeoutError } from "./apiProvider.js";

const autoAcceptedTerms = ['ls_terms_1'];

export const GeneratorState = {
    "Uninitialized": 0,
    "Unauthorized": 1,
    "UnsupportedApiVersion": 2,
    "RequestedTermsAndConditions": 3,
    "Idle": 5,
    "Loading": 6,
    "Running": 7,
    "Success": 8,
    "Failed": 9,
    "ConnectionFailed": 10,
    "Any": 11
}

const BASE_URL = "https://ml.snap.com/api/genai-assets/icon";

export class Generator {
    constructor(networkingManager, authProvider) {
        this.mState = GeneratorState.Uninitialized; // construct uninitialized Generator
        this.stateChanged = new EventEmitter(); // create emmiter for state change notification
        this.iconBytes = null;
        this.networkingManager = networkingManager;
        this.authProvider = authProvider;
        this.initiated = false;
        this.apiVersion = 0;
    }

    async generateIcon(apiProvider) {
        return new Promise(async (resolve, reject) => {
            try {
                const iconData = await apiProvider.run();
                resolve(iconData);
            } catch (error) {
                reject(error);
            }
        });
    }

    async init() {
        try {
            this.changeState(GeneratorState.Loading);

            const user = await this.authProvider.me();

            if (!user) {
                this.changeState(GeneratorState.ConnectionFailed, new Error("Failed to get user information"));
                return;
            }

            await Promise.all(
                autoAcceptedTerms
                    .filter(term => !user.termsAccepted.includes(term))
                    .map(term => this.authProvider.acceptTerms(term))
            );

            const versions = await this.authProvider.versions();

            if (!versions.includes(this.apiVersion)) {
                this.changeState(GeneratorState.UnsupportedApiVersion, new Error("Unsupported API version, please update to latest version of Lens Studio."));
            } else if (versions.includes(-1)) {
                this.changeState(GeneratorState.ConnectionFailed, new Error("Failed to get API versions"));
            } else {
                this.initiated = true;
                this.changeState(GeneratorState.Idle);
            }
        } catch (error) {
            this.changeState(GeneratorState.ConnectionFailed, new Error("Initialization failed."));
        }
    }

    reset() {
        this.changeState(GeneratorState.Idle);
    }

    changeState(state, payload) {
        this.mState = state;

        this.stateChanged.emit(GeneratorState.Any, payload);
        this.stateChanged.emit(this.mState, payload);
    }

    constructPrompt(prompt, decorator) {
        let result = "An icon of ";

        if (prompt && prompt.length > 0) {
            result += prompt;
        }

        if (decorator && decorator.length > 0) {
            if (result.length > 0) {
                result += ", ";
            }

            result += decorator;
        }

        return result;
    }

    async generate(params, retry) {
        if (!this.initiated) {
            await this.init();
        }

        if (![GeneratorState.Idle, GeneratorState.Success, GeneratorState.Failed].includes(this.state)) {
            this.changeState(GeneratorState.ConnectionFailed, new Error("Generator is in wrong state (" + this.state + ")"));
            return;
        }

        try {
            const maxRetries = 3;

            this.changeState(GeneratorState.Running);

            if (!retry) {
                this.iconBytes = [];
            }
            let idx = 0;
            const apiProviderInstances = Array(params.size - this.iconBytes.length).fill().map(() => new ApiProvider(BASE_URL,
                { "positive_prompt": this.constructPrompt(params.prompt, params.promptDecorator), "frame": false }, { "stop": false }, idx++, this.networkingManager));

            const promises = apiProviderInstances.map(async (apiProvider) => {
                for (let attempt = 0; attempt < maxRetries; attempt++) {
                    try {
                        const imageData = await this.generateIcon(apiProvider);
                        return imageData;
                    } catch (error) {
                        if (error instanceof AldError || error instanceof TimeoutError) {
                            throw error;
                        }
                    }
                }
                throw new Error('Failed to fetch image after maximum retries');
            });

            const results = await Promise.all(promises);
            this.iconBytes.push(...results.filter(Boolean));

            if (this.iconBytes.length < params.size) {
                await this.generate(params, true);
            } else {
                this.changeState(GeneratorState.Success);
            }
        } catch (error) {
            this.changeState(GeneratorState.Failed, error);
        }
    }

    get state() {
        return this.mState;
    }
}
