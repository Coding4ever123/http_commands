"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_js_1 = require("./parser.js");
const printer_js_1 = require("./printer.js");
const plugin = {
    languages: [
        {
            name: "Ant Build System",
            tmScope: "text.xml.ant",
            filenames: ["ant.xml", "build.xml"],
            codemirrorMode: "xml",
            codemirrorMimeType: "application/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 15,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "COLLADA",
            extensions: [".dae"],
            tmScope: "text.xml",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 49,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "Eagle",
            extensions: [".sch", ".brd"],
            tmScope: "text.xml",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 97,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "Genshi",
            extensions: [".kid"],
            tmScope: "text.xml.genshi",
            aliases: ["xml+genshi", "xml+kid"],
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 126,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "JetBrains MPS",
            aliases: ["mps"],
            extensions: [".mps", ".mpl", ".msd"],
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            tmScope: "none",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 465165328,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "LabVIEW",
            extensions: [".lvproj", ".lvclass", ".lvlib"],
            tmScope: "text.xml",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 194,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "Maven POM",
            group: "XML",
            tmScope: "text.xml.pom",
            filenames: ["pom.xml"],
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 226,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "SVG",
            extensions: [".svg"],
            tmScope: "text.xml.svg",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 337,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "Web Ontology Language",
            extensions: [".owl"],
            tmScope: "text.xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 394,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "XML",
            tmScope: "text.xml",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            aliases: ["rss", "xsd", "wsdl"],
            extensions: [
                ".adml",
                ".admx",
                ".ant",
                ".axaml",
                ".axml",
                ".builds",
                ".ccproj",
                ".ccxml",
                ".clixml",
                ".cproject",
                ".cscfg",
                ".csdef",
                ".csl",
                ".csproj",
                ".ct",
                ".depproj",
                ".dita",
                ".ditamap",
                ".ditaval",
                ".dll.config",
                ".dotsettings",
                ".filters",
                ".fsproj",
                ".fxml",
                ".glade",
                ".gml",
                ".gmx",
                ".grxml",
                ".gst",
                ".hzp",
                ".iml",
                ".inx",
                ".ivy",
                ".jelly",
                ".jsproj",
                ".kml",
                ".launch",
                ".mdpolicy",
                ".mjml",
                ".mm",
                ".mod",
                ".mxml",
                ".natvis",
                ".ncl",
                ".ndproj",
                ".nproj",
                ".nuspec",
                ".odd",
                ".osm",
                ".pkgproj",
                ".pluginspec",
                ".proj",
                ".props",
                ".ps1xml",
                ".psc1",
                ".pt",
                ".qhelp",
                ".rdf",
                ".res",
                ".resx",
                ".rs",
                ".rss",
                ".runsettings",
                ".sch",
                ".scxml",
                ".sfproj",
                ".shproj",
                ".srdf",
                ".storyboard",
                ".sublime-snippet",
                ".sw",
                ".targets",
                ".tml",
                ".ts",
                ".tsx",
                ".typ",
                ".ui",
                ".urdf",
                ".ux",
                ".vbproj",
                ".vcxproj",
                ".vsixmanifest",
                ".vssettings",
                ".vstemplate",
                ".vxml",
                ".wixproj",
                ".workflow",
                ".wsdl",
                ".wsf",
                ".wxi",
                ".wxl",
                ".wxs",
                ".x3d",
                ".xacro",
                ".xaml",
                ".xib",
                ".xlf",
                ".xliff",
                ".xmi",
                ".xml",
                ".xml.dist",
                ".xmp",
                ".xproj",
                ".xsd",
                ".xspec",
                ".xul",
                ".zcml",
            ],
            filenames: [
                ".classpath",
                ".cproject",
                ".project",
                "App.config",
                "NuGet.config",
                "Settings.StyleCop",
                "Web.Debug.config",
                "Web.Release.config",
                "Web.config",
                "packages.config",
            ],
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 399,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "XML Property List",
            group: "XML",
            extensions: [
                ".plist",
                ".stTheme",
                ".tmCommand",
                ".tmLanguage",
                ".tmPreferences",
                ".tmSnippet",
                ".tmTheme",
            ],
            tmScope: "text.xml.plist",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 75622871,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "XPages",
            extensions: [".xsp-config", ".xsp.metadata"],
            tmScope: "text.xml",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 400,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "XProc",
            extensions: [".xpl", ".xproc"],
            tmScope: "text.xml",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 401,
            vscodeLanguageIds: ["xml"],
        },
        {
            name: "XSLT",
            aliases: ["xsl"],
            extensions: [".xslt", ".xsl"],
            tmScope: "text.xml.xsl",
            codemirrorMode: "xml",
            codemirrorMimeType: "text/xml",
            since: "0.1.0",
            parsers: ["xml"],
            linguistLanguageId: 404,
            vscodeLanguageIds: ["xml"],
        },
    ],
    parsers: {
        xml: parser_js_1.default,
    },
    printers: {
        xml: printer_js_1.default,
    },
    options: {
        xmlSelfClosingSpace: {
            type: "boolean",
            category: "XML",
            default: true,
            description: "Adds a space before self-closing tags.",
            since: "1.1.0",
        },
        xmlWhitespaceSensitivity: {
            type: "choice",
            category: "XML",
            default: "strict",
            description: "How to handle whitespaces in XML.",
            choices: [
                {
                    value: "strict",
                    description: "Whitespaces are considered sensitive in all elements.",
                },
                {
                    value: "preserve",
                    description: "Whitespaces within text nodes in XML elements and attributes are considered sensitive.",
                },
                {
                    value: "ignore",
                    description: "Whitespaces are considered insensitive in all elements.",
                },
            ],
            since: "0.6.0",
        },
        xmlSortAttributesByKey: {
            type: "boolean",
            category: "XML",
            default: false,
            description: "Orders XML attributes by key alphabetically while prioritizing xmlns attributes.",
        },
        xmlQuoteAttributes: {
            type: "choice",
            category: "XML",
            default: "preserve",
            description: "How to handle whitespaces in XML.",
            choices: [
                {
                    value: "preserve",
                    description: "Quotes in attribute values will be preserved as written.",
                },
                {
                    value: "single",
                    description: "Quotes in attribute values will be converted to consistent single quotes and other quotes in the string will be escaped.",
                },
                {
                    value: "double",
                    description: "Quotes in attribute values will be converted to consistent double quotes and other quotes in the string will be escaped.",
                },
            ],
        },
    },
    defaultOptions: {
        printWidth: 80,
        tabWidth: 2,
    },
};
exports.default = plugin;