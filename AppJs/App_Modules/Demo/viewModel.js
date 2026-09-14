define(['module', 'knockout', 'jquery', 'modules/Demo/bindingModel'], function (module, ko, $, bindingModel) {

    module.exports = function demoViewModel(provider, commands, container, context, app, params) {
        if (!(this instanceof demoViewModel))
            return new demoViewModel(provider, commands, container, context, app, params);

        var self = this;
        self = $.extend(true, self, bindingModel(provider, commands));

        self.CheckDate = function (data, event) {
            self.DoCheckDate();
        };

        self.SetDate = function (data, event) {
            self.DoSetDate();
        }
    };

});