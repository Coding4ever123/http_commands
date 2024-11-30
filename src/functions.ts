import { promises } from "dns";
import * as convert from "convert-units";
import { format } from "prettier";
import { join } from "path";
import * as vscode from "vscode";
import * as fs from "fs";
import { historypath, inputpath } from "./extension";
let type = "application/x-www-form-urlencoded";
const funding = {
    Github: "https://github.com/sponsors/coding4ever123",
    "ko fi": "https://ko-fi.com/adrianfolie",
    "buy me a coffee": "https://buymeacoffee.com/adrianfolie",
};
export const quickpickoptions = {
    ignoreFocusOut: true,
};
export const FILEextensions = {
    JSON: { fileext: "JSON", type: "application/json" },
    HTML: { fileext: "HTML", type: "text/html" },
    XML: { fileext: "XML", type: "application/xml" },
    TEXT: { fileext: "TXT", type: "text/plain" },
    "FORM URL encoded": { fileext: "ENV", type: type },
};
export const HttpStatus = {
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "Unused",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Required",
    413: "Request Entry Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    429: "Too Many Requests",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
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
export function returnifexists(str: string | undefined) {
    if (["", "(undefined)"].includes(str.trim())) return "";
    return `: ${str}`;
}
export async function quickpick(stritems: string[]): Promise<string> {
    let items = [];
    stritems.map((item) => {
        let split = item.split(": ");
        let label = split.shift();
        items.push({ label, description: split.join(": ") });
        if (label == "+")
            items.push({ kind: vscode.QuickPickItemKind.Separator });
    });
    let result: vscode.QuickPickItem = await new Promise((resolve, reject) => {
        const a = vscode.window.createQuickPick();
        a.ignoreFocusOut = true;
        a.items = items;
        a.onDidAccept(() => {
            resolve(a.selectedItems[0]);
            a.dispose();
        });
        a.onDidHide(() => {
            resolve(undefined);
        });
        a.show();
    });
    if (!result) return;
    return `${result.label}${result.description ? ": " + result.description : ""}`;
}
export function openifexists(path: string) {
    if (!fs.existsSync(path)) return "";
    return fs.readFileSync(path).toString();
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
export function convertBest(unit: convert.Unit, i) {
    var result = convert(i).from(unit).toBest();
    return `${tofixed(result.val, 2)} ${result.unit.replace("mu", "µs")}`;
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
export function makedirs(...dirs: string[]) {
    dirs.map((p) => {
        if (!fs.existsSync(p)) fs.mkdirSync(p);
    });
}
export function getEnv(name: string) {
    return process.env[name] || "";
}
export async function fund() {
    const response: vscode.QuickPickItem = await new Promise((resolve) => {
        const a = vscode.window.createQuickPick();
        a.items = Object.keys(funding).map((key) => ({
            label: key,
            description: funding[key].replace("https://", ""),
        }));
        a.onDidAccept(() => {
            resolve(a.selectedItems[0]);
            a.dispose();
        });
        a.onDidHide(() => {
            resolve(undefined);
        });
        a.show();
    });
    if (response) vscode.env.openExternal(funding[response.label]);
}
export function tofixed(num: number, digits: number) {
    let multiplier = 10 ** digits;
    multiplier = multiplier === 0 ? 1 : multiplier;
    return Math.round(num * multiplier) / multiplier;
}
export function removedir(p: fs.PathLike) {
    fs.rmSync(p, { force: true, recursive: true });
}
export function cleardirs(dir: string[]) {
    dir.map((dir) => {
        removedir(dir);
        makedirs(dir);
    });
}
export function cleartemp() {
    cleardirs([inputpath]);
    vscode.window.showInformationMessage(
        "Successfully cleared temporary files"
    );
}
export function getFileName(type) {
    return (
        new Date().getTime().toString() +
        "-----BODY." +
        FILEextensions[type].fileext
    );
}
