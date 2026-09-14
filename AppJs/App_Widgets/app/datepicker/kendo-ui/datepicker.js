define(['widget', 'require', 'run', 'jquery'], function (widget, require, run, $) {

    var DATE_FORMAT = "DD/MM/YYYY";

    var attrMarker = "app-datepicker";
    return widget.createFactory(["input[type='text']"], attrMarker, function (element) {
        var r = $.Deferred();
        require(['kendo-ui', 'moment'], function (ui, moment) {
            var input = $(element), clone = input.clone();

            var options = $.extend({}, widget.util.evalInContext('({' + (input.attr(attrMarker) || '') + '})'));
            var dOptions = { format: "MM/dd/yyyy" };
            if (options.displayFormat) {
                dOptions.format = options.displayFormat.toLowerCase().replace("mm", "MM");
            }

            clone.removeAttr("id name " + attrMarker);
            widget.util.cleanElement(clone);
            input.after(clone).hide();

            input.change(function (event) {
                if (!widget.util.isUIEventType(event.originalEvent || event)) {
                    var dateVal = $(this).val();
                    var momentDate = moment(dateVal, options.format || DATE_FORMAT);
                    if (momentDate.isValid()) {
                        var dateFormattedValue = momentDate.format(options.displayFormat || DATE_FORMAT);
                        if (d && typeof d.value == "function") {
                            d.value(dateFormattedValue);
                        } else {
                            clone.val(dateFormattedValue);
                        }
                    }
                    else {
                        if (d && typeof d.value == "function") {
                            d.value(null);
                        } else {
                            clone.val("");
                        }
                    }
                }
            });

            var changeEvent = run.debounce(function (event) {
                var dateVal = typeof this.value == "function" ? this.value() : $(this).val();

                var momentDate = typeof dateVal == "string" ? moment(dateVal, options.displayFormat || DATE_FORMAT) : moment(dateVal);
                var momentDateVal = "";
                if (momentDate.isValid()) {
                    momentDateVal = momentDate.format(options.format || DATE_FORMAT);
                }

                input.val(momentDateVal);
                widget.util.emitChangeEvent(input.get(0), widget.util.createUIEventType(event.originalEvent || event));
            }, false, true);

            var d = ui(clone)
                .kendoDatePicker($.extend(dOptions, { change: changeEvent }))
                .change(changeEvent);
            d = d.data("kendoDatePicker");

            widget.onElementRemove(element, function () {
                debugOut("remove datepicker!");
                d.destroy();
                clone.remove();
            });

            widget.onElementAttributeChange(element, "disabled", function () {
                var isDisabled = typeof $(element).attr("disabled") !== "undefined";
                d.enable(isDisabled);
            });

            debugOut("render datepicker!");
            r.resolve();
        });

        return r;
    });
});