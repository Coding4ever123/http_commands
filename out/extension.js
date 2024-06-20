"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const request_1 = require("./request");
const functions_1 = require("./functions");
const path_1 = require("path");
const fs_1 = require("fs");
const savespath = path_1.join(__dirname, "saves");
const headerpicks = (arr) => {
    return functions_1.sortascending(Object.entries(arr).map((x) => `${x[0]}: ${x[1]}`));
};
async function handleheader(name, req) {
    if (!name)
        return;
    if (req.headers[name]) {
        let val = await vscode.window.showQuickPick([
            "Edit value",
            "Edit name",
            "Delete",
        ]);
        if (!val)
            return "exit";
        else if (val === "Delete") {
            delete req.headers[name];
            return "exit";
        }
        else if (val === "Edit value") {
            let newval = await vscode.window.showInputBox({
                prompt: "New value of header",
            });
            if (newval === "" || newval === undefined)
                return;
            req.headers[name] = newval;
        }
        else if (val === "Edit name") {
            let newname = await vscode.window.showInputBox({
                prompt: "New name of header",
            });
            if (newname === "" || newname === undefined)
                return;
            let oldval = req.headers[name];
            delete req.headers[name];
            req.set_Header(newname, oldval);
        }
    }
    else {
        let inp = await vscode.window.showInputBox({
            prompt: "Input value of header",
        });
        if (inp === "" || inp === undefined)
            return;
        req.set_Header(name, inp);
    }
}
async function handleparam(name, req) {
    if (!name)
        return;
    if (req.params[name]) {
        let val = await vscode.window.showQuickPick([
            "Edit value",
            "Edit name",
            "Delete",
        ]);
        if (!val)
            return "exit";
        else if (val === "Delete") {
            delete req.params[name];
            return "exit";
        }
        else if (val === "Edit value") {
            let newval = await vscode.window.showInputBox({
                prompt: "New value of param",
            });
            if (newval === "" || newval === undefined)
                return;
            req.set_param(name, newval);
        }
        else if (val === "Edit name") {
            let newname = await vscode.window.showInputBox({
                prompt: "New name of param",
            });
            if (newname === "" || newname === undefined)
                return;
            let oldval = req.params[name];
            delete req.params[name];
            req.set_param(newname, oldval);
        }
    }
    else {
        let inp = await vscode.window.showInputBox({
            prompt: "Input value of param",
        });
        if (inp === "" || inp === undefined)
            return;
        req.set_param(name, inp);
    }
}
async function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("Adrian.http.request", async () => {
        let isfinished = true;
        let curheaderexi;
        let name;
        let savesopen;
        let picks;
        let req = new request_1.http_request();
        let notsent = true;
        let noheaderselected = true;
        while (notsent) {
            let inp;
            let namelist = {
                Method: "Method" +
                    (req.method.length != 0 ? `: ${req.method}` : ""),
                URL: "URL" + (req.url.length != 0 ? `: ${req.url}` : ""),
                Headers: "Headers" +
                    (Object.keys(req.headers).length != 0
                        ? `: ${functions_1.get_HeaderString(req.headers, 0, false)}`
                        : ""),
                Params: "Params" +
                    (Object.keys(req.params).length != 0
                        ? `: ?${Object.entries(req.params)
                            .map((param) => `${param[0]}=${param[1]}`)
                            .join("&")}`
                        : ""),
                Body: "Body" + (req.body.length != 0 ? `: ${req.body}` : ""),
                Recent: "saves",
                Send: "send",
            };
            let selection = await vscode.window.showQuickPick(Object.values(namelist));
            switch (selection) {
                case namelist["URL"]:
                    inp = await vscode.window.showInputBox({
                        prompt: "Input URL of target server",
                        value: req.url,
                    });
                    if (!inp)
                        break;
                    req.url = functions_1.add_protocol(inp);
                    break;
                case namelist["Method"]:
                    inp = await vscode.window.showQuickPick([
                        "get",
                        "post",
                        "head",
                        "put",
                        "delete",
                        "patch",
                        "options",
                    ]);
                    if (!inp)
                        break;
                    req.method = inp;
                    break;
                case namelist["Body"]:
                    inp = await vscode.window.showInputBox({
                        prompt: "Set body",
                        value: req.body,
                    });
                    if (!inp)
                        break;
                    req.body = inp;
                    break;
                case namelist["Headers"]:
                    noheaderselected = true;
                    while (noheaderselected) {
                        picks = headerpicks(req.headers);
                        picks.unshift("+");
                        inp = await vscode.window.showQuickPick(picks);
                        if (inp === undefined)
                            noheaderselected = false;
                        else if (inp === "+") {
                            name = await vscode.window.showInputBox({
                                prompt: "Set headername",
                            });
                            let re = await handleheader(name, req);
                        }
                        else {
                            name = Object.keys(req.headers)[picks.indexOf(inp) - 1];
                            curheaderexi = true;
                            console.log(name);
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
                        picks = headerpicks(req.params);
                        picks.unshift("+");
                        inp = await vscode.window.showQuickPick(picks);
                        if (inp === undefined)
                            noheaderselected = false;
                        else if (inp === "+") {
                            name = await vscode.window.showInputBox({
                                prompt: "Set paramname",
                            });
                            let re = await handleparam(name, req);
                        }
                        else {
                            name = Object.keys(req.params)[picks.indexOf(inp) - 1];
                            curheaderexi = true;
                            console.log(name);
                            while (curheaderexi) {
                                let re = await handleparam(name, req);
                                if (re === "exit") {
                                    curheaderexi = false;
                                }
                            }
                        }
                    }
                    break;
                case "send":
                    if (!req.method) {
                        vscode.window.showWarningMessage(`Missing Method of the request`);
                        break;
                    }
                    if (!req.url) {
                        vscode.window.showWarningMessage(`Missing URL of the request`);
                        break;
                    }
                    console.log("sent");
                    await req.send();
                    console.log("recieved");
                    let e = req.response;
                    isfinished = true;
                    notsent = false;
                    while (isfinished) {
                        let responsenamelist = {
                            /*Method: capstring(
                                "Method" +
                                    (req.method!.length != 0 ? `: ${req.method}` : ""),
                                maxcap
                            ),*/
                            URL: "URL" +
                                (req.url.length != 0
                                    ? `: ${req.url}(${await functions_1.getAddress(req.url)})`
                                    : ""),
                            Headers: "Headers" +
                                (req.headers.length != 0
                                    ? `: ${functions_1.get_HeaderString(e.response.headers)}`
                                    : ""),
                            Timings: `Timings: ${e.timings}ms`,
                            Body: "Body" +
                                (req.body.length != 0
                                    ? `: ${e.response.data}`
                                    : ""),
                            Status: `Status: ${e.response.status} ${e.response.statusText}`,
                        };
                        let input = await vscode.window.showQuickPick(Object.values(responsenamelist));
                        console.log(input);
                        switch (input) {
                            case responsenamelist["Headers"]:
                                await vscode.window.showQuickPick(headerpicks(e.response.headers));
                                break;
                            case responsenamelist["Body"]:
                                await vscode.window.showQuickPick(e.response.data.split("\n"));
                                break;
                            case undefined:
                                isfinished = false;
                        }
                    }
                    break;
                case "saves":
                    savesopen = true;
                    while (savesopen) {
                        let files = fs_1.readdirSync(savespath);
                        files = files.map((file) => decodeURIComponent(file) + " ");
                        files.unshift("+");
                        inp = await vscode.window.showQuickPick(files);
                        if (!inp) {
                            savesopen = false;
                            break;
                        }
                        if (inp === "+") {
                            inp = await vscode.window.showInputBox({
                                prompt: "Set filename",
                            });
                            if (!inp)
                                break;
                            let writepath = path_1.join(savespath, encodeURIComponent(inp));
                            fs_1.writeFileSync(writepath, JSON.stringify({
                                headers: req.headers,
                                url: req.url,
                                method: req.method,
                                body: req.body,
                                params: req.params,
                            }, null, 2));
                            break;
                        }
                        inp = inp.slice(0, -1);
                        let readpath = path_1.join(savespath, encodeURIComponent(inp));
                        inp = await vscode.window.showQuickPick([
                            "load",
                            "delete",
                        ]);
                        if (!inp)
                            break;
                        else if (inp === "load") {
                            let data = JSON.parse(fs_1.readFileSync(readpath).toString());
                            req.body = data.body;
                            req.params = data.params;
                            req.headers = data.headers;
                            req.url = data.url;
                            req.method = data.method;
                        }
                        else if (inp === "delete") {
                            fs_1.unlinkSync(readpath);
                        }
                    }
                    break;
                case undefined:
                    notsent = false;
                    break;
            }
        }
    }));
}
async function deactivate() { }
module.exports = {
    activate: activate,
    deactivate: deactivate,
};
