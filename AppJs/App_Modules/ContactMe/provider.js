define(['module', 'jquery'], function (module, $) {

    module.exports = function contactProvider(model, params) {
        if (!(this instanceof contactProvider))
            return new contactProvider(model, params);

        var self = this;

        self.getBindingModel = function () {
            var m = $.extend({}, model);
            return m;
        };

    };

});