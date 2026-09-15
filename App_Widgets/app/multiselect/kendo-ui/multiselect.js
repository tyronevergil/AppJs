define(['widget', 'run', 'require', 'jquery'], function (widget, run, require, $) {

    var attrMarker = "app-multiselect", init = run.once(function (kendo, $) {

        kendo.ui.plugin(kendo.ui.StaticList.extend({
            init: function (element, options) {
                var that = this;
                kendo.ui.StaticList.fn.init.call(that, element, options);
            },
            _click: function (e) {
                if (typeof this.options._captureEvent == 'function')
                    this.options._captureEvent(e);
                kendo.ui.StaticList.fn._click.apply(this, [e]);
            },
            _deselect: function (indices) {
                var r = kendo.ui.StaticList.fn._deselect.apply(this, [indices]);
                if (typeof this.options._refreshListView == 'function')
                    this.options._refreshListView();
                return r;
            },
            value: function (value) {
                var r = kendo.ui.StaticList.fn.value.apply(this, [value]);
                if (typeof this.options._refreshListView == 'function')
                    this.options._refreshListView();
                return r;
            },
            options: {
                name: 'App-StaticList'
            },
        }));

        kendo.ui.plugin(kendo.ui.VirtualList.extend({
            init: function (element, options) {
                var that = this;
                kendo.ui.VirtualList.fn.init.call(that, element, options);
            },
            _click: function (e) {
                if (typeof this.options._captureEvent == 'function')
                    this.options._captureEvent(e);
                kendo.ui.VirtualList.fn._click.apply(this, [e]);
            },
            _deselect: function(indices) {
                var r = kendo.ui.VirtualList.fn._deselect.apply(this, [indices]);
                if (typeof this.options._refreshListView == 'function')
                    this.options._refreshListView();
                return r;
            },
            value: function(value) {
                var r = kendo.ui.VirtualList.fn.value.apply(this, [value]);
                if (typeof this.options._refreshListView == 'function')
                    this.options._refreshListView();
                return r;
            },
            options: {
                name: 'App-VirtualList'
            },
        }));

        kendo.ui.plugin(kendo.ui.MultiSelect.extend({
            init: function (element, options) {
                var that = this;

                /* this will prevent from messing the original element when the kendoMultiSelect filter its data */
                var orig = that._originalElement = $(element);
                var s = orig.clone();
                s.removeAttr("id name " + attrMarker);
                widget.util.cleanElement(s);
                orig.after(s).hide();

                kendo.ui.MultiSelect.fn.init.call(that, s.get(0), options);
                $(element).data("kendo" + that.options.prefix + that.options.name, that);

                that.wrapper.addClass("app-multiselect");
                that.listView.element.parents(".k-list-container").addClass("app-multiselect");

                /* additional feature, add new entry when input value is not in the list*/
                if (options.allowNewItem) {

                    var caption = $('<span class="k-multiselect k-button" style="padding: .1em .4em .1em .4em;"></span>');
                    var newEntryView = $('<div class="k-list-container k-popup k-group k-reset app-multiselect" data-role="popup" style="position: relative; display: none;"></div>').append(caption);

                    var parent = that.wrapper.get(0);
                    var parentListView = that.listView.element.parents(".k-list-container").get(0);
                    var parentNewEntryView = newEntryView.get(0);

                    $("body").on("mousedown", function (e) {
                        if (newEntryView.is(":visible")) {
                            var target = e.target;
                            if (!($.contains(parent, target) || $.contains(parentListView, target) || $.contains(parentNewEntryView, target))) {
                                newEntryView.hide();
                                +function (value) {
                                    that.input.val(value);
                                    that._prev = value;
                                }("");
                            }
                        }
                    });

                    caption.currentValue = '';
                    caption.bind('click', function (e) {
                        var val = caption.currentValue;
                        if (val) {
                            var d = { text: val, value: val };
                            that.trigger("add", d);

                            var f = function () {
                                that.unbind("dataBound", f);
                                
                                caption.currentValue = '';

                                that._captureEvent(e);
                                that._originalElement.append($('<option>', { text: d.text, value: d.value }));

                                run.bounce(function () {    
                                    that._captureEvent(e);
                                    that.value(that.value().slice(0).concat(d.value));
                                }, 200)();
                            }

                            that.bind("dataBound", f);
                            that.dataSource.filter({});
                            that.dataSource.add({ text: d.text, value: d.value });
                        }
                    }).hover(function () { caption.addClass("k-state-hover"); }, function () { caption.removeClass("k-state-hover"); });

                    that._newEntryView = {
                        init: run.once(function (wrapper) {
                            $(that.popup.wrapper[0] || wrapper).append(newEntryView);
                        }),
                        show: function (word) {
                            caption.currentValue = word;
                            caption.html("<span><b>" + word + "</b> <span><span class=\"k-select\"><span class=\"k-icon\" style=\"background-position-x: -160px; background-position-y: -96px;\"></span></span>");

                            var isPopupOnTop = false;
                            var popUpWrapper = $(that.popup.wrapper[0]);

                            if (that.dataSource.view().length == 0) {
                                that.list.hide();

                                var popUpOptions = that.popup.options;
                                var origin = popUpOptions.origin.toLowerCase().split(" ");
                                var position = popUpOptions.position.toLowerCase().split(" ");
                                popUpWrapper.css(that.popup._align(origin, position));
                                popUpWrapper.css("height", newEntryView.height());
                            }
                            else {
                                that.list.show();

                                isPopupOnTop = that.wrapper.position().top > popUpWrapper.position().top;
                                if (isPopupOnTop) {
                                    popUpWrapper.css("top", parseInt(popUpWrapper.css("top")) - (newEntryView.height() + 6));
                                }
                                popUpWrapper.css("height", popUpWrapper.height() + newEntryView.height());
                            }

                            if (that.list.is(":visible")) {
                                newEntryView.css("top", parseInt(that.list.height()) + 4);
                            }
                            else {
                                newEntryView.css("top", 0);
                            }

                            newEntryView.addClass("k-state-border-up");
                            if (isPopupOnTop) {
                                newEntryView.css("border-radius", "0px 0px 0px 0px");
                            }
                            newEntryView.show();
                        },
                        hide: function () {
                            caption.currentValue = "";
                            
                            newEntryView.removeClass("k-state-border-up").css("border-radius", "");
                            newEntryView.hide()

                            if (that.popup.visible()) {
                                that.list.show();
                            }
                            else {
                                $(that.popup.wrapper[0]).css("height", "auto");
                            }
                        }
                    };
                }

                /* observe any changes to the original element and propagate the changes to our widget dataSource */
                +function (updateHandler) {

                    /* there are still issue with browser that not supports attribute changes via MutationObserver Polyfill */

                    that._originalElement.bind("change", updateHandler);

                    that.__observer = new MutationObserver(updateHandler);
                    that.__observer.observe(that._originalElement.get(0), {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ["selected"]
                    });

                }(function () {
                    var loader = $(".k-loading", that.wrapper);
                    var input = $(".k-input", that.wrapper);

                    var updateDataSource = run.debounce(function () {
                        var selected = [], data = $.map($("option", that._originalElement.get(0)), function (item) {
                            var opt = $(item);
                            if (opt.is(':selected')) {
                                selected.push(opt.val());
                            }
                            return { value: opt.val(), text: opt.text() };
                        });

                        +function (dataChanged) {
                            var current = that.dataSource.data();
                            if (current.length !== data.length) {
                                dataChanged(true);
                            }
                            else {
                                if (data.length) {
                                    +function (getValue) {
                                        if (current.map(getValue).sort().toString() !== data.map(getValue).sort().toString()) {
                                            dataChanged(true);
                                        }
                                        else {
                                            dataChanged(false);
                                        }
                                    }(function (item) {
                                        return typeof item.value == "number" ? item.value.toString() : item.value;
                                    });
                                }
                                else {
                                    dataChanged(false);
                                }
                            }
                        }(function (b) {
                            var f = function () {
                                that.unbind("dataBound", f);

                                if (Array.prototype.slice.call(that.value() || []).sort().toString() !== selected.sort().toString())
                                    that.value(selected);

                                run.bounce(function () {
                                    loader.addClass("k-loading-hidden");
                                    run.bounce(function () {
                                        input.css('visibility', 'visible');
                                    })();
                                })();
                            }

                            if (b) {
                                that.bind("dataBound", f)
                                that.dataSource.data(data);
                            }
                            else {
                                f();
                            }
                        });
                        
                    }, 200);

                    return function () {
                        if (that._hasCapturedEvent()) {
                            that._clearCapturedEvent();
                        }
                        else {
                            input.css('visibility', 'hidden');
                            loader.removeClass("k-loading-hidden");

                            updateDataSource();
                        }
                    };
                }());

            },
            _captureEvent: function (e) {
                this.__capturedEvent = e.originalEvent;
            },
            _hasCapturedEvent: function () {
                return this.__capturedEvent;
            },
            _clearCapturedEvent: function () {
                delete this.__capturedEvent;
            },
            _listOptions: function (options) {
                var that = this;
                options = kendo.ui.MultiSelect.fn._listOptions.apply(that, [options]);
                options._captureEvent = $.proxy(that._captureEvent, that);

                /* propagate the selection when the itemTemplate contains checkboxes */
                if ($('input[type="checkbox"]', $(that.options.itemTemplate)).length) {
                    options._refreshListView = run.debounce(function () {
                        $('input[type="checkbox"]', that.listView.element).prop('checked', false);
                        $('.k-state-selected input[type="checkbox"]', that.listView.element).prop('checked', true);
                    });
                }

                return options;
            },
            _initList: function () {
                var e = $, c = $.proxy;
                var t = this, n = t.options.virtual, r = !!n, o = c(t._listBound, t), a = { autoBind: !1, selectable: "multiple", dataSource: t.dataSource, click: c(t._click, t), change: c(t._listChange, t), activate: c(t._activateItem, t), deactivate: c(t._deactivateItem, t), dataBinding: function () { t.trigger("dataBinding"), t._angularItems("cleanup") }, dataBound: o, listBound: o, selectedItemChange: c(t._selectedItemChange, t) }; a = e.extend(t._listOptions(), a, "object" == typeof n ? n : {}), t._normalizeOptions(a), t.listView = r ? new kendo.ui["App-VirtualList"](t.ul, a) : new kendo.ui["App-StaticList"](t.ul, a), t.listView.bind("click", function (e) { e.preventDefault() }), t.listView.value(t._initialValues || t.options.value)
            },
            _tagListClick: function (e) {
                this._captureEvent(e);
                kendo.ui.MultiSelect.fn._tagListClick.apply(this, [e]);
            },
            _keydown: function (e) {
                var charCode = e.which;
                if (charCode == 40) {
                    var dataSource = this.dataSource;
                    if (!dataSource.view().length) {
                        e.preventDefault();
                        return;
                    }
                }
                this._captureEvent(e);
                kendo.ui.MultiSelect.fn._keydown.apply(this, [e]);
            },
            _inputFocusout: run.debounce(function (e) {
                kendo.ui.MultiSelect.fn._inputFocusout.apply(this, [e]);
                if (this._newEntryView)
                    this._newEntryView.hide();
            }, 200),
            _change: run.debounce(function () {
                kendo.ui.MultiSelect.fn._change.apply(this);

                var originalElement = this._originalElement;
                originalElement.val([].concat(this.value().slice(0)));
                var event = this._hasCapturedEvent();
                if (event) {
                    widget.util.emitChangeEvent(originalElement.get(0), event);
                }
                else {
                    //widget.util.emitChangeEvent(originalElement.get(0));
                }
            }),
            _listChange: function (e) {
                try {
                    kendo.ui.MultiSelect.fn._listChange.apply(this, [e]);
                }
                catch (ex) { }

                var maxSelectedItems = this.options.maxSelectedItems;
                var value = this._normalizeValues(this.value());
                if (maxSelectedItems !== null && value.length > maxSelectedItems) {
                    if (this._state == "filter")
                        this.dataSource.filter({});
                    this.value(value);
                }
            },
            _allowSelection: function() {
                return true;
            },
            search: function () {

                var showNe = run.debounce(function (word, ctx) {
                    +function() {
                        var f = this.dataSource.data().filter(function (item) { return item.text.toLowerCase() == word.toLowerCase() }).length;
                        if (!f) {
                            if (!this.popup.visible()) {
                                this.popup.open();
                            }

                            this._newEntryView.init(this.popup.wrapper[0]);
                            this._newEntryView.show(word);
                        }
                        else {
                            this._newEntryView.hide();
                        }
                    }.bind(ctx)();
                }, 200, false, true);

                return function (word) {
                    kendo.ui.MultiSelect.fn.search.apply(this, [word]);
                    if (word) {
                        if (this._newEntryView) {
                            showNe(word, this);
                        }
                    }
                    else {
                        if (this._newEntryView)
                            this._newEntryView.hide();
                    }
                };
            }(),
            destroy: function () {
                this.__observer.disconnect();
                kendo.ui.MultiSelect.fn.destroy.apply(this, []);
            },
            value: function (value) {
                /*function (e){var n=this,i=n.listView.value().slice(),r=n.options.maxSelectedItems;return e===t?i:(e=n._normalizeValues(e),null!==r&&e.length>r&&(e=e.slice(0,r)),n.listView.value(e),n._old=e,n._fetchData(),t)}*/
                var that = this;
                var oldValue = that.listView.value().slice();
                var maxSelectedItems = that.options.maxSelectedItems;

                if (value === undefined) {
                    return oldValue;
                }

                value = that._normalizeValues(value);

                if (maxSelectedItems !== null && value.length > maxSelectedItems) {
                    /* take the last part instead of the beginning part of the selected values */
                    var end = value.length;
                    var start = end - maxSelectedItems;
                    value = value.slice(start, end);
                }

                that.listView.value(value);

                that._change();
                that._old = value;

                that._fetchData();
            },
            options: {
                name: 'App-MultiSelect',
                dataTextField: "text",
                dataValueField: "value"
            },
            events: kendo.ui.MultiSelect.fn.events.concat('add')
        }));
    });

    return widget.createFactory(["select"], attrMarker, function (element) {
        var r = $.Deferred();
        require(['kendo-ui'].concat(['mutationObserver'].slice(typeof MutationObserver !== 'undefined')), function (ui) {

            init(kendo, ui);

            var select = $(element);
            var options = (typeof select.attr('multiple') === 'undefined') ? { maxSelectedItems: 1 } : {};
            options = $.extend(options, widget.util.evalInContext('({' + (select.attr(attrMarker) || '') + '})'));

            if (options.useCheckbox) {
                options.itemTemplate = '<span><input type="checkbox" value="${value}" /> ${text}</span>';
            }

            var dataSource, k = ui(element)["kendoApp-MultiSelect"]($.extend(options, {
                dataBound: run.once(function (e) {
                    dataSource = e.sender.dataSource;

                    debugOut("render multiselect!");
                    r.resolve();
                }, 100)
            }));

            widget.onElementRemove(element, function () {
                debugOut("remove multiselect!");
                k.data("kendoApp-MultiSelect").destroy();
            });

            widget.onElementAttributeChange(element, "disabled", function () {
                k.data("kendoApp-MultiSelect").enable(typeof k.attr("disabled") !== "undefined" ? false : true);
            });
        });

        return r;
    });
});