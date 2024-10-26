import * as s from "superagent";
import { HttpStatus } from "./functions";
import { Time } from "./getTimings";
export class http_response {
    body?: string;
    headers?: Record<any, any>;
    timings?: http_response_timings = new http_response_timings();
    status?: string;
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
    report?: Function;
    url?: string = "";
    port?: number;
    method?: string = "";
    body?: string = "";
    params?: Record<any, any> = {};
    hash?: string = "";
    headers?: Record<any, any> = {};
    response?: http_response = new http_response();
    constructor() {
        this.port = 80;
    }
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
    set_param(key: string | undefined, value: string | undefined): void {
        if (!key || !value) return;
        this.params![key] = value;
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
                const endfunc = (err: s.ResponseError, res: s.Response) => {
                    if (err) {
                        reject({ error: "error", message: err.message });
                    }
                    var response = {
                        status: `${res.status} ${
                            HttpStatus[res.status.toString()]
                        }`,
                        headers: res.headers,
                        body: res.text,
                    };
                    this.response = response;
                    end = true;
                };
                const timefunc = (err: Error, t: any) => {
                    if (err instanceof Error)
                        reject({ error: "error", message: err.message });

                    this.response!.timings = t;
                    if (end) resolve(undefined);
                };
                s(this.method, url)
                    .query(this.params)
                    .set(this.headers)
                    .use(Time(timefunc, this.report))
                    .end(endfunc);
            });
            this.report(0);
        } catch (err) {
            if (err instanceof Error)
                return { error: "error", message: err.message };
        }
    }
}
