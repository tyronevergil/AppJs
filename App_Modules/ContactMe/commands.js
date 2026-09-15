define(['module', 'jquery'], function (module, $) {

    module.exports = function contactCommands(params) {
        if (!(this instanceof contactCommands))
            return new contactCommands(params);

        var self = this;

        var DEFAULT_ERROR = "Unknown Error!";

        self.submitContactMe = function (data, fn) {
            $.ajax({
                url: "https://formsubmit.co/ajax/tyrone.roson+appjs@hotmail.com",
                method: "POST",
                dataType: "json",
                data: {
                    name: data.Name,
                    email: data.Email,
                    message: data.Message
                },
                cache: false
            }).done(function (response) {
                if (response.success === "true" || response.success === true) {
                    fn({ IsSuccess: true, Message: "Thank you! Your message has been sent successfully." });
                } else {
                    fn({ IsException: true, Message: response.message || DEFAULT_ERROR });
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                fn({ IsException: true, Message: errorThrown || DEFAULT_ERROR });
            });
        };
        
    };

});