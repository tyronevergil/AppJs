define(['widget', 'run', 'jquery'], function (widget, run, $) {
    var attrMarker = "placeholder";
    return widget.createFactory(["input[type='text']", "textarea"], attrMarker, function (element) {
        var r = $.Deferred();
        +function () {
            var input = $(element);
            var placeholderText = input.attr(attrMarker);

            input.wrap("<span class=\"placeHolderWrapper\" " + ((input.attr("tagName") || input.prop("tagName")) === "TEXTAREA" ? "style=\"display: inline-block;\"" : "") + "></span>")
                        .parent()
                        .append("<label style=\"display: none\">" + placeholderText + "</label>");

            var placeholderLabel = input.parent().find("label");
            placeholderLabel.click(function () {
                input.focus();
            });

            var init = run.once(function () {
                debugOut("render placeholder!");
                r.resolve();
            });

            (function (placeHolderBehavior) {

                input.bind('change keydown mouseup', placeHolderBehavior);

                widget.onElementAttributeChange(element, "style", placeHolderBehavior);

                placeHolderBehavior();

            })(run.debounce(function () {
                init();

                if (input.is(":hidden")) {                    
                    placeholderLabel.css("display", "none");
                }
                else {
                    var value = input.val();
                    if (value == "") {
                        placeholderLabel.css("display", "block");
                    } else {
                        placeholderLabel.css("display", "none");
                    }
                }
            }, 25));

        }();

        return r;
    });
});