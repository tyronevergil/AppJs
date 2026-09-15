define(['module', 'run', 'util', 'jquery'], function (module, run, util, $) {

    var CONTEXT_PROP = "__context";

    function getNewGuid() {
        //* http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript *//
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    function removeQueryParam(url, name, value) {
        var hashIndex = url.indexOf("#");
        var hash = hashIndex > -1 ? url.slice(hashIndex) : "";
        var beforeHash = hashIndex > -1 ? url.slice(0, hashIndex) : url;

        var queryIndex = beforeHash.indexOf("?");
        if (queryIndex == -1)
            return url;

        var base = beforeHash.slice(0, queryIndex);
        var params = beforeHash.slice(queryIndex + 1).split("&").filter(function (pair) {
            if (!pair)
                return false;

            var parts = pair.split("=");
            var matchesName = parts[0].toLowerCase() == name.toLowerCase();
            var matchesValue = typeof value == "undefined" || (parts[1] || "").toLowerCase() == String(value).toLowerCase();
            return !(matchesName && matchesValue);
        });

        return base + (params.length ? "?" + params.join("&") : "") + hash;
    }

    function controllerInit(container, app) {

        var attribute = 'app-controller';
        var controllerInitMarker = attribute + '-init-id';
        var controllerMarker = '[' + attribute + ']';

        var notSelectorFilter = ':not([' + controllerInitMarker + '])';
        var selectors = ['*'].join(controllerMarker + notSelectorFilter + ', ') + controllerMarker + notSelectorFilter;

        function controllerSetup(container, controller, app) {
            var r = $.Deferred();

            var json = {}, script = $("script[type='application/json']:first", container);
            if (script.length) {
                var jsonText = script.text();
                json = util.eval('(' + jsonText + ')') || {};
            }

            var parentContext = {}, parent = $(container).parent(controllerMarker);
            if (parent.length) {
                parent = parent.get ? parent.get(0) : parent;
                if (parent[CONTEXT_PROP])
                    parentContext = parent[CONTEXT_PROP];
            }

            var context = $.extend({}, app.context || {}, app.modal.context || {}, parentContext, json.context || {});
            var contextContainer = (container.get ? container.get(0) : container);
            contextContainer[CONTEXT_PROP] = context;            

            if (controller) {
                var options = util.eval('({' + controller + '})');
                if (!options)
                    options = { location: controller, mvvm: true };

                if (!options.mvvm) {
                    var controllerModule = 'modules/' + options.location + '/controller';
                    app.ready([controllerModule],
                        function (controller) {
                            var self = this;
                            +function (run) {
                                run(function () {
                                    controller(json.model || {}, container, context, app, (json.params || {}).controller || {});
                                    r.resolve();
                                });
                            }(options.delay ? self.done : function (fn) { fn(); });
                        });
                }
                else {
                    var providerModule = 'modules/' + options.location + '/provider';
                    var commandsModule = 'modules/' + options.location + '/commands';
                    var viewModelModule = 'modules/' + options.location + '/viewModel';
                    app.ready([providerModule, commandsModule, viewModelModule, 'knockout'],
                        function (provider, commands, viewModel, ko) {
                            var self = this;
                            +function (run) {
                                run(function () {
                                    var model = viewModel(
                                            provider(json.model || {}, (json.params || {}).provider || {}),
                                            commands((json.params || {}).commands || {}),
                                            container,
                                            context,
                                            app,
                                            (json.params || {}).viewModel || {}
                                        );

                                    ko.applyBindings(model, container);

                                    r.resolve();
                                });
                            }(options.delay ? self.done : function (fn) { fn(); });
                        });
                }
            }
            else {
                r.resolve();
            }

            return r;
        }

        var r = $.Deferred(), elements = (container ? $(selectors, container) : $(selectors));
        if (elements.length) {
            var deferreds = elements.map(function (i, element) {
                var elm = $(element);
                if (typeof elm.attr(controllerInitMarker) === "undefined") {
                    var initMarkerId = getNewGuid();
                    elm.attr(controllerInitMarker, initMarkerId);
                    return controllerSetup(element, elm.attr(attribute), app) || true;
                }
                else {
                    return true;
                }
            });

            $.when.apply($, deferreds).done(function () {
                r.resolve();
            });
        }
        else {
            r.resolve();
        }

        return r;
    }

    function navigateInit(container, app) {

        var attribute = 'app-navigate';
        var navigateInitMarker = attribute + '-init-id';
        var navigateMarker = '[' + attribute + ']';

        var notSelectorFilter = ':not([' + navigateInitMarker + '])';
        var selectors = ['*'].join(navigateMarker + notSelectorFilter + ', ') + navigateMarker + notSelectorFilter;

        var r = $.Deferred(), elements = (container ? $(selectors, container) : $(selectors));
        if (elements.length) {
            var deferreds = elements.map(function (i, element) {
                var elm = $(element);
                if (typeof elm.attr(navigateInitMarker) === "undefined") {
                    var initMarkerId = getNewGuid();
                    elm.attr(navigateInitMarker, initMarkerId);

                    var href = elm.attr("href");
                    if (href) {
                        elm.removeAttr("href");
                        elm.attr("data-href", href);
                    }

                    var optionsText = elm.attr(attribute);
                    var options = util.eval("({" + optionsText + "})");
                    if (!options) {
                        options = { url: optionsText || href };
                    }
                    else {
                        if (!options.url && href)
                            options.url = href;
                    }

                    elm.on('click', function (event) {
                        var url = options.url;
                        if (event.shiftKey && options.alt) {
                            url = options.alt;
                        }

                        app.navigate(url, options.nocache || false, options.nocascade || false);
                    });
                }

                return true;
            });

            $.when.apply($, deferreds).done(function () {
                r.resolve();
            });
        }
        else {
            r.resolve();
        }

        return r;
    }

    function openInit(container, app) {

        var attribute = 'app-open';
        var popouts = module.config().popouts || 'Popouts/';
        var openInitMarker = attribute + '-init-id';
        var openMarker = '[' + attribute + ']';

        var notSelectorFilter = ':not([' + openInitMarker + '])';
        var selectors = ['*'].join(openMarker + notSelectorFilter + ', ') + openMarker + notSelectorFilter;

        var r = $.Deferred(), elements = (container ? $(selectors, container) : $(selectors));
        if (elements.length) {
            var deferreds = elements.map(function (i, element) {
                var elm = $(element);
                if (typeof elm.attr(openInitMarker) === "undefined") {
                    var initMarkerId = getNewGuid();
                    elm.attr(openInitMarker, initMarkerId);

                    var href = elm.attr("href");
                    if (href) {
                        elm.removeAttr("href");
                        elm.attr("data-href", href);
                    }

                    var optionsText = elm.attr(attribute);
                    var options = util.eval("({" + optionsText + "})");
                    if (!options) {
                        options = { url: optionsText || href };
                    }
                    else {
                        if (!options.url && href)
                            options.url = href;
                    }

                    var parentContext = {}, parent = $(element).parents("[app-controller]");
                    if (parent.length) {
                        parent = parent.get ? parent.get(0) : parent;
                        if (parent[CONTEXT_PROP])
                            parentContext = parent[CONTEXT_PROP];
                    }
                    options.context = $.extend({}, app.context || {}, parentContext, options.context || {});

                    elm.on('click', function (event) {
                        var env = util.environment();
                        if (event.shiftKey || env == "ExtraSmall") {
                            app.navigate(removeQueryParam(options.url, "h", "off"), options.nocache || false, options.nocascade || false);
                            return;
                        }

                        var p = [];
                        if (options.height) {
                            p.push("height=" + options.height);
                        }
                        if (options.width) {
                            p.push("width=" + options.width);
                        }

                        var url = options.url;
                        var o = app.open(url, p.join(","), options.nocache || false, options.nocascade || false);
                        if (!o) {
                            window.location = url;
                            return;
                        }
                        if (/^\//.test(url) || /^\?/.test(url)) {
                            if (o.window && o.window.sessionStorage && (app.context && app.context.__data)) {
                                o.window.sessionStorage.setItem("__app.context", initMarkerId);
                                if (!app.context.__data(initMarkerId)) {
                                    app.context.__data(initMarkerId, options.context);
                                }
                            }

                            /* todo: clean up, to call app.context.__removeData */
                        }
                    });
                }

                return true;
            });

            $.when.apply($, deferreds).done(function () {
                r.resolve();
            });
        }
        else {
            r.resolve();
        }

        return r;
    }

    function modalInit(container, app) {

        var attribute = 'app-modal';
        var partials = module.config().partials || 'Partials/';
        var modalInitMarker = attribute + '-init-id';
        var modalMarker = '[' + attribute + ']';

        var notSelectorFilter = ':not([' + modalInitMarker + '])';
        var selectors = ['*'].join(modalMarker + notSelectorFilter + ', ') + modalMarker + notSelectorFilter;

        var r = $.Deferred(), elements = (container ? $(selectors, container) : $(selectors));
        if (elements.length) {
            var deferreds = elements.map(function (i, element) {
                var elm = $(element);
                if (typeof elm.attr(modalInitMarker) === "undefined") {
                    var initMarkerId = getNewGuid();
                    elm.attr(modalInitMarker, initMarkerId);

                    var href = elm.attr("href");
                    if (href) {
                        elm.removeAttr("href");
                        elm.attr("data-href", href);
                    }

                    var optionsText = elm.attr(attribute);
                    var options = util.eval("({" + optionsText + "})");
                    if (!options) {
                        options = { url: optionsText || href };
                    }
                    else {
                        if (!options.url && href)
                            options.url = href;
                    }

                    var parentContext = {}, parent = $(element).parent("[app-controller]");
                    if (parent.length) {
                        parent = parent.get ? parent.get(0) : parent;
                        if (parent[CONTEXT_PROP])
                            parentContext = parent[CONTEXT_PROP];
                    }
                    options.context = $.extend({}, app.context || {}, parentContext, options.context || {});
                    var rootUrl = options.url;

                    elm.on('click', function (event) {
                        var env = util.environment();
                        if (event.shiftKey || env == "ExtraSmall") {
                            app.navigate(rootUrl, options.nocache || false, options.nocascade || false);
                            return;
                        }
                        else {
                            var modalOptions = $.extend({}, options, { url: partials + rootUrl });
                            app.modal(modalOptions);
                            return;
                        }
                    });
                }

                return true;
            });

            $.when.apply($, deferreds).done(function () {
                r.resolve();
            });
        }
        else {
            r.resolve();
        }

        return r;
    }

    function partialInit(container, app) {

        var attribute = 'app-partial';
        var partials = module.config().partials || 'Partials/';
        var partialInitMarker = attribute + '-init-id';
        var partialMarker = '[' + attribute + ']';

        var notSelectorFilter = ':not([' + partialInitMarker + '])';
        var selectors = ['*'].join(partialMarker + notSelectorFilter + ', ') + partialMarker + notSelectorFilter;

        var r = $.Deferred(), elements = (container ? $(selectors, container) : $(selectors)), requests = [];
        if (elements.length) {
            elements.each(function (i, element) {
                var elm = $(element);
                elm.attr(partialInitMarker, getNewGuid());

                var optionsText = elm.attr(attribute);
                if (!optionsText)
                    return;

                var options = util.eval("({" + optionsText + "})");
                if (!options) {
                    options = { url: optionsText };
                }
                else {
                    if (!options.url)
                        return;
                }

                var url = partials + options.url;
                requests.push($.get(url)
                    .done(function (html) {
                        elm.html(html);
                    }));
            });

            if (requests.length) {
                $.when.apply($, requests).always(function () {
                    r.resolve();
                });
            }
            else {
                r.resolve();
            }
        }
        else {
            r.resolve();
        }

        return r;
    }

    module.exports = function (container, app) {
        var r = $.Deferred();
        $.when(controllerInit(container, app))
            .done(function () {
                $.when.apply($, [navigateInit(container, app), openInit(container, app), modalInit(container, app), partialInit(container, app)])
                    .done(function() {
                        r.resolve();
                    });
            });

        return r;
    };

});