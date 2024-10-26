"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.http_request = exports.http_response_timings = exports.http_response = void 0;
const s = require("superagent");
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
        this.method = "";
        this.body = "";
        this.params = {};
        this.hash = "";
        this.headers = {};
        this.response = new http_response();
        this.port = 80;
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
    async send(r) {
        this.report = r;
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
        try {
            await new Promise((resolve, reject) => {
                var end = false;
                const endfunc = (err, res) => {
                    if (err) {
                        reject({ error: "error", message: err.message });
                    }
                    var response = {
                        status: `${res.status} ${functions_1.HttpStatus[res.status.toString()]}`,
                        headers: res.headers,
                        body: res.text,
                    };
                    this.response = response;
                    end = true;
                };
                const timefunc = (err, t) => {
                    if (err instanceof Error)
                        reject({ error: "error", message: err.message });
                    this.response.timings = t;
                    if (end)
                        resolve(undefined);
                };
                s(this.method, url)
                    .query(this.params)
                    .set(this.headers)
                    .use(getTimings_1.Time(timefunc, this.report))
                    .end(endfunc);
            });
            this.report(0);
        }
        catch (err) {
            if (err instanceof Error)
                return { error: "error", message: err.message };
        }
    }
}
exports.http_request = http_request;
