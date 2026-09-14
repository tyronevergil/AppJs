define(['module', 'require', 'component', 'util', 'run', 'jquery'], function (module, require, component, util, run, $) {

    module.exports = $.extend({
        util: $.extend({}, util, {
            emitChangeEvent: function (element, event) {
                util.emitChangeEvent(element, event, function () {
                    $(element).triggerHandler("change");
                });
            },
            cleanElement: function (element) {
                var element = component.__unwrapElement(element);
                var attributes = Array.prototype.slice.call(element.attributes);
                if (attributes.length) {
                    for (var i = 0, attr; attr = attributes[i]; i++) {
                        if (attr.name && attr.name.indexOf(component.INITIALIZE_MARKER_ID) > -1) {
                            $(element).removeAttr(attr.name);
                        }
                    }
                }
            }
        }),
        onElementAttributeChange: function () {

            var ELEMENT_ATTR_VALUE = "__value";
            var ELEMENT_ATTR_CHANGE_EVENT_ID = "attrChangeEventId";
            var ELEMENT_PROP = "__elements";

            var d = $.Deferred();
            var elements = {}, observer;

            function getAttrValue(element, attribute) {
                return $(element).attr(attribute) || '';
            }

            function observeElement(element, attribute, elementId) {
                if (observer) {
                    observer.observe(element, {
                        attributes: true,
                        attributeFilter: [attribute]
                    });
                }
                else {
                    var elm = $(element);
                    if (!elm.attr(ELEMENT_ATTR_CHANGE_EVENT_ID)) {
                        elm.attr(ELEMENT_ATTR_CHANGE_EVENT_ID, elementId);
                    }
                }
            }

            function prepareElement(element, attribute, fn) {
                element = component.__unwrapElement(element);
                attribute = attribute.toLowerCase();

                var elementId = component.__markElement(element);
                elements[elementId] = elements[elementId] || {};
                elements[elementId][attribute] = elements[elementId][attribute] || [];

                elements[elementId][attribute].push(fn);
                if (!elements[elementId][attribute][ELEMENT_ATTR_VALUE]) {
                    elements[elementId][attribute][ELEMENT_ATTR_VALUE] = getAttrValue(element, attribute);
                }

                if (d.state() == "pending") {
                    d[ELEMENT_PROP] = d[ELEMENT_PROP] || [];
                    d[ELEMENT_PROP].push({ elementId: elementId, element: element, attribute: attribute });
                }
                else {
                    observeElement(element, attribute, elementId);
                }
            }

            var initObserver = run.once(function (tick) {

                d.done(function () {
                    var elements = Array.prototype.slice.call(d[ELEMENT_PROP]);
                    for (var i = 0, elm; elm = elements[i]; i++) {
                        observeElement(elm.element, elm.attribute, elm.elementId);
                    }
                });

                require([].concat(['mutationObserver'].slice(typeof MutationObserver !== 'undefined')), function () {
                    if (typeof MutationObserver === 'undefined' || (typeof MutationObserver !== 'undefined' && MutationObserver._isPolyfilled)) {
                        var j = setTimeout(function observeAttrChanges() {
                            for (var elementId in elements) {
                                var elm = $("[" + ELEMENT_ATTR_CHANGE_EVENT_ID + "='" + elementId + "']");
                                if (elm.length) {
                                    var attributes = elements[elementId];
                                    for (var attribute in attributes) {
                                        var element = component.__unwrapElement(elm);
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

                                var elementId = element[component.ELEMENT_ID];
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

                    d.resolve();
                });
            });

            return function (element, attribute, fn) {

                initObserver(100);
                prepareElement(element, attribute, fn);

            };

        }()
    }, component);

});