define(['widget', 'require', 'jquery'], function (widget, require, $) {
    var attrMarker = "app-tooltip";
    return widget.createFactory("*", attrMarker, function (element) {
        var r = $.Deferred();
        require(['jquery-qtip'], function (ui) {
            var tooltip = $(element);
            var options = {
                position: {
                    viewport: $(window),
                    target: 'event'
                }
            };

            var tooltipAttr = tooltip.attr(attrMarker);
            var p = widget.util.evalInContext('({' + (tooltipAttr || '') + '})');
            if (p) {
                options.content = p;
            }
            else {
                if (tooltipAttr) { 
                    options.content = { text: tooltipAttr };
                }
            }

            var q = ui(element).qtip(options);

            widget.onElementRemove(element, function () {
                debugOut("remove tooltip!");
                q.qtip('api').destroy(true);
            });

            debugOut("render tooltip!");
            r.resolve();
        });

        return r;
    });
});