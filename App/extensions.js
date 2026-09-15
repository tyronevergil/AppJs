define('app.context', ['exports'], function (exports) {

    exports.setup = function (app) {

        app.context = app.context || {};
        if (sessionStorage) {
            var contextId = sessionStorage.getItem("__app.context");
            if (contextId && (window.opener && window.opener.app && window.opener.app.context)) {
                if (window.opener.app.context.__data) {
                    app.context = window.opener.app.context.__data(contextId);
                }
            }
        }

        if (!app.context.eventEmitter) {
            var subscribers = {};
            var handler = function (type, params) {
                if (subscribers[type]) {
                    for (var fn, i = 0; fn = subscribers[type][i]; i++) {
                        if (typeof fn == "function") {
                            fn.apply(null, params);
                        }
                    }
                }
            };

            app.context.eventEmitter = {
                add: function (type, callback) {
                    subscribers[type] = subscribers[type] || [];
                    subscribers[type].push(callback);
                },
                fire: function (type) {
                    var params = Array.prototype.slice.call(arguments, 1);
                    handler(type, params);
                }
            };
        }

        +function (data) {
            if (!app.context.__data) {
                app.context.__data = function (key, value) {
                    if (value)
                        data[key] = value;
                    else
                        return data[key];
                }
            }

            if (!app.context.__removeData) {
                app.context.__removeData = function (key) {
                    delete data[key];
                }
            }
        }({});

    };

});

define('app.navigate', ['exports', 'util'], function (exports, util) {

    exports.setup = function (app) {

        app.navigate = function (url, nocache, nocascade) {
            if (/^\//.test(url) || /^\?/.test(url)) {
                [].concat(["widgets"].slice(nocascade ? true : !app.params.widgets))
                    .concat(["transitions"].slice(!app.params.transitions))
                    .map(function (param) {
                        url = util.paramUrl(url, typeof app.params[param] == 'boolean' && app.params[param] ? param : param + "=" + app.params[param]);
                    });
            }

            if (typeof nocache == 'undefined') {
                nocache = false;
            }

            url = !nocache ? url : url + (url.indexOf("?") > 0 ? "&" : "?") + new Date().getTime();

            window.location = url;
        };

        app.refresh = function () {
            window.location.reload();
        };
    };

});

define('app.open', ['exports', 'util'], function (exports, util) {

    exports.setup = function (app) {

        app.open = function (url, name, options, nocache, nocascade) {
            if (typeof options == "boolean") {
                nocascade = nocache;
                nocache = options;
                options = name;
                name = "";
            }

            if (/^\//.test(url) || /^\?/.test(url)) {
                [].concat(["widgets"].slice(nocascade ? true : !app.params.widgets))
                    .concat(["transitions"].slice(!app.params.transitions))
                    .map(function (param) {
                        url = util.paramUrl(url, typeof app.params[param] == 'boolean' && app.params[param] ? param : param + "=" + app.params[param]);
                    });
            }

            options = options || "";
            if (options) {
                options = "," + options;
            }

            if (typeof nocache == 'undefined') {
                nocache = false;
            }

            url = !nocache ? url : url + (url.indexOf("?") > 0 ? "&" : "?") + new Date().getTime();

            return window.open(url, name || "", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes" + options);
        };

    };

});

define('app.modal', ['exports', 'run', 'modal', 'jquery'], function (exports, run, modal, $) {

    exports.setup = function (app) {

        var appReadyRegEx = /^\s*?((?!\/\/)app\.ready\s*?\(([\s\S]*)\))/m;
        var loader;

        var testScript = function (scriptText) {
            appReadyRegEx.lastIndex = 0;
            return appReadyRegEx.test(scriptText);
        };

        var changeScript = function (scriptText) {
            appReadyRegEx.lastIndex = 0;
            var m = appReadyRegEx.exec(scriptText);
            if (m) {
                return scriptText.replace(m[2], m[2] + ", this");
            }
            return scriptText;
        };

        var ready = function () {
            if (loader) {
                loader.hide();
                loader = undefined;
            }
            else {
                modal.ready();
            }
        }

        app.modal = $.extend(function (url, options) {
            if (!options) {
                options = url;
                url = undefined;
            }

            if (options._testScript) {
                options._testScript = function (_testScript) {
                    return function (scriptText) {
                        return _testScript(testScript(scriptText));
                    };
                }(options._testScript);
            }
            else {
                options._testScript = testScript;
            }

            if (options._changeScript) {
                options._changeScript = function (_changeScript) {
                    return function (scriptText) {
                        return _changeScript(changeScript(scriptText));
                    };
                }(options._changeScript);
            }
            else {
                options._changeScript = changeScript;
            }

            if (options._ready) {
                options._ready = function (_ready) {
                    return function () {
                        ready(); _ready();
                    };
                }(options._ready);
            }
            else {
                options._ready = ready;
            }

            +function (cleanup) {
                if (options.onClose) {
                    options.onClose = function (_onClose) {
                        return function () {
                            var self = this, args = arguments;
                            _onClose.apply(self, args); cleanup();
                        };
                    }(options.onClose)
                }
                else {
                    options.onClose = cleanup;
                }
            }(function () {
                delete app.modal.context;
            });

            var r = modal.apply(this, [url, options]);

            app.modal.context = modal.context;
            loader = app.showLoader();

            return r;
        }, modal, { ready: ready });

    };

});

define(['exports', 'app.context', 'app.navigate', 'app.open', 'app.modal'], function (exports) {

    var extns = Array.prototype.slice.call(arguments, 1);

    exports.setup = function (app) {

        for (var i = 0, extn; extn = extns[i]; i++) {
            if (extn && extn.setup) {
                extn.setup(app);
            }
        }

    };

});