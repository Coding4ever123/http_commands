import * as vscode from "vscode";
import { http_request } from "./request";
import * as func from "./functions";
import { join } from "path";
import * as fs from "fs";
import { speed } from "./speedtest";
import * as h from "./history";

const linux = join(func.getEnv("HOME"), ".config");
const dirname = join(
    {
        win32: func.getEnv("APPDATA"),
        linux,
        darwin: join(func.getEnv("HOME"), "Library", "Application Support"),
        freebsd: linux,
        openbsd: linux,
        aix: linux,
    }[process.platform],
    "AdrianDoesCoding-http"
);
const savespath = join(dirname, "saves");
export const inputpath = join(dirname, "input");
export const historypath = join(dirname, "history");

const headerpicks = (arr: Object) => {
    return func.sortascending(
        Object.entries(arr).map((x) => `${x[0]}: ${x[1]}`)
    );
};
export async function send(req: http_request, ip: string, res?) {
    if (!res) {
        if (!req.method && !req.url) {
            vscode.window.showWarningMessage(
                `Missing Method and URL of the request`
            );
        } else if (!req.method) {
            vscode.window.showWarningMessage(`Missing Method of the request`);
        } else if (!req.url) {
            vscode.window.showWarningMessage(`Missing URL of the request`);
        } else {
            console.log("Request went through");
            await new Promise((resolve, reject) => {
                vscode.window.withProgress(
                    {
                        cancellable: false,
                        location: vscode.ProgressLocation.Window,
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
        }
    }

    let e = res || req.response;
    if (!res) {
        let date = Math.round(new Date().getTime() / 1000).toString();
        let path = join(
            historypath,
            `${date} ${encodeURIComponent(req.url)} 0`
        );
        let a = { ...req, ip };
        fs.writeFileSync(path, JSON.stringify(a));
    }
    let isfinished = true;
    while (isfinished) {
        let responsenamelist = {
            URL: `URL: ${req.url} (${ip})`,
            Headers:
                "Headers" +
                (req.headers!.length != 0
                    ? `: ${func.get_HeaderString(e!.headers)}`
                    : ""),
            Timings: `Timings: ${func.convertBest("ns", e!.timings!.total)}`,
            Body: "Body" + func.returnifexists(req.response.body),
            Status: `Status: ${e!.status}`,
            Save: "Save",
        };
        let input = await func.quickpick(Object.values(responsenamelist));
        switch (input) {
            case responsenamelist["Headers"]:
                await func.quickpick(headerpicks(e!.headers!));
                break;
            case responsenamelist["Body"]:
                let body, bdy;
                let inbody = true;
                while (inbody) {
                    let resp = await vscode.window.showQuickPick(
                        ["Show body", "Save body"],
                        func.quickpickoptions
                    );
                    if (!resp) inbody = false;
                    else {
                        body = await func.formatcode(
                            e.body,
                            e.headers["content-type"].split(";")[0]
                        );
                    }
                    if (resp === "Show body")
                        await vscode.window.showQuickPick(
                            body.split("\n"),
                            func.quickpickoptions
                        );
                    else if (resp === "Save body") {
                        let formatted = await vscode.window.showQuickPick(
                            ["formatted", "unformatted"],
                            func.quickpickoptions
                        );
                        if (formatted) {
                            if (formatted === "formatted") bdy = body;
                            else if (formatted === "unformatted")
                                bdy = req.response.body;
                            let savepath = await vscode.window.showSaveDialog({
                                title: "Save Body",
                            });
                            fs.writeFileSync(savepath.fsPath, bdy);
                        }
                    }
                }

                break;
            case responsenamelist["Timings"]:
                await func.quickpick(
                    Object.entries(e!.timings!).map(
                        ([a, b]) => `${a}: ${func.convertBest("ns", b)}`
                    )
                );
                break;
            case responsenamelist["Save"]:
                var savename = await vscode.window.showInputBox({
                    prompt: "Name of the save",
                });
                if (savename === undefined) break;

                savename = encodeURIComponent(savename);
                var readpath = join(savespath, savename);
                let a;
                if (fs.existsSync(readpath)) {
                    a = await vscode.window.showWarningMessage(
                        "Save already exists, do you want to overwrite",
                        "Yes",
                        "No"
                    );
                }
                if (a !== "Yes")
                    fs.writeFileSync(
                        readpath,
                        JSON.stringify({
                            ...req.toJSON(),
                            body:
                                req.body === ""
                                    ? ""
                                    : fs.readFileSync(req.body).toString(),
                        })
                    );

                break;
            case undefined:
                isfinished = false;
        }
    }

    return;
}
async function handleheader(name: string | undefined, req: http_request) {
    if (!name) return;
    if (req.headers![name]) {
        let val = await func.quickpick(["Edit value", "Edit name", "Delete"]);
        if (!val) return;
        else if (val === "Delete") {
            delete req.headers![name];
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
            req.headers![newname] = oldval;
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
        let val = await func.quickpick(["Edit value", "Edit name", "Delete"]);
        if (!val) return;
        else if (val === "Delete") {
            delete req.params![name];
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
            req.params![newname] = oldval;
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
export async function activate(context: vscode.ExtensionContext) {
    func.makedirs(dirname, savespath, historypath, inputpath);

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "Adrian.http.cleartemp",
            func.cleartemp
        ),
        vscode.commands.registerCommand("Adrian.http.clearhistory", h.clear),
        vscode.commands.registerCommand("Adrian.http.history", h.history),
        vscode.commands.registerCommand("Adrian.http.fund", func.fund),
        vscode.commands.registerCommand("Adrian.http.speed", speed),
        vscode.commands.registerCommand("Adrian.http.request", async () => {
            let ip, picks, name, savesopen, urlinp;
            let [dourl, notsent, noheaderselected] = new Array(3).fill(true);
            let req = new http_request();
            while (notsent) {
                let inp: string | undefined;

                let namelist = {
                    Method: "Method" + func.returnifexists(req.method),
                    URL: "URL" + func.returnifexists(`${req.url} (${ip})`),
                    Port: "Port" + func.returnifexists(req.port.toString()),
                    Hash: "Hash" + func.returnifexists(req.hash),
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
                        "Body" +
                        func.returnifexists(func.openifexists(req.body)),
                    Saves: "Saves",
                    Send: "Send",
                };
                let selection = await func.quickpick(Object.values(namelist));
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
                        inp = await func.quickpick([
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
                        let inbody = true;
                        while (inbody) {
                            let list = {
                                Type: `Content-Type${func.returnifexists(req["content-type"])}`,
                                Edit: "Edit",
                            };
                            inp = await func.quickpick(Object.values(list));
                            if (!inp) inbody = false;
                            else if (inp === list["Edit"]) {
                                let writepath =
                                    req.body.length != 0
                                        ? req.body
                                        : join(
                                              inputpath,
                                              func.getFileName(
                                                  req["content-type"]
                                              )
                                          );
                                if (!fs.existsSync(writepath))
                                    fs.writeFileSync(writepath, "");

                                vscode.window.showTextDocument(
                                    vscode.Uri.file(writepath)
                                );
                                req.body = writepath;
                            } else {
                                let a = await func.quickpick(
                                    Object.entries(func.FILEextensions).map(
                                        ([a, b]) => `${a}: ${b.type}`
                                    )
                                );
                                if (a) req["content-type"] = a.split(": ")[0];
                            }
                        }
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
                            inp = await func.quickpick(picks);
                            if (inp === undefined) noheaderselected = false;
                            else if (inp === "+") {
                                name = await vscode.window.showInputBox({
                                    prompt: "Set headername",
                                });
                                await handleheader(name, req);
                            } else {
                                name = Object.keys(req.headers!)[
                                    picks.indexOf(inp) - 1
                                ];
                                await handleheader(name, req);
                            }
                        }
                        break;
                    case namelist["Params"]:
                        noheaderselected = true;
                        while (noheaderselected) {
                            picks = headerpicks(req.params!);
                            picks.unshift("+");
                            inp = await func.quickpick(picks);
                            if (inp === undefined) noheaderselected = false;
                            else if (inp === "+") {
                                name = await vscode.window.showInputBox({
                                    prompt: "Set paramname",
                                });
                                await handleparam(name, req);
                            } else {
                                name = Object.keys(req.params!)[
                                    picks.indexOf(inp) - 1
                                ];
                                await handleparam(name, req);
                            }
                        }
                        break;
                    case "Send":
                        notsent = false;
                        await send(req, ip);
                        break;
                    case "Saves":
                        savesopen = true;
                        while (savesopen) {
                            let files = fs.readdirSync(savespath);
                            inp = await func.quickpick(files);
                            if (!inp) {
                                savesopen = false;
                                break;
                            }
                            let readpath = join(
                                savespath,
                                encodeURIComponent(inp)
                            );
                            inp = await func.quickpick(["load", "delete"]);
                            if (!inp) continue;
                            else if (inp === "load") {
                                let data: http_request = JSON.parse(
                                    fs.readFileSync(readpath).toString()
                                );
                                let p = func.getFileName(data["content-type"]);
                                fs.writeFileSync(p, data.body);
                                req.fromJSON({ ...data, body: p });
                                /*req.body = p;
                                req.params = data.params || "";
                                req.headers = data.headers || "";
                                req.url = data.url || "";
                                req.port = data.port || 80;
                                req.hash = data.hash || "";
                                req.method = data.method || "";*/
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
export async function deactivate() {}
