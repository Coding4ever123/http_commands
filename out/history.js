"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.history = exports.clear = void 0;
const vscode = require("vscode");
const fs = require("fs");
const ext = require("./extension");
const path_1 = require("path");
const speedtest_1 = require("./speedtest");
const request_1 = require("./request");
const functions_1 = require("./functions");
let prefix = ["Request", "Speedtest"];
async function clear() {
    fs.readdir(ext.historypath, (err, files) => {
        if (err)
            return console.error(err);
        files.forEach((file) => {
            fs.unlinkSync(path_1.join(ext.historypath, file));
        });
    });
    vscode.window.showInformationMessage("Succesfully cleared history");
}
exports.clear = clear;
async function history() {
    while (true) {
        let folder = fs.readdirSync(ext.historypath);
        let items = folder
            .map((file) => {
            let split = file.split(" ");
            return {
                label: prefix[split[2]],
                description: decodeURIComponent(split[1]),
                detail: new Date(parseInt(split[0]) * 1000).toLocaleString(),
            };
        })
            .sort((a, b) => {
            let date1 = new Date(a.detail).getTime();
            let date2 = new Date(b.detail).getTime();
            return date2 - date1;
        });
        let result = await new Promise((resolve, reject) => {
            let a = vscode.window.createQuickPick();
            a.matchOnDescription = a.matchOnDetail = true;
            a.items = items;
            a.onDidHide(() => {
                resolve(undefined);
            });
            a.onDidAccept(() => {
                let item = a.selectedItems[0];
                resolve(item);
                a.dispose();
            });
            a.show();
        });
        if (!result)
            return;
        let processs = await vscode.window.showQuickPick(["Show result", "Rerun"], functions_1.quickpickoptions);
        console.log(processs);
        if (processs) {
            let index = prefix.indexOf(result.label);
            console.log(typeof index);
            let filespath = path_1.join(ext.historypath, `${Math.round(new Date(result.detail).getTime() / 1000)} ${encodeURIComponent(result.description)} ${index}`);
            let file = fs.readFileSync(filespath).toString();
            let json = JSON.parse(file);
            let req = new request_1.http_request().fromJSON(json);
            if (processs === "Show result") {
                console.log("Show result");
                if (index === 1) {
                    await new Promise((resolve, reject) => {
                        let a = vscode.window.createQuickPick();
                        a.onDidAccept(() => {
                            let item = a.activeItems[0];
                            if (item.label === "Result")
                                vscode.env.openExternal(vscode.Uri.parse(`https://www.${item.description}`));
                        });
                        a.onDidHide(() => {
                            resolve(0);
                            a.dispose();
                        });
                        a.items = Object.entries(json)
                            .map(([a, b]) => {
                            return {
                                label: a,
                                description: b.toString(),
                            };
                        })
                            .filter((item) => item.label !== "server");
                        a.show();
                    });
                }
                else if (index === 0) {
                    await ext.send(req, json.ip, json.response);
                }
            }
            else if (processs === "Rerun") {
                console.log("rerun");
                if (index === 0) {
                    await ext.send(req, json.ip);
                }
                else {
                    await speedtest_1.send({ id: json.server });
                }
            }
        }
    }
}
exports.history = history;
