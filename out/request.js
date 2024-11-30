"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.http_request = exports.http_response_timings = exports.http_response = void 0;
const s = require("superagent");
const fs_1 = require("fs");
const functions_1 = require("./functions");
const getTimings_1 = require("./getTimings");
class http_response {
    constructor() {
        this.timings = new http_response_timings();
    }
}
exports.http_response = http_response;
class http_response_timings {
}
exports.http_response_timings = http_response_timings;
class http_request {
    constructor() {
        this.url = "";
        this.port = 80;
        this.method = "";
        this.body = "";
        this.params = {};
        this.hash = "";
        this.headers = {};
        this.response = new http_response();
        this["content-type"] = "JSON";
    }
    set_Header(key, value) {
        if (!key || !value)
            return;
        this.headers[key] = value;
    }
    set_Headers(Headers) {
        const keys = Object.keys(Headers);
        keys.forEach((key) => {
            this.set_Header(key, Headers[key]);
        });
    }
    toJSON() {
        var jsonedObject = {};
        Object.keys(this).map((key) => {
            jsonedObject[key] = this[key];
        });
        return jsonedObject;
    }
    fromJSON(json) {
        Object.keys(json).map((key) => {
            this[key] = json[key];
        });
        return this;
    }
    set_param(key, value) {
        if (!key || !value)
            return;
        this.params[key] = value;
    }
    async send(r) {
        if (!this.url) {
            return { error: "missing", element: "url" };
        }
        if (!this.method) {
            return { error: "missing", element: "method" };
        }
        const validMethods = [
            "GET",
            "POST",
            "HEAD",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS",
        ];
        if (!validMethods.includes(this.method.toUpperCase())) {
            return { error: "invalid", element: "method" };
        }
        let url = new URL(`http://${this.url}`);
        url.port = this.port.toString();
        url.hash = this.hash;
        await new Promise((resolve, reject) => {
            var end = false;
            const endfunc = (err, res) => {
                if (err) {
                    if (!err.status) {
                        r(0);
                        throw err;
                    }
                    else if (functions_1.HttpStatus[err.status] !== err.message) {
                        r(0);
                        throw err;
                    }
                }
                this.response.status = `${res.status} ${functions_1.HttpStatus[res.status]}`;
                this.response.headers = res.headers;
                this.response.body = res.text;
                end = true;
            };
            const timefunc = (err, t) => {
                if (err) {
                    r(0);
                    throw err;
                }
                this.response.timings = t;
                if (end)
                    resolve(undefined);
            };
            if (["POST", "PUT", "PATCH"].includes(this.method.toUpperCase()))
                s(this.method, url)
                    .send(fs_1.readFileSync(this.body))
                    .query(this.params)
                    .set(this.headers)
                    .use(getTimings_1.Time(timefunc, r))
                    .end(endfunc);
            else
                s(this.method, url)
                    .query(this.params)
                    .set(this.headers)
                    .use(getTimings_1.Time(timefunc, r))
                    .end(endfunc);
        });
        r(0);
    }
}
exports.http_request = http_request;
