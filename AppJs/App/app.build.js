({
    paths: {
        simplemodal: "empty:",
        text: "../Scripts/text",
        "Scripts": "../Scripts"
    },
    skipModuleInsertion: true,
    preserveLicenseComments: false,
    name: "app",
    deps: [
        "dom",
        "load",
        "util"
    ],
    include: [
        "text!Scripts/jquery-1.5.2.min.js",
        "text!Scripts/jquery-1.10.2.min.js",
        "text!Scripts/knockout-3.3.0.js",
        "text!Scripts/knockout.mapping-latest.js",
        "text!Scripts/bootstrap.min.js",
        "text!Scripts/respond.min.js"
    ],
    onBuildWrite: function (moduleName, path, contents) {
        if (moduleName.indexOf("text!Scripts") >= 0) {
            contents = contents
                .replace(/\/\/\/?\s[\s\S]*?\\r\\n/g, '')
                .replace(/\/\*[\s\S]*?\*\/\\r\\n/g, '');
            return contents;
        }

        return contents;
    },
    out: "app.min.js"
})