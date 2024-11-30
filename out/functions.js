"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileName = exports.cleartemp = exports.cleardirs = exports.removedir = exports.tofixed = exports.fund = exports.getEnv = exports.makedirs = exports.formatcode = exports.cookieparse = exports.sortascending = exports.removetrailingslash = exports.string_to_number = exports.convertBest = exports.getAddress = exports.openifexists = exports.quickpick = exports.returnifexists = exports.removeProtocol = exports.add_protocol = exports.get_HeaderString = exports.prettierlist = exports.HttpStatus = exports.FILEextensions = exports.quickpickoptions = void 0;
const dns_1 = require("dns");
const convert = require("convert-units");
const prettier_1 = require("prettier");
const path_1 = require("path");
const vscode = require("vscode");
const fs = require("fs");
const extension_1 = require("./extension");
let type = "application/x-www-form-urlencoded";
const funding = {
    Github: "https://github.com/sponsors/coding4ever123",
    "ko fi": "https://ko-fi.com/adrianfolie",
    "buy me a coffee": "https://buymeacoffee.com/adrianfolie",
};
exports.quickpickoptions = {
    ignoreFocusOut: true,
};
exports.FILEextensions = {
    JSON: { fileext: "JSON", type: "application/json" },
    HTML: { fileext: "HTML", type: "text/html" },
    XML: { fileext: "XML", type: "application/xml" },
    TEXT: { fileext: "TXT", type: "text/plain" },
    "FORM URL encoded": { fileext: "ENV", type: type },
};
exports.HttpStatus = {
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
exports.prettierlist = {
    "text/css": "css",
    "text/html": "html",
    "text/xml": "xml",
    "application/javascript": "typescript",
    "application/json": "json",
};
function get_HeaderString(hobj, lefttabs = 0, newlines = true) {
    let headerslist = Object.entries(hobj);
    return headerslist
        .map((x) => `${" ".repeat(lefttabs)}${x[0]}=${x[1]}`)
        .join(";" + newlines ? "\n" : "");
}
exports.get_HeaderString = get_HeaderString;
function add_protocol(url) {
    url = url.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    else {
        return "http://" + url;
    }
}
exports.add_protocol = add_protocol;
function removeProtocol(url) {
    return url.replace(/^https?:\/\//, "");
}
exports.removeProtocol = removeProtocol;
function returnifexists(str) {
    if (["", "(undefined)"].includes(str.trim()))
        return "";
    return `: ${str}`;
}
exports.returnifexists = returnifexists;
async function quickpick(stritems) {
    let items = [];
    stritems.map((item) => {
        let split = item.split(": ");
        let label = split.shift();
        items.push({ label, description: split.join(": ") });
        if (label == "+")
            items.push({ kind: vscode.QuickPickItemKind.Separator });
    });
    let result = await new Promise((resolve, reject) => {
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
    if (!result)
        return;
    return `${result.label}${result.description ? ": " + result.description : ""}`;
}
exports.quickpick = quickpick;
function openifexists(path) {
    if (!fs.existsSync(path))
        return "";
    return fs.readFileSync(path).toString();
}
exports.openifexists = openifexists;
async function getAddress(url) {
    let thing;
    try {
        thing = await dns_1.promises.lookup(removeProtocol(url), {
            family: 4,
        });
    }
    catch (e) {
        if (e instanceof Error)
            return e;
        else
            return new Error("Something went wrong when trying to get error message");
    }
    return thing.address;
}
exports.getAddress = getAddress;
function convertBest(unit, i) {
    var result = convert(i).from(unit).toBest();
    return `${tofixed(result.val, 2)} ${result.unit.replace("mu", "µs")}`;
}
exports.convertBest = convertBest;
function string_to_number(str) {
    if (/[a-z-A-Z]/g.test(str)) {
        return NaN;
    }
    else
        return parseInt(str);
}
exports.string_to_number = string_to_number;
function removetrailingslash(str) {
    return str.replace(/\/+$/, "");
}
exports.removetrailingslash = removetrailingslash;
function sortascending(arr) {
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
exports.sortascending = sortascending;
function cookieparse(cookie) {
    // something like: foo=bar;baz=foo;
    let sp = cookie.split(";");
    let entries = [];
    for (let i = 0; i < sp.length; i++) {
        entries[i] = sp[i].split("=");
    }
    return Object.fromEntries(entries);
}
exports.cookieparse = cookieparse;
async function formatcode(str, contenttype) {
    let language = exports.prettierlist[contenttype];
    if (language)
        return await prettier_1.format(str, {
            parser: language,
            plugins: [path_1.join(__dirname, "xml/plugin.js")],
        });
    else
        return str;
}
exports.formatcode = formatcode;
function makedirs(...dirs) {
    dirs.map((p) => {
        if (!fs.existsSync(p))
            fs.mkdirSync(p);
    });
}
exports.makedirs = makedirs;
function getEnv(name) {
    return process.env[name] || "";
}
exports.getEnv = getEnv;
async function fund() {
    const response = await new Promise((resolve) => {
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
    if (response)
        vscode.env.openExternal(funding[response.label]);
}
exports.fund = fund;
function tofixed(num, digits) {
    let multiplier = 10 ** digits;
    multiplier = multiplier === 0 ? 1 : multiplier;
    return Math.round(num * multiplier) / multiplier;
}
exports.tofixed = tofixed;
function removedir(p) {
    fs.rmSync(p, { force: true, recursive: true });
}
exports.removedir = removedir;
function cleardirs(dir) {
    dir.map((dir) => {
        removedir(dir);
        makedirs(dir);
    });
}
exports.cleardirs = cleardirs;
function cleartemp() {
    cleardirs([extension_1.inputpath]);
    vscode.window.showInformationMessage("Successfully cleared temporary files");
}
exports.cleartemp = cleartemp;
function getFileName(type) {
    return (new Date().getTime().toString() +
        "-----BODY." +
        exports.FILEextensions[type].fileext);
}
exports.getFileName = getFileName;
