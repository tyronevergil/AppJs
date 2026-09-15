+function (app, define, require, modernizr, window, undefined) {

    var d = [];
    if (app.ready && app._get_deferred_ready_Commands) {
        d.push.apply(d, app._get_deferred_ready_Commands());
    }

    //dependencies
    define('modernizr', function () {
        return modernizr;
    });

    define('jquery', ['jquery'], function (jquery) {
        return jquery;
    });

    define('bootstrap', ['bootstrap'], function (bootstrap) {
        return bootstrap;
    });

    define('knockout', ['knockout', 'jquery'], function (knockout, $) {

        +function (ko) {
            var defaultBindingHandlersValue = {
                init: ko.bindingHandlers.value.init,
                update: ko.bindingHandlers.value.update
            };
            ko.bindingHandlers.value = {
                init: function (element, valueAccessor) {
                    var r = defaultBindingHandlersValue.init.apply(this, arguments);

                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        value.subscribe(function () {
                            ko.utils.triggerEvent(element, "change");
                            //$(element).trigger("change");
                        });
                    }
                    return r;
                },
                update: function (element, valueAccessor) {
                    return defaultBindingHandlersValue.update.apply(this, arguments);
                    //var v = element.value;
                    //var r = defaultBindingHandlersValue.update.apply(this, arguments);
                    //if (v != element.value) {
                    //    ko.utils.triggerEvent(element, "change");
                    //}
                    //return r;
                }
            };

            var defaultBindingHandlersChecked = {
                init: ko.bindingHandlers.checked.init,
                update: ko.bindingHandlers.checked.update
            };
            ko.bindingHandlers.checked = {
                init: function (element, valueAccessor) {
                    var r = defaultBindingHandlersChecked.init.apply(this, arguments);

                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        value.subscribe(function () {
                            ko.utils.triggerEvent(element, "change");
                            //$(element).trigger("change");
                        });
                    }

                    return r;
                },
                update: function (element, valueAccessor) {
                    return defaultBindingHandlersChecked.update.apply(this, arguments);
                    //var c = element.checked;
                    //var r = defaultBindingHandlersChecked.update.apply(this, arguments);
                    //if (c != element.checked) {
                    //    ko.utils.triggerEvent(element, "change");
                    //}
                    //return r;
                }
            };
        }(knockout);

        return knockout;
    });

    define('knockout.mapping', ['knockout.mapping'], function (mapping) {
        return mapping.mapping ? mapping.mapping: mapping;
    });

    define('mutationObserver', ['mutationObserver'], function () {
        return MutationObserver;
    });

    //
    require(['run', 'util', 'jquery'].concat(["es5"].slice(Object.hasOwnProperty('create'))).concat(['json3'].slice(typeof JSON !== 'undefined')), function (run, util, $) {

        var t = 100, b = [], appdone = $.Deferred();

        var hideLoader = run.debounce(function () {
            $.when.apply($, b).done(function () {
                b = [];

                var loader = $(".loader, .ajaxmodal>.loader");
                if (loader.is(":visible")) {
                    loader.hide();
                    loader.removeClass("loader-transparent");
                    loader.find(".loader-text").text("Please wait...");
                }

                appdone.resolve();
                appdone = $.Deferred();
                if (window.done) {
                    delete window.done;
                }

                [].concat([{ param: "widgets", selector: "a:not([href*='widgets'])" }].slice(!app.params.widgets))
                    .concat([{ param: "transitions", selector: "a:not([href*='transitions'])" }].slice(!app.params.transitions))
                    .map(function (u) {
                        $(u.selector).each(function () {
                            var a = $(this);
                            var href = a.attr("href");
                            if (/^\//.test(href) || /^\?/.test(href)) {
                                if (!Array.prototype.slice.call(a.get(0).attributes).some(function (attr) { return attr.name.startsWith("app-"); })) {
                                    a.attr("href", util.paramUrl(href, typeof app.params[u.param] == 'boolean' && app.params[u.param] ? u.param : u.param + "=" + app.params[u.param]));
                                }                                
                            }
                        });
                    });

                app.stopWatch(function (t) {
                    $(".clock").text(t + "ms");
                });
            });
        }, t);
        
        var showLoader = function (transparent, text, loader) {
            loader = loader || $(".loader").first();

            if (transparent) {
                if (app._transitions) {
                    if (loader.is(":visible"))
                        loader.addClass("loader-transparent");
                }
                else {
                    if (!loader.is(":visible"))
                        loader.addClass("loader-transparent");
                }
            }

            if (text) {
                loader.find(".loader-text").text(text);
            }

            loader.show();

            return loader;
        };

        var showLoaderOrModalLoader = function (transparent, text) {
            var loader = $(".ajaxmodal>.loader");
            return showLoader(transparent, text, loader.length ? loader : undefined);
        };

        app.showLoader = function (text) {

            app.setWatch();

            var r = $.Deferred();
            b.push(r);

            var loader = showLoaderOrModalLoader(true, text);

            return {
                hide: function () {
                    r.resolve();
                    hideLoader();
                },
                update: function (text) {
                    loader.find(".loader-text").text(text);
                }
            };
        };

        app.ready = function (deps, fn, ctx) {
            
            if (typeof deps == "function") {
                ctx = fn;
                fn = deps;
                deps = undefined;
            }

            ctx = ctx || window;
            if (ctx == window) {
                window.done = appdone.done;
            }
            else {
                if (ctx.done) {
                    ctx.done = function (done) {
                        return function (fn) {
                            var args = Array.prototype.slice.call(arguments);
                            appdone.done(fn);
                            return done.apply(ctx, args);
                        };
                    }(ctx.done);
                }
                else {
                    ctx.done = appdone.done;
                }
            }

            +function (end) {
                if (deps) {
                    var r = $.Deferred();
                    b.push(r);
                    require(deps, function () {
                        var args = Array.prototype.slice.call(arguments);
                        end(fn.apply(ctx, args));

                        r.resolve();
                    });
                }
                else {
                    end(fn.apply(ctx));
                }
            }(function(r) {
                if (r) {
                    b.push(r);
                }
                hideLoader();
            });
        };

        //start app
        +function () {

            showLoader(true);

            /*
            if (app.params["d"] == "context") {
                app.context = app.context || {};
                if (!app.context.eventEmitter) {
                    app.context.eventEmitter = $.Callbacks("unique memory");
                }
            }
            */

            require(['extensions', 'bootstrap'], function (extensions) {

                extensions.setup(app);

                $(function () {

                    //extensions.setup(app);

                    $(window).on('beforeunload', function (e) {
                        showLoader();
                    });

                    $(window).on('pageshow', function (e) {
                        if (e.originalEvent && e.originalEvent.persisted) {
                            hideLoader();
                        }
                    });

                    +function (fn) {
                        var nowidgets = $("html").hasClass("nowidgets");
                        var ltie9 = $("html").hasClass("lt-ie9");

                        ltie9 ? fn(ltie9)() : nowidgets ? require(["dom", 'modules'], fn(ltie9)) : require(["dom", 'modules', 'widgets'], fn(ltie9));
                    }(function (nosupport) {
                        return function (dom, modules, widgets) {

                            // app_ui here
                            if (dom) {
                                dom.attach(function (notify) { notify(document.body); });
                                dom.subscribe(function (node) {
                                    b.push(modules(node, app));
                                    if (widgets) {
                                        b.push(widgets.render(node));
                                    }
                                });
                            }

                            // executes all deferred app.ready
                            if (!nosupport) {
                                if (d.length) {
                                    for (var f, i = 0; f = d[i]; i++) {
                                        app.ready(f.deps, f.fn);
                                    }
                                }
                                else {
                                    hideLoader();
                                }
                            }
                        };
                    });
                });
            });

        }();
       
    });

}(window['app'] || (window['app'] = {}), window.define, window.require, window.Modernizr, window);