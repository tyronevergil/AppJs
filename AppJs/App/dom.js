define(['exports', 'require', 'run'], function (exports, require, run) {

    var subscribers = [];
    var nodes = [];
    var notify = run.debounce(function () {
        for (var node, i = 0; node = nodes[i]; i++) {
            (function (node, i) {
                for (var subscriber, j = 0; subscriber = subscribers[j]; j++) {
                    subscriber(node);
                }
            })(node, i);
        }
        nodes = [];
    });

    function collector(n) {
        if (nodes.indexOf(n) == -1) {
            var b = false;
            for (var node, i = 0; node = nodes[i]; i++) {
                b = node.contains ? node.contains(n) : false;
                if (b)
                    break;
            }
            if (!b) {
                for (var node, i = 0; node = nodes[i]; i++) {
                    var r = n.contains ? n.contains(node) : false;
                    if (r) {
                        nodes.splice(i, 1);
                        i = 0;
                    }
                }

                nodes.push(n);
            }
        }
        notify();
    }

    exports.subscribe = function (subscriber) {
        subscribers.push(subscriber);
    };

    exports.attach = function (observer) {
        observer(collector);
    };

    // attached first aggregator
    exports.attach(function (collector) {
        require([].concat(['mutationObserver'].slice(typeof MutationObserver !== 'undefined')), function() {
            new MutationObserver(function (mutations) {
                //collector(document.body);
                mutations.forEach(function (mutation) {
                    var t = mutation.target;
                    var nodes = mutation.addedNodes;
                    if (nodes.length) {
                        collector(t);
                    }
                    else {
                        if (Array.prototype.some.call(mutation.removedNodes, function (n) { return n.nodeType == 1 || n.nodeType == 11; })) {
                            var p = t == document.body ? t : (t.parentNode || document.body);
                            collector(p);
                        }
                    }
                });
            }).observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    });

});