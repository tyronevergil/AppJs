define(['widget', 'require', 'jquery'], function (widget, require, $) {

    var DATE_FORMAT = "DD/MM/YYYY";

    var attrMarker = "app-datepicker";
    return widget.createFactory(["input[type='text']"], attrMarker, function (element) {
        var r = $.Deferred();
        require(['jquery-ui', 'moment'], function (ui, moment) {
            var input = $(element), clone = input.clone();

            var options = $.extend({}, widget.util.evalInContext('({' + (input.attr(attrMarker) || '') + '})'));
            var datepickerOptions = { dateFormat: "mm/dd/yy" };
            if (options.displayFormat) {
                datepickerOptions.dateFormat = options.displayFormat.replace("YYYY", "YY").toLowerCase();
            }

            clone.removeAttr("id name " + attrMarker);
            widget.util.cleanElement(clone);
            input.after(clone).hide();

            input.change(function (event) {
                debugOut("input changed", event);
                if (!widget.util.isUIEventType(event.originalEvent || event)) {
                    var dateVal = $(this).val();
                    var momentDate = moment(dateVal, options.format || DATE_FORMAT);
                    if (momentDate.isValid()) {
                        var dateFormattedValue = momentDate.format(options.displayFormat || DATE_FORMAT);
                        clone.val(dateFormattedValue);
                        if (d && typeof d.datepicker == "function") {
                            try { d.datepicker("setDate", dateFormattedValue); } catch (e) { }
                        }
                    }
                    else {
                        clone.val("");
                    }
                }
            });

            var d = ui(clone)
                .datepicker(datepickerOptions)
                .change(function (event) {
                    debugOut("datepicker changed", event);
                    var d = $(this), dateVal = d.val();

                    var momentDate = moment(dateVal, options.displayFormat || DATE_FORMAT);
                    var momentDateVal = "";
                    if (momentDate.isValid()) {                        
                        momentDateVal = momentDate.format(options.format || DATE_FORMAT);
                        var dateFormattedValue = momentDate.format(options.displayFormat || DATE_FORMAT);
                        if (dateVal != dateFormattedValue) {
                            d.val(dateFormattedValue);
                        }
                    }

                    input.val(momentDateVal);
                    widget.util.emitChangeEvent(input.get(0), widget.util.createUIEventType(event.originalEvent || event));
                });

            widget.onElementRemove(element, function () {
                debugOut("remove datepicker!");
                d.destroy();
                clone.remove();
            });

            widget.onElementAttributeChange(element, "disabled", function () {
                var isDisabled = typeof $(element).attr("disabled") !== "undefined";
                d.button(isDisabled ? "disable" : "enable");
            });

            debugOut("render datepicker!");
            r.resolve();
        });

        return r;
    });
});