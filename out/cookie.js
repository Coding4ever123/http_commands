"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
function parse(cookie) {
    // something like: foo=bar;baz=foo;
    let sp = cookie.split(";");
    let entries = [];
    for (let i = 0; i < sp.length; i++) {
        entries[i] = sp[i].split("=");
    }
    return Object.fromEntries(entries);
}
exports.parse = parse;
