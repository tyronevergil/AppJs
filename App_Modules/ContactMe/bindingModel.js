define(['module', 'knockout', 'jquery'], function (module, ko, $) {

    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    module.exports = function contactBindingModel(provider, commands) {
        if (!(this instanceof contactBindingModel))
            return new contactBindingModel(provider, commands);

        var self = this;

        var model = provider.getBindingModel();
        self = $.extend(true, self, ko.mapping.fromJS(model));

        self.Response = ko.observable('');

        self.Errors = {
            Name: ko.observable(''),
            Email: ko.observable(''),
            Message: ko.observable('')
        };

        self.validate = function () {
            var name = (self.Name() || '').trim();
            var email = (self.Email() || '').trim();
            var message = (self.Message() || '').trim();

            self.Errors.Name(name ? '' : 'Name is required.');
            self.Errors.Email(!email ? 'Email is required.' : !EMAIL_PATTERN.test(email) ? 'Enter a valid email address.' : '');
            self.Errors.Message(message ? '' : 'Message is required.');

            return !self.Errors.Name() && !self.Errors.Email() && !self.Errors.Message();
        };

        self.DoSubmit = function (fn) {
            if (!self.validate()) {
                fn();
                return;
            }

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