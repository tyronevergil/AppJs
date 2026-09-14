define(['module', 'jquery'], function (module, $) {

    module.exports = function quoteProvider(model, params) {
        if (!(this instanceof quoteProvider))
            return new quoteProvider(model, params);

        var self = this;

        self.getBindingModel = function () {
            var m = $.extend({ Quote: '', Author: '', Background: '' }, model);
            return m;
        };

        self.getQuoteOfTheDay = function (fn) {
            var quoteModel;
            if (sessionStorage) {
                var quoteModelText = sessionStorage.getItem("quoteModel");
                if (quoteModelText) {
                    quoteModel = JSON.parse(quoteModelText);
                }
            }

            if (quoteModel) {
                if (typeof quoteModel.IsSuccess == "undefined")
                    quoteModel.IsSuccess = true;

                fn(quoteModel);
            }
            else {
                $.ajax({
                    url: "http://quotes.rest/qod.json",
                    cache: true
                }).done(function (data) {
                    if (data.success && data.success.total) {
                        var q = data.contents.quotes[0];
                        var quoteModel = { IsSuccess:true, Quote: q.quote, Author: q.author, Background: q.background };
                        if (sessionStorage) {
                            sessionStorage.setItem("quoteModel", JSON.stringify(quoteModel));
                        }
                        fn(quoteModel);
                    }
                    else {
                        fn({ IsException: true, Message: "Unknown Error!" });
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    fn({ IsException: true, Message: errorThrown });
                });
            }
        };

    };

});