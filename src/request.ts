import axios, { AxiosResponse } from "axios";

class http_response {
    response?: AxiosResponse<any, any>;
    timings?: number;
    cookies?: object;
    RemoteAddress?: string;
}
export class http_request {
    url?: string = "";
    method?: string = "";
    body?: string = "";
    params?: Record<any, any> = {};
    headers?: Record<any, any> = {};
    response?: http_response | undefined = undefined;
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
    set_param(key: string | undefined, value: string | undefined): void {
        if (!key || !value) return;
        this.params![key] = value;
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
                resp = await axios.get(this.url, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "post":
                resp = await axios.post(this.url, this.body, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "put":
                resp = await axios.put(this.url, this.body, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "delete":
                resp = await axios.delete(this.url, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "patch":
                resp = await axios.patch(this.url, this.body, {
                    headers: this.headers,
                    params: this.params,
                });
                break;
            case "options":
                resp = await axios.options(this.url, {
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
