const proc = require("child_process");
const util = require("util");
const { join } = require("path");
const c = {
    CONSTANTS: {
        Reset: "\x1b[0m",
        Bold: "\x1b[1m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgBlue: "\x1b[44m",
    },
    info: (str) => `${" INFO ".format(c.CONSTANTS.BgBlue)} ${str}`,
    success: (str) => `${" SUCCESS ".format(c.CONSTANTS.BgGreen)} ${str}`,
    error: (str) => `${" ERROR ".format(c.CONSTANTS.BgRed)} ${str}`,
};
String.prototype.log = function () {
    console.log(this.toString());
};
String.prototype.format = function (clr) {
    return `${clr}${this.toString()}${c.CONSTANTS.Reset}`;
};
let newpath = join(__dirname, "..");
process.chdir(newpath);
__dirname = newpath;
async function exec(code, doreturn) {
    let r = await new Promise((resolve, reject) => {
        proc.exec(code, (err, stdout, stderr) => {
            resolve({ err, stdout, stderr });
        });
    });

    if (r.err && r.stderr && !doreturn) {
        c.error(`${format(Bold, code)} failed`);
        process.exit(1);
    } else return r;
}

(async function () {
    c.info("Installing Packages from npm...").log();
    await exec("npm install");
    while (true) {
        c.info("Compiling to vsix using vsce...").log();
        let resp = await exec("vsce package", true);
        if (resp.err) {
            c.info(
                "Did not find existing vsce executable, downloading..."
            ).log();
            await exec("npm install -g @vscode/vsce");
        } else break;
    }
    c.success("Packaged successfully").log();
})();
