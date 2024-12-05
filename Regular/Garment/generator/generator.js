import EventEmitter from "../application/eventEmitter.js"
import { me, versions, acceptTerms, generateGarment } from "./api.js";
import app from "../application/app.js";
import { Storage } from "../application/storage.js";

const autoAcceptedTerms = ['terms1v1', 'terms2v1'];

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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Generator {
    constructor() {
        this.mState = GeneratorState.Uninitialized; // construct uninitialized Generator
        this.stateChanged = new EventEmitter(); // create emmiter for state change notification
        this.textureBytes = null;
        this.maskBytes = null;

        app.subscribeOnAuth((authorized) => {
            if (app.plugin.isActive) {
                if (authorized) {
                    if (this.mState == GeneratorState.Unauthorized) {
                        this.verificationFlow();
                    }
                } else {
                    this.changeState(GeneratorState.Unauthorized);
                }
            }
        });
    }

    init() {
        this.verificationFlow();
    }

    reset() {
        this.changeState(GeneratorState.Uninitialized);
    }

    verificationFlow() {
        this.changeState(GeneratorState.Loading);

        if (app.authStatus) {
            me((user) => {
                if (user.statusCode != 200) {
                    this.changeState(GeneratorState.ConnectionFailed);
                    return;
                }

                user = JSON.parse(user.body.toString());

                for (const [term, accepted] of Object.entries(user.acceptedTerms)) {
                    if (!accepted) {
                        if (autoAcceptedTerms.includes(term)) {
                            acceptTerms(term, (response) => {
                                this.verificationFlow();
                            });
                        } else {
                            this.changeState(GeneratorState.RequestedTermsAndConditions);
                        }
                        return;
                    }
                }

                versions((version_list) => {
                    if (version_list.includes(app.apiVersion)) {
                        this.changeState(GeneratorState.Idle);
                    } else if (version_list.includes(-1)) {
                        this.changeState(GeneratorState.ConnectionFailed);
                    } else {
                        this.changeState(GeneratorState.UnsupportedApiVersion);
                    }
                });
            });
        } else {
            this.changeState(GeneratorState.Unauthorized);
        }
    }

    changeState(state, payload) {
        const stateToLog = {
            [GeneratorState.Failed]: () => {
                if (payload && payload.message) {
                    app.log(payload.message);
                } else {
                    app.log("Generation has been failed. Please, try again.");
                }
            },
            [GeneratorState.Running]: () => { app.log("Generating garment...", { 'enabled': true, 'progressBar': true }); },
            [GeneratorState.Success]: () => { app.log("Garment has been succesfully generated and could be imported into the project.") }
        }

        if (stateToLog[state]) {
            stateToLog[state]();
        }

        this.mState = state;

        this.stateChanged.emit(GeneratorState.Any, payload);
        this.stateChanged.emit(this.mState, payload);
    }

    async generate(params) {
        try {
            this.changeState(GeneratorState.Running);

            const seed = getRandomInt(1, Math.pow(2, 31));

            this.garmentBytes = await generateGarment(
                params.prompt,
                seed,
                params.garmentType
            );

            this.retreiveTexturesFromBytes(this.garmentBytes);

        } catch (error) {
            this.changeState(GeneratorState.Failed, error);
            return;
        }

        this.changeState(GeneratorState.Success);
    }

    retreiveTexturesFromBytes(bytes) {
        const storage = new Storage();
        const archivePath = storage.createFile("garment.zip", bytes);

        const unpackedFolder = storage.unpackContent(archivePath);

        this.textureBytes = storage.readBytes(unpackedFolder.appended("garment.png"));
        this.maskBytes = storage.readBytes(unpackedFolder.appended("mask.png"))
    }

    get state() {
        return this.mState;
    }
}
