import { promises } from "dns";
import * as convert from "convert-units";
import { format } from "prettier";
import { join } from "path";
export const HttpStatus = {
    "200": "OK",
    "201": "Created",
    "202": "Accepted",
    "203": "Non-Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Found",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "306": "Unused",
    "307": "Temporary Redirect",
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Required",
    "413": "Request Entry Too Large",
    "414": "Request-URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Requested Range Not Satisfiable",
    "417": "Expectation Failed",
    "418": "I'm a teapot",
    "429": "Too Many Requests",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
    "505": "HTTP Version Not Supported",
};
export const prettierlist = {
    "text/css": "css",
    "text/html": "html",
    "text/xml": "xml",
    "application/javascript": "typescript",
    "application/json": "json",
};
export function get_HeaderString(
    hobj: object | Record<any, any> | undefined,
    lefttabs: number = 0,
    newlines: boolean = true
): string {
    let headerslist = Object.entries(hobj!);
    return headerslist
        .map((x) => `${" ".repeat(lefttabs)}${x[0]}=${x[1]}`)
        .join(";" + newlines ? "\n" : "");
}

export function add_protocol(url: string): string {
    url = url.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    } else {
        return "http://" + url;
    }
}
export function removeProtocol(url: string): string {
    return url.replace(/^https?:\/\//, "");
}
export async function getAddress(url: string): Promise<string | Error> {
    let thing;
    try {
        thing = await promises.lookup(removeProtocol(url), {
            family: 4,
        });
    } catch (e) {
        if (e instanceof Error) return e;
        else
            return new Error(
                "Something went wrong when trying to get error message"
            );
    }

    return thing.address;
}
export function convert_seconds(ms: number) {
    var result = convert(ms).from("ns").toBest();
    result.val = Math.round(result.val * 1e2) / 1e2; //to fix floating point and shorten the result
    return `${result.val} ${result.unit.replace("mu", "µs")}`;
}
export function convert_data(bytes: number) {
    var result = convert(bytes).from("B").toBest();
    result.val = Math.round(result.val * 1e2) / 1e2; //to fix floating point and shorten the result
    return `${result.val} ${result.unit}`;
}
export function string_to_number(str: string) {
    if (/[a-z-A-Z]/g.test(str)) {
        return NaN;
    } else return parseInt(str);
}
export function removetrailingslash(str: string) {
    return str.replace(/\/+$/, "");
}
export function sortascending(arr: Array<any>) {
    return arr.sort((n1, n2) => {
        if (n1 > n2) {
            return 1;
        }

        if (n1 < n2) {
            return -1;
        }

        return 0;
    });
}

export function cookieparse(cookie: string): Record<string, string> {
    // something like: foo=bar;baz=foo;
    let sp = cookie.split(";");
    let entries = [];
    for (let i = 0; i < sp.length; i++) {
        entries[i] = sp[i].split("=");
    }
    return Object.fromEntries(entries);
}
export async function formatcode(str: string, contenttype: string) {
    let language = prettierlist[contenttype];
    if (language)
        return await format(str, {
            parser: language,
            plugins: [join(__dirname, "xml/plugin.js")],
        });
    else return str;
}
