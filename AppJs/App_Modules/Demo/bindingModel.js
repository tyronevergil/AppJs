define(['module', 'moment', 'knockout', 'jquery'], function (module, moment, ko, $) {

    module.exports = function demoBindingModel(provider, commands) {
        if (!(this instanceof demoBindingModel))
            return new demoBindingModel(provider, commands);

        var DATE_FORMAT = "DD/MM/YYYY";

        var self = this;

        var model = provider.getBindingModel();
        self = $.extend(true, self, ko.mapping.fromJS(model))

        self.DoCheckDate = function () {
            var dateVal = self.Date();
            var momentDate = moment(dateVal, DATE_FORMAT);
            if (momentDate.isValid()) {
                var dateFormattedVal = momentDate.format(DATE_FORMAT);
                self.Message("Date is valid and the value is " + dateFormattedVal + ".");
                //if (dateVal != dateFormattedVal) {
                //    self.Date(dateFormattedVal);
                //}
            }
            else {
                self.Message("Date supplied is invalid. " + dateVal);
            }
        };

        self.DoSetDate = function () {
            self.Date(moment().format(DATE_FORMAT));
        };

    };

});