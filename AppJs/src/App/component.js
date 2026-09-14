define(['exports', 'require', 'run', 'jquery'], function (exports, require, run, $) {

    var INITIALIZE_MARKER_ID = "-init-id";
    var ELEMENT_ID = exports.ELEMENT_ID = "__elementId";

    function getNewGuid() {
        //* http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript *//
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    
    exports.__unwrapElement = function unwrapElement(element) {
        element = element.get ? element.get(0) : element;
        return element;
    };

    exports.__markElement = function markElement(element) {
        element = unwrapElement(element);
        if (!element[ELEMENT_ID]) {
            element[ELEMENT_ID] = getNewGuid();
        }

        return element[ELEMENT_ID];
    };

    exports.createFactory = function (targets, attribute, fn) {

        var initializeMarker = attribute + INITIALIZE_MARKER_ID;
        var directiveMarker = '[' + attribute + ']';

        var notSelectorFilter = ':not([' + initializeMarker + '])';
        var selectors = [].concat(targets).join(directiveMarker + notSelectorFilter + ', ') + directiveMarker + notSelectorFilter;

        return {
            render: function (container) {
                var r = $.Deferred(), elements = (container ? $(selectors, container) : $(selectors));
                if (elements.length) {
                    var deferreds = elements.map(function (i, element) {
                        var elm = $(element);
                        if (typeof elm.attr(renderMarker) === "undefined") {
                            var initializeMarkerId = getNewGuid();
                            elm.attr(initializeMarker, initializeMarkerId);
                            return fn(element, initializeMarker, initializeMarkerId) || true;
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
        };
    };

    exports.onElementRemove = function () {

        function prepareElement(element, fn) {
            var elementId = markElement(element);
            elements[elementId] = elements[elementId] || [];
            elements[elementId].push(fn);
        }

        function traverseNodes(node, elementId) {
            if (node[ELEMENT_ID] == elementId) {
                return true;
            }
            else {
                var b = false;
                if (node.childNodes && node.childNodes.length) {
                    for (var i = 0, n; n = node.childNodes[i]; i++) {
                        b = traverseNodes(n, elementId);
                        if (b)
                            break;
                    }
                }

                return b;
            }
        }

        var elements = {};
        var initObserver = run.once(function () {
            require([].concat(['mutationObserver'].slice(typeof MutationObserver !== 'undefined')), function () {
                new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.removedNodes.length) {
                            for (var elementId in elements) {
                                if (Array.prototype.some.call(mutation.removedNodes, function (n) { return traverseNodes(n, elementId); })) {
                                    for (var i = 0, fn; fn = elements[elementId][i]; i++) {
                                        if (typeof fn == "function") {
                                            fn();
                                        }
                                    }

                                    delete elements[elementId];
                                }
                            }
                        }
                    });
                }).observe(document.body, { childList: true, subtree: true });
            });
        });

        return function (element, fn) {

            initObserver();
            prepareElement(element, fn);

            /*
            +function (removed) {
                element.addEventListener("DOMNodeRemoved", removed, false);
                element.addEventListener("DOMNodeRemovedFromDocument", removed, false);
            }(fn);
            */
        };
    }();

});
