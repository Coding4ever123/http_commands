import * as vscode from "vscode";
import { http_request } from "./request";
import * as func from "./functions";
import { join } from "path";
import * as fs from "fs";
const savespath = join(__dirname, "saves");
const headerpicks = (arr: Object) => {
    return func.sortascending(
        Object.entries(arr).map((x) => `${x[0]}: ${x[1]}`)
    );
};

async function handleheader(name: string | undefined, req: http_request) {
    if (!name) return;
    if (req.headers![name]) {
        let val = await vscode.window.showQuickPick([
            "Edit value",
            "Edit name",
            "Delete",
        ]);
        if (!val) return "exit";
        else if (val === "Delete") {
            delete req.headers![name];
            return "exit";
        } else if (val === "Edit value") {
            let newval = await vscode.window.showInputBox({
                prompt: "New value of header",
            });
            if (newval === undefined) return;
            if (newval.trim() == "") return;
            req.headers![name] = newval;
        } else if (val === "Edit name") {
            let newname = await vscode.window.showInputBox({
                prompt: "New name of header",
            });
            if (newname === undefined) return;
            if (newname.trim() == "") return;
            let oldval = req.headers![name];
            delete req.headers![name];
            req.set_Header(newname, oldval);
        }
    } else {
        let inp = await vscode.window.showInputBox({
            prompt: "Input value of header",
        });
        if (inp === undefined) return;
        if (inp.trim() == "") return;
        req.set_Header(name, inp);
    }
}
async function handleparam(name: string | undefined, req: http_request) {
    if (!name) return;
    if (req.params![name]) {
        let val = await vscode.window.showQuickPick([
            "Edit value",
            "Edit name",
            "Delete",
        ]);
        if (!val) return "exit";
        else if (val === "Delete") {
            delete req.params![name];
            return "exit";
        } else if (val === "Edit value") {
            let newval = await vscode.window.showInputBox({
                prompt: "New value of param",
            });
            if (newval === undefined) return;
            if (newval.trim() == "") return;
            req.set_param(name, newval);
        } else if (val === "Edit name") {
            let newname = await vscode.window.showInputBox({
                prompt: "New name of param",
            });
            if (newname === undefined) return;
            if (newname.trim() == "") return;
            let oldval = req.params![name];
            delete req.params![name];
            req.set_param(newname, oldval);
        }
    } else {
        let inp = await vscode.window.showInputBox({
            prompt: "Input value of param",
        });
        if (inp === undefined) return;
        if (inp.trim() == "") return;
        req.set_param(name, inp);
    }
}
async function activate(context: vscode.ExtensionContext) {
    if (!fs.existsSync(savespath)) fs.mkdirSync(savespath);
    context.subscriptions.push(
        vscode.commands.registerCommand("Adrian.http.request", async () => {
            let ip, picks, name, savesopen, curheaderexi, urlinp;
            let [isfinished, dourl, notsent, noheaderselected] = new Array(
                4
            ).fill(true);
            let req = new http_request();
            while (notsent) {
                let inp: string | undefined;

                let namelist = {
                    Method:
                        "Method" +
                        (req.method!.length != 0 ? `: ${req.method}` : ""),
                    URL:
                        "URL" +
                        (req.url!.length != 0 ? `: ${req.url} (${ip})` : ""),
                    Port: "Port" + (req.port ? `: ${req.port.toString()}` : ""),
                    Hash:
                        "Hash" + (req.hash!.length != 0 ? `: ${req.hash}` : ""),

                    Headers:
                        "Headers" +
                        (Object.keys(req.headers!).length != 0
                            ? `: ${func.get_HeaderString(
                                  req.headers,
                                  0,
                                  false
                              )}`
                            : ""),
                    Params:
                        "Params" +
                        (Object.keys(req.params!).length != 0
                            ? `: ?${Object.entries(req.params!)
                                  .map((param) => `${param[0]}=${param[1]}`)
                                  .join("&")}`
                            : ""),
                    Body:
                        "Body" + (req.body!.length != 0 ? `: ${req.body}` : ""),
                    Saves: "Saves",
                    Send: "Send",
                };
                let selection = await vscode.window.showQuickPick(
                    Object.values(namelist)
                );
                switch (selection) {
                    case namelist["URL"]:
                        dourl = true;
                        while (dourl) {
                            urlinp = await vscode.window.showInputBox({
                                prompt: "Input URL or IP of target server",
                                value: urlinp || req.url,
                            });
                            if (!urlinp) break;
                            if (urlinp.trim() == "") break;
                            let temp = func.add_protocol(urlinp);
                            try {
                                let url = new URL(temp);
                                if (
                                    url.protocol == "http:" ||
                                    url.protocol == "https:"
                                ) {
                                    req.url = `${
                                        url.hostname
                                    }${func.removetrailingslash(url.pathname)}`;
                                    if (
                                        url.port ||
                                        Object.keys(url.searchParams).length !==
                                            0 ||
                                        url.hash.length !== 0
                                    )
                                        vscode.window.showInformationMessage(
                                            "port, hash and search params did not take affect.\nplease try the dedicated categorys."
                                        );
                                    dourl = false;
                                    urlinp = undefined;
                                    ip = await func.getAddress(url.hostname);

                                    if (ip instanceof Error) {
                                        vscode.window.showErrorMessage(
                                            "Failed to resolve URL: " +
                                                ip.message
                                        );
                                    }
                                    break;
                                } else {
                                    vscode.window.showWarningMessage(
                                        "Invalid protocol"
                                    );
                                }
                            } catch {
                                vscode.window.showWarningMessage("Invalid URL");
                            }
                        }
                        break;
                    case namelist["Method"]:
                        inp = await vscode.window.showQuickPick([
                            "Get",
                            "Post",
                            "Head",
                            "Put",
                            "Delete",
                            "Patch",
                            "Options",
                        ]);
                        if (!inp) break;
                        req.method = inp;
                        break;
                    case namelist["Body"]:
                        inp = await vscode.window.showInputBox({
                            prompt: "Set body",
                            value: req.body,
                        });
                        if (!inp) break;
                        req.body = inp;
                        break;
                    case namelist["Hash"]:
                        inp = await vscode.window.showInputBox({
                            prompt: "Set hash",
                            value: req.hash,
                        });
                        if (!inp) break;
                        if (inp.trim() == "") break;
                        req.hash = inp;
                        break;
                    case namelist["Port"]:
                        inp = await vscode.window.showInputBox({
                            prompt: "Set port",
                            value: req.port!.toString(),
                        });
                        if (!inp) break;
                        if (inp.trim() == "") break;
                        req.port = func.string_to_number(inp);
                        break;
                    case namelist["Headers"]:
                        noheaderselected = true;
                        while (noheaderselected) {
                            picks = headerpicks(req.headers!);
                            picks.unshift("+");
                            inp = await vscode.window.showQuickPick(picks);
                            if (inp === undefined) noheaderselected = false;
                            else if (inp === "+") {
                                name = await vscode.window.showInputBox({
                                    prompt: "Set headername",
                                });
                                let re = await handleheader(name, req);
                            } else {
                                name = Object.keys(req.headers!)[
                                    picks.indexOf(inp) - 1
                                ];
                                curheaderexi = true;
                                while (curheaderexi) {
                                    let re = await handleheader(name, req);
                                    if (re === "exit") {
                                        curheaderexi = false;
                                    }
                                }
                            }
                        }
                        break;
                    case namelist["Params"]:
                        noheaderselected = true;
                        while (noheaderselected) {
                            picks = headerpicks(req.params!);
                            picks.unshift("+");
                            inp = await vscode.window.showQuickPick(picks);
                            if (inp === undefined) noheaderselected = false;
                            else if (inp === "+") {
                                name = await vscode.window.showInputBox({
                                    prompt: "Set paramname",
                                });
                                let re = await handleparam(name, req);
                            } else {
                                name = Object.keys(req.params!)[
                                    picks.indexOf(inp) - 1
                                ];
                                curheaderexi = true;
                                while (curheaderexi) {
                                    let re = await handleparam(name, req);
                                    if (re === "exit") {
                                        curheaderexi = false;
                                    }
                                }
                            }
                        }
                        break;
                    case "Send":
                        if (!req.method && !req.url) {
                            vscode.window.showWarningMessage(
                                `Missing Method and URL of the request`
                            );
                        } else if (!req.method) {
                            vscode.window.showWarningMessage(
                                `Missing Method of the request`
                            );
                        } else if (!req.url) {
                            vscode.window.showWarningMessage(
                                `Missing URL of the request`
                            );
                        } else {
                            console.log("Request went through");
                            await new Promise((resolve, reject) => {
                                vscode.window.withProgress(
                                    {
                                        cancellable: false,
                                        location:
                                            vscode.ProgressLocation.Window,
                                        title: "http",
                                    },
                                    (p) => {
                                        return req.send((a) => {
                                            if (a == 0) resolve(0);
                                            console.log(a);
                                            p.report(a);
                                        });
                                    }
                                );
                            });
                            let e = req.response;
                            isfinished = true;
                            notsent = false;
                            while (isfinished) {
                                let responsenamelist = {
                                    URL: `URL: ${req.url} (${ip})`,
                                    Headers:
                                        "Headers" +
                                        (req.headers!.length != 0
                                            ? `: ${func.get_HeaderString(
                                                  e!.headers
                                              )}`
                                            : ""),
                                    Timings: `Timings: ${func.convert_seconds(
                                        e!.timings!.total
                                    )}`,
                                    Body:
                                        "Body" +
                                        (req.body!.length != 0
                                            ? `: ${e!.body}`
                                            : ""),
                                    Status: `Status: ${e!.status}`,
                                    Save: "Save request",
                                };
                                let input = await vscode.window.showQuickPick(
                                    Object.values(responsenamelist)
                                );
                                switch (input) {
                                    case responsenamelist["Headers"]:
                                        await vscode.window.showQuickPick(
                                            headerpicks(e!.headers!)
                                        );
                                        break;
                                    case responsenamelist["Body"]:
                                        let body = await func.formatcode(
                                            e.body,
                                            e.headers["content-type"].split(
                                                ";"
                                            )[0]
                                        );
                                        await vscode.window.showQuickPick(
                                            body.split("\n")
                                        );
                                        break;
                                    case responsenamelist["Timings"]:
                                        await vscode.window.showQuickPick(
                                            Object.entries(e!.timings!).map(
                                                ([a, b]) =>
                                                    `${a}: ${func.convert_seconds(
                                                        b
                                                    )}`
                                            )
                                        );
                                        break;
                                    case responsenamelist["Save"]:
                                        var savename =
                                            await vscode.window.showInputBox({
                                                prompt: "Name of the save",
                                            });
                                        if (savename === undefined) return;

                                        savename = encodeURIComponent(savename);
                                        var readpath = join(
                                            savespath,
                                            savename
                                        );
                                        fs.writeFileSync(
                                            readpath,
                                            JSON.stringify(
                                                {
                                                    url: req.url,
                                                    body: req.body,
                                                    method: req.method,
                                                    params: req.params,
                                                    headers: req.headers,
                                                    hash: req.hash,
                                                    port: req.port,
                                                },
                                                null,
                                                2
                                            )
                                        );
                                        break;
                                    case undefined:
                                        isfinished = false;
                                }
                            }
                        }
                        break;
                    case "Saves":
                        savesopen = true;
                        while (savesopen) {
                            let files = fs.readdirSync(savespath);
                            inp = await vscode.window.showQuickPick(files);
                            if (!inp) {
                                savesopen = false;
                                break;
                            }
                            let readpath = join(
                                savespath,
                                encodeURIComponent(inp)
                            );
                            inp = await vscode.window.showQuickPick([
                                "load",
                                "delete",
                            ]);
                            if (!inp) continue;
                            else if (inp === "load") {
                                let data = JSON.parse(
                                    fs.readFileSync(readpath).toString()
                                );
                                req.body = data.body || "";
                                req.params = data.params || "";
                                req.headers = data.headers || "";
                                req.url = data.url || "";
                                req.port = data.port || 80;
                                req.hash = data.hash || "";
                                req.method = data.method || "";
                                ip = await func.getAddress(
                                    req.url.split("/")[0]
                                );
                                savesopen = false;
                            } else if (inp === "delete") {
                                fs.unlinkSync(readpath);
                            }
                        }
                        break;
                    case undefined:
                        notsent = false;
                        break;
                }
            }
        })
    );
}
async function deactivate() {}
module.exports = {
    activate: activate,
    deactivate: deactivate,
};
