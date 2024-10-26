"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatcode = exports.cookieparse = exports.sortascending = exports.removetrailingslash = exports.string_to_number = exports.convert_data = exports.convert_seconds = exports.getAddress = exports.removeProtocol = exports.add_protocol = exports.get_HeaderString = exports.prettierlist = exports.HttpStatus = void 0;
const dns_1 = require("dns");
const convert = require("convert-units");
const prettier_1 = require("prettier");
const path_1 = require("path");
exports.HttpStatus = {
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
function convert_seconds(ms) {
    var result = convert(ms).from("ns").toBest();
    result.val = Math.round(result.val * 1e2) / 1e2; //to fix floating point and shorten the result
    return `${result.val} ${result.unit.replace("mu", "µs")}`;
}
exports.convert_seconds = convert_seconds;
function convert_data(bytes) {
    var result = convert(bytes).from("B").toBest();
    result.val = Math.round(result.val * 1e2) / 1e2; //to fix floating point and shorten the result
    return `${result.val} ${result.unit}`;
}
exports.convert_data = convert_data;
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
