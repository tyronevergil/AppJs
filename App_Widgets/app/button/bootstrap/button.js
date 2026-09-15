define(['widget', 'jquery'], function (widget, $) {
    var attrMarker = "app-button";
    return widget.createFactory(["button", "input[type='button']", "input[type='submit']", "input[type='reset']"], attrMarker, function (element) {
        var r = $.Deferred();
        +function () {
            var button = $(element);
            var buttonType = (button.attr(attrMarker) || "").toLowerCase();

            switch (buttonType) {
                case "primary":
                    break;
                case "success":
                    break;
                case "info":
                    break;
                case "warning":
                    break;
                case "danger":
                    break;
                default:
                    buttonType = "default";

            }

            buttonTypeClass = "btn-" + buttonType;
            button.addClass("btn " + buttonTypeClass);

            debugOut("render button!");
            r.resolve();
        }();

        return r;
    });
});