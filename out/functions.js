"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieparse = exports.sortascending = exports.getAddress = exports.removeProtocol = exports.add_protocol = exports.getNonce = exports.get_HeaderString = void 0;
const dns_1 = require("dns");
function get_HeaderString(hobj, lefttabs = 0, newlines = true) {
    let headerslist = Object.entries(hobj);
    return headerslist
        .map((x) => `${" ".repeat(lefttabs)}${x[0]}=${x[1]}`)
        .join(";" + newlines ? "\n" : "");
}
exports.get_HeaderString = get_HeaderString;
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.getNonce = getNonce;
function add_protocol(url) {
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
    let thing = await dns_1.promises.lookup(removeProtocol(url), {
        family: 4,
    });
    return thing.address;
}
exports.getAddress = getAddress;
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
