export class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = "TimeoutError";
    }
}

export class AldError extends Error {
    constructor(message) {
        super(message);
        this.name = "AldError";
    }
}

const getUrlString = (url, text) => {
    return `<a href="${url}" style="">${text}</a>`;
}

const RETRY_COUNT = 3;
const RETRY_COOLDOWN_SEC = 1;
const TIMEOUT_SEC = 180;
const POLL_DELAY_MS = 500;

const GeneratorState = {
    'Idle': 0,
    'Start': 1,
    'Waiting': 2,
    'Finished': 3,
    'Error': 4
};

export class ApiProvider {
    constructor(url, parameters, stopper, index, networkingManager) {
        this.url = url;
        this.parameters = parameters;
        this.stopper = stopper;
        this.timeoutTimer = null;
        this.updateTimer = null;
        this.id = null;
        this.retry = RETRY_COUNT;
        this.state = GeneratorState.Idle;
        this.promise = { obj: null, resolve: null, reject: null };
        this.index = index;
        this.networkingManager = networkingManager;
    }

    async run() {
        this.promise.obj = new Promise((resolve, reject) => {
            this.promise.resolve = resolve;
            this.promise.reject = reject;
        });
        this.start(0);
        return this.promise.obj;
    }

    start(delaySec) {
        this.timeoutTimer = setTimeout(() => {
            this.timeoutTimer = null;
            this.jobFailed(new TimeoutError("Timeout Error"));
        }, TIMEOUT_SEC * 1000);
        this.setState(GeneratorState.Start);

        this.delayUpdate(delaySec);
    }

    delayUpdate(delaySec) {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }

        this.updateTimer = setTimeout(this.update.bind(this), delaySec);
    }

    async update() {
        if (this.state == GeneratorState.Idle || this.state == GeneratorState.Finished || this.state == GeneratorState.Error) {
            return;
        }

        if (this.stopper.stop) {
            this.jobFailed(new Error("Cancelled"));
            return;
        }

        if (this.state == GeneratorState.Start) {
            try {
                this.id = await this.runJob(this.url, this.parameters);
                this.setState(GeneratorState.Waiting);
                this.delayUpdate(POLL_DELAY_MS);
            } catch (e) {
                this.jobFailed(e);
            }
        } else if (this.state == GeneratorState.Waiting) {
            try {
                const result = await this.checkJobStatus(this.url, this.id);
                if (result.status == 'RUNNING') {
                    this.delayUpdate(POLL_DELAY_MS);
                    return;
                } else if (result.status == 'FAILED') {
                    return this.jobFailed('Generation failed');
                } else if (result.status != 'SUCCESS') {
                    return this.jobFailed('Unknown status returned: ' + result.status);
                }

                const output = await this.getGeneratorOutputs(result.result);

                this.clearTimers();
                this.setState(GeneratorState.Finished);

                this.promise.resolve(output);
            } catch (e) {
                this.jobFailed(e);
            }
        }
    }

    setState(state) {
        this.state = state;
    }

    clearTimers() {
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
    }

    jobFailed(reason) {
        this.clearTimers();

        if (this.stopper.stop) {
            this.setState(GeneratorState.Error);
            this.promise.reject(reason);
            return;
        }

        this.retry--;

        if (this.retry == 0 || reason instanceof TimeoutError || reason instanceof AldError) {
            this.setState(GeneratorState.Error);
            this.promise.reject(reason);
        } else {
            this.start(RETRY_COOLDOWN_SEC);
        }
    }

    async runJob(url, parameters) {
        const response = await this.networkingManager.performAuthorizedHttpRequestAsync(this.networkingManager.createHttpRequest({
            url,
            method: "POST",
            body: JSON.stringify(parameters),
            contentType: 'application/json'
        }));

        if (response.statusCode == 200) {
            try {
                const json = JSON.parse(response.body.toString());
                if (!json.id) {
                    throw new Error('<center>Failed to retrieve generated icon</center>');
                }
                return json.id;
            } catch (error) {
                throw new Error('<center>Failed to retrieve generated icon</center>');
            }
        } else if (response.statusCode == 400) {
            throw new AldError("<center>The result violates " + getUrlString("https://values.snap.com/privacy/transparency/community-guidelines", "community guidelines") + ".</center><center>Please, try another prompt.</center>");
        } else if (response.statusCode == 422) {
            throw new Error('<center>Failed to validate generation request.</center>');
        } else if (response.statusCode == 429) {
            throw new Error('<center>You\'ve reached the limit. Please, try again later</center>');
        } else {
            throw new Error('<center>Failed to generate icon - error code: ' + response.statusCode + "</center>");
        }
    };

    async checkJobStatus(url, jobId) {
        const response = await this.networkingManager.performAuthorizedHttpRequestAsync(this.networkingManager.createHttpRequest({
            url: url + '/' + jobId,
            method: "GET",
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }));

        if (response.statusCode == 200) {
            try {
                const json = JSON.parse(response.body.toString());
                return json;
            } catch (error) {
                throw new Error('<center>Failed to retrieve generated icon</center>');
            }
        } else if (response.statusCode == 400) {
            throw new AldError("<center>The result violates " + getUrlString("https://values.snap.com/privacy/transparency/community-guidelines", "community guidelines") + ".</center><center>Please, try another prompt.</center>");
        } else if (response.statusCode == 429) {
            throw new Error('<center>You\'ve reached the limit. Please, try again later</center>');
        } else {
            throw new Error('<center>Failed to generate icon - error code: ' + response.statusCode + "</center>");
        }
    }

    async getGeneratorOutputs(url) {
        const response = await this.networkingManager.fetch(url, { type: "string" });
        if (response.length == 0) {
            throw new Error('Failed to generate icon, please try again!');
        }

        const result = JSON.parse(response);

        if (result['nsfw_checker']) {
            const nsfwStatus = String.fromCharCode.apply(null, Base64.decode(result['nsfw_checker']));
            if (nsfwStatus == 'True') {
                throw new AldError("<center>The result violates " + getUrlString("https://values.snap.com/privacy/transparency/community-guidelines", "community guidelines") + ".</center><center>Please, try another prompt.</center>");
            }
            delete result['nsfw_checker'];

        }

        return Base64.decode(result["image"]);
    }
}
