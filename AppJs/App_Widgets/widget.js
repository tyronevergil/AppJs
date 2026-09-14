define(['exports', 'require', 'util', 'run', 'jquery'], function (exports, require, util, run, $) {

    var ELEMENT_ID = "__elementId";
    var RENDER_MARKER = "-render-id"

    function getNewGuid() {
        //* http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript *//
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    function unwrapElement(element) {
        element = element.get ? element.get(0) : element;
        return element;
    };

    function markElement(element) {
        element = unwrapElement(element);
        if (!element[ELEMENT_ID]) {
            element[ELEMENT_ID] = getNewGuid();
        }

        return element[ELEMENT_ID];
    }

    exports.util = $.extend({}, util, {
        emitChangeEvent: function (element, event) {
            util.emitChangeEvent(element, event, function () {
                $(element).triggerHandler("change");
            });
        },
        cleanElement: function (element) {
            var element = unwrapElement(element);
            var attributes = Array.prototype.slice.call(element.attributes);
            if (attributes.length) {
                for (var i = 0, attr; attr = attributes[i]; i++) {
                    if (attr.name && attr.name.indexOf(RENDER_MARKER) > -1) {
                        $(element).removeAttr(attr.name);
                    }
                }
            }
        }
    });

    exports.createFactory = function (targets, attribute, fn) {

        var renderMarker = attribute + '-render-id';
        var widgetMarker = '[' + attribute + ']';

        var notSelectorFilter = ':not([' + renderMarker + '])';
        var selectors = [].concat(targets).join(widgetMarker + notSelectorFilter + ', ') + widgetMarker + notSelectorFilter;

        return {
            render: function (container) {
                var r = $.Deferred(), elements = (container ? $(selectors, container) : $(selectors));
                if (elements.length) {
                    var deferreds = elements.map(function (i, element) {
                        var elm = $(element);
                        if (typeof elm.attr(renderMarker) === "undefined") {
                            var renderMarkerId = getNewGuid();
                            elm.attr(renderMarker, renderMarkerId);
                            return fn(element, renderMarker, renderMarkerId) || true;
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

            var elementId = markElement(element);
            elements[elementId] = elements[elementId] || [];
            elements[elementId].push(fn);

            /*
            +function (removed) {
                element.addEventListener("DOMNodeRemoved", removed, false);
                element.addEventListener("DOMNodeRemovedFromDocument", removed, false);
            }(fn);
            */
        };
    }();

    exports.onElementAttributeChange = function () {

        var elements = {}, observer;
        var ELEMENT_ATTR_VALUE = "__value";
        var ELEMENT_ATTR_CHANGE_EVENT_ID = "attrChangeEventId";

        function getAttrValue(element, attribute) {
            return $(element).attr(attribute) || '';
        }

        function prepareElements(element, attribute, fn) {
            element = unwrapElement(element);
            attribute = attribute.toLowerCase();

            var elementId = markElement(element);
            elements[elementId] = elements[elementId] || {};
            elements[elementId][attribute] = elements[elementId][attribute] || [];

            elements[elementId][attribute].push(fn);
            if (!elements[elementId][attribute][ELEMENT_ATTR_VALUE]) {
                elements[elementId][attribute][ELEMENT_ATTR_VALUE] = getAttrValue(element, attribute);
            }

            return elementId;
        }

        var initObserver = run.once(function (tick) {
            if (typeof MutationObserver === 'undefined' || (typeof MutationObserver !== 'undefined' && MutationObserver._isPolyfilled)) {
                var j = setTimeout(function observeAttrChanges() {
                    for (var elementId in elements) {
                        var elm = $("[" + ELEMENT_ATTR_CHANGE_EVENT_ID + "='" + elementId + "']");
                        if (elm.length) {
                            var attributes = elements[elementId];
                            for (var attribute in attributes) {
                                var element = unwrapElement(elm);
                                var previousValue = elements[elementId][attribute][ELEMENT_ATTR_VALUE];
                                var currentValue = getAttrValue(element, attribute);
                                if (previousValue != currentValue) {
                                    elements[elementId][attribute][ELEMENT_ATTR_VALUE] = currentValue;
                                    for (var fn, i = 0; fn = elements[elementId][attribute][i]; i++) {
                                        if (typeof fn == "function") {
                                            fn(element);
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            delete elements[elementId];
                        }
                    }

                    j = setTimeout(observeAttrChanges, tick);
                }, tick);
            }
            else {
                observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        var element = mutation.target;

                        var elementId = element[ELEMENT_ID];
                        var attribute = mutation.attributeName.toLowerCase();
                        if (elementId && attribute) {
                            var previousValue = elements[elementId][attribute][ELEMENT_ATTR_VALUE];
                            var currentValue = getAttrValue(element, attribute);
                            if (previousValue != currentValue) {
                                elements[elementId][attribute][ELEMENT_ATTR_VALUE] = currentValue;
                                for (var i = 0, fn; fn = elements[elementId][attribute][i]; i++) {
                                    if (typeof fn == "function") {
                                        fn(element);
                                    }
                                }
                            }
                        }
                    });
                });
            }
        });

        return function (element, attribute, fn) {

            initObserver(100);

            var elementId = prepareElements(element, attribute, fn);
            if (observer) {
                observer.observe(unwrapElement(element), {
                    attributes: true,
                    attributeFilter: [attribute.toLowerCase()]
                });
            }
            else {
                var elm = $(element);
                if (!elm.attr(ELEMENT_ATTR_CHANGE_EVENT_ID)) {
                    elm.attr(ELEMENT_ATTR_CHANGE_EVENT_ID, elementId);
                }
            }

        };

    }();

});
