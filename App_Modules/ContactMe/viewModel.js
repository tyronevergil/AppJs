define(['module', 'knockout', 'jquery', 'modules/ContactMe/bindingModel'], function (module, ko, $, bindingModel) {

    module.exports = function contactViewModel(provider, commands, container, context, app, params) {
        if (!(this instanceof contactViewModel))
            return new contactViewModel(provider, commands, container, context, app, params);

        var self = this;
        self = $.extend(true, self, bindingModel(provider, commands));

        self.CloseButtonVisible = !(typeof app.modal.context == "undefined");

        self.Submit = function (data, event) {
            var loader = app.showLoader();
            self.DoSubmit(function () {
                loader.hide();
            });
        };

        self.Close = function (data, event) {
            app.modal.close();
        }
    };

});