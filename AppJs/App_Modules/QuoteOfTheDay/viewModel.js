define(['module', 'knockout', 'jquery'], function (module, ko, $) {

    module.exports = function quoteViewModel(provider, commands, container, context, app, params) {
        if (!(this instanceof quoteViewModel))
            return new quoteViewModel(provider, commands, container, context, app, params);

        var model = provider.getBindingModel();
        self = $.extend(true, self, ko.mapping.fromJS(model));

        var loader = app.showLoader();
        provider.getQuoteOfTheDay(function (result) {
            loader.hide();
            if (result.IsSuccess) {
                ko.mapping.fromJS(result, self);
            }
        });
    };

});