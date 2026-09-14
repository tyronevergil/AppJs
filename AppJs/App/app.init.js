function debugOut(msg) {
    if (typeof console !== 'undefined' && typeof console.log !== 'undefined') {
        console.log(msg);
    }
}

+function (app) {

    +function() {
        var d = [];

        app._get_deferred_ready_Commands = function () {
            app.ready = undefined;
            delete app._get_deferred_ready_Commands;

            return d;
        };
        app.ready = function (deps, fn) {
            if (typeof deps == "function") {
                fn = deps;
                deps = undefined;
            }

            d.push({ deps: deps, fn: fn });
        };
    }();

    +function () {
        var start = new Date().getTime();

        app.stopWatch = function (fn) {
            var current = new Date().getTime();
            if (start) {
                fn(current - start);
                start = undefined;
            }
        };

        app.setWatch = function () {
            if (!start)
                start = new Date().getTime();
        };
    }();

    +function () {
        app.params = function (querystring) {
            var params = {}, q = querystring.split('&');
            for (var i = 0, p; p = q[i]; i++) {
                var pair = p.split('=');
                params[decodeURIComponent(pair[0])] = pair[1] ? decodeURIComponent(pair[1]) : true;
            }
            return params;
        }(window.location.search.substring(1));

        if (app.params.widgets) {
            app.params.widgets = app.params.widgets.toLowerCase();
            if (app.params.widgets == "off") {
                document.documentElement.className = document.documentElement.className + " nowidgets";
            }
        }

        if (app.params.h) {
            app.params.h = app.params.h.toLowerCase();
            if (app.params.h == "off") {
                document.documentElement.className = document.documentElement.className + " noheader";
            }
        }
    }();

}(window['app'] || (window['app'] = {}));