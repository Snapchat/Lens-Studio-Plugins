"use strict";

import * as network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';
import * as logger from './Logger.js';

const SPACE_ID = "xyb83mibqg29";
const BRANCH = "master";

export class ContentfulApi {
    constructor(authorization) {
        this.authorization = authorization;
        this.entryCache = {};
        this.assetCache = {};
        this.replies = [];
        this.tempDir = fs.TempDir.create();
    }

    clearCache() {
        this.entryCache = {};
        this.assetCache = {};
    }

    fetchEntry(id) {
        return new Promise((resolve,reject) => {
            this.fetchEntryImpl(id, response => {
                resolve(response);
            });
        });
    }

    fetchAsset(id) {
        return new Promise((resolve,reject) => {
            this.fetchAssetImpl(id, response => {
                resolve(response);
            });
        });
    }

    fetchEntryImpl(id, callback) {
        // return entry from cache if exists
        if (this.entryCache[id]) {
            logger.log("fetching entry ("+id+") from cache");
            callback({
                success: true,
                response: this.entryCache[id]
            });
            return;
        }
        const request = new network.HttpRequest();
        request.url = `https://gcp.api.snapchat.com/contentful/spaces/${SPACE_ID}/environments/${BRANCH}/entries/${id}`;
        request.method = network.HttpRequest.Method.Get;
        request.contentType = "application/json";
        request.authorization = this.authorization;
        request.headers = {
            'token_id' : 'LENS_STUDIO_ANIMATION_TOOL_CONTENTFUL_TOKEN'
        }


        const cache = this.entryCache;
        let response = "";
        const reply = network.performHttpRequestWithReply(request);
        this.replies.push(reply);
        reply.onError.connect((httpResult) => {
            callback({success: false});
        });
        reply.onData.connect((data) => {
            response += data.toString();
        });
        reply.onEnd.connect((httpResult) => {
            if (httpResult.statusCode !==  200) {
                callback({success: false});
                return;
            }
            try {
                const json = JSON.parse(response);
                cache[id] = json;
                callback({
                    success: true,
                    response: json
                });
            }
            catch(e) {
                logger.warn("cannot fetch entry with id: "+id);
                logger.warn("Response BODY: " + response);
                logger.warn(e);
                callback({success: false});
            }
        });
    }

    fetchAssetImpl(id, callback) {
        // return entry from cache if exists
        if (this.assetCache[id]) {
            logger.log("fetching asset ("+id+") from cache");
            callback({
                success: true,
                path: this.assetCache[id]
            });
            return;
        }

        logger.log("fetching asset ("+id+") from server");
        const request = new network.HttpRequest();

        request.url = `https://gcp.api.snapchat.com/contentful/spaces/${SPACE_ID}/environments/${BRANCH}/assets/${id}`;
        request.method = network.HttpRequest.Method.Get;
        request.contentType = "application/json";
        request.authorization = this.authorization;
        request.headers = {
            'token_id' : 'LENS_STUDIO_ANIMATION_TOOL_CONTENTFUL_TOKEN'
        }

        const assetCache = this.assetCache;
        const downloadAsset = this.downloadAsset.bind(this);
        const reply = network.performHttpRequestWithReply(request);
        let response = "";
        this.replies.push(reply);
        reply.onError.connect((httpResult) => {
            callback({success: false});
        });
        reply.onData.connect((data) => {
            response += data.toString();

        });
        reply.onEnd.connect((httpResult) => {
            if (httpResult.statusCode !==  200) {
                callback({success: false});
                return;
            }

            try {
                const json = JSON.parse(response);
                const url = json.fields.file.url;
                if (!url) {
                    logger.warn("could not find url for asset id: "+id);
                    callback({success: false});
                    return;
                }

                const filename = json.fields.file.fileName;
                downloadAsset("http:"+url, filename, function(response) {
                    if (!response.success) {
                        callback({success:false});
                        return;
                    }

                    assetCache[id] = response.path;
                    callback({
                        success: true,
                        path: assetCache[id]
                    });
                });
            }
            catch(e) {
                logger.warn("cannot fetch asset entry with id: "+id);
                logger.warn(e);
                callback({success: false});
            }
        });
    }

    downloadAsset(url, filename, callback) {
        const request = new network.HttpRequest();
        request.url = url;
        request.method = network.HttpRequest.Method.Get;
        request.contentType = "application/octet-stream";

        const tempDir = this.tempDir;
        network.performHttpRequest(request, function(response) {
            try {
                const path = tempDir.path.appended(new Editor.Path(filename));
                fs.writeFile(path, response.body.toBytes());
                callback({
                    success: true,
                    path: path.toString()
                });
            }
            catch(e) {
                logger.warn("cannot download asset file with url: "+url);
                logger.warn(e);
                callback({success: false});
            }
        });
    }
}
