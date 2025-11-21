import * as Network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';
import { ErrorCode, ErrorWithCode } from '../common/ErrorWithCode';

// Constants
const FACEMASK_GEN_URL = 'https://aws.api.snapchat.com/snapml.api.controlnet/controlnet';
const X_API_KEY = '7Kp3x9Yz';
const DEFAULT_NEGATIVE_PROMPT = 'EasyNegative, oversaturated, harsh lighting, teeth, tongue, open mouth, black and white, greyscale, lipstick, watermark, ';
const TIMEOUT_SEC = 60;
const POLL_DELAY_MS = 1000;
const RETRY_COUNT = 3;

// Job States for internal API state management
export enum JobState {
    Idle = 'Idle',
    Start = 'Start',
    Waiting = 'Waiting',
    GetOutput = 'GetOutput',
    Finished = 'Finished',
    Error = 'Error'
}

// Face Mask API Class
export class FaceMaskGenTask {
    private isDebugging: boolean = false;
    private prompt: string;
    private negativePrompt: string;
    private seed: number;
    private stopper: { stop: boolean };
    private timeoutTimer: any;
    private updateTimer: any;
    private id: string | null;
    private retry: number;
    private state: JobState;
    private promise: {
        obj: Promise<string> | null;
        resolve: ((value: string) => void) | null;
        reject: ((reason: Error) => void) | null
    };

    constructor(prompt: string, negativePrompt: string, seed: number, stopper: { stop: boolean }) {
        this.prompt = prompt;
        this.negativePrompt = negativePrompt;
        this.seed = seed;
        this.stopper = stopper;
        this.timeoutTimer = null;
        this.updateTimer = null;
        this.id = null;
        this.retry = RETRY_COUNT;
        this.state = JobState.Idle;
        this.promise = { obj: null, resolve: null, reject: null };
    }

    run(): Promise<string> {
        this.promise.obj = new Promise((resolve, reject) => {
            this.promise.resolve = resolve;
            this.promise.reject = reject;
        });
        this.start();
        return this.promise.obj;
    }

    private start() {
        this.timeoutTimer = setTimeout(() => {
            this.timeoutTimer = null;
            this.jobFailed(new ErrorWithCode('Timeout', ErrorCode.Timeout));
        }, TIMEOUT_SEC * 1000);
        this.setState(JobState.Start);
        this.update();
    }

    private async update() {
        if (this.state === JobState.Idle ||
            this.state === JobState.Finished ||
            this.state === JobState.Error) {
            return;
        }

        if (this.stopper.stop) {
            this.jobFailed(new ErrorWithCode('Cancelled', ErrorCode.Cancelled));
            return;
        }

        if (this.state === JobState.Start) {
            if (this.isDebugging) {
                this.setState(JobState.Waiting);
                this.update();
                return;
            }
            try {
                this.id = await this.runJob();
                this.setState(JobState.Waiting);
                this.updateTimer = setTimeout(() => this.update(), POLL_DELAY_MS);
            } catch (e: any) {
                this.jobFailed(e);
            }
        } else if (this.state === JobState.Waiting) {
            if (this.isDebugging) {
                this.setState(JobState.GetOutput);
                this.update();
                return;
            }
            try {
                const result = await this.checkJobStatus(this.id!);
                if (result === 'Failed') {
                    this.jobFailed(new ErrorWithCode('Job failed while waiting', ErrorCode.FailedWhileWaiting));
                } else {
                    if (result === 'Finished') {
                        this.setState(JobState.GetOutput);
                    }
                    this.updateTimer = setTimeout(() => this.update(), POLL_DELAY_MS);
                }
            } catch (e: any) {
                this.jobFailed(e);
            }
        } else if (this.state === JobState.GetOutput) {
            try {
                const output = await this.getFinalOutput(this.id!);
                this.clearTimers();
                this.setState(JobState.Finished);
                this.promise.resolve!(output);
            } catch (e: any) {
                this.jobFailed(e);
            }
        }
    }

    private setState(state: JobState) {
        this.state = state;
    }

    private clearTimers() {
        try {
            if (this.timeoutTimer) {
                clearTimeout(this.timeoutTimer);
                this.timeoutTimer = null;
            }
            if (this.updateTimer) {
                clearTimeout(this.updateTimer);
                this.updateTimer = null;
            }
        } catch (e) {}
    }

    private jobFailed(errorWithCode: ErrorWithCode) {
        this.clearTimers();

        if (this.stopper.stop) {
            this.setState(JobState.Error);
            this.promise.reject!(new ErrorWithCode('Cancelled', ErrorCode.Cancelled));
            return;
        }

        this.retry--;
        if (this.retry > 0) {
            this.start();
        } else {
            this.setState(JobState.Error);
            this.promise.reject!(errorWithCode);
        }
    }

    private getDepthMaskBase64(): string {
        const file = new Editor.Path(import.meta.resolve('./Resources/FaceMaskOpacity.jpg'));
        const contents = fs.readBytes(file);
        return Base64.encode(contents);
    }

    private runJob(): Promise<string> {
        if (this.isDebugging) {
            return new Promise((resolve, reject) => {
                resolve('debugging');
            });
        }

        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = FACEMASK_GEN_URL + '/run/with-validation';
            request.method = Network.HttpRequest.Method.Post;
            request.headers = {
                'X-API-Key': X_API_KEY,
                'Content-Type': 'application/json'
            };

            request.body = JSON.stringify({
                prompt: this.prompt,
                negative_prompt: DEFAULT_NEGATIVE_PROMPT + this.negativePrompt,
                pipeline: 'depth',
                skip_preprocess: 'true',
                run_postprocess: 'false',
                seed: this.seed.toString(),
                save_preview_image: 'false',
                use_default_image: 'false',
                width_to_height_ratio: '0.74',
                input_image: this.getDepthMaskBase64()
            });

            Network.performAuthorizedHttpRequest(request, (response: any) => {
                if (response.statusCode === 200) {
                    try {
                        const json = JSON.parse(response.body.toString());
                        if (!json.task_id) {
                            reject(new Error('FaceMask gen: missing task id in response'));
                            return;
                        }
                        resolve(json.task_id);
                    } catch (error) {
                        reject(new Error('Facemask gen: error parsing response. Please, try again'));
                    }
                } else {
                    reject(this.handleErrorFromResponse(response));
                }
            });
        });
    }

    private checkJobStatus(jobId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = FACEMASK_GEN_URL + '/status/' + jobId;
            request.method = Network.HttpRequest.Method.Get;
            request.headers = {
                'Content-Type': 'application/json'
            };

            Network.performAuthorizedHttpRequest(request, (response: any) => {
                if (response.statusCode === 200) {
                    try {
                        const json = JSON.parse(response.body.toString());
                        resolve(json.status);
                    } catch (error) {
                        reject(new Error('Facemask gen: error parsing response. Please, try again'));
                    }
                } else {
                    reject(this.handleErrorFromResponse(response));
                }
            });
        });
    }

    private getFinalOutput(jobId: string): Promise<string> {
        if (this.isDebugging) {
            return new Promise((resolve, reject) => {
                const file = new Editor.Path(import.meta.resolve('./Resources/Test.jpg'));
                const contents = fs.readBytes(file);
                resolve(Base64.encode(contents));
            });
        }

        return new Promise((resolve, reject) => {
            const request = new Network.HttpRequest();
            request.url = FACEMASK_GEN_URL + '/result/' + jobId + '/Final';
            request.method = Network.HttpRequest.Method.Get;
            request.headers = {
                'Content-Type': 'application/json'
            };

            Network.performAuthorizedHttpRequest(request, (response: any) => {
                if (response.statusCode === 200) {
                    try {
                        const json = JSON.parse(response.body.toString());
                        if (!json.image_data) {
                            reject(new Error('Missing image data'));
                        } else {
                            resolve(json.image_data);
                        }
                    } catch (error) {
                        reject(new Error('Error parsing response. Please, try again'));
                    }
                } else {
                    reject(this.handleErrorFromResponse(response));
                }
            });
        });
    }

    private handleErrorFromResponse(response: any) {
        switch (response.statusCode) {
            case 400:
                return new ErrorWithCode('Prompt does not comply with community guidelines.', ErrorCode.ViolatesCommunityGuidelines);
            case 429:
                return new ErrorWithCode('Limit reached.', ErrorCode.ReachedLimit);
            default:
                return new ErrorWithCode('Generation failed for unknown reason.', ErrorCode.Unknown);
        }
    }
}
