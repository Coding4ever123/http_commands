"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.http_request = void 0;
const axios_1 = require("axios");
class http_response {
}
class http_request {
    constructor() {
        this.url = "";
        this.method = "";
        this.body = "";
        this.params = {};
        this.headers = {};
        this.response = undefined;
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
    set_param(key, value) {
        if (!key || !value)
            return;
        this.params[key] = value;
    }
    async send() {
        if (!this.url) {
            return { error: "missing", element: "url" };
        }
        if (!this.method) {
            return { error: "missing", element: "method" };
        }
        let resp;
        let timestart = new Date().getTime();
        switch (this.method) {
            case "get":
                resp = await axios_1.default.get(this.url, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "post":
                resp = await axios_1.default.post(this.url, this.body, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "put":
                resp = await axios_1.default.put(this.url, this.body, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "delete":
                resp = await axios_1.default.delete(this.url, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "patch":
                resp = await axios_1.default.patch(this.url, this.body, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "options":
                resp = await axios_1.default.options(this.url, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            default:
                return { error: "missing", element: "method" };
        }
        let timeend = new Date().getTime();
        this.response = new http_response();
        this.response.response = resp;
        this.response.timings = timeend - timestart;
    }
}
exports.http_request = http_request;
