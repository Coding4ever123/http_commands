"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const funding = {
    Github: "https://github.com/sponsors/coding4ever123",
    "ko fi": "https://ko-fi.com/adrianfolie",
    "buy me a coffee": "https://buymeacoffee.com/adrianfolie",
};
async function fund() {
    const response = await new Promise((resolve, reject) => {
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
exports.default = fund;
