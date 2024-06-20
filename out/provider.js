"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = require("vscode");
const functions_1 = require("./functions");
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        this._nonce = functions_1.getNonce();
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => { });
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media/js/index.js"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media/css/index.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        // Use a nonce to only allow a specific script to be run.
        return `<!DOCTYPE html>
			<html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${this._nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                    <link href="${styleMainUri}" rel="stylesheet">
			    </head>
                <body>
                    <script nonce="${this._nonce}" src="${scriptUri}">

                    </script>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus
                        sit aperiam eveniet odio unde, ipsum quas perspiciatis, fugiat qui
                        hic molestiae accusantium natus ipsam? Aliquid iure obcaecati
                        temporibus architecto porro!
                    </p>
                </body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
