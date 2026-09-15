define(['module', 'knockout', 'jquery'], function (module, ko, $) {

    module.exports = function quoteController(model, container, context, app, params) {
        if (!(this instanceof quoteController))
            return new quoteController(model, container, context, app, params);

        if (app.params.h == "off") {
            container.style.display = "none";
            return;
        }

        +function (applyBindings) {
            $.ajax({
                url: "https://dummyjson.com/quotes/random",
                cache: true
            }).done(function (data) {
                if (data.quote && data.author) {
                    applyBindings({ Quote: data.quote, Author: data.author });
                }
            }).fail(function () {
                applyBindings({ Quote: "The best time to plant a tree was 20 years ago. The second best time is now.", Author: "Chinese Proverb" });
            });
        }(function (model) {
            ko.applyBindings(model, container);
        });
    };

});