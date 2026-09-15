require.config({
    //urlArgs: 'bust=' + (new Date()).getTime(),
    baseUrl: 'App',
    paths: {
        text: '../Scripts/text',
        es5: '../Scripts/ES5.min',
        json3: '../Scripts/json3.min',
        simplemodal: '../Scripts/jquery.simplemodal.1.4.3.min',
        moment: '../Scripts/moment.min',
        "Scripts": '../Scripts'
    },
    config: {
        text: { useXhr: function (url, protocol, hostname, port) { return true; } },
        jquery: (function (undefined) {
            var _old_jQuery = undefined;

            return {
                'while': function () {
                    if (window.jQuery && (typeof _old_jQuery === 'undefined')) {
                        _old_jQuery = window.jQuery.noConflict(true);
                        window.jQuery = window.$ = undefined;
                    }

                    return typeof window.jQuery !== 'undefined';
                },
                then: function (j) {
                    j = (j || window.jQuery).noConflict(true);

                    if (_old_jQuery) {
                        window.jQuery = window.$ = _old_jQuery;
                        _old_jQuery = undefined;
                    }

                    return j;
                }
            };
        })(),
        knockout: (function (undefined) {
            var _old_knockout = undefined;

            return {
                'while': function () {
                    if (window.ko && (typeof _old_knockout === 'undefined')) {
                        _old_knockout = window.ko;
                        window.ko = undefined;
                    }

                    return typeof window.ko !== 'undefined';
                },
                then: function (k) {
                    k = (k || window.ko);

                    if (_old_knockout) {
                        window.ko = _old_knockout;
                        _old_knockout = undefined;
                    }

                    return k;
                }
            };
        })()
    },
    map: {
        jquery: {
            jquery: 'load!jquery!../Scripts/jquery-1.10.2.min.js'
        },
        'jquery.modal': {
            jquery: 'load!jquery?modal!../Scripts/jquery-1.5.2.min.js'
        },
        bootstrap: {
            bootstrap: 'load!jquery!../Scripts/jquery-1.10.2.min.js,../Scripts/bootstrap.min.js,../Scripts/respond.min.js'
        },
        knockout: {
            knockout: 'load!knockout!../Scripts/knockout-3.3.0.js,../Scripts/knockout.mapping-latest.js'
        },
        'knockout.mapping': {
            'knockout.mapping': 'knockout'
        },        
        simplemodal: {
            jquery: 'load!jquery?modal!../Scripts/jquery-1.5.2.min.js'
        },
        mutationObserver: {
            mutationObserver: 'load!../Scripts/WeakMap.js,../Scripts/MutationObserver.js'
        }
    },
    waitSeconds: 180
});