define(['exports'], function (exports) {

    exports.once = function () {
        return function (action, timeout) {
            var r = false;
            return function () {
                var ctx = this, args = Array.prototype.slice.call(arguments);
                if (!r) {
                    r = true;

                    +function (fn) {
                        if (timeout) {
                            setTimeout(function () {
                                fn();
                            }, timeout);
                        }
                        else {
                            fn();
                        }
                    }(function () {
                        action.apply(ctx, args);
                    });
                }
            };
        };
    }();

    exports.bounce = function () {
        var defaultTimeout = 100;
        return function (action, timeout) {
            return function () {
                var ctx = this, args = Array.prototype.slice.call(arguments);
                setTimeout(function () {
                    action.apply(ctx, args);
                }, timeout || defaultTimeout);
            };
        };
    }();

    exports.debounce = function () {
        var defaultTimeout = 100;
        return function (action, timeout, immediate, edge) {
            if (typeof timeout === 'boolean') {
                if (typeof immediate === 'boolean') {
                    edge = immediate;
                }
                immediate = timeout;
                timeout = undefined;
            };

            if (typeof timeout === 'undefined') {
                timeout = defaultTimeout;
            }

            var t, ctx, args;
            return function () {
                ctx = this;
                if (!args || edge) {
                    args = Array.prototype.slice.call(arguments);
                }

                +function (fn) {
                    if (immediate && !t) {
                        fn();
                    }
                    clearTimeout(t);
                    t = setTimeout(function () {
                        t = null;
                        if (!immediate) {
                            fn();
                        }
                    }, timeout);
                }(function () {
                    action.apply(ctx, args);
                    args = undefined;
                });
            };
        };
    }();

});