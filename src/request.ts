import * as s from "superagent";
import { readFileSync } from "fs";
import { HttpStatus } from "./functions";
import { Time } from "./getTimings";
export class http_response {
    body?: string;
    headers: Record<any, any>;
    timings?: http_response_timings = new http_response_timings();
    status: string;
}
export class http_response_timings {
    socketAssigned?: number;
    dnsLookup?: number;
    tcpConnection?: number;
    tlsHandshake?: number;
    firstByte?: number;
    contentTransfer?: number;
    total?: number;
}

export class http_request {
    url: string = "";
    port: number = 80;
    method: string = "";
    body: string = "";
    params: Record<any, any> = {};
    hash: string = "";
    headers: Record<any, any> = {};
    readonly response: http_response = new http_response();
    "content-type" = "JSON";
    constructor() {}
    set_Header(key: string | undefined, value: string | undefined): void {
        if (!key || !value) return;
        this.headers![key] = value;
    }
    set_Headers(Headers: Record<string, string>) {
        const keys = Object.keys(Headers);
        keys.forEach((key) => {
            this.set_Header(key, Headers[key]);
        });
    }
    toJSON(): Record<string, string> {
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

    set_param(key: string | undefined, value: string | undefined): void {
        if (!key || !value) return;
        this.params![key] = value;
    }

    async send(r: Function) {
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
            const endfunc = (err: s.ResponseError, res: s.Response) => {
                if (err) {
                    if (!err.status) {
                        r(0);
                        throw err;
                    } else if (HttpStatus[err.status] !== err.message) {
                        r(0);
                        throw err;
                    }
                }
                this.response.status = `${res.status} ${HttpStatus[res.status]}`;
                this.response.headers = res.headers;
                this.response.body = res.text;
                end = true;
            };
            const timefunc = (err: Error, t: any) => {
                if (err) {
                    r(0);
                    throw err;
                }

                this.response.timings = t;
                if (end) resolve(undefined);
            };
            if (["POST", "PUT", "PATCH"].includes(this.method.toUpperCase()))
                s(this.method, url)
                    .send(readFileSync(this.body))
                    .query(this.params)
                    .set(this.headers)
                    .use(Time(timefunc, r))
                    .end(endfunc);
            else
                s(this.method, url)
                    .query(this.params)
                    .set(this.headers)
                    .use(Time(timefunc, r))
                    .end(endfunc);
        });
        r(0);
    }
}
