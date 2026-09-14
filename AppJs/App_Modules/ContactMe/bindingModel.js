define(['module', 'knockout', 'jquery'], function (module, ko, $) {

    module.exports = function contactBindingModel(provider, commands) {
        if (!(this instanceof contactBindingModel))
            return new contactBindingModel(provider, commands);

        var self = this;

        var model = provider.getBindingModel();
        self = $.extend(true, self, ko.mapping.fromJS(model));

        self.Response = ko.observable('');

        self.DoSubmit = function (fn) {
            var data = ko.mapping.toJS(self);
            commands.submitContactMe(data, function (result) {
                if (result.IsSuccess) {
                    ko.mapping.fromJS(model, self);
                }
                self.Response(result.Message);
                fn();
            });
        };

    };

});