({
    paths: {
        jquery: "empty:",
        moment: "empty:",
        run: "empty:",
        util: "empty:",
        "ui": "../App_Widgets"
    },
    name: "widgets",
    deps: [
        "widget",
        "ui/app/button/bootstrap/button",
        "ui/app/button/jquery-ui/button",
        "ui/app/datepicker/jquery-ui/datepicker",
        "ui/app/datepicker/kendo-ui/datepicker",
        "ui/app/multiselect/kendo-ui/multiselect",
        "ui/app/tooltip/jquery-qtip/tooltip",
        "ui/html5/placeholder"
    ],
    out: "widgets.min.js"
})