"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.speed = exports.send = void 0;
const index_1 = require("./libs/speedtest-net/index");
const geoip = require("geoip-lite");
const vscode = require("vscode");
const servers_1 = require("./servers");
const functions_1 = require("./functions");
const axios_1 = require("axios");
const fs = require("fs");
const path = require("path");
const extension_1 = require("./extension");
async function send(server) {
    return await new Promise(async (resolve, reject) => {
        let cancel = index_1.default.makeCancel();
        let a = vscode.window.createQuickPick();
        a.ignoreFocusOut = true;
        a.title = "Running speedtest...";
        a.items = [
            { label: "Ping", description: "+----" },
            { label: "Download", description: "+----" },
            { label: "Upload", description: "+----" },
        ];
        a.onDidHide(() => {
            cancel();
            resolve(0);
        });
        a.onDidAccept(() => {
            let item = a.selectedItems[0];
            if (item.label === "Result")
                vscode.env.openExternal(vscode.Uri.parse(`https://www.${item.description}`));
        });
        a.show();
        let index = 0;
        let result = await index_1.default({
            acceptGdpr: true,
            acceptLicense: true,
            serverId: server.id,
            cancel,
            progress: (e) => {
                a.items = a.items.map((i) => {
                    let d = i.description;
                    let l = i.label;
                    let description;
                    if (l.toLowerCase() === e.type) {
                        if (e.type === "ping") {
                            description = functions_1.convertBest("ms", e.ping.latency);
                        }
                        else
                            description =
                                functions_1.convertBest("B", e[e.type].bandwidth * 8.4) +
                                    "/s";
                        return { ...i, description };
                    }
                    else {
                        if (!pattern.includes(d))
                            return i;
                        description = pattern[(index + 1) % pattern.length];
                        return { ...i, description };
                    }
                });
                index++;
            },
        }).catch();
        let items = [];
        items.push(...a.items, {
            label: "Packet-loss",
            description: functions_1.tofixed(result.packetLoss, 2) + " %",
        }, {
            label: "Result",
            description: result.result.url.replace("https://www.", ""),
            detail: "click to open",
        });
        a.items = items;
        let js = Object.fromEntries(a.items.map((item) => [item.label, item.description]));
        js.server = server.id;
        let p = path.join(extension_1.historypath, `${Math.round(new Date().getTime() / 1000)} ${encodeURIComponent(`${result.server.country}: ${result.server.location} | ${result.server.name}`)} 1`);
        fs.writeFileSync(p, JSON.stringify(js));
    });
}
exports.send = send;
let pattern = [
    "+----",
    "-+---",
    "--+--",
    "---+-",
    "----+",
    "---+-",
    "--+--",
    "-+---",
];
let acceptpath = path.join(__dirname, "accept");
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = (Math.acos(dist) * 180) / Math.PI;
    dist *= unit == "imperial" ? 59.997756 : 111.18957696;
    return dist;
}
const isMetric = (countryCode) => {
    return ["US", "LR", "MM", "BZ", "UM", "VI"].includes(countryCode)
        ? "imperial"
        : "metric";
};
const myLocation = async () => {
    return geoip.lookup((await axios_1.default.get("https://api.ipify.org").catch()).data);
};
async function speed() {
    let { eu, ll, country } = await myLocation();
    let [lat, lng] = ll;
    let system = isMetric(country);
    let city = await new Promise((resolve) => {
        let a = vscode.window.createQuickPick();
        a.ignoreFocusOut = true;
        let b = servers_1.default.map((x) => {
            return {
                label: `${x.country}: ${x.name}`,
                detail: x.sponsor,
                description: functions_1.convertBest(system === "metric" ? "km" : "mi", distance(x.lat, x.lon, lat, lng, system)),
            };
        });
        b = b.sort((a, b) => {
            let c = parseInt(a.description);
            let d = parseInt(b.description);
            return c - d;
        });
        a.title = "Select your target server";
        a.items = b;
        a.onDidHide(() => resolve(undefined));
        a.onDidAccept(() => {
            resolve(a.selectedItems[0]);
            a.dispose();
        });
        a.show();
    });
    if (!city)
        return;
    if (!fs.existsSync(acceptpath)) {
        let accept = await new Promise((resolve) => {
            let a = vscode.window.createQuickPick();
            a.canSelectMany = true;
            a.ignoreFocusOut = true;
            a.title = "Must accept.";
            let items = [{ label: "Accept License" }];
            if (eu)
                items.push({ label: "Accept GDPR" });
            a.items = items;
            a.onDidHide(() => resolve(0));
            a.onDidAccept(() => {
                if (a.selectedItems.length !== 2)
                    return;
                a.dispose();
                fs.writeFileSync(acceptpath, "");
                resolve(1);
            });
            a.show();
        });
        if (!accept)
            return;
    }
    let server = servers_1.default.find((x) => {
        let s = city.label.split(": ");
        return (x.sponsor === city.detail && s[0] === x.country && s[1] == x.name);
    });
    send(server);
}
exports.speed = speed;
