import { promises } from "dns";

export function get_HeaderString(
    hobj: object | Record<any, any> | undefined,
    lefttabs: number = 0,
    newlines: boolean = true
): string {
    let headerslist = Object.entries(hobj!);
    return headerslist
        .map((x) => `${" ".repeat(lefttabs)}${x[0]}=${x[1]}`)
        .join(";" + newlines ? "\n" : "");
}
export function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function add_protocol(url: string): string {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    } else {
        return "http://" + url;
    }
}
export function removeProtocol(url: string): string {
    return url.replace(/^https?:\/\//, "");
}
export async function getAddress(url: string): Promise<string> {
    let thing = await promises.lookup(removeProtocol(url), {
        family: 4,
    });
    return thing.address;
}
export function sortascending(arr: Array<any>) {
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

export function cookieparse(cookie: string): Record<string, string> {
    // something like: foo=bar;baz=foo;
    let sp = cookie.split(";");
    let entries = [];
    for (let i = 0; i < sp.length; i++) {
        entries[i] = sp[i].split("=");
    }
    return Object.fromEntries(entries);
}
