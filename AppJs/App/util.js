define(['exports'], function (exports) {

    exports.intercept = function (def, fnArgs, fnRet) {
        return function () {
            var r, args = Array.prototype.slice.call(arguments);
            args = fnArgs ? fnArgs(args) || args : args;
            try {
                r = def.apply(this, args);
            }
            catch (e) { }
            return fnRet ? fnRet(r, args) || r : r;
        };
    };

    exports.eval = function (string) {
        try {
            return eval(string);
        }
        catch (e) {
            return null;
        }
    };

    exports.evalInContext = function (string, context) {
        return exports.eval.call(context || window, string);
    };

    exports.isUIEventType = function (event) {
        return /(UI|Keyboard|Mouse|Pointer)Event/.test(event.constructor.toString());
    };

    exports.createUIEventType = function (event) {
        return event && this.isUIEventType(event) ? event : document.createEvent("UIEvents");
    };

    exports.emitChangeEvent = function (element, event, fallback) {
        var that = this;

        element = element.get ? element.get(0) : element;
        if (typeof event == "function") {
            fallback = event;
            event = undefined;
        }

        var b = ("onchange" in element);
        if (element.nodeName === "INPUT") {
            if (element.type == "hidden") {
                b = false;
            }
        }

        if (b) {
            if (document.createEvent) {
                if (event && that.isUIEventType(event)) {
                    event = document.createEvent("UIEvents");
                }
                else {
                    event = document.createEvent("HTMLEvents");
                }
                event.initEvent('change', false, true);
                element.dispatchEvent(event);
            }
            else {
                try {
                    if (element.fireEvent) {
                        element.fireEvent('onchange');
                    }
                    else {
                        throw "not supported!";
                    }
                }
                catch (ex) {
                    b = false;
                }
            }
        }

        if (!b && typeof fallback == "function") {
            b = fallback(element) || b;
        }

        return b;
    };

    exports.paramUrl = function (url, param) {
        if (url.toLowerCase().indexOf(param.toLowerCase()) == -1) {
            var s = /\?/i;
            if (url.search(s) > -1) {
                url = url.replace(s, "?" + param + "&");
            }
            else {
                url = url + "?" + param;
            }
        }

        return url;
    };

    exports.environment = function () {

        //* http://stackoverflow.com/questions/19462672/jquery-detect-bootstrap-3-state *//

        var envValues = ["ExtraSmall", "Small", "Medium", "Large"];
        var envs = ["xs", "sm", "md", "lg"],
        doc = window.document,
        temp = doc.createElement("div");

        doc.body.appendChild(temp);

        for (var i = envs.length - 1; i >= 0; i--) {
            var env = envs[i];
            var envValue = envValues[i];

            temp.className = "hidden-" + env;

            if (temp.offsetParent === null || window.getComputedStyle(temp).display == "none") {
                doc.body.removeChild(temp);
                return envValue;
            }
        }

        return "";
    };

})