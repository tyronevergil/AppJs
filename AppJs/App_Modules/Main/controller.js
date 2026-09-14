define(['module', 'require', 'run', 'jquery'], function (module, require, run, $) {

    module.exports = function mainController(model, container, context, app, params) {
        if (!(this instanceof mainController))
            return new mainController(model, container, context, app, params);

        if (!context.eventEmitter) {
            var subscribers = {};
            var handler = function (type, params) {
                if (subscribers[type]) {
                    for (var fn, i = 0; fn = subscribers[type][i]; i++) {
                        if (typeof fn == "function") {
                            fn.apply(null, params);
                        }
                    }
                }
            };

            var sendMessage = [], globalEvents = ["data", "chat"];
            var globalEventInit = run.once(function () {
                require(["signalr"], function (r) {
                    var conn = r.hubConnection();
                    var commHub = conn.createHubProxy("commHub");
                    commHub.on("subscribeMessage", function (id, type, payloadString) {
                        var payload = JSON.parse(payloadString);
                        if (conn.id != id) {
                            handler(type, payload.params);
                        }
                    });
                    conn.start()
                        .done(function () {
                            var messageEntries = Array.prototype.slice.call(sendMessage);
                            sendMessage = function (type, params) {
                                commHub.invoke("publishMessage", conn.id, type, JSON.stringify({ params: params }));
                            };

                            for (var i = 0, entry; entry = messageEntries[i]; i++) {
                                sendMessage(entry.type, entry.params);
                            }
                        });
                });
            });

            context.eventEmitter = {
                add: function (type, callback) {
                    subscribers[type] = subscribers[type] || [];
                    subscribers[type].push(callback);
                    if (globalEvents.indexOf(type) > -1) {
                        globalEventInit();
                    }
                },
                fire: function (type) {
                    var params = Array.prototype.slice.call(arguments, 1);                    
                    if (globalEvents.indexOf(type) > -1) {
                        globalEventInit();
                        if (typeof sendMessage == "function") {
                            sendMessage(type, params);
                        }
                        else {
                            sendMessage.push({ type: type, params: params });
                        }
                    }
                    else {
                        handler(type, params);
                    }

                }
            };
        }

    };

});