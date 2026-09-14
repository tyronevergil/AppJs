define(['module', 'require', 'jquery'], function (module, require, $) {

    var widgets = module.config().registration();
    var exports = module.exports;

    exports.render = function (container) {
        var r = $.Deferred();
        require(widgets, function () {
            var widgetModules = Array.prototype.slice.call(arguments);
            var deferreds = $.map(widgetModules, function (widget, i) {
                if (widget && widget.render) {
                    return (container ? widget.render(container) : widget.render());
                }

                return true;
            });

            $.when.apply($, deferreds).done(function () {
                r.resolve();
            });
        });

        return r;
    };

});

define('jquery-ui', ['jquery-ui'], function (jquery) {
    return jquery;
});

define('kendo-ui', ['kendo-ui'], function (jquery) {
    return jquery;
});

define('jquery-qtip', ['jquery-qtip'], function (jquery) {
    return jquery;
});
