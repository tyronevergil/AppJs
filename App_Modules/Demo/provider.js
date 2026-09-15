define(['module', 'jquery'], function (module, $) {

    module.exports = function demoProvider(model, params) {
        if (!(this instanceof demoProvider))
            return new demoProvider(model, params);

        var self = this;

        self.getBindingModel = function () {
            var m = $.extend({}, model);
            return m;
        };

    };

});