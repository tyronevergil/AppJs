define('jquery.modal', ['run', 'jquery', 'simplemodal'], function (run, modal) {

    var $ = modal, modal = modal.modal;

    if (!$.fn.draggable) {

        /* http://dte-project.googlecode.com/svn/trunk/jquery-draggable/index.html */
        $.fn.draggable = function (opt) {

            opt = $.extend({
                handle: "",
                cursor: "move",
                draggableClass: "draggable",
                activeHandleClass: "active-handle"
            }, opt);

            var $selected = null;
            var $elements = (opt.handle === "") ? this : this.find(opt.handle);

            $elements.css('cursor', opt.cursor).bind("mousedown.simplemodal.draggable", function (e) {
                if (opt.handle === "") {
                    $selected = $(this);
                    $selected.addClass(opt.draggableClass);
                } else {
                    $selected = $(this).parent();
                    $selected.addClass(opt.draggableClass).find(opt.handle).addClass(opt.activeHandleClass);
                }
                var drg_h = $selected.outerHeight(),
                    drg_w = $selected.outerWidth(),
                    pos_y = $selected.offset().top + drg_h - e.pageY,
                    pos_x = $selected.offset().left + drg_w - e.pageX;
                $(document).bind("mousemove.simplemodal.draggable", function (e) {
                    $selected.offset({
                        top: e.pageY + pos_y - drg_h,
                        left: e.pageX + pos_x - drg_w
                    });
                }).bind("mouseup.simplemodal.draggable", function () {
                    $(this).unbind("mousemove.simplemodal.draggable"); // Unbind events from document
                    if ($selected !== null) {
                        $selected.removeClass(opt.draggableClass);
                        $selected = null;
                    }
                });
                e.preventDefault(); // disable selection
            }).bind("mouseup.simplemodal.draggable", function () {
                if (opt.handle === "") {
                    $selected.removeClass(opt.draggableClass);
                } else {
                    $selected.removeClass(opt.draggableClass)
                        .find(opt.handle).removeClass(opt.activeHandleClass);
                }
                $selected = null;
            });

            return this;
        };
    }

    if (!$.fn.resizable) {

        $.fn.resizable = function (opt) {

            opt = $.extend({
                handle: "",
                cursor: "se-resize",
                minWidth: 200,
                minHeight: 100
            }, opt);

            var $target = this;
            var $handle = (opt.handle === "") ? this : this.find(opt.handle);

            $handle.css('cursor', opt.cursor).bind("mousedown.simplemodal.resizable", function (e) {
                var start_w = $target.outerWidth(),
                    start_h = $target.outerHeight(),
                    start_x = e.pageX,
                    start_y = e.pageY;

                $(document).bind("mousemove.simplemodal.resizable", function (e) {
                    $target.css({
                        width: Math.max(opt.minWidth, start_w + (e.pageX - start_x)),
                        height: Math.max(opt.minHeight, start_h + (e.pageY - start_y))
                    });
                }).bind("mouseup.simplemodal.resizable", function () {
                    $(document).unbind("mousemove.simplemodal.resizable").unbind("mouseup.simplemodal.resizable");
                });
                e.preventDefault(); // disable selection
            });

            return this;
        };
    }

    modal.impl.fixIE = function (fixIE) {
        return function () { };
    }(modal.impl.fixIE);

    modal.impl.open = function (open) {
        return function () {
            var s = this, args = Array.prototype.slice.call(arguments);
            var r = open.apply(s, args);

            var container = $(s.d.container);
            container.find(".simplemodal-close").wrap("<div class=\"simplemodal-header\"></div>")
            container.draggable({ handle: ".simplemodal-header" });

            container.append('<div class="simplemodal-resize-handle"></div>');
            container.resizable({ handle: ".simplemodal-resize-handle" });

            return r;
        };
    }(modal.impl.open);

    modal.impl.setContainerDimensions = function (setContainerDimensions) {

        var initOverlay = run.once(function (overlay) {
            overlay.css('height', '100%');
            overlay.css('width', '100%');
        });

        return function () {
            var s = this, args = Array.prototype.slice.call(arguments);
            var r = setContainerDimensions.apply(s, args);

            s.d.wrap.css('overflow', 'auto');

            initOverlay(s.d.overlay);

            return r;
        };
    }(modal.impl.setContainerDimensions);

    return modal;
});

define(['exports', 'run', 'jquery.modal', 'jquery'], function (exports, run, modal, $) {

    var DEFAULT_ERROR = "Unknown Error!";

    var closeRegEx = /^\s*?((?!\/\/)((\w+(?:\.\w+)*)+\.modal\.close\s*?\(\)))/m;
    var readyRegEx = /^\s*?((?!\/\/)((\w+(?:\.\w+)*)+\.modal\.ready\s*?\(\)))/m;

    var contextRegEx = /^\s*\/\*\s+ajaxmodal-context\s+\*\//m,
        commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        scriptRegEx = /<script.*?>([\s\S]*?)<\/script>/mgi;

    exports = function (url, options) {

        if (!options) {
            options = url;
            url = undefined;
        }

        var optionContext = options.context || {};
        var optionOnClose = options.onClose;
        var optionOnShow = options.onShow; delete options.onShow;

        var content = $("<div class=\"ajaxmodal\"><div class=\"loader\"><span class=\"loader-text\" unselectable=\"on\">Please wait...</span></div></div>");
        var jqXHR, r = $.Deferred(), m = modal(content, $.extend(true, options, {
            autoResize: true,
            zIndex: 2000,
            closeHTML: "<a class=\"modalCloseImg\"></a>",
            onClose: function () {
                var self = this, args = arguments;
                if ((jqXHR.readyState && (jqXHR.readyState > 0 && jqXHR.readyState < 4)) && jqXHR.abort) {
                    jqXHR.abort();
                }

                if (exports.context) {
                    if (exports.context.onClose) {
                        try {
                            exports.context.onClose.apply(self, args);
                        }
                        catch (ex) { }
                    }

                    delete exports.context;
                }

                +function (modalClose) {
                    if (optionOnClose && typeof optionOnClose === "function") {
                        optionOnClose.apply(self, args);

                        closeRegEx.lastIndex = 0;
                        if (!closeRegEx.test(optionOnClose.prototype.toString().replace(commentRegEx, ''))) {
                            modalClose();
                        }
                    }
                    else {
                        modalClose();
                    }
                }(function () {
                    content.empty(); (m || modal).close();
                });
            }
        }));

        if (m !== false) {
            exports.context = optionContext;

            jqXHR = typeof url === 'undefined' ? $.ajax(options) : $.ajax(url, options);
            jqXHR.always(function (jqXHR, textStatus, errorThrown) {
                if (textStatus !== 'abort') {                  
                    var responseText = (textStatus === 'success' ? (typeof jqXHR === 'string' ? jqXHR : jqXHR.responseText) : "<div class=\"error\">" + (errorThrown || options.defaultError|| DEFAULT_ERROR) + "</div>");
                    var hasContextReq = function (scriptText) {
                        var b = options._testScript === 'function' ? options._testScript(scriptText) : false;
                        if (!b) {
                            for (var p in optionContext) {
                                b = (new RegExp("(\\w+(?:\\.\\w+)*)\\." + p, "mg")).test(scriptText);
                                if (b) {
                                    break;
                                }
                            }
                        }

                        return b;
                    };

                    var m; scriptRegEx.lastIndex = 0;
                    while (m = scriptRegEx.exec(responseText)) {
                        var scriptText = m[1]; contextRegEx.lastIndex = 0;
                        if (!contextRegEx.test(scriptText) && hasContextReq(scriptText)) {
                            responseText = responseText.replace(scriptText,
                                "/* ajaxmodal-context */ " +
                                "(function (factory) { if (typeof require === 'function') { require(['modal'], function(modal) { factory({ modal: modal }) }); } else { factory(window.$); } } (function ($) { (function() { " +
                                 (typeof options._changeScript === 'function' ? options._changeScript(scriptText) : scriptText) + " " +
                                "}).call($.modal.context); }));");

                            scriptRegEx.lastIndex = m.index;
                        }
                    }

                    var html = $(responseText);
                    content.prepend(html);

                    if (optionOnShow && typeof optionOnShow === "function") {
                        optionOnShow.apply(options, [modal.impl.d]);
                    }

                    if (textStatus === 'success') {
                        r.resolve.apply(optionContext, [html]);
                    }
                    else {
                        r.reject.apply(optionContext, [html]);
                    }

                    readyRegEx.lastIndex = 0;
                    if (!readyRegEx.test(responseText.replace(commentRegEx, ''))) {
                        var ready = typeof options._ready === 'function' ? options._ready : exports.ready;
                        run.bounce(ready)();
                    }
                }
                else {
                    r.reject.apply(optionContext, []);
                }
            });
        }
        else {
            run.bounce(function () { r.reject.apply(optionContext, []); })();
        }

        return r;
    };

    exports.close = function () {
        modal.close();
    };

    exports.ready = function () {
        modal.impl.d.container.find(".loader").hide();
    };

    return exports;
});