
const CHATGPT_REMOTE_API = 'cc47fc32-77d1-455f-a674-da3d520d98e9';
class RemoteAPIHelper {

    constructor(remoteServiceModule, fileSystem) {
        this.remoteServiceModule = remoteServiceModule;
        this.fileSystem = fileSystem;
    }

    async runJob(request) {
        console.log("Running job with request:", JSON.stringify(request, null, 2));

        return new Promise((resolve, reject) => {
            if (!this.remoteServiceModule) {
                reject(new Error('RemoteApi module not loaded'));
                return;
            }

            const gptRequest = this.generateGptRequestFromContent(request);

            // Create the remote API request
            const remoteApiRequest = this.remoteServiceModule.RemoteApiRequest.create();
            remoteApiRequest.specId = CHATGPT_REMOTE_API;
            remoteApiRequest.endpoint = 'completions';
            remoteApiRequest.body = JSON.stringify(gptRequest);

            console.log("Generating AiMetadata stub...");

            // Make the request to the remote API
            this.remoteServiceModule.performApiRequest(remoteApiRequest, function (response) {
                if (response.statusCode == 1) {
                    try {
                        console.log("Received AiMetadata stub.");

                        const data = JSON.parse(response.body.toString());

                        if (
                            data
                            && data.choices
                            && data.choices.length > 0
                            && data.choices[0].message
                            && data.choices[0].message.content
                        ) {
                            resolve(data.choices[0].message.content);
                        }

                    } catch (e) {
                        console.log("Error parsing response:", e);
                        reject(new Error('Error while parsing response: ' + e));
                    }
                } else if (response.statusCode == 4) {
                    reject(new Error('Access denied'));
                } else {
                    reject(new Error('Unknown error in response from server: ' + response.statusCode));
                }
            });
        });
    }

    generateGptRequestFromContent(content) {
        return {
            "temperature": 0,
            "messages": [
                {"role": "user", "content": JSON.stringify(content)}
            ]
        };
    }
}

export default RemoteAPIHelper;
