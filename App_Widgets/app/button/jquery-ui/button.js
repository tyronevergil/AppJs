define(['widget', 'require', 'jquery'], function (widget, require, $) {
    var attrMarker = "app-button";
    return widget.createFactory(["button", "input[type='button']", "input[type='submit']", "input[type='reset']"], attrMarker, function (element) {
        var r = $.Deferred();
        require(['jquery-ui'], function (ui) {
            var button = $(element);
            var b = ui(element).button();

            widget.onElementAttributeChange(element, "disabled", function () {
                var isDisabled = typeof b.attr("disabled") !== "undefined";
                b.button(isDisabled ? "disable" : "enable");
            });

            debugOut("render button!");
            r.resolve();
        });

        return r;
    });
});