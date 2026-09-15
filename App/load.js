define(['exports', 'wait', 'exec'], function (exports, wait, exec) {
    
    exports.load = function (name, req, onload, config) {
        if (config.isBuild) {
            onload();
        }
        else {
            var s = name.split("!");

            var files = s[s.length - 1];
            var configName = "";
            var cmd = "undefined";

            if (s.length > 1) {
                var opt = s[0];
                var cmdMarker = "ret=";
                var cmdIndex = opt.indexOf(cmdMarker);
                if (cmdIndex >= 0) {
                    cmd = opt.substr(cmdIndex + cmdMarker.length);
                }
                else {
                    configName = opt.split("?")[0];
                }
            }

            var waitOpt = config.config[configName] || {
                'while': function () { return false; },
                then: function () { return eval(cmd); }
            }

            var textPlugins = ("text!" + files.split(",").join(",text!")).split(",");

            (function (completed, error) {
                req(textPlugins, function () {
                    var args = Array.prototype.slice.call(arguments);
                    var script = args.join("  ");
                    wait(waitOpt['while'], function () {
                        try {
                            var def = window.define; window.define = undefined;
                            exec(script);
                            window.define = def;

                            completed(waitOpt.then());
                        }
                        catch (e) {
                            error(e);
                        }
                    }, function () {
                        error(new Error("Timeout loading " + name + "."));
                    });
                }, error);
            })(onload, onload.error);
        }
    };

});

define('exec', function () {
    return function (scriptText) {
        (window.execScript || function (scriptText) { window['eval'].call(window, scriptText) })(scriptText);
    };
});

define('wait', function () {
    var defaultTimeout = 7000;
    return function (whileCondition, waitAction, timeoutAction, timeout) {
        var d = new Date(), t = timeout || defaultTimeout;
        (function loop() {
            var r = ((new Date()) - d) <= t;
            if (whileCondition() && r) {
                setTimeout(loop, 100);
            }
            else {
                if (!r) {
                    timeoutAction();
                }
                else {
                    waitAction();
                }
            }
        })();
    };
});