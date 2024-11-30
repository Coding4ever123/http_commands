import * as vscode from "vscode";
import * as fs from "fs";
import * as ext from "./extension";
import { join } from "path";
import { send } from "./speedtest";
import { http_request } from "./request";
import { quickpickoptions } from "./functions";
let prefix = ["Request", "Speedtest"];
export async function clear() {
    fs.readdir(ext.historypath, (err, files) => {
        if (err) return console.error(err);
        files.forEach((file) => {
            fs.unlinkSync(join(ext.historypath, file));
        });
    });
    vscode.window.showInformationMessage("Succesfully cleared history");
}
export async function history() {
    while (true) {
        let folder = fs.readdirSync(ext.historypath);
        let items = folder
            .map((file) => {
                let split = file.split(" ");
                return {
                    label: prefix[split[2]],
                    description: decodeURIComponent(split[1]),
                    detail: new Date(
                        parseInt(split[0]) * 1000
                    ).toLocaleString(),
                };
            })
            .sort((a, b) => {
                let date1 = new Date(a.detail).getTime();
                let date2 = new Date(b.detail).getTime();
                return date2 - date1;
            });
        let result: vscode.QuickPickItem = await new Promise(
            (resolve, reject) => {
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
            }
        );
        if (!result) return;
        let processs = await vscode.window.showQuickPick(
            ["Show result", "Rerun"],
            quickpickoptions
        );
        console.log(processs);
        if (processs) {
            let index = prefix.indexOf(result.label);
            console.log(typeof index);
            let filespath = join(
                ext.historypath,
                `${Math.round(new Date(result.detail).getTime() / 1000)} ${encodeURIComponent(result.description)} ${index}`
            );
            let file = fs.readFileSync(filespath).toString();
            let json = JSON.parse(file);
            let req = new http_request().fromJSON(json);
            if (processs === "Show result") {
                console.log("Show result");
                if (index === 1) {
                    await new Promise((resolve, reject) => {
                        let a = vscode.window.createQuickPick();
                        a.onDidAccept(() => {
                            let item = a.activeItems[0];
                            if (item.label === "Result")
                                vscode.env.openExternal(
                                    vscode.Uri.parse(
                                        `https://www.${item.description}`
                                    )
                                );
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
                } else if (index === 0) {
                    await ext.send(req, json.ip, json.response);
                }
            } else if (processs === "Rerun") {
                console.log("rerun");
                if (index === 0) {
                    await ext.send(req, json.ip);
                } else {
                    await send({ id: json.server });
                }
            }
        }
    }
}
